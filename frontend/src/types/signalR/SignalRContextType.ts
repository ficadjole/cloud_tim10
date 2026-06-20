import type * as signalR from "@microsoft/signalr";
import type { DeviceAlert } from "./DeviceAlert";
import type { DeviceStatusDto } from "../../models/smart_meter/SmartMeterTypes";

export interface SignalRContextType {
    connection: signalR.HubConnection | null;
    isConnected: boolean;
    alerts: DeviceAlert[];
    deviceStatuses: DeviceStatusDto[];
    joinObjectGroup: (objectId: string) => Promise<void>;
    leaveObjectGroup: (objectId: string) => Promise<void>;
    joinMeterGroup: (meterId: string) => Promise<void>;
    leaveMeterGroup: (meterId: string) => Promise<void>;
    clearAlerts: () => void;
}
