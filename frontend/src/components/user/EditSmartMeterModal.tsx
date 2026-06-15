import { useEffect, useState } from "react";
import { FaBolt, FaCheckCircle, FaKey, FaSave, FaTimes, FaTimesCircle } from "react-icons/fa";
import { smartMeterApi } from "../../api_services/smart_meters/SmartMeterAPIService";
import type {
  ActivateSmartMeterResult,
  SmartMeterConnectionType,
  SmartMeterDto,
  UpdateSmartMeterDto,
} from "../../models/smart_meter/SmartMeterTypes";

interface EditSmartMeterModalProps {
  open: boolean;
  meter: SmartMeterDto | null;
  onClose: () => void;
  onUpdated: () => void;
}

const inputClass =
  "w-full h-[45px] rounded-xl border border-[#469FFE]/1 bg-white/4 px-4 py-3 text-sm text-[#469FFE] shadow-[0_0_0_1.5px_#469FFE,0_0_25px_-17px_#000] outline-none transition-all duration-200 ease-[cubic-bezier(0.19,1,0.22,1)] placeholder:text-[#469FFE]/60 hover:shadow-[0_0_0_2.5px_#67afff,0_0_25px_-15px_#000] focus:scale-[0.98] active:scale-[0.95] cursor-text montserrat_medium";

const buttonClass =
  "z-30 montserrat_semibold rounded-md relative after:content-[''] after:-z-20 after:absolute after:h-1 after:w-1 after:left-5 overflow-hidden after:bottom-0 after:translate-y-full after:rounded-md hover:after:scale-[300] hover:after:transition-all hover:after:duration-700 after:transition-all after:duration-700 transition-all duration-700 disabled:opacity-50 cursor-pointer";

const connectionTypes: { value: SmartMeterConnectionType; label: string }[] = [
  { value: "1", label: "Monofazni prikljucak 6.9kW" },
  { value: "2", label: "Trofazni prikljucak 11.04kW" },
];

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const getInitialForm = (meter: SmartMeterDto): UpdateSmartMeterDto => ({
  connectionType: String(meter.connectionType || "1") as SmartMeterConnectionType,
  note: meter.note ?? "",
});

const isMeterActive = (meter: SmartMeterDto) => {
  if (typeof meter.isActive === "boolean") return meter.isActive;

  const status = String(meter.status ?? "").toLowerCase();
  return status === "1" || status === "paired" || status === "active";
};

