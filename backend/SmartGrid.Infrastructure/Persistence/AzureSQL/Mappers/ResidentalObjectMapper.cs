using SmartGrid.Domain.Models;
using SmartGrid.Infrastructure.Persistence.AzureSQL.Common;
using SmartGrid.Infrastructure.Persistence.AzureSQL.Entities;

namespace SmartGrid.Infrastructure.Persistence.AzureSQL.Mappers
{
    internal class ResidentalObjectMapper : ISQLTableMapper<ResidentalObject, ResidentalObjectEntity>
    {
        private readonly ISQLTableMapper<SmartMeter, SmartMeterEntity> _meterMapper;

        public ResidentalObjectMapper(ISQLTableMapper<SmartMeter, SmartMeterEntity> meterMapper)
        {
            _meterMapper = meterMapper;
        }

        public ResidentalObject? MapToDomain(ResidentalObjectEntity entity)
        {
            var meters = entity.Meters
                    .Select(m => _meterMapper.MapToDomain(m))
                    .Where(m => m != null)
                    .Cast<SmartMeter>()
                    .ToList();

            var result = ResidentalObject.Load(
                entity.Id.ToString(),
                entity.Name,
                entity.Type,
                entity.Street,
                entity.Number,
                entity.City,
                entity.Description,
                entity.OwnerId.ToString(),
                meters);

            return result.IsSuccess ? result.Value : null;
        }

        public ResidentalObjectEntity MapToEntity(ResidentalObject domain)
        {
            var entity = new ResidentalObjectEntity
            {
                Id = Guid.Parse(domain.Id.Value),
                Name = domain.Name,
                Type = domain.Type,
                Street = domain.Address.Street,
                Number = domain.Address.Number,
                City = domain.Address.City,
                Description = domain.Description,
                OwnerId = Guid.Parse(domain.OwnerId.Value)
            };

            // Mapiramo domensku listu u entitetsku listu
            entity.Meters = domain.Meters
                .Select(m => _meterMapper.MapToEntity(m))
                .ToList();

            return entity;
        }
    }
}
