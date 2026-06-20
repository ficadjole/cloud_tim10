import type { BarChartPoint } from "../../../types/dashboard/dashboardTypes";
import { formatNumber } from "../../../utils/dashboard/dashboardHelpers";

export default function BarChart({ data }: { data: BarChartPoint[] }) {
  const max = Math.max(...data.flatMap((item) => [item.highTariff, item.lowTariff]), 1);

  if (data.length === 0) {
    return (
      <div className="flex h-60 items-center justify-center rounded-xl border border-dashed border-gray-200 bg-white text-sm text-[#AFAFAF] montserrat_medium">
        Nema dovoljno racuna za prikaz potrosnje.
      </div>
    );
  }

  return (
    <div className="h-60 rounded-xl border border-gray-200 bg-white px-4 py-4">
      <div className="flex h-44 items-end gap-3">
        {data.map((item) => (
          <div key={item.id} className="flex min-w-0 flex-1 flex-col items-center justify-end gap-2">
            <div className="flex h-36 w-full max-w-14 items-end justify-center gap-1.5">
              <div
                className="w-4 rounded-t-md bg-[#469FFE]"
                style={{ height: `${Math.max((item.highTariff / max) * 100, 4)}%` }}
                title={`VT: ${formatNumber(item.highTariff, "kWh")}`}
              />
              <div
                className="w-4 rounded-t-md bg-green-400"
                style={{ height: `${Math.max((item.lowTariff / max) * 100, 4)}%` }}
                title={`NT: ${formatNumber(item.lowTariff, "kWh")}`}
              />
            </div>
            <p className="truncate text-[11px] text-[#AFAFAF] montserrat_medium">{item.label}</p>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-center gap-4 text-[11px] text-[#AFAFAF] montserrat_medium">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-[#469FFE]" />
          VT
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-green-400" />
          NT
        </span>
      </div>
    </div>
  );
}
