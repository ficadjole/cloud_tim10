using SmartGrid.Domain.Common;
using SmartGrid.Domain.Enums;

namespace SmartGrid.Domain.ValueObjects
{
    public sealed record PowerLimit
    {
        public double Value { get; }

        private PowerLimit(double value)
        {
            Value = value;
        }

        public static Result<PowerLimit> CreateFromType(ConnectionType type)
        {
            if (type == ConnectionType.Unknown)
                return Result<PowerLimit>.Failure("Cannot determine power limit for Unknown connection type.", ErrorType.Validation);

            double limit = type == ConnectionType.SinglePhase ? 6.9 : 11.04;
            return Result<PowerLimit>.Success(new PowerLimit(limit));
        }

        public static Result<PowerLimit> Create(double value)
        {
            if (value != 6.9 && value != 11.04)
                return Result<PowerLimit>.Failure("Invalid power limit value.", ErrorType.Validation);

            return Result<PowerLimit>.Success(new PowerLimit(value));
        }

        public override string ToString()
        {
            return $"{Value} kW";
        }
    }
}
