using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartGrid.Application.Features.ManualLogs.Commands;
using SmartGrid.Application.Features.ManualLogs.Queries;
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

        [HttpGet]
        [Authorize(Roles = "PaymentAdmin,SysAdmin")]
        public async Task<IActionResult> GetAllManualLogs(CancellationToken ct)
        {
            var result = await mediator.Send(new GetAllManualLogsQuery(), ct);
            return result.ToActionResult();
        }

        [HttpPut("{id}/approve")]
        [Authorize(Roles = "PaymentAdmin,SysAdmin")]
        public async Task<IActionResult> ApproveManualLog(string id, CancellationToken ct)
        {
            var command = new ApproveManualLog { LogId = id };
            var result = await mediator.Send(command, ct);
            return result.ToActionResult();
        }

        [HttpPut("{id}/reject")]
        [Authorize(Roles = "PaymentAdmin,SysAdmin")]
        public async Task<IActionResult> RejectManualLog(string id, CancellationToken ct)
        {
            var command = new RejectManualLog { LogId = id };
            var result = await mediator.Send(command, ct);
            return result.ToActionResult();
        }
    }
}