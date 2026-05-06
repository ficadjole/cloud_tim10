using MediatR;
using SmartGrid.Domain.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SmartGrid.Application.Features.ManualLogs.Events
{
    public record AddNewManualLogEvent(ManualStateLog manualLog) : INotification
    {
    }
}
