using SmartGrid.Domain.Models;
using SmartGrid.Domain.ValueObjects;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SmartGrid.Application.Interfaces.Repositories
{
    public interface IUserRepository
    {
        Task<User>GetByIdAsync(EntityId id, CancellationToken ct = default);
        Task<User> GetByEmailAsync(string email, CancellationToken ct = default);
        Task<IEnumerable<User?>> GetAllAsync();
        Task AddAsync(User user, CancellationToken ct = default);
        Task UpdateAsync(User user, CancellationToken ct = default);
        Task DeleteAsync(EntityId id, CancellationToken ct = default);
    }
}
