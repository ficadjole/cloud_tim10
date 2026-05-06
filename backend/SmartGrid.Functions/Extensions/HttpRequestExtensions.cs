using Microsoft.AspNetCore.Http;
using SmartGrid.Application.Features.Firmwares;
using SmartGrid.Application.Features.Firmwares.Commands;
using SmartGrid.Application.Features.ManualLogs.Commands;
using SmartGrid.Domain.Common;
using SmartGrid.Domain.Enums;

namespace SmartGrid.Functions.Extensions
{
    internal static class HttpRequestExtensions
    {
        public static async Task<Result<UploadFirmwareCommand>> ToUploadFirmwareCommandAsync(this HttpRequest req)
        {
            if (!req.HasFormContentType)
            {
                return Result<UploadFirmwareCommand>.Failure("Expected multipart/form-data.", ErrorType.Validation);
            }

            try
            {
                var form = await req.ReadFormAsync();

                string deviceTypeRaw = form["DeviceType"].ToString().Trim('"');
                Enum.TryParse<DeviceType>(deviceTypeRaw, ignoreCase: true, out var deviceType);

                var firmwareFile = form.Files.GetFile("FirmwareFile");

                if (firmwareFile == null || firmwareFile.Length == 0)
                    return Result<UploadFirmwareCommand>.Failure("Firmware file is required.", ErrorType.Validation);

                var fileBytes = await firmwareFile.ToByteArrayAsync();

                var uploadedFile = new UploadedFirmwareFile
                {
                    FileName = firmwareFile.FileName,
                    Content = fileBytes
                };

                return Result<UploadFirmwareCommand>.Success(new UploadFirmwareCommand
                {
                    FirmwareFile = uploadedFile,
                    DeviceType = deviceType,
                    Version = form["Version"].ToString().Trim('"')
                });
            }
            catch (Exception ex)
            {
                return Result<UploadFirmwareCommand>.Failure($"HTTP Parsing Error: {ex.Message}",
                    ErrorType.Failure);
            }
        }

        public static async Task<Result<AddNewManualLog>> ToAddNewManualLogCommandAsync(this HttpRequest req)
        {
            if (!req.HasFormContentType)
            {
                return Result<AddNewManualLog>.Failure("Expected multipart/form-data.", ErrorType.Validation);
            }

            try
            {
                var form = await req.ReadFormAsync();

                var smartMeterId = form["SmartMeterId"].ToString();
                double.TryParse(form["HighTariffValue"], out var highTariff);
                double.TryParse(form["LowTariffValue"], out var lowTariff);

                var imageFile = form.Files.GetFile("ImageFile");

                if (imageFile == null || imageFile.Length == 0)
                    return Result<AddNewManualLog>.Failure("Reading image is required.", ErrorType.Validation);

                var fileBytes = await imageFile.ToByteArrayAsync();

                return Result<AddNewManualLog>.Success(new AddNewManualLog
                {
                    SmartMeterId = smartMeterId,
                    HighTariffValue = highTariff,
                    LowTariffValue = lowTariff,
                    ImageContent = fileBytes,
                    ImageExtension = Path.GetExtension(imageFile.FileName)
                });
            }
            catch (Exception ex)
            {
                return Result<AddNewManualLog>.Failure($"HTTP Parsing Error: {ex.Message}", ErrorType.Failure);
            }
        }
    }
}
