using SmartGrid.Application.Features.DeviceStatuses.Queries;
using SmartGrid.Application.Interfaces;
using SmartGrid.Domain.Models;

namespace SmartGrid.Application.Features.DeviceStatuses.Mappers
{
    internal sealed class DeviceStatusMapper(IDateTimeProvider dateTimeProvider)
        : IMapper<DeviceStatus, DeviceStatusDto>
    {
        public DeviceStatusDto Map(DeviceStatus source)
        {

            return new DeviceStatusDto(
                source.DeviceId.ToString(),
                source.DeviceType,
                source.CurrentLoadKW,
                source.LastTelemetryReceivedAt,
                source.LastVoltageL1,
                source.LastVoltageL2,
                source.LastVoltageL3
            );
        }
    }
}
