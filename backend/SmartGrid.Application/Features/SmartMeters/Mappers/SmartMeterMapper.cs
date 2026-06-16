using SmartGrid.Application.Features.SmartMeters.Queries;
using SmartGrid.Application.Interfaces;
using SmartGrid.Domain.Models;

namespace SmartGrid.Application.Features.SmartMeters.Mappers
{
    internal sealed class SmartMeterMapper : IMapper<SmartMeter, SmartMeterDto>
    {
        public SmartMeterDto Map(SmartMeter source)
        {
            return new SmartMeterDto(
                            source.Id.Value,
                            source.SerialNumber.Value,
                            source.ConnectionType,
                            source.MaxPower.Value,
                            source.Note,
                            source.Status,
                            source.ResidentalObjectId?.Value
                        );
        }
    }
}
