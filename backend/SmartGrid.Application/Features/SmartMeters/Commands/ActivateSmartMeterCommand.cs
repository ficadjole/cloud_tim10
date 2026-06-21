using FluentValidation;
using MediatR;
using Microsoft.Extensions.Logging;
using SmartGrid.Application.Interfaces;
using SmartGrid.Application.Interfaces.Repositories;
using SmartGrid.Domain.Common;
using SmartGrid.Domain.Enums;

namespace SmartGrid.Application.Features.SmartMeters.Commands
{
    public record ActivationResult(string AccessToken, string SmartMeterId);

    public record ActivateSmartMeterCommand(string SerialNumber, string DeviceGuid) : IRequest<Result<ActivationResult>>;

    public class ActivateSmartMeterValidator : AbstractValidator<ActivateSmartMeterCommand>
    {
        public ActivateSmartMeterValidator()
        {
            RuleFor(x => x.SerialNumber)
                .NotEmpty().WithMessage("Serial number is required.")
                .Matches(@"^SM-\d{4}-\d{5}$").WithMessage("Invalid serial number format.");
            RuleFor(x => x.DeviceGuid)
                .NotEmpty().WithMessage("Device GUID is required.")
                .Must(guid => Guid.TryParse(guid, out _)).WithMessage("Device GUID must be a valid 128-bit UUID format.");
        }
    }

    internal class ActivateSmartMeterHandler(
        ISmartMeterRepository smartMeterRepository,
        IAccessTokenService accessTokenService,
        ILogger<ActivateSmartMeterHandler> logger) : IRequestHandler<ActivateSmartMeterCommand, Result<ActivationResult>>
    {
        public async Task<Result<ActivationResult>> Handle(ActivateSmartMeterCommand request, CancellationToken cancellationToken)
        {
            try
            {
                var meter = await smartMeterRepository.GetBySerialNumberAsync(request.SerialNumber, cancellationToken);
                if (meter == null)
                    return Result<ActivationResult>.Failure($"Smart meter with serial number {request.SerialNumber} not found.", ErrorType.NotFound);

                var accessToken = meter.AccessToken;

                if (meter.AccessToken == null)
                {
                    accessToken = accessTokenService.GenerateAccessToken();
                    var activateResult = meter.Activate(request.DeviceGuid, accessToken);
                    if (activateResult.IsFailure)
                        return Result<ActivationResult>.Failure(activateResult.Error!.Message, activateResult.Error.Type);
                }

                await smartMeterRepository.UpdateAsync(meter, cancellationToken);

                logger.LogInformation("Smart meter {SerialNumber} successfully activated with DeviceGuid: {DeviceGuid}",
                    request.SerialNumber, request.DeviceGuid);

                return Result<ActivationResult>.Success(new ActivationResult(accessToken!, meter.Id.ToString()));
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error during activation of smart meter {SerialNumber}", request.SerialNumber);
                return Result<ActivationResult>.Failure("An unexpected error occurred during activation.", ErrorType.Failure);
            }
        }
    }
}