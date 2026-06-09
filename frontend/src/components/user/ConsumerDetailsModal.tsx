import { FaBolt, FaHome, FaInfoCircle, FaMapMarkerAlt, FaTimes } from "react-icons/fa";
import type { ConsumerRow } from "../../models/residental_object/ResidentalObjectTypes";

interface ConsumerDetailsModalProps {
  open: boolean;
  consumer: ConsumerRow | null;
  onClose: () => void;
}

const getObjectTypeLabel = (type: string | number) => {
  const normalized = String(type);

  if (normalized === "0") return "Kuća";
  if (normalized === "1") return "Stan";
  if (normalized === "2") return "Vikendica";

  return normalized || "Objekat";
};

const detailItemClass = "rounded-lg border border-gray-200 bg-white px-3 py-3";

export default function ConsumerDetailsModal({
  open,
  consumer,
  onClose,
}: ConsumerDetailsModalProps) {
  if (!open || !consumer) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#363636]/35 px-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-2xl border border-white/40 bg-linear-to-b from-[#FAFAFA] to-white/1 p-4 shadow-2xl">
        <div className="rounded-2xl border border-gray-200 bg-[#FAFAFA] p-6">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-100">
                <FaHome className="text-lg text-[#469FFE]" />
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-widest text-gray-400 montserrat_medium">
                  Detalji potrošača
                </p>
                <h3 className="mt-1 text-2xl text-[#363636] montserrat_bold">
                  {consumer.name}
                </h3>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-[#AFAFAF] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:text-[#469FFE] active:scale-[0.98]"
              aria-label="Zatvori modal"
            >
              <FaTimes />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className={detailItemClass}>
              <p className="text-[11px] uppercase tracking-widest text-gray-400 montserrat_medium">Naziv</p>
              <p className="mt-1 text-sm text-[#363636] montserrat_semibold">{consumer.name}</p>
            </div>

            <div className={detailItemClass}>
              <p className="text-[11px] uppercase tracking-widest text-gray-400 montserrat_medium">Tip</p>
              <p className="mt-1 text-sm text-[#363636] montserrat_semibold">
                {getObjectTypeLabel(consumer.type)}
              </p>
            </div>

            <div className={`${detailItemClass} sm:col-span-2`}>
              <div className="flex items-start gap-2">
                <FaMapMarkerAlt className="mt-1 shrink-0 text-[#469FFE]" />
                <div>
                  <p className="text-[11px] uppercase tracking-widest text-gray-400 montserrat_medium">Adresa</p>
                  <p className="mt-1 text-sm text-[#363636] montserrat_semibold">{consumer.fullAddress}</p>
                </div>
              </div>
            </div>

            <div className={detailItemClass}>
              <div className="flex items-start gap-2">
                <FaBolt className="mt-1 shrink-0 text-[#469FFE]" />
                <div>
                  <p className="text-[11px] uppercase tracking-widest text-gray-400 montserrat_medium">Brojilo</p>
                  <p className="mt-1 break-all text-sm text-[#363636] montserrat_semibold">
                    {consumer.connectedMeterId ?? "Nije povezano"}
                  </p>
                </div>
              </div>
            </div>

            <div className={detailItemClass}>
              <p className="text-[11px] uppercase tracking-widest text-gray-400 montserrat_medium">Status</p>
              <span
                className={`mt-2 inline-flex rounded-lg px-3 py-1.5 text-xs montserrat_semibold ${
                  consumer.isActive
                    ? "border border-green-100 bg-green-50 text-green-600"
                    : "border border-gray-200 bg-gray-50 text-gray-500"
                }`}
              >
                {consumer.isActive ? "Aktivan" : "Neaktivan"}
              </span>
            </div>

            <div className={`${detailItemClass} sm:col-span-2`}>
              <div className="flex items-start gap-2">
                <FaInfoCircle className="mt-1 shrink-0 text-[#469FFE]" />
                <div>
                  <p className="text-[11px] uppercase tracking-widest text-gray-400 montserrat_medium">Opis</p>
                  <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-[#363636] montserrat_medium">
                    {consumer.description?.trim() || "Nema opisa za ovog potrošača."}
                  </p>
                </div>
              </div>
            </div>

            <div className={`${detailItemClass} sm:col-span-2`}>
              <p className="text-[11px] uppercase tracking-widest text-gray-400 montserrat_medium">ID objekta</p>
              <p className="mt-1 break-all text-xs text-[#AFAFAF] montserrat_medium">{consumer.id}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
