import { useEffect, useState } from "react";
import { manualLogApi } from "../../api_services/manual_logs/ManualLogAPIService";
import type { ManualLogDto } from "../../types/manualLog/ManualLogTypes";
import type { ManualLogFilter } from "../../constants/manualLog/status";
import StatusFilterTabs from "../../components/manual-log/StatusFilterTabs";
import ManualLogCard from "../../components/manual-log/ManualLogCard";
import ImagePreviewModal from "../../components/manual-log/ImagePreviewModal";
import RejectConfirmModal from "../../components/manual-log/RejectConfirmModal";

export default function ManualLogsApprovalPanel() {
  const [logs, setLogs] = useState<ManualLogDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<ManualLogFilter>("WaitingForProcessing");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [rejectingLog, setRejectingLog] = useState<ManualLogDto | null>(null);

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

  const confirmReject = async () => {
    if (!rejectingLog) return;
    setActionLoadingId(rejectingLog.id);
    const res = await manualLogApi.reject(rejectingLog.id);
    setActionLoadingId(null);
    setRejectingLog(null);
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

      <StatusFilterTabs filter={filter} onChange={setFilter} />

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
            <ManualLogCard
              key={log.id}
              log={log}
              loading={actionLoadingId === log.id}
              onPreview={setPreviewUrl}
              onApprove={handleApprove}
              onReject={setRejectingLog}
            />
          ))}
        </div>
      )}

      {previewUrl && <ImagePreviewModal url={previewUrl} onClose={() => setPreviewUrl(null)} />}

      {rejectingLog && (
        <RejectConfirmModal
          log={rejectingLog}
          loading={actionLoadingId === rejectingLog.id}
          onConfirm={confirmReject}
          onClose={() => setRejectingLog(null)}
        />
      )}
    </div>
  );
}