using Azure.Storage.Blobs;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using SmartGrid.Application.Common;
using SmartGrid.Application.Common.Extensions;
using SmartGrid.Application.Interfaces.Storage;
using SmartGrid.Infrastructure.Common.Options;

namespace SmartGrid.Infrastructure.Persistence.AzureBlob.Storages
{
    internal class ManualStateLogBlobStorage(
        BlobServiceClient blobServiceClient,
        ILogger<ManualStateLogBlobStorage> logger,
        IOptions<AzureBlobOptions> options
    )
        : AzureBlobStorage<ImageMetadata>(
            blobServiceClient.GetBlobContainerClient(options.Value.ManualReadingsBlob),
            logger),
          IManualLogBlob
    {
        public override string GetBlobPath(ImageMetadata metadata)
        {
            return ManualReadingPathExtensions.GetManualReadingBlobPath(metadata, metadata.SmartMeterId);
        }
    }
}