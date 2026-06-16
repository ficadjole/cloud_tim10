using SmartGrid.Domain.Common;
using SmartGrid.Domain.Enums;
using System.Text.RegularExpressions;

namespace SmartGrid.Domain.ValueObjects
{
    public sealed record SerialNumber
    {
        //da li treba odvojeno tri polja kao string SM, string XXXXX, string YYYYY ili ovako da value
        public string Value { get; }
        public int ProductionYear { get; }

        private SerialNumber(string value, int productionYear)
        {
            Value = value;
            ProductionYear = productionYear;
        }

        public static Result<SerialNumber> Create(string value)
        {
            if (string.IsNullOrWhiteSpace(value))
                return Result<SerialNumber>.Failure("Serial number is required.", ErrorType.Validation);

            //Format: SA-YYYY-XXXXX (npr. SA-2026-12345 SA-godinaProizvodnje-petocifreniBroj) 
            //^ je pocetak stringa (bez njega neko bi mogao da napise "ABC-SM-2024-12345" i prošlo bi)
            //$ oznacava kraj stringa (On osigurava da se string završava odmah nakon tih 5 cifara. Bez njega, prošlo bi "SM-2024-12345-NESTO-DRUGO")
            if (!Regex.IsMatch(value, @"^SM-\d{4}-\d{5}$"))
                return Result<SerialNumber>.Failure("Invalid Serial Number format. Expected: SM-YYYY-XXXXX", ErrorType.Validation);

            //izvlacimo godinu iz stringa (pozicija od 3. do 7.karaktera)
            var yearPart = value.Substring(3, 4);
            if (!int.TryParse(yearPart, out var year))
                return Result<SerialNumber>.Failure("Could not parse production year.", ErrorType.Validation);

            //provera da godina nije u buducnosti
            if (year > DateTime.UtcNow.Year)
                return Result<SerialNumber>.Failure("Production year cannot be in the future.", ErrorType.Validation);

            return Result<SerialNumber>.Success(new SerialNumber(value, year));
        }

        public override string ToString()
        {
            return Value;
        }

        public static implicit operator string(SerialNumber serialNumber) => serialNumber.Value;
    }
}
