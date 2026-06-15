import axios from "axios";
import client from "../axios/axiosClient";
import type { IResidentalObjectAPIService, ApiResponse } from "./IResidentalObjectAPIService";
import type {
  CreateResidentalObjectDto,
  ResidentalObjectDto,
  UpdateResidentalObjectDto,
} from "../../models/residental_object/ResidentalObjectTypes";
import type { SmartMeterDto } from "../../models/smart_meter/SmartMeterTypes";

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

const normalizeMeters = (raw: Record<string, unknown>): SmartMeterDto[] => {
  const meters = raw.smartMeters ?? raw.SmartMeters ?? raw.connectedMeters ?? raw.ConnectedMeters;

  if (Array.isArray(meters)) {
    return meters.map((meter) => normalizeMeter(meter as Record<string, unknown>));
  }

  const singleMeter = raw.connectedMeter ?? raw.ConnectedMeter;
  if (singleMeter && typeof singleMeter === "object") {
    return [normalizeMeter(singleMeter as Record<string, unknown>)];
  }

  const connectedMeterId = raw.connectedMeterId ?? raw.ConnectedMeterId;
  if (connectedMeterId) {
    return [{ id: String(connectedMeterId) }];
  }

  return [];
};

const normalizeMeterIds = (raw: Record<string, unknown>, smartMeters: SmartMeterDto[]) => {
  const meterIds = raw.connectedMeterIds ?? raw.ConnectedMeterIds;

  if (Array.isArray(meterIds)) {
    return meterIds.map((meterId) => String(meterId)).filter(Boolean);
  }

  const connectedMeterId = raw.connectedMeterId ?? raw.ConnectedMeterId;
  if (connectedMeterId) return [String(connectedMeterId)];

  return smartMeters.map((meter) => meter.id).filter(Boolean);
};

const normalizeObject = (raw: Record<string, unknown>): ResidentalObjectDto => {
  const smartMeters = normalizeMeters(raw);
  const connectedMeterIds = normalizeMeterIds(raw, smartMeters);

  return {
    id: String(raw.id ?? raw.Id ?? ""),
    name: String(raw.name ?? raw.Name ?? ""),
    type: (raw.type ?? raw.Type ?? "") as string | number,
    fullAddress: String(raw.fullAddress ?? raw.FullAddress ?? ""),
    description: (raw.description ?? raw.Description ?? null) as string | null,
    connectedMeterId: connectedMeterIds[0] ?? null,
    connectedMeterIds,
    smartMeters: smartMeters.length
      ? smartMeters
      : connectedMeterIds.map((meterId) => ({ id: meterId })),
  };
};

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

const toCreateFormData = (dto: CreateResidentalObjectDto) => {
  const formData = new FormData();

  formData.append("Name", dto.name);
  formData.append("Type", dto.type);
  formData.append("Street", dto.street);
  formData.append("Number", dto.number);
  formData.append("City", dto.city);

  if (dto.description?.trim()) {
    formData.append("Description", dto.description);
  }

  return formData;
};

const toUpdateFormData = (dto: UpdateResidentalObjectDto) => toCreateFormData(dto);

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

  async create(dto) {
    return client
      .post<string | { data?: string }>("/ResidentalObject", toCreateFormData(dto))
      .then((response) => ({
        success: true,
        message: "Consumer object created successfully.",
        data: unwrap(response.data),
      }))
      .catch((e) => err(e, "Failed to create consumer object"));
  },

  async update(id, dto) {
    return client
      .put(`/ResidentalObject/${id}`, toUpdateFormData(dto))
      .then(() => ({
        success: true,
        message: "Consumer object updated successfully.",
      }))
      .catch((e) => err(e, "Failed to update consumer object"));
  },

  async delete(id) {
    return client
      .delete(`/ResidentalObject/${id}`)
      .then(() => ({
        success: true,
        message: "Consumer object deleted successfully.",
      }))
      .catch((e) => err(e, "Failed to delete consumer object"));
  },
};
