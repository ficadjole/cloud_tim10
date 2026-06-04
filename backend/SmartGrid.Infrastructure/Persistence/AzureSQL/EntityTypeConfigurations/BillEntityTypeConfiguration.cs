using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SmartGrid.Infrastructure.Persistence.AzureSQL.Entities;

namespace SmartGrid.Infrastructure.Persistence.AzureSQL.EntityTypeConfigurations
{
    public class BillEntityTypeConfiguration : IEntityTypeConfiguration<BillEntity>
    {
        public void Configure(EntityTypeBuilder<BillEntity> builder)
        {
            builder.HasKey(x => x.Id);

            builder.Property(x => x.Id)
                .HasDefaultValueSql("newid()");

            builder.Property(x => x.Status)
                .HasConversion<string>();

            builder.HasOne(x => x.Owner)
                .WithMany()
                .HasForeignKey(x => x.OwnerId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}