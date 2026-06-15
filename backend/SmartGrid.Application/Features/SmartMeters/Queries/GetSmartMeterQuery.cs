using MediatR;
using Microsoft.Extensions.Logging;
using SmartGrid.Application.Interfaces;
using SmartGrid.Application.Interfaces.Repositories;
using SmartGrid.Domain.Common;
using SmartGrid.Domain.Enums;
using SmartGrid.Domain.Models;
using SmartGrid.Domain.ValueObjects;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SmartGrid.Application.Features.SmartMeters.Queries
{
        public record SmartMeterDto(
            string Id,
            string SerialNumber,
            ConnectionType ConnectionType,
            double MaxPower,
            string? Note,
            SmartMeterStatus Status,
            string? ResidentalObjectId); // Da znamo kom objektu pripada

        public record GetSmartMeterQuery(string MeterId) : IRequest<Result<SmartMeterDto>>;

        //HANDLER
        internal class GetSmartMeterHandler(
            ISmartMeterRepository smartMeterRepository,
            IMapper<SmartMeter, SmartMeterDto> mapper,
            ILogger<GetSmartMeterHandler> logger) : IRequestHandler<GetSmartMeterQuery, Result<SmartMeterDto>>
        {
            public async Task<Result<SmartMeterDto>> Handle(GetSmartMeterQuery request, CancellationToken ct)
            {
                try
                {
                    var idResult = EntityId.Create(request.MeterId);
                    if (idResult.IsFailure)
                        return Result<SmartMeterDto>.Failure("Invalid ID format.", ErrorType.Validation);

                    var meter = await smartMeterRepository.GetByIdAsync(idResult.Value, ct);

                    if (meter == null)
                        return Result<SmartMeterDto>.Failure("Smart meter not found.", ErrorType.NotFound);

                    var dto = mapper.Map(meter);
                    return Result<SmartMeterDto>.Success(dto);
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "Error occurred while retrieving smart meter with ID: {MeterId}", request.MeterId);
                    return Result<SmartMeterDto>.Failure("An unexpected error occurred while retrieving the smart meter.", ErrorType.Failure);
                }
            }
        }
}
