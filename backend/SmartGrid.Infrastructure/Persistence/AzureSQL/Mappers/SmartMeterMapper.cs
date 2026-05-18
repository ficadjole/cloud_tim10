using SmartGrid.Domain.Models;
using SmartGrid.Domain.ValueObjects;
using SmartGrid.Infrastructure.Persistence.AzureSQL.Common;
using SmartGrid.Infrastructure.Persistence.AzureSQL.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SmartGrid.Infrastructure.Persistence.AzureSQL.Mappers
{
    public class SmartMeterMapper : ISQLTableMapper<SmartMeter, SmartMeterEntity>{
        
        public SmartMeter? MapToDomain(SmartMeterEntity entity)
        {
            UserLimit? limit = null;
            if(entity.UserLimitValue.HasValue && entity.UserLimitType.HasValue)
            {
                var limitResult = UserLimit.Create(entity.UserLimitValue.Value, entity.UserLimitType.Value);
                limit = limitResult.IsSuccess ? limitResult.Value : null;
            }

            var result = SmartMeter.Load(
                entity.Id.ToString(),
                entity.SerialNumber,
                entity.ConnectionType,
                entity.MaxPower,
                entity.Status,
                entity.RegisteredAt,
                entity.Note,
                limit,
                entity.LastLimitAlertSent);

            if (result.IsFailure) return null;

            return result.Value;
        }

        public SmartMeterEntity MapToEntity(SmartMeter domain)
        {
            return new SmartMeterEntity
            {
                Id = string.IsNullOrEmpty(domain.Id.Value) ? Guid.NewGuid() : Guid.Parse(domain.Id.Value),
                SerialNumber = domain.SerialNumber.Value,
                ConnectionType = domain.ConnectionType,
                MaxPower = domain.MaxPower.Value,
                Note = domain.Note,
                Status = domain.Status,
                RegisteredAt = domain.RegisteredAt,
                UserLimitValue = domain.UserLimit?.Value,
                UserLimitType = domain.UserLimit?.Type,
                LastLimitAlertSent = domain.LastLimitAlertSent
            };
        }
    }
}
