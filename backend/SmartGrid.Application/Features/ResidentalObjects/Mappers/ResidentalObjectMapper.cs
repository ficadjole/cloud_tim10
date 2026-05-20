using SmartGrid.Application.Features.ResidentalObjects.Queries;
using SmartGrid.Application.Interfaces;
using SmartGrid.Domain.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SmartGrid.Application.Features.ResidentalObjects.Mappers
{
    internal sealed class ResidentalObjectMapper : IMapper<ResidentalObject, ResidentalObjectDto>
    {
        public ResidentalObjectDto Map(ResidentalObject source)
        {
            return new ResidentalObjectDto(
                source.Id.Value,
                source.Name,
                source.Type,
                $"{source.Address.Street} {source.Address.Number}, {source.Address.City}",
                source.Description,
                source.ConnectedMeter?.Id.Value
                );
        }
    }
}
