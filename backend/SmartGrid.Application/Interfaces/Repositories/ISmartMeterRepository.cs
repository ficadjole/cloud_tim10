using SmartGrid.Domain.Models;
using SmartGrid.Domain.ValueObjects;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SmartGrid.Application.Interfaces.Repositories
{
    public interface ISmartMeterRepository
    {
        Task<SmartMeter?> GetByIdAsync(EntityId id);
        Task<SmartMeter?> GetBySerialNumberAsync(string serialNumber);
        Task<IEnumerable<SmartMeter>> GetAllAsync();
        //za proveru limita
        Task<IEnumerable<SmartMeter>> GetMetersWithActiveLimitAsync();
        Task AddAsync(SmartMeter meter);
        Task UpdateAsync(SmartMeter meter);
        Task DeleteAsync(EntityId id);
    }
}
