using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using System.IO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;

namespace SmartGrid.Infrastructure.Persistence.AzureSQL.Context
{
    public class SmartMeteringDbContextFactory : IDesignTimeDbContextFactory<SmartMeteringDbContext>
    {
        public SmartMeteringDbContext CreateDbContext(string[] args)
        {
            // 1. Dobijamo putanju do foldera gde se nalazi tvoje celo rešenje (.sln)
            // Directory.GetCurrentDirectory() obično vraća koren projekta ako pokrećeš iz terminala
            var basePath = Path.Combine(Directory.GetCurrentDirectory(), "..", "SmartGrid.Functions");


            // 3. Gradimo konfiguraciju direktno iz tog drugog foldera
            var configuration = new ConfigurationBuilder()
                .SetBasePath(basePath) // Ovde mu kažemo: "Gledaj u Functions folder!"
                .AddJsonFile("local.settings.json", optional: false)
                .Build();

            var optionsBuilder = new DbContextOptionsBuilder<SmartMeteringDbContext>();

            // 3. Izvlačimo string koristeći tvoju AzureSQLOptions strukturu
            // Napomena: U local.settings.json, hijerarhija se čita preko dvotačke
            var connectionString = configuration["Values:AzureSQLOptions:ConnectionString"]
                ?? configuration.GetConnectionString("SqlConnectionString");

            if (string.IsNullOrEmpty(connectionString))
            {
                connectionString = configuration["AzureSQLOptions:ConnectionString"];
            }

            optionsBuilder.UseSqlServer(connectionString);

            return new SmartMeteringDbContext(optionsBuilder.Options);
        }
    }
}
