using SmartGrid.Domain.Common;
using SmartGrid.Domain.Enums;
using SmartGrid.Domain.ValueObjects;

namespace SmartGrid.Domain.Models
{
    public class Bill : AggregateRoot
    {
        public EntityId Id { get; private set; }
        public EntityId SmartMeterId { get; private set; }
        public EntityId OwnerId { get; private set; }
        public DateTime BillingPeriod { get; private set; }
        public double HighTariffKWh { get; private set; }
        public double LowTariffKWh { get; private set; }
        public double GreenZoneAmount { get; private set; }
        public double BlueZoneAmount { get; private set; }
        public double RedZoneAmount { get; private set; }
        public double FixedCostsAmount { get; private set; }
        public double TotalAmount { get; private set; }
        public PaymentState Status { get; private set; }
        public string? StripeSessionId { get; private set; }

        private Bill(
            EntityId id,
            EntityId smartMeterId,
            EntityId ownerId,
            DateTime billingPeriod,
            double highTariffKWh,
            double lowTariffKWh,
            double greenZoneAmount,
            double blueZoneAmount,
            double redZoneAmount,
            double fixedCostsAmount,
            double totalAmount,
            PaymentState status,
            string? stripeSessionId = null)
        {
            Id = id;
            SmartMeterId = smartMeterId;
            OwnerId = ownerId;
            BillingPeriod = billingPeriod;
            HighTariffKWh = highTariffKWh;
            LowTariffKWh = lowTariffKWh;
            GreenZoneAmount = greenZoneAmount;
            BlueZoneAmount = blueZoneAmount;
            RedZoneAmount = redZoneAmount;
            FixedCostsAmount = fixedCostsAmount;
            TotalAmount = totalAmount;
            Status = status;
            StripeSessionId = stripeSessionId;
        }

        public static Result<Bill> Create(
            EntityId smartMeterId,
            EntityId ownerId,
            DateTime billingPeriod,
            double highTariffKWh,
            double lowTariffKWh,
            double greenZoneAmount,
            double blueZoneAmount,
            double redZoneAmount,
            double fixedCostsAmount,
            double totalAmount)
        {
            return Result<Bill>.Success(new Bill(
                EntityId.New(),
                smartMeterId,
                ownerId,
                billingPeriod,
                highTariffKWh,
                lowTariffKWh,
                greenZoneAmount,
                blueZoneAmount,
                redZoneAmount,
                fixedCostsAmount,
                totalAmount,
                PaymentState.Unpaid));
        }

        public static Result<Bill> Load(
            string id,
            string smartMeterId,
            string ownerId,
            DateTime billingPeriod,
            double highTariffKWh,
            double lowTariffKWh,
            double greenZoneAmount,
            double blueZoneAmount,
            double redZoneAmount,
            double fixedCostsAmount,
            double totalAmount,
            PaymentState status,
            string? stripeSessionId)
        {
            var idResult = EntityId.Create(id);
            var meterIdResult = EntityId.Create(smartMeterId);
            var ownerIdResult = EntityId.Create(ownerId);

            if (idResult.IsFailure || meterIdResult.IsFailure || ownerIdResult.IsFailure)
            {
                return Result<Bill>.Failure("Invalid identifier format.", ErrorType.Validation);
            }

            return Result<Bill>.Success(new Bill(
                idResult.Value,
                meterIdResult.Value,
                ownerIdResult.Value,
                billingPeriod,
                highTariffKWh,
                lowTariffKWh,
                greenZoneAmount,
                blueZoneAmount,
                redZoneAmount,
                fixedCostsAmount,
                totalAmount,
                status,
                stripeSessionId));
        }

        public void AssignStripeSession(string sessionId)
        {
            StripeSessionId = sessionId;
        }

        public void MarkAsPaid()
        {
            Status = PaymentState.Paid;
        }
    }
}