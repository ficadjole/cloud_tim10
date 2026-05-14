using Microsoft.AspNetCore.Mvc;
using SmartGrid.Application.Features.Users.Commands;
using SmartGrid.Domain.Common;
using SmartGrid.Domain.Enums;

namespace SmartGrid.WebApi.DTOs
{
    public class LoginUserRequest
    {
        [FromForm(Name = "Email")]
        public string Email { get; set; } = string.Empty;

        [FromForm(Name = "Password")]
        public string Password { get; set; } = string.Empty;

        public Result<LoginUserCommand> ToCommand()
        {
            if (string.IsNullOrWhiteSpace(Email))
                return Result<LoginUserCommand>.Failure("Email is required.", ErrorType.Validation);
        
            if (string.IsNullOrWhiteSpace(Password))
                return Result<LoginUserCommand>.Failure("Password is required.", ErrorType.Validation);

            return Result<LoginUserCommand>.Success(new LoginUserCommand
            {
                Email = Email.Trim(),
                Password = Password
            });
        }

    }
}
