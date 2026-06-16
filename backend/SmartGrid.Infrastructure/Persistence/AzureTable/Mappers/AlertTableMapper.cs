using SmartGrid.Domain.Enums;
using SmartGrid.Domain.ValueObjects;
using SmartGrid.Infrastructure.Persistence.AzureTable.Common;
using SmartGrid.Infrastructure.Persistence.AzureTable.Entities;

namespace SmartGrid.Infrastructure.Persistence.AzureTable.Mappers
{
    internal class AlertTableMapper : ITableMapper<Alert, AlertEntity>
    {
        public Alert? ToDomain(AlertEntity entity)
        {
            if (!Enum.TryParse<AlertType>(entity.AlertType, out var parsedType))
            {
                parsedType = AlertType.Info;
            }

            var alertResult = Alert.Load(
                entity.PartitionKey,
                parsedType,
                entity.Message,
                entity.GeneratedAt
            );

            if (alertResult.IsFailure)
            {
                return null;
            }

            return alertResult.Value;
        }

        public AlertEntity ToEntity(Alert domain)
        {
            return new AlertEntity
            {
                AlertType = domain.AlertType.ToString(),
                Message = domain.Message.Value,
                GeneratedAt = domain.Timestamp
            };
        }
    }
}
