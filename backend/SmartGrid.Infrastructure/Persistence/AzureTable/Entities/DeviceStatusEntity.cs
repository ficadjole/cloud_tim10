namespace SmartGrid.Infrastructure.Persistence.AzureTable.Entities
{
    internal class DeviceStatusEntity : BaseTableEntity
    {
        public DateTime LastTelemetryReceived { get; set; }
        public double CurrentLoadKW { get; set; }
        public double LastVoltageL1 { get; set; }
        public double? LastVoltageL2 { get; set; }
        public double? LastVoltageL3 { get; set; }
    }
}