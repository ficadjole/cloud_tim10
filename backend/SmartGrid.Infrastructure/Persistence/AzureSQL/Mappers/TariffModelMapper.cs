using SmartGrid.Domain.Models;
using SmartGrid.Infrastructure.Persistence.AzureSQL.Common;
using SmartGrid.Infrastructure.Persistence.AzureSQL.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

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
                Id = Guid.NewGuid(), //u modelu nema id pa zato
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
