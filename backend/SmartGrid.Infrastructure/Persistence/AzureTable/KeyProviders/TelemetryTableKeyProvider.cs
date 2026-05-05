using SmartGrid.Domain.Models;
using SmartGrid.Infrastructure.Persistence.AzureTable.Common;

namespace SmartGrid.Infrastructure.Persistence.AzureTable.KeyProviders
{
    internal class TelemetryTableKeyProvider : ITableKeyProvider<Telemetry>
    {
        public string GetPartitionKey(Telemetry model)
        {
            return model.SmartMeterId.Value;
        }

        public string GetRowKey(Telemetry model)
        {
            string invertedTicks = (DateTime.MaxValue.Ticks - model.Timestamp.Ticks).ToString("d19");

            return $"{invertedTicks}_{model.Id.Value}";
        }
    }
}
