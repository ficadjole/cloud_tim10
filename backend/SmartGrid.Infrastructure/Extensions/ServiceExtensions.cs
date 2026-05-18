using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using SmartGrid.Application.Interfaces;
using SmartGrid.Application.Interfaces.Repositories;
using SmartGrid.Infrastructure.Persistence.AzureSQL.Repositories;
using SmartGrid.Infrastructure.Services;

namespace SmartGrid.Infrastructure.Extensions
{
    internal static class ServiceExtensions
    {
        public static IServiceCollection AddServices(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddSingleton<IDateTimeProvider, DateTimeProvider>();

            services.AddScoped<IParallelSettingsProvider, ParallelSettingsProvider>();

            services.AddScoped<IDomainEventDispatcher, DomainEventDispatcher>();

            services.AddScoped<IJwtService, JwtService>();

            services.AddScoped<IPasswordHasher, PasswordHasher>();

            services.AddScoped<IEmailService, SendGridEmailService>();

            return services;
        }
    }
}
