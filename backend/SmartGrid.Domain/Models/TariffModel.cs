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
    public class TariffModel
    {
        public PriceListZones PriceZones { get; private set; }
        public FixedCosts FixedCosts { get; private set; }

        private TariffModel(PriceListZones priceZones, FixedCosts fixedCosts)
        {
            PriceZones = priceZones;
            FixedCosts = fixedCosts;
        }

        #region Factory Methods

        public static Result<TariffModel> Create(
                    float ght, float glt, float bht, float blt, float rht, float rlt, // Za PriceListZones
                    float billingPowerPrice, float supplierCost)                      // Za FixedCosts
        {

            var zonesResult = PriceListZones.Create(ght, glt, bht, blt, rht, rlt);
            if (zonesResult.IsFailure)
                return Result<TariffModel>.Failure(zonesResult.Error!.Message, ErrorType.Validation);

            var costsResult = FixedCosts.Create(billingPowerPrice, supplierCost);
            if(costsResult.IsFailure)
                return Result<TariffModel>.Failure(costsResult.Error!.Message, ErrorType.Validation);

            return Result<TariffModel>.Success(new TariffModel(zonesResult.Value, costsResult.Value));
        }

        public static Result<TariffModel> Load(
                float ght, float glt, float bht, float blt, float rht, float rlt,
                float billingPowerPrice, float supplierCost)
        {
            var zonesResult = PriceListZones.Create(ght, glt, bht, blt, rht, rlt);
            var costsResult = FixedCosts.Create(billingPowerPrice, supplierCost);

            return Result<TariffModel>.Success(new TariffModel(
                zonesResult.Value,
                costsResult.Value));
        }

        #endregion

        #region Domain Logic

        //ovo zbog ovoga (administrator): Управљање тарифним моделима: Дефинисање цене за ВТ и НТ, као и прагове за потрошњу
        //по зонама(зелена, плава и црвена зона) 4.strana pdf-a
        public Result UpdateTariff(float ght, float glt, float bht, float blt, float rht, float rlt, // Za PriceListZones
                    float billingPowerPrice, float supplierCost)
        {
            var zonesResult = PriceListZones.Create(ght, glt, bht, blt, rht, rlt);
            if (zonesResult.IsFailure) 
                return Result.Failure(zonesResult.Error!.Message, ErrorType.Validation);

            var costsResult = FixedCosts.Create(billingPowerPrice, supplierCost);
            if (costsResult.IsFailure) 
                return Result.Failure(costsResult.Error!.Message, ErrorType.Validation);

            PriceZones = zonesResult.Value;
            FixedCosts = costsResult.Value;

            return Result.Success();
        }

        #endregion
    }
}
