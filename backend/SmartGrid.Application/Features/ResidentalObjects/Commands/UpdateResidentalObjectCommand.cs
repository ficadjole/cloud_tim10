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

namespace SmartGrid.Application.Features.ResidentalObjects.Commands
{
    //COMMAND
    public record UpdateResidentalObjectCommand : IRequest<Result>
    {
        public string Id { get; init; } = string.Empty;
        public string Name { get; init; } = string.Empty;
        public ObjectType Type { get; init; }
        public string Street { get; init; } = string.Empty;
        public string Number {  get; init; } = string.Empty;
        public string City {  get; init; } = string.Empty;
        public string? Description {  get; init; }
    }

    //VALIDATOR
    public class UpdateResidentalObjectValidator : AbstractValidator<UpdateResidentalObjectCommand>
    {
        public UpdateResidentalObjectValidator()
        {
            RuleFor(x => x.Id).NotEmpty().WithMessage("Object ID is required.");
            RuleFor(x => x.Name).NotEmpty().WithMessage("Name is required.").MaximumLength(100).WithMessage("Name is too long");
            RuleFor(x => x.City).NotEmpty().WithMessage("City is required.");
            RuleFor(x => x.Street).NotEmpty().WithMessage("Street is required.");
            RuleFor(x => x.Number).NotEmpty().WithMessage("Number is required");
            RuleFor(x => x.Type).IsInEnum().WithMessage("Please select a valid object type.");
        }
    }

    //HANDLER
    internal class UpdateResidentalObjectHandler(
        IResidentalObjectRepository residentalObjectRepository,
        ILogger<UpdateResidentalObjectHandler> logger) : IRequestHandler<UpdateResidentalObjectCommand, Result>
    {
        public async Task<Result> Handle(UpdateResidentalObjectCommand request, CancellationToken cancellationToken)
        {
            try
            {
                var idResult = EntityId.Create(request.Id);
                if (idResult.IsFailure)
                    return Result.Failure("Invalid object ID format", ErrorType.Validation);

                var residentalObject = await residentalObjectRepository.GetByIdAsync(idResult.Value, cancellationToken);
                if (residentalObject == null)
                    return Result.Failure($"Residental object with ID {request.Id} not found.", ErrorType.NotFound);

                var basicInfoResult = residentalObject.UpdateBasicInfo(request.Name, request.Type, request.Description);
                if (basicInfoResult.IsFailure) return basicInfoResult;

                var addressResult = residentalObject.UpdateAddress(request.Street, request.Number, request.City);
                if (addressResult.IsFailure) return addressResult;

                await residentalObjectRepository.UpdateAsync(residentalObject, cancellationToken);

                logger.LogInformation("Residental object {Id} updated successfully.", request.Id);

                return Result.Success();
             } catch (Exception ex)
            {
                logger.LogError(ex, "Error occured while updating residental object {Id}", request.Id);
                return Result.Failure("An unexpected error occured during the update.", ErrorType.Failure);
            }
        }
    }
}
