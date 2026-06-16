using SmartGrid.Domain.Models;

namespace SmartGrid.Application.Interfaces.Messaging
{
    public interface IUserCreatedQueueService
    {
        Task SendUserCreatedMessageAsync(User user, string setPasswordJWTToken, CancellationToken ct = default);
    }
}
