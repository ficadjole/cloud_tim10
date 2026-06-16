using Microsoft.AspNetCore.Mvc;
using SmartGrid.Application.Features.Users.Commands;
using SmartGrid.Domain.Common;
using SmartGrid.Domain.Enums;

namespace SmartGrid.WebApi.DTOs
{
    public class UpdateUserRequest
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

        public Result<UpdateUserCommand> ToCommand(string id)
        {
            if (string.IsNullOrWhiteSpace(id))
                return Result<UpdateUserCommand>.Failure("User ID is required.", ErrorType.Validation);

            if (string.IsNullOrWhiteSpace(FirstName))
                return Result<UpdateUserCommand>.Failure("First name is required.", ErrorType.Validation);

            if (string.IsNullOrWhiteSpace(LastName))
                return Result<UpdateUserCommand>.Failure("Last name is required.", ErrorType.Validation);

            if (string.IsNullOrWhiteSpace(PhoneNumber))
                return Result<UpdateUserCommand>.Failure("Phone number is required.", ErrorType.Validation);

            if (string.IsNullOrWhiteSpace(Email))
                return Result<UpdateUserCommand>.Failure("Email is required.", ErrorType.Validation);

            if (UserRoles.User != Role && UserRoles.PaymentAdmin != Role)
                return Result<UpdateUserCommand>.Failure("Invalid user role.", ErrorType.Validation);

            return Result<UpdateUserCommand>.Success(new UpdateUserCommand
            {
                Id = id,
                FirstName = FirstName.Trim(),
                LastName = LastName.Trim(),
                PhoneNumber = PhoneNumber.Trim(),
                Email = Email.Trim(),
                Role = Role
            });
        }
    }
}