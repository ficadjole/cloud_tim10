using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SmartGrid.Application.Features.Users.Commands;
using SmartGrid.WebApi.DTOs;
using SmartGrid.WebApi.Extensions;
using SmartGrid.WebApi.Filters;

namespace SmartGrid.WebApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CreateUserController(IMediator mediator) : ControllerBase
    {
        [HttpPost]
        [Authorize(Roles = "SysAdmin")]
        public async Task<IActionResult> CreateUser([FromBody] CreateUserRequest request)
        {
            var commandResult = request.ToCommand();
            if (commandResult.IsFailure)
                return commandResult.ToActionResult();

            var result = await mediator.Send(commandResult.Value);

            return result.ToActionResult();
        }

        [HttpPost]
        [Route("set-password")]
        [ValidateSetPasswordToken]
        public async Task<IActionResult> SetPassword([FromBody] SetInitialPasswordRequest request)
        {

            var userId = HttpContext.Items["UserId"]?.ToString();

            if (userId == null) return BadRequest("Invalid token.");

            var commandResult = request.ToCommand(userId);

            if (commandResult.IsFailure)
                return commandResult.ToActionResult();

            var result = await mediator.Send(commandResult.Value);

            return result.ToActionResult();
        }

        [HttpGet]
        [Route("reset-password")]
        public async Task<IActionResult> ResetPassword([FromQuery] string email)
        {
            var commandResult = new ResetPasswordCommand() { Email = email };

            if (commandResult == null)
                return BadRequest("Invalid email.");

            var result = await mediator.Send(commandResult);

            return result.ToActionResult();
        }
    }
}
