export type SmartMeterConnectionType = "1" | "2";

export type SmartMeterDto = {
  id: string;
  serialNumber?: string | null;
  connectionType?: SmartMeterConnectionType | string | number | null;
  status?: string | number | null;
  isActive?: boolean;
  maxPower?: number;
  note?: string | null;
  residentalObjectId?: string | null;
};

export type RegisterSmartMeterDto = {
  serialNumber: string;
  connectionType: SmartMeterConnectionType;
  objectId: string;
  note?: string;
};

export type ActivateSmartMeterDto = {
  serialNumber: string;
  deviceGuid: string;
};

export type ActivateSmartMeterResult = {
  accessToken: string;
  smartMeterId: string;
};

export type UpdateSmartMeterDto = {
  connectionType: SmartMeterConnectionType;
  note?: string;
  limitValue?: number;
  limitType?: string | number;
};
