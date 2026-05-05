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
                CurrentL3 = domain.CurrentL3
            };
        }

        public Telemetry? ToDomain(TelemetryEntity entity)
        {
            if (!Enum.TryParse<DeviceType>(entity.DeviceType, out var parsedType))
            {
                parsedType = DeviceType.Unknown;
            }

            var telemetryResult = Telemetry.Load(
                entity.RowKey,           
                entity.PartitionKey,    
                parsedType,
                entity.ObservationTime,
                entity.TotalConsumptionKWh,
                entity.CurrentLoadKW,
                entity.VoltageL1,
                entity.CurrentL1,
                entity.VoltageL2,
                entity.VoltageL3,
                entity.CurrentL2,
                entity.CurrentL3
            );

            if (telemetryResult.IsFailure)
                return null;

            return telemetryResult.Value;
        }
    }
}