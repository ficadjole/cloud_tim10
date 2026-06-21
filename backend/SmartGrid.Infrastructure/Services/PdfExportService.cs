using PdfSharpCore;
using PdfSharpCore.Drawing;
using PdfSharpCore.Pdf;
using SmartGrid.Application.Interfaces;

namespace SmartGrid.Infrastructure.Services
{
    public class PdfExportService : IPdfExportService
    {
        public Task<byte[]> ExportToPdfAsync(string textContent)
        {
            using (var document = new PdfDocument())
            {
                var page = document.AddPage();
                page.Size = PageSize.A4;
                var gfx = XGraphics.FromPdfPage(page);

                var titleFont = new XFont("Segoe UI", 18, XFontStyle.Bold);
                var subtitleFont = new XFont("Segoe UI", 9, XFontStyle.Regular);
                var sectionFont = new XFont("Segoe UI", 12, XFontStyle.Bold);
                var labelFont = new XFont("Segoe UI", 10, XFontStyle.Bold);
                var valueFont = new XFont("Segoe UI", 10, XFontStyle.Regular);
                var totalFont = new XFont("Segoe UI", 14, XFontStyle.Bold);

                var borderPen = new XPen(XColor.FromArgb(222, 226, 230), 1);
                var darkBgBrush = new XSolidBrush(XColor.FromArgb(33, 37, 41));
                var sectionBgBrush = new XSolidBrush(XColor.FromArgb(248, 249, 250));

                string invoiceId = "N/A";
                string userOwner = "N/A";
                string objName = "N/A";
                string address = "N/A";
                string meterId = "N/A";
                string period = "N/A";
                string htKwh = "0.00 kWh";
                string ltKwh = "0.00 kWh";
                string greenRsd = "0.00 RSD";
                string blueRsd = "0.00 RSD";
                string redRsd = "0.00 RSD";
                string fixedRsd = "0.00 RSD";
                string totalRsd = "0.00 RSD";
                string status = "Unpaid";

                string[] lines = textContent.Split('\n');
                foreach (var line in lines)
                {
                    if (!line.Contains(":")) continue;

                    var parts = line.Split(':', 2);
                    string key = parts[0].Trim();
                    string val = parts[1].Trim();

                    if (key.Contains("Invoice ID")) invoiceId = val;
                    else if (key.Contains("User (Owner)")) userOwner = val;
                    else if (key.Contains("Object") && !key.Contains("Address")) objName = val;
                    else if (key.Contains("Object Address")) address = val;
                    else if (key.Contains("Smart Meter ID")) meterId = val;
                    else if (key.Contains("Billing Period")) period = val;
                    else if (key.Contains("High Tariff (HT)")) htKwh = val;
                    else if (key.Contains("Low Tariff (LT)")) ltKwh = val;
                    else if (key.Contains("Green Zone")) greenRsd = val;
                    else if (key.Contains("Blue Zone")) blueRsd = val;
                    else if (key.Contains("Red Zone")) redRsd = val;
                    else if (key.Contains("Fixed Costs")) fixedRsd = val;
                    else if (key.Contains("TOTAL AMOUNT")) totalRsd = val;
                    else if (key.Equals("Status", StringComparison.OrdinalIgnoreCase) || key.Contains("Status")) status = val;
                }

                gfx.DrawRectangle(darkBgBrush, 40, 40, 515, 65);
                gfx.DrawString("SMART GRID SYSTEM", titleFont, XBrushes.White, 55, 68);
                gfx.DrawString($"ELECTRICITY INVOICE  |  Billing Period: {period}", subtitleFont, XBrushes.LightGray, 55, 88);

                double y = 135;
                DrawMetaRow(gfx, labelFont, valueFont, "Invoice ID:", invoiceId, ref y);
                DrawMetaRow(gfx, labelFont, valueFont, "Customer Account:", userOwner, ref y);
                DrawMetaRow(gfx, labelFont, valueFont, "Property Location:", $"{objName} - {address}", ref y);
                DrawMetaRow(gfx, labelFont, valueFont, "Meter Serial Number:", meterId, ref y);

                y += 15;
                gfx.DrawString("CONSUMPTION METRICS", sectionFont, XBrushes.Black, 40, y);
                y += 15;

                gfx.DrawRectangle(sectionBgBrush, 40, y, 515, 24);
                gfx.DrawRectangle(borderPen, 40, y, 515, 24);
                gfx.DrawString("Tariff Rate Group", labelFont, XBrushes.Black, 50, y + 16);
                gfx.DrawString("Usage Registration (kWh)", labelFont, XBrushes.Black, 380, y + 16);
                y += 24;

                DrawDataRow(gfx, valueFont, borderPen, "High Tariff (HT)", htKwh, ref y);
                DrawDataRow(gfx, valueFont, borderPen, "Low Tariff (LT)", ltKwh, ref y);

                y += 20;
                gfx.DrawString("FINANCIAL COST BREAKDOWN", sectionFont, XBrushes.Black, 40, y);
                y += 15;

                gfx.DrawRectangle(sectionBgBrush, 40, y, 515, 24);
                gfx.DrawRectangle(borderPen, 40, y, 515, 24);
                gfx.DrawString("Accounting Item / Grid Energy Zone", labelFont, XBrushes.Black, 50, y + 16);
                gfx.DrawString("Charged Amount (RSD)", labelFont, XBrushes.Black, 380, y + 16);
                y += 24;

                DrawColoredZoneRow(gfx, valueFont, borderPen, "Green Zone (Baseline Consumption)", greenRsd, XColor.FromArgb(232, 245, 233), XColor.FromArgb(46, 125, 50), ref y);
                DrawColoredZoneRow(gfx, valueFont, borderPen, "Blue Zone (Moderate Consumption)", blueRsd, XColor.FromArgb(227, 242, 253), XColor.FromArgb(21, 101, 192), ref y);
                DrawColoredZoneRow(gfx, valueFont, borderPen, "Red Zone (High Scale Consumption)", redRsd, XColor.FromArgb(255, 235, 235), XColor.FromArgb(198, 40, 40), ref y);
                DrawDataRow(gfx, valueFont, borderPen, "Fixed System Grid Costs", fixedRsd, ref y);

                y += 30;
                gfx.DrawRectangle(new XSolidBrush(XColor.FromArgb(245, 247, 250)), 40, y, 515, 55);
                gfx.DrawRectangle(new XPen(XColor.FromArgb(206, 212, 218), 1), 40, y, 515, 55);

                gfx.DrawString("TOTAL AMOUNT DUE:", totalFont, XBrushes.Black, 55, y + 34);
                gfx.DrawString(totalRsd, totalFont, new XSolidBrush(XColor.FromArgb(33, 41, 54)), 230, y + 34);

                bool isPaid = status.Equals("Paid", StringComparison.OrdinalIgnoreCase);
                XBrush statusTextBrush = isPaid ? new XSolidBrush(XColor.FromArgb(46, 125, 50)) : new XSolidBrush(XColor.FromArgb(198, 40, 40));
                XBrush statusBgBrush = isPaid ? new XSolidBrush(XColor.FromArgb(232, 245, 233)) : new XSolidBrush(XColor.FromArgb(255, 235, 235));
                XPen statusBorderPen = isPaid ? new XPen(XColor.FromArgb(129, 199, 132), 1) : new XPen(XColor.FromArgb(229, 115, 115), 1);

                gfx.DrawRectangle(statusBgBrush, 430, y + 13, 110, 28);
                gfx.DrawRectangle(statusBorderPen, 430, y + 13, 110, 28);

                var stateFont = new XFont("Segoe UI", 11, XFontStyle.Bold);
                gfx.DrawString(status.ToUpper(), stateFont, statusTextBrush, 445, y + 31);

                gfx.Dispose();

                using (var stream = new MemoryStream())
                {
                    document.Save(stream);
                    return Task.FromResult(stream.ToArray());
                }
            }
        }

        private void DrawMetaRow(XGraphics gfx, XFont labelFont, XFont valueFont, string label, string value, ref double y)
        {
            gfx.DrawString(label, labelFont, XBrushes.DimGray, 45, y);
            gfx.DrawString(value, valueFont, XBrushes.Black, 180, y);
            y += 20;
        }

        private void DrawDataRow(XGraphics gfx, XFont font, XPen borderPen, string label, string value, ref double y)
        {
            gfx.DrawRectangle(borderPen, 40, y, 515, 24);
            gfx.DrawString(label, font, XBrushes.Black, 50, y + 16);
            gfx.DrawString(value, font, XBrushes.Black, 380, y + 16);
            y += 24;
        }

        private void DrawColoredZoneRow(XGraphics gfx, XFont font, XPen borderPen, string label, string value, XColor bgColor, XColor textColor, ref double y)
        {
            gfx.DrawRectangle(new XSolidBrush(bgColor), 40, y, 515, 24);
            gfx.DrawRectangle(borderPen, 40, y, 515, 24);

            var textBrush = new XSolidBrush(textColor);
            gfx.DrawString(label, font, textBrush, 50, y + 16);
            gfx.DrawString(value, font, textBrush, 380, y + 16);
            y += 24;
        }
    }
}