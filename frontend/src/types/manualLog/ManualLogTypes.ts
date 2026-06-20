export interface ManualLogDto {
  id: string;
  smartMeterId: string;
  highTariffValue: number;
  lowTariffValue: number;
  imageUrl: string;
  status: string; // "WaitingForProcessing" | "Processed" | "Rejected"
}