using SmartGrid.Application.Interfaces;
using System.Security.Cryptography;

namespace SmartGrid.Infrastructure.Services
{
    public class AccessTokenService : IAccessTokenService
    {
        public string GenerateAccessToken()
        {
            return Convert.ToHexString(RandomNumberGenerator.GetBytes(16));
        }
    }
}
