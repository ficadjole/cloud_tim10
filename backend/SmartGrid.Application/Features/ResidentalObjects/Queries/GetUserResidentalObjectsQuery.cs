using MediatR;
using Microsoft.Extensions.Logging;
using SmartGrid.Application.Interfaces;
using SmartGrid.Application.Interfaces.Repositories;
using SmartGrid.Domain.Common;
using SmartGrid.Domain.Enums;
using SmartGrid.Domain.Models;
using SmartGrid.Domain.ValueObjects;

namespace SmartGrid.Application.Features.ResidentalObjects.Queries
{
    //DTO koji vracamo frontendu
    public record ResidentalObjectDto(
        string Id,
        string Name,
        ObjectType Type,
        string FullAddress,
        string? Description,
        List<string> ConnectedMeterIds);

    public record GetUserResidentalObjectsQuery(string OwnerId) : IRequest<Result<IEnumerable<ResidentalObjectDto>>>;

    //HANDLER  
    internal class GetUserResidentalObjectsHandler(
        IResidentalObjectRepository residentalObjectRepository,
        IMapper<ResidentalObject, ResidentalObjectDto> mapper,
        ILogger<GetUserResidentalObjectsHandler> logger) : IRequestHandler<GetUserResidentalObjectsQuery, Result<IEnumerable<ResidentalObjectDto>>>
    {
        public async Task<Result<IEnumerable<ResidentalObjectDto>>> Handle(GetUserResidentalObjectsQuery request, CancellationToken cancellationToken)
        {
            try
            {
                var ownerIdResult = EntityId.Create(request.OwnerId);

                if (ownerIdResult.IsFailure)
                {
                    return Result<IEnumerable<ResidentalObjectDto>>.Failure("Invalid Owner ID format.", ErrorType.Validation);
                }

                var objects = await residentalObjectRepository.GetByOwnerIdAsync(ownerIdResult.Value, cancellationToken);

                var dtos = objects.Select(mapper.Map).ToList();

                return Result<IEnumerable<ResidentalObjectDto>>.Success(dtos);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error while retrieving residental objects for owner: {OwnerId}", request.OwnerId);
                return Result<IEnumerable<ResidentalObjectDto>>.Failure("Failed to retrieve objects.", ErrorType.Failure);
            }
        }
    }
}
