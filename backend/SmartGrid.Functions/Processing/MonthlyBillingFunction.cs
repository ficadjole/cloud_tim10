using MediatR;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;
using SmartGrid.Application.Features.Bills.Commands.GenerateMonthlyBills;

namespace SmartGrid.Functions.Processing
{
    public class MonthlyBillingFunction
    {
        private readonly IMediator _mediator;
        private readonly ILogger<MonthlyBillingFunction> _logger;

        public MonthlyBillingFunction(IMediator mediator, ILogger<MonthlyBillingFunction> logger)
        {
            _mediator = mediator;
            _logger = logger;
        }

        [Function("MonthlyBillingFunction")]
        public async Task Run([TimerTrigger("%MonthlyBillingSchedule%")] TimerInfo myTimer)
        {
            _logger.LogInformation($"Monthly billing Azure Function triggered at: {DateTime.UtcNow}");

            var result = await _mediator.Send(new GenerateMonthlyBillsCommand());

            if (result.IsFailure)
            {
                _logger.LogError($"Monthly billing process failed: {result.Error!.Message}");
            }
            else
            {
                _logger.LogInformation("Monthly billing process executed successfully for all paired meters.");
            }
        }
    }
}