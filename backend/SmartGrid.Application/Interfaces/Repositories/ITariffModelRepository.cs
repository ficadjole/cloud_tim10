using SmartGrid.Domain.Models;
using System.Threading;
using System.Threading.Tasks;

namespace SmartGrid.Application.Interfaces.Repositories
{
    public interface ITariffModelRepository
    {
        Task<TariffModel?> GetActiveTariffAsync(CancellationToken ct = default);
        Task SaveAsync(TariffModel tariff);
    }
}