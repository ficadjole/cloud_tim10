using SmartGrid.Domain.Common;
using SmartGrid.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SmartGrid.Domain.ValueObjects
{
    public sealed record PriceListZones
    {
        public float Green_HT { get; } //HT = High Tariff (visoka tarifa)
        public float Green_LT { get; } //LT = Low Tariff (niska tarifa)
        public float Blue_HT { get; }
        public float Blue_LT { get; }
        public float Red_HT { get; }
        public float Red_LT { get; }

        private PriceListZones(float ght, float glt, float bht, float blt, float rht, float rlt) 
        {
            Green_HT = ght;
            Green_LT = glt;
            Blue_HT = bht;
            Blue_LT = blt;
            Red_HT = rht;
            Red_LT = rlt;
        }

        public static Result<PriceListZones> Create(float ght, float glt, float bht, float blt, float rht, float rlt)
        {
            if (ght < 0 || glt < 0 || bht < 0 || blt < 0 || rht < 0 || rlt < 0)
                return Result<PriceListZones>.Failure("Price cannot be negative.", ErrorType.Validation);

            return Result<PriceListZones>.Success(new PriceListZones(ght, glt, bht, blt, rht, rlt));
        }
    }
}
