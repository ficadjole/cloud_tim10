using FluentValidation;
using MediatR;
using Microsoft.Extensions.Logging;
using SmartGrid.Application.Common.Validators;
using SmartGrid.Application.Interfaces.Repositories;
using SmartGrid.Domain.Common;
using SmartGrid.Domain.Enums;
using SmartGrid.Domain.ValueObjects;
using UserService.DTOs;

namespace SmartGrid.Application.Features.Users.Commands
{
    // COMMAND
    public record UpdateUserCommand : IRequest<Result<UserDto>>
    {
        public string Id { get; init; } = string.Empty;
        public string FirstName { get; init; } = string.Empty;
        public string LastName { get; init; } = string.Empty;
        public string PhoneNumber { get; init; } = string.Empty;
        public string Email { get; init; } = string.Empty;
        public UserRoles Role { get; init; } = UserRoles.User;
    }

    // VALIDATOR
    public class UpdateUserValidator : AbstractValidator<UpdateUserCommand>
    {
        public UpdateUserValidator()
        {
            RuleFor(t => t.Id)
                .NotEmpty().WithMessage("User ID is required.");
            RuleFor(t => t.FirstName)
                .NotEmpty().WithMessage("First name is required.");
            RuleFor(t => t.LastName)
                .NotEmpty().WithMessage("Last name is required.");
            RuleFor(t => t.Email)
                .NotEmpty().WithMessage("Email is required.")
                .EmailAddress().WithMessage("Invalid email format.");
            RuleFor(t => t.PhoneNumber)
                .NotEmpty().WithMessage("Phone number is required.")
                .Matches(@"^\+?[1-9]\d{1,14}$").WithMessage("Invalid phone number format.");
            RuleFor(t => t.Role).IsValidUserRole();
        }
    }

    // HANDLER
    internal class UpdateUserHandler(
        IUserRepository userRepository,
        ILogger<UpdateUserHandler> logger) : IRequestHandler<UpdateUserCommand, Result<UserDto>>
    {
        public async Task<Result<UserDto>> Handle(UpdateUserCommand request, CancellationToken ct)
        {

            var entityId = EntityId.Create(request.Id);

            if (entityId.IsFailure)
                return Result<UserDto>.Failure("Id not good format", ErrorType.Failure);

            var existingUser = await userRepository.GetByIdAsync(entityId.Value, ct);

            if (existingUser == null)
                return Result<UserDto>.Failure("User not found.", ErrorType.NotFound);

            var updateResult = existingUser.Update(
                request.FirstName,
                request.LastName,
                request.Email,
                request.PhoneNumber,
                request.Role
            );

            if (updateResult.IsFailure)
                return Result<UserDto>.Failure(updateResult.Error!.Message, ErrorType.Validation);

            try
            {
                await userRepository.UpdateAsync(existingUser, ct);
                logger.LogInformation("User {UserId} updated successfully.", existingUser.Id);

                var userDto = new UserDto()
                {
                    Id = existingUser.Id.ToString(),
                    Name = existingUser.GetFullName(),
                    Email = existingUser.Email,
                    Role = existingUser.Role.ToString(),
                    PhoneNumber = existingUser.PhoneNumber,
                    AccountStatus = existingUser.AccountStatus.ToString()
                };

                return Result<UserDto>.Success(userDto);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error while updating user {UserId}.", request.Id);
                return Result<UserDto>.Failure("Failed to update user.", ErrorType.Failure);
            }
        }
    }
}