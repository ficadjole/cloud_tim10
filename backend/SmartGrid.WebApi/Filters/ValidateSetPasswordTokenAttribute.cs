using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using SmartGrid.Application.Interfaces;

namespace SmartGrid.WebApi.Filters
{
    public class ValidateSetPasswordTokenAttribute : ActionFilterAttribute
    {
        public override async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {

            var tokenService = context.HttpContext.RequestServices.GetRequiredService<IJwtService>();

            var token = context.HttpContext.Request.Query["token"].ToString();

            var principal = tokenService.ValidateSetPasswordToken(token);

            if (principal.IsFailure)
            {
                context.Result = new BadRequestObjectResult(new { message = "Link is not valid or experied", error = principal.Error });
                return;
            }

            var userId = principal.Value?.Claims
                .FirstOrDefault(c => c.Type == "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")
                ?.Value;

            context.HttpContext.Items["UserId"] = userId;

            await next();
        }
    }
}
