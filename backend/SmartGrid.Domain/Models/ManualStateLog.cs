using SmartGrid.Domain.Common;
using SmartGrid.Domain.Enums;
using SmartGrid.Domain.ValueObjects;

namespace SmartGrid.Domain.Models
{
    public class ManualStateLog
    {
        public EntityId Id { get; private set; }
        public EntityId SmartMeterId { get; private set; }
        public double HighTariffValue { get; private set; }
        public double LowTariffValue { get; private set; }
        public string ImageUrl { get; private set; }
        public ProcessingStatus Status { get; private set; }

        private ManualStateLog(EntityId id, EntityId smartMeterId, double highTariffValue, double lowTariffValue, string imageUrl, ProcessingStatus status)
        {
            Id = id;
            SmartMeterId = smartMeterId;
            HighTariffValue = highTariffValue;
            LowTariffValue = lowTariffValue;
            ImageUrl = imageUrl;
            Status = status;
        }

        #region Factory Methods
        public static Result<ManualStateLog> Create(string smartMeterId, double highTariffValue, double lowTariffValue, string imageUrl)
        {
            if (string.IsNullOrWhiteSpace(smartMeterId))
                return Result<ManualStateLog>.Failure("SmartMeterId cannot be empty.", ErrorType.Validation);
            if (highTariffValue < 0 || lowTariffValue < 0)
                return Result<ManualStateLog>.Failure("Tariff values cannot be negative.", ErrorType.Validation);
            if (string.IsNullOrWhiteSpace(imageUrl))
                return Result<ManualStateLog>.Failure("ImageUrl cannot be empty.", ErrorType.Validation);
            return Result<ManualStateLog>.Success(new ManualStateLog(
                EntityId.New(),
                EntityId.Create(smartMeterId).Value,
                highTariffValue,
                lowTariffValue,
                imageUrl,
                ProcessingStatus.WaitingForProcessing));
        }
        public static Result<ManualStateLog> Load(string id, string smartMeterId, double highTariffValue, double lowTariffValue, string imageUrl, ProcessingStatus status)
        {
            var idResult = EntityId.Create(id);
            if (idResult.IsFailure)
                return Result<ManualStateLog>.Failure(idResult.Error!.Message, ErrorType.Validation);
            var smartMeterIdResult = EntityId.Create(smartMeterId);
            if (smartMeterIdResult.IsFailure)
                return Result<ManualStateLog>.Failure(smartMeterIdResult.Error!.Message, ErrorType.Validation);
            if (highTariffValue < 0 || lowTariffValue < 0)
                return Result<ManualStateLog>.Failure("Tariff values cannot be negative.", ErrorType.Validation);
            if (string.IsNullOrWhiteSpace(imageUrl))
                return Result<ManualStateLog>.Failure("ImageUrl cannot be empty.", ErrorType.Validation);
            return Result<ManualStateLog>.Success(new ManualStateLog(
                idResult.Value,
                smartMeterIdResult.Value,
                highTariffValue,
                lowTariffValue,
                imageUrl,
                status));
        }

        #endregion

        #region Domain Logic

        public void MarkAsProcessed()
        {
            if (Status != ProcessingStatus.WaitingForProcessing)
                throw new InvalidOperationException("Only logs that are waiting for processing can be marked as processed.");

            Status = ProcessingStatus.Processed;
        }
        #endregion

    }
}
