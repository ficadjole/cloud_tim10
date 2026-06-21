using FluentValidation;
using MediatR;
using Microsoft.Extensions.Logging;
using SmartGrid.Application.Interfaces.Repositories;
using SmartGrid.Domain.Common;
using SmartGrid.Domain.Enums;
using SmartGrid.Domain.Models;
using SmartGrid.Domain.ValueObjects;

namespace SmartGrid.Application.Features.ManualLogs.Commands
{
    public record ApproveManualLog : IRequest<Result>
    {
        public string LogId { get; init; } = string.Empty;
    }

    public class ApproveManualLogValidator : AbstractValidator<ApproveManualLog>
    {
        public ApproveManualLogValidator()
        {
            RuleFor(l => l.LogId)
                .NotEmpty();
        }
    }

    internal class ApproveManualLogHandler(
        IManualStateLogRepository repository,
        ITelemetryRepository telemetryRepository,
        ISmartMeterRepository smartMeterRepository,
        ILogger<ApproveManualLogHandler> logger) : IRequestHandler<ApproveManualLog, Result>
    {
        public async Task<Result> Handle(ApproveManualLog request, CancellationToken ct)
        {
            try
            {
                var entityId = EntityId.Create(request.LogId);
                if (entityId.IsFailure)
                {
                    return Result.Failure(entityId.Error!.Message, entityId.Error.Type);
                }

                var manualLog = await repository.GetById(entityId.Value, ct);

                if (manualLog == null)
                {
                    return Result.Failure($"Manual log with id {request.LogId} not found", ErrorType.NotFound);
                }

                manualLog.MarkAsProcessed();

                var smartMeter = await smartMeterRepository.GetByIdAsync(manualLog.SmartMeterId, ct);
                if (smartMeter == null)
                {
                    return Result.Failure($"Smart meter with id {manualLog.SmartMeterId.Value} not found", ErrorType.NotFound);
                }

                var latestTelemetry = await telemetryRepository.GetLatestAsync(manualLog.SmartMeterId.Value, ct);
                var deviceType = smartMeter.ConnectionType == ConnectionType.MultiPhase ? DeviceType.MultiPhase : DeviceType.SinglePhase;
                var approvedAt = DateTime.UtcNow;
                var totalConsumptionKWh = manualLog.HighTariffValue + manualLog.LowTariffValue;

                if (latestTelemetry == null)
                {
                    var baselineResult = Telemetry.Create(
                        manualLog.SmartMeterId.Value,
                        deviceType,
                        approvedAt.AddSeconds(-1),
                        0,
                        0,
                        230,
                        0,
                        1,
                        deviceType == DeviceType.MultiPhase ? 230 : null,
                        deviceType == DeviceType.MultiPhase ? 230 : null,
                        deviceType == DeviceType.MultiPhase ? 0 : null,
                        deviceType == DeviceType.MultiPhase ? 0 : null,
                        deviceType == DeviceType.MultiPhase ? 1 : null,
                        deviceType == DeviceType.MultiPhase ? 1 : null);

                    if (baselineResult.IsFailure)
                    {
                        return Result.Failure(baselineResult.Error!.Message, baselineResult.Error.Type);
                    }

                    await telemetryRepository.SaveAsync(baselineResult.Value, ct);
                }

                var telemetryResult = Telemetry.Create(
                    manualLog.SmartMeterId.Value,
                    deviceType,
                    approvedAt,
                    totalConsumptionKWh,
                    latestTelemetry?.CurrentLoadKW ?? 0,
                    latestTelemetry?.VoltageL1 ?? 230,
                    latestTelemetry?.CurrentL1 ?? 0,
                    latestTelemetry?.PowerFactorL1 ?? 1,
                    deviceType == DeviceType.MultiPhase ? latestTelemetry?.VoltageL2 ?? 230 : null,
                    deviceType == DeviceType.MultiPhase ? latestTelemetry?.VoltageL3 ?? 230 : null,
                    deviceType == DeviceType.MultiPhase ? latestTelemetry?.CurrentL2 ?? 0 : null,
                    deviceType == DeviceType.MultiPhase ? latestTelemetry?.CurrentL3 ?? 0 : null,
                    deviceType == DeviceType.MultiPhase ? latestTelemetry?.PowerFactorL2 ?? 1 : null,
                    deviceType == DeviceType.MultiPhase ? latestTelemetry?.PowerFactorL3 ?? 1 : null);

                if (telemetryResult.IsFailure)
                {
                    return Result.Failure(telemetryResult.Error!.Message, telemetryResult.Error.Type);
                }

                await telemetryRepository.SaveAsync(telemetryResult.Value, ct);

                await repository.UpdateStatusAsync(manualLog, ct);
                logger.LogInformation("[ApproveManualLog] Manual log with id {LogId} approved successfully", request.LogId);

                return Result.Success();
            }
            catch (InvalidOperationException ex)
            {
                return Result.Failure(ex.Message, ErrorType.Validation);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "[ApproveManualLog] An error occurred while approving manual log with id {LogId}", request.LogId);
                return Result.Failure("An unexpected error occurred while approving the manual log", ErrorType.Unexpected);
            }
        }
    }
}
