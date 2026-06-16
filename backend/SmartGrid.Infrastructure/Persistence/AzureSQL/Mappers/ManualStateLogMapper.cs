using SmartGrid.Domain.Enums;
using SmartGrid.Domain.Models;
using SmartGrid.Infrastructure.Persistence.AzureSQL.Common;
using SmartGrid.Infrastructure.Persistence.AzureSQL.Entities;

namespace SmartGrid.Infrastructure.Persistence.AzureSQL.Mappers
{
    public class ManualStateLogMapper : ISQLTableMapper<ManualStateLog, ManualStateLogEntity>
    {
        public ManualStateLog? MapToDomain(ManualStateLogEntity entity)
        {
            var result = ManualStateLog.Load(
                entity.Id.ToString(),
                entity.SmartMeterId.ToString(),
                entity.HighTariffValue,
                entity.LowTariffValue,
                entity.ImageUrl,
                (ProcessingStatus)entity.Status
            );

            return result.IsSuccess ? result.Value : null;

        }

        public ManualStateLogEntity MapToEntity(ManualStateLog log)
        {
            return new ManualStateLogEntity
            {
                Id = string.IsNullOrEmpty(log.Id.Value) ? Guid.NewGuid() : Guid.Parse(log.Id.Value),
                SmartMeterId = Guid.Parse(log.SmartMeterId.Value),
                HighTariffValue = log.HighTariffValue,
                LowTariffValue = log.LowTariffValue,
                ImageUrl = log.ImageUrl,
                Status = (int)log.Status
            };
        }

    }
}
