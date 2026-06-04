using System.IO;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using SmartGrid.Application.Features.Bills.Commands;
using SmartGrid.Domain.Enums;
using SmartGrid.Infrastructure.Common.Options;
using SmartGrid.WebApi.Extensions;
using Stripe;
using Stripe.Checkout;

namespace SmartGrid.WebApi.Controllers
{
    [Route("api/webhooks/stripe")]
    [ApiController]
    public class StripeWebhookController(IMediator mediator, IOptions<StripeOptions> stripeOptions) : ControllerBase
    {
        [HttpPost]
        public async Task<IActionResult> HandleWebhook()
        {
            var json = await new StreamReader(HttpContext.Request.Body).ReadToEndAsync();
            var signature = Request.Headers["Stripe-Signature"];

            try
            {
                var stripeEvent = EventUtility.ConstructEvent(json, signature, stripeOptions.Value.WebhookSecret);

                if (stripeEvent.Type == Stripe.EventTypes.CheckoutSessionCompleted)
                {
                    if (stripeEvent.Data.Object is Session session)
                    {
                        var result = await mediator.Send(new FulfillBillPaymentCommand(session.Id));
                        return result.ToActionResult();
                    }
                }

                var successResult = SmartGrid.Domain.Common.Result.Success();
                return successResult.ToActionResult();
            }
            catch (StripeException)
            {
                var failureResult = SmartGrid.Domain.Common.Result.Failure("Invalid webhook signature.", ErrorType.Validation);
                return failureResult.ToActionResult();
            }
        }
    }
}