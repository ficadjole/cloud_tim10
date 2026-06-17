export interface TariffDto {
  GHT: number;
  GLT: number;
  BHT: number;
  BLT: number;
  RHT: number;
  RLT: number;
  BillingPowerPrice: number;
  SupplierCost: number;
}

export interface GetTariffResponse {
  green_HT: number;
  green_LT: number;
  blue_HT: number;
  blue_LT: number;
  red_HT: number;
  red_LT: number;
  billingPowerPrice: number;
  supplierCost: number;
}