import type { ManualLogDto } from "../../types/manualLog/ManualLogTypes";
import type { ApiResponse } from "../users/IUsersAPIService";

export interface IManualLogAPIService {
  getAll(): Promise<ApiResponse<ManualLogDto[]>>;
  approve(id: string): Promise<ApiResponse<void>>;
  reject(id: string): Promise<ApiResponse<void>>;
}