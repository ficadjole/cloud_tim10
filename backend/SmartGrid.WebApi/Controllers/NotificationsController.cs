using MediatR;
using Microsoft.AspNetCore.Mvc;
using SmartGrid.Application.Features.Alerts.Queries;

namespace SmartGrid.WebApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class NotificationsController(IMediator mediator) : ControllerBase
    {
        [HttpGet]
        public async Task<IActionResult> GetRecent([FromQuery] int count = 20, CancellationToken ct = default)
        {
            var result = await mediator.Send(new GetRecentAlertsQuery(count), ct);
            return result.IsSuccess ? Ok(result.Value) : StatusCode(500, result.Error);
        }
    }
}
