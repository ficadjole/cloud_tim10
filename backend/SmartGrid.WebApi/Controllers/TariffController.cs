using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartGrid.Application.Features.TariffModels.Queries;
using SmartGrid.WebApi.DTOs;
using SmartGrid.WebApi.Extensions;

namespace SmartGrid.WebApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TariffController(IMediator mediator) : ControllerBase
    {
        //svi ulogovani korisnici mogu da vide trenutne cene
        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetActiveTariff()
        {
            var query = new GetActiveTariffQuery();
            var result = await mediator.Send(query);

            if (result is null)
                return StatusCode(StatusCodes.Status500InternalServerError, "Unexpected error while retrieving tariff data.");

            return result.ToActionResult();
        }

        [HttpPut]
        [Authorize(Roles = "PaymentAdmin")] //samo admin naplate moze da azurira cenovnik
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> Update([FromForm] UpdateTariffRequest request)
        {
            var commandResult = request.ToCommand();
            if (commandResult.IsFailure)
                return commandResult.ToActionResult();

            var result = await mediator.Send(commandResult.Value);

            return result.ToActionResult();
        }
    }
}
