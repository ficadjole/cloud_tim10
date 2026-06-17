using MediatR;
using Microsoft.Extensions.Logging;
using SmartGrid.Application.Interfaces;
using SmartGrid.Application.Interfaces.Repositories;
using SmartGrid.Domain.Common;
using SmartGrid.Domain.Enums;
using SmartGrid.Domain.Models;

namespace SmartGrid.Application.Features.SmartMeters.Queries
{
    public record GetAllSmartMetersQuery : IRequest<Result<IEnumerable<SmartMeterDto>>>;

    internal class GetAllSmartMetersHandler(ISmartMeterRepository smartMeterRepository, ILogger<GetAllSmartMetersHandler> logger, IMapper<SmartMeter, SmartMeterDto> mapper) : IRequestHandler<GetAllSmartMetersQuery, Result<IEnumerable<SmartMeterDto>>>
    {

        public async Task<Result<IEnumerable<SmartMeterDto>>> Handle(GetAllSmartMetersQuery query, CancellationToken ct)
        {
            try
            {
                logger.LogInformation("Fetching all smart meters from the repository.");

                var smartMeters = await smartMeterRepository.GetAllAsync(ct);

                if (smartMeters == null)
                    return Result<IEnumerable<SmartMeterDto>>.Failure("Smart meter not found.", ErrorType.NotFound);

                var dtos = smartMeters.Select(mapper.Map);

                return Result<IEnumerable<SmartMeterDto>>.Success(dtos);

            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error while fetching all smart meters.");
                return Result<IEnumerable<SmartMeterDto>>.Failure("Failed to fetch users.", ErrorType.Failure);
            }

        }
    }
}
