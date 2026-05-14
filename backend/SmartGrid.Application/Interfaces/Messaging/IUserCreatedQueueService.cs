using SmartGrid.Domain.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SmartGrid.Application.Interfaces.Messaging
{
    public interface IUserCreatedQueueService
    {
       Task SendUserCreatedMessageAsync(User user, string setPasswordJWTToken, CancellationToken ct = default);
    }
}
