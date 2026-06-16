using SmartGrid.Domain.Models;
using SmartGrid.Infrastructure.Persistence.AzureSQL.Common;
using SmartGrid.Infrastructure.Persistence.AzureSQL.Entities;

namespace SmartGrid.Infrastructure.Persistence.AzureSQL.Mappers
{
    internal class TariffModelMapper : ISQLTableMapper<TariffModel, TariffModelEntity>
    {
        public TariffModelMapper()
        {
        }

        public TariffModel? MapToDomain(TariffModelEntity entity)
        {
            var result = TariffModel.Load(
                entity.GHT,
                entity.GLT,
                entity.BHT,
                entity.BLT,
                entity.RHT,
                entity.RLT,
                entity.BillingPowerPrice,
                entity.SupplierCost);

            return result.IsSuccess ? result.Value : null;
        }

        public TariffModelEntity MapToEntity(TariffModel domain)
        {
            return new TariffModelEntity
            {
                Id = Guid.Parse("00000000-0000-0000-0000-000000000001"), //jer uvek imam jedan tarifni model i ona ce se update-ovati
                GHT = domain.PriceZones.Green_HT,
                GLT = domain.PriceZones.Green_LT,
                BHT = domain.PriceZones.Blue_HT,
                BLT = domain.PriceZones.Blue_LT,
                RHT = domain.PriceZones.Red_HT,
                RLT = domain.PriceZones.Red_LT,
                BillingPowerPrice = domain.FixedCosts.BillingPowerPrice,
                SupplierCost = domain.FixedCosts.SupplierCost
            };
        }
    }
}