export default function EditSmartMeterModal({
  open,
  meter,
  onClose,
  onUpdated,
}: EditSmartMeterModalProps) {
  const [form, setForm] = useState<UpdateSmartMeterDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [activating, setActivating] = useState(false);
  const [deviceGuid, setDeviceGuid] = useState("");
  const [activationResult, setActivationResult] = useState<ActivateSmartMeterResult | null>(null);
  const [error, setError] = useState("");
  const [activationError, setActivationError] = useState("");

  useEffect(() => {
    if (!open || !meter) return;

    setForm(getInitialForm(meter));
    setDeviceGuid("");
    setActivationResult(null);
    setError("");
    setActivationError("");
  }, [open, meter]);

  if (!open || !meter || !form) return null;

  const active = isMeterActive(meter);

  const setField =
    (field: keyof UpdateSmartMeterDto) =>
      (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setForm((prev) => (prev ? { ...prev, [field]: event.target.value } : prev));
      };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    const response = await smartMeterApi.update(meter.id, {
      ...form,
      note: form.note?.trim(),
    });

    setLoading(false);

    if (!response.success) {
      setError(response.message);
      return;
    }

    onUpdated();
    onClose();
  };

  const handleActivate = async () => {
    const serialNumber = meter.serialNumber?.trim();

    setActivationError("");
    setActivationResult(null);

    if (!serialNumber) {
      setActivationError("Brojilo nema serijski broj i ne moze da se aktivira.");
      return;
    }

    if (!uuidPattern.test(deviceGuid.trim())) {
      setActivationError("Device GUID mora biti validan UUID, npr. 550e8400-e29b-41d4-a716-446655440000.");
      return;
    }

    setActivating(true);
    const response = await smartMeterApi.activate({
      serialNumber,
      deviceGuid: deviceGuid.trim(),
    });
    setActivating(false);

    if (!response.success || !response.data) {
      setActivationError(response.message);
      return;
    }

    setActivationResult(response.data);
    await onUpdated();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#363636]/35 px-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-2xl border border-white/40 bg-linear-to-b from-[#FAFAFA] to-white/1 p-4 shadow-2xl">
        <div className="rounded-2xl border border-gray-200 bg-[#FAFAFA] p-6">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-100">
                <FaBolt className="text-lg text-[#469FFE]" />
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-widest text-gray-400 montserrat_medium">
                  Izmena brojila
                </p>
                <h3 className="mt-1 text-2xl text-[#363636] montserrat_bold">
                  {meter.serialNumber || "Brojilo"}
                </h3>
                <p className="mt-1 break-all text-xs text-[#AFAFAF] montserrat_medium">{meter.id}</p>
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

          {error && (
            <div className="mb-5 flex items-start gap-2.5 rounded-lg border border-red-100 bg-red-50 px-3 py-2.5">
              <FaTimesCircle className="mt-0.5 shrink-0 text-base text-red-400" />
              <p className="text-xs leading-relaxed text-red-600 montserrat_medium">{error}</p>
            </div>
          )}


          {/*LOKALNO TESTIRANJE AKTIVACIJE ZARAD FRONTA*/}
          {/* <div className="mb-5 rounded-xl border border-blue-100 bg-white p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <FaKey className="text-[#469FFE]" />
                <p className="text-[11px] uppercase tracking-widest text-gray-400 montserrat_medium">
                  Aktivacija brojila
                </p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs montserrat_medium ${active ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-500"}`}>
                {active ? "Upareno" : "Neupareno"}
              </span>
            </div>

            {active ? (
              <p className="text-sm text-[#363636] montserrat_medium">
                Brojilo je vec aktivirano i povezano sa uredjajem.
              </p>
            ) : (
              <div className="space-y-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-[#363636] montserrat_medium">Device GUID</label>
                  <input
                    type="text"
                    value={deviceGuid}
                    onChange={(event) => setDeviceGuid(event.target.value)}
                    placeholder="550e8400-e29b-41d4-a716-446655440000"
                    className={inputClass}
                  />
                </div>

                {activationError && (
                  <div className="flex items-start gap-2.5 rounded-lg border border-red-100 bg-red-50 px-3 py-2.5">
                    <FaTimesCircle className="mt-0.5 shrink-0 text-base text-red-400" />
                    <p className="text-xs leading-relaxed text-red-600 montserrat_medium">{activationError}</p>
                  </div>
                )}

                {activationResult && (
                  <div className="rounded-lg border border-green-100 bg-green-50 px-3 py-2.5">
                    <div className="mb-2 flex items-center gap-2 text-green-600">
                      <FaCheckCircle />
                      <p className="text-xs montserrat_semibold">Brojilo je uspesno aktivirano.</p>
                    </div>
                    <p className="text-[11px] uppercase tracking-widest text-green-700 montserrat_medium">
                      Device Access Token
                    </p>
                    <p className="mt-1 break-all rounded-md bg-white px-2 py-2 text-xs text-[#363636] montserrat_medium">
                      {activationResult.accessToken}
                    </p>
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleActivate}
                    disabled={activating || loading}
                    className={`${buttonClass} inline-flex items-center gap-2 bg-green-500 px-5 py-2.5 text-white after:bg-green-600 hover:bg-green-600 [text-shadow:3px_5px_2px_#1f7a3a] hover:[text-shadow:2px_2px_2px_#bdf7cf]`}
                  >
                    <FaBolt />
                    {activating ? "Aktivacija..." : "Aktiviraj brojilo"}
                  </button>
                </div>
              </div>
            )}
          </div> */}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-[#363636] montserrat_medium">Tip priključka</label>
                <select
                  value={form.connectionType}
                  onChange={setField("connectionType")}
                  required
                  className={inputClass}
                >
                  {connectionTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className="text-xs text-[#363636] montserrat_medium">Napomena</label>
                <textarea
                  value={form.note}
                  onChange={setField("note")}
                  placeholder="Opciono"
                  rows={3}
                  className={`${inputClass} h-auto min-h-24 resize-none`}
                />
              </div>
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
                type="submit"
                disabled={loading}
                className={`${buttonClass} inline-flex items-center gap-2 bg-[#469FFE] px-5 py-2.5 text-white after:bg-[#2b7bdc] hover:bg-[#2b7bdc] [text-shadow:3px_5px_2px_#1f5fb0] hover:[text-shadow:2px_2px_2px_#b5e0ff]`}
              >
                <FaSave />
                {loading ? "Čuvanje..." : "Sačuvaj"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
