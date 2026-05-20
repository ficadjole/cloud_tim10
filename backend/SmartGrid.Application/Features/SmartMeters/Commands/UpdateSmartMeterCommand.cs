using FluentValidation;
using MediatR;
using Microsoft.Extensions.Logging;
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
        public double? LimitValue { get; init; }
        public LimitType? LimitType { get; init; }
    }

    //VALIDATOR
    public class UpdateSmartMeterValidator : AbstractValidator<UpdateSmartMeterCommand>
    {
        public UpdateSmartMeterValidator()
        {
            RuleFor(x => x.Id).NotEmpty().WithMessage("Meter ID is required.");
            RuleFor(x => x.ConnectionType).NotEqual(ConnectionType.Unknown).WithMessage("Please select a valid connection type.");
            RuleFor(x => x.Note).MaximumLength(500).WithMessage("Note cannot exceed 500 characters.");

            When(x => x.LimitValue.HasValue, () => {
                RuleFor(x => x.LimitValue).GreaterThan(0).WithMessage("Limit value must be positive.");
                RuleFor(x => x.LimitType).IsInEnum().WithMessage("Invalid limit type.");
            });
        }
    }

    //HANDLER
    internal class UpdateSmartMeterHandler(
        ISmartMeterRepository smartMeterRepository,
        ILogger<UpdateSmartMeterHandler> logger) : IRequestHandler<UpdateSmartMeterCommand, Result>
    {
        public async Task<Result> Handle(UpdateSmartMeterCommand request, CancellationToken cancellationToken)
        {
            try
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

                if (request.LimitValue.HasValue && request.LimitType.HasValue)
                {
                    var limitResult = meter.SetUserLimit(request.LimitValue.Value, request.LimitType.Value);
                    if (limitResult.IsFailure)
                        return limitResult; 
                }

                await smartMeterRepository.UpdateAsync(meter, cancellationToken);
                logger.LogInformation("Smart meter {Id} updated successfully.", request.Id);
                return Result.Success();
            } 
            catch (Exception ex)
            {
                logger.LogError(ex, "Error occurred while updating smart meter {Id}", request.Id);
                return Result.Failure("An unexpected error occurred during the update.", ErrorType.Failure);
            }
        }
    }
}
