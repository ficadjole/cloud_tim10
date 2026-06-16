using SmartGrid.Domain.Events;
using SmartGrid.Domain.Models;

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
