using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartGrid.Application.Features.Bills.Commands;
using SmartGrid.Application.Features.Bills.Queries.GetBillPdf;
using SmartGrid.Application.Features.Bills.Queries.GetBillsByMeter;
using SmartGrid.Application.Features.Bills.Queries.GetBillsByOwner;
using SmartGrid.WebApi.DTOs;
using SmartGrid.WebApi.Extensions;

namespace SmartGrid.WebApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BillsController(IMediator mediator) : ControllerBase
    {
        [HttpPost("{id}/checkout")]
        public async Task<IActionResult> CreateCheckoutSession([FromRoute] string id, [FromBody] CreateCheckoutSessionRequest request)
        {
            var commandResult = request.ToCommand(id);

            if (commandResult.IsFailure)
                return commandResult.ToActionResult();

            var result = await mediator.Send(commandResult.Value);

            return result.ToActionResult();
        }

        [HttpGet("meter/{smartMeterId}")]
        public async Task<IActionResult> GetBillsByMeter(
            [FromRoute] string smartMeterId,
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10)
        {
            var query = new GetBillsByMeterQuery(smartMeterId, pageNumber, pageSize);
            var result = await mediator.Send(query);
            return result.ToActionResult();
        }

        [HttpGet("{id}/download")]
        public async Task<IActionResult> DownloadBillPdf([FromRoute] string id)
        {
            var query = new GetBillPdfQuery(id);
            var result = await mediator.Send(query);

            if (result.IsFailure)
            {
                return result.ToActionResult();
            }

            return File(result.Value, "application/pdf", $"Invoice_{id}.pdf");
        }

        [HttpGet("owner/{ownerId}")]
        [Authorize(Roles = "User,PaymentAdmin")]
        public async Task<IActionResult> GetBillsByOwner([FromRoute] string ownerId,[FromQuery] int pageNumber = 1,[FromQuery] int pageSize = 10)
        {
            var query = new GetBillsByOwnerQuery(ownerId, pageNumber, pageSize);
            var result = await mediator.Send(query);
            return result.ToActionResult();
        }

        [HttpPost("fulfill-payment")]
        public async Task<IActionResult> FulfillPayment([FromQuery(Name = "sessionId")] string SessionId) // MAPIRAMO DIREKTNO NA VELIKO S I PROMENLJIVU SA VELIKIM S
        {
            var result = await mediator.Send(new FulfillBillPaymentCommand(SessionId));
            return result.ToActionResult();
        }
    }
}