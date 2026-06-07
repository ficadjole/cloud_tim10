using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
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
            if(commandResult.IsFailure)
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
            if(commandResult.IsFailure)
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
            if(commandResult.IsFailure)
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
            if(commandResult.IsFailure)
                return commandResult.ToActionResult();

            var result = await mediator.Send(commandResult.Value);
            return result.ToActionResult();
        }
    }
}
