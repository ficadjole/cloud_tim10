using Microsoft.AspNetCore.Mvc;
using SmartGrid.Application.Features.ManualLogs.Commands;
using SmartGrid.Domain.Common;
using SmartGrid.Domain.Enums;
using SmartGrid.WebApi.Extensions;

namespace SmartGrid.WebApi.DTOs
{
    public class UploadManualLogRequest
    {
        [FromForm(Name = "SmartMeterId")]
        public string SmartMeterId { get; set; } = string.Empty;

        [FromForm(Name = "HighTariffValue")]
        public double HighTariffValue { get; set; }

        [FromForm(Name = "LowTariffValue")]
        public double LowTariffValue { get; set; }

        [FromForm(Name = "ManualLogImage")]
        public IFormFile? File { get; set; }

        public async Task<Result<AddNewManualLog>> ToCommandAsync(CancellationToken ct)
        {
            var trimmedMeterId = SmartMeterId.Trim('"').Trim();

            if (string.IsNullOrWhiteSpace(trimmedMeterId))
                return Result<AddNewManualLog>.Failure("Smart meter ID is required.", ErrorType.Validation);

            if (HighTariffValue < 0)
                return Result<AddNewManualLog>.Failure("High tariff value cannot be negative.", ErrorType.Validation);

            if (LowTariffValue < 0)
                return Result<AddNewManualLog>.Failure("Low tariff value cannot be negative.", ErrorType.Validation);

            if (File == null || File.Length == 0)
                return Result<AddNewManualLog>.Failure("Image file is required.", ErrorType.Validation);

            string extension = Path.GetExtension(File.FileName);

            return Result<AddNewManualLog>.Success(new AddNewManualLog
            {
                SmartMeterId = trimmedMeterId,
                HighTariffValue = HighTariffValue,
                LowTariffValue = LowTariffValue,
                ImageContent = await File.ToByteArrayAsync(ct),
                ImageExtension = extension
            });
        }
    }
}
