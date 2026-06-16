using Microsoft.AspNetCore.Mvc;
using SmartGrid.Application.Features.Users.Commands;
using SmartGrid.Domain.Common;
using SmartGrid.Domain.Enums;

namespace SmartGrid.WebApi.DTOs
{
    public class UpdateUserStatusRequest
    {
        [FromForm(Name = "AccountStatus")]
        public UserAccountStatus AccountStatus { get; set; }

        public Result<UpdateUserStatusCommand> ToCommand(string id)
        {
            if (string.IsNullOrWhiteSpace(id))
                return Result<UpdateUserStatusCommand>.Failure("User ID is required.", ErrorType.Validation);

            if (!Enum.IsDefined(typeof(UserAccountStatus), AccountStatus))
                return Result<UpdateUserStatusCommand>.Failure("Invalid account status.", ErrorType.Validation);

            return Result<UpdateUserStatusCommand>.Success(new UpdateUserStatusCommand
            {
                Id = id,
                AccountStatus = AccountStatus
            });
        }
    }
}