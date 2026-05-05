using SmartGrid.Infrastructure.Persistence.AzureTable.Common;

namespace SmartGrid.Infrastructure.Persistence.AzureTable.Entities
{
    internal class TelemetryEntity : BaseTableEntity
    {
        public string DeviceType { get; set; } = default!;
        public DateTime ObservationTime { get; set; }

        public double TotalConsumptionKWh { get; set; }
        public double CurrentLoadKW { get; set; }

        public double VoltageL1 { get; set; }
        public double CurrentL1 { get; set; }

        public double? VoltageL2 { get; set; }
        public double? CurrentL2 { get; set; }
        public double? VoltageL3 { get; set; }
        public double? CurrentL3 { get; set; }
    }
}