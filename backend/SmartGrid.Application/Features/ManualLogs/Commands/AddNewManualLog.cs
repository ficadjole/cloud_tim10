using FluentValidation;
using MediatR;
using Microsoft.Extensions.Logging;
using SmartGrid.Application.Common;
using SmartGrid.Application.Common.Extensions;
using SmartGrid.Application.Interfaces.Repositories;
using SmartGrid.Application.Interfaces.Storage;
using SmartGrid.Domain.Common;
using SmartGrid.Domain.Models;

namespace SmartGrid.Application.Features.ManualLogs.Commands
{
    public record AddNewManualLog : IRequest<Result>
    {
        public string SmartMeterId { get; init; } = string.Empty;
        public double HighTariffValue { get; init; }
        public double LowTariffValue { get; init; }
        public byte[] ImageContent { get; init; } = [];
        public string ImageExtension { get; init; } = ".jpg";
    }

    public class AddNewManualLogValidator : AbstractValidator<AddNewManualLog>
    {
        public AddNewManualLogValidator()
        {
            RuleFor(l => l.SmartMeterId)
                .NotEmpty();
            RuleFor(l => l.HighTariffValue)
                .GreaterThanOrEqualTo(0);
            RuleFor(l => l.LowTariffValue)
                .GreaterThanOrEqualTo(0);
        }
    }

    internal class AddNewManualLogHandler(
     IManualStateLogRepository repository,
     IManualLogBlob blobStorage,
     ILogger<AddNewManualLogHandler> logger) : IRequestHandler<AddNewManualLog, Result>
    {
        public async Task<Result> Handle(AddNewManualLog request, CancellationToken cancellationToken)
        {
            try
            {
                var metadata = new ImageMetadata { SmartMeterId = request.SmartMeterId, ContentType = "image/jpeg" };
                var blobPath = ManualReadingPathExtensions.GetManualReadingBlobPath(metadata, request.SmartMeterId);
                metadata.FileName = blobPath;

                var fileData = new FileData<ImageMetadata>
                {
                    Metadata = metadata,
                    Content = request.ImageContent
                };

                await blobStorage.SaveAsync(fileData, cancellationToken);

                string finalImageUrl = blobPath;

                var manualLogResult = ManualStateLog.Create(
                    request.SmartMeterId,
                    request.HighTariffValue,
                    request.LowTariffValue,
                    finalImageUrl);

                if (manualLogResult.IsFailure)
                    return Result.Failure(manualLogResult.Error!.Message);

                await repository.SaveAsync(manualLogResult.Value, cancellationToken);

                logger.LogInformation("[MANUAL LOG] Saved to SQL and Blob for device {DeviceId}", request.SmartMeterId);

                return Result.Success();
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error saving manual log for device {DeviceId}", request.SmartMeterId);
                return Result.Failure("Failed to save manual log.");
            }
        }
    }
}
