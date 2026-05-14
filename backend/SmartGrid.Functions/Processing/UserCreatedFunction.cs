using System;
using System.Threading.Tasks;
using Azure.Storage.Queues.Models;
using MediatR;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;
using SmartGrid.Application.Features.Users.Commands;
using SmartGrid.Domain.Events;

namespace SmartGrid.Functions.Processing;

public class UserCreatedFunction(ILogger<UserCreatedFunction> logger, IMediator mediator)
{

    [Function(nameof(UserCreatedFunction))]
    public async Task Run([QueueTrigger("%AzureQueueOptions:UserQueue%", Connection = "AzureWebJobsStorage")] UserCreatedMessage message)
    {
        try
        {

            var result = await mediator.Send(new ProcessCreatedUserCommand(message.Email, message.FullName, message.SetPasswordJWTToken));

            if(!result.IsSuccess)
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