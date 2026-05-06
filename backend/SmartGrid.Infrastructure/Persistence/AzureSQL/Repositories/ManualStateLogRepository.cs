using SmartGrid.Application.Interfaces.Repositories;
using SmartGrid.Domain.Models;
using SmartGrid.Infrastructure.Persistence.AzureSQL.Context;
using SmartGrid.Infrastructure.Persistence.AzureSQL.Entities;
using SmartGrid.Infrastructure.Persistence.AzureSQL.Mappers;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SmartGrid.Infrastructure.Persistence.AzureSQL.Repositories
{
    public class ManualStateLogRepository : IManualStateLogRepository
    {
        private readonly SmartMeteringDbContext _dbContext;
        private readonly ManualStateLogMapper _mapper;
        public ManualStateLogRepository(SmartMeteringDbContext dbContext, ManualStateLogMapper mapper)
        {
            _dbContext = dbContext;
            _mapper = mapper;
        }

        public async Task SaveAsync(ManualStateLog log, CancellationToken ct = default)
        {
            var entity = _mapper.ToEntity(log);

            await _dbContext.ManualStateLogs.AddAsync(entity, ct);
            await _dbContext.SaveChangesAsync(ct);
        }
    }
}
