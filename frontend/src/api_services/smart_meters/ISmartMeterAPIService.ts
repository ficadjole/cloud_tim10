import type {
  ActivateSmartMeterDto,
  ActivateSmartMeterResult,
  RegisterSmartMeterDto,
  SmartMeterDto,
  UpdateSmartMeterDto,
} from "../../models/smart_meter/SmartMeterTypes";

export type ApiResponse<T> = { success: boolean; message: string; data?: T };

export interface ISmartMeterAPIService {
  getById(id: string): Promise<ApiResponse<SmartMeterDto>>;
  register(dto: RegisterSmartMeterDto): Promise<ApiResponse<void>>;
  update(id: string, dto: UpdateSmartMeterDto): Promise<ApiResponse<void>>;
  activate(dto: ActivateSmartMeterDto): Promise<ApiResponse<ActivateSmartMeterResult>>;
  delete(id: string): Promise<ApiResponse<void>>;
}
