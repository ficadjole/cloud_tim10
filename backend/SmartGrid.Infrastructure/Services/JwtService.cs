using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using SmartGrid.Application.Interfaces;
using SmartGrid.Domain.Common;
using SmartGrid.Domain.Enums;
using SmartGrid.Infrastructure.Common.Options;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace SmartGrid.Infrastructure.Services
{
    public class JwtService : IJwtService
    {
        private readonly IConfiguration _configuration;
        private readonly JwtOptions _jwtOptions;

        public JwtService(IConfiguration configuration, IOptions<JwtOptions> jwtOptions)
        {
            _configuration = configuration;
            _jwtOptions = jwtOptions.Value;
        }

        public string GenerateToken(string userId, string email, string role)
        {

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtOptions.SecretKey));

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier,userId),
                new Claim(ClaimTypes.Email,email),
                new Claim(ClaimTypes.Role, role)
            };

            var token = new JwtSecurityToken(
                issuer: _jwtOptions.Issuer,
                audience: _jwtOptions.Audience,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(_jwtOptions.ExpirationMinutes),
                signingCredentials: new SigningCredentials(key, SecurityAlgorithms.HmacSha256)
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public string GenerateSetPasswordToken(string userId, string email)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtOptions.SecretKey));
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier,userId),
                new Claim(ClaimTypes.Email,email),
                new Claim("purpose","set-password")

            };

            var token = new JwtSecurityToken(
                issuer: _jwtOptions.Issuer,
                audience: _jwtOptions.Audience,
                claims: claims,
                expires: DateTime.UtcNow.AddHours(24),
                signingCredentials: new SigningCredentials(key, SecurityAlgorithms.HmacSha256)
            );

            return Result<string>.Success(new JwtSecurityTokenHandler().WriteToken(token));
        }

        public Result<ClaimsPrincipal?> ValidateSetPasswordToken(string token)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes(_jwtOptions.SecretKey);
            try
            {
                var principal = tokenHandler.ValidateToken(token, new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidIssuer = _jwtOptions.Issuer,
                    ValidateAudience = true,
                    ValidAudience = _jwtOptions.Audience,
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.Zero
                }, out SecurityToken validatedToken);
                
                var purpose = principal.Claims.FirstOrDefault(c => c.Type == "purpose")?.Value;

                if (purpose != "set-password")
                {
                    return Result<ClaimsPrincipal?>.Failure("Invalid JWT token", ErrorType.Authentication);
                }

                return Result<ClaimsPrincipal?>.Success(principal);
            }
            catch 
            {
                return Result<ClaimsPrincipal?>.Failure("Error while validating token",ErrorType.Authentication);
            }
        }
    }
}
