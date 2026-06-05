using MediatR;
using SmartGrid.Application.Interfaces;
using SmartGrid.Application.Interfaces.Repositories;
using SmartGrid.Application.Interfaces.Storage;
using SmartGrid.Application.Features.Bills.Services;
using SmartGrid.Domain.Common;
using SmartGrid.Domain.Enums;
using SmartGrid.Domain.Models;
using SmartGrid.Domain.Services;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace SmartGrid.Application.Features.Bills.Commands.GenerateMonthlyBills
{
    public record GenerateMonthlyBillsCommand(DateTime? TargetDate = null) : IRequest<Result>;

    internal sealed class GenerateMonthlyBillsCommandHandler(
        ISmartMeterRepository smartMeterRepository,
        ITariffModelRepository tariffModelRepository,
        ITelemetryRepository telemetryRepository,
        IBillRepository billRepository,
        IResidentalObjectRepository residentalObjectRepository,
        IBillUserRepository billUserRepository,
        IBillingCalculationService billingCalculationService,
        IBillBlobStorage billBlobStorage,
        IEmailService emailService)
        : IRequestHandler<GenerateMonthlyBillsCommand, Result>
    {
        public async Task<Result> Handle(GenerateMonthlyBillsCommand request, CancellationToken ct)
        {
            DateTime now = request.TargetDate ?? DateTime.UtcNow;
            DateTime firstDayOfPreviousMonth = new DateTime(now.Year, now.Month, 1).AddMonths(-1);
            DateTime lastDayOfPreviousMonth = new DateTime(now.Year, now.Month, 1).AddTicks(-1);

            var tariffModel = await tariffModelRepository.GetActiveTariffAsync(ct);
            if (tariffModel == null)
            {
                return Result.Failure("Active tariff model is not defined.", ErrorType.NotFound);
            }

            var meters = await smartMeterRepository.GetAllAsync(ct);

            foreach (var meter in meters)
            {
                if (meter.ResidentalObjectId == null)
                {
                    continue;
                }

                var existingBill = await billRepository.GetByPeriodAsync(meter.Id, firstDayOfPreviousMonth, ct);
                if (existingBill != null)
                {
                    continue;
                }

                var residentalObject = await residentalObjectRepository.GetByIdAsync(meter.ResidentalObjectId, ct);
                if (residentalObject == null)
                {
                    continue;
                }

                var user = await billUserRepository.GetBillOwnerByIdAsync(residentalObject.OwnerId, ct);
                if (user == null)
                {
                    continue;
                }

                double maxPowerValue = 11.5;
                if (meter.MaxPower != null)
                {
                    maxPowerValue = meter.MaxPower.Value;
                }

                var consumption = await telemetryRepository.GetConsumptionForPeriodAsync(
                    meter.Id,
                    firstDayOfPreviousMonth,
                    lastDayOfPreviousMonth,
                    ct);

                var calculationResult = billingCalculationService.Calculate(
                    consumption.HighTariffKWh,
                    consumption.LowTariffKWh,
                    tariffModel,
                    maxPowerValue);

                if (calculationResult.IsFailure)
                {
                    continue;
                }

                var calc = calculationResult.Value;

                var billResult = Bill.Create(
                    meter.Id,
                    residentalObject.OwnerId,
                    firstDayOfPreviousMonth,
                    consumption.HighTariffKWh,
                    consumption.LowTariffKWh,
                    calc.GreenZoneAmount,
                    calc.BlueZoneAmount,
                    calc.RedZoneAmount,
                    calc.FixedCostsAmount,
                    calc.TotalAmount);

                if (billResult.IsFailure)
                {
                    continue;
                }

                await billRepository.AddAsync(billResult.Value, ct);

                string textInvoice = BillReportGenerator.GenerateTextInvoice(billResult.Value, residentalObject);
                string blobName = $"{residentalObject.OwnerId.Value}/{billResult.Value.BillingPeriod:yyyy-MM}/{billResult.Value.Id.Value}.txt";
                await billBlobStorage.SaveBillTextReportAsync(blobName, textInvoice, ct);

                string fullName = $"{user.FirstName} {user.LastName}";
                await emailService.SendBillGeneratedEmailAsync(
                    user.Email,
                    fullName,
                    billResult.Value.Id.Value,
                    billResult.Value.TotalAmount,
                    billResult.Value.BillingPeriod);
            }

            return Result.Success();
        }
    }
}