using SmartGrid.Domain.Events;
using SmartGrid.Domain.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SmartGrid.Infrastructure.Persistence.AzureQueue.Mappers
{
    public static class UserQueueMapper
    {

        public static UserCreatedMessage ToQueueMessage(this User user, string setPasswordJWTToken)
        {
            if (user == null) return null;

            return new UserCreatedMessage
            {
                Email = user.Email,
                FullName = user.GetFullName(),
                SetPasswordJWTToken = setPasswordJWTToken
            };
        }

    }
}
