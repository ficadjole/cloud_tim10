using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using SmartGrid.Application.Interfaces;
using SmartGrid.Infrastructure.Services;
using System.Text;


namespace SmartGrid.Infrastructure.Extensions
{
    public static class AuthentificationExtensions
    {

        public static IServiceCollection AddJwtAuthentification(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = configuration["JwtOptions:Issuer"],
                    ValidAudience = configuration["JwtOptions:Audience"],
                    IssuerSigningKey = new SymmetricSecurityKey(
                        Encoding.UTF8.GetBytes(configuration["JwtOptions:SecretKey"]))
                };

                options.Events = new JwtBearerEvents { 
                    
                    OnChallenge = context =>
                    {
                    
                        context.HandleResponse();

                        context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                        context.Response.ContentType = "application/json";

                        var resposne = new
                        {
                            error = "Unauthorized",
                            message = "You are not authorized to access this resource."
                        };

                        return context.Response.WriteAsJsonAsync(resposne);
                    },

                    OnForbidden = context =>
                    {
                        context.Response.StatusCode = StatusCodes.Status403Forbidden;
                        context.Response.ContentType = "application/json";
                        var resposne = new
                        {
                            error = "Forbidden",
                            message = "You do not have permission to access this resource."
                        };
                        return context.Response.WriteAsJsonAsync(resposne);
                    },

                };

            });

            services.AddScoped<IJwtService, JwtService>();
            return services;
        }
    }
}
