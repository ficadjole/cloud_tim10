using Microsoft.EntityFrameworkCore;
using SmartGrid.Infrastructure.Persistence.AzureSQL.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SmartGrid.Infrastructure.Persistence.AzureSQL.Context
{
    public class SmartMeteringDbContext : DbContext
    {
        public SmartMeteringDbContext(DbContextOptions options) : base(options)
        {
        }

        protected SmartMeteringDbContext()
        {
        }

        public DbSet<UserEntity> Users {get; set; }
        public DbSet<ResidentalObjectEntity> ResidentalObjects { get; set; }
        public DbSet<SmartMeterEntity> SmartMeters { get; set; }
        public DbSet<TariffModelEntity> TariffModels { get; set; }
        public DbSet<ManualStateLogEntity> ManualStateLogs { get; set; }
        public DbSet<BillEntity> Bills { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.ApplyConfigurationsFromAssembly(typeof(SmartMeteringDbContext).Assembly);

            modelBuilder.Entity<TariffModelEntity>().HasKey(t => t.Id);
            modelBuilder.Entity<ManualStateLogEntity>().HasKey(m => m.Id);
        }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {

            if (!optionsBuilder.IsConfigured)
            {
                string connectionString = Environment.GetEnvironmentVariable("SqlConnectionString");

                if(!string.IsNullOrEmpty(connectionString))
                {
                    optionsBuilder.UseSqlServer(connectionString);
                }

            }


        }
    }
}
