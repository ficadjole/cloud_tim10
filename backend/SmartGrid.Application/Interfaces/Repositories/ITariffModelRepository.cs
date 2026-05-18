using SmartGrid.Domain.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SmartGrid.Application.Interfaces.Repositories
{
    public interface ITariffModelRepository
    {
        Task<TariffModel?> GetActiveTariffAsync();
        Task SaveAsync(TariffModel tariff);
    }
}
