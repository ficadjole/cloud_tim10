using SmartGrid.Domain.ValueObjects;

namespace SmartGrid.Application.Interfaces.Repositories
{
    public interface IAlertRepository
    {
        Task AddAsync(Alert alert, CancellationToken ct = default);
        Task UpsertAsync(Alert alert, CancellationToken ct = default);
        Task<List<Alert>> QueryByDeviceIdAsync(string deviceId, CancellationToken ct = default);
        Task<List<Alert>> GetRecentAsync(int count = 20, CancellationToken ct = default);
    }
}
