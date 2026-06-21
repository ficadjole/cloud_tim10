import type { ManualLogDto } from "../../types/manualLog/ManualLogTypes";
import { getImageUrl } from "../../utils/manualLog/blobUrl";
import { statusLabel, statusColor } from "../../constants/manualLog/status";

interface Props {
  log: ManualLogDto;
  loading: boolean;
  onPreview: (url: string) => void;
  onApprove: (id: string) => void;
  onReject: (log: ManualLogDto) => void;
}

export default function ManualLogCard({ log, loading, onPreview, onApprove, onReject }: Props) {
  return (
    <div className="rounded-2xl border border-[#469FFE]/10 bg-white/60 backdrop-blur-sm overflow-hidden flex flex-col">
      <img
        src={getImageUrl(log.imageUrl)}
        alt={`Očitavanje ${log.smartMeterId}`}
        onClick={() => onPreview(getImageUrl(log.imageUrl))}
        className="w-full h-40 object-cover cursor-pointer hover:opacity-90 transition-opacity"
      />
      <div className="p-4 flex flex-col gap-2 flex-1">
        <span
          className={`self-start text-[10px] px-2 py-1 rounded-full montserrat_semibold ${
            statusColor[log.status] ?? "bg-gray-100 text-gray-600"
          }`}
        >
          {statusLabel[log.status] ?? log.status}
        </span>
        <p className="text-xs text-[#636363] montserrat_medium font-mono break-all">
          {log.smartMeterId}
        </p>
        <div className="flex justify-between text-sm text-[#363636] montserrat_medium">
          <span>VT: {log.highTariffValue.toFixed(1)} kWh</span>
          <span>NT: {log.lowTariffValue.toFixed(1)} kWh</span>
        </div>

        {log.status === "WaitingForProcessing" && (
          <div className="flex gap-2 mt-auto pt-2">
            <button
              onClick={() => onApprove(log.id)}
              disabled={loading}
              className="flex-1 text-xs montserrat_semibold text-white bg-green-500 hover:bg-green-600 px-3 py-2 rounded-lg transition-all disabled:opacity-50 cursor-pointer"
            >
              Odobri
            </button>
            <button
              onClick={() => onReject(log)}
              disabled={loading}
              className="flex-1 text-xs montserrat_semibold text-white bg-red-500 hover:bg-red-600 px-3 py-2 rounded-lg transition-all disabled:opacity-50 cursor-pointer"
            >
              Odbij
            </button>
          </div>
        )}
      </div>
    </div>
  );
}