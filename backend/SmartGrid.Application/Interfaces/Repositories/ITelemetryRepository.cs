using SmartGrid.Domain.Models;

namespace SmartGrid.Application.Interfaces.Repositories
{
    public interface ITelemetryRepository
    {
        Task SaveAsync(Telemetry telemetry, CancellationToken ct = default);
        Task<IEnumerable<Telemetry>> GetHistoryAsync(
            string smartMeterId,
            DateTime start,
            DateTime end,
            CancellationToken ct = default);
        Task<Telemetry?> GetLatestAsync(string smartMeterId, CancellationToken ct = default);
    }
}
