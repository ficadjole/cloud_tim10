using MediatR;
using Microsoft.Extensions.Logging;
using SmartGrid.Application.Interfaces.Repositories;
using SmartGrid.Domain.Common;
using SmartGrid.Domain.Enums;

namespace SmartGrid.Application.Features.Alerts.Queries
{
    public record AlertDto(
    string DeviceId,
    string AlertType,
    string Message,
    DateTime Timestamp
);

    public record GetRecentAlertsQuery(int Count = 20) : IRequest<Result<IEnumerable<AlertDto>>>;

    internal class GetRecentAlertsHandler(
        IAlertRepository alertRepository,
        ILogger<GetRecentAlertsHandler> logger
    ) : IRequestHandler<GetRecentAlertsQuery, Result<IEnumerable<AlertDto>>>
    {
        public async Task<Result<IEnumerable<AlertDto>>> Handle(GetRecentAlertsQuery request, CancellationToken ct)
        {
            try
            {
                var alerts = await alertRepository.GetRecentAsync(request.Count, ct);
                var dtos = alerts.Select(a => new AlertDto(
                    a.DeviceId.Value,
                    a.AlertType.ToString(),
                    a.Message.Value,
                    a.Timestamp
                ));
                return Result<IEnumerable<AlertDto>>.Success(dtos);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error retrieving recent alerts.");
                return Result<IEnumerable<AlertDto>>.Failure("Failed to retrieve alerts.", ErrorType.Failure);
            }
        }
    }
}
