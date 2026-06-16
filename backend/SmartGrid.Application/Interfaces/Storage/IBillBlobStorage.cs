namespace SmartGrid.Application.Interfaces.Storage
{
    public interface IBillBlobStorage
    {
        Task SaveBillTextReportAsync(string blobName, string content, CancellationToken ct = default);
        Task<string> GetBillTextReportAsync(string blobName, CancellationToken ct = default);
    }
}