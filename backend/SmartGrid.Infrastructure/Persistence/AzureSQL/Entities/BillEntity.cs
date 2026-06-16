using Microsoft.EntityFrameworkCore;
using SmartGrid.Domain.Enums;
using SmartGrid.Infrastructure.Persistence.AzureSQL.EntityTypeConfigurations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SmartGrid.Infrastructure.Persistence.AzureSQL.Entities
{
    [Table("Bills")]
    [EntityTypeConfiguration(typeof(BillEntityTypeConfiguration))]
    public class BillEntity
    {
        public Guid Id { get; set; }
        public Guid SmartMeterId { get; set; }
        public Guid OwnerId { get; set; }
        public DateTime BillingPeriod { get; set; }
        public double HighTariffKWh { get; set; }
        public double LowTariffKWh { get; set; }
        public double GreenZoneAmount { get; set; }
        public double BlueZoneAmount { get; set; }
        public double RedZoneAmount { get; set; }
        public double FixedCostsAmount { get; set; }
        public double TotalAmount { get; set; }
        public PaymentState Status { get; set; }
        public string? StripeSessionId { get; set; }
        public UserEntity Owner { get; set; } = null!;
    }
}