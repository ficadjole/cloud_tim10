//using MediatR;
//using Microsoft.Extensions.Logging;
//using SmartGrid.Application.Interfaces.Repositories;
//using SmartGrid.Domain.Common;
//using SmartGrid.Domain.Enums;
//using SmartGrid.Domain.ValueObjects;

//namespace SmartGrid.Application.Features.Alerts.Commands
//{
//    // COMMAND
//    public record ProcessAlertCommand(Alert Alert) : IRequest<Result>;

//    // HANDLER
//    internal class ProcessAlertHandler(
//        IAlertRepository alertRepository, 
//        ILogger<ProcessAlertHandler> logger)
//        : IRequestHandler<ProcessAlertCommand, Result>
//    {
//        public async Task<Result> Handle(ProcessAlertCommand request, CancellationToken ct)
//        {
//            var alert = request.Alert;
//            string logMsg = $"[ALARM] {alert.AlertType} on {alert.DeviceId}: {alert.Message}";

//            try
//            {
//                await alertRepository.UpsertAsync(alert, ct);
//                logger.LogInformation("[ALARM PR] Alert uspešno sačuvan u Azure Table Storage.");

//                // 2. SLANJE ADMINU PREKO SIGNALR-a (REAL-TIME)
//                // TODO: Ovde ćemo ubaciti tvoj SignalR Hub klijent/servis kada mi pošalješ kako se zove,
//                // npr: await _hubContext.Clients.All.SendAsync("ReceiveAlert", alert, ct);
//            }
//            catch (Exception ex)
//            {
//                logger.LogError(ex, "[ALARM PR] Error processing alert.");
//                return Result.Failure("Failed to process alert.", ErrorType.Failure);
//            }

//            if (alert.AlertType == AlertType.Critical)
//                logger.LogError(logMsg);
//            else
//                logger.LogWarning(logMsg);

//            return Result.Success();
//        }
//    }
//}