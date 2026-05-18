using System;
using System.Net.Http.Json;
using System.Text.Json;
using System.Threading.Tasks;
using SmartGrid.ITSimulator.Models;

namespace SmartGrid.ITSimulator.Services
{
    public class TelemetryPublisher
    {
        private readonly HttpClient _httpClient;
        private readonly JsonSerializerOptions _jsonOptions;

        public TelemetryPublisher(HttpClient httpClient)
        {
            _httpClient = httpClient ?? throw new ArgumentNullException(nameof(httpClient));
            _jsonOptions = new JsonSerializerOptions
            {
                PropertyNamingPolicy = null // Zadržava PascalCase
            };
        }

        public async Task<(bool Success, string Message)> PublishAsync(TelemetryDTO telemetry)
        {
            ArgumentNullException.ThrowIfNull(telemetry);

            try
            {
                var response = await _httpClient.PostAsJsonAsync(
                    $"{_httpClient.BaseAddress}api/ReceiveTelemetry",
                    telemetry,
                    _jsonOptions
                );

                if (response.IsSuccessStatusCode)
                {
                    return (true, "Success");
                }
                else
                {
                    // ISPRAVLJENO: Čitamo čist string bez one moje izmišljene metode
                    string errorContent = await response.Content.ReadAsStringAsync();
                    return (false, errorContent);
                }
            }
            catch (HttpRequestException ex)
            {
                throw new InvalidOperationException($"Failed to publish telemetry.", ex);
            }
        }

        public async Task<(bool Success, string? ErrorMessage)> PublishSafeAsync(TelemetryDTO telemetry)
        {
            try
            {
                var (success, message) = await PublishAsync(telemetry);
                return (success, success ? null : message);
            }
            catch (Exception ex)
            {
                return (false, ex.Message);
            }
        }
    }
}