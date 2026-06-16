using MediatR;
using SmartGrid.Application.Interfaces;
using SmartGrid.Domain.Common;

namespace SmartGrid.Application.Features.Bills.Commands
{
    public record FulfillBillPaymentCommand(string SessionId) : IRequest<Result>;

    internal sealed class FulfillBillPaymentCommandHandler(IPaymentService paymentService)
        : IRequestHandler<FulfillBillPaymentCommand, Result>
    {
        public async Task<Result> Handle(FulfillBillPaymentCommand request, CancellationToken ct)
        {
            return await paymentService.FulfillPaymentAsync(request.SessionId, ct);
        }
    }
}