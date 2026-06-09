import axios from "axios";
import client from "../axios/axiosClient";
import type {
  ActivateSmartMeterDto,
  ApiResponse,
  ISmartMeterAPIService,
} from "./ISmartMeterAPIService";

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
