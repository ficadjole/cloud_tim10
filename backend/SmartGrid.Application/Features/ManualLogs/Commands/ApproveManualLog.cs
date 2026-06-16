using FluentValidation;
using MediatR;
using Microsoft.Extensions.Logging;
using SmartGrid.Application.Interfaces.Repositories;
using SmartGrid.Domain.Common;
using SmartGrid.Domain.Enums;
using SmartGrid.Domain.ValueObjects;

namespace SmartGrid.Application.Features.ManualLogs.Commands
{
    public record ApproveManualLog : IRequest<Result>
    {
        public string LogId { get; init; } = string.Empty;
    }

    public class ApproveManualLogValidator : AbstractValidator<ApproveManualLog>
    {
        public ApproveManualLogValidator()
        {
            RuleFor(l => l.LogId)
                .NotEmpty();
        }
    }

    internal class ApproveManualLogHandler(
        IManualStateLogRepository repository,
        ILogger<ApproveManualLogHandler> logger) : IRequestHandler<ApproveManualLog, Result>
    {
        public async Task<Result> Handle(ApproveManualLog request, CancellationToken ct)
        {
            try
            {
                var entityId = EntityId.Create(request.LogId);
                if (entityId.IsFailure)
                {
                    return Result.Failure(entityId.Error!.Message, entityId.Error.Type);
                }

                var manualLog = await repository.GetById(entityId.Value, ct);

                if (manualLog == null)
                {
                    return Result.Failure($"Manual log with id {request.LogId} not found", ErrorType.NotFound);
                }

                manualLog.MarkAsProcessed();
                await repository.UpdateStatusAsync(manualLog, ct);
                logger.LogInformation("[ApproveManualLog] Manual log with id {LogId} approved successfully", request.LogId);

                return Result.Success();
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "[ApproveManualLog] An error occurred while approving manual log with id {LogId}", request.LogId);
                return Result.Failure("An unexpected error occurred while approving the manual log", ErrorType.Unexpected);
            }
        }
    }
}
