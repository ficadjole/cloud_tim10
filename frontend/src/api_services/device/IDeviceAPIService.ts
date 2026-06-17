import type { DeviceDto, DeviceStatusDto, SmartMeterDto } from "../../types/device/DeviceTypes";
import type { DeviceAlert } from "../../types/signalR/DeviceAlert";
import type { ApiResponse } from "../users/IUsersAPIService";

export interface IDeviceAPIService {
  getDevices(): Promise<ApiResponse<DeviceDto[]>>;
  getDeviceStatuses(): Promise<ApiResponse<DeviceStatusDto[]>>;
  getSmartMeters(): Promise<ApiResponse<SmartMeterDto[]>>;
  getRecentAlerts(count: number): Promise<ApiResponse<DeviceAlert[]>>;
}