using SmartGrid.ITSimulator.Models;
using System.Net.Http.Json;
using System.Text.Json;

namespace SmartGrid.ITSimulator.Services
{
    public class DeviceClient
    {
        private readonly HttpClient _httpClient;

        public DeviceClient(HttpClient httpClient)
        {
            _httpClient = httpClient ?? throw new ArgumentNullException(nameof(httpClient));
        }

        public async Task<ActivationResponse?> RegisterDeviceAsync(DeviceDTO deviceDTO)
        {
            try
            {
                using var content = new MultipartFormDataContent();
                content.Add(new StringContent(deviceDTO.SerialNumber), "SerialNumber");
                content.Add(new StringContent(deviceDTO.DeviceGuid), "DeviceGuid");

                var response = await _httpClient.PostAsync("api/SmartMeter/activate", content);

                if (response.IsSuccessStatusCode)
                {
                    var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                    var activation = await response.Content.ReadFromJsonAsync<ActivationResponse>(options);
                    Console.WriteLine($"[DEBUG] Aktivirano. MeterId: {activation?.SmartMeterId}");
                    return activation;
                }

                Console.WriteLine($"[DEBUG] Greška: {await response.Content.ReadAsStringAsync()}");
                return null;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[DEBUG] Exception: {ex.Message}");
                return null;
            }
        }
    }
}