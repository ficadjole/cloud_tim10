import type { TariffDto } from "../../types/tariff/TarifTypes";
import type { ApiResponse } from "../users/IUsersAPIService";

export interface ITariffAPIService {
  get(): Promise<ApiResponse<TariffDto>>;
  update(dto: TariffDto): Promise<ApiResponse<void>>;
}