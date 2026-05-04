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
        
        public DbSet<ResidentalObject> ResidentalObjects { get; set; }

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
