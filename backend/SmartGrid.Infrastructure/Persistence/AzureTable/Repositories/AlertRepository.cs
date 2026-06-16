using Azure.Data.Tables;
using Microsoft.Extensions.Options;
using SmartGrid.Application.Interfaces.Repositories;
using SmartGrid.Domain.ValueObjects;
using SmartGrid.Infrastructure.Common.Options;
using SmartGrid.Infrastructure.Persistence.AzureTable.Common;
using SmartGrid.Infrastructure.Persistence.AzureTable.Entities;

namespace SmartGrid.Infrastructure.Persistence.AzureTable.Repositories
{
    internal class AlertRepository(
        TableServiceClient tableServiceClient,
        ITableKeyProvider<Alert> keyProvider,
        ITableMapper<Alert, AlertEntity> mapper,
        IOptions<AzureTableOptions> options
        ) : AzureTableRepository<Alert, AlertEntity>(
              tableServiceClient.GetTableClient(options.Value.AlertsTable),
              keyProvider,
              mapper),
        IAlertRepository
    {
        public async Task<List<Alert>> QueryByDeviceIdAsync(string deviceId, CancellationToken ct = default)
        {
            return await base.QueryByPartitionKeyAsync(deviceId, ct);
        }
    }


}
