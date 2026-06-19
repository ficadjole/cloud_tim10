import type { BillDto, PagedBillResult } from "../../models/bill/BillTypes";
import type { ApiResponse } from "../smart_meters/ISmartMeterAPIService";

export type CheckoutSessionDto = {
  checkoutUrl: string;
};

export interface IBillAPIService {
  getByOwner(ownerId: string, pageNumber?: number, pageSize?: number): Promise<ApiResponse<PagedBillResult>>;
  getByMeter(smartMeterId: string, pageNumber?: number, pageSize?: number): Promise<ApiResponse<PagedBillResult>>;
  downloadPdf(bill: BillDto | string): Promise<ApiResponse<Blob>>;
  createCheckoutSession(
    billId: string,
    payload: { successUrl: string; cancelUrl: string }
  ): Promise<ApiResponse<CheckoutSessionDto>>;
}
