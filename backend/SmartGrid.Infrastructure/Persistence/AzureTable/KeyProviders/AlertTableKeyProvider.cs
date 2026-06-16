using SmartGrid.Domain.ValueObjects;
using SmartGrid.Infrastructure.Persistence.AzureTable.Common;

namespace SmartGrid.Infrastructure.Persistence.AzureTable.KeyProviders
{
    internal class AlertTableKeyProvider : ITableKeyProvider<Alert>
    {
        public string GetPartitionKey(Alert model)
        {
            return model.DeviceId.Value;
        }

        public string GetRowKey(Alert model)
        {
            string invertedTicks = (DateTime.MaxValue.Ticks - model.Timestamp.Ticks).ToString("d19");

            return $"{invertedTicks}_{Guid.NewGuid()}";
        }
    }
}
