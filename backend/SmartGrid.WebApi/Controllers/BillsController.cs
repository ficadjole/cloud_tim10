using MediatR;
using Microsoft.AspNetCore.Mvc;
using SmartGrid.Application.Features.Bills.Queries.GetBillsByMeter;
using SmartGrid.WebApi.DTOs;
using SmartGrid.WebApi.Extensions;
using System.Threading.Tasks;

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
    }
}