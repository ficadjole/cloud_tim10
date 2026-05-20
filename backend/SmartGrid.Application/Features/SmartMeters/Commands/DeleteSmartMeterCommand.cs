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
    public record DeleteSmartMeterCommand(string Id) : IRequest<Result>;

    //VALIDATOR
    public class DeleteSmartMeterValidator : AbstractValidator<DeleteSmartMeterCommand>
    {
        public DeleteSmartMeterValidator()
        {
            RuleFor(x => x.Id).NotEmpty().WithMessage("Meter ID is required.");
        }
    }

    //HANDLER
    internal class DeleteSmartMeterHandler(
        ISmartMeterRepository smartMeterRepository,
        IResidentalObjectRepository residentalObjectRepository,
        ILogger<DeleteSmartMeterHandler> logger) : IRequestHandler<DeleteSmartMeterCommand, Result>
    {
        public async Task<Result> Handle(DeleteSmartMeterCommand request, CancellationToken cancellationToken)
        {
            try
            {
                var idResult = EntityId.Create(request.Id);
                if (idResult.IsFailure)
                    return Result.Failure("Invalid ID format", ErrorType.Validation);

                var meter = await smartMeterRepository.GetByIdAsync(idResult.Value, cancellationToken);
                if (meter == null)
                    return Result.Failure("Smart meter not found.", ErrorType.NotFound);

                var residentalObject = await residentalObjectRepository.GetByMeterIdAsync(idResult.Value, cancellationToken);
                if(residentalObject != null)
                {
                    residentalObject.DisconnectMeter();
                    await residentalObjectRepository.UpdateAsync(residentalObject, cancellationToken);
                }

                await smartMeterRepository.DeleteAsync(idResult.Value, cancellationToken);

                logger.LogInformation("Smart meter {Id} deleted and disconnected from its object.", request.Id);
                return Result.Success();
            } 
            catch (Exception ex)
            {
                logger.LogError(ex, "Error occurred while deleting smart meter {Id}", request.Id);
                return Result.Failure("An unexpected error occurred during delete.", ErrorType.Failure);
            }
        }
    }

}
