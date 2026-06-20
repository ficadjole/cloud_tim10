import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import * as signalR from "@microsoft/signalr";
import type { SignalRContextType } from "../../types/signalR/SignalRContextType";
import type { DeviceAlert } from "../../types/signalR/DeviceAlert";
import { useAuth } from "../../hooks/auth/useAuthHook";
import type { DeviceStatusDto } from "../../models/smart_meter/SmartMeterTypes";

const SignalRContext = createContext<SignalRContextType>({
    connection: null,
    isConnected: false,
    alerts: [],
    deviceStatuses: [],
    joinObjectGroup: async () => {},
    leaveObjectGroup: async () => {},
    joinMeterGroup: async () => {},
    leaveMeterGroup: async () => {},
    clearAlerts: () => {}
});

const HUB_URL = "https://localhost:7262/device-status-hub";
const objectGroupPrefix = "object:";
const meterGroupPrefix = "meter:";

const normalizeDeviceStatus = (raw: unknown): DeviceStatusDto | null => {
    if (!raw || typeof raw !== "object") return null;

    const item = raw as Record<string, unknown>;
    const deviceId = String(item.deviceId ?? item.DeviceId ?? item.smartMeterId ?? item.SmartMeterId ?? "");
    if (!deviceId) return null;

    return {
        deviceId,
        deviceType: (item.deviceType ?? item.DeviceType ?? null) as string | number | null,
        currentLoadKW: (item.currentLoadKW ?? item.CurrentLoadKW ?? null) as number | null,
        lastHeartbeat: (item.lastHeartbeat ?? item.LastHeartbeat ?? item.timestamp ?? item.Timestamp ?? null) as string | null,
        voltageL1: (item.voltageL1 ?? item.VoltageL1 ?? null) as number | null,
        voltageL2: (item.voltageL2 ?? item.VoltageL2 ?? null) as number | null,
        voltageL3: (item.voltageL3 ?? item.VoltageL3 ?? null) as number | null,
    };
};

const upsertDeviceStatus = (items: DeviceStatusDto[], status: DeviceStatusDto) => {
    const next = new Map(items.map((item) => [item.deviceId, item]));
    next.set(status.deviceId, status);
    return Array.from(next.values());
};

export const SignalRProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { token, user } = useAuth();
    const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [alerts, setAlerts] = useState<DeviceAlert[]>([]);
    const [deviceStatuses, setDeviceStatuses] = useState<DeviceStatusDto[]>([]);
    const isConnecting = useRef(false);
    const connectionRef = useRef<signalR.HubConnection | null>(null);
    const activeGroupsRef = useRef<Set<string>>(new Set());

    const invokeIfConnected = async (methodName: string, ...args: string[]) => {
        const conn = connectionRef.current;
        if (!conn || conn.state !== signalR.HubConnectionState.Connected) return;

        try {
            await conn.invoke(methodName, ...args);
        } catch (err) {
            console.debug(`SignalR method ${methodName} is not available yet.`, err);
        }
    };

    const rejoinActiveGroups = async (conn: signalR.HubConnection) => {
        for (const group of activeGroupsRef.current) {
            if (group.startsWith(objectGroupPrefix)) {
                await invokeIfConnected("JoinObjectGroup", group.slice(objectGroupPrefix.length));
            }

            if (group.startsWith(meterGroupPrefix)) {
                await invokeIfConnected("JoinMeterGroup", group.slice(meterGroupPrefix.length));
            }
        }

        if (user?.role === "PaymentAdmin") {
            await conn.invoke("JoinAdminGroup");
        }
    };

    useEffect(() => {
        if (!token || isConnecting.current) return;
        isConnecting.current = true;

        const conn = new signalR.HubConnectionBuilder()
            .withUrl(HUB_URL, { accessTokenFactory: () => token })
            .withAutomaticReconnect()
            .build();

        conn.onreconnecting(() => setIsConnected(false));
        conn.onreconnected(() => {
            setIsConnected(true);
            connectionRef.current = conn;
            void rejoinActiveGroups(conn);
        });
        conn.onclose(() => setIsConnected(false));

        // Listener za alertove
        conn.on("ReceiveAlert", (alert: DeviceAlert) => {
            console.info("New alert received:", alert);
            setAlerts(prev => [alert, ...prev]);
        });

        const receiveStatus = (payload: unknown) => {
            const status = normalizeDeviceStatus(payload);
            if (!status) return;

            setDeviceStatuses((prev) => upsertDeviceStatus(prev, status));
        };

        conn.on("ReceiveDeviceStatus", receiveStatus);
        conn.on("ReceiveStatusUpdate", receiveStatus);
        conn.on("ReceiveTelemetry", receiveStatus);

        const startConnection = async () => {
            try {
                await conn.start();
                console.info("SignalR connected.");
                setConnection(conn);
                connectionRef.current = conn;
                setIsConnected(true);

                if (user?.role === "PaymentAdmin") {
                    await conn.invoke("JoinAdminGroup");
                }
            } catch (err) {
                console.error("SignalR connection error:", err);
                setIsConnected(false);
            } finally {
                isConnecting.current = false;
            }
        };

        void startConnection();

        return () => {
            isConnecting.current = false;
            setConnection(null);
            connectionRef.current = null;
            setIsConnected(false);
            void conn.stop();
        };
    }, [token, user?.role]);

    const joinObjectGroup = async (objectId: string) => {
        if (!objectId) return;

        activeGroupsRef.current.add(`${objectGroupPrefix}${objectId}`);
        await invokeIfConnected("JoinObjectGroup", objectId);
    };

    const leaveObjectGroup = async (objectId: string) => {
        if (!objectId) return;

        activeGroupsRef.current.delete(`${objectGroupPrefix}${objectId}`);
        await invokeIfConnected("LeaveObjectGroup", objectId);
    };

    const joinMeterGroup = async (meterId: string) => {
        if (!meterId) return;

        activeGroupsRef.current.add(`${meterGroupPrefix}${meterId}`);
        await invokeIfConnected("JoinMeterGroup", meterId);
    };

    const leaveMeterGroup = async (meterId: string) => {
        if (!meterId) return;

        activeGroupsRef.current.delete(`${meterGroupPrefix}${meterId}`);
        await invokeIfConnected("LeaveMeterGroup", meterId);
    };

    const clearAlerts = () => setAlerts([]);

    return (
        <SignalRContext.Provider value={{
            connection,
            isConnected,
            alerts,
            deviceStatuses,
            joinObjectGroup,
            leaveObjectGroup,
            joinMeterGroup,
            leaveMeterGroup,
            clearAlerts
        }}>
            {children}
        </SignalRContext.Provider>
    );
};

export const useSignalR = () => useContext(SignalRContext);
