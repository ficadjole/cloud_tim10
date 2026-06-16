using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using SmartGrid.Application.Common.Options;
using SmartGrid.Application.Interfaces;
using SmartGrid.Application.Interfaces.Repositories;
using SmartGrid.Application.Interfaces.Storage;
using SmartGrid.Infrastructure.Common.Options;
using SmartGrid.Infrastructure.Extensions;
using SmartGrid.Infrastructure.Persistence.AzureBlob.Storages;
using SmartGrid.Infrastructure.Persistence.AzureSQL.Context;
using SmartGrid.Infrastructure.Persistence.AzureSQL.Repositories;
using SmartGrid.Infrastructure.Services;

namespace SmartGrid.Infrastructure
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddInfrastructure(
            this IServiceCollection services,
            IConfiguration configuration)
        {
            services.Configure<AzureTableOptions>(configuration.GetSection("AzureTableOptions"));
            services.Configure<AzureBlobOptions>(configuration.GetSection("AzureBlobOptions"));
            services.Configure<AzureQueueOptions>(configuration.GetSection("AzureQueueOptions"));
            services.Configure<ParallelSettings>(configuration.GetSection("ParallelSettings"));

            services.Configure<AzureSQLOptions>(configuration.GetSection("AzureSQLOptions"));
            services.Configure<EmailOptions>(configuration.GetSection("EmailOptions"));
            services.Configure<JwtOptions>(configuration.GetSection("JwtOptions"));
            services.Configure<StripeOptions>(configuration.GetSection("StripeOptions"));

            if (configuration.GetSection("EmailOptions").Exists())
            {
                var emailOptions = configuration.GetSection("EmailOptions").Get<EmailOptions>();
            }

            if (configuration.GetSection("JwtOptions").Exists())
            {
                var jwtOptions = configuration.GetSection("JwtOptions").Get<JwtOptions>();
            }

            var sqlConn = configuration.GetValue<string>("AzureSQLOptions:ConnectionString")
                ?? throw new InvalidOperationException("AzureSQLOptions:ConnectionString is not configured.");

            services.AddDbContext<SmartMeteringDbContext>(options => options.UseSqlServer(sqlConn));

            var tableConn = configuration.GetValue<string>("AzureTableOptions:ConnectionString")
                ?? throw new InvalidOperationException("AzureTableOptions:ConnectionString is not configured.");

            var blobConn = configuration.GetValue<string>("AzureBlobOptions:ConnectionString")
                ?? throw new InvalidOperationException("AzureBlobOptions:ConnectionString is not configured.");

            var queueConn = configuration.GetValue<string>("AzureQueueOptions:ConnectionString")
                ?? throw new InvalidOperationException("AzureQueueOptions:ConnectionString is not configured.");

            services.AddJsonSerializer();
            services.AddScoped<IBillBlobStorage, BillBlobStorage>();
            services.AddScoped<IBillUserRepository, BillUserRepository>();
            services.AddScoped<IPdfExportService, PdfExportService>();

            services
                .AddServices(configuration)
                .AddAzureTables(tableConn, configuration)
                .AddAzureBlobs(blobConn)
                .AddAzureQueues(queueConn)
                .AddAzureSqlServices();

            return services;
        }
    }
}