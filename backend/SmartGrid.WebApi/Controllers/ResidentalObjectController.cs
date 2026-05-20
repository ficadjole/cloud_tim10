using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartGrid.Application.Features.ResidentalObjects.Queries;
using SmartGrid.WebApi.DTOs;
using SmartGrid.WebApi.Extensions;
using System.Security.Claims;

namespace SmartGrid.WebApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "User")] //ja msm da je user
    public class ResidentalObjectController(IMediator mediator) : ControllerBase
    {
        [HttpPost]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> Create([FromForm] CreateResidentalObjectRequest request)
        {
            var ownerId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if(ownerId == null) 
                return Unauthorized();

            var commandResult = request.ToCommand(ownerId);
            if(commandResult.IsFailure)
                return commandResult.ToActionResult();

            var result = await mediator.Send(commandResult.Value);
            
            return result.ToActionResult();
        }

        [HttpPut("{id}")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> Update(string id, [FromForm] UpdateResidentalObjectRequest request)
        {
            var commandResult = request.ToCommand(id);
            if(commandResult.IsFailure)
                return commandResult.ToActionResult();

            var result = await mediator.Send(commandResult.Value);

            return result.ToActionResult();
        }

        [HttpGet("my-objects")]
        public async Task<IActionResult> GetMyObjects()
        {
            var ownerId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (ownerId == null)
                return Unauthorized();

            var query = new GetUserResidentalObjectsQuery(ownerId);
            var result = await mediator.Send(query);

            if (result is null)
                return StatusCode(StatusCodes.Status500InternalServerError, "Unexpected error.");

            return result.ToActionResult();
        }
    }
}
