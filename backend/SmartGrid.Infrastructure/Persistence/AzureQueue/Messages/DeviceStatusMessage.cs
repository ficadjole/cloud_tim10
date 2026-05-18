using SmartGrid.Domain.Enums;

namespace SmartGrid.Infrastructure.Persistence.AzureQueue.Messages
{
    public class DeviceStatusMessage
    {
        public string DeviceId { get; set; } = string.Empty;
        public DeviceType DeviceType { get; set; }
        // SNAPSHOT
        public double CurrentLoadKW { get; set; }
        // STATUS
        public DateTime LastTelemetryReceivedAt { get; set; }
        //FIRMWARE STATUS
        public double LastVoltageL1 { get; set; }
        public double? LastVoltageL2 { get; set; }
        public double? LastVoltageL3 { get; set; }
    }
}
