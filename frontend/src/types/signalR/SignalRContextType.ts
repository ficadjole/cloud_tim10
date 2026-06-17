import type * as signalR from "@microsoft/signalr";
import type { DeviceAlert } from "./DeviceAlert";

export interface SignalRContextType {
    connection: signalR.HubConnection | null;
    isConnected: boolean;
    alerts: DeviceAlert[];
    clearAlerts: () => void;
}