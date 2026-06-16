using SmartGrid.Application.Features.TariffModels.Queries;
using SmartGrid.Application.Interfaces;
using SmartGrid.Domain.Models;

namespace SmartGrid.Application.Features.TariffModels.Mappers
{
    internal sealed class TariffModelMapper : IMapper<TariffModel, TariffDto>
    {
        public TariffDto Map(TariffModel source)
        {
            return new TariffDto(
                source.PriceZones.Green_HT,
                source.PriceZones.Green_LT,
                source.PriceZones.Blue_HT,
                source.PriceZones.Blue_LT,
                source.PriceZones.Red_HT,
                source.PriceZones.Red_LT,
                source.FixedCosts.BillingPowerPrice,
                source.FixedCosts.SupplierCost);
        }
    }
}
