import axios from "axios";
import client from "../axios/axiosClient";
import type { ApiResponse } from "../users/IUsersAPIService";
import type { ManualLogDto } from "../../types/manualLog/ManualLogTypes";
import type { CreateManualLogDto, IManualLogAPIService } from "./IManualLogAPIService";

const getErrorMessage = (e: unknown, fallback: string) => {
  if (!axios.isAxiosError(e)) return fallback;

  const data = e.response?.data as { message?: string; errors?: string | Record<string, string[]> } | string | undefined;
  if (typeof data === "string") return data || fallback;
  if (typeof data?.errors === "string") return data.errors;
  if (data?.errors && typeof data.errors === "object") {
    const messages = Object.values(data.errors).flat().filter(Boolean);
    if (messages.length) return messages.join(" ");
  }

  return data?.message ?? fallback;
};

const err = <T>(e: unknown, fallback: string): ApiResponse<T> => ({
  success: false,
  message: getErrorMessage(e, fallback),
});

export const manualLogApi: IManualLogAPIService = {
  async create(dto: CreateManualLogDto): Promise<ApiResponse<void>> {
    const formData = new FormData();
    formData.append("SmartMeterId", dto.smartMeterId);
    formData.append("HighTariffValue", String(dto.highTariffValue));
    formData.append("LowTariffValue", String(dto.lowTariffValue));
    formData.append("ManualLogImage", dto.image);

    return client
      .post("/ManualLogs", formData)
      .then(() => ({
        success: true as const,
        message: "Manual reading submitted successfully.",
      }))
      .catch((e) => err<void>(e, "Failed to submit manual reading"));
  },

  async getAll(): Promise<ApiResponse<ManualLogDto[]>> {
    return client
      .get<ManualLogDto[]>("/ManualLogs")
      .then((r) => ({
        success: true as const,
        data: r.data,
        message: "",
      }))
      .catch((e) => err<ManualLogDto[]>(e, "Failed to load manual logs"));
  },

  async getByMeter(smartMeterId: string): Promise<ApiResponse<ManualLogDto[]>> {
    return client
      .get<ManualLogDto[]>(`/ManualLogs/meter/${smartMeterId}`)
      .then((r) => ({
        success: true as const,
        data: r.data,
        message: "",
      }))
      .catch((e) => err<ManualLogDto[]>(e, "Failed to load manual logs"));
  },

  async approve(id: string): Promise<ApiResponse<void>> {
    return client
      .put(`/ManualLogs/${id}/approve`)
      .then(() => ({
        success: true as const,
        message: "Manual log approved successfully.",
      }))
      .catch((e) => err<void>(e, "Failed to approve manual log"));
  },

  async reject(id: string): Promise<ApiResponse<void>> {
    return client
      .put(`/ManualLogs/${id}/reject`)
      .then(() => ({
        success: true as const,
        message: "Manual log rejected successfully.",
      }))
      .catch((e) => err<void>(e, "Failed to reject manual log"));
  },
};
