using SmartGrid.Domain.Enums;
using SmartGrid.Domain.Models;
using SmartGrid.Domain.ValueObjects;
using SmartGrid.Infrastructure.Persistence.AzureSQL.Common;
using SmartGrid.Infrastructure.Persistence.AzureSQL.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SmartGrid.Infrastructure.Persistence.AzureSQL.Mappers
{
    internal class UserEntityMapper : ISQLTableMapper<User, UserEntity>
    {

        public UserEntity MapToEntity(User user)
        {
            return new UserEntity
            {
                Id = string.IsNullOrEmpty(user.Id.Value) ? Guid.NewGuid() : Guid.Parse(user.Id.Value),
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
                PhoneNumber = user.PhoneNumber,
                PasswordHash = user.PasswordHash,
                Role = user.Role,
                AccountStatus = user.AccountStatus
            };
        }

        public User? MapToDomain(UserEntity entity)
        {
            
            var role = Enum.TryParse<UserRoles>(entity.Role.ToString(), out var parsedRole) ? parsedRole : UserRoles.User;
            
            var accountStatus = Enum.TryParse<UserAccountStatus>(entity.AccountStatus.ToString(), out var parsedStatus) ? parsedStatus : UserAccountStatus.WaitingForConfirmation;

            var userResult = User.Load(
                id: entity.Id.ToString(),
                firstName: entity.FirstName,
                lastName: entity.LastName,
                email: entity.Email,
                phoneNumber: entity.PhoneNumber,
                passwordHash: entity.PasswordHash,
                role: role,
                accountStatus: accountStatus
            );

            if (userResult.IsFailure) {
                return null;
            }

            return userResult.Value;
        }

    }
}
