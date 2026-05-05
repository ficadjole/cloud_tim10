using FluentValidation;
using MediatR;
using Microsoft.Extensions.Logging;
using SmartGrid.Application.Common.Validators;
using SmartGrid.Application.Features.Telemetries.Events;
using SmartGrid.Application.Interfaces.Repositories;
using SmartGrid.Domain.Common;
using SmartGrid.Domain.Enums;
using SmartGrid.Domain.Models;

namespace SmartGrid.Application.Features.Telemetries.Commands
{
    // COMMAND
    public record ProcessTelemetryCommand : IRequest<Result>
    {
        public string SmartMeterId { get; init; } = string.Empty;
        public string DeviceToken { get; init; } = string.Empty;
        public DeviceType DeviceType { get; init; }

        public DateTime Timestamp { get; init; }
        public double TotalConsumptionKWh { get; init; }
        public double CurrentLoadKW { get; init; }

        public double VoltageL1 { get; init; }
        public double? VoltageL2 { get; init; }
        public double? VoltageL3 { get; init; }

        public double CurrentL1 { get; init; }
        public double? CurrentL2 { get; init; }
        public double? CurrentL3 { get; init; }

        public double PowerFactorL1 { get; init; }
        public double? PowerFactorL2 { get; init; }
        public double? PowerFactorL3 { get; init; }
    }

    // VALIDATOR
    public class ProcessTelemetryValidator : AbstractValidator<ProcessTelemetryCommand>
    {
        public ProcessTelemetryValidator()
        {
            RuleFor(t => t.SmartMeterId)
                .NotEmpty();

            RuleFor(t => t.DeviceToken)
                .NotEmpty();

            RuleFor(t => t.TotalConsumptionKWh)
                .GreaterThanOrEqualTo(0);

            RuleFor(t => t.CurrentLoadKW)
                .GreaterThanOrEqualTo(0);

            RuleFor(t => t.VoltageL1)
                .InclusiveBetween(0, 300);

            RuleFor(t => t.CurrentL1)
                .GreaterThanOrEqualTo(0);

            RuleFor(t => t.PowerFactorL1)
                .InclusiveBetween(0, 1);

            RuleFor(t => t.Timestamp)
                .LessThanOrEqualTo(DateTime.UtcNow);

            When(t => t.DeviceType == DeviceType.MultiPhase, () =>
            {
                RuleFor(t => t.VoltageL2).NotNull();
                RuleFor(t => t.VoltageL3).NotNull();

                RuleFor(t => t.CurrentL2).NotNull();
                RuleFor(t => t.CurrentL3).NotNull();

                RuleFor(t => t.PowerFactorL2).NotNull();
                RuleFor(t => t.PowerFactorL3).NotNull();
            });
        }
    }

    // HANDLER
    internal class ProcessTelemetryHandler(
    ITelemetryRepository telemetryRepository,
    IMediator mediator,
    ILogger<ProcessTelemetryHandler> logger)
    : IRequestHandler<ProcessTelemetryCommand, Result>
    {
        public async Task<Result> Handle(ProcessTelemetryCommand request, CancellationToken ct)
        {
            //moram dodati ovo za token dok provjerim kako tacno to ide 
            var telemetryResult = Telemetry.Create(
                request.SmartMeterId,       
                request.DeviceType,
                request.Timestamp,
                request.TotalConsumptionKWh,
                request.CurrentLoadKW,       
                request.VoltageL1,          
                request.CurrentL1,           
                request.VoltageL2,           
                request.VoltageL3,           
                request.CurrentL2,       
                request.CurrentL3         
            );

            if (telemetryResult.IsFailure)
                return Result.Failure(telemetryResult.Error!.Message, ErrorType.Validation);

            var telemetry = telemetryResult.Value;

            await telemetryRepository.SaveAsync(telemetry, ct);

            await mediator.Publish(new TelemetryProcessedEvent(telemetry), ct);

            logger.LogInformation(
                "[TELEMETRY] Saved for Device: {DeviceId}",
                telemetry.SmartMeterId);

            return Result.Success();
        }
    }
}
