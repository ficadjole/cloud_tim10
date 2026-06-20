using MediatR;
using Microsoft.Extensions.Logging;
using SmartGrid.Application.Interfaces.Repositories;
using SmartGrid.Domain.Common;
using SmartGrid.Domain.Enums;

namespace SmartGrid.Application.Features.ManualLogs.Queries
{
    public record ManualLogDto(
        string Id,
        string SmartMeterId,
        double HighTariffValue,
        double LowTariffValue,
        string ImageUrl,
        string Status
    );

    public record GetAllManualLogsQuery : IRequest<Result<IEnumerable<ManualLogDto>>>;

    internal class GetAllManualLogsHandler(
        IManualStateLogRepository repository,
        ILogger<GetAllManualLogsHandler> logger) : IRequestHandler<GetAllManualLogsQuery, Result<IEnumerable<ManualLogDto>>>
    {
        public async Task<Result<IEnumerable<ManualLogDto>>> Handle(GetAllManualLogsQuery request, CancellationToken ct)
        {
            try
            {
                var logs = await repository.GetAllAsync(ct);

                var dtos = logs.Select(l => new ManualLogDto(
                    l.Id.Value,
                    l.SmartMeterId.Value,
                    l.HighTariffValue,
                    l.LowTariffValue,
                    l.ImageUrl,
                    l.Status.ToString()
                ));

                return Result<IEnumerable<ManualLogDto>>.Success(dtos);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "[GetAllManualLogs] Error fetching manual logs.");
                return Result<IEnumerable<ManualLogDto>>.Failure("Failed to fetch manual logs.", ErrorType.Failure);
            }
        }
    }
}