using MediatR;
using Microsoft.Extensions.Logging;
using SmartGrid.Application.Features.Telemetries.Events;
using SmartGrid.Application.Interfaces;
using SmartGrid.Application.Interfaces.Messaging;
using SmartGrid.Application.Interfaces.Repositories;
using SmartGrid.Domain.Enums;
using SmartGrid.Domain.ValueObjects;

namespace SmartGrid.Application.Features.Telemetries.Handlers
{
    internal class CheckUserLimitOnTelemetryProcessed(
        ISmartMeterRepository smartMeterRepository,
        IEmailService emailService,
        IAlertQueueService alertQueueService,
        IResidentalObjectRepository residentalObjectRepository,
        IUserRepository userRepository,
        ILogger<CheckUserLimitOnTelemetryProcessed> logger)
        : INotificationHandler<TelemetryProcessedEvent>
    {
        public async Task Handle(TelemetryProcessedEvent notification, CancellationToken ct)
        {
            var telemetry = notification.Telemetry;

            var smartMeterResult = await smartMeterRepository.GetByIdAsync(telemetry.SmartMeterId);

            if (smartMeterResult == null || smartMeterResult.UserLimit == null)
            {
                logger.LogInformation(
                    "[LIMIT] No user limit set for smart meter {MeterId} or smart meter not found. Skipping limit check.",
                    telemetry.SmartMeterId.Value);
                return;
            }


            var meter = smartMeterResult;
            var limit = meter.UserLimit;

            bool isLimitExceeded = false;

            if (limit.Type == LimitType.kWh)
            {
                isLimitExceeded = telemetry.TotalConsumptionKWh > limit.Value;
            }
            else if (limit.Type == LimitType.RSD)
            {
                double fixedPrice = 10.0; // ne znam sta drugo da stavim
                double currentConsumptionInRSD = telemetry.TotalConsumptionKWh * fixedPrice;

                isLimitExceeded = currentConsumptionInRSD > limit.Value;
            }

            if (isLimitExceeded)
            {
                if (!meter.ShouldSendAlert())
                {
                    logger.LogInformation(
                        "[LIMIT] Smart meter {MeterId} exceeded limit, but notification email for this month has already been sent.",
                        meter.Id.Value);
                    return;
                }

                logger.LogWarning("[LIMIT] Limit exceeded for smart meter {MeterId}! Initiating email dispatch...", meter.Id.Value);

                var residentalObject = await residentalObjectRepository.GetByMeterIdAsync(telemetry.SmartMeterId);

                if (residentalObject == null)
                {
                    logger.LogError("[LIMIT] No residental object found for smart meter {MeterId}. Cannot retrieve user information for email notification.", telemetry.SmartMeterId.Value);
                    return;
                }

                var user = await userRepository.GetByIdAsync(residentalObject.OwnerId);

                string emailTo = user.Email;
                string subject = "Warning: Consumption Limit Exceeded!";
                string body = $"Dear customer, your accumulated consumption has exceeded your configured limit of {limit.Value} {limit.Type}.";

                try
                {
                    await emailService.SendWarningAsync(emailTo, subject, body);

                    meter.MarkAlertAsSent();
                    await smartMeterRepository.UpdateAsync(meter);

                    logger.LogInformation("[LIMIT] Alert notification successfully sent and database updated.");
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "[LIMIT] Error sending email notification for smart meter {MeterId}.", meter.Id.Value);
                }

                string alertText = $"Smart meter {meter.Id.Value} has exceeded the consumption limit!";
                var alertResult = Alert.Create(meter.Id.Value, AlertType.Warning, alertText);

                if (alertResult.IsSuccess)
                {
                    await alertQueueService.SendAlertAsync(alertResult.Value, ct);
                }
                else
                {
                    logger.LogError("[LIMIT] Failed to create Alert object: {Error}", alertResult.Error!.Message);
                }
            }
        }
    }
}