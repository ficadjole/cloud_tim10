using SmartGrid.Domain.Common;
using SmartGrid.Domain.Models;

namespace SmartGrid.Application.Interfaces
{
    public interface IPaymentService
    {
        Task<Result<string>> CreateCheckoutSessionAsync(Bill bill, string successUrl, string cancelUrl, CancellationToken ct = default);
        Task<Result> FulfillPaymentAsync(string sessionId, CancellationToken ct = default);
    }
}