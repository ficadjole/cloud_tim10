using Azure.Data.Tables;
using Microsoft.Extensions.Options;
using SmartGrid.Application.Interfaces.Repositories;
using SmartGrid.Domain.Enums;
using SmartGrid.Domain.Models;
using SmartGrid.Domain.ValueObjects;
using SmartGrid.Infrastructure.Common.Options;
using SmartGrid.Infrastructure.Persistence.AzureTable.Common;
using SmartGrid.Infrastructure.Persistence.AzureTable.Entities;

namespace SmartGrid.Infrastructure.Persistence.AzureTable.Repositories
{
    internal class DeviceStatusRepository(
        TableServiceClient tableServiceClient,
        ITableKeyProvider<DeviceStatus> keyProvider,
        ITableMapper<DeviceStatus, DeviceStatusEntity> mapper,
        IOptions<AzureTableOptions> options)
    : IDeviceStatusRepository
    {
        private readonly TableClient _tableClient = tableServiceClient
            .GetTableClient(options.Value.DeviceStatusesTable);

        public async Task<DeviceStatus?> GetByIdAsync(DeviceType type, EntityId deviceId, CancellationToken ct = default)
        {
            var response = await _tableClient.GetEntityIfExistsAsync<DeviceStatusEntity>(
                type.ToString(), deviceId.Value.ToString(), cancellationToken: ct);

            if (!response.HasValue || response.Value is null) return null;
            return mapper.ToDomain(response.Value);
        }

        public async Task SaveAsync(DeviceStatus status, CancellationToken ct = default)
        {
            var entity = mapper.ToEntity(status);
            entity.PartitionKey = keyProvider.GetPartitionKey(status);
            entity.RowKey = keyProvider.GetRowKey(status);
            await _tableClient.UpsertEntityAsync(entity, TableUpdateMode.Replace, ct);
        }

        public async Task<IReadOnlyCollection<DeviceStatus>> GetOfflineSinceAsync(DateTime threshold, CancellationToken ct = default)
        {
            var thresholdTicks = threshold.Ticks.ToString();
            var filter = $"LastTelemetryReceivedAt lt '{threshold:O}'";

            var result = new List<DeviceStatus>();
            var query = _tableClient.QueryAsync<DeviceStatusEntity>(filter, cancellationToken: ct);

            await foreach (var entity in query.WithCancellation(ct))
            {
                var domain = mapper.ToDomain(entity);
                if (domain is not null)
                    result.Add(domain);
            }

            return result;
        }

        public async Task<IReadOnlyCollection<DeviceStatus>> GetAllAsync(CancellationToken ct = default)
        {
            var result = new List<DeviceStatus>();

            var query = _tableClient.QueryAsync<DeviceStatusEntity>(cancellationToken: ct);

            await foreach (var entity in query.WithCancellation(ct))
            {
                var domain = mapper.ToDomain(entity);
                if (domain is not null)
                    result.Add(domain);
            }

            return result;
        }
    }
}