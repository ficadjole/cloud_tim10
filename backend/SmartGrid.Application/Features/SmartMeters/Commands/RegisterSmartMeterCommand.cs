using FluentValidation;
using MediatR;
using Microsoft.Extensions.Logging;
using SmartGrid.Application.Interfaces.Repositories;
using SmartGrid.Domain.Common;
using SmartGrid.Domain.Enums;
using SmartGrid.Domain.Models;
using SmartGrid.Domain.ValueObjects;

namespace SmartGrid.Application.Features.SmartMeters.Commands
{
    //COMMAND
    public record RegisterSmartMeterCommand : IRequest<Result>
    {
        public string ResidentalObjectId { get; init; } = string.Empty;
        public string SerialNumber { get; init; } = string.Empty;
        public ConnectionType ConnectionType { get; init; }
        public string? Note { get; init; }
    }

    //VALIDATOR
    public class RegisterSmartMeterValidator : AbstractValidator<RegisterSmartMeterCommand>
    {
        public RegisterSmartMeterValidator()
        {
            RuleFor(x => x.ResidentalObjectId).NotEmpty().WithMessage("Object ID is required.");
            RuleFor(x => x.SerialNumber).Matches(@"^SM-\d{4}-\d{5}$").WithMessage("Format must be SM-YYYY-XXXXX");
            RuleFor(x => x.ConnectionType).NotEqual(ConnectionType.Unknown).WithMessage("Please select a connection type.");
        }
    }

    //HANDLER
    internal class RegisterSmartMeterHandler(
        IResidentalObjectRepository residentalObjectRepository,
        ISmartMeterRepository smartMeterRepository,
        ILogger<RegisterSmartMeterHandler> logger) : IRequestHandler<RegisterSmartMeterCommand, Result>
    {
        public async Task<Result> Handle(RegisterSmartMeterCommand request, CancellationToken cancellationToken)
        {
            try
            {
                var idResult = EntityId.Create(request.ResidentalObjectId);
                if (idResult.IsFailure) return Result.Failure("Invalid object ID format.", ErrorType.Validation);

                var residentalObject = await residentalObjectRepository.GetByIdAsync(idResult.Value, cancellationToken);
                if (residentalObject == null)
                    return Result.Failure("Residental object not found.", ErrorType.NotFound);

                if (residentalObject.Meters.Any(m => m.SerialNumber.Value == request.SerialNumber))
                    return Result.Failure("This meter is already connected to this object.", ErrorType.Conflict);

                var meterResult = SmartMeter.Create(request.SerialNumber, request.ConnectionType, request.Note);
                if (meterResult.IsFailure) return meterResult;

                var meter = meterResult.Value;

                meter.AssignToResidentalObject(idResult.Value);

                var connectResult = residentalObject.ConnectMeter(meter);
                if (connectResult.IsFailure) return connectResult;

                await smartMeterRepository.AddAsync(meter, cancellationToken);
                await residentalObjectRepository.UpdateAsync(residentalObject, cancellationToken);

                logger.LogInformation("Smart meter {Serial} registered and connected to object {ObjectId}", request.SerialNumber, request.ResidentalObjectId);
                return Result.Success();
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error occurred during smart meter registration for object {ObjectId}", request.ResidentalObjectId);
                return Result.Failure("An unexpected error occurred during registration.", ErrorType.Failure);
            }
        }
    }
}
