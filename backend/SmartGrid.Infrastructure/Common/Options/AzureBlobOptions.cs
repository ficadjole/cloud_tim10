namespace SmartGrid.Infrastructure.Common.Options
{
    public class AzureBlobOptions
    {
        public string ConnectionString { get; init; } = string.Empty;
        public string FirmwareBlob { get; init; } = string.Empty;
        public string ManualReadingsBlob { get; init; } = string.Empty;
    }
}