import type { ConsumerRow } from "../../models/residental_object/ResidentalObjectTypes";
import type { SmartMeterDto, DeviceStatusDto } from "../../models/smart_meter/SmartMeterTypes";
import type { BillDto } from "../../models/bill/BillTypes";
import { smartMeterApi } from "../../api_services/smart_meters/SmartMeterAPIService";

// ---- Style constants ----------------------------------------------------

export const panelClass =
  "rounded-2xl bg-linear-to-b from-[#FAFAFA] to-white/1 backdrop-blur-2xl border border-white/40 p-4 shadow-lg";

export const cardClass = "rounded-2xl bg-[#FAFAFA] border border-gray-200 p-6";

export const actionButtonClass =
  "z-30 montserrat_semibold bg-[#469FFE] hover:bg-[#2b7bdc] rounded-md text-white relative after:content-[''] after:-z-20 after:absolute after:h-1 after:w-1 after:bg-[#2b7bdc] after:left-5 overflow-hidden after:bottom-0 after:translate-y-full after:rounded-md hover:after:scale-[300] hover:after:transition-all hover:after:duration-700 after:transition-all after:duration-700 transition-all duration-700 [text-shadow:3px_5px_2px_#1f5fb0] hover:[text-shadow:2px_2px_2px_#b5e0ff] disabled:opacity-50 cursor-pointer";

// ---- Config constants -----------------------------------------------------

export const checkoutSuccessUrl = "http://localhost:5173/payment-success";
export const checkoutCancelUrl = "http://localhost:5173/payment-failed";
export const pendingPaymentBillKey = "pendingPaymentBill";
export const telemetryRefreshMs = 5000;
export const onlineThresholdSeconds = 20;
export const allFilterValue = "all";
export const digitalRecordPageSizes = [5, 10, 20];
export const digitalRecordFetchSize = 500;

// ---- Formatting helpers -----------------------------------------------------

export const getObjectTypeLabel = (type: string | number) => {
  const normalized = String(type);

  if (normalized === "0") return "Kuća";
  if (normalized === "1") return "Stan";
  if (normalized === "2") return "Vikendica";

  return normalized || "Objekat";
};

export const buildDeviceGuid = (objectId: string) => `frontend-${objectId}`;

export const getMeterSummary = (consumer: ConsumerRow) => {
  const meterCount = consumer.smartMeters?.length ?? consumer.connectedMeterIds?.length ?? 0;

  if (meterCount > 1) return `${meterCount} brojila`;
  if (meterCount === 1) return consumer.smartMeters?.[0]?.serialNumber || consumer.smartMeters?.[0]?.id || "1 brojilo";

  return consumer.connectedMeterId ?? "Nije povezano";
};

export const formatCurrency = (value: number) =>
  `${Number(value).toLocaleString("sr-RS", { maximumFractionDigits: 2 })} RSD`;

export const formatPeriod = (value: string) => {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("sr-RS", { month: "2-digit", year: "numeric" });
};

export const isBillUnpaid = (bill: BillDto) => String(bill.status ?? "").toLowerCase() === "unpaid";
export const isBillPaid = (bill: BillDto) => String(bill.status ?? "").toLowerCase() === "paid";

export const getBillStatusLabel = (status: string) => {
  const normalized = String(status ?? "").toLowerCase();

  if (normalized === "paid") return "Plaćen";
  if (normalized === "unpaid") return "Neplaćen";

  return status || "-";
};

export const toFiniteNumber = (value: number | null | undefined) =>
  typeof value === "number" && Number.isFinite(value) ? value : null;

export const formatNumber = (value: number | null | undefined, unit: string, maximumFractionDigits = 2) => {
  const numeric = toFiniteNumber(value);
  if (numeric === null) return "-";

  return `${numeric.toLocaleString("sr-RS", { maximumFractionDigits })} ${unit}`;
};

export const getAverageVoltage = (status: DeviceStatusDto) => {
  const voltages = [status.voltageL1, status.voltageL2, status.voltageL3]
    .map(toFiniteNumber)
    .filter((value): value is number => value !== null);

  if (voltages.length === 0) return null;
  return voltages.reduce((sum, value) => sum + value, 0) / voltages.length;
};

