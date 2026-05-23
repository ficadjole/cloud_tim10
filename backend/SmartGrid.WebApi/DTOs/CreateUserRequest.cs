using Microsoft.AspNetCore.Mvc;
using SmartGrid.Application.Features.Users.Commands;
using SmartGrid.Domain.Common;
using SmartGrid.Domain.Enums;

namespace SmartGrid.WebApi.DTOs
{
    public class CreateUserRequest
    {
        [FromForm(Name = "FirstName")]
        public string FirstName { get; set; } = string.Empty;

        [FromForm(Name = "LastName")]
        public string LastName { get; set; } = string.Empty;

        [FromForm(Name = "PhoneNumber")]
        public string PhoneNumber { get; set; } = string.Empty;

        [FromForm(Name = "Email")]
        public string Email { get; set; } = string.Empty;

        [FromForm(Name = "Role")]
        public UserRoles Role { get; set; } = UserRoles.User;

        public Result<CreateUserCommand> ToCommand()
        {
            if(string.IsNullOrWhiteSpace(FirstName))
                return Result<CreateUserCommand>.Failure("First name is required.", ErrorType.Validation);

            if(string.IsNullOrWhiteSpace(LastName))
                return Result<CreateUserCommand>.Failure("Last name is required.", ErrorType.Validation);

            if(string.IsNullOrWhiteSpace(PhoneNumber))
                return Result<CreateUserCommand>.Failure("Phone number is required.", ErrorType.Validation);

            if(string.IsNullOrWhiteSpace(Email))
                return Result<CreateUserCommand>.Failure("Email is required.", ErrorType.Validation);

            if(UserRoles.User != Role && UserRoles.PaymentAdmin != Role)
                return Result<CreateUserCommand>.Failure("Invalid user role.", ErrorType.Validation);

            return Result<CreateUserCommand>.Success(new CreateUserCommand
            {
                FirstName = FirstName.Trim(),
                LastName = LastName.Trim(),
                PhoneNumber = PhoneNumber.Trim(),
                Email = Email.Trim(),
                Role = Role
            });
        }
    }
}
