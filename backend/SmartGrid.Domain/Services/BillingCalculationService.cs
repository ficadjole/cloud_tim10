using System;
using SmartGrid.Domain.Common;
using SmartGrid.Domain.Enums;
using SmartGrid.Domain.Models;

namespace SmartGrid.Domain.Services
{
    public class BillingCalculationService : IBillingCalculationService
    {
        public Result<BillCalculationResult> Calculate(
            double highTariffKWh,
            double lowTariffKWh,
            TariffModel tariffModel,
            double approvedPowerKW)
        {
            if (highTariffKWh < 0 || lowTariffKWh < 0)
                return Result<BillCalculationResult>.Failure("Potrošnja ne može biti negativna.", ErrorType.Validation);

            if (tariffModel == null)
                return Result<BillCalculationResult>.Failure("Tarifni model nije prosleđen.", ErrorType.Validation);

            double totalConsumption = highTariffKWh + lowTariffKWh;

            if (totalConsumption == 0)
            {
                double initialFixedCosts = (tariffModel.FixedCosts.BillingPowerPrice * approvedPowerKW) + tariffModel.FixedCosts.SupplierCost;
                return Result<BillCalculationResult>.Success(new BillCalculationResult(0, 0, 0, initialFixedCosts, initialFixedCosts));
            }

            double kVt = highTariffKWh / totalConsumption;
            double kNt = lowTariffKWh / totalConsumption;

            double greenTotal = Math.Min(totalConsumption, 350);
            double blueTotal = Math.Max(0, Math.Min(totalConsumption - 350, 850));
            double redTotal = Math.Max(0, totalConsumption - 1200);

            double greenVt = greenTotal * kVt;
            double greenLt = greenTotal * kNt;

            double blueVt = blueTotal * kVt;
            double blueLt = blueTotal * kNt;

            double redVt = redTotal * kVt;
            double redLt = redTotal * kNt;

            double greenAmount = (greenVt * tariffModel.PriceZones.Green_HT) + (greenLt * tariffModel.PriceZones.Green_LT);
            double blueAmount = (blueVt * tariffModel.PriceZones.Blue_HT) + (blueLt * tariffModel.PriceZones.Blue_LT);
            double redAmount = (redVt * tariffModel.PriceZones.Red_HT) + (redLt * tariffModel.PriceZones.Red_LT);

            double fixedCostsAmount = (tariffModel.FixedCosts.BillingPowerPrice * approvedPowerKW) + tariffModel.FixedCosts.SupplierCost;
            double totalAmount = greenAmount + blueAmount + redAmount + fixedCostsAmount;

            return Result<BillCalculationResult>.Success(new BillCalculationResult(
                Math.Round(greenAmount, 2),
                Math.Round(blueAmount, 2),
                Math.Round(redAmount, 2),
                Math.Round(fixedCostsAmount, 2),
                Math.Round(totalAmount, 2)
            ));
        }
    }
}