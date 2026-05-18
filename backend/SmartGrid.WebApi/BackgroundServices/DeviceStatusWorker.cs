using Microsoft.AspNetCore.SignalR;
using SmartGrid.Application.Interfaces;
using SmartGrid.Application.Interfaces.Messaging;
using SmartGrid.Application.Interfaces.Repositories;
using SmartGrid.Domain.ValueObjects;
using SmartGrid.WebApi.Hubs;

namespace SmartGrid.WebApi.BackgroundServices
{
    internal class DeviceStatusWorker(
        IServiceProvider serviceProvider,
        IHubContext<DeviceHub> hubContext,
        ILogger<DeviceStatusWorker> logger) : BackgroundService
    {
        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            logger.LogInformation("[WORKER] Alert & Status Worker started listening...");

            while (!stoppingToken.IsCancellationRequested)
            {
                bool foundMessage = false;

                try
                {
                    using var scope = serviceProvider.CreateScope();

                    var alertQueueService = scope.ServiceProvider.GetRequiredService<IAlertQueueService>();
                    var alertRepository = scope.ServiceProvider.GetRequiredService<IAlertRepository>();


                    var message = await alertQueueService.ReceiveAlertAsync(stoppingToken);

                    if (message != null)
                    {
                        foundMessage = true;
                        var alert = message.Body; 

                        logger.LogInformation("[WORKER] Received alert for device: {DeviceId} - Type: {Type}",
                            alert.DeviceId.Value, alert.AlertType);

                        await alertRepository.UpsertAsync(alert, stoppingToken);
                        logger.LogInformation("[WORKER] Alert successfully persisted to Table Storage.");

                        await hubContext.Clients.Group("Admins").SendAsync(
                            "ReceiveAlert",
                            new
                            {
                                deviceId = alert.DeviceId.Value,
                                alertType = alert.AlertType.ToString(),
                                message = alert.Message.Value,
                                timestamp = alert.Timestamp
                            },
                            stoppingToken);

                        await message.CompleteAsync();

                        logger.LogInformation("[WORKER] Alert broadcasted to Admins and message deleted from queue.");
                    }
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "[ERROR] Error processing alert queue.");
                }

                if (!foundMessage)
                {
                    await Task.Delay(2000, stoppingToken);
                }
            }
        }
    }
}