using SmartGrid.Domain.Common;
using SmartGrid.Domain.Enums;

namespace SmartGrid.Domain.ValueObjects
{
    public sealed record FixedCosts
    {
        public float BillingPowerPrice { get; } //ObracunskaSnagaCena
        public float SupplierCost { get; } //TrosakSnabdevaca

        private FixedCosts(float billingPowerPrice, float supplierCost)
        {
            BillingPowerPrice = billingPowerPrice;
            SupplierCost = supplierCost;
        }

        public static Result<FixedCosts> Create(float billingPowerPrice, float supplierCost)
        {
            if (billingPowerPrice < 0)
                return Result<FixedCosts>.Failure("Billing power price cannot be negative.", ErrorType.Validation);

            if (supplierCost < 0)
                return Result<FixedCosts>.Failure("Supplier cost cannot be negative.", ErrorType.Validation);

            return Result<FixedCosts>.Success(new FixedCosts(billingPowerPrice, supplierCost));
        }
    }
}
