using FluentValidation;
using MediatR;
using Microsoft.Extensions.Logging;
using SmartGrid.Application.Interfaces.Repositories;
using SmartGrid.Domain.Common;
using SmartGrid.Domain.Enums;
using SmartGrid.Domain.ValueObjects;
using UserService.DTOs;

namespace SmartGrid.Application.Features.Users.Commands
{
    // COMMAND
    public record UpdateUserStatusCommand : IRequest<Result<UserDto>>
    {
        public string Id { get; init; } = string.Empty;
        public UserAccountStatus AccountStatus { get; init; }
    }

    // VALIDATOR
    public class UpdateUserStatusValidator : AbstractValidator<UpdateUserStatusCommand>
    {
        public UpdateUserStatusValidator()
        {
            RuleFor(t => t.Id)
                .NotEmpty().WithMessage("User ID is required.");
            RuleFor(t => t.AccountStatus)
                .IsInEnum().WithMessage("Invalid account status.");
        }
    }

    // HANDLER
    internal class UpdateUserStatusHandler(
        IUserRepository userRepository,
        ILogger<UpdateUserStatusHandler> logger) : IRequestHandler<UpdateUserStatusCommand, Result<UserDto>>
    {
        public async Task<Result<UserDto>> Handle(UpdateUserStatusCommand request, CancellationToken ct)
        {
            var entityId = EntityId.Create(request.Id);

            if (entityId.IsFailure)
                return Result<UserDto>.Failure("ID not in a good format", ErrorType.Validation);

            var existingUser = await userRepository.GetByIdAsync(entityId.Value, ct);

            if (existingUser == null)
                return Result<UserDto>.Failure("User not found.", ErrorType.NotFound);

            try
            {
                existingUser.UpdateAccountStatus(request.AccountStatus);
            }
            catch (ArgumentException ex)
            {
                return Result<UserDto>.Failure(ex.Message, ErrorType.Validation);
            }

            try
            {
                await userRepository.UpdateAsync(existingUser, ct);
                logger.LogInformation("User {UserId} status updated to {AccountStatus}.", existingUser.Id, request.AccountStatus);

                var userDto = new UserDto()
                {
                    Id = existingUser.Id.ToString(),
                    Name = existingUser.GetFullName(),
                    Email = existingUser.Email,
                    Role = existingUser.Role.ToString()
                };

                return Result<UserDto>.Success(userDto);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error while updating status for user {UserId}.", request.Id);
                return Result<UserDto>.Failure("Failed to update user status.", ErrorType.Failure);
            }
        }
    }
}