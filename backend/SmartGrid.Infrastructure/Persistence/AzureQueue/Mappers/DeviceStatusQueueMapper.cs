using SmartGrid.Domain.Models;
using SmartGrid.Infrastructure.Persistence.AzureQueue.Messages;

namespace SmartGrid.Infrastructure.Persistence.AzureQueue.Mappers
{
    public static class DeviceStatusQueueMapper
    {
        public static DeviceStatusMessage? ToQueueMessage(this DeviceStatus model)
        {
            if (model == null) return null;

            return new DeviceStatusMessage
            {
                DeviceId = model.DeviceId.Value,
                DeviceType = model.DeviceType,
                CurrentLoadKW = model.CurrentLoadKW,
                LastTelemetryReceivedAt = model.LastTelemetryReceivedAt,
                LastVoltageL1 = model.LastVoltageL1,
                LastVoltageL2 = model.LastVoltageL2,
                LastVoltageL3 = model.LastVoltageL3
            };
        }

        public static DeviceStatus? ToDomainModel(this DeviceStatusMessage message)
        {
            var deviceStatusResult = DeviceStatus.Load(
                message.DeviceId,
                message.DeviceType,
                message.LastTelemetryReceivedAt,
                message.CurrentLoadKW,
                message.LastVoltageL1,
                message.LastVoltageL2,
                message.LastVoltageL3
            );

            if (deviceStatusResult.IsFailure)
                return null;

            return deviceStatusResult.Value;
        }
    }
}
