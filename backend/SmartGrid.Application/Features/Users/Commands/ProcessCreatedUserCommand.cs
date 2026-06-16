using FluentValidation;
using MediatR;
using Microsoft.Extensions.Logging;
using SmartGrid.Application.Interfaces;
using SmartGrid.Domain.Common;

namespace SmartGrid.Application.Features.Users.Commands
{
    public record ProcessCreatedUserCommand(string Email, string fullname, string token) : IRequest<Result>;


    public class ProcessCreatedUserValidator : AbstractValidator<ProcessCreatedUserCommand>
    {
        public ProcessCreatedUserValidator()
        {

            RuleFor(t => t.Email)
                .NotEmpty().WithMessage("Email is required.")
                .EmailAddress().WithMessage("Invalid email format.");

            RuleFor(t => t.fullname)
                .NotEmpty().WithMessage("Full name is required.");
        }
    }

    public class ProcessCreatedUserHandler(ILogger<ProcessCreatedUserHandler> logger, IEmailService emailService) : IRequestHandler<ProcessCreatedUserCommand, Result>
    {
        public async Task<Result> Handle(ProcessCreatedUserCommand request, CancellationToken ct)
        {
            await emailService.SendUserCreatedEmailAsync(request.Email, request.fullname, request.token);

            logger.LogInformation("Processed created user with email: {Email}", request.Email);

            return Result.Success();
        }
    }
}
