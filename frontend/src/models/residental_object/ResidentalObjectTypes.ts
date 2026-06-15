import type { SmartMeterDto } from "../smart_meter/SmartMeterTypes";

export type ResidentalObjectDto = {
  id: string;
  name: string;
  type: string | number;
  fullAddress: string;
  description?: string | null;
  connectedMeterId?: string | null;
  connectedMeterIds?: string[];
  smartMeters?: SmartMeterDto[];
};

export type ConsumerRow = ResidentalObjectDto & {
  isActive: boolean;
};

export type ResidentalObjectType = "0" | "1" | "2";

export type CreateResidentalObjectDto = {
  name: string;
  type: ResidentalObjectType;
  street: string;
  number: string;
  city: string;
  description?: string;
};

export type UpdateResidentalObjectDto = CreateResidentalObjectDto;
