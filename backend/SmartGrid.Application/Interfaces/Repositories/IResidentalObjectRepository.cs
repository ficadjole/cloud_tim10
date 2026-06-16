using SmartGrid.Domain.Common;
using SmartGrid.Domain.Models;
using SmartGrid.Domain.ValueObjects;

namespace SmartGrid.Application.Interfaces.Repositories
{
    public interface IResidentalObjectRepository
    {
        Task<ResidentalObject?> GetByIdAsync(EntityId id, CancellationToken ct = default);
        Task<IEnumerable<ResidentalObject>> GetByOwnerIdAsync(EntityId ownerId, CancellationToken ct = default);
        Task AddAsync(ResidentalObject residentalObject, CancellationToken ct = default);
        Task<Result> UpdateAsync(ResidentalObject residentalObject, CancellationToken ct = default);
        Task<ResidentalObject?> GetByMeterIdAsync(EntityId meterId, CancellationToken ct = default);
        Task<Result> DeleteAsync(EntityId id, CancellationToken ct = default);
    }
}
