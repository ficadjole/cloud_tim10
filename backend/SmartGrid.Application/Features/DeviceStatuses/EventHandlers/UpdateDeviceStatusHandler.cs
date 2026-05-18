using MediatR;
using Microsoft.Extensions.Logging;
using SmartGrid.Application.Features.Telemetries.Events;
using SmartGrid.Application.Interfaces.Repositories;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace SmartGrid.Application.Features.DeviceStatuses.EventHandlers;

internal class UpdateDeviceStatusHandler(
        IDeviceRepository deviceRepository,
        ILogger<UpdateDeviceStatusHandler> logger) : INotificationHandler<TelemetryProcessedEvent>
{
    public async Task Handle(TelemetryProcessedEvent notification, CancellationToken ct)
    {
        var telemetry = notification.Telemetry;

        try
        {
            var device = await deviceRepository.GetWithStatusByIdAsync(
                telemetry.DeviceType,
                telemetry.SmartMeterId,
                ct);

            if (device is null)
            {
                logger.LogWarning("Cannot update status: Device {DeviceId} of type {DeviceType} not found.",
                    telemetry.SmartMeterId, telemetry.DeviceType);
                return;
            }

            device.ProcessTelemetry(telemetry);

            var anomalyAlert = device.Status.GetCurrentAnomaly(DateTime.UtcNow);

            if (anomalyAlert is not null)
            {
                logger.LogCritical("[CRITICAL ANOMALY DETECTED] Device: {DeviceId}. Message: {Message}",
                    telemetry.SmartMeterId, anomalyAlert.Message);

            }

            await deviceRepository.SaveStatusAsync(device.Status, ct);

            logger.LogInformation("Successfully updated status for device {DeviceId}.", telemetry.SmartMeterId);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error asynchronously updating status for device {DeviceId}", telemetry.SmartMeterId);
        }
    }
}