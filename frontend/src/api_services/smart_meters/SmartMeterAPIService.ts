import axios from "axios";
import client from "../axios/axiosClient";
import type {
  ApiResponse,
  ISmartMeterAPIService,
} from "./ISmartMeterAPIService";
import type {
  ActivateSmartMeterDto,
  ActivateSmartMeterResult,
  RegisterSmartMeterDto,
  SmartMeterDto,
  UpdateSmartMeterDto,
} from "../../models/smart_meter/SmartMeterTypes";

type ApiErrorBody = {
  message?: string;
  errors?: Record<string, string[]> | string;
};

const normalizeMeter = (raw: Record<string, unknown>): SmartMeterDto => ({
  id: String(raw.id ?? raw.Id ?? ""),
  serialNumber: (raw.serialNumber ?? raw.SerialNumber ?? null) as string | null,
  connectionType: (raw.connectionType ?? raw.ConnectionType ?? null) as string | number | null,
  status: (raw.status ?? raw.Status ?? null) as string | number | null,
  isActive: (raw.isActive ?? raw.IsActive ?? undefined) as boolean | undefined,
  maxPower: (raw.maxPower ?? raw.MaxPower ?? undefined) as number | undefined,
  note: (raw.note ?? raw.Note ?? null) as string | null,
  residentalObjectId: (raw.residentalObjectId ?? raw.ResidentalObjectId ?? null) as string | null,
});

const normalizeActivationResult = (raw: Record<string, unknown>): ActivateSmartMeterResult => ({
  accessToken: String(raw.accessToken ?? raw.AccessToken ?? ""),
  smartMeterId: String(raw.smartMeterId ?? raw.SmartMeterId ?? ""),
});

const getErrorMessage = (e: unknown, fallback: string) => {
  if (!axios.isAxiosError(e)) return fallback;

  const data = e.response?.data as ApiErrorBody | string | undefined;
  if (typeof data === "string") return data || fallback;

  if (data?.errors && typeof data.errors === "object") {
    const validationMessages = Object.values(data.errors).flat().filter(Boolean);
    if (validationMessages.length) return validationMessages.join(" ");
  }

  if (typeof data?.errors === "string" && data.errors.trim()) {
    return data.errors;
  }

  return data?.message ?? fallback;
};

const err = <T>(e: unknown, fallback: string): ApiResponse<T> => ({
  success: false,
  message: getErrorMessage(e, fallback),
});

const ok = <T>(message: string, data?: T): ApiResponse<T> => ({
  success: true,
  message,
  data,
});

export const smartMeterApi: ISmartMeterAPIService = {
  async getById(id: string) {
    return client
      .get<SmartMeterDto>(`/SmartMeter/${id}`)
      .then((response) => ok("Smart meter loaded successfully.", normalizeMeter(response.data as unknown as Record<string, unknown>)))
      .catch((e) => err(e, "Failed to load smart meter"));
  },

  async register(dto: RegisterSmartMeterDto) {
    const formData = new FormData();
    formData.append("SerialNumber", dto.serialNumber);
    formData.append("ConnectionType", dto.connectionType);
    formData.append("ObjectId", dto.objectId);

    if (dto.note?.trim()) {
      formData.append("Note", dto.note.trim());
    }

    return client
      .post("/SmartMeter/register", formData)
      .then(() => ok<void>("Smart meter registered successfully."))
      .catch((e) => err(e, "Failed to register smart meter"));
  },

  async update(id: string, dto: UpdateSmartMeterDto) {
    const formData = new FormData();
    formData.append("ConnectionType", dto.connectionType);

    if (dto.note?.trim()) {
      formData.append("Note", dto.note.trim());
    }

    if (dto.limitValue !== undefined) {
      formData.append("LimitValue", String(dto.limitValue));
    }

    if (dto.limitType !== undefined) {
      formData.append("LimitType", String(dto.limitType));
    }

    return client
      .put(`/SmartMeter/${id}`, formData)
      .then(() => ok<void>("Smart meter updated successfully."))
      .catch((e) => err(e, "Failed to update smart meter"));
  },

  async activate(dto: ActivateSmartMeterDto) {
    const formData = new FormData();
    formData.append("SerialNumber", dto.serialNumber);
    formData.append("DeviceGuid", dto.deviceGuid);

    return client
      .post("/SmartMeter/activate", formData)
      .then((response) =>
        ok(
          "Smart meter activated successfully.",
          normalizeActivationResult(response.data as Record<string, unknown>)
        )
      )
      .catch((e) => err(e, "Failed to activate smart meter"));
  },

  async delete(id: string) {
    const formData = new FormData();
    formData.append("Id", id);

    return client
      .delete("/SmartMeter", { data: formData })
      .then(() => ok<void>("Smart meter deleted successfully."))
      .catch((e) => err(e, "Failed to delete smart meter"));
  },
};
