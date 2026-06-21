using MediatR;
using SmartGrid.Application.Interfaces.Repositories;
using SmartGrid.Domain.Common;
using SmartGrid.Domain.Enums;
using SmartGrid.Domain.ValueObjects;

namespace SmartGrid.Application.Features.Bills.Queries.GetBillsByOwner
{
    public record PagedResult<T>(IEnumerable<T> Items, int TotalCount, int PageNumber, int PageSize);

    public record BillOwnerDto(
        string Id,
        string SmartMeterId,
        string OwnerId,
        DateTime BillingPeriod,
        double HighTariffKWh,
        double LowTariffKWh,
        double GreenZoneAmount,
        double BlueZoneAmount,
        double RedZoneAmount,
        double FixedCostsAmount,
        double TotalAmount,
        string Status);

    public record GetBillsByOwnerQuery(string OwnerId, int PageNumber, int PageSize)
        : IRequest<Result<PagedResult<BillOwnerDto>>>;

    internal sealed class GetBillsByOwnerQueryHandler(IBillRepository billRepository)
        : IRequestHandler<GetBillsByOwnerQuery, Result<PagedResult<BillOwnerDto>>>
    {
        public async Task<Result<PagedResult<BillOwnerDto>>> Handle(GetBillsByOwnerQuery request, CancellationToken ct)
        {
            var ownerIdResult = EntityId.Create(request.OwnerId);
            if (ownerIdResult.IsFailure)
                return Result<PagedResult<BillOwnerDto>>.Failure("Invalid owner identifier format.", ErrorType.Validation);

            var (items, totalCount) = await billRepository.GetPagedByOwnerIdAsync(
                ownerIdResult.Value,
                request.PageNumber,
                request.PageSize,
                ct);

            var dtos = items.Select(b => new BillOwnerDto(
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

            var pagedResult = new PagedResult<BillOwnerDto>(dtos, totalCount, request.PageNumber, request.PageSize);
            return Result<PagedResult<BillOwnerDto>>.Success(pagedResult);
        }
    }
}