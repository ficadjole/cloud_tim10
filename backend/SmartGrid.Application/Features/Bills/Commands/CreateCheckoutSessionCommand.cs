using MediatR;
using SmartGrid.Application.Interfaces;
using SmartGrid.Application.Interfaces.Repositories;
using SmartGrid.Domain.Common;
using SmartGrid.Domain.Enums;
using SmartGrid.Domain.ValueObjects;

namespace SmartGrid.Application.Features.Bills.Commands
{
    public record CheckoutSessionDto(string CheckoutUrl);

    public record CreateCheckoutSessionCommand(string BillId, string SuccessUrl, string CancelUrl)
        : IRequest<Result<CheckoutSessionDto>>;

    internal sealed class CreateCheckoutSessionCommandHandler(
        IBillRepository billRepository,
        IPaymentService paymentService)
        : IRequestHandler<CreateCheckoutSessionCommand, Result<CheckoutSessionDto>>
    {
        public async Task<Result<CheckoutSessionDto>> Handle(CreateCheckoutSessionCommand request, CancellationToken ct)
        {
            var idResult = EntityId.Create(request.BillId);
            if (idResult.IsFailure)
                return Result<CheckoutSessionDto>.Failure(idResult.Error.Message, ErrorType.Validation);

            var bill = await billRepository.GetByIdAsync(idResult.Value, ct);
            if (bill == null)
                return Result<CheckoutSessionDto>.Failure($"Bill with ID {request.BillId} not found.", ErrorType.NotFound);

            var sessionResult = await paymentService.CreateCheckoutSessionAsync(
                bill,
                request.SuccessUrl,
                request.CancelUrl,
                ct
            );

            if (sessionResult.IsFailure)
                return Result<CheckoutSessionDto>.Failure(sessionResult.Error.Message, sessionResult.Error.Type);

            return Result<CheckoutSessionDto>.Success(new CheckoutSessionDto(sessionResult.Value));
        }
    }
}