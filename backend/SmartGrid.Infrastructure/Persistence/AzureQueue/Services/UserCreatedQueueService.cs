using Azure.Storage.Queues;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using SmartGrid.Application.Interfaces;
using SmartGrid.Application.Interfaces.Messaging;
using SmartGrid.Domain.Events;
using SmartGrid.Domain.Models;
using SmartGrid.Infrastructure.Common.Options;
using SmartGrid.Infrastructure.Persistence.AzureQueue.Mappers;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SmartGrid.Infrastructure.Persistence.AzureQueue.Services
{
    internal class UserCreatedQueueService(
         QueueServiceClient queueServiceClient,
         IJsonSerializer serializer,
         ILogger<UserCreatedQueueService> logger,
         IOptions<AzureQueueOptions> options
     ) : AzureQueueService<UserCreatedMessage>(
               queueServiceClient.GetQueueClient(options.Value.UserCreatedQueue),
               serializer,
               logger),
          IUserCreatedQueueService
    {
        public async Task SendUserCreatedMessageAsync(User user,string setPasswordJWTToken, CancellationToken ct = default)
        {
            var message = user.ToQueueMessage(setPasswordJWTToken);

            if(message != null)
            {
                await base.SendMessageAsync(message, ct);
            }
        }
    }
}
