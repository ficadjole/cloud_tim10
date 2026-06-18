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

        public async Task AddAsync(Bill bill, CancellationToken ct = default)
        {
            var entity = _mapper.MapToEntity(bill);
            await _dbContext.Bills.AddAsync(entity, ct);
            await _dbContext.SaveChangesAsync(ct);
        }

        public async Task UpdateAsync(Bill bill, CancellationToken ct = default)
        {
            Guid billGuid = Guid.Parse(bill.Id.Value);
            var entity = await _dbContext.Bills.FindAsync(new object[] { billGuid }, cancellationToken: ct);

            if (entity != null)
            {
                entity.Status = bill.Status;
                entity.StripeSessionId = bill.StripeSessionId;

                _dbContext.Bills.Update(entity);
                await _dbContext.SaveChangesAsync(ct);
            }
        }

        public async Task<Bill?> GetByIdAsync(EntityId id, CancellationToken ct = default)
        {
            Guid billGuid = Guid.Parse(id.Value);
            var entity = await _dbContext.Bills.FindAsync(new object[] { billGuid }, cancellationToken: ct);
            return entity != null ? _mapper.MapToDomain(entity) : null;
        }

        public async Task<Bill?> GetByPeriodAsync(EntityId smartMeterId, DateTime billingPeriod, CancellationToken ct = default)
        {
            Guid meterGuid = Guid.Parse(smartMeterId.Value);
            var entity = await _dbContext.Bills.FirstOrDefaultAsync(b =>
                b.SmartMeterId == meterGuid &&
                b.BillingPeriod == billingPeriod,
                ct);
            return entity != null ? _mapper.MapToDomain(entity) : null;
        }

        public async Task<(IEnumerable<Bill> Items, int TotalCount)> GetPagedBySmartMeterIdAsync(EntityId smartMeterId, int page, int pageSize, CancellationToken ct = default)
        {
            Guid meterGuid = Guid.Parse(smartMeterId.Value);

            var query = _dbContext.Bills.Where(b => b.SmartMeterId == meterGuid);
            int totalCount = await query.CountAsync(ct);

            var entities = await query
                .OrderByDescending(b => b.BillingPeriod)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(ct);

            var domainBills = new List<Bill>();
            foreach (var entity in entities)
            {
                var domain = _mapper.MapToDomain(entity);
                if (domain != null)
                {
                    domainBills.Add(domain);
                }
            }

            return (domainBills, totalCount);
        }

        public async Task<IEnumerable<Bill>> GetByOwnerIdAsync(EntityId ownerId, CancellationToken ct = default)
        {
            Guid ownerGuid = Guid.Parse(ownerId.Value);

            var entities = await _dbContext.Bills
                .AsNoTracking()
                .Where(b => b.OwnerId == ownerGuid)
                .ToListAsync(ct);

            var domainBills = new List<Bill>();
            foreach (var entity in entities)
            {
                var domain = _mapper.MapToDomain(entity);
                if (domain != null)
                {
                    domainBills.Add(domain);
                }
            }

            return domainBills;
        }

        public async Task<(IEnumerable<Bill> Items, int TotalCount)> GetPagedByOwnerIdAsync(EntityId ownerId, int page, int pageSize, CancellationToken ct = default)
        {
            Guid ownerGuid = Guid.Parse(ownerId.Value);

            var query = _dbContext.Bills.AsNoTracking().Where(b => b.OwnerId == ownerGuid);
            int totalCount = await query.CountAsync(ct);

            var entities = await query
                .OrderByDescending(b => b.BillingPeriod)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(ct);

            var domainBills = new List<Bill>();
            foreach (var entity in entities)
            {
                var domain = _mapper.MapToDomain(entity);
                if (domain != null)
                {
                    domainBills.Add(domain);
                }
            }

            return (domainBills, totalCount);
        }
    }
}