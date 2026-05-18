using Microsoft.EntityFrameworkCore;
using SmartGrid.Application.Interfaces.Repositories;
using SmartGrid.Domain.Models;
using SmartGrid.Domain.ValueObjects;
using SmartGrid.Infrastructure.Persistence.AzureSQL.Common;
using SmartGrid.Infrastructure.Persistence.AzureSQL.Context;
using SmartGrid.Infrastructure.Persistence.AzureSQL.Entities;


namespace SmartGrid.Infrastructure.Persistence.AzureSQL.Repositories
{
    internal class ManualStateLogRepository : IManualStateLogRepository
    {
        private readonly SmartMeteringDbContext _dbContext;
        private readonly ISQLTableMapper<ManualStateLog, ManualStateLogEntity> _mapper;
        public ManualStateLogRepository(SmartMeteringDbContext dbContext, ISQLTableMapper<ManualStateLog, ManualStateLogEntity> mapper)
        {
            _dbContext = dbContext;
            _mapper = mapper;
        }

        public async Task<ManualStateLog?> GetById(EntityId id, CancellationToken ct = default)
        {
            var entity =  await _dbContext.ManualStateLogs.AsNoTracking().FirstOrDefaultAsync(e => e.Id.ToString() == id.ToString(), ct);
            
            if(entity == null)
                return null;

            return _mapper.MapToDomain(entity);
        }

        public async Task SaveAsync(ManualStateLog log, CancellationToken ct = default)
        {
            var entity = _mapper.MapToEntity(log);

            await _dbContext.ManualStateLogs.AddAsync(entity, ct);
            await _dbContext.SaveChangesAsync(ct);
        }

        public async Task UpdateStatusAsync(ManualStateLog log, CancellationToken ct = default)
        {
            var entity = _mapper.MapToEntity(log);

             _dbContext.ManualStateLogs.Update(entity);
            await _dbContext.SaveChangesAsync(ct);
        }
    }
}
