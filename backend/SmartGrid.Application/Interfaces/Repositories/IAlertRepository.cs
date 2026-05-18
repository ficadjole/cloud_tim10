using SmartGrid.Domain.ValueObjects;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SmartGrid.Application.Interfaces.Repositories
{
    public interface IAlertRepository
    {
        Task AddAsync(Alert alert, CancellationToken ct = default);
        Task UpsertAsync(Alert alert, CancellationToken ct = default);
        Task<List<Alert>> QueryByDeviceIdAsync(string deviceId, CancellationToken ct = default);
    }
}
