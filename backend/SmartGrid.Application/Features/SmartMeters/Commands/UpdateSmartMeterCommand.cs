using FluentValidation;
using MediatR;
using SmartGrid.Application.Interfaces.Repositories;
using SmartGrid.Domain.Common;
using SmartGrid.Domain.Enums;
using SmartGrid.Domain.ValueObjects;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SmartGrid.Application.Features.SmartMeters.Commands
{
    //COMMAND
    public record UpdateSmartMeterCommand : IRequest<Result>
    {
        public string Id { get; init; } = string.Empty;
        public ConnectionType ConnectionType { get; init; }
        public string? Note { get; init; }
    }

    //VALIDATOR
    public class UpdateSmartMeterValidator : AbstractValidator<UpdateSmartMeterCommand>
    {
        public UpdateSmartMeterValidator()
        {
            RuleFor(x => x.Id).NotEmpty().WithMessage("Meter ID is required.");
            RuleFor(x => x.ConnectionType).NotEqual(ConnectionType.Unknown).WithMessage("Please select a valid connection type.");
            RuleFor(x => x.Note).MaximumLength(500).WithMessage("Note cannot exceed 500 characters.");
        }
    }

    //HANDLER
    internal class UpdateSmartMeterHandler(
        ISmartMeterRepository smartMeterRepository) : IRequestHandler<UpdateSmartMeterCommand, Result>
    {
        public async Task<Result> Handle(UpdateSmartMeterCommand request, CancellationToken cancellationToken)
        {
            var idResult = EntityId.Create(request.Id);
            if (idResult.IsFailure) 
                return Result.Failure("Invalid ID format", ErrorType.Validation);

            var meter = await smartMeterRepository.GetByIdAsync(idResult.Value, cancellationToken);
            if(meter == null)
                return Result.Failure("Smart meter not found.", ErrorType.NotFound);

            meter.UpdateNote(request.Note);

            var updateResult = meter.UpdateConnectionType(request.ConnectionType);
            if(updateResult.IsFailure) return updateResult;

            await smartMeterRepository.UpdateAsync(meter, cancellationToken);
            return Result.Success();
        }
    }
}
