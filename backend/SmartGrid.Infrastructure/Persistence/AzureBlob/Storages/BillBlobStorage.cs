using Azure.Storage.Blobs;
using Microsoft.Extensions.Options;
using SmartGrid.Application.Interfaces.Storage;
using SmartGrid.Infrastructure.Common.Options;
using System.IO;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace SmartGrid.Infrastructure.Persistence.AzureBlob.Storages
{
    public class BillBlobStorage : IBillBlobStorage
    {
        private readonly BlobServiceClient _blobServiceClient;
        private readonly string _containerName;

        public BillBlobStorage(BlobServiceClient blobServiceClient, IOptions<AzureBlobOptions> blobOptions)
        {
            _blobServiceClient = blobServiceClient;
            _containerName = "invoices";
        }

        public async Task SaveBillTextReportAsync(string blobName, string content, CancellationToken ct = default)
        {
            var containerClient = _blobServiceClient.GetBlobContainerClient(_containerName);
            await containerClient.CreateIfNotExistsAsync(cancellationToken: ct);

            var blobClient = containerClient.GetBlobClient(blobName);
            using var stream = new MemoryStream(Encoding.UTF8.GetBytes(content));

            await blobClient.UploadAsync(stream, overwrite: true, cancellationToken: ct);
        }
    }
}