using Microsoft.AspNetCore.Mvc;
using SmartGrid.Application.Features.ResidentalObjects.Commands;
using SmartGrid.Domain.Common;
using SmartGrid.Domain.Enums;

namespace SmartGrid.WebApi.DTOs
{
    public class UpdateResidentalObjectRequest
    {
        [FromForm(Name = "Name")]
        public string Name { get; set; } = string.Empty;
        [FromForm(Name = "Type")]
        public ObjectType Type { get; set; }
        [FromForm(Name = "Street")]
        public string Street { get; set; } = string.Empty;
        [FromForm(Name = "Number")]
        public string Number { get; set; } = string.Empty;
        [FromForm(Name = "City")]
        public string City { get; set; } = string.Empty;
        [FromForm(Name = "Description")]
        public string? Description { get; set; }

        public Result<UpdateResidentalObjectCommand> ToCommand(string id)
        {
            if (string.IsNullOrWhiteSpace(id))
                return Result<UpdateResidentalObjectCommand>.Failure("Object ID is missing from the request.", ErrorType.Validation);

            if (string.IsNullOrWhiteSpace(Name))
                return Result<UpdateResidentalObjectCommand>.Failure("Name is required", ErrorType.Validation);

            if (!Enum.IsDefined(typeof(ObjectType), Type))
                return Result<UpdateResidentalObjectCommand>.Failure("Invalid object type selected.", ErrorType.Validation);

            if (string.IsNullOrWhiteSpace(Street))
                return Result<UpdateResidentalObjectCommand>.Failure("Street is required", ErrorType.Validation);

            if (string.IsNullOrWhiteSpace(Number))
                return Result<UpdateResidentalObjectCommand>.Failure("Number is required", ErrorType.Validation);

            if (string.IsNullOrWhiteSpace(City))
                return Result<UpdateResidentalObjectCommand>.Failure("City is required", ErrorType.Validation);

            return Result<UpdateResidentalObjectCommand>.Success(new UpdateResidentalObjectCommand
            {
                Id = id,
                Name = Name.Trim(),
                Type = Type,
                Street = Street.Trim(),
                Number = Number.Trim(),
                City = City.Trim(),
                Description = Description?.Trim()
            });
        }
    }
}
