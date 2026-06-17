export interface DeviceAlert {
    deviceId: string;
    alertType: "Info" | "Warning" | "Critical";
    message: string;
    timestamp: string;
}