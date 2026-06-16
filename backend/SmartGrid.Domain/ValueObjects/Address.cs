using SmartGrid.Domain.Common;
using SmartGrid.Domain.Enums;

namespace SmartGrid.Domain.ValueObjects
{
    public sealed record Address
    {
        public string Street { get; }
        public string Number { get; }
        public string City { get; }

        private Address(string street, string number, string city)
        {
            Street = street;
            Number = number;
            City = city;
        }

        public static Result<Address> Create(string street, string number, string city)
        {
            if (string.IsNullOrWhiteSpace(street))
                return Result<Address>.Failure("Street is required.", ErrorType.Validation);

            if (string.IsNullOrWhiteSpace(number))
                return Result<Address>.Failure("Number is required.", ErrorType.Validation);

            if (string.IsNullOrWhiteSpace(city))
                return Result<Address>.Failure("City is required.", ErrorType.Validation);

            return Result<Address>.Success(new Address(street, number, city));
        }

        public override string ToString()
        {
            return $"{Street} {Number}, {City}";
        }
    }
}
