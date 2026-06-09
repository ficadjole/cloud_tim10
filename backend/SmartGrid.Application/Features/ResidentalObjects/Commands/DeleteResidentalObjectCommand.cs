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
    public record DeleteResidentalObjectCommand : IRequest<Result>
    {
        public string Id { get; init; } = string.Empty;
    }

    public class DeleteResidentalObjectValidator : AbstractValidator<DeleteResidentalObjectCommand>
    {
        public DeleteResidentalObjectValidator()
        {
            RuleFor(x => x.Id).NotEmpty().WithMessage("Object ID is required.");
        }
    }

    internal class DeleteResidentalObjectHandler(
        IResidentalObjectRepository residentalObjectRepository, ILogger<DeleteResidentalObjectHandler> logger) : IRequestHandler<DeleteResidentalObjectCommand, Result>
    {
        public async Task<Result> Handle(DeleteResidentalObjectCommand request, CancellationToken cancellationToken)
        {
            var idResult = EntityId.Create(request.Id);

            if (idResult.IsFailure)
                return Result.Failure("Invalid object ID format", ErrorType.Validation);

            var residentalObject = await residentalObjectRepository.GetByIdAsync(idResult.Value, cancellationToken);

            if (residentalObject == null)
                return Result.Failure($"Residental object with ID {request.Id} not found.", ErrorType.NotFound);

            await residentalObjectRepository.DeleteAsync(residentalObject.Id, cancellationToken);

            return Result.Success();
        }
    }
}
