using Microsoft.Extensions.Options;
using SmartGrid.Application.Interfaces;
using SmartGrid.Application.Interfaces.Repositories;
using SmartGrid.Domain.Common;
using SmartGrid.Domain.Enums;
using SmartGrid.Domain.Models;
using SmartGrid.Domain.ValueObjects;
using SmartGrid.Infrastructure.Common.Options;
using Stripe;
using Stripe.Checkout;

namespace SmartGrid.Infrastructure.Services
{
    public class PaymentService : IPaymentService
    {
        private readonly IBillRepository _billRepository;

        public PaymentService(IBillRepository billRepository, IOptions<StripeOptions> stripeOptions)
        {
            _billRepository = billRepository;
            StripeConfiguration.ApiKey = stripeOptions.Value.SecretKey;
        }

        public async Task<Result<string>> CreateCheckoutSessionAsync(Bill bill, string successUrl, string cancelUrl, CancellationToken ct = default)
        {
            try
            {
                var options = new SessionCreateOptions
                {
                    PaymentMethodTypes = new List<string> { "card" },
                    LineItems = new List<SessionLineItemOptions>
                    {
                        new SessionLineItemOptions
                        {
                            PriceData = new SessionLineItemPriceDataOptions
                            {
                                UnitAmount = (long)(bill.TotalAmount * 100),
                                Currency = "rsd",
                                ProductData = new SessionLineItemPriceDataProductDataOptions
                                {
                                    Name = $"Electricity Bill - {bill.BillingPeriod:MM/yyyy}"
                                }
                            },
                            Quantity = 1
                        }
                    },
                    Mode = "payment",
                    SuccessUrl = successUrl,
                    CancelUrl = cancelUrl,
                    ClientReferenceId = bill.Id.Value
                };

                var service = new SessionService();
                var session = await service.CreateAsync(options, cancellationToken: ct);

                bill.AssignStripeSession(session.Id);
                await _billRepository.UpdateAsync(bill, ct);

                return Result<string>.Success(session.Url);
            }
            catch (System.Exception ex)
            {
                return Result<string>.Failure(ex.Message, ErrorType.Failure);
            }
        }

        public async Task<Result> FulfillPaymentAsync(string sessionId, CancellationToken ct = default)
        {
            try
            {
                var service = new SessionService();
                var session = await service.GetAsync(sessionId, cancellationToken: ct);

                if (session == null || session.PaymentStatus != "paid")
                {
                    return Result.Failure("Payment verification failed.", ErrorType.Validation);
                }

                var billId = session.ClientReferenceId;
                var idResult = EntityId.Create(billId);
                if (idResult.IsFailure)
                {
                    return Result.Failure("Invalid bill identity in session.", ErrorType.Validation);
                }

                var bill = await _billRepository.GetByIdAsync(idResult.Value, ct);
                if (bill == null)
                {
                    return Result.Failure("Associated bill not found.", ErrorType.NotFound);
                }

                bill.MarkAsPaid();
                await _billRepository.UpdateAsync(bill, ct);

                return Result.Success();
            }
            catch (System.Exception ex)
            {
                return Result.Failure(ex.Message, ErrorType.Failure);
            }
        }
    }
}