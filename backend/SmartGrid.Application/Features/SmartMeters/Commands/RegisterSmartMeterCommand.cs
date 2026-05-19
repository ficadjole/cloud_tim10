using FluentValidation;
using MediatR;
using SmartGrid.Application.Interfaces.Repositories;
using SmartGrid.Domain.Common;
using SmartGrid.Domain.Enums;
using SmartGrid.Domain.Models;
using SmartGrid.Domain.ValueObjects;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SmartGrid.Application.Features.SmartMeters.Commands
{
    //COMMAND
    public record RegisterSmartMeterCommand : IRequest<Result>
    {
        public string ResidentalObjectId { get; init; } = string.Empty;
        public string SerialNumber {  get; init; } = string.Empty;
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
        ISmartMeterRepository smartMeterRepository) : IRequestHandler<RegisterSmartMeterCommand, Result>
    {
        public async Task<Result> Handle(RegisterSmartMeterCommand request, CancellationToken cancellationToken)
        {
            var idResult = EntityId.Create(request.ResidentalObjectId);
            if (idResult.IsFailure) return Result.Failure("Invalid object ID format.", ErrorType.Validation);

            var residentalObject = await residentalObjectRepository.GetByIdAsync(idResult.Value, cancellationToken);
            if(residentalObject == null)
                return Result.Failure("Residental object not found.", ErrorType.NotFound);

            if(residentalObject.ConnectedMeter != null)
                return Result.Failure("This object already has a connected meter.", ErrorType.Conflict);

            var meterResult = SmartMeter.Create(request.SerialNumber, request.ConnectionType, request.Note);
            if(meterResult.IsFailure) return meterResult;

            var meter = meterResult.Value;

            var connectResult = residentalObject.ConnectMeter(meter);
            if(connectResult.IsFailure) return connectResult;

            await smartMeterRepository.AddAsync(meter, cancellationToken);
            await residentalObjectRepository.UpdateAsync(residentalObject, cancellationToken);

            return Result.Success();
        }
    }
}
