import axios from "axios";
import client from "../axios/axiosClient";
import type { IResidentalObjectAPIService, ApiResponse } from "./IResidentalObjectAPIService";
import type { ResidentalObjectDto } from "../../models/residental_object/ResidentalObjectTypes";

const normalizeObject = (raw: Record<string, unknown>): ResidentalObjectDto => ({
  id: String(raw.id ?? raw.Id ?? ""),
  name: String(raw.name ?? raw.Name ?? ""),
  type: (raw.type ?? raw.Type ?? "") as string | number,
  fullAddress: String(raw.fullAddress ?? raw.FullAddress ?? ""),
  description: (raw.description ?? raw.Description ?? null) as string | null,
  connectedMeterId: (raw.connectedMeterId ?? raw.ConnectedMeterId ?? null) as string | null,
});

const unwrap = <T>(payload: T | { data?: T }): T => {
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as { data?: T }).data as T;
  }

  return payload as T;
};

const err = <T>(e: unknown, fallback: string): ApiResponse<T> => ({
  success: false,
  message: axios.isAxiosError(e)
    ? (e.response?.data as { message?: string })?.message ?? fallback
    : fallback,
});

export const residentalObjectApi: IResidentalObjectAPIService = {
  async getMyObjects() {
    return client
      .get<ResidentalObjectDto[] | { data?: ResidentalObjectDto[] }>("/ResidentalObject/my-objects")
      .then((response) => {
        const payload = unwrap(response.data);
        const items = Array.isArray(payload) ? payload : [];

        return {
          success: true,
          message: "Objects loaded successfully.",
          data: items.map((item) => normalizeObject(item as unknown as Record<string, unknown>)),
        };
      })
      .catch((e) => err(e, "Failed to load consumer objects"));
  },
};
