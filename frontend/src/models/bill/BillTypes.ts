export type BillDto = {
  id: string;
  smartMeterId: string;
  ownerId: string;
  billingPeriod: string;
  highTariffKWh: number;
  lowTariffKWh: number;
  greenZoneAmount: number;
  blueZoneAmount: number;
  redZoneAmount: number;
  fixedCostsAmount: number;
  totalAmount: number;
  status: string;
};

export type PagedBillResult = {
  items: BillDto[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
};
