using MediatR;
using SmartGrid.Application.Interfaces.Repositories;
using SmartGrid.Domain.Common;
using SmartGrid.Domain.Enums;
using SmartGrid.Domain.ValueObjects;

namespace SmartGrid.Application.Features.Bills.Queries.GetBillsByMeter
{
    public record GetBillsByMeterQuery(string SmartMeterId, int PageNumber, int PageSize) : IRequest<Result<PagedResult<BillDto>>>;

    internal sealed class GetBillsByMeterQueryHandler(IBillRepository billRepository)
        : IRequestHandler<GetBillsByMeterQuery, Result<PagedResult<BillDto>>>
    {
        public async Task<Result<PagedResult<BillDto>>> Handle(GetBillsByMeterQuery request, CancellationToken ct)
        {
            var meterIdResult = EntityId.Create(request.SmartMeterId);
            if (meterIdResult.IsFailure)
            {
                return Result<PagedResult<BillDto>>.Failure("Invalid smart meter identifier format.", ErrorType.Validation);
            }

            var (items, totalCount) = await billRepository.GetPagedBySmartMeterIdAsync(
                meterIdResult.Value,
                request.PageNumber,
                request.PageSize,
                ct);

            var dtos = items.Select(b => new BillDto(
                b.Id.Value,
                b.SmartMeterId.Value,
                b.OwnerId.Value,
                b.BillingPeriod,
                b.HighTariffKWh,
                b.LowTariffKWh,
                b.GreenZoneAmount,
                b.BlueZoneAmount,
                b.RedZoneAmount,
                b.FixedCostsAmount,
                b.TotalAmount,
                b.Status.ToString()
            ));

            var pagedResult = new PagedResult<BillDto>(dtos, totalCount, request.PageNumber, request.PageSize);
            return Result<PagedResult<BillDto>>.Success(pagedResult);
        }
    }
}