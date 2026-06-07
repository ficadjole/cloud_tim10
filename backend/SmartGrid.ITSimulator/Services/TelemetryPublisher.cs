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
                PropertyNamingPolicy = null
            };
        }

        public async Task<(bool Success, string Message)> PublishAsync(string accessToken, TelemetryDTO telemetry)
        {
            ArgumentNullException.ThrowIfNull(telemetry);

            if (string.IsNullOrWhiteSpace(accessToken))
                return (false, "Access token is missing.");

            try
            {
                var request = new HttpRequestMessage(HttpMethod.Post, "api/ReceiveTelemetry");

                request.Headers.Add("X-Device-Token", accessToken);

                request.Content = JsonContent.Create(telemetry, options: _jsonOptions);

                var response = await _httpClient.SendAsync(request);

                if (response.IsSuccessStatusCode)
                    return (true, "Success");

                string errorContent = await response.Content.ReadAsStringAsync();
                return (false, $"Status: {response.StatusCode}, Content: {errorContent}");
            }
            catch (Exception ex)
            {
                return (false, ex.Message);
            }
        }

        public async Task<(bool Success, string? ErrorMessage)> PublishSafeAsync(string accessToken, TelemetryDTO telemetry)
        {
            try
            {
                var (success, message) = await PublishAsync(accessToken, telemetry);
                return (success, success ? null : message);
            }
            catch (Exception ex)
            {
                return (false, ex.Message);
            }
        }
    }
}