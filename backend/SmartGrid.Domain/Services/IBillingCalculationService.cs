using SmartGrid.Domain.Common;
using SmartGrid.Domain.Models;

namespace SmartGrid.Domain.Services
{
    public interface IBillingCalculationService
    {
        Result<BillCalculationResult> Calculate(
            double highTariffKWh,
            double lowTariffKWh,
            TariffModel tariffModel,
            double approvedPowerKW);
    }

    public record BillCalculationResult(
        double GreenZoneAmount,
        double BlueZoneAmount,
        double RedZoneAmount,
        double FixedCostsAmount,
        double TotalAmount);
}