export const getCurrentTariff = () => {
  const hour = new Date().getHours();
  return hour >= 22 || hour < 6 ? "NT" : "VT";
};

export const getConnectionTypeLabel = (type: SmartMeterDto["connectionType"]) => {
  const normalized = String(type ?? "").toLowerCase();

  if (normalized === "1" || normalized === "singlephase") return "Monofazni";
  if (normalized === "2" || normalized === "multiphase") return "Trofazni";

  return type ? String(type) : "-";
};

export const isStatusOnline = (status: DeviceStatusDto) => {
  if (!status.lastHeartbeat) return false;

  const heartbeatTime = new Date(status.lastHeartbeat).getTime();
  if (Number.isNaN(heartbeatTime)) return false;

  return (Date.now() - heartbeatTime) / 1000 <= onlineThresholdSeconds;
};

export const getMeterStatusKeys = (meter: SmartMeterDto) =>
  [meter.id, meter.serialNumber, meter.deviceGuid]
    .map((value) => String(value ?? "").trim().toLowerCase())
    .filter(Boolean);

export const statusBelongsToMeter = (status: DeviceStatusDto, meter: SmartMeterDto) => {
  const statusDeviceId = String(status.deviceId ?? "").trim().toLowerCase();
  return getMeterStatusKeys(meter).includes(statusDeviceId);
};

export const getMonthDays = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 30;

  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
};

export const toChartPath = (values: number[], width: number, height: number, padding: number) => {
  if (values.length === 0) return "";

  const max = Math.max(...values);
  const min = Math.min(...values);
  const span = max - min || 1;
  const step = values.length > 1 ? (width - padding * 2) / (values.length - 1) : 0;

  return values
    .map((value, index) => {
      const x = values.length > 1 ? padding + step * index : width / 2;
      const y = height - padding - ((value - min) / span) * (height - padding * 2);
      return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
};

export const getConsumerMeterIds = (consumer: ConsumerRow) => {
  const meterIds = consumer.connectedMeterIds?.length
    ? consumer.connectedMeterIds
    : consumer.smartMeters?.map((meter) => meter.id) ?? [];

  return Array.from(new Set(meterIds.filter(Boolean)));
};

export const getMeterDisplayName = (meter: SmartMeterDto) =>
  meter.serialNumber ? `${meter.serialNumber} (${meter.id})` : meter.id;

export const isBillInPeriod = (bill: BillDto, from: string, to: string) => {
  const periodTime = new Date(bill.billingPeriod).getTime();
  if (Number.isNaN(periodTime)) return true;

  if (from) {
    const fromTime = new Date(`${from}-01T00:00:00`).getTime();
    if (!Number.isNaN(fromTime) && periodTime < fromTime) return false;
  }

  if (to) {
    const toDate = new Date(`${to}-01T00:00:00`);
    if (!Number.isNaN(toDate.getTime())) {
      const toEndTime = new Date(toDate.getFullYear(), toDate.getMonth() + 1, 0, 23, 59, 59, 999).getTime();
      if (periodTime > toEndTime) return false;
    }
  }

  return true;
};

export const hydrateConsumerMeters = async (consumer: ConsumerRow): Promise<ConsumerRow> => {
  const meterIds = getConsumerMeterIds(consumer);

  if (meterIds.length === 0) {
    return {
      ...consumer,
      connectedMeterId: null,
      connectedMeterIds: [],
      smartMeters: [],
      isActive: false,
    };
  }

  const smartMeters = await Promise.all(
    meterIds.map(async (meterId) => {
      const fallbackMeter = consumer.smartMeters?.find((meter) => meter.id === meterId) ?? { id: meterId };
      const response = await smartMeterApi.getById(meterId);

      return response.success && response.data ? response.data : fallbackMeter;
    })
  );

  return {
    ...consumer,
    connectedMeterId: meterIds[0] ?? null,
    connectedMeterIds: meterIds,
    smartMeters,
    isActive: smartMeters.length > 0,
  };
};
