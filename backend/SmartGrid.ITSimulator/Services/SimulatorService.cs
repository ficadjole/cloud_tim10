using SmartGrid.ITSimulator.Enums;
using SmartGrid.ITSimulator.Models;

namespace SmartGrid.ITSimulator.Services
{
    public class SimulatorService
    {
        private readonly Random _random;
        private readonly double _maxPowerVariation;

        public SimulatorService(double maxPowerVariation = 50)
        {
            _random = new Random();
            _maxPowerVariation = maxPowerVariation;
        }

        public TelemetryDTO GenerateTelemetry(
            string deviceId,
            string deviceName,
            double nominalPower,
            DeviceType deviceType)
        {
            if (string.IsNullOrWhiteSpace(deviceId))
                throw new ArgumentException("Device Id cannot be empty", nameof(deviceId));

            if (string.IsNullOrWhiteSpace(deviceName))
                throw new ArgumentException("Device Name cannot be empty", nameof(deviceName));

            if (nominalPower <= 0)
                throw new ArgumentException("Nominal power must be greater than zero", nameof(nominalPower));

            double currentLoadKW = _random.NextDouble() * (nominalPower + _maxPowerVariation);
            double totalConsumptionKWh = 1250.50 + (_random.NextDouble() * 10);

            bool triggerVoltageDrop = _random.Next(1, 101) <= 5;
            double baseVoltage = triggerVoltageDrop ? 180.0 : 230.0;

            double v1 = baseVoltage + (_random.NextDouble() * 6 - 3);
            double? v2 = null;
            double? v3 = null;

            double c1 = currentLoadKW * 1000 / v1;
            double? c2 = null;
            double? c3 = null;

            double pf1 = 0.85 + (_random.NextDouble() * 0.13);
            double? pf2 = null;
            double? pf3 = null;

            if (deviceType == DeviceType.MultiPhase)
            {
                v2 = baseVoltage + (_random.NextDouble() * 6 - 3);
                v3 = baseVoltage + (_random.NextDouble() * 6 - 3);

                c2 = (currentLoadKW / 3) * 1000 / v2.Value;
                c3 = (currentLoadKW / 3) * 1000 / v3.Value;

                pf2 = 0.85 + (_random.NextDouble() * 0.13);
                pf3 = 0.85 + (_random.NextDouble() * 0.13);
            }

            return new TelemetryDTO
            {
                SmartMeterId = deviceId,
                DeviceName = deviceName,
                DeviceType = deviceType.ToString(),
                Timestamp = DateTime.UtcNow,
                TotalConsumptionKWh = totalConsumptionKWh,
                CurrentLoadKW = currentLoadKW,
                VoltageL1 = v1,
                VoltageL2 = v2,
                VoltageL3 = v3,
                CurrentL1 = c1,
                CurrentL2 = c2,
                CurrentL3 = c3,
                PowerFactorL1 = pf1,
                PowerFactorL2 = pf2,
                PowerFactorL3 = pf3
            };
        }
    }
}