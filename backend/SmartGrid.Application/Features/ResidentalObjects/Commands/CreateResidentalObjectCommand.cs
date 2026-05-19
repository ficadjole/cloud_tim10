using FluentValidation;
using MediatR;
using Microsoft.Extensions.Logging;
using SmartGrid.Application.Interfaces.Repositories;
using SmartGrid.Domain.Common;
using SmartGrid.Domain.Enums;
using SmartGrid.Domain.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SmartGrid.Application.Features.ResidentalObjects.Commands
{
    //COMMAND
    public record CreateResidentalObjectCommand : IRequest<Result<string>>
    {
        public string Name { get; init; } = string.Empty;
        public ObjectType Type {  get; init; }
        public string Street {  get; init; } = string.Empty;
        public string Number {  get; init; } = string.Empty;
        public string City { get; init; } = string.Empty;
        public string? Description { get; init; }
        public string OwnerId {  get; init; } = string.Empty;
    }

    //VALIDATOR 
    public class CreateResidentalObjectValidator : AbstractValidator<CreateResidentalObjectCommand>
    {
        public CreateResidentalObjectValidator()
        {
            RuleFor(x => x.Name).NotEmpty().WithMessage("Name is required");
            RuleFor(x => x.Type).NotEmpty().WithMessage("Type (House, Apartment, Cottage) is required");
            RuleFor(x => x.City).NotEmpty().WithMessage("City is required.");
            RuleFor(x => x.Street).NotEmpty().WithMessage("Street is required.");
            RuleFor(x => x.Number).NotEmpty().WithMessage("Number is required.");
            RuleFor(x => x.OwnerId).NotEmpty().WithMessage("Owner ID is required");
        }
    }

    //HANDLER
    internal class CreateResidentalObjectHandler(
        IResidentalObjectRepository residentalObjectRepository,
        ILogger<CreateResidentalObjectHandler> logger) : IRequestHandler<CreateResidentalObjectCommand, Result<string>>
    {
        public async Task<Result<string>> Handle(CreateResidentalObjectCommand request, CancellationToken cancellationToken)
        {
            try
            {
                var residentalResult = ResidentalObject.Create(
                    request.Name,
                    request.Type,
                    request.Street,
                    request.Number,
                    request.City,
                    request.Description,
                    request.OwnerId);

                if (residentalResult.IsFailure)
                {
                    return Result<string>.Failure(residentalResult.Error!.Message, ErrorType.Validation);
                }

                var residentalObject = residentalResult.Value;

                await residentalObjectRepository.AddAsync(residentalObject);

                logger.LogInformation("Residental object Name} created successfully with ID {Id}",
                    residentalObject.Name, residentalObject.Id.Value);

                return Result<string>.Success(residentalObject.Id.Value);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error occured while creating residental object for owner {OwnerId}", request.OwnerId);
                return Result<string>.Failure("An unexpected error occured while creating the object.", ErrorType.Failure);
            }
        }
    }
}
