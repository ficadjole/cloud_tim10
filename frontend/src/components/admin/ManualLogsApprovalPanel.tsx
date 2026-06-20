import { useEffect, useState } from "react";
import { manualLogApi } from "../../api_services/manual_logs/ManualLogAPIService";
import type { ManualLogDto } from "../../types/manualLog/ManualLogTypes";

const statusLabel: Record<string, string> = {
  WaitingForProcessing: "Na čekanju",
  Processed: "Odobreno",
  Rejected: "Odbijeno",
};

const statusColor: Record<string, string> = {
  WaitingForProcessing: "bg-yellow-100 text-yellow-700",
  Processed: "bg-green-100 text-green-700",
  Rejected: "bg-red-100 text-red-700",
};

type Filter = "WaitingForProcessing" | "Processed" | "Rejected" | "All";

export default function ManualLogsApprovalPanel() {
  const [logs, setLogs] = useState<ManualLogDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("WaitingForProcessing");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const loadLogs = async () => {
    const res = await manualLogApi.getAll();
    if (res.success && res.data) setLogs(res.data);
    else setError(res.message ?? "Greška pri učitavanju očitavanja");
    setLoading(false);
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const handleApprove = async (id: string) => {
    setActionLoadingId(id);
    const res = await manualLogApi.approve(id);
    setActionLoadingId(null);
    if (res.success) await loadLogs();
    else setError(res.message ?? "Greška pri odobravanju");
  };

  const handleReject = async (id: string) => {
    if (!confirm("Da li sigurno želiš da odbiješ ovo očitavanje?")) return;
    setActionLoadingId(id);
    const res = await manualLogApi.reject(id);
    setActionLoadingId(null);
    if (res.success) await loadLogs();
    else setError(res.message ?? "Greška pri odbijanju");
  };

  const filtered = filter === "All" ? logs : logs.filter((l) => l.status === filter);

  if (loading)
    return (
      <div className="text-sm text-[#636363] montserrat_medium p-4">
        Učitavanje očitavanja…
      </div>
    );

  return (
    <div className="w-full">
      <div className="mb-6">
        <p className="text-xs uppercase tracking-[0.3em] text-[#469FFE] montserrat_medium">
          Pregled stanja
        </p>
        <h2 className="mt-1 text-2xl text-[#363636] montserrat_bold">
          Ručno uneta očitavanja
        </h2>
        <p className="mt-1 text-sm text-[#636363] montserrat_medium">
          Pregled priložene slike i odobravanje/odbijanje unetog stanja brojila
        </p>
      </div>

      <div className="flex gap-2 mb-5">
        {(["WaitingForProcessing", "Processed", "Rejected", "All"] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
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

      {error && (
        <div className="mb-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl montserrat_medium">
          {error}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="text-sm text-[#636363] montserrat_medium py-8 text-center rounded-2xl border border-[#469FFE]/10 bg-white/60">
          Nema očitavanja za prikaz.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((log) => (
            <div
              key={log.id}
              className="rounded-2xl border border-[#469FFE]/10 bg-white/60 backdrop-blur-sm overflow-hidden flex flex-col"
            >
              <img
                src={log.imageUrl}
                alt={`Očitavanje ${log.smartMeterId}`}
                onClick={() => setPreviewUrl(log.imageUrl)}
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
                      onClick={() => handleApprove(log.id)}
                      disabled={actionLoadingId === log.id}
                      className="flex-1 text-xs montserrat_semibold text-white bg-green-500 hover:bg-green-600 px-3 py-2 rounded-lg transition-all disabled:opacity-50 cursor-pointer"
                    >
                      Odobri
                    </button>
                    <button
                      onClick={() => handleReject(log.id)}
                      disabled={actionLoadingId === log.id}
                      className="flex-1 text-xs montserrat_semibold text-white bg-red-500 hover:bg-red-600 px-3 py-2 rounded-lg transition-all disabled:opacity-50 cursor-pointer"
                    >
                      Odbij
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {previewUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          onClick={() => setPreviewUrl(null)}
        >
          <img
            src={previewUrl}
            alt="Uvećana slika očitavanja"
            className="max-h-[85vh] max-w-full rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}