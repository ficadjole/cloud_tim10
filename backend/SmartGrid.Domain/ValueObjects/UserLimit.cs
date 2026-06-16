using SmartGrid.Domain.Common;
using SmartGrid.Domain.Enums;

namespace SmartGrid.Domain.ValueObjects
{
    public sealed record UserLimit
    {
        public double Value { get; }
        public LimitType Type { get; }

        private UserLimit(double value, LimitType type)
        {
            Value = value;
            Type = type;
        }

        public static Result<UserLimit> Create(double value, LimitType type)
        {
            if (value < 0)
                return Result<UserLimit>.Failure("Limit value cannot be negative.", ErrorType.Validation);

            return Result<UserLimit>.Success(new UserLimit(value, type));
        }
    }
}
