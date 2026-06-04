using SmartGrid.Application.Features.Bills.Commands;
using SmartGrid.Domain.Common;
using SmartGrid.Domain.Enums;

namespace SmartGrid.WebApi.DTOs
{
    public class CreateCheckoutSessionRequest
    {
        public string SuccessUrl { get; set; } = string.Empty;
        public string CancelUrl { get; set; } = string.Empty;

        public Result<CreateCheckoutSessionCommand> ToCommand(string id)
        {
            if (string.IsNullOrWhiteSpace(SuccessUrl))
                return Result<CreateCheckoutSessionCommand>.Failure("Success URL is required.", ErrorType.Validation);

            if (string.IsNullOrWhiteSpace(CancelUrl))
                return Result<CreateCheckoutSessionCommand>.Failure("Cancel URL is required.", ErrorType.Validation);

            return Result<CreateCheckoutSessionCommand>.Success(new CreateCheckoutSessionCommand(id, SuccessUrl.Trim(), CancelUrl.Trim()));
        }
    }
}