using Microsoft.AspNetCore.Mvc;
using SmartGrid.Application.Features.TariffModels.Commands;
using SmartGrid.Domain.Common;
using SmartGrid.Domain.Enums;

namespace SmartGrid.WebApi.DTOs
{
    public class UpdateTariffRequest
    {
        [FromForm(Name = "GHT")]
        public float GHT {  get; set; }
        [FromForm(Name = "GLT")]
        public float GLT { get; set; }
        [FromForm(Name = "BHT")]
        public float BHT { get; set; }
        [FromForm(Name = "BLT")]
        public float BLT { get; set; }
        [FromForm(Name = "RHT")]
        public float RHT { get; set; }
        [FromForm(Name = "RLT")]
        public float RLT { get; set; }
        [FromForm(Name = "BillingPowerPrice")]
        public float BillingPowerPrice { get; set; }
        [FromForm(Name = "SupplierCost")]
        public float SupplierCost { get; set; }

        public Result<UpdateTariffCommand> ToCommand()
        {
            if (GHT < 0) return Result<UpdateTariffCommand>.Failure("Green zone (HT) price cannot be negative.", ErrorType.Validation);
            if (GLT < 0) return Result<UpdateTariffCommand>.Failure("Green zone (LT) price cannot be negative.", ErrorType.Validation);
            if (BHT < 0) return Result<UpdateTariffCommand>.Failure("Blue zone (HT) price cannot be negative.", ErrorType.Validation);
            if (BLT < 0) return Result<UpdateTariffCommand>.Failure("Blue zone (LT) price cannot be negative.", ErrorType.Validation);
            if (RHT < 0) return Result<UpdateTariffCommand>.Failure("Red zone (HT) price cannot be negative.", ErrorType.Validation);
            if (RLT < 0) return Result<UpdateTariffCommand>.Failure("Red zone (LT) price cannot be negative.", ErrorType.Validation);
           
            if (BillingPowerPrice < 0) return Result<UpdateTariffCommand>.Failure("Billing power price cannot be negative.", ErrorType.Validation);
            if (SupplierCost < 0) return Result<UpdateTariffCommand>.Failure("Supplier cost cannot be negative.", ErrorType.Validation);

            return Result<UpdateTariffCommand>.Success(new UpdateTariffCommand(
                GHT, GLT, BHT, BLT, RHT, RLT, BillingPowerPrice, SupplierCost));
        }
    }
}
