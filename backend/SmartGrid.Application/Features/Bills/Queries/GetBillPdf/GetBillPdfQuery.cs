using MediatR;
using SmartGrid.Application.Interfaces;
using SmartGrid.Application.Interfaces.Repositories;
using SmartGrid.Application.Interfaces.Storage;
using SmartGrid.Domain.Common;
using SmartGrid.Domain.Enums;
using SmartGrid.Domain.ValueObjects;
using System.Threading;
using System.Threading.Tasks;

namespace SmartGrid.Application.Features.Bills.Queries.GetBillPdf
{
    public record GetBillPdfQuery(string Id) : IRequest<Result<byte[]>>;

    internal sealed class GetBillPdfQueryHandler(
        IBillRepository billRepository,
        IBillBlobStorage billBlobStorage,
        IPdfExportService pdfExportService) : IRequestHandler<GetBillPdfQuery, Result<byte[]>>
    {
        public async Task<Result<byte[]>> Handle(GetBillPdfQuery request, CancellationToken cancellationToken)
        {
            var billIdResult = EntityId.Create(request.Id);
            if (billIdResult.IsFailure)
            {
                return Result<byte[]>.Failure("Invalid bill identifier format.", ErrorType.Validation);
            }

            var bill = await billRepository.GetByIdAsync(billIdResult.Value, cancellationToken);
            if (bill == null)
            {
                return Result<byte[]>.Failure("Bill not found.", ErrorType.NotFound);
            }

            string blobName = $"{bill.OwnerId.Value}/{bill.BillingPeriod:yyyy-MM}/{bill.Id.Value}.txt";
            string textContent = await billBlobStorage.GetBillTextReportAsync(blobName);
            if (string.IsNullOrEmpty(textContent))
            {
                return Result<byte[]>.Failure("Bill text report not found.", ErrorType.NotFound);
            }

            byte[] pdfBytes = await pdfExportService.ExportToPdfAsync(textContent);
            return Result<byte[]>.Success(pdfBytes);
        }
    }
}