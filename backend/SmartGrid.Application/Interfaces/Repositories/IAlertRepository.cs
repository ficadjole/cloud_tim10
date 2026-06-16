using SmartGrid.Domain.ValueObjects;

namespace SmartGrid.Application.Interfaces.Repositories
{
    public interface IAlertRepository
    {
        Task AddAsync(Alert alert, CancellationToken ct = default);
        Task UpsertAsync(Alert alert, CancellationToken ct = default);
        Task<List<Alert>> QueryByDeviceIdAsync(string deviceId, CancellationToken ct = default);
    }
}
