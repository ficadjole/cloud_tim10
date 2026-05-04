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
            builder.Property(builder => builder.FirstName)
                .IsRequired()
                .HasMaxLength(50);

            builder.Property(builder => builder.LastName)
                 .IsRequired()
                .HasMaxLength(50);
        
            builder.Property(builder => builder.Email).IsRequired()
                .HasMaxLength(100);
        }
    }
}
