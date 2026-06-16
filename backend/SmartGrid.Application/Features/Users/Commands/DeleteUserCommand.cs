using FluentValidation;
using MediatR;
using Microsoft.Extensions.Logging;
using SmartGrid.Application.Interfaces.Repositories;
using SmartGrid.Domain.Common;
using SmartGrid.Domain.Enums;
using SmartGrid.Domain.ValueObjects;

namespace SmartGrid.Application.Features.Users.Commands
{
    // COMMAND
    public record DeleteUserCommand : IRequest<Result>
    {
        public string Id { get; init; } = string.Empty;
    }

    // VALIDATOR
    public class DeleteUserValidator : AbstractValidator<DeleteUserCommand>
    {
        public DeleteUserValidator()
        {
            RuleFor(t => t.Id)
                .NotEmpty().WithMessage("User ID is required.");
        }
    }

    // HANDLER
    internal class DeleteUserHandler(
        IUserRepository userRepository,
        ILogger<DeleteUserHandler> logger) : IRequestHandler<DeleteUserCommand, Result>
    {
        public async Task<Result> Handle(DeleteUserCommand request, CancellationToken ct)
        {
            var entityId = EntityId.Create(request.Id);

            if (entityId.IsFailure)
                return Result.Failure("ID format is bad", ErrorType.Validation);

            var existingUser = await userRepository.GetByIdAsync(entityId.Value, ct);

            if (existingUser == null)
                return Result.Failure("User not found.", ErrorType.NotFound);

            try
            {
                await userRepository.DeleteAsync(entityId.Value, ct);
                logger.LogInformation("User {UserId} deleted successfully.", entityId.Value);
                return Result.Success();
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error while deleting user {UserId}.", entityId.Value);
                return Result.Failure("Failed to delete user.", ErrorType.Failure);
            }
        }
    }
}