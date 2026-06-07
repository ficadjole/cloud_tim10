using MediatR;
using Microsoft.Extensions.Logging;
using SmartGrid.Application.Features.Telemetries.Events;
using SmartGrid.Application.Interfaces;
using SmartGrid.Application.Interfaces.Messaging;
using SmartGrid.Application.Interfaces.Repositories;
using SmartGrid.Domain.Models;

namespace SmartGrid.Application.Features.DeviceStatuses.EventHandlers
{
    internal class UpdateDeviceStatusHandler(
        IDeviceStatusRepository deviceStatusRepository,
        IAlertQueueService alertQueueService,
        IDateTimeProvider dateTimeProvider,
        ILogger<UpdateDeviceStatusHandler> logger)
        : INotificationHandler<TelemetryProcessedEvent>
    {
        public async Task Handle(TelemetryProcessedEvent notification, CancellationToken ct)
        {
            var telemetry = notification.Telemetry;

            var status = await deviceStatusRepository.GetByIdAsync(
                telemetry.DeviceType, telemetry.SmartMeterId, ct)
                ?? DeviceStatus.CreateDefault(
                    telemetry.SmartMeterId,
                    telemetry.DeviceType,
                    dateTimeProvider.UtcNow);

            status.UpdateTelemetry(telemetry);

            var anomaly = status.GetCurrentAnomaly(dateTimeProvider.UtcNow);
            if (anomaly is not null)
            {
                logger.LogCritical("[ANOMALY] Meter {MeterId}: {Message}",
                    telemetry.SmartMeterId, anomaly.Message);
                await alertQueueService.SendAlertAsync(anomaly, ct);
            }

            await deviceStatusRepository.SaveAsync(status, ct);

            logger.LogInformation("[STATUS] Updated status for meter {MeterId}.",
                telemetry.SmartMeterId);
        }
    }
}