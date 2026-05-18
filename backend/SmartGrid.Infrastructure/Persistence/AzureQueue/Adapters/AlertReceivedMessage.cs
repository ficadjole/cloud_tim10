using SmartGrid.Application.Interfaces.Messaging;
using SmartGrid.Domain.ValueObjects;
using SmartGrid.Infrastructure.Persistence.AzureQueue.Messages;

namespace SmartGrid.Infrastructure.Persistence.AzureQueue.Adapters
{
    internal class AlertReceivedMessage(
        IReceivedMessage<AlertMessage> inner,
        Alert model
    ) : IReceivedMessage<Alert>
    {
        public Alert Body { get; } = model;

        public Task CompleteAsync() => inner.CompleteAsync();
    }
}