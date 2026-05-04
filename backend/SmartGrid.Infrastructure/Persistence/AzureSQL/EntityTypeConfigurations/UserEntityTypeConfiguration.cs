using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SmartGrid.Infrastructure.Persistence.AzureSQL.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SmartGrid.Infrastructure.Persistence.AzureSQL.EntityTypeConfigurations
{
    public class UserEntityTypeConfiguration : IEntityTypeConfiguration<UserEntity>
    {
        public void Configure(EntityTypeBuilder<UserEntity> builder)
        {
            builder.HasKey(builder => builder.Id);

            //ovako sql server zna da ce se id generisati automatski i da je guid
            builder.Property(builder => builder.Id)
                .HasDefaultValueSql("newid()");

            builder.Property(builder => builder.FirstName)
                .IsRequired()
                .HasMaxLength(50);

            builder.Property(builder => builder.LastName)
                 .IsRequired()
                .HasMaxLength(50);
        
            builder.Property(builder => builder.Email).IsRequired()
                .HasMaxLength(100);

            builder.Property(builder => builder.Role).HasConversion<string>();

            builder.Property(builder => builder.AccountStatus).HasConversion<string>();

             //builder.HasMany(builder => builder.ResidentalObjects)
             //   .WithOne(residentalObject => residentalObject.User)
             //   .HasForeignKey(residentalObject => residentalObject.UserId)
             //   .OnDelete(DeleteBehavior.Cascade);  

        }
    }
}
