using Microsoft.EntityFrameworkCore;
using SmartGrid.Application.Interfaces.Repositories;
using SmartGrid.Domain.Common;
using SmartGrid.Domain.Enums;
using SmartGrid.Domain.Models;
using SmartGrid.Domain.ValueObjects;
using SmartGrid.Infrastructure.Persistence.AzureSQL.Common;
using SmartGrid.Infrastructure.Persistence.AzureSQL.Context;
using SmartGrid.Infrastructure.Persistence.AzureSQL.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SmartGrid.Infrastructure.Persistence.AzureSQL.Repositories
{
    internal class SmartMeterRepository : ISmartMeterRepository
    {
        private readonly SmartMeteringDbContext _dbContext;
        private readonly ISQLTableMapper<SmartMeter, SmartMeterEntity> _mapper;

        //da li da bude internal ili public

        public SmartMeterRepository(SmartMeteringDbContext dbContext, ISQLTableMapper<SmartMeter, SmartMeterEntity> mapper)
        {
            _dbContext = dbContext;
            _mapper = mapper;
        }

        public async Task AddAsync(SmartMeter meter , CancellationToken ct = default)
        {
            var entity = _mapper.MapToEntity(meter);
            await _dbContext.SmartMeters.AddAsync(entity, ct);
            await _dbContext.SaveChangesAsync(ct);
        }

        public async Task<Result> UpdateAsync(SmartMeter meter, CancellationToken ct = default)
        {
            var entity = await _dbContext.SmartMeters
         .FirstOrDefaultAsync(x => x.Id == Guid.Parse(meter.Id.Value), ct);

            if (entity == null)
                return Result.Failure($"Smart meter with ID {meter.Id.Value} not found.", ErrorType.NotFound);

            entity.Note = meter.Note;
            entity.ConnectionType = meter.ConnectionType;
            entity.MaxPower = meter.MaxPower.Value;

            entity.UserLimitValue = meter.UserLimit?.Value;
            entity.UserLimitType = meter.UserLimit?.Type;

            entity.Status = meter.Status;
            entity.DeviceGuid = meter.DeviceGuid;
            entity.AccessToken = meter.AccessToken;

            await _dbContext.SaveChangesAsync(ct);

            return Result.Success();
        }

        public async Task DeleteAsync(EntityId id, CancellationToken ct = default)
        {
            var entity = await _dbContext.SmartMeters.FindAsync(Guid.Parse(id.Value));
            if(entity != null)
            {
                _dbContext.SmartMeters.Remove(entity);
                await _dbContext.SaveChangesAsync(ct);
            }
        }

        public async Task<IEnumerable<SmartMeter>> GetAllAsync(CancellationToken ct = default)
        {
            var entities = await _dbContext.SmartMeters.ToListAsync(ct);
            return entities.Select(e => _mapper.MapToDomain(e)!).Where(m => m != null);
        }

        public async Task<SmartMeter?> GetByIdAsync(EntityId id, CancellationToken ct = default)
        {
            var entity = await _dbContext.SmartMeters.FirstOrDefaultAsync(x => x.Id == Guid.Parse(id.Value), ct);
            return entity != null ? _mapper.MapToDomain(entity) : null;
        }

        public async Task<SmartMeter?> GetBySerialNumberAsync(string serialNumber, CancellationToken ct = default)
        {
            var entity = await _dbContext.SmartMeters.FirstOrDefaultAsync(x => x.SerialNumber == serialNumber, ct);
            return entity != null ? _mapper.MapToDomain(entity) : null;
        }

        public async Task<IEnumerable<SmartMeter>> GetMetersWithActiveLimitAsync(CancellationToken ct = default)
        {
            var entities = await _dbContext.SmartMeters.Where(x => x.UserLimitValue != null).ToListAsync(ct);
            return entities.Select(e => _mapper.MapToDomain(e)!).Where(m => m != null);
        }
    }
}
