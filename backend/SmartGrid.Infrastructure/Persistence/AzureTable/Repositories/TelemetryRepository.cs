using Azure.Data.Tables;
using Microsoft.Extensions.Options;
using SmartGrid.Application.Interfaces.Repositories;
using SmartGrid.Domain.Models;
using SmartGrid.Domain.ValueObjects;
using SmartGrid.Infrastructure.Common.Options;
using SmartGrid.Infrastructure.Persistence.AzureTable.Common;
using SmartGrid.Infrastructure.Persistence.AzureTable.Entities;

namespace SmartGrid.Infrastructure.Persistence.AzureTable.Repositories
{
    internal class TelemetryRepository(
        TableServiceClient tableServiceClient,
        ITableKeyProvider<Telemetry> keyProvider,
        ITableMapper<Telemetry, TelemetryEntity> mapper,
        IOptions<AzureTableOptions> options
    ) : AzureTableRepository<Telemetry, TelemetryEntity>(
              tableServiceClient.GetTableClient(options.Value.TelemetriesTable),
              keyProvider,
              mapper),
        ITelemetryRepository
    {
        public async Task SaveAsync(Telemetry telemetry, CancellationToken ct)
        {
            await base.AddAsync(telemetry, ct);
        }

        public async Task<Telemetry?> GetLatestAsync(string smartMeterId, CancellationToken ct)
        {
            var filter = $"PartitionKey eq '{smartMeterId}'";
            var entities = _tableClient.QueryAsync<TelemetryEntity>(filter, cancellationToken: ct);

            TelemetryEntity? latest = null;
            await foreach (var entity in entities)
            {
                latest = entity;
            }

            return latest != null ? _mapper.ToDomain(latest) : null;
        }

        public async Task<IEnumerable<Telemetry>> GetHistoryAsync(
            string smartMeterId,
            DateTime start,
            DateTime end,
            CancellationToken ct)
        {
            var results = new List<Telemetry>();

            var filter = TableClient.CreateQueryFilter(
                $"PartitionKey eq {smartMeterId} and ObservationTime ge {start:yyyy-MM-ddTHH:mm:ssZ} and ObservationTime le {end:yyyy-MM-ddTHH:mm:ssZ}");

            var entities = _tableClient.QueryAsync<TelemetryEntity>(filter, cancellationToken: ct);

            await foreach (var entity in entities)
            {
                var domain = _mapper.ToDomain(entity);
                if (domain != null)
                {
                    results.Add(domain);
                }
            }

            return results;
        }

        public async Task<ConsumptionSummary> GetConsumptionForPeriodAsync(
            EntityId smartMeterId,
            DateTime start,
            DateTime end,
            CancellationToken ct = default)
        {
            var history = await GetHistoryAsync(smartMeterId.Value, start, end, ct);
            var sortedHistory = history.OrderBy(t => t.Timestamp).ToList();

            if (sortedHistory.Count < 2)
            {
                return new ConsumptionSummary(0, 0);
            }

            var firstReading = sortedHistory.First();
            var lastReading = sortedHistory.Last();

            double totalConsumption = lastReading.TotalConsumptionKWh - firstReading.TotalConsumptionKWh;
            if (totalConsumption <= 0)
            {
                return new ConsumptionSummary(0, 0);
            }

            double highTariffCount = 0;
            double lowTariffCount = 0;

            foreach (var record in sortedHistory)
            {
                var hour = record.Timestamp.ToLocalTime().Hour;
                if (hour >= 8 && hour < 22)
                {
                    highTariffCount++;
                }
                else
                {
                    lowTariffCount++;
                }
            }

            double totalIntervals = highTariffCount + lowTariffCount;
            if (totalIntervals == 0)
            {
                return new ConsumptionSummary(0, 0);
            }

            double highTariffRatio = highTariffCount / totalIntervals;
            double lowTariffRatio = lowTariffCount / totalIntervals;

            return new ConsumptionSummary(
                totalConsumption * highTariffRatio,
                totalConsumption * lowTariffRatio
            );
        }
    }
}