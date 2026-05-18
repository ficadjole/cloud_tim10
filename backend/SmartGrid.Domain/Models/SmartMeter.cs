using SmartGrid.Domain.Common;
using SmartGrid.Domain.Enums;
using SmartGrid.Domain.ValueObjects;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SmartGrid.Domain.Models
{
    public class SmartMeter : AggregateRoot
    {
        //on ce biti povezan sa ResidentalObject ali moze postojati i samostalno dok se ne upari
        //zato i ima AggregateRoot jer moze da postoji bez objekta

        //PITANJE: da li je Serial number i oznaka brojila (label) ista stvar ili je posebno
        public EntityId Id { get; private set; }
        public SerialNumber SerialNumber { get; private set; }
        public ConnectionType ConnectionType { get; private set; }
        public PowerLimit MaxPower {  get; private set; }
        public string? Note {  get; private set; } //nije obavezna
        public SmartMeterStatus Status { get; private set; }
        public UserLimit? UserLimit { get; private set; }
        public DateTime? LastLimitAlertSent { get; private set; } //cuva godinu i mesec
        public DateTime RegisteredAt { get; private set; }

        private SmartMeter(EntityId id, SerialNumber serialNumber, ConnectionType connectionType, PowerLimit maxPower, SmartMeterStatus status, DateTime registeredAt, string? note, UserLimit? userLimit = null)
        {
            Id = id;
            SerialNumber = serialNumber;
            ConnectionType = connectionType;
            MaxPower = maxPower;
            Status = status;
            RegisteredAt = registeredAt;
            Note = note;
            UserLimit = userLimit;
        }

        #region Factory Methods

        public static Result<SmartMeter> Create(
            string serialNumberRaw,
            ConnectionType type,
            string? note = null)
        {
            var serialResult = SerialNumber.Create(serialNumberRaw);
            if (serialResult.IsFailure)
                return Result<SmartMeter>.Failure(serialResult.Error!.Message, ErrorType.Validation);

            var powerResult = PowerLimit.CreateFromType(type);
            if(powerResult.IsFailure)
                return Result<SmartMeter>.Failure(powerResult.Error!.Message, ErrorType.Validation);

            return Result<SmartMeter>.Success(new SmartMeter(
                EntityId.New(),
                serialResult.Value,
                type,
                powerResult.Value,
                SmartMeterStatus.UnPaired,
                DateTime.UtcNow,
                note));
        }

        public static Result<SmartMeter> Load(
            string id,
            string serialNumberRaw,
            ConnectionType type,
            double maxPowerValue,
            SmartMeterStatus status,
            DateTime registeredAt,
            string? note,
            UserLimit? userLimit,
            DateTime? lastLimitAlertSent)
        {
            var idResult = EntityId.Create(id);
            if (idResult.IsFailure)
                return Result<SmartMeter>.Failure(idResult.Error!.Message, ErrorType.Validation);

            var serialResult = SerialNumber.Create(serialNumberRaw);

            var powerResult = PowerLimit.Create(maxPowerValue);

            var meter = new SmartMeter(
                idResult.Value,
                serialResult.Value,
                type,
                powerResult.Value,
                status,
                registeredAt,
                note,
                userLimit);

            meter.LastLimitAlertSent = lastLimitAlertSent;

            return Result<SmartMeter>.Success(meter);
        }

        #endregion

        #region Domain Logic

        // Menja korisnički limit (RSD ili kWh). 
        // Pokriva deo zahteva o "izmeni brojila".
        public Result SetUserLimit(double value, LimitType type)
        {
            var limitResult = UserLimit.Create(value, type);
            if(limitResult.IsFailure)
                return Result.Failure(limitResult.Error!.Message, ErrorType.Validation);

            UserLimit = limitResult.Value;
            return Result.Success();
        }

        // Ažurira napomenu brojila.
        public void UpdateNote(string? newNote)
        {
            Note = newNote;
        }

        // !!!!!!!ovo mozda i ne treba proveriti jos
        //Menja tip priključka i automatski rekalkuliše maksimalnu snagu (6.9 ili 11.04 kW).
        public Result UpdateConnectionType(ConnectionType newType)
        {
            if (newType == ConnectionType.Unknown)
                return Result.Failure("Invalid connnection type.", ErrorType.Validation);

            if(ConnectionType != newType)
            {
                var powerResult = PowerLimit.CreateFromType(newType);
                if (powerResult.IsFailure) return powerResult;

                ConnectionType = newType;
                MaxPower = powerResult.Value;
            }
            return Result.Success();
        }

        //metode za upravljanje zivotnim ciklusom (dodavanje i brisanje objekta)
        public void Pair() => Status = SmartMeterStatus.Paired;
        public void UnPair() => Status = SmartMeterStatus.UnPaired;

        public void MarkAlertAsSent()
        {
            LastLimitAlertSent = DateTime.UtcNow;
        }

        public bool ShouldSendAlert()
        {
            if(UserLimit == null) return false;
            if(LastLimitAlertSent == null) return false;

            return LastLimitAlertSent.Value.Month != DateTime.UtcNow.Month || LastLimitAlertSent.Value.Year != DateTime.UtcNow.Year;
        }

        #endregion
    }
}
