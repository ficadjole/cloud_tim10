import { statusLabel, type ManualLogFilter } from "../../constants/manualLog/status";

interface Props {
  filter: ManualLogFilter;
  onChange: (filter: ManualLogFilter) => void;
}

const FILTERS: ManualLogFilter[] = ["WaitingForProcessing", "Processed", "Rejected", "All"];

export default function StatusFilterTabs({ filter, onChange }: Props) {
  return (
    <div className="flex gap-2 mb-5">
      {FILTERS.map((f) => (
        <button
          key={f}
          onClick={() => onChange(f)}
          className={`text-xs px-3 py-1.5 rounded-full montserrat_semibold transition-all duration-200 cursor-pointer ${
            filter === f
              ? "bg-[#469FFE] text-white"
              : "bg-white/60 text-[#636363] border border-[#469FFE]/20 hover:border-[#469FFE]/50"
          }`}
        >
          {f === "All" ? "Sve" : statusLabel[f]}
        </button>
      ))}
    </div>
  );
}