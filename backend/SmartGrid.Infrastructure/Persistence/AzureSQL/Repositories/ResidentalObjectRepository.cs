using Microsoft.EntityFrameworkCore;
using SmartGrid.Application.Interfaces.Repositories;
using SmartGrid.Domain.Common;
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
    internal class ResidentalObjectRepository : IResidentalObjectRepository
    {
        private readonly SmartMeteringDbContext _dbContext;
        private readonly ISQLTableMapper<ResidentalObject, ResidentalObjectEntity> _mapper;

        public ResidentalObjectRepository(SmartMeteringDbContext dbContext, ISQLTableMapper<ResidentalObject, ResidentalObjectEntity> mapper)
        {
            _dbContext = dbContext;
            _mapper = mapper;
        }

        public async Task AddAsync(ResidentalObject residentalObject, CancellationToken ct = default)
        {
            var entity = _mapper.MapToEntity(residentalObject);
            await _dbContext.ResidentalObjects.AddAsync(entity, ct);
            await _dbContext.SaveChangesAsync(ct);
        }

        public async Task<ResidentalObject?> GetByIdAsync(EntityId id, CancellationToken ct = default)
        {
            var entity = await _dbContext.ResidentalObjects.Include(x => x.ConnectedMeter).FirstOrDefaultAsync(x => x.Id == Guid.Parse(id.Value), ct);
            return entity != null ? _mapper.MapToDomain(entity) : null;
        }

        public async Task<IEnumerable<ResidentalObject>> GetByOwnerIdAsync(EntityId ownerId, CancellationToken ct = default)
        {
            var entities = await _dbContext.ResidentalObjects
                .Include(x => x.ConnectedMeter)
                .Where(x => x.OwnerId == Guid.Parse(ownerId.Value))
                .ToListAsync(ct);

            return entities.Select(e => _mapper.MapToDomain(e)!).Where(x => x != null);
        }

        public async Task<Result> UpdateAsync(ResidentalObject residentalObject, CancellationToken ct = default)
        {
            var entity = await _dbContext.ResidentalObjects
                .FirstOrDefaultAsync(x => x.Id == Guid.Parse(residentalObject.Id.Value), ct);

            if (entity == null)
                return Result.Failure($"Residental object with ID {residentalObject.Id.Value} not found.");

            entity.Name = residentalObject.Name;
            entity.Type = residentalObject.Type;
            entity.Street = residentalObject.Address.Street;
            entity.Number = residentalObject.Address.Number;
            entity.City = residentalObject.Address.City;
            entity.Description = residentalObject.Description;

            await _dbContext.SaveChangesAsync(ct);

            return Result.Success();
        }

        public async Task<ResidentalObject?> GetByMeterIdAsync(EntityId meterId, CancellationToken ct = default)
        {
            var entity = await _dbContext.ResidentalObjects
                .Include(x => x.ConnectedMeter)
                .FirstOrDefaultAsync(x => x.ConnectedMeter != null && x.ConnectedMeter.Id == Guid.Parse(meterId.Value), ct);

            return entity != null ? _mapper.MapToDomain(entity) : null;
        }

        public async Task<Result> DeleteAsync(EntityId id, CancellationToken ct = default)
        {
            var entity = await _dbContext.ResidentalObjects.FirstOrDefaultAsync(x => x.Id == Guid.Parse(id.Value), ct);
            if (entity == null)
                return Result.Failure($"Residental object with ID {id.Value} not found.");
            _dbContext.ResidentalObjects.Remove(entity);
            await _dbContext.SaveChangesAsync(ct);
            return Result.Success();
        }
    }
}
