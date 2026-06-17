export interface DeviceDto {
  deviceId: string;
  name: string;
  type: string; // "Monophase" | "Threephase"
  location: string;
  nominalPower: number;
  registeredAt: string;
}

export interface DeviceStatusDto {
  deviceId: string;
  deviceType: string;
  currentLoadKW: number;
  lastHeartbeat: string;
  voltageL1: number;
  voltageL2: number | null;
  voltageL3: number | null;
}

export interface DeviceWithStatus extends DeviceDto {
  status: DeviceStatusDto | null;
  isOnline: boolean;
  secondsSinceHeartbeat: number | null;
}

export type SmartMeterDto = {
  id: string;
  serialNumber: string;
  connectionType: string;
  status: string;
  registeredAt: string;
  deviceGuid?: string;
};

export type SmartMeterWithStatusDto = {
  id: string;
  serialNumber: string;
  connectionType: string;
  meterStatus: string;       
  lastTelemetry?: string;   
  currentLoadKW?: number;   
  isOnline?: boolean;        
};