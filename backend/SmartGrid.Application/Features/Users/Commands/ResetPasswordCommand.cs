using FluentValidation;
using MediatR;
using Microsoft.Extensions.Logging;
using SmartGrid.Application.Interfaces;
using SmartGrid.Application.Interfaces.Messaging;
using SmartGrid.Application.Interfaces.Repositories;
using SmartGrid.Domain.Common;
using SmartGrid.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SmartGrid.Application.Features.Users.Commands
{
    public record ResetPasswordCommand : IRequest<Result>
    {
        public string Email { get; init; } = string.Empty;

    }

    public class ResetPasswordValidator : AbstractValidator<ResetPasswordCommand>
    {
        public ResetPasswordValidator()
        {
            RuleFor(t => t.Email)
                .NotEmpty().WithMessage("Email is required.")
                .EmailAddress().WithMessage("Invalid email format.");
        }
    }

    internal class ResetPasswordHandler(IUserRepository userRepository,IJwtService jwtService, IResetPasswordQueueService resetPasswordQueueService,ILogger<ResetPasswordHandler> logger) : IRequestHandler<ResetPasswordCommand, Result>
    {
        public async Task<Result> Handle(ResetPasswordCommand request, CancellationToken ct)
        {
            var user = await userRepository.GetByEmailAsync(request.Email);

            if (user == null)
                return Result.Failure("No user found with the provided email.", ErrorType.NotFound);

            var resetToken = jwtService.GenerateResetPasswordToken(user.Id.Value, user.Email);

            if(resetToken.IsFailure)
                return Result.Failure("Failed to generate reset token.", ErrorType.Unexpected);

            await resetPasswordQueueService.SendResetPasswordMessageAsync(user.Email, resetToken.Value, ct);

            logger.LogInformation("Password reset requested for email: {Email}", request.Email);
            return Result.Success();
        }
    }
}