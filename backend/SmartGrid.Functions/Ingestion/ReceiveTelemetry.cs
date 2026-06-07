using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;
using SmartGrid.Application.Features.Telemetries.Commands;
using SmartGrid.Domain.Common;
using SmartGrid.Functions.Extensions;

namespace SmartGrid.Functions.Ingestion;

internal class ReceiveTelemetry(IMediator mediator)
{
    [Function("ReceiveTelemetry")]
    public async Task<IActionResult> Run(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post")] HttpRequest req)
    {
        if (!req.Headers.TryGetValue("X-Device-Token", out var deviceToken))
        {
            return new BadRequestObjectResult(new { error = "X-Device-Token is missing in request headers." });
        }

        ProcessTelemetryCommand? command = await req.ReadFromJsonAsync<ProcessTelemetryCommand>();

        if (command == null)
            return new BadRequestObjectResult(new { error = "Invalid or empty JSON payload." });

        var updatedCommand = command with { DeviceToken = deviceToken.ToString() };

        Result result = await mediator.Send(updatedCommand);

        return result.ToActionResult();
    }
}