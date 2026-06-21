using SmartGrid.Domain.Models;
using SmartGrid.Domain.ValueObjects;


namespace SmartGrid.Application.Interfaces.Repositories
{
    public interface IManualStateLogRepository
    {
        Task SaveAsync(ManualStateLog log, CancellationToken ct = default);
        Task UpdateStatusAsync(ManualStateLog log, CancellationToken ct = default);
        Task<ManualStateLog?> GetById(EntityId id, CancellationToken ct = default);
        Task<IReadOnlyCollection<ManualStateLog>> GetAllAsync(CancellationToken ct = default);
        Task<IReadOnlyCollection<ManualStateLog>> GetBySmartMeterIdAsync(EntityId smartMeterId, CancellationToken ct = default);
    }
}
