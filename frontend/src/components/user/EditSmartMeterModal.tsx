import { useEffect, useState } from "react";
import { FaBolt, FaSave, FaTimes, FaTimesCircle } from "react-icons/fa";
import { smartMeterApi } from "../../api_services/smart_meters/SmartMeterAPIService";
import { useLockBodyScroll } from "../../hooks/ui/useLockBodyScroll";
import type {
  SmartMeterConnectionType,
  SmartMeterLimitType,
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

const getInitialForm = (meter: SmartMeterDto): UpdateSmartMeterDto => ({
  connectionType: String(meter.connectionType || "1") as SmartMeterConnectionType,
  note: meter.note ?? "",
  limitValue: meter.limitValue ?? undefined,
  limitType: String(meter.limitType ?? "1") as SmartMeterLimitType,
});

export default function EditSmartMeterModal({
  open,
  meter,
  onClose,
  onUpdated,
}: EditSmartMeterModalProps) {
  const [form, setForm] = useState<UpdateSmartMeterDto | null>(null);
  const [limitValueInput, setLimitValueInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useLockBodyScroll(open && Boolean(meter));

  useEffect(() => {
    if (!open || !meter) return;

    setForm(getInitialForm(meter));
    setLimitValueInput(meter.limitValue ? String(meter.limitValue) : "");
    setError("");
  }, [open, meter]);

  if (!open || !meter || !form) return null;

  const handleNoteChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setForm((prev) => (prev ? { ...prev, note: event.target.value } : prev));
  };

  const handleLimitTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setForm((prev) => (prev ? { ...prev, limitType: event.target.value as SmartMeterLimitType } : prev));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const normalizedLimitValue = limitValueInput.trim()
      ? Number(limitValueInput.replace(",", "."))
      : undefined;

    if (normalizedLimitValue !== undefined && (!Number.isFinite(normalizedLimitValue) || normalizedLimitValue <= 0)) {
      setError("Limit mora biti pozitivan broj.");
      return;
    }

    setLoading(true);

    const response = await smartMeterApi.update(meter.id, {
      ...form,
      note: form.note?.trim(),
      limitValue: normalizedLimitValue,
      limitType: normalizedLimitValue !== undefined ? form.limitType : undefined,
    });

    setLoading(false);

    if (!response.success) {
      setError(response.message);
      return;
    }

    onUpdated();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-[#363636]/35 px-4 py-8 backdrop-blur-sm sm:py-10">
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

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-[#363636] montserrat_medium">Napomena</label>
              <textarea
                value={form.note}
                onChange={handleNoteChange}
                placeholder="Opciono"
                rows={3}
                className={`${inputClass} h-auto min-h-24 resize-none`}
              />
            </div>

            <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4">
              <div className="mb-3">
                <p className="text-[11px] uppercase tracking-widest text-[#469FFE] montserrat_medium">
                  Limit potrošnje
                </p>
                <p className="mt-1 text-xs text-[#AFAFAF] montserrat_medium">
                  Podesite upozorenje u kWh ili dinarima.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-[#363636] montserrat_medium">Tip limita</label>
                  <select
                    value={String(form.limitType ?? "1")}
                    onChange={handleLimitTypeChange}
                    className={inputClass}
                  >
                    <option value="1">kWh</option>
                    <option value="0">RSD</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-[#363636] montserrat_medium">
                    Vrednost limita
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={limitValueInput}
                    onChange={(event) => setLimitValueInput(event.target.value)}
                    placeholder={String(form.limitType ?? "1") === "0" ? "npr. 5000" : "npr. 350"}
                    className={inputClass}
                  />
                </div>
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
