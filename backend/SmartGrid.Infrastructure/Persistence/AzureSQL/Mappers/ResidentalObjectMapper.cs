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
    internal class ResidentalObjectMapper : ISQLTableMapper<ResidentalObject, ResidentalObjectEntity>
    {
        private readonly ISQLTableMapper<SmartMeter, SmartMeterEntity> _meterMapper;

        public ResidentalObjectMapper(ISQLTableMapper<SmartMeter, SmartMeterEntity> meterMapper)
        {
            _meterMapper = meterMapper;
        }

        public ResidentalObject? MapToDomain(ResidentalObjectEntity entity)
        {
            SmartMeter? meter = entity.ConnectedMeter != null ? _meterMapper.MapToDomain(entity.ConnectedMeter) : null;

            var result = ResidentalObject.Load(
                entity.Id.ToString(),
                entity.Name,
                entity.Type,
                entity.Street,
                entity.Number,
                entity.City,
                entity.OwnerId.ToString(),
                meter);

            return result.IsSuccess ? result.Value : null;
        }

        public ResidentalObjectEntity MapToEntity(ResidentalObject domain)
        {
            return new ResidentalObjectEntity
            {
                Id = string.IsNullOrEmpty(domain.Id.Value) ? Guid.NewGuid() : Guid.Parse(domain.Id.Value),
                Name = domain.Name,
                Type = domain.Type,
                Street = domain.Address.Street,
                Number = domain.Address.Number,
                City = domain.Address.City,
                OwnerId = Guid.Parse(domain.OwnerId.Value), //ovo nez da li treba ovako
                ConnectedMeter = domain.ConnectedMeter != null ? _meterMapper.MapToEntity(domain.ConnectedMeter) : null
            };
        }
    }
}
