import { useEffect, useMemo, useState } from "react";
import {
  FaBolt,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
  FaHashtag,
  FaInfoCircle,
  FaRegImage,
  FaSave,
  FaPlug,
  FaTachometerAlt,
  FaTimes,
  FaTimesCircle,
  FaTrash,
} from "react-icons/fa";
import { smartMeterApi } from "../../api_services/smart_meters/SmartMeterAPIService";
import { manualLogApi } from "../../api_services/manual_logs/ManualLogAPIService";
import { useSignalR } from "../../contexts/signalR/SignalRContext";
import { useLockBodyScroll } from "../../hooks/ui/useLockBodyScroll";
import type { DeviceStatusDto, SmartMeterDto } from "../../models/smart_meter/SmartMeterTypes";

interface SmartMeterDetailsModalProps {
  open: boolean;
  meter: SmartMeterDto | null;
  onClose: () => void;
}

const detailItemClass = "rounded-lg border border-gray-200 bg-white px-3 py-3";
const inputClass =
  "w-full h-[43px] rounded-xl border border-[#469FFE]/1 bg-white px-4 py-3 text-sm text-[#469FFE] shadow-[0_0_0_1.5px_#469FFE,0_0_25px_-17px_#000] outline-none transition-all duration-200 placeholder:text-[#469FFE]/60 hover:shadow-[0_0_0_2.5px_#67afff,0_0_25px_-15px_#000] focus:scale-[0.98] cursor-text montserrat_medium";
const measurementRefreshMs = 2000;
const manualReadingsStorageKey = "manualReadingsHold";
const maxManualImageSizeBytes = 5 * 1024 * 1024;

type ManualReadingHold = {
  id: string;
  meterId: string;
  highTariffValue: number;
  lowTariffValue: number;
  imageName: string;
  submittedAt: string;
  status: "waiting";
};

