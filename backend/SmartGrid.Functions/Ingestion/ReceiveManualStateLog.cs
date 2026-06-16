using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;
using SmartGrid.Functions.Extensions;

namespace SmartGrid.Functions.Ingestion
{
    internal class ReceiveManualStateLog(IMediator mediator)
    {
        [Function("ReceiveManualStateLog")]
        public async Task<IActionResult> Run(
            [HttpTrigger(AuthorizationLevel.Anonymous, "post")] HttpRequest req)
        {
            var commandResult = await req.ToAddNewManualLogCommandAsync();

            if (commandResult.IsFailure)
            {
                return new BadRequestObjectResult(commandResult.Error);
            }

            var finalResult = await mediator.Send(commandResult.Value);

            return finalResult.ToActionResult();
        }


    }
}
