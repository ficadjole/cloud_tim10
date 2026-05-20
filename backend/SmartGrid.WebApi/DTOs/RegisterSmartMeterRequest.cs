using Microsoft.AspNetCore.Mvc;
using SmartGrid.Application.Features.SmartMeters.Commands;
using SmartGrid.Domain.Common;
using SmartGrid.Domain.Enums;

namespace SmartGrid.WebApi.DTOs
{
    public class RegisterSmartMeterRequest
    {
        [FromForm(Name = "SerialNumber")]
        public string SerialNumber { get; set; } = string.Empty;
        [FromForm(Name = "ConnectionType")]
        public ConnectionType ConnectionType { get; set; }
        [FromForm(Name = "ObjectId")]
        public string ResidentalObjectId { get; set; } = string.Empty;
        [FromForm(Name = "Note")]
        public string? Note { get; set; }

        public Result<RegisterSmartMeterCommand> ToCommand()
        {
            if (string.IsNullOrWhiteSpace(SerialNumber))
                return Result<RegisterSmartMeterCommand>.Failure("Serial number is required.", ErrorType.Validation);

            if(string.IsNullOrWhiteSpace(ResidentalObjectId))
                return Result<RegisterSmartMeterCommand>.Failure("Object ID is required.", ErrorType.Validation);

            return Result<RegisterSmartMeterCommand>.Success(new RegisterSmartMeterCommand {
                ResidentalObjectId = ResidentalObjectId,
                SerialNumber = SerialNumber,
                ConnectionType = ConnectionType,
                Note = Note?.Trim()
                });
        }

    }
}
