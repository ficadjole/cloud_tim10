using SmartGrid.Domain.Enums;
using SmartGrid.Domain.Models;
using SmartGrid.Infrastructure.Persistence.AzureTable.Common;
using SmartGrid.Infrastructure.Persistence.AzureTable.Entities;

namespace SmartGrid.Infrastructure.Persistence.AzureTable.Mappers
{
    internal class TelemetryTableMapper : ITableMapper<Telemetry, TelemetryEntity>
    {
        public TelemetryEntity ToEntity(Telemetry domain)
        {
            return new TelemetryEntity
            {
                ObservationTime = domain.Timestamp,
                DeviceType = domain.DeviceType.ToString(),
                TotalConsumptionKWh = domain.TotalConsumptionKWh,
                CurrentLoadKW = domain.CurrentLoadKW,
                VoltageL1 = domain.VoltageL1,
                VoltageL2 = domain.VoltageL2,
                VoltageL3 = domain.VoltageL3,
                CurrentL1 = domain.CurrentL1,
                CurrentL2 = domain.CurrentL2,
                CurrentL3 = domain.CurrentL3,
                PowerFactorL1 = domain.PowerFactorL1,
                PowerFactorL2 = domain.PowerFactorL2,
                PowerFactorL3 = domain.PowerFactorL3

            };
        }

        public Telemetry? ToDomain(TelemetryEntity entity)
        {
            if (!Enum.TryParse<DeviceType>(entity.DeviceType, out var parsedType))
            {
                parsedType = DeviceType.Unknown;
            }

            string telemetryId = entity.RowKey;
            if (entity.RowKey.Contains('_'))
            {
                var parts = entity.RowKey.Split('_');
                if (parts.Length > 1)
                {
                    telemetryId = parts[1];
                }
            }
            else
            {
                telemetryId = Guid.NewGuid().ToString();
            }

            var telemetryResult = Telemetry.Load(
                telemetryId,
                entity.PartitionKey,
                parsedType,
                entity.ObservationTime = DateTime.SpecifyKind(entity.ObservationTime, DateTimeKind.Utc),
                entity.TotalConsumptionKWh,
                entity.CurrentLoadKW,
                entity.VoltageL1,
                entity.CurrentL1,
                entity.PowerFactorL1,
                entity.VoltageL2,
                entity.VoltageL3,
                entity.CurrentL2,
                entity.CurrentL3,
                entity.PowerFactorL2,
                entity.PowerFactorL3
            );

            if (telemetryResult.IsFailure)
                return null;

            return telemetryResult.Value;
        }
    }
}