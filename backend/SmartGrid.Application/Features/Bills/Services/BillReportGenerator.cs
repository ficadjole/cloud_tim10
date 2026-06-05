using System.Text;
using SmartGrid.Domain.Models;

namespace SmartGrid.Application.Features.Bills.Services
{
    public static class BillReportGenerator
    {
        public static string GenerateTextInvoice(Bill bill, ResidentalObject residentalObject)
        {
            var sb = new StringBuilder();
            sb.AppendLine("=================================================================");
            sb.AppendLine("                    SMART GRID SYSTEM - INVOICE                  ");
            sb.AppendLine("=================================================================");
            sb.AppendLine($"Invoice ID:       {bill.Id.Value}");
            sb.AppendLine($"User (Owner):     {bill.OwnerId.Value}");
            sb.AppendLine($"Object:           {residentalObject.Name} ({residentalObject.Type})");
            sb.AppendLine($"Object Address:   {residentalObject.Address.Street} {residentalObject.Address.Number}, {residentalObject.Address.City}");
            sb.AppendLine($"Smart Meter ID:   {bill.SmartMeterId.Value}");
            sb.AppendLine($"Billing Period:   {bill.BillingPeriod:MM/yyyy}");
            sb.AppendLine("-----------------------------------------------------------------");
            sb.AppendLine(" CONSUMPTION DETAILS (kWh):");
            sb.AppendLine($" High Tariff (HT): {bill.HighTariffKWh:F2} kWh");
            sb.AppendLine($" Low Tariff (LT):  {bill.LowTariffKWh:F2} kWh");
            sb.AppendLine("-----------------------------------------------------------------");
            sb.AppendLine(" FINANCIAL CALCULATION BY ZONES (RSD):");
            sb.AppendLine($" Green Zone:        {bill.GreenZoneAmount:F2} RSD");
            sb.AppendLine($" Blue Zone:         {bill.BlueZoneAmount:F2} RSD");
            sb.AppendLine($" Red Zone:          {bill.RedZoneAmount:F2} RSD");
            sb.AppendLine($" Fixed Costs:       {bill.FixedCostsAmount:F2} RSD");
            sb.AppendLine("-----------------------------------------------------------------");
            sb.AppendLine($" TOTAL AMOUNT:      {bill.TotalAmount:F2} RSD");
            sb.AppendLine($" Payment Status:    {bill.Status}");
            sb.AppendLine("=================================================================");
            return sb.ToString();
        }
    }
}