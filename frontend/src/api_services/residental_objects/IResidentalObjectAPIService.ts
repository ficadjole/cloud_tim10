import type {
  CreateResidentalObjectDto,
  ResidentalObjectDto,
  UpdateResidentalObjectDto,
} from "../../models/residental_object/ResidentalObjectTypes";

export type ApiResponse<T> = { success: boolean; message: string; data?: T };

export interface IResidentalObjectAPIService {
  getMyObjects(): Promise<ApiResponse<ResidentalObjectDto[]>>;
  create(dto: CreateResidentalObjectDto): Promise<ApiResponse<string>>;
  update(id: string, dto: UpdateResidentalObjectDto): Promise<ApiResponse<void>>;
  delete(id: string): Promise<ApiResponse<void>>;
}
