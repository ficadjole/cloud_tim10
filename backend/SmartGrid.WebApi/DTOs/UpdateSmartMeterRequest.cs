using Microsoft.AspNetCore.Mvc;
using SmartGrid.Application.Features.SmartMeters.Commands;
using SmartGrid.Domain.Common;
using SmartGrid.Domain.Enums;

namespace SmartGrid.WebApi.DTOs
{
    public class UpdateSmartMeterRequest
    {
        [FromForm(Name = "ConnectionType")]
        public ConnectionType ConnectionType { get; set; }
        [FromForm(Name = "Note")]
        public string? Note { get; set; }
        [FromForm(Name = "LimitValue")]
        public double? LimitValue { get; set; }
        [FromForm(Name = "LimitType")]
        public LimitType? LimitType { get; set; }

        public Result<UpdateSmartMeterCommand> ToCommand(string id)
        {
            if (ConnectionType == ConnectionType.Unknown)
                return Result<UpdateSmartMeterCommand>.Failure("Connection type is required.", ErrorType.Validation);

            return Result<UpdateSmartMeterCommand>.Success(new UpdateSmartMeterCommand
            {
                Id = id,
                ConnectionType = ConnectionType,
                Note = Note?.Trim(),
                LimitValue = LimitValue,
                LimitType = LimitType
            });
        }
    }
}
