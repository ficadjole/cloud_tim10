namespace SmartGrid.Application.Features.Bills.Queries.GetBillsByMeter
{
    public record PagedResult<T>(IEnumerable<T> Items, int TotalCount, int PageNumber, int PageSize);
}