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
        Task<ResidentalObject?> GetByIdAsync(EntityId id);
        Task<IEnumerable<ResidentalObject>> GetByOwnerIdAsync(EntityId ownerId);
        Task AddAsync(ResidentalObject residentalObject);
        Task UpdateAsync(ResidentalObject residentalObject);   
    }
}
