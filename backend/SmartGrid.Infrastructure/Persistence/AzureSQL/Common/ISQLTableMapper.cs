using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SmartGrid.Infrastructure.Persistence.AzureSQL.Common
{
    internal interface ISQLTableMapper<TDomain, TEntity>
    {
        TEntity MapToEntity(TDomain domain);
        TDomain? MapToDomain(TEntity entity);
        
    }
}
