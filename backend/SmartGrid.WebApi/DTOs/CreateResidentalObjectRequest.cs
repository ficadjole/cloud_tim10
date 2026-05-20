using Microsoft.AspNetCore.Mvc;
using SmartGrid.Application.Features.ResidentalObjects.Commands;
using SmartGrid.Application.Features.SmartMeters.Commands;
using SmartGrid.Domain.Common;
using SmartGrid.Domain.Enums;
using SmartGrid.Domain.ValueObjects;

namespace SmartGrid.WebApi.DTOs
{
    public class CreateResidentalObjectRequest
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

        public Result<CreateResidentalObjectCommand> ToCommand(string ownerId)
        {
            if (string.IsNullOrWhiteSpace(Name))
                return Result<CreateResidentalObjectCommand>.Failure("Name is required.", ErrorType.Validation);

            if (!Enum.IsDefined(typeof(ObjectType), Type))
                return Result<CreateResidentalObjectCommand>.Failure("Invalid object type selected.", ErrorType.Validation);

            if (string.IsNullOrWhiteSpace(Street))
                return Result<CreateResidentalObjectCommand>.Failure("Street is required.", ErrorType.Validation);

            if (string.IsNullOrWhiteSpace(Number))
                return Result<CreateResidentalObjectCommand>.Failure("Number is required.", ErrorType.Validation);

            if (string.IsNullOrWhiteSpace(City))
                return Result<CreateResidentalObjectCommand>.Failure("City is required.", ErrorType.Validation);

            return Result<CreateResidentalObjectCommand>.Success(new CreateResidentalObjectCommand
            {
                Name = Name.Trim(),
                Type = Type,
                Street = Street.Trim(),
                Number = Number.Trim(),
                City = City.Trim(),
                Description = Description?.Trim(),
                OwnerId = ownerId
            });
        }
    }
}
