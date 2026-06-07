using MediatR;
using Microsoft.Extensions.Logging;
using SmartGrid.Application.Interfaces;
using SmartGrid.Application.Interfaces.Messaging;
using SmartGrid.Application.Interfaces.Repositories;
using SmartGrid.Domain.Common;
using SmartGrid.Domain.Enums;

namespace SmartGrid.Application.Features.DeviceStatuses.Commands;

public record ExecuteMonitoringCommand : IRequest<Result>;

internal class ExecuteMonitoringHandler(
    IDeviceStatusRepository deviceStatusRepository,
    IAlertQueueService alertQueueService,
    IDeviceStatusQueueService deviceStatusQueueService,
    IParallelSettingsProvider parallelSettings,
    ILogger<ExecuteMonitoringHandler> logger,
    IDateTimeProvider dateTimeProvider
) : IRequestHandler<ExecuteMonitoringCommand, Result>
{
    public async Task<Result> Handle(ExecuteMonitoringCommand request, CancellationToken ct)
    {
        try
        {
            var statuses = await deviceStatusRepository.GetAllAsync(ct);

            var options = new ParallelOptions
            {
                MaxDegreeOfParallelism = parallelSettings.MaxDegreeOfParallelism,
                CancellationToken = ct
            };

            await Parallel.ForEachAsync(statuses, options, async (status, token) =>
            {
                try
                {
                    // Šalje status u queue (za SignalR / dashboard)
                    await deviceStatusQueueService.SendStatusUpdateAsync(status, token);

                    // Provjeri anomalije
                    var alert = status.GetCurrentAnomaly(dateTimeProvider.UtcNow);
                    if (alert != null)
                    {
                        logger.LogCritical(
                            "[MONITORING] Anomaly detected for meter {Id}: {Message}",
                            status.DeviceId.Value, alert.Message);

                        await alertQueueService.SendAlertAsync(alert, token);
                    }
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "[MONITORING] Failed processing for meter {Id}", status.DeviceId.Value);
                }
            });

            return Result.Success();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Monitoring cycle failed.");
            return Result.Failure("Critical monitoring failure.", ErrorType.Failure);
        }
    }
}