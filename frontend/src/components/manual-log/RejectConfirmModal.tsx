import { FaTimes, FaExclamationTriangle } from "react-icons/fa";
import type { ManualLogDto } from "../../types/manualLog/ManualLogTypes";

interface Props {
  log: ManualLogDto;
  loading: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export default function RejectConfirmModal({ log, loading, onConfirm, onClose }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#363636]/40 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-white/40 bg-linear-to-b from-[#FAFAFA] to-white/1 p-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="rounded-2xl border border-gray-200 bg-[#FAFAFA] p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <FaExclamationTriangle className="text-red-500 text-sm" />
              </div>
              <h3 className="text-lg text-[#363636] montserrat_bold">
                Odbijanje očitavanja
              </h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-[#AFAFAF] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:text-[#469FFE] active:scale-[0.98]"
              aria-label="Zatvori"
            >
              <FaTimes className="text-xs" />
            </button>
          </div>

          <p className="text-sm text-[#636363] montserrat_medium mb-1">
            Da li sigurno želiš da odbiješ ovo očitavanje?
          </p>
          <p className="text-xs text-[#AFAFAF] montserrat_medium font-mono break-all mb-5">
            {log.smartMeterId}
          </p>

          <div className="flex items-center justify-end gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2 montserrat_semibold text-sm rounded-xl border border-gray-200 text-[#636363] hover:bg-gray-100 transition-all duration-200 cursor-pointer"
            >
              Odustani
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="px-4 py-2 montserrat_semibold text-sm rounded-xl text-white bg-red-500 hover:bg-red-600 transition-all duration-200 disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Odbijanje…" : "Odbij očitavanje"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}