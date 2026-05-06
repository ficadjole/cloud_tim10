using SmartGrid.Domain.Models;
using SmartGrid.Infrastructure.Persistence.AzureSQL.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SmartGrid.Infrastructure.Persistence.AzureSQL.Mappers
{
    public  class ManualStateLogMapper
    {
        public ManualStateLogEntity ToEntity(ManualStateLog log)
        {
            return new ManualStateLogEntity
            {
                Id = string.IsNullOrEmpty(log.Id.Value) ? Guid.NewGuid() : Guid.Parse(log.Id.Value),
                SmartMeterId = Guid.Parse(log.SmartMeterId.Value),
                HighTariffValue = log.HighTariffValue,
                LowTariffValue = log.LowTariffValue,
                ImageUrl = log.ImageUrl,
                Status = (int)log.Status
            };
        }
    }
}
