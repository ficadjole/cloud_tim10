import type { PagedBillResult } from "../../models/bill/BillTypes";
import type { ApiResponse } from "../smart_meters/ISmartMeterAPIService";

export interface IBillAPIService {
  getByOwner(ownerId: string, pageNumber?: number, pageSize?: number): Promise<ApiResponse<PagedBillResult>>;
  getByMeter(smartMeterId: string, pageNumber?: number, pageSize?: number): Promise<ApiResponse<PagedBillResult>>;
  downloadPdf(billId: string): Promise<ApiResponse<Blob>>;
}
