using Microsoft.EntityFrameworkCore;
using SmartGrid.Application.Interfaces.Repositories;
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

        public async Task AddAsync(SmartMeter meter)
        {
            var entity = _mapper.MapToEntity(meter);
            await _dbContext.SmartMeters.AddAsync(entity);
            await _dbContext.SaveChangesAsync();
        }

        public async Task UpdateAsync(SmartMeter meter)
        {
            var entity = _mapper.MapToEntity(meter);
            _dbContext.SmartMeters.Update(entity);
            await _dbContext.SaveChangesAsync();
        }

        public async Task DeleteAsync(EntityId id)
        {
            var entity = await _dbContext.SmartMeters.FindAsync(Guid.Parse(id.Value));
            if(entity != null)
            {
                _dbContext.SmartMeters.Remove(entity);
                await _dbContext.SaveChangesAsync();
            }
        }

        public async Task<IEnumerable<SmartMeter>> GetAllAsync()
        {
            var entities = await _dbContext.SmartMeters.ToListAsync();
            return entities.Select(e => _mapper.MapToDomain(e)!).Where(m => m != null);
        }

        public async Task<SmartMeter?> GetByIdAsync(EntityId id)
        {
            var entity = await _dbContext.SmartMeters.FirstOrDefaultAsync(x => x.Id == Guid.Parse(id.Value));
            return entity != null ? _mapper.MapToDomain(entity) : null;
        }

        public async Task<SmartMeter?> GetBySerialNumberAsync(string serialNumber)
        {
            var entity = await _dbContext.SmartMeters.FirstOrDefaultAsync(x => x.SerialNumber == serialNumber);
            return entity != null ? _mapper.MapToDomain(entity) : null;
        }

        public async Task<IEnumerable<SmartMeter>> GetMetersWithActiveLimitAsync()
        {
            var entities = await _dbContext.SmartMeters.Where(x => x.UserLimitValue != null).ToListAsync();
            return entities.Select(e => _mapper.MapToDomain(e)!).Where(m => m != null);
        }
    }
}
