using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SmartGrid.WebApi.DTOs;
using SmartGrid.WebApi.Extensions;

namespace SmartGrid.WebApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SetInitialPasswordController(IMediator mediator) : ControllerBase
    {

        [HttpPost]
        [Authorize(Roles = "User,PaymentAdmin")]
        public async Task<IActionResult> Post([FromBody] SetInitialPasswordRequest request)
        {
            var userId = User.Claims.FirstOrDefault(c => c.Type == "userId")?.Value;
            
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var commandResult = request.ToCommand(userId);

            if(commandResult.IsFailure)
                return commandResult.ToActionResult();

            var result = await mediator.Send(commandResult.Value);

            return result.ToActionResult();
        }
    } 
}
