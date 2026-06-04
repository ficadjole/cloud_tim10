using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using SmartGrid.Application.Interfaces.Repositories;
using SmartGrid.Domain.Models;
using SmartGrid.Domain.ValueObjects;
using SmartGrid.Infrastructure.Persistence.AzureSQL.Common;
using SmartGrid.Infrastructure.Persistence.AzureSQL.Context;
using SmartGrid.Infrastructure.Persistence.AzureSQL.Entities;

namespace SmartGrid.Infrastructure.Persistence.AzureSQL.Repositories
{
    internal class BillRepository : IBillRepository
    {
        private readonly SmartMeteringDbContext _dbContext;
        private readonly ISQLTableMapper<Bill, BillEntity> _mapper;

        public BillRepository(SmartMeteringDbContext dbContext, ISQLTableMapper<Bill, BillEntity> mapper)
        {
            _dbContext = dbContext;
            _mapper = mapper;
        }

        public async Task<Bill?> GetByIdAsync(EntityId id, CancellationToken ct = default)
        {
            var guid = Guid.Parse(id.Value);
            var entity = await _dbContext.Set<BillEntity>()
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.Id == guid, ct);

            return entity == null ? null : _mapper.MapToDomain(entity);
        }

        public async Task<IEnumerable<Bill>> GetByOwnerIdAsync(EntityId ownerId, CancellationToken ct = default)
        {
            var ownerGuid = Guid.Parse(ownerId.Value);
            var entities = await _dbContext.Set<BillEntity>()
                .AsNoTracking()
                .Where(x => x.OwnerId == ownerGuid)
                .ToListAsync(ct);

            return entities.Select(x => _mapper.MapToDomain(x)!);
        }

        public Task AddAsync(Bill bill, CancellationToken ct = default)
        {
            var entity = _mapper.MapToEntity(bill);
            _dbContext.Set<BillEntity>().AddAsync(entity, ct);
            return _dbContext.SaveChangesAsync(ct);
        }

        public Task UpdateAsync(Bill bill, CancellationToken ct = default)
        {
            var entity = _mapper.MapToEntity(bill);
            _dbContext.Set<BillEntity>().Update(entity);
            return _dbContext.SaveChangesAsync(ct);
        }
    }
}