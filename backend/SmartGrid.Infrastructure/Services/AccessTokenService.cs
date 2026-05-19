using SmartGrid.Application.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

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
