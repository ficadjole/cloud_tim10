using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using SmartGrid.Domain.Models;
using SmartGrid.Domain.ValueObjects;

namespace SmartGrid.Application.Interfaces.Repositories
{
    public interface IBillRepository
    {
        Task<Bill?> GetByIdAsync(EntityId id, CancellationToken ct = default);
        Task<IEnumerable<Bill>> GetByOwnerIdAsync(EntityId ownerId, CancellationToken ct = default);
        Task AddAsync(Bill bill, CancellationToken ct = default);
        Task UpdateAsync(Bill bill, CancellationToken ct = default);
    }
}