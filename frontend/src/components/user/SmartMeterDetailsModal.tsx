import { useEffect, useMemo, useState } from "react";
import {
  FaBolt,
  FaCheckCircle,
  FaClock,
  FaHashtag,
  FaInfoCircle,
  FaPlug,
  FaTachometerAlt,
  FaTimes,
  FaTimesCircle,
} from "react-icons/fa";
import { smartMeterApi } from "../../api_services/smart_meters/SmartMeterAPIService";
import type { DeviceStatusDto, SmartMeterDto } from "../../models/smart_meter/SmartMeterTypes";

interface SmartMeterDetailsModalProps {
  open: boolean;
  meter: SmartMeterDto | null;
  onClose: () => void;
}

const detailItemClass = "rounded-lg border border-gray-200 bg-white px-3 py-3";
const measurementRefreshMs = 2000;

const getConnectionTypeLabel = (type: SmartMeterDto["connectionType"]) => {
  const normalized = String(type ?? "").toLowerCase();

  if (normalized === "1" || normalized === "singlephase") return "Monofazni";
  if (normalized === "2" || normalized === "multiphase") return "Trofazni";

  return type ? String(type) : "-";
};

const isThreePhase = (meter: SmartMeterDto) => {
  const normalized = String(meter.connectionType ?? "").toLowerCase();
  return normalized === "2" || normalized === "multiphase";
};

const isMeterActive = (meter: SmartMeterDto) => {
  if (typeof meter.isActive === "boolean") return meter.isActive;

  const status = String(meter.status ?? "").toLowerCase();
  return status === "1" || status === "paired" || status === "active";
};

const formatNumber = (value: number | null | undefined, unit: string) => {
  if (value === null || value === undefined) return "-";
  return `${Number(value).toLocaleString("sr-RS", { maximumFractionDigits: 2 })} ${unit}`;
};

const formatDate = (value: string | null | undefined) => {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("sr-RS");
};

const getMeasurementRows = (status: DeviceStatusDto | null, showAll: boolean) => {
  const rows = [
    { label: "Trenutno opterećenje", value: formatNumber(status?.currentLoadKW, "kW"), raw: status?.currentLoadKW },
    { label: "Napon L1", value: formatNumber(status?.voltageL1, "V"), raw: status?.voltageL1 },
    { label: "Napon L2", value: formatNumber(status?.voltageL2, "V"), raw: status?.voltageL2 },
    { label: "Napon L3", value: formatNumber(status?.voltageL3, "V"), raw: status?.voltageL3 },
  ];

  if (showAll) return rows;
  return rows.filter((row) => row.raw !== null && row.raw !== undefined);
};

