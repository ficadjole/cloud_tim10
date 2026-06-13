import axios from "axios";
import client from "../axios/axiosClient";
import type {
  ApiResponse,
  ISmartMeterAPIService,
} from "./ISmartMeterAPIService";
import type {
  ActivateSmartMeterDto,
  RegisterSmartMeterDto,
} from "../../models/smart_meter/SmartMeterTypes";

const err = <T>(e: unknown, fallback: string): ApiResponse<T> => ({
  success: false,
  message: axios.isAxiosError(e)
    ? (e.response?.data as { message?: string })?.message ?? fallback
    : fallback,
});

const ok = <T>(message: string, data?: T): ApiResponse<T> => ({
  success: true,
  message,
  data,
});

export const smartMeterApi: ISmartMeterAPIService = {
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

  async activate(dto: ActivateSmartMeterDto) {
    const formData = new FormData();
    formData.append("SerialNumber", dto.serialNumber);
    formData.append("DeviceGuid", dto.deviceGuid);

    return client
      .post("/SmartMeter/activate", formData)
      .then(() => ok<void>("Smart meter activated successfully."))
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
