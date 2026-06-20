using FluentValidation;
using MediatR;
using Microsoft.Extensions.Logging;
using SmartGrid.Application.Interfaces;
using SmartGrid.Application.Interfaces.Repositories;
using SmartGrid.Domain.Common;
using SmartGrid.Domain.Enums;
using UserService.DTOs;

namespace SmartGrid.Application.Features.Users.Commands
{

    //COMMAND
    public record LoginUserCommand : IRequest<Result<AuthResponseDto>>
    {
        public string Email { get; init; } = string.Empty;
        public string Password { get; init; } = string.Empty;
    }

    //VALIDATOR
    public class LoginUserValidator : AbstractValidator<LoginUserCommand>
    {
        public LoginUserValidator()
        {
            RuleFor(t => t.Email)
                .NotEmpty().WithMessage("Email is required.")
                .EmailAddress().WithMessage("Invalid email format.");

            RuleFor(t => t.Password)
                .NotEmpty().WithMessage("Password is required.")
                .MinimumLength(6).WithMessage("Password must be at least 6 characters long.");
        }
    }

    //HANDLER
    internal class LoginUserHandler(
        IUserRepository userRepository,
        ILogger<LoginUserCommand> logger,
        IPasswordHasher passwordHasher,
        IJwtService jwtService) : IRequestHandler<LoginUserCommand, Result<AuthResponseDto>>
    {

        public async Task<Result<AuthResponseDto>> Handle(LoginUserCommand request, CancellationToken ct)
        {

            try
            {

                var user = await userRepository.GetByEmailAsync(request.Email, ct);

                if (user == null)
                    return Result<AuthResponseDto>.Failure("Invalid email or password.", ErrorType.Authentication);

                var passwordValid = passwordHasher.VerifyPassword(request.Password, user.PasswordHash);

                if (!passwordValid)
                    return Result<AuthResponseDto>.Failure("Invalid email or password.", ErrorType.Authentication);

                var jwtToken = jwtService.GenerateToken(user.Id.Value, user.Email, user.Role.ToString());

                logger.LogInformation("User with email {Email} logged in successfully.", request.Email);

                var userDto = new UserDto() { Id = user.Id.ToString(), Name = user.GetFullName(), Email = user.Email, Role = user.Role.ToString(), PhoneNumber = user.PhoneNumber, AccountStatus = user.AccountStatus.ToString() };

                var authResponseDto = new AuthResponseDto() { Token = jwtToken.Value, User = userDto };

                return Result<AuthResponseDto>.Success(authResponseDto);

            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error occurred while logging in user with email {Email}", request.Email);
                return Result<AuthResponseDto>.Failure("An error occurred while processing your request. Please try again later.", ErrorType.Unexpected);

            }
        }
    }
}