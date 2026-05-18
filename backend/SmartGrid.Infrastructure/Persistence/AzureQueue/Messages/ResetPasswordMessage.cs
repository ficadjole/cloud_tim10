using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SmartGrid.Infrastructure.Persistence.AzureQueue.Messages
{
    public sealed class ResetPasswordMessage
    {
            public string Email { get; init; } = string.Empty;

            public string ResetPasswordJWTToken { get; init; } = string.Empty;
     
    }
}
