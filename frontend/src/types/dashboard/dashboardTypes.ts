import type { ConsumerRow } from "../../models/residental_object/ResidentalObjectTypes";
import type { SmartMeterDto } from "../../models/smart_meter/SmartMeterTypes";

export type TelemetryPoint = {
  time: number;
  label: string;
  averageVoltage: number;
  totalLoad: number;
};

export type BarChartPoint = {
  id: string;
  label: string;
  highTariff: number;
  lowTariff: number;
};

export type MeterDeleteTarget = {
  consumer: ConsumerRow;
  meter: SmartMeterDto;
};

export type UserDashboardPanel = "objects" | "telemetry" | "digital";

export type TelemetrySummary = {
  currentTariff: string;
  averageVoltage: number | null;
  totalLoad: number;
  online: number;
  totalTracked: number;
  connectionLabel: string;
};

export type DigitalRecordSummary = {
  highTariff: number;
  lowTariff: number;
  totalAmount: number;
  unpaidCount: number;
};
