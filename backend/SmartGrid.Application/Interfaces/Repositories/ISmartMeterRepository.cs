using SmartGrid.Domain.Common;
using SmartGrid.Domain.Models;
using SmartGrid.Domain.ValueObjects;

namespace SmartGrid.Application.Interfaces.Repositories
{
    public interface ISmartMeterRepository
    {
        Task<SmartMeter?> GetByIdAsync(EntityId id, CancellationToken ct = default);
        Task<SmartMeter?> GetBySerialNumberAsync(string serialNumber, CancellationToken ct = default);
        Task<IEnumerable<SmartMeter>> GetAllAsync(CancellationToken ct = default);
        //za proveru limita
        Task<IEnumerable<SmartMeter>> GetMetersWithActiveLimitAsync(CancellationToken ct = default);
        Task AddAsync(SmartMeter meter, CancellationToken ct = default);
        Task<Result> UpdateAsync(SmartMeter meter, CancellationToken ct = default);
        Task DeleteAsync(EntityId id, CancellationToken ct = default);
    }
}
