export type ApiResponse<T> = { success: boolean; message: string; data?: T };

export interface ActivateSmartMeterDto {
  serialNumber: string;
  deviceGuid: string;
}

export interface ISmartMeterAPIService {
  activate(dto: ActivateSmartMeterDto): Promise<ApiResponse<void>>;
  delete(id: string): Promise<ApiResponse<void>>;
}
