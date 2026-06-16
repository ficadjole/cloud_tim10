using SmartGrid.Domain.Models;

namespace SmartGrid.Application.Interfaces.Repositories
{
    public interface ITariffModelRepository
    {
        Task<TariffModel?> GetActiveTariffAsync(CancellationToken ct = default);
        Task SaveAsync(TariffModel tariff);
    }
}