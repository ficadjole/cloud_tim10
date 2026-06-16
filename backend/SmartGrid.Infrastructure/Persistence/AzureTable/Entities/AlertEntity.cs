namespace SmartGrid.Infrastructure.Persistence.AzureTable.Entities
{
    internal class AlertEntity : BaseTableEntity
    {
        public string AlertType { get; set; } = default!;
        public string Message { get; set; } = default!;
        public DateTime GeneratedAt { get; set; }
    }
}
