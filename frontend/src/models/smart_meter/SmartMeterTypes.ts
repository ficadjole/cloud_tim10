export type SmartMeterConnectionType = "1" | "2";

export type SmartMeterDto = {
  id: string;
  serialNumber: string;
  connectionType: SmartMeterConnectionType;
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
