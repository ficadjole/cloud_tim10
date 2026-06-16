using FluentValidation;
using MediatR;
using Microsoft.Extensions.Logging;
using SmartGrid.Application.Interfaces.Repositories;
using SmartGrid.Domain.Common;
using SmartGrid.Domain.Enums;
using SmartGrid.Domain.Models;

namespace SmartGrid.Application.Features.TariffModels.Commands
{
    //COMMAND
    public record UpdateTariffCommand(
        float GHT,
        float GLT,
        float BHT,
        float BLT,
        float RHT,
        float RLT,
        float BillingPowerPrice,
        float SupplierCost) : IRequest<Result>;

    //VALIDATOR
    public class UpdateTariffValidator : AbstractValidator<UpdateTariffCommand>
    {
        public UpdateTariffValidator()
        {
            RuleFor(x => x.GHT).GreaterThanOrEqualTo(0).WithMessage("Green zone (HT) cannot be negative.");
            RuleFor(x => x.GLT).GreaterThanOrEqualTo(0).WithMessage("Green zone (LT) cannot be negative.");
            RuleFor(x => x.BHT).GreaterThanOrEqualTo(0).WithMessage("Blue zone (HT) cannot be negative.");
            RuleFor(x => x.BLT).GreaterThanOrEqualTo(0).WithMessage("Blue zone (LT) cannot be negative.");
            RuleFor(x => x.RHT).GreaterThanOrEqualTo(0).WithMessage("Red zone (HT) cannot be negative.");
            RuleFor(x => x.RLT).GreaterThanOrEqualTo(0).WithMessage("Red zone (LT) cannot be negative.");
            RuleFor(x => x.BillingPowerPrice).GreaterThanOrEqualTo(0).WithMessage("Billing power price cannot be negative.");
            RuleFor(x => x.SupplierCost).GreaterThanOrEqualTo(0).WithMessage("Supplier cost cannot be negative.");
        }
    }

    //HANDLER
    internal class UpdateTariffHandler(
        ITariffModelRepository tariffModelRepository,
        ILogger<UpdateTariffHandler> logger) : IRequestHandler<UpdateTariffCommand, Result>
    {
        public async Task<Result> Handle(UpdateTariffCommand request, CancellationToken cancellationToken)
        {
            try
            {
                var tariffResult = TariffModel.Create(
                    request.GHT,
                    request.GLT,
                    request.BHT,
                    request.BLT,
                    request.RHT,
                    request.RLT,
                    request.BillingPowerPrice,
                    request.SupplierCost);

                if (tariffResult.IsFailure)
                    return Result.Failure(tariffResult.Error!.Message, ErrorType.Validation);

                await tariffModelRepository.SaveAsync(tariffResult.Value);

                return Result.Success();
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error occured while updating the tariff model.");
                return Result.Failure("An unexpected error occured during tariff update.", ErrorType.Failure);
            }
        }
    }
}
