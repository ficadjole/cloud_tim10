using MediatR;
using Microsoft.AspNetCore.Mvc;
using SmartGrid.Application.Features.ManualLogs.Commands;
using SmartGrid.WebApi.DTOs;
using SmartGrid.WebApi.Extensions;

namespace SmartGrid.WebApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ManualLogsController(IMediator mediator) : ControllerBase
    {
        [HttpPost]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> AddNewManualLog([FromForm] UploadManualLogRequest command, CancellationToken ct)
        {
            var commandResult = await command.ToCommandAsync(ct);

            if (commandResult.IsFailure)
                return commandResult.ToActionResult();

            var result = await mediator.Send(commandResult.Value, ct);
            return result.ToActionResult();
        }

        [HttpPut("{id}/approve")]
        public async Task<IActionResult> ApproveManualLog(string id, CancellationToken ct)
        {
            var command = new ApproveManualLog { LogId = id };
            var result = await mediator.Send(command, ct);
            return result.ToActionResult();
        }
    }


}
