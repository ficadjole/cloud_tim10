using MediatR;
using Microsoft.Extensions.Logging;
using SmartGrid.Application.Interfaces;
using SmartGrid.Application.Interfaces.Repositories;
using SmartGrid.Domain.Common;
using SmartGrid.Domain.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SmartGrid.Application.Features.TariffModels.Queries
{
    //Dto koje ce se korisiti na frontu
    public record TariffDto(
        float Green_HT, 
        float Green_LT,
        float Blue_HT,
        float Blue_LT,
        float Red_HT,
        float Red_LT,
        float BillingPowerPrice,
        float SupplierCost);
    public record GetActiveTariffQuery() : IRequest<Result<TariffDto>>;

    internal class GetActiveTariffHandler(
        ITariffModelRepository tariffModelRepository,
        IMapper<TariffModel, TariffDto> mapper,
        ILogger<GetActiveTariffHandler> logger) : IRequestHandler<GetActiveTariffQuery, Result<TariffDto>>
    {
        public async Task<Result<TariffDto>> Handle(GetActiveTariffQuery request, CancellationToken cancellationToken)
        {
            try
            {
                var tariff = await tariffModelRepository.GetActiveTariffAsync();
                if(tariff == null)
                {
                    logger.LogWarning("Active tariff model not found in the database.");
                    return Result<TariffDto>.Failure("Active tariff model not found");
                }

                var dto = mapper.Map(tariff);

                return Result<TariffDto>.Success(dto);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error while retrieving the active tariff model.");
                return Result<TariffDto>.Failure("Failed to retrieve the active tariff");
            }
        }
    }
}
