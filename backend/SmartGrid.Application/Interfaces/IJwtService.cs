using SmartGrid.Domain.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace SmartGrid.Application.Interfaces
{
    public interface IJwtService
    {
        string GenerateToken(string userId, string email, string role);
        string GenerateSetPasswordToken(string userId, string email);
        public Result<ClaimsPrincipal?> ValidateSetPasswordToken(string token);
    }
}
