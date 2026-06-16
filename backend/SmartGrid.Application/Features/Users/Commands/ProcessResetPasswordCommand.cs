using FluentValidation;
using MediatR;
using Microsoft.Extensions.Logging;
using SmartGrid.Application.Interfaces;
using SmartGrid.Domain.Common;

namespace SmartGrid.Application.Features.Users.Commands
{

    public record ProcessResetPasswordCommand(string Email, string Token) : IRequest<Result>;

    public class ProcessResetPasswordValidator : AbstractValidator<ProcessResetPasswordCommand>
    {
        public ProcessResetPasswordValidator()
        {

            RuleFor(t => t.Email)
                .NotEmpty().WithMessage("Email is required.")
                .EmailAddress().WithMessage("Invalid email format.");

        }
    }

    public class ProcessResetPasswordHandler(ILogger<ProcessResetPasswordCommand> logger, IEmailService emailService) : IRequestHandler<ProcessResetPasswordCommand, Result>
    {
        public async Task<Result> Handle(ProcessResetPasswordCommand request, CancellationToken ct)
        {
            await emailService.SendResetPasswordEmailAsync(request.Email, request.Token);

            logger.LogInformation("Processed created user with email: {Email}", request.Email);

            return Result.Success();
        }
    }

}
