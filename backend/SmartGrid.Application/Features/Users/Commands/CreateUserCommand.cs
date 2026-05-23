using FluentValidation;
using MediatR;
using Microsoft.Extensions.Logging;
using SmartGrid.Application.Common.Validators;
using SmartGrid.Application.Interfaces;
using SmartGrid.Application.Interfaces.Messaging;
using SmartGrid.Application.Interfaces.Repositories;
using SmartGrid.Domain.Common;
using SmartGrid.Domain.Enums;
using SmartGrid.Domain.Models;
using System.Data;
using UserService.DTOs;

namespace SmartGrid.Application.Features.Users.Commands
{
    //COMMAND
    public record CreateUserCommand : IRequest<Result<AuthResponseDto>>
    {
        public string FirstName { get; init; } = string.Empty;
        public string LastName { get; init; } = string.Empty;

        public string PhoneNumber { get; init; } = string.Empty;

        public string Email { get; init; } = string.Empty;

        public UserRoles Role { get; init; } = UserRoles.User;

    }

    //VALIDATOR
    public class CreateUserValidator : AbstractValidator<CreateUserCommand>
    {
        public CreateUserValidator() { 
        
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

    //HANDLER
    internal class CreateUserHandler(
        IUserRepository userRepository,
        IJwtService jwtService,
        IUserCreatedQueueService userCreatedQueueService,
        ILogger<CreateUserHandler> logger) : IRequestHandler<CreateUserCommand, Result<AuthResponseDto>>
    {
        public async Task<Result<AuthResponseDto>> Handle(CreateUserCommand request, CancellationToken ct)
        {

                var userResult = User.Create(
                    request.FirstName,
                    request.LastName,
                    request.Email,
                    request.PhoneNumber,
                    request.Role
                );

                if (userResult.IsFailure)
                {
                    return Result<AuthResponseDto>.Failure(userResult.Error!.Message,ErrorType.Validation);
                }

                var user = userResult.Value;
            try
            {
                await userRepository.AddAsync(user,ct);

                logger.LogInformation("New user {FirstName} created with ID: {UserId}",user.FirstName ,user.Id);

                var token = jwtService.GenerateSetPasswordToken(user.Id,user.Email);

                logger.LogInformation("Set password token generated for user ID: {UserId}", user.Id);

                if (token.IsFailure) { 
                    return Result<AuthResponseDto>.Failure("Failed to generate set password token.", ErrorType.Failure);
                }

                await userCreatedQueueService.SendUserCreatedMessageAsync(user,token.Value,ct);

                logger.LogInformation("User created message sent to queue for user ID: {UserId}", user.Id);

                var userDto = new UserDto() { Id = user.Id.ToString(), Name = user.GetFullName(), Email = user.Email, Role = user.Role.ToString() };

                var authResponseDto = new AuthResponseDto() { Token = token.Value, User = userDto };

                return Result<AuthResponseDto>.Success(authResponseDto);

            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error while creating new user..");
                return Result<AuthResponseDto>.Failure("Failed to create new user.", ErrorType.Failure);
            }

        }
    }
}
