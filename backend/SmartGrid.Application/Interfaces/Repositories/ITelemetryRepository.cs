using SmartGrid.Domain.Models;
using SmartGrid.Domain.ValueObjects;

namespace SmartGrid.Application.Interfaces.Repositories
{
    public record ConsumptionSummary(double HighTariffKWh, double LowTariffKWh);

    public interface ITelemetryRepository
    {
        Task SaveAsync(Telemetry telemetry, CancellationToken ct = default);
        Task<IEnumerable<Telemetry>> GetHistoryAsync(
            string smartMeterId,
            DateTime start,
            DateTime end,
            CancellationToken ct = default);
        Task<Telemetry?> GetLatestAsync(string smartMeterId, CancellationToken ct = default);
        Task<ConsumptionSummary> GetConsumptionForPeriodAsync(
            EntityId smartMeterId,
            DateTime start,
            DateTime end,
            CancellationToken ct = default);
    }
}