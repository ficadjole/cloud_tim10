using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SmartGrid.Infrastructure.Persistence.AzureSQL.Entities
{
    [Table("ManualStateLogs")]
    public class ManualStateLogEntity
    {
        public Guid Id { get; set; }
        public Guid SmartMeterId { get; set; }
        public double HighTariffValue { get; set; }
        public double LowTariffValue { get; set; }
        public string ImageUrl { get; set; } = null!;
        public int Status { get; set; }

    }
}
