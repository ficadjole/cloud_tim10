using SmartGrid.Domain.Models;
using SmartGrid.Domain.ValueObjects;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SmartGrid.Application.Interfaces.Repositories
{
    public interface IResidentalObjectRepository
    {
        Task<ResidentalObject?> GetByIdAsync(EntityId id, CancellationToken ct = default);
        Task<IEnumerable<ResidentalObject>> GetByOwnerIdAsync(EntityId ownerId, CancellationToken ct = default);
        Task AddAsync(ResidentalObject residentalObject, CancellationToken ct = default);
        Task UpdateAsync(ResidentalObject residentalObject, CancellationToken ct = default);   
    }
}
