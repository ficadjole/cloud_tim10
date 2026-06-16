namespace SmartGrid.Infrastructure.Persistence.AzureSQL.Common
{
    internal interface ISQLTableMapper<TDomain, TEntity>
    {
        TEntity MapToEntity(TDomain domain);
        TDomain? MapToDomain(TEntity entity);

    }
}
