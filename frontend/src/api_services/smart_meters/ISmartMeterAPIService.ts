import type {
  ActivateSmartMeterDto,
  RegisterSmartMeterDto,
  UpdateSmartMeterDto,
} from "../../models/smart_meter/SmartMeterTypes";

export type ApiResponse<T> = { success: boolean; message: string; data?: T };

export interface ISmartMeterAPIService {
  register(dto: RegisterSmartMeterDto): Promise<ApiResponse<void>>;
  update(id: string, dto: UpdateSmartMeterDto): Promise<ApiResponse<void>>;
  activate(dto: ActivateSmartMeterDto): Promise<ApiResponse<void>>;
  delete(id: string): Promise<ApiResponse<void>>;
}
