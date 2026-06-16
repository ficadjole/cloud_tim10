using Microsoft.Extensions.Configuration;
using SmartGrid.ITSimulator.Models;
using SmartGrid.ITSimulator.Services;
using SmartGrid.ITSimulator.UI;

Console.WriteLine("[DEBUG] Pokretanje programa...");
try
{
    var configuration = new ConfigurationBuilder()
        .SetBasePath(Directory.GetCurrentDirectory())
        .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
        .Build();

    var delayMs = int.Parse(configuration["SimulatorSettings:DelayMilliseconds"] ?? "30000");
    var baseApiUrl = configuration["SimulatorSettings:BaseApiUrl"] ?? throw new InvalidOperationException("API URL nije nadjen u appsettings.json");
    var activationUrl = configuration["SimulatorSettings:ActivationUrl"] ?? throw new InvalidOperationException("API URL nije nadjen u appsettings.json");

    using var activationHttpClient = new HttpClient { BaseAddress = new Uri(activationUrl) };
    var deviceClient = new DeviceClient(activationHttpClient);

    using var telemetryHttpClient = new HttpClient { BaseAddress = new Uri(baseApiUrl) };
    var publisher = new TelemetryPublisher(telemetryHttpClient);

    ConsoleUI.PrintHeader();
    string serialNumber = ConsoleUI.GetSerialNumberInput();
    string deviceGuid = Guid.NewGuid().ToString();

    Console.WriteLine($"[DEBUG] Serijski broj: {serialNumber}, GUID: {deviceGuid}");
    Console.WriteLine($"\n[SYSTEM] Pokusavam aktivaciju...");

    ActivationResponse? activation = await deviceClient.RegisterDeviceAsync(new DeviceDTO { SerialNumber = serialNumber, DeviceGuid = deviceGuid });

    if (activation == null)
    {
        Console.WriteLine("[CRITICAL] Aktivacija vratila NULL! Proveri backend/logove.");
        Console.ReadLine();
        return;
    }

    Console.WriteLine($"[DEBUG] Token dobijen: {activation.AccessToken.Substring(0, 5)}...");
    Console.WriteLine($"[DEBUG] SmartMeterId: {activation.SmartMeterId}");

    var simulator = new SimulatorService();
    var deviceType = ConsoleUI.GetDeviceTypeInput();
    ConsoleUI.PrintStartMessage(serialNumber, baseApiUrl + "/api/ReceiveTelemetry");

    while (true)
    {
        Console.WriteLine("[DEBUG] Generisanje telemetrije...");
        var telemetry = simulator.GenerateTelemetry(activation.SmartMeterId, "SmartMeter", 10.0, deviceType);

        Console.WriteLine("[DEBUG] Slanje podataka...");

        var (success, errorMessage) = await publisher.PublishSafeAsync(activation.AccessToken, telemetry);

        if (success)
            Console.WriteLine($"[{DateTime.Now:HH:mm:ss}] [SUCCESS] Poslato!");
        else
            Console.WriteLine($"[{DateTime.Now:HH:mm:ss}] [ERROR] Backend kaže: {errorMessage}");

        await Task.Delay(delayMs);
    }
}
catch (Exception ex)
{
    Console.WriteLine($"\n[FATAL ERROR] {ex.GetType().Name}: {ex.Message}");
    Console.WriteLine($"[DEBUG] StackTrace: {ex.StackTrace}");
}

Console.WriteLine("\n[SYSTEM] Pritisni bilo koji taster za kraj.");
Console.ReadLine();