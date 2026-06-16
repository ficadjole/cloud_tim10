using SmartGrid.Domain.Common;
using System.Security.Claims;

namespace SmartGrid.Application.Interfaces
{
    public interface IJwtService
    {
        Result<string> GenerateToken(string userId, string email, string role);
        Result<string> GenerateSetPasswordToken(string userId, string email);
        public Result<ClaimsPrincipal?> ValidateSetPasswordToken(string token);
    }
}
