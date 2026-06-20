import type { TelemetryPoint } from "../../../types/dashboard/dashboardTypes";
import { toChartPath } from "../../../utils/dashboard/dashboardHelpers";

export default function LineChart({
  data,
  valueKey,
  color,
  emptyMessage,
}: {
  data: TelemetryPoint[];
  valueKey: "averageVoltage" | "totalLoad";
  color: string;
  emptyMessage: string;
}) {
  const values = data.map((item) => item[valueKey]).filter((value) => Number.isFinite(value));
  const width = 520;
  const height = 180;
  const padding = 22;
  const path = toChartPath(values, width, height, padding);

  if (values.length < 2) {
    return (
      <div className="flex h-52 items-center justify-center rounded-xl border border-dashed border-gray-200 bg-white text-sm text-[#AFAFAF] montserrat_medium">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-44 w-full" role="img" aria-label="Trend grafikon">
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#E5E7EB" />
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#E5E7EB" />
        <path d={path} fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        {values.map((value, index) => {
          const max = Math.max(...values);
          const min = Math.min(...values);
          const span = max - min || 1;
          const step = values.length > 1 ? (width - padding * 2) / (values.length - 1) : 0;
          const x = padding + step * index;
          const y = height - padding - ((value - min) / span) * (height - padding * 2);

          return <circle key={`${value}-${index}`} cx={x} cy={y} r="4" fill="white" stroke={color} strokeWidth="3" />;
        })}
      </svg>
      <div className="mt-1 flex justify-between text-[10px] text-[#AFAFAF] montserrat_medium">
        <span>{data[0]?.label}</span>
        <span>{data[data.length - 1]?.label}</span>
      </div>
    </div>
  );
}
