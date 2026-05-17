using Azure.Storage.Queues.Models;
using MediatR;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;
using SmartGrid.Application.Features.Users.Commands;
using SmartGrid.Infrastructure.Persistence.AzureQueue.Messages;
using System;

namespace SmartGrid.Functions.Processing;

public class ResetPasswordFunction(ILogger<ResetPasswordFunction> logger, IMediator mediator)
{

    [Function(nameof(ResetPasswordFunction))]
    public async Task Run([QueueTrigger("reset-password-queue", Connection = "AzureWebJobsStorage")] ResetPasswordMessage message)
    {
        try
        {

            var result = await mediator.Send(new ProcessResetPasswordCommand(message.Email, message.ResetPasswordJWTToken));

            if (!result.IsSuccess)
            {
                logger.LogWarning("Failed to process UserCreatedMessage for email: {Email}. Error: {ErrorMessage}", message.Email, result.Error?.Message);
                throw new Exception($"Failed to process UserCreatedMessage for email: {message.Email}. Error: {result.Error?.Message}");
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error processing UserCreatedMessage for email: {Email}", message.Email);
            throw;
        }
    }
}