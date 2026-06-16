using SmartGrid.Domain.Enums;
using System.ComponentModel.DataAnnotations.Schema;

namespace SmartGrid.Infrastructure.Persistence.AzureSQL.Entities
{
    [Table("SmartMeters")]
    public class SmartMeterEntity
    {
        public Guid Id { get; set; }
        public string SerialNumber { get; set; } = null!;
        public ConnectionType ConnectionType { get; set; }
        public double MaxPower { get; set; }
        public string? Note { get; set; }
        public SmartMeterStatus Status { get; set; }
        public DateTime RegisteredAt { get; set; }
        public double? UserLimitValue { get; set; }
        public LimitType? UserLimitType { get; set; }
        public DateTime? LastLimitAlertSent { get; set; }
        public Guid? ResidentalObjectId { get; set; }
        public ResidentalObjectEntity? ResidentalObject { get; set; }
        public string? DeviceGuid { get; set; }
        public string? AccessToken { get; set; }

    }
}
