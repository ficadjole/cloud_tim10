namespace SmartGrid.ITSimulator.Models
{
    public class TelemetryDTO
    {
        public string SmartMeterId { get; set; } = string.Empty;
        public string DeviceName { get; set; } = string.Empty;
        public string DeviceType { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; }

        public double TotalConsumptionKWh { get; set; }
        public double CurrentLoadKW { get; set; }

        public double VoltageL1 { get; set; }
        public double? VoltageL2 { get; set; }
        public double? VoltageL3 { get; set; }

        public double CurrentL1 { get; set; }
        public double? CurrentL2 { get; set; }
        public double? CurrentL3 { get; set; }

        public double PowerFactorL1 { get; set; }
        public double? PowerFactorL2 { get; set; }
        public double? PowerFactorL3 { get; set; }
    }
}