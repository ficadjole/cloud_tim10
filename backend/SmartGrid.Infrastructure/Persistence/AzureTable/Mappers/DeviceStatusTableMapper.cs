using SmartGrid.Domain.Enums;
using SmartGrid.Domain.Models;
using SmartGrid.Infrastructure.Persistence.AzureTable.Common;
using SmartGrid.Infrastructure.Persistence.AzureTable.Entities;

namespace SmartGrid.Infrastructure.Persistence.AzureTable.Mappers
{
    internal sealed class DeviceStatusTableMapper : ITableMapper<DeviceStatus, DeviceStatusEntity>
    {
        public DeviceStatusEntity ToEntity(DeviceStatus domain)
        {
            return new DeviceStatusEntity
            {
                CurrentLoadKW = domain.CurrentLoadKW,
                LastTelemetryReceived = domain.LastTelemetryReceivedAt,
                LastVoltageL1 = domain.LastVoltageL1,
                LastVoltageL2 = domain.LastVoltageL2,
                LastVoltageL3 = domain.LastVoltageL3,
            };

        }
        public DeviceStatus? ToDomain(DeviceStatusEntity entity)
        {
            var deviceType = Enum.TryParse<DeviceType>(entity.PartitionKey, out var parsedType)
                             ? parsedType : DeviceType.Unknown;



            var deviceStatusResult = DeviceStatus.Load(
                 entity.RowKey,
                 deviceType,
                 entity.LastTelemetryReceived,
                 entity.CurrentLoadKW,
                 entity.LastVoltageL1,
                 entity.LastVoltageL2,
                 entity.LastVoltageL3
             );

            if (deviceStatusResult.IsFailure)
                return null;

            return deviceStatusResult.Value;
        }
    }
}