const readManualReadingHolds = (): ManualReadingHold[] => {
  try {
    const raw = localStorage.getItem(manualReadingsStorageKey);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const writeManualReadingHolds = (items: ManualReadingHold[]) => {
  localStorage.setItem(manualReadingsStorageKey, JSON.stringify(items.slice(0, 20)));
};

const formatFileSize = (bytes: number) => {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

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

const getMeterStatusKeys = (meter: SmartMeterDto) =>
  [meter.id, meter.serialNumber, meter.deviceGuid]
    .map((value) => String(value ?? "").trim().toLowerCase())
    .filter(Boolean);

const getStatusForMeter = (meter: SmartMeterDto, statuses: DeviceStatusDto[]) => {
  const meterKeys = getMeterStatusKeys(meter);

  return statuses.find((item) => meterKeys.includes(String(item.deviceId ?? "").trim().toLowerCase())) ?? null;
};

const formatNumber = (value: number | null | undefined, unit: string) => {
  if (value === null || value === undefined) return "-";
  return `${Number(value).toLocaleString("sr-RS", { maximumFractionDigits: 2 })} ${unit}`;
};

const getLimitTypeLabel = (type: SmartMeterDto["limitType"]) => {
  const normalized = String(type ?? "").toLowerCase();

  if (normalized === "0" || normalized === "rsd") return "RSD";
  if (normalized === "1" || normalized === "kwh") return "kWh";

  return "";
};

const getLimitUsage = (meter: SmartMeterDto, status: DeviceStatusDto | null) => {
  const limitValue = typeof meter.limitValue === "number" ? meter.limitValue : null;
  const limitType = getLimitTypeLabel(meter.limitType);
  const totalKWh = typeof status?.totalConsumptionKWh === "number" ? status.totalConsumptionKWh : null;

  if (limitValue === null || !limitType) {
    return null;
  }

  if (totalKWh === null) {
    return {
      limitValue,
      limitType,
      currentValue: null,
      exceeded: false,
      helper: "Ceka se telemetrija sa ukupnom potrosnjom.",
    };
  }

  const currentValue = limitType === "RSD" ? totalKWh * 10 : totalKWh;

  return {
    limitValue,
    limitType,
    currentValue,
    exceeded: currentValue > limitValue,
    helper: limitType === "RSD" ? "Procena koristi isti obracun 10 RSD/kWh kao backend alert." : "Ukupna potrosnja iz telemetrije.",
  };
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
  const { deviceStatuses: realTimeDeviceStatuses } = useSignalR();
  const [status, setStatus] = useState<DeviceStatusDto | null>(null);
  const [manualHighTariff, setManualHighTariff] = useState("");
  const [manualLowTariff, setManualLowTariff] = useState("");
  const [manualImage, setManualImage] = useState<File | null>(null);
  const [manualImagePreview, setManualImagePreview] = useState("");
  const [manualFileInputKey, setManualFileInputKey] = useState(0);
  const [manualHolds, setManualHolds] = useState<ManualReadingHold[]>([]);
  const [manualSubmitting, setManualSubmitting] = useState(false);
  const [manualError, setManualError] = useState("");
  const [manualSuccess, setManualSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useLockBodyScroll(open && Boolean(meter));

  useEffect(() => {
    if (!open || !meter) return;

    let cancelled = false;
    let requestInFlight = false;
    let hasLoadedOnce = false;

    const loadStatus = async () => {
      if (requestInFlight) return;

      requestInFlight = true;

      if (!hasLoadedOnce) {
        setLoading(true);
      }

      const response = await smartMeterApi.getDeviceStatuses();
      requestInFlight = false;

      if (cancelled) return;

      hasLoadedOnce = true;
      setLoading(false);

      if (!response.success) {
        setError(response.message);
        return;
      }

      setError("");
      setStatus(getStatusForMeter(meter, response.data ?? []));
    };

    queueMicrotask(() => {
      if (cancelled) return;

      setLoading(true);
      setError("");
      setStatus(null);
      void loadStatus();
    });

    const intervalId = window.setInterval(() => {
      void loadStatus();
    }, measurementRefreshMs);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [open, meter]);

  useEffect(() => {
    if (!open || !meter) return;

    setManualHighTariff("");
    setManualLowTariff("");
    setManualImage(null);
    setManualImagePreview("");
    setManualFileInputKey((current) => current + 1);
    setManualError("");
    setManualSuccess("");
    setManualHolds(readManualReadingHolds().filter((item) => item.meterId === meter.id));
  }, [open, meter]);

  useEffect(() => {
    return () => {
      if (manualImagePreview) URL.revokeObjectURL(manualImagePreview);
    };
  }, [manualImagePreview]);

  useEffect(() => {
    if (!open || !meter) return;

    const liveStatus = getStatusForMeter(meter, realTimeDeviceStatuses);
    if (liveStatus) {
      setStatus(liveStatus);
    }
  }, [open, meter, realTimeDeviceStatuses]);

  const measurementRows = useMemo(() => {
    if (!meter) return [];
    return getMeasurementRows(status, isThreePhase(meter));
  }, [meter, status]);

  const handleManualImageSelected = (file: File | null) => {
    setManualError("");

    if (!file) {
      setManualImage(null);
      setManualImagePreview((current) => {
        if (current) URL.revokeObjectURL(current);
        return "";
      });
      return;
    }

    if (!file.type.startsWith("image/")) {
      setManualError("Fajl mora biti slika displeja brojila.");
      setManualImage(null);
      setManualImagePreview("");
      setManualFileInputKey((current) => current + 1);
      return;
    }

    if (file.size > maxManualImageSizeBytes) {
      setManualError("Slika moze imati najvise 5 MB.");
      setManualImage(null);
      setManualImagePreview("");
      setManualFileInputKey((current) => current + 1);
      return;
    }

    const nextPreview = URL.createObjectURL(file);
    setManualImage(file);
    setManualImagePreview((current) => {
      if (current) URL.revokeObjectURL(current);
      return nextPreview;
    });
  };

  const handleManualSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!meter) return;

    const highTariffValue = Number(manualHighTariff.replace(",", "."));
    const lowTariffValue = Number(manualLowTariff.replace(",", "."));

    setManualError("");
    setManualSuccess("");

    if (!Number.isFinite(highTariffValue) || highTariffValue < 0) {
      setManualError("Unesite ispravnu vrednost za visu tarifu.");
      return;
    }

    if (!Number.isFinite(lowTariffValue) || lowTariffValue < 0) {
      setManualError("Unesite ispravnu vrednost za nizu tarifu.");
      return;
    }

    if (!manualImage) {
      setManualError("Slika displeja brojila je obavezna.");
      return;
    }

    if (!manualImage.type.startsWith("image/")) {
      setManualError("Fajl mora biti slika.");
      return;
    }

    setManualSubmitting(true);
    const response = await manualLogApi.create({
      smartMeterId: meter.id,
      highTariffValue,
      lowTariffValue,
      image: manualImage,
    });
    setManualSubmitting(false);

    if (!response.success) {
      setManualError(response.message);
      return;
    }

    const nextHold: ManualReadingHold = {
      id: `${meter.id}-${Date.now()}`,
      meterId: meter.id,
      highTariffValue,
      lowTariffValue,
      imageName: manualImage.name,
      submittedAt: new Date().toISOString(),
      status: "waiting",
    };
    const stored = [nextHold, ...readManualReadingHolds().filter((item) => item.id !== nextHold.id)];
    writeManualReadingHolds(stored);
    setManualHolds(stored.filter((item) => item.meterId === meter.id));
    setManualHighTariff("");
    setManualLowTariff("");
    setManualImage(null);
    setManualImagePreview((current) => {
      if (current) URL.revokeObjectURL(current);
      return "";
    });
    setManualFileInputKey((current) => current + 1);
    setManualSuccess("Stanje brojila je poslato i nalazi se na čekanju za proveru.");
  };

  if (!open || !meter) return null;

  const note = meter.note?.trim();
  const active = isMeterActive(meter) || Boolean(status);
  const lastHeartbeat = status?.lastHeartbeat ? formatDate(status.lastHeartbeat) : "";
  const limitUsage = getLimitUsage(meter, status);

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-[#363636]/35 px-4 py-8 backdrop-blur-sm sm:py-10">
      <div className="w-full max-w-4xl rounded-2xl border border-white/40 bg-linear-to-b from-[#FAFAFA] to-white/1 p-4 shadow-2xl">
        <div className="max-h-[calc(100vh-5rem)] overflow-y-auto rounded-2xl border border-gray-200 bg-[#FAFAFA] p-6">
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
              <div className="mb-2 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-gray-400 montserrat_medium">
                  <FaExclamationTriangle className={limitUsage?.exceeded ? "text-red-500" : "text-[#469FFE]"} />
                  Limit potrosnje
                </div>
                {limitUsage && (
                  <span
                    className={`rounded-lg border px-2.5 py-1 text-[11px] montserrat_medium ${limitUsage.exceeded
                      ? "border-red-100 bg-red-50 text-red-600"
                      : "border-green-100 bg-green-50 text-green-600"
                      }`}
                  >
                    {limitUsage.exceeded ? "Probijen" : "U granici"}
                  </span>
                )}
              </div>

              {!limitUsage ? (
                <p className="text-sm italic text-[#AFAFAF] montserrat_medium">
                  Limit nije podesen za ovo brojilo.
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <div className="rounded-lg border border-gray-100 bg-[#FAFAFA] px-3 py-2.5">
                    <p className="text-[11px] uppercase tracking-widest text-gray-400 montserrat_medium">Podesen limit</p>
                    <p className="mt-1 text-sm text-[#363636] montserrat_semibold">
                      {formatNumber(limitUsage.limitValue, limitUsage.limitType)}
                    </p>
                  </div>
                  <div className="rounded-lg border border-gray-100 bg-[#FAFAFA] px-3 py-2.5">
                    <p className="text-[11px] uppercase tracking-widest text-gray-400 montserrat_medium">Trenutno</p>
                    <p className={`mt-1 text-sm montserrat_semibold ${limitUsage.exceeded ? "text-red-600" : "text-[#363636]"}`}>
                      {limitUsage.currentValue === null ? "-" : formatNumber(limitUsage.currentValue, limitUsage.limitType)}
                    </p>
                  </div>
                  <p className="text-xs text-[#AFAFAF] montserrat_medium sm:col-span-2">
                    {limitUsage.helper}
                  </p>
                </div>
              )}
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

              {!loading && !error && status && (
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

            <div className={`${detailItemClass} sm:col-span-2`}>
              <div className="mb-4 flex items-center gap-2 text-[11px] uppercase tracking-widest text-gray-400 montserrat_medium">
                <FaRegImage className="text-[#469FFE]" />
                Prijava stanja brojila
              </div>
              <p className="mb-4 text-xs leading-relaxed text-[#AFAFAF] montserrat_medium">
                Za tehnički kvar ili prekid komunikacije unesite očitano stanje i priložite fotografiju displeja. Poslati unos ide na čekanje dok ga administrator ne proveri.
              </p>

              {manualError && (
                <div className="mb-4 flex items-start gap-2.5 rounded-lg border border-red-100 bg-red-50 px-3 py-2.5">
                  <FaTimesCircle className="mt-0.5 shrink-0 text-base text-red-400" />
                  <p className="text-xs leading-relaxed text-red-600 montserrat_medium">{manualError}</p>
                </div>
              )}

              {manualSuccess && (
                <div className="mb-4 flex items-start gap-2.5 rounded-lg border border-green-100 bg-green-50 px-3 py-2.5">
                  <FaCheckCircle className="mt-0.5 shrink-0 text-base text-green-500" />
                  <p className="text-xs leading-relaxed text-green-600 montserrat_medium">{manualSuccess}</p>
                </div>
              )}

              {manualHolds.length > 0 && (
                <div className="mb-4 rounded-lg border border-yellow-100 bg-yellow-50 px-3 py-3">
                  <p className="mb-2 text-[11px] uppercase tracking-widest text-yellow-700 montserrat_medium">
                    Unosi na čekanju
                  </p>
                  <div className="space-y-2">
                    {manualHolds.slice(0, 3).map((item) => (
                      <div key={item.id} className="rounded-md border border-yellow-100 bg-white/70 px-3 py-2">
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                          <p className="text-xs text-[#363636] montserrat_semibold">
                            VT {formatNumber(item.highTariffValue, "kWh")} / NT {formatNumber(item.lowTariffValue, "kWh")}
                          </p>
                          <span className="rounded-md border border-yellow-200 bg-yellow-100 px-2 py-0.5 text-[11px] text-yellow-700 montserrat_medium">
                            Na čekanju
                          </span>
                        </div>
                        <p className="mt-1 text-[11px] text-[#AFAFAF] montserrat_medium">
                          {new Date(item.submittedAt).toLocaleString("sr-RS")} - {item.imageName}
                        </p>
                      </div>
                    ))}
                  </div>
                  <p className="mt-2 text-[11px] text-yellow-700 montserrat_medium">
                    Neobrađeni unosi se ne uzimaju u obzir pri generisanju računa.
                  </p>
                </div>
              )}

              <form onSubmit={handleManualSubmit} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-[#363636] montserrat_medium">Viša tarifa (kWh)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={manualHighTariff}
                    onChange={(event) => setManualHighTariff(event.target.value)}
                    placeholder="npr. 1240.50"
                    className={inputClass}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-[#363636] montserrat_medium">Niža tarifa (kWh)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={manualLowTariff}
                    onChange={(event) => setManualLowTariff(event.target.value)}
                    placeholder="npr. 830.25"
                    className={inputClass}
                  />
                </div>

                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label className="text-xs text-[#363636] montserrat_medium">Slika displeja brojila</label>
                  <div
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => {
                      event.preventDefault();
                      handleManualImageSelected(event.dataTransfer.files?.[0] ?? null);
                    }}
                    className="rounded-xl border border-dashed border-[#469FFE]/50 bg-blue-50/40 px-4 py-4"
                  >
                    <input
                      key={manualFileInputKey}
                      type="file"
                      accept="image/*"
                      onChange={(event) => handleManualImageSelected(event.target.files?.[0] ?? null)}
                      className={`${inputClass} h-auto file:mr-3 file:rounded-md file:border-0 file:bg-[#469FFE] file:px-3 file:py-2 file:text-xs file:text-white file:montserrat_semibold`}
                    />
                    <p className="mt-2 text-[11px] text-[#AFAFAF] montserrat_medium">
                      Podržane su slike do 5 MB. Možete i prevući sliku u ovo polje.
                    </p>
                  </div>

                  {manualImage && manualImagePreview && (
                    <div className="mt-2 grid grid-cols-1 gap-3 rounded-lg border border-gray-200 bg-[#FAFAFA] p-3 sm:grid-cols-[140px_minmax(0,1fr)]">
                      <img
                        src={manualImagePreview}
                        alt="Pregled slike displeja brojila"
                        className="h-32 w-full rounded-md border border-gray-200 object-cover"
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm text-[#363636] montserrat_semibold">{manualImage.name}</p>
                        <p className="mt-1 text-xs text-[#AFAFAF] montserrat_medium">{formatFileSize(manualImage.size)}</p>
                        <button
                          type="button"
                          onClick={() => {
                            handleManualImageSelected(null);
                            setManualFileInputKey((current) => current + 1);
                          }}
                          className="mt-3 inline-flex items-center gap-2 rounded-md border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-500 transition-colors hover:bg-red-100 montserrat_semibold"
                        >
                          <FaTrash />
                          Ukloni sliku
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end border-t border-gray-100 pt-4 sm:col-span-2">
                  <button
                    type="submit"
                    disabled={manualSubmitting}
                    className="inline-flex items-center gap-2 rounded-md bg-[#469FFE] px-5 py-2.5 text-sm text-white transition-colors hover:bg-[#2b7bdc] disabled:opacity-50 montserrat_semibold"
                  >
                    <FaSave />
                    {manualSubmitting ? "Slanje..." : "Pošalji stanje"}
                  </button>
                </div>
              </form>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
