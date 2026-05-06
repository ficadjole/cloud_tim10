using SmartGrid.Domain.Enums;
using SmartGrid.Domain.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SmartGrid.Application.Interfaces.Repositories
{
    public interface IManualStateLogRepository
    {
        Task SaveAsync(ManualStateLog log, CancellationToken ct = default);
    }
}
