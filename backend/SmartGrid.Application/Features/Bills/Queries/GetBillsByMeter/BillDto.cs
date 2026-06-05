using System;

namespace SmartGrid.Application.Features.Bills.Queries.GetBillsByMeter
{
    public record BillDto(
        string Id,
        string SmartMeterId,
        string OwnerId,
        DateTime BillingPeriod,
        double HighTariffKWh,
        double LowTariffKWh,
        double GreenZoneAmount,
        double BlueZoneAmount,
        double RedZoneAmount,
        double FixedCostsAmount,
        double TotalAmount,
        string Status);
}