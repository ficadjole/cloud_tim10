export const statusLabel: Record<string, string> = {
  WaitingForProcessing: "Na čekanju",
  Processed: "Odobreno",
  Rejected: "Odbijeno",
};

export const statusColor: Record<string, string> = {
  WaitingForProcessing: "bg-yellow-100 text-yellow-700",
  Processed: "bg-green-100 text-green-700",
  Rejected: "bg-red-100 text-red-700",
};

export type ManualLogFilter = "WaitingForProcessing" | "Processed" | "Rejected" | "All";