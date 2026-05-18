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
            var now = dateTimeProvider.UtcNow;

            return new DeviceStatusDto(
                source.DeviceId.ToString(),
                source.DeviceType,
                source.CurrentLoadKW,
                now,
                source.LastVoltageL1,
                source.LastVoltageL2,
                source.LastVoltageL3
            );
        }
    }
}
