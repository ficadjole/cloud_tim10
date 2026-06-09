import type { ResidentalObjectDto } from "../../models/residental_object/ResidentalObjectTypes";

export type ApiResponse<T> = { success: boolean; message: string; data?: T };

export interface IResidentalObjectAPIService {
  getMyObjects(): Promise<ApiResponse<ResidentalObjectDto[]>>;
}
