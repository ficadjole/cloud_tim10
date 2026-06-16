import client from "../axios/axiosClient";
import axios from "axios";
import type { TariffDto } from "../../types/tariff/TarifTypes";
import type { ITariffAPIService } from "./ITariffAPIService";
import type { ApiResponse } from "../users/IUsersAPIService";

const err = <T>(e: unknown, fallback: string): ApiResponse<T> => ({
  success: false,
  message: axios.isAxiosError(e)
    ? (e.response?.data as { message?: string })?.message ?? fallback
    : fallback,
});

export const tariffApi: ITariffAPIService = {
  async get() {
    return client.get<ApiResponse<TariffDto>>("/Tariff")
      .then((r) => r.data)
      .catch((e) => err(e, "Failed to load tariff"));
  },
  async update(dto) {
    const form = new FormData();
    Object.entries(dto).forEach(([key, value]) => form.append(key, String(value)));

    return client.put<ApiResponse<void>>("/Tariff", form)
      .then((r) => r.data)
      .catch((e) => err(e, "Failed to update tariff"));
  },
};