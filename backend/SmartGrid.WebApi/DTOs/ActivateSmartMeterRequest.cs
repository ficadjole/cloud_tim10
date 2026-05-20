using Microsoft.AspNetCore.Mvc;
using SmartGrid.Application.Features.SmartMeters.Commands;
using SmartGrid.Domain.Common;
using SmartGrid.Domain.Enums;

namespace SmartGrid.WebApi.DTOs
{
    public class ActivateSmartMeterRequest
    {
        [FromForm(Name = "SerialNumber")]
        public string SerialNumber { get; set; } = string.Empty;
        [FromForm(Name = "DeviceGuid")]
        public string DeviceGuid { get; set; } = string.Empty;

        public Result<ActivateSmartMeterCommand> ToCommand()
        {
            if (string.IsNullOrWhiteSpace(SerialNumber))
                return Result<ActivateSmartMeterCommand>.Failure("Serial number is required.", ErrorType.Validation);

            if (string.IsNullOrWhiteSpace(DeviceGuid))
                return Result<ActivateSmartMeterCommand>.Failure("Device GUID is required.", ErrorType.Validation);

            return Result<ActivateSmartMeterCommand>.Success(new ActivateSmartMeterCommand(SerialNumber.Trim(), DeviceGuid.Trim()));
        }
    }
}
