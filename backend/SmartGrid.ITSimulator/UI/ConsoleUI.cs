using SmartGrid.ITSimulator.Enums;

namespace SmartGrid.ITSimulator.UI
{
    public class ConsoleUI
    {
        public static void PrintHeader()
        {
            Console.Clear();
            Console.ForegroundColor = ConsoleColor.Cyan;
            Console.WriteLine("======================================");
            Console.WriteLine("  SMART METER ACTIVATION SIMULATOR    ");
            Console.WriteLine("======================================\n");
            Console.ResetColor();
        }

        public static string GetSerialNumberInput()
        {
            Console.Write("[INPUT] Enter Smart Meter Serial Number (e.g. SM-2026-12345): ");
            return Console.ReadLine()?.Trim() ?? string.Empty;
        }

        public static DeviceType GetDeviceTypeInput()
        {
            Console.WriteLine("[INPUT] Select Meter Type:");
            Console.WriteLine("  1. Single Phase ");
            Console.WriteLine("  2. MultiPhase");
            Console.Write("Selection (1-2): ");

            string choice = Console.ReadLine() ?? "1";
            return choice switch
            {
                "1" => DeviceType.SinglePhase,
                "2" => DeviceType.MultiPhase,
                _ => DeviceType.SinglePhase
            };
        }

        public static void PrintStartMessage(string serialNumber, string apiUrl)
        {
            Console.WriteLine("\n--------------------------------------");
            Console.ForegroundColor = ConsoleColor.Yellow;
            Console.WriteLine($"[SYSTEM] Starting simulation for: {serialNumber}");
            Console.WriteLine($"[SYSTEM] Target API: {apiUrl}");
            Console.ResetColor();
            Console.WriteLine("[SYSTEM] Press Ctrl+C to stop simulation.");
            Console.WriteLine("--------------------------------------\n");
        }

        public static void PrintSuccess(double currentLoad, double nominalPower)
        {
            string timestamp = DateTime.Now.ToString("HH:mm:ss");
            Console.WriteLine($"[{timestamp}] [SENT] Load: {currentLoad,8:F2} kW");
        }

        public static void PrintError(string message)
        {
            Console.ForegroundColor = ConsoleColor.Red;
            Console.WriteLine($"[{DateTime.Now:HH:mm:ss}] [ERROR] {message}");
            Console.ResetColor();
        }

        public static void PrintCritical(string message)
        {
            Console.BackgroundColor = ConsoleColor.Red;
            Console.ForegroundColor = ConsoleColor.White;
            Console.WriteLine($"\n[CRITICAL ERROR] {message}");
            Console.ResetColor();
        }
    }
}