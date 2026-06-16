using Microsoft.EntityFrameworkCore;
using SmartGrid.Domain.Enums;
using SmartGrid.Infrastructure.Persistence.AzureSQL.EntityTypeConfigurations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SmartGrid.Infrastructure.Persistence.AzureSQL.Entities
{
    [Table("Users")]
    [EntityTypeConfiguration(typeof(UserEntityTypeConfiguration))]
    public class UserEntity
    {
        public Guid Id { get; set; }
        public string FirstName { get; set; } = null!;
        public string LastName { get; set; } = null!;

        public string Email { get; set; } = null!;

        public string PhoneNumber { get; set; } = null!;

        public string PasswordHash { get; set; } = null!;

        public UserRoles Role { get; set; } = UserRoles.User;

        public UserAccountStatus AccountStatus { get; set; } = UserAccountStatus.WaitingForConfirmation;

        public ICollection<ResidentalObjectEntity> ResidentalObjects { get; set; } = null!;

    }
}
