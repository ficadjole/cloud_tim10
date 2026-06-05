using System.Threading;
using System.Threading.Tasks;

namespace SmartGrid.Application.Interfaces.Storage
{
    public interface IBillBlobStorage
    {
        Task SaveBillTextReportAsync(string blobName, string content, CancellationToken ct = default);
    }
}