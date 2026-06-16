using MediatR;
using SmartGrid.Domain.Models;

namespace SmartGrid.Application.Features.ManualLogs.Events
{
    public record AddNewManualLogEvent(ManualStateLog manualLog) : INotification
    {
    }
}
