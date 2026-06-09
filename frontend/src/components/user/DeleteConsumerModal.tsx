import { FaExclamationTriangle, FaRegTrashAlt, FaTimes } from "react-icons/fa";
import type { ConsumerRow } from "../../models/residental_object/ResidentalObjectTypes";

interface DeleteConsumerModalProps {
  open: boolean;
  consumer: ConsumerRow | null;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const buttonClass =
  "z-30 montserrat_semibold rounded-md relative after:content-[''] after:-z-20 after:absolute after:h-1 after:w-1 after:left-5 overflow-hidden after:bottom-0 after:translate-y-full after:rounded-md hover:after:scale-[300] hover:after:transition-all hover:after:duration-700 after:transition-all after:duration-700 transition-all duration-700 disabled:opacity-50 cursor-pointer";

export default function DeleteConsumerModal({
  open,
  consumer,
  loading,
  onClose,
  onConfirm,
}: DeleteConsumerModalProps) {
  if (!open || !consumer) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#363636]/35 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-white/40 bg-linear-to-b from-[#FAFAFA] to-white/1 p-4 shadow-2xl">
        <div className="rounded-2xl border border-gray-200 bg-[#FAFAFA] p-6">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-red-50">
                <FaExclamationTriangle className="text-lg text-red-400" />
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-widest text-gray-400 montserrat_medium">
                  Potvrda brisanja
                </p>
                <h3 className="mt-1 text-2xl text-[#363636] montserrat_bold">
                  Obriši potrošača?
                </h3>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-[#AFAFAF] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:text-[#469FFE] active:scale-[0.98] disabled:opacity-50"
              aria-label="Zatvori modal"
            >
              <FaTimes />
            </button>
          </div>

          <div className="mb-5 rounded-lg border border-red-100 bg-red-50 px-3 py-3">
            <p className="text-sm text-[#363636] montserrat_semibold">{consumer.name}</p>
            <p className="mt-1 text-xs leading-relaxed text-red-500 montserrat_medium">
              Ova akcija će obrisati povezano brojilo ako postoji i ukloniti potrošača iz tabele.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2.5 border-t border-gray-100 pt-5">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className={`${buttonClass} bg-gray-200 px-5 py-2.5 text-[#363636] after:bg-gray-400 hover:bg-gray-300 [text-shadow:3px_5px_2px_#b8b8b8] hover:[text-shadow:2px_2px_2px_#f2f2f2]`}
            >
              Odustani
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className={`${buttonClass} inline-flex items-center gap-2 bg-red-400 px-5 py-2.5 text-white after:bg-red-500 hover:bg-red-500 [text-shadow:3px_5px_2px_#b91c1c] hover:[text-shadow:2px_2px_2px_#fecaca]`}
            >
              <FaRegTrashAlt />
              {loading ? "Brisanje..." : "Obriši"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
