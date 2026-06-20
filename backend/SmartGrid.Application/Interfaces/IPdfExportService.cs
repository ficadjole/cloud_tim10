namespace SmartGrid.Application.Interfaces
{
    public interface IPdfExportService
    {
        Task<byte[]> ExportToPdfAsync(string textContent, string currentStatus);
    }
}