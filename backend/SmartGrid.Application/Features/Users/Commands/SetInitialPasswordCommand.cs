using FluentValidation;
using MediatR;
using Microsoft.Extensions.Logging;
using SmartGrid.Application.Interfaces;
using SmartGrid.Application.Interfaces.Repositories;
using SmartGrid.Domain.Common;
using SmartGrid.Domain.Enums;
using SmartGrid.Domain.ValueObjects;

namespace SmartGrid.Application.Features.Users.Commands
{
    //COMMAND
    public record SetInitialPasswordCommand : IRequest<Result<string>>
    {
        public string UserId { get; init; } = string.Empty;
        public string InitialPassword { get; init; } = string.Empty;
    }

    //VALIDATOR

    public class SetInitialPasswordValidator : AbstractValidator<SetInitialPasswordCommand>
    {
        public SetInitialPasswordValidator()
        {
            RuleFor(t => t.UserId)
                .NotEmpty().WithMessage("User ID is required.");
            RuleFor(t => t.InitialPassword)
                .NotEmpty().WithMessage("Initial password is required.")
                .MinimumLength(6).WithMessage("Initial password must be at least 6 characters long.");
        }
    }

    //HANDLER
    internal class SetInitialPasswordHandler(
        IUserRepository userRepository,
        IPasswordHasher passwordHasher,
        ILogger<SetInitialPasswordHandler> logger) : IRequestHandler<SetInitialPasswordCommand, Result<string>>
    {
        public async Task<Result<string>> Handle(SetInitialPasswordCommand request, CancellationToken ct)
        {

            var entityId = EntityId.Create(request.UserId);

            if (entityId.IsFailure)
                return Result<string>.Failure("Invalid User ID.", ErrorType.Validation);

            try
            {
                var user = await userRepository.GetByIdAsync(entityId.Value, ct);

                if (user == null)
                    return Result<string>.Failure("User not found.", ErrorType.NotFound);

                var hashedPassword = passwordHasher.HashPassword(request.InitialPassword);

                if (hashedPassword == null)
                    return Result<string>.Failure("Failed to hash the password.", ErrorType.Failure);

                user.UpdatePasswordHash(hashedPassword);
                user.UpdateAccountStatus(UserAccountStatus.Active);

                await userRepository.UpdateAsync(user);

                logger.LogInformation("Initial password set for user with ID: {UserId}", user.Id);

                return Result<string>.Success("Initial password set successfully.");

            }
            catch (Exception ex)
            {
                return Result<string>.Failure($"An error occurred while setting the initial password: {ex.Message}", ErrorType.Unexpected);
            }


        }
    }
}
