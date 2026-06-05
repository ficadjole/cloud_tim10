using Microsoft.EntityFrameworkCore;
using SmartGrid.Application.Interfaces.Repositories;
using SmartGrid.Domain.Models;
using SmartGrid.Infrastructure.Persistence.AzureSQL.Common;
using SmartGrid.Infrastructure.Persistence.AzureSQL.Context;
using SmartGrid.Infrastructure.Persistence.AzureSQL.Entities;
using System.Threading;
using System.Threading.Tasks;

namespace SmartGrid.Infrastructure.Persistence.AzureSQL.Repositories
{
    internal class TariffModelRepository : ITariffModelRepository
    {
        private readonly SmartMeteringDbContext _dbContext;
        private readonly ISQLTableMapper<TariffModel, TariffModelEntity> _mapper;

        public TariffModelRepository(SmartMeteringDbContext dbContext, ISQLTableMapper<TariffModel, TariffModelEntity> mapper)
        {
            _dbContext = dbContext;
            _mapper = mapper;
        }

        public async Task<TariffModel?> GetActiveTariffAsync(CancellationToken ct = default)
        {
            var entity = await _dbContext.TariffModels.FirstOrDefaultAsync(ct);
            return entity != null ? _mapper.MapToDomain(entity) : null;
        }

        public async Task SaveAsync(TariffModel tariff)
        {
            var existingEntity = await _dbContext.TariffModels.FirstOrDefaultAsync();

            if (existingEntity == null)
            {
                var newEntity = _mapper.MapToEntity(tariff);
                await _dbContext.TariffModels.AddAsync(newEntity);
            }
            else
            {
                existingEntity.GHT = tariff.PriceZones.Green_HT;
                existingEntity.GLT = tariff.PriceZones.Green_LT;
                existingEntity.BHT = tariff.PriceZones.Blue_HT;
                existingEntity.BLT = tariff.PriceZones.Blue_LT;
                existingEntity.RHT = tariff.PriceZones.Red_HT;
                existingEntity.RLT = tariff.PriceZones.Red_LT;
                existingEntity.BillingPowerPrice = tariff.FixedCosts.BillingPowerPrice;
                existingEntity.SupplierCost = tariff.FixedCosts.SupplierCost;

                _dbContext.TariffModels.Update(existingEntity);
            }

            await _dbContext.SaveChangesAsync();
        }
    }
}