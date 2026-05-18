using SmartGrid.Domain.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SmartGrid.Application.Interfaces.Messaging
{
    public interface IResetPasswordQueueService
    {
        Task SendResetPasswordMessageAsync(string email,string setPasswordJWTToken, CancellationToken ct = default);
    }
}
