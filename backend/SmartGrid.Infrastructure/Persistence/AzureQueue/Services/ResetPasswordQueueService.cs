using Azure.Storage.Queues;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using SmartGrid.Application.Interfaces;
using SmartGrid.Application.Interfaces.Messaging;
using SmartGrid.Infrastructure.Common.Options;
using SmartGrid.Infrastructure.Persistence.AzureQueue.Messages;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SmartGrid.Infrastructure.Persistence.AzureQueue.Services
{
    internal class ResetPasswordQueueService(
         QueueServiceClient queueServiceClient,
         IJsonSerializer serializer,
         ILogger<ResetPasswordQueueService> logger,
         IOptions<AzureQueueOptions> options
     ) : AzureQueueService<ResetPasswordMessage>(
               queueServiceClient.GetQueueClient(options.Value.ResetPasswordQueue),
               serializer,
               logger),
        IResetPasswordQueueService
    {
        public async Task SendResetPasswordMessageAsync(string email, string setPasswordJWTToken, CancellationToken ct = default)
        {
            
            var message = new ResetPasswordMessage
            {
                Email = email,
                ResetPasswordJWTToken = setPasswordJWTToken
            };
           
            if(message != null)
            {
                await base.SendMessageAsync(message, ct);
            }

        }
    }
}
