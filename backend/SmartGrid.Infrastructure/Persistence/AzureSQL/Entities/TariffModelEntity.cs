using System.ComponentModel.DataAnnotations.Schema;

namespace SmartGrid.Infrastructure.Persistence.AzureSQL.Entities
{
    [Table("TariffModels")]
    public class TariffModelEntity
    {
        public Guid Id { get; set; }
        public float GHT { get; set; }
        public float GLT { get; set; }
        public float BHT { get; set; }
        public float BLT { get; set; }
        public float RHT { get; set; }
        public float RLT { get; set; }
        public float BillingPowerPrice { get; set; }
        public float SupplierCost { get; set; }
    }
}
