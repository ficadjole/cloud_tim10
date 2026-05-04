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
        Task<User>GetByIdAsync(EntityId id);
        Task<IEnumerable<User?>> GetAllAsync();
        Task AddAsync(User user);
        Task UpdateAsync(User user);
        Task DeleteAsync(EntityId id);
    }
}
