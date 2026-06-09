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

export type ResidentalObjectType = "0" | "1" | "2";

export type CreateResidentalObjectDto = {
  name: string;
  type: ResidentalObjectType;
  street: string;
  number: string;
  city: string;
  description?: string;
};
