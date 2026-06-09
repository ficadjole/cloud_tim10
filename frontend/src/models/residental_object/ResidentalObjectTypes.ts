export type ResidentalObjectDto = {
  id: string;
  name: string;
  type: string | number;
  fullAddress: string;
  description?: string | null;
  connectedMeterId?: string | null;
};

export type ConsumerRow = ResidentalObjectDto & {
  isActive: boolean;
};
