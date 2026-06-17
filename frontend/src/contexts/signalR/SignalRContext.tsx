import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import * as signalR from "@microsoft/signalr";
import type { SignalRContextType } from "../../types/signalR/SignalRContextType";
import type { DeviceAlert } from "../../types/signalR/DeviceAlert";
import { useAuth } from "../../hooks/auth/useAuthHook";

const SignalRContext = createContext<SignalRContextType>({
    connection: null,
    isConnected: false,
    alerts: [],
    clearAlerts: () => {}
});

const HUB_URL = "https://localhost:7262/device-status-hub";

export const SignalRProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { token, user } = useAuth();
    const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [alerts, setAlerts] = useState<DeviceAlert[]>([]);
    const isConnecting = useRef(false);

    useEffect(() => {
        if (!token || isConnecting.current) return;
        isConnecting.current = true;

        const conn = new signalR.HubConnectionBuilder()
            .withUrl(HUB_URL, { accessTokenFactory: () => token })
            .withAutomaticReconnect()
            .build();

        conn.onreconnecting(() => setIsConnected(false));
        conn.onreconnected(() => setIsConnected(true));
        conn.onclose(() => setIsConnected(false));

        // Listener za alertove
        conn.on("ReceiveAlert", (alert: DeviceAlert) => {
            console.info("New alert received:", alert);
            setAlerts(prev => [alert, ...prev]);
        });

        const startConnection = async () => {
            try {
                await conn.start();
                console.info("SignalR connected.");
                setConnection(conn);
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
            setIsConnected(false);
            void conn.stop();
        };
    }, [token, user?.role]);

    const clearAlerts = () => setAlerts([]);

    return (
        <SignalRContext.Provider value={{ connection, isConnected, alerts, clearAlerts }}>
            {children}
        </SignalRContext.Provider>
    );
};

export const useSignalR = () => useContext(SignalRContext);