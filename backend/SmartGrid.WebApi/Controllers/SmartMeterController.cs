using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartGrid.Application.Features.SmartMeters.Queries;
using SmartGrid.WebApi.DTOs;
using SmartGrid.WebApi.Extensions;

namespace SmartGrid.WebApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SmartMeterController(IMediator mediator) : ControllerBase
    {
        [HttpPost("register")]
        [Authorize(Roles = "User")] //potrosac registruje brojilo
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> Register([FromForm] RegisterSmartMeterRequest request)
        {
            var commandResult = request.ToCommand();
            if (commandResult.IsFailure)
                return commandResult.ToActionResult();

            var result = await mediator.Send(commandResult.Value);
            return result.ToActionResult();
        }

        [HttpPost("activate")]
        //[Authorize(Roles = "User")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> Activate([FromForm] ActivateSmartMeterRequest request)
        {
            var commandResult = request.ToCommand();
            if (commandResult.IsFailure)
                return commandResult.ToActionResult();

            var result = await mediator.Send(commandResult.Value);
            return result.ToActionResult();
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "PaymentAdmin,User")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> Update(string id, [FromForm] UpdateSmartMeterRequest request)
        {
            var commandResult = request.ToCommand(id);
            if (commandResult.IsFailure)
                return commandResult.ToActionResult();

            var result = await mediator.Send(commandResult.Value);
            return result.ToActionResult();
        }

        [HttpDelete]
        [Authorize(Roles = "PaymentAdmin,User")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> Delete([FromForm] DeleteSmartMeterRequest request)
        {
            var commandResult = request.ToCommand();
            if (commandResult.IsFailure)
                return commandResult.ToActionResult();

            var result = await mediator.Send(commandResult.Value);
            return result.ToActionResult();
        }

        [HttpGet("{id}")]
        [Authorize(Roles = "SysAdmin,User")]
        public async Task<IActionResult> GetById(string id)
        {
            var query = new GetSmartMeterQuery(id);
            var result = await mediator.Send(query);
            if (result is null)
                return StatusCode(StatusCodes.Status500InternalServerError, "Unexpected error.");

            return result.ToActionResult();
        }

        [HttpGet]
        [Authorize(Roles = "PaymentAdmin")]
        public async Task<IActionResult> GetAll()
        {
            var query = new GetAllSmartMetersQuery();

            var result = await mediator.Send(query);

            if (result is null)
                return StatusCode(StatusCodes.Status500InternalServerError, "Unexpected error.");

            return result.ToActionResult();
        }
    }
}
