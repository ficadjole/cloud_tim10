import type { ManualLogDto } from "../../types/manualLog/ManualLogTypes";
import type { ApiResponse } from "../users/IUsersAPIService";

export type CreateManualLogDto = {
  smartMeterId: string;
  highTariffValue: number;
  lowTariffValue: number;
  image: File;
};

export interface IManualLogAPIService {
  create(dto: CreateManualLogDto): Promise<ApiResponse<void>>;
  getAll(): Promise<ApiResponse<ManualLogDto[]>>;
  getByMeter(smartMeterId: string): Promise<ApiResponse<ManualLogDto[]>>;
  approve(id: string): Promise<ApiResponse<void>>;
  reject(id: string): Promise<ApiResponse<void>>;
}
