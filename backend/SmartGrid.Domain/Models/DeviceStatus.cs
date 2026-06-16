using SmartGrid.Domain.Common;
using SmartGrid.Domain.Constants;
using SmartGrid.Domain.Enums;
using SmartGrid.Domain.ValueObjects;

namespace SmartGrid.Domain.Models
{
    public class DeviceStatus
    {
        public EntityId DeviceId { get; private set; }
        public DeviceType DeviceType { get; private set; }

        public DateTime LastTelemetryReceivedAt { get; private set; }

        public double CurrentLoadKW { get; private set; }

        public double LastVoltageL1 { get; private set; }
        public double? LastVoltageL2 { get; private set; }
        public double? LastVoltageL3 { get; private set; }

        private DeviceStatus(
            EntityId deviceId,
            DeviceType deviceType,
            DateTime lastTelemetry,
            double currentLoadKW,
            double lastVoltageL1,
            double? lastVoltageL2,
            double? lastVoltageL3)
        {
            DeviceId = deviceId;
            DeviceType = deviceType;
            LastTelemetryReceivedAt = lastTelemetry;
            CurrentLoadKW = currentLoadKW;
            LastVoltageL1 = lastVoltageL1;
            LastVoltageL2 = lastVoltageL2;
            LastVoltageL3 = lastVoltageL3;

        }

        #region Factory

        public static DeviceStatus CreateDefault(
            EntityId deviceId,
            DeviceType deviceType,
            DateTime now)
        {
            return new DeviceStatus(
                deviceId,
                deviceType,
                now,
                0,
                0,
                null,
                null
            );
        }

        public static Result<DeviceStatus> Load(
            string deviceId,
            DeviceType deviceType,
            DateTime lastTelemetry,
            double currentLoadKW,
            double lastVoltageL1,
            double? lastVoltageL2,
            double? lastVoltageL3)
        {
            var idResult = EntityId.Create(deviceId);

            if (idResult.IsFailure)
            {
                return Result<DeviceStatus>.Failure(
                    idResult.Error!.Message,
                    ErrorType.Validation);
            }

            return Result<DeviceStatus>.Success(
                new DeviceStatus(
                    idResult.Value,
                    deviceType,
                    lastTelemetry,
                    currentLoadKW,
                    lastVoltageL1,
                    lastVoltageL2,
                    lastVoltageL3
                ));
        }

        #endregion

        #region Domain Logic

        public void UpdateTelemetry(Telemetry telemetry)
        {
            LastTelemetryReceivedAt = telemetry.Timestamp;

            CurrentLoadKW = telemetry.CurrentLoadKW;

            LastVoltageL1 = telemetry.VoltageL1;
            if (telemetry.VoltageL2.HasValue)
            {
                LastVoltageL2 = telemetry.VoltageL2.Value;
            }

            if (telemetry.VoltageL3.HasValue)
            {
                LastVoltageL3 = telemetry.VoltageL3.Value;
            }
        }

        public bool IsOnline(DateTime currentTime)
        {
            return currentTime - LastTelemetryReceivedAt <
                   DeviceStatusLimits.OfflineThreshold;
        }

        public bool HasVoltageDrop()
        {
            if (LastVoltageL1 == 0) return false; // nije inicijalizovan a detektuje ga kao pad i upisuje u tabelu a ne treba

            bool l1Drop = LastVoltageL1 < 190;
            bool l2Drop = LastVoltageL2.HasValue && LastVoltageL2.Value < 190;
            bool l3Drop = LastVoltageL3.HasValue && LastVoltageL3.Value < 190;

            return l1Drop || l2Drop || l3Drop;
        }

        public Alert? GetCurrentAnomaly(DateTime currentTime)
        {
            if (!IsOnline(currentTime))
            {
                return Alert.Create(
                    DeviceId,
                    AlertType.Critical,
                    $"Device offline. Last heartbeat: {LastTelemetryReceivedAt}"
                ).Value;
            }

            if (HasVoltageDrop())
            {
                var message = $"Voltage drop detected: L1={LastVoltageL1}V" +
                    (LastVoltageL2.HasValue ? $", L2={LastVoltageL2}V" : "") +
                    (LastVoltageL3.HasValue ? $", L3={LastVoltageL3}V" : "");

                return Alert.Create(DeviceId, AlertType.Critical, message).Value;
            }

            return null;
        }

        #endregion
    }
}