using SmartGrid.Domain.Common;
using SmartGrid.Domain.Enums;
using SmartGrid.Domain.ValueObjects;

namespace SmartGrid.Domain.Models
{
    public class Telemetry
    {
        public EntityId Id { get; private set; }
        public EntityId SmartMeterId { get; private set; } 
        public DeviceType DeviceType { get; private set; } = DeviceType.Unknown;
        public DateTime Timestamp { get; private set; }
        public double TotalConsumptionKWh { get; private set; }
        public double CurrentLoadKW { get; private set; }

        // Fazna merenja (L1, L2, L3)
        public double VoltageL1 { get; private set; }
        public double? VoltageL2 { get; private set; }
        public double? VoltageL3 { get; private set; }
        public double CurrentL1 { get; private set; }
        public double? CurrentL2 { get; private set; }
        public double? CurrentL3 { get; private set; }

        private Telemetry(
            EntityId id,
            EntityId smartMeterId,
            DeviceType deviceType,
            DateTime timestamp,
            double totalConsumptionKWh,
            double currentLoadKW,
            double voltageL1,
            double currentL1,
            double? voltageL2 = null,
            double? voltageL3 = null,
            double? currentL2 = null,
            double? currentL3 = null)
        {
            Id = id;
            SmartMeterId = smartMeterId;
            DeviceType = deviceType;
            Timestamp = timestamp;
            TotalConsumptionKWh = totalConsumptionKWh;
            CurrentLoadKW = currentLoadKW;
            VoltageL1 = voltageL1;
            CurrentL1 = currentL1;
            VoltageL2 = voltageL2;
            VoltageL3 = voltageL3;
            CurrentL2 = currentL2;
            CurrentL3 = currentL3;
        }

        #region Factory Methods

        public static Result<Telemetry> Create(
            string smartMeterId,
            DeviceType deviceType,
            DateTime timestamp,
            double totalConsumptionKWh,
            double currentLoadKW,
            double voltageL1,
            double currentL1,
            double? voltageL2 = null,
            double? voltageL3 = null,
            double? currentL2 = null,
            double? currentL3 = null)
        {
            var idResult = EntityId.Create(smartMeterId);
            if (idResult.IsFailure)
                return Result<Telemetry>.Failure(idResult.Error!.Message, ErrorType.Validation);

            if (timestamp > DateTime.UtcNow)
                return Result<Telemetry>.Failure("Timestamp cannot be in the future.", ErrorType.Validation);

            if (deviceType == DeviceType.MultiPhase && (voltageL2 == null || voltageL3 == null))
                return Result<Telemetry>.Failure("MultiPhase meters must provide L2 and L3 readings.", ErrorType.Validation);

            return Result<Telemetry>.Success(new Telemetry(
                EntityId.New(),
                idResult.Value,
                deviceType,
                timestamp,
                totalConsumptionKWh,
                currentLoadKW,
                voltageL1,
                currentL1,
                voltageL2,
                voltageL3,
                currentL2,
                currentL3
            ));
        }

        public static Result<Telemetry> Load(
            string id,
            string smartMeterId,
            DeviceType deviceType,
            DateTime timestamp,
            double totalConsumptionKWh,
            double currentLoadKW,
            double voltageL1,
            double currentL1,
            double? voltageL2,
            double? voltageL3,
            double? currentL2,
            double? currentL3)
        {
            var idResult = EntityId.Create(id);
            var meterIdResult = EntityId.Create(smartMeterId);

            if (idResult.IsFailure || meterIdResult.IsFailure)
                return Result<Telemetry>.Failure("Invalid ID format.", ErrorType.Validation);

            return Result<Telemetry>.Success(new Telemetry(
                idResult.Value,
                meterIdResult.Value,
                deviceType,
                timestamp,
                totalConsumptionKWh,
                currentLoadKW,
                voltageL1,
                currentL1,
                voltageL2,
                voltageL3,
                currentL2,
                currentL3));
        }

        #endregion
    }
}