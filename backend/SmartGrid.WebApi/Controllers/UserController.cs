using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartGrid.Application.Features.Users.Commands;
using SmartGrid.Application.Features.Users.Queries;
using SmartGrid.WebApi.DTOs;
using SmartGrid.WebApi.Extensions;
using SmartGrid.WebApi.Filters;

namespace SmartGrid.WebApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController(IMediator mediator) : ControllerBase
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

        [HttpPut]
        [Route("{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateUser([FromRoute] string id, [FromBody] UpdateUserRequest request)
        {
            var commandResult = request.ToCommand(id);

            if (commandResult.IsFailure)
                return BadRequest(commandResult.Error!.Message);

            var result = await mediator.Send(commandResult.Value);

            return result.ToActionResult();
        }

        [HttpPatch("{id}/status")]
        [Authorize(Roles = "SysAdmin")]
        public async Task<IActionResult> UpdateUserStatus([FromRoute] string id, [FromBody] UpdateUserStatusRequest request)
        {
            var commandResult = request.ToCommand(id);

            if (commandResult.IsFailure)
                return BadRequest(commandResult.Error!.Message);

            var result = await mediator.Send(commandResult.Value);

            return result.ToActionResult();
        }


        [HttpDelete("{id}")]
        [Authorize(Roles = "SysAdmin")]
        public async Task<IActionResult> DeleteUser([FromRoute] string id)
        {
            if (string.IsNullOrWhiteSpace(id))
                return BadRequest("User ID is required.");

            var result = await mediator.Send(new DeleteUserCommand { Id = id });

            return result.ToActionResult();
        }

        [HttpGet]
        [Authorize(Roles = "SysAdmin,PaymentAdmin")]
        public async Task<IActionResult> GetAllUsers()
        {
            var query = new GetAllUsersQuery();

            var result = await mediator.Send(query);

            return result.ToActionResult();
        }

    }
}
