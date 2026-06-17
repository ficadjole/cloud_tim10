import client from "../axios/axiosClient";
import axios from "axios";
import type { DeviceDto, DeviceStatusDto, SmartMeterDto } from "../../types/device/DeviceTypes";
import type { IDeviceAPIService } from "./IDeviceAPIService";
import type { ApiResponse } from "../users/IUsersAPIService";
import type { DeviceAlert } from "../../types/signalR/DeviceAlert";


const err = <T>(e: unknown, fallback: string): ApiResponse<T> => ({
  success: false,
  message: axios.isAxiosError(e)
    ? (e.response?.data as { message?: string })?.message ?? fallback
    : fallback,
});

export const deviceApi: IDeviceAPIService = {
  async getDevices() {
  return client
    .get<DeviceDto[]>("/Devices")
    .then((r) => ({ success: true as const, data: r.data, message: "" }))
    .catch((e) => err<DeviceDto[]>(e, "Failed to load devices"));
},
async getDeviceStatuses() {
  return client
    .get<DeviceStatusDto[]>("/DeviceStatuses")
    .then((r) => ({ success: true as const, data: r.data, message: "" }))
    .catch((e) => err<DeviceStatusDto[]>(e, "Failed to load device statuses"));
},
async getSmartMeters() {
  return client
    .get<SmartMeterDto[]>("/SmartMeter")
    .then((r) => ({ success: true as const, data: r.data, message: "" }))
    .catch((e) => err<SmartMeterDto[]>(e, "Failed to load smart meters"));
},
async getRecentAlerts(count = 20) {
  return client
    .get<DeviceAlert[]>(`/Notifications?count=${count}`)
    .then((r) => ({ success: true as const, data: r.data, message: "" }))
    .catch((e) => err<DeviceAlert[]>(e, "Failed to load alerts"));
},
};