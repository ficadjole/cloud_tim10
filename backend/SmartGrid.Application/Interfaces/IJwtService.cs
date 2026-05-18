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
        Result<string> GenerateToken(string userId, string email, string role);
        Result<string> GenerateSetPasswordToken(string userId, string email);
        public Result<string> GenerateResetPasswordToken(string userId, string email);
        public Result<ClaimsPrincipal?> ValidateResetPasswordToken(string token);
        public Result<ClaimsPrincipal?> ValidateSetPasswordToken(string token);
    }
}
