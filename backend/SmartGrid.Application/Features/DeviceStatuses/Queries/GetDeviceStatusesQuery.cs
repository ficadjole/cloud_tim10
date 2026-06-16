using MediatR;
using Microsoft.Extensions.Logging;
using SmartGrid.Application.Interfaces;
using SmartGrid.Application.Interfaces.Repositories;
using SmartGrid.Domain.Common;
using SmartGrid.Domain.Enums;
using SmartGrid.Domain.Models;

namespace SmartGrid.Application.Features.DeviceStatuses.Queries
{

    public record DeviceStatusDto(
        string DeviceId,
        DeviceType DeviceType,
        double CurrentLoadKW,
        DateTime LastHeartbeat,
        double VoltageL1,
        double? VoltageL2,
        double? VoltageL3
    );

    public record GetDeviceStatusesQuery() : IRequest<Result<IEnumerable<DeviceStatusDto>>?>;

    internal class GetDeviceStatusesHandler(
        IDeviceStatusQueryRepository deviceStatusQueryRepository,
        IMapper<DeviceStatus, DeviceStatusDto> mapper,
        ILogger<GetDeviceStatusesHandler> logger
    ) : IRequestHandler<GetDeviceStatusesQuery, Result<IEnumerable<DeviceStatusDto>>?>
    {
        public async Task<Result<IEnumerable<DeviceStatusDto>>?> Handle(GetDeviceStatusesQuery request, CancellationToken ct)
        {
            try
            {
                var statuses = await deviceStatusQueryRepository.GetAllAsync(ct);

                var deviceStatuseDTO = statuses.Select(mapper.Map).ToList();

                return Result<IEnumerable<DeviceStatusDto>>.Success(deviceStatuseDTO);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error while retrieving device statuses..");
                return Result<IEnumerable<DeviceStatusDto>>.Failure("Failed to retrieve device statuses.",
                    ErrorType.Failure);
            }
        }
    }
}