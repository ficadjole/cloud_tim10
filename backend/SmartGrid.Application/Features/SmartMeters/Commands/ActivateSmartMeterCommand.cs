using FluentValidation;
using MediatR;
using Microsoft.Extensions.Logging;
using SmartGrid.Application.Interfaces;
using SmartGrid.Application.Interfaces.Repositories;
using SmartGrid.Domain.Common;
using SmartGrid.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SmartGrid.Application.Features.SmartMeters.Commands
{
    //COMMAND
    public record ActivateSmartMeterCommand (string SerialNumber, string DeviceGuid) : IRequest<Result<string>>;
   
    //VALIDATOR

    public class ActivateSmartMeterValidator : AbstractValidator<ActivateSmartMeterCommand>
    {
        public ActivateSmartMeterValidator()
        {
            RuleFor(x => x.SerialNumber)
                .NotEmpty().WithMessage("Serial number is required.")
                .Matches(@"^SM-\d{4}-\d{5}$").WithMessage("Invalid serial number format.");

            RuleFor(x => x.DeviceGuid)
                .NotEmpty().WithMessage("Device GUID is required.")
                .Must(guid => Guid.TryParse(guid, out _)).WithMessage("Device GUID bust be a valid 128-bit UUID format."); 
            //out _ oznacava da ne treba mi taj podatak, slobodno discarduj, ne cuvaj ga nigde kao result
        }
    }

    //HANDLER
    internal class ActivateSmartMeterHandler(
        ISmartMeterRepository smartMeterRepository,
        IAccessTokenService accessTokenService,
        ILogger<ActivateSmartMeterHandler> logger) : IRequestHandler<ActivateSmartMeterCommand, Result<string>>
    {
        public async Task<Result<string>> Handle(ActivateSmartMeterCommand request, CancellationToken cancellationToken)
        {
            try
            {
                var meter = await smartMeterRepository.GetBySerialNumberAsync(request.SerialNumber, cancellationToken);
                if (meter == null)
                    return Result<string>.Failure($"Smart meter with serial number {request.SerialNumber} not found.", ErrorType.NotFound);

                var accessToken = accessTokenService.GenerateAccessToken();

                var activateResult = meter.Activate(request.DeviceGuid, accessToken);

                if (activateResult.IsFailure)
                {
                    return Result<string>.Failure(activateResult.Error!.Message, activateResult.Error.Type);
                }

                await smartMeterRepository.UpdateAsync(meter, cancellationToken);

                logger.LogInformation("Smart meter {SerialNumber} successfully activated with DeviceGuid: {DeviceGuid}",
                    request.SerialNumber, request.DeviceGuid);

                return Result<string>.Success(accessToken);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error during activation of smart meter {SerialNumber}", request.SerialNumber);
                return Result<string>.Failure("An unexpected error occurred during activation.", ErrorType.Failure);
            }
        }
    }
}
