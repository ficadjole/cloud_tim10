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
        Task AddAsync(Bill bill, CancellationToken ct = default);
        Task UpdateAsync(Bill bill, CancellationToken ct = default); // Dodata metoda koja nedostaje
        Task<Bill?> GetByIdAsync(EntityId id, CancellationToken ct = default);
        Task<Bill?> GetByPeriodAsync(EntityId smartMeterId, DateTime billingPeriod, CancellationToken ct = default);
        Task<(IEnumerable<Bill> Items, int TotalCount)> GetPagedBySmartMeterIdAsync(EntityId smartMeterId, int page, int pageSize, CancellationToken ct = default);
    }
}