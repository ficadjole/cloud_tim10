using Microsoft.AspNetCore.Mvc;
using SmartGrid.Application.Features.Users.Commands;
using SmartGrid.Domain.Common;

namespace SmartGrid.WebApi.DTOs
{
    public class SetInitialPasswordRequest
    {
        [FromForm(Name = "password")]
        public string Password { get; set; } = string.Empty;

        [FromForm(Name = "confirmPassword")]
        public string ConfirmPassword { get; set; } = string.Empty;

        public Result<SetInitialPasswordCommand> ToCommand(string userId)
        {
            if (string.IsNullOrWhiteSpace(Password))
                return Result<SetInitialPasswordCommand>.Failure("Initial password is required.");

            if (Password.Length < 6)
                return Result<SetInitialPasswordCommand>.Failure("Initial password must be at least 6 characters long.");


            if (Password != ConfirmPassword)
                return Result<SetInitialPasswordCommand>.Failure("Password and confirm password do not match.");

            return Result<SetInitialPasswordCommand>.Success(new SetInitialPasswordCommand
            {
                UserId = userId,
                InitialPassword = Password.Trim()
            });
        }
    }
}
