using SmartGrid.Domain.Common;
using SmartGrid.Domain.Enums;
using SmartGrid.Domain.ValueObjects;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SmartGrid.Domain.Models
{
    public class User
    {

        public EntityId Id { get; private set; }
        public string FirstName { get; private set; } = string.Empty;
        public string LastName { get; private set; } = string.Empty;
        public string Email { get; private set; } = string.Empty;
        public string PhoneNumber { get; private set; } = string.Empty;
        public string PasswordHash { get; private set; } = string.Empty;

        public UserRoles Role { get; private set; } = UserRoles.User;

        public UserAccountStatus AccountStatus { get; private set; } = UserAccountStatus.WaitingForConfirmation;

        public User(
            EntityId id,
            string firstName,
            string lastName,
            string email,
            string phoneNumber,
            string passwordHash,
            UserRoles role,
            UserAccountStatus accountStatus)
        {
            Id = id;
            FirstName = firstName;
            LastName = lastName;
            Email = email;
            PhoneNumber = phoneNumber;
            PasswordHash = passwordHash;
            Role = role;
            AccountStatus = accountStatus;
        }

        #region Factory Methods

        public static Result<User> Create(
                string firstName,
                string lastName,
                string email,
                string phoneNumber,
                string passwordHash,
                UserRoles role = UserRoles.User,
                UserAccountStatus accountStatus = UserAccountStatus.WaitingForConfirmation)
        {
                if (string.IsNullOrWhiteSpace(firstName))
                    return Result<User>.Failure("First name is required.", ErrorType.Validation);
    
                if (string.IsNullOrWhiteSpace(lastName))
                    return Result<User>.Failure("Last name is required.", ErrorType.Validation);
    
                if (string.IsNullOrWhiteSpace(email))
                    return Result<User>.Failure("Email is required.", ErrorType.Validation);
    
                if (string.IsNullOrWhiteSpace(phoneNumber))
                    return Result<User>.Failure("Phone number is required.", ErrorType.Validation);
    
                if (string.IsNullOrWhiteSpace(passwordHash))
                    return Result<User>.Failure("Password hash is required.", ErrorType.Validation);
                
                if(!Enum.IsDefined(typeof(UserRoles), role))
                    return Result<User>.Failure("Invalid user role.", ErrorType.Validation);

                if(!Enum.IsDefined(typeof(UserAccountStatus), accountStatus))
                    return Result<User>.Failure("Invalid account status.", ErrorType.Validation);

                var user = new User(EntityId.New(), firstName, lastName, email, phoneNumber, passwordHash, role, accountStatus);
                    return Result<User>.Success(user);
        }

        public static Result<User> Load(
            string id,
            string firstName,
            string lastName,
            string email,
            string phoneNumber,
            string passwordHash,
            UserRoles role,
            UserAccountStatus accountStatus)
        {
            var idResult = EntityId.Create(id);
            if (idResult.IsFailure)
                return Result<User>.Failure(idResult.Error!.Message, ErrorType.Validation);
        
            var user = new User(idResult.Value, firstName, lastName, email, phoneNumber, passwordHash, role, accountStatus);

            return Result<User>.Success(user);
        }

        #endregion

    }
}
