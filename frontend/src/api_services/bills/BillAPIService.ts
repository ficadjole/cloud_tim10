import axios from "axios";
import client from "../axios/axiosClient";
import type { BillDto, PagedBillResult } from "../../models/bill/BillTypes";
import type { ApiResponse } from "../smart_meters/ISmartMeterAPIService";
import type { IBillAPIService } from "./IBillAPIService";

type ApiErrorBody = {
  message?: string;
  errors?: Record<string, string[]> | string;
};

const toNumber = (value: unknown) => Number(value ?? 0);

const normalizeBill = (raw: Record<string, unknown>): BillDto => ({
  id: String(raw.id ?? raw.Id ?? ""),
  smartMeterId: String(raw.smartMeterId ?? raw.SmartMeterId ?? ""),
  ownerId: String(raw.ownerId ?? raw.OwnerId ?? ""),
  billingPeriod: String(raw.billingPeriod ?? raw.BillingPeriod ?? ""),
  highTariffKWh: toNumber(raw.highTariffKWh ?? raw.HighTariffKWh),
  lowTariffKWh: toNumber(raw.lowTariffKWh ?? raw.LowTariffKWh),
  greenZoneAmount: toNumber(raw.greenZoneAmount ?? raw.GreenZoneAmount),
  blueZoneAmount: toNumber(raw.blueZoneAmount ?? raw.BlueZoneAmount),
  redZoneAmount: toNumber(raw.redZoneAmount ?? raw.RedZoneAmount),
  fixedCostsAmount: toNumber(raw.fixedCostsAmount ?? raw.FixedCostsAmount),
  totalAmount: toNumber(raw.totalAmount ?? raw.TotalAmount),
  status: String(raw.status ?? raw.Status ?? ""),
});

const normalizePagedBills = (raw: Record<string, unknown>): PagedBillResult => {
  const items = raw.items ?? raw.Items;

  return {
    items: Array.isArray(items)
      ? items.map((item) => normalizeBill(item as Record<string, unknown>))
      : [],
    totalCount: toNumber(raw.totalCount ?? raw.TotalCount),
    pageNumber: toNumber(raw.pageNumber ?? raw.PageNumber) || 1,
    pageSize: toNumber(raw.pageSize ?? raw.PageSize) || 10,
  };
};

const getErrorMessage = (e: unknown, fallback: string) => {
  if (!axios.isAxiosError(e)) return fallback;

  const data = e.response?.data as ApiErrorBody | string | undefined;
  if (typeof data === "string") return data || fallback;

  if (data?.errors && typeof data.errors === "object") {
    const validationMessages = Object.values(data.errors).flat().filter(Boolean);
    if (validationMessages.length) return validationMessages.join(" ");
  }

  if (typeof data?.errors === "string" && data.errors.trim()) {
    return data.errors;
  }

  return data?.message ?? fallback;
};

const err = <T>(e: unknown, fallback: string): ApiResponse<T> => ({
  success: false,
  message: getErrorMessage(e, fallback),
});

const ok = <T>(message: string, data?: T): ApiResponse<T> => ({
  success: true,
  message,
  data,
});

export const billApi: IBillAPIService = {
  async getByOwner(ownerId: string, pageNumber = 1, pageSize = 10) {
    return client
      .get<Record<string, unknown>>(`/Bills/owner/${ownerId}`, {
        params: { pageNumber, pageSize },
      })
      .then((response) =>
        ok("Bills loaded successfully.", normalizePagedBills(response.data))
      )
      .catch((e) => err(e, "Failed to load user bills"));
  },

  async getByMeter(smartMeterId: string, pageNumber = 1, pageSize = 10) {
    return client
      .get<Record<string, unknown>>(`/Bills/meter/${smartMeterId}`, {
        params: { pageNumber, pageSize },
      })
      .then((response) =>
        ok("Meter bills loaded successfully.", normalizePagedBills(response.data))
      )
      .catch((e) => err(e, "Failed to load meter bills"));
  },

  async downloadPdf(billId: string) {
    return client
      .get<Blob>(`/Bills/${billId}/download`, { responseType: "blob" })
      .then((response) => ok("Bill PDF loaded successfully.", response.data))
      .catch((e) => err(e, "Failed to load bill PDF"));
  },
};
