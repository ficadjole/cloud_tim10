using SmartGrid.Domain.ValueObjects;

namespace SmartGrid.Application.Interfaces.Messaging
{
    public interface IAlertQueueService
    {
        Task SendAlertAsync(Alert alert, CancellationToken ct = default);
        Task<IReceivedMessage<Alert>?> ReceiveAlertAsync(CancellationToken ct = default);
    }
}
