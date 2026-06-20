using FluentValidation;
using MediatR;
using Microsoft.Extensions.Logging;
using SmartGrid.Application.Interfaces.Repositories;
using SmartGrid.Domain.Common;
using SmartGrid.Domain.Enums;
using SmartGrid.Domain.ValueObjects;

namespace SmartGrid.Application.Features.ManualLogs.Commands
{
    public record RejectManualLog : IRequest<Result>
    {
        public string LogId { get; init; } = string.Empty;
    }

    public class RejectManualLogValidator : AbstractValidator<RejectManualLog>
    {
        public RejectManualLogValidator()
        {
            RuleFor(l => l.LogId).NotEmpty();
        }
    }

    internal class RejectManualLogHandler(
        IManualStateLogRepository repository,
        ILogger<RejectManualLogHandler> logger) : IRequestHandler<RejectManualLog, Result>
    {
        public async Task<Result> Handle(RejectManualLog request, CancellationToken ct)
        {
            try
            {
                var entityId = EntityId.Create(request.LogId);
                if (entityId.IsFailure)
                    return Result.Failure(entityId.Error!.Message, entityId.Error.Type);

                var manualLog = await repository.GetById(entityId.Value, ct);

                if (manualLog == null)
                    return Result.Failure($"Manual log with id {request.LogId} not found", ErrorType.NotFound);

                manualLog.MarkAsRejected();
                await repository.UpdateStatusAsync(manualLog, ct);
                logger.LogInformation("[RejectManualLog] Manual log with id {LogId} rejected successfully", request.LogId);

                return Result.Success();
            }
            catch (InvalidOperationException ex)
            {
                return Result.Failure(ex.Message, ErrorType.Validation);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "[RejectManualLog] An error occurred while rejecting manual log with id {LogId}", request.LogId);
                return Result.Failure("An unexpected error occurred while rejecting the manual log", ErrorType.Unexpected);
            }
        }
    }
}