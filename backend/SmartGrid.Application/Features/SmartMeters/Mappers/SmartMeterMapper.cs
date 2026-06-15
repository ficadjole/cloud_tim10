using SmartGrid.Application.Features.SmartMeters.Queries;
using SmartGrid.Application.Interfaces;
using SmartGrid.Domain.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

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
