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
    public class ResidentalObject : AggregateRoot
    {
        //on je koren, koji pod sobom drzi druge stvari, poput brojila. Preko njega ce se menjati brojilo (celina-deo)
        //objekti imaju svoj jedinstveni EntityId i oni su ti koji definišu sistem. Brojilo je tu samo kao prateći deo (uređaj) koji opslužuje taj objekat
    
        public EntityId Id { get; private set; }
        public string Name { get; private set; } = string.Empty;
        public ObjectType Type { get; private set; }
        public Address Address { get; private set; }
        public EntityId OwnerId { get; private set; }
        //brojilo koji je povezan sa ovim objektom, on je opcioni na pocetku zato imam upitnik
        public SmartMeter? ConnectedMeter { get; private set; }

        //nema u konstruktoru SmartMeter je to child
        private ResidentalObject(EntityId id, string name, ObjectType type, Address address, EntityId ownerId)
        {
            Id = id;
            Name = name;
            Type = type;
            Address = address;
            OwnerId = ownerId;
        }

        #region Factory Methods

        public static Result<ResidentalObject> Create(
           string name,
           ObjectType type, 
           string street,
           string number,
           string city,
           string ownerId)
        {
            if (string.IsNullOrWhiteSpace(name))
                return Result<ResidentalObject>.Failure("Object name is required.", ErrorType.Validation);

            if (!Enum.IsDefined(typeof(ObjectType), type))
                return Result<ResidentalObject>.Failure("Invalid Object Type.", ErrorType.Validation);

            var addressResult = Address.Create(street, number, city);
            if(addressResult.IsFailure)
                return Result<ResidentalObject>.Failure(addressResult.Error!.Message, ErrorType.Validation);

            var ownerIdResult = EntityId.Create(ownerId);
            if (ownerIdResult.IsFailure)
                return Result<ResidentalObject>.Failure("Invalid owner ID.", ErrorType.Validation);

            //kreiranje nove instance sa generisanim ID-em
            var residentalObject = new ResidentalObject(
                EntityId.New(),
                name,
                type,
                addressResult.Value,
                ownerIdResult.Value);

            //zato nisam stavila ovakvo kreiranje za brojilo kao Device-DeviceStatus, jer objekat moze da postoji na pocetku bez brojila
            //da se on kasnije doda, jer kod Device trebalo DeviceStatus vec da postoji, zato imamo metodu za povezivanje brojila sa objektom
            //device.Status = DeviceStatus.CreateDefault(device.Id, device.Type, registeredAt);

            return Result<ResidentalObject>.Success(residentalObject);
        }

        public static Result<ResidentalObject> Load(
            string id,
            string name,
            ObjectType type,
            string street,
            string number,
            string city,
            string ownerId,
            SmartMeter? connectedMeter = null)
        {
            var idResult = EntityId.Create(id);
            if(idResult.IsFailure)
                return Result<ResidentalObject>.Failure(idResult.Error!.Message, ErrorType.Validation);

            var ownerIdResult = EntityId.Create(ownerId);
            if(ownerIdResult.IsFailure)
                return Result<ResidentalObject>.Failure(ownerIdResult.Error!.Message, ErrorType.Validation);

            var addressResult = Address.Create(street, number, city);
            if(addressResult.IsFailure)
                return Result<ResidentalObject>.Failure(addressResult.Error!.Message, ErrorType.Validation);

            return Result<ResidentalObject>.Success(new ResidentalObject(
                idResult.Value,
                name,
                type,
                addressResult.Value,
                ownerIdResult.Value)
            {
                ConnectedMeter = connectedMeter
            });
        }

        #endregion

        #region Domain Logic

        //metoda za povezivanje brojila sa objektom
        public Result ConnectMeter(SmartMeter meter)
        {
            if (ConnectedMeter != null)
                return Result.Failure("This object already has an associated meter.", ErrorType.Conflict);

            ConnectedMeter = meter;
            return Result.Success();
        }

        //metoda za brisanje brojila
        public void DisconnectMeter()
        {
            if(ConnectedMeter != null)
            {
                ConnectedMeter.UnPair();
                ConnectedMeter = null;
            }
        }

        //izmena naziva i tipa objekta
        public Result UpdateBasicInfo(string newName, ObjectType newType)
        {
            if (string.IsNullOrWhiteSpace(newName))
                return Result.Failure("Object name cannot be empty.", ErrorType.Validation);

            if (!Enum.IsDefined(typeof(ObjectType), newType))
                return Result.Failure("Invalid object type.", ErrorType.Validation);

            Name = newName;
            Type = newType;

            return Result.Success();
        }

        //posebna metoda za izmenu adresa
        public Result UpdateAddress(string street, string number, string city)
        {
            var addressResult = Address.Create(street, number, city);
            if(addressResult.IsFailure)
                return Result.Failure(addressResult.Error!.Message, ErrorType.Validation);

            Address = addressResult.Value;
            return Result.Success();
        }

        #endregion
    }
}
