import client from "../axios/axiosClient";
import axios from "axios";
import type { TariffDto, GetTariffResponse } from "../../types/tariff/TarifTypes";
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
    return client
      .get<GetTariffResponse>("/Tariff")
      .then((r) => ({
        success: true as const,
        data: {
          GHT: r.data.green_HT,
          GLT: r.data.green_LT,
          BHT: r.data.blue_HT,
          BLT: r.data.blue_LT,
          RHT: r.data.red_HT,
          RLT: r.data.red_LT,
          BillingPowerPrice: r.data.billingPowerPrice,
          SupplierCost: r.data.supplierCost,
          success: true,
        } as TariffDto,
        message: "",
      }))
      .catch((e) => err<TariffDto>(e, "Failed to load tariff"));
  },
  async update(dto) {
    const form = new FormData();
    Object.entries(dto).forEach(([key, value]) => form.append(key, String(value)));

    return client.put<ApiResponse<void>>("/Tariff", form)
      .then((r) => r.data)
      .catch((e) => err(e, "Failed to update tariff"));
  },
};