export default function SmartMeterDetailsModal({ open, meter, onClose }: SmartMeterDetailsModalProps) {
  const [status, setStatus] = useState<DeviceStatusDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open || !meter) return;

    let cancelled = false;
    let requestInFlight = false;
    let hasLoadedOnce = false;
    setLoading(true);
    setError("");
    setStatus(null);

    const loadStatus = async () => {
      if (requestInFlight) return;

      requestInFlight = true;

      if (!hasLoadedOnce) {
        setLoading(true);
      }

      const response = await smartMeterApi.getDeviceStatusByMeterId(meter.id);
      requestInFlight = false;

      if (cancelled) return;

      hasLoadedOnce = true;
      setLoading(false);

      if (!response.success) {
        setError(response.message);
        return;
      }

      setError("");
      setStatus(response.data ?? null);
    };

    void loadStatus();
    const intervalId = window.setInterval(() => {
      void loadStatus();
    }, measurementRefreshMs);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [open, meter]);

  const measurementRows = useMemo(() => {
    if (!meter) return [];
    return getMeasurementRows(status, isThreePhase(meter));
  }, [meter, status]);

  if (!open || !meter) return null;

  const note = meter.note?.trim();
  const active = isMeterActive(meter);
  const lastHeartbeat = status?.lastHeartbeat ? formatDate(status.lastHeartbeat) : "";

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#363636]/35 px-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-2xl border border-white/40 bg-linear-to-b from-[#FAFAFA] to-white/1 p-4 shadow-2xl">
        <div className="max-h-[88vh] overflow-y-auto rounded-2xl border border-gray-200 bg-[#FAFAFA] p-6">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-100">
                <FaBolt className="text-lg text-[#469FFE]" />
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-widest text-gray-400 montserrat_medium">
                  Detalji brojila
                </p>
                <h3 className="mt-1 break-all text-2xl text-[#363636] montserrat_bold">
                  {meter.serialNumber || "Brojilo"}
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
            <div className={`${detailItemClass} sm:col-span-2`}>
              <div className="flex items-start gap-2">
                <FaHashtag className="mt-1 shrink-0 text-[#469FFE]" />
                <div>
                  <p className="text-[11px] uppercase tracking-widest text-gray-400 montserrat_medium">ID brojila</p>
                  <p className="mt-1 break-all text-xs text-[#AFAFAF] montserrat_medium">{meter.id}</p>
                </div>
              </div>
            </div>

            <div className={detailItemClass}>
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-gray-400 montserrat_medium">
                <FaPlug className="text-[#469FFE]" />
                Priključak
              </div>
              <p className="mt-1 text-sm text-[#363636] montserrat_semibold">
                {getConnectionTypeLabel(meter.connectionType)}
              </p>
            </div>

            <div className={detailItemClass}>
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-gray-400 montserrat_medium">
                <FaClock className="text-[#469FFE]" />
                Tip merenja
              </div>
              <p className="mt-1 text-sm text-[#363636] montserrat_semibold">
                {isThreePhase(meter) ? "Trofazno" : "Monofazno"}
              </p>
            </div>

            <div className={detailItemClass}>
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-gray-400 montserrat_medium">
                <FaCheckCircle className={active ? "text-green-500" : "text-gray-300"} />
                Status
              </div>
              <p className="mt-1 text-sm text-[#363636] montserrat_semibold">
                {active ? "Upareno" : "Neupareno"}
              </p>
            </div>

            <div className={detailItemClass}>
              <p className="text-[11px] uppercase tracking-widest text-gray-400 montserrat_medium">
                Maksimalna snaga
              </p>
              <p className="mt-1 text-sm text-[#363636] montserrat_semibold">
                {formatNumber(meter.maxPower, "kW")}
              </p>
            </div>


            <div className={`${detailItemClass} sm:col-span-2`}>
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-gray-400 montserrat_medium">
                <FaInfoCircle className="text-[#469FFE]" />
                Opis brojila
              </div>
              <p className={`mt-2 whitespace-pre-wrap text-sm leading-relaxed montserrat_medium ${note ? "text-[#363636]" : "italic text-[#AFAFAF]"}`}>
                {note || "Nema opisa ovog brojila."}
              </p>
            </div>

            <div className={`${detailItemClass} sm:col-span-2`}>
              <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-gray-400 montserrat_medium">
                  <FaTachometerAlt className="text-[#469FFE]" />
                  Merenje
                </div>
                {lastHeartbeat && (
                  <div className="flex items-center gap-2 text-xs text-[#AFAFAF] montserrat_medium">
                    <FaClock className="text-[#469FFE]" />
                    <span>{lastHeartbeat}</span>
                  </div>
                )}
              </div>

              {loading && (
                <p className="text-sm text-[#AFAFAF] montserrat_medium">Učitavanje merenja...</p>
              )}

              {error && (
                <div className="flex items-start gap-2.5 rounded-lg border border-red-100 bg-red-50 px-3 py-2.5">
                  <FaTimesCircle className="mt-0.5 shrink-0 text-base text-red-400" />
                  <p className="text-xs leading-relaxed text-red-600 montserrat_medium">{error}</p>
                </div>
              )}

              {!loading && !error && !status && !active && (
                <p className="text-sm italic text-[#AFAFAF] montserrat_medium">
                  Nema dostupnog merenja za ovo brojilo.
                </p>
              )}

              {!loading && !error && status && active && (
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {measurementRows.map((row) => (
                    <div key={row.label} className="rounded-lg border border-gray-100 bg-[#FAFAFA] px-3 py-2.5">
                      <p className="text-[11px] uppercase tracking-widest text-gray-400 montserrat_medium">
                        {row.label}
                      </p>
                      <p className="mt-1 text-sm text-[#363636] montserrat_semibold">{row.value}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
