import type { DeviceDto, DeviceStatusDto } from "../../types/device/DeviceTypes";
import type { ApiResponse } from "../users/IUsersAPIService";

export interface IDeviceAPIService {
  getDevices(): Promise<ApiResponse<DeviceDto[]>>;
  getDeviceStatuses(): Promise<ApiResponse<DeviceStatusDto[]>>;
}