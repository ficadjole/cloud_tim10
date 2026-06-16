using SmartGrid.Domain.Models;
using SmartGrid.Domain.ValueObjects;

namespace SmartGrid.Application.Interfaces.Repositories
{
    public interface IBillUserRepository
    {
        Task<User?> GetBillOwnerByIdAsync(EntityId id, CancellationToken ct = default);
    }
}