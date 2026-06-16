using Microsoft.AspNetCore.Mvc;
using SmartGrid.Application.Features.SmartMeters.Commands;
using SmartGrid.Domain.Common;
using SmartGrid.Domain.Enums;

namespace SmartGrid.WebApi.DTOs
{
    public class DeleteSmartMeterRequest
    {
        [FromForm(Name = "Id")]
        public string Id { get; set; } = string.Empty;

        public Result<DeleteSmartMeterCommand> ToCommand()
        {
            if (string.IsNullOrWhiteSpace(Id))
                return Result<DeleteSmartMeterCommand>.Failure("Meter ID is required.", ErrorType.Validation);

            return Result<DeleteSmartMeterCommand>.Success(new DeleteSmartMeterCommand(Id));
        }
    }
}
