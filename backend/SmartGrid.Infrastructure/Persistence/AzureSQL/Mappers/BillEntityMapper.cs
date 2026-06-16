using SmartGrid.Domain.Enums;
using SmartGrid.Domain.Models;
using SmartGrid.Infrastructure.Persistence.AzureSQL.Common;
using SmartGrid.Infrastructure.Persistence.AzureSQL.Entities;

namespace SmartGrid.Infrastructure.Persistence.AzureSQL.Mappers
{
    internal class BillEntityMapper : ISQLTableMapper<Bill, BillEntity>
    {
        public BillEntity MapToEntity(Bill bill)
        {
            return new BillEntity
            {
                Id = string.IsNullOrEmpty(bill.Id.Value) ? Guid.NewGuid() : Guid.Parse(bill.Id.Value),
                SmartMeterId = Guid.Parse(bill.SmartMeterId.Value),
                OwnerId = Guid.Parse(bill.OwnerId.Value),
                BillingPeriod = bill.BillingPeriod,
                HighTariffKWh = bill.HighTariffKWh,
                LowTariffKWh = bill.LowTariffKWh,
                GreenZoneAmount = bill.GreenZoneAmount,
                BlueZoneAmount = bill.BlueZoneAmount,
                RedZoneAmount = bill.RedZoneAmount,
                FixedCostsAmount = bill.FixedCostsAmount,
                TotalAmount = bill.TotalAmount,
                Status = bill.Status,
                StripeSessionId = bill.StripeSessionId
            };
        }

        public Bill? MapToDomain(BillEntity entity)
        {
            var status = Enum.TryParse<PaymentState>(entity.Status.ToString(), out var parsedStatus) ? parsedStatus : PaymentState.Unpaid;

            var billResult = Bill.Load(
                entity.Id.ToString(),
                entity.SmartMeterId.ToString(),
                entity.OwnerId.ToString(),
                entity.BillingPeriod,
                entity.HighTariffKWh,
                entity.LowTariffKWh,
                entity.GreenZoneAmount,
                entity.BlueZoneAmount,
                entity.RedZoneAmount,
                entity.FixedCostsAmount,
                entity.TotalAmount,
                status,
                entity.StripeSessionId
            );

            return billResult.IsSuccess ? billResult.Value : null;
        }
    }
}