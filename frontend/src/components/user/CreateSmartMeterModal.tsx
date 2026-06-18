import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { FaBolt, FaInfoCircle, FaTimes, FaTimesCircle } from "react-icons/fa";
import { smartMeterApi } from "../../api_services/smart_meters/SmartMeterAPIService";
import { useLockBodyScroll } from "../../hooks/ui/useLockBodyScroll";
import type {
  RegisterSmartMeterDto,
  SmartMeterConnectionType,
} from "../../models/smart_meter/SmartMeterTypes";
import type { ConsumerRow } from "../../models/residental_object/ResidentalObjectTypes";

interface CreateSmartMeterModalProps {
  open: boolean;
  consumer: ConsumerRow | null;
  onClose: () => void;
  onCreated: () => void;
}

const inputClass =
  "w-full h-[45px] rounded-xl border border-[#469FFE]/1 bg-white/4 px-4 py-3 text-sm text-[#469FFE] shadow-[0_0_0_1.5px_#469FFE,0_0_25px_-17px_#000] outline-none transition-all duration-200 ease-[cubic-bezier(0.19,1,0.22,1)] placeholder:text-[#469FFE]/60 hover:shadow-[0_0_0_2.5px_#67afff,0_0_25px_-15px_#000] focus:scale-[0.98] active:scale-[0.95] cursor-text montserrat_medium";

const buttonClass =
  "z-30 montserrat_semibold rounded-md relative after:content-[''] after:-z-20 after:absolute after:h-1 after:w-1 after:left-5 overflow-hidden after:bottom-0 after:translate-y-full after:rounded-md hover:after:scale-[300] hover:after:transition-all hover:after:duration-700 after:transition-all after:duration-700 transition-all duration-700 disabled:opacity-50 cursor-pointer";

const serialNumberPattern = /^SM-\d{4}-\d{5}$/;
const ROLE_CLAIM = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";

const emptyForm: Omit<RegisterSmartMeterDto, "objectId"> = {
  serialNumber: "SM-",
  connectionType: "1",
  note: "",
};

const connectionTypes: { value: SmartMeterConnectionType; label: string }[] = [
  { value: "1", label: "Monofazni priključak 6.9kW" },
  { value: "2", label: "Trofazni priključak 11.04kW" },
];

const formatSerialNumber = (value: string) => {
  const digits = value
    .toUpperCase()
    .replace(/^SM-?/, "")
    .replace(/\D/g, "")
    .slice(0, 9);
  const year = digits.slice(0, 4);
  const number = digits.slice(4, 9);

  return `SM-${year}${year.length === 4 ? "-" : ""}${number}`;
};

const getAuthError = () => {
  const token = localStorage.getItem("authToken");
  if (!token) return "Niste prijavljeni. Prijavite se ponovo pa pokušajte dodavanje brojila.";

  try {
    const claims = jwtDecode<{ exp?: number; [ROLE_CLAIM]?: string }>(token);

    if (!claims.exp || claims.exp < Date.now() / 1000) {
      return "Sesija je istekla. Prijavite se ponovo pa pokušajte dodavanje brojila.";
    }

    if (claims[ROLE_CLAIM] !== "User") {
      return `Nalog nema User rolu u tokenu. Trenutna rola: ${claims[ROLE_CLAIM] ?? "nema role"}.`;
    }

    return "";
  } catch {
    return "Token nije ispravan. Prijavite se ponovo pa pokušajte dodavanje brojila.";
  }
};

export default function CreateSmartMeterModal({
  open,
  consumer,
  onClose,
  onCreated,
}: CreateSmartMeterModalProps) {
  const [form, setForm] = useState<Omit<RegisterSmartMeterDto, "objectId">>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useLockBodyScroll(open && Boolean(consumer));

  useEffect(() => {
    if (!open) return;

    setForm(emptyForm);
    setError("");
  }, [open]);

  if (!open || !consumer) return null;

  const setField =
    (field: keyof Omit<RegisterSmartMeterDto, "objectId">) =>
      (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setForm((prev) => ({ ...prev, [field]: event.target.value }));
      };

  const handleSerialNumberChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({
      ...prev,
      serialNumber: formatSerialNumber(event.target.value),
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const serialNumber = form.serialNumber.trim().toUpperCase();
    setError("");

    if (!serialNumberPattern.test(serialNumber)) {
      setError("Serijski broj mora biti u formatu SM-YYYY-XXXXX.");
      return;
    }

    const productionYear = Number(serialNumber.slice(3, 7));
    if (productionYear > new Date().getFullYear()) {
      setError("Godina proizvodnje u serijskom broju ne sme biti u budućnosti.");
      return;
    }

    const authError = getAuthError();
    if (authError) {
      setError(authError);
      return;
    }

    setLoading(true);
    const response = await smartMeterApi.register({
      serialNumber,
      connectionType: form.connectionType,
      objectId: consumer.id,
      note: form.note?.trim(),
    });
    setLoading(false);

    if (!response.success) {
      setError(response.message);
      return;
    }

    onCreated();
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
                  Novo brojilo
                </p>
                <h3 className="mt-1 text-2xl text-[#363636] montserrat_bold">
                  Dodaj brojilo
                </h3>
                <p className="mt-1 text-xs text-[#AFAFAF] montserrat_medium">
                  {consumer.name}
                </p>
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

          <div className="mb-5 flex items-start gap-2.5 rounded-lg border border-blue-100 bg-[#87BFFC]/25 px-3 py-2.5">
            <FaInfoCircle className="mt-0.5 shrink-0 text-base text-blue-400" />
            <p className="text-xs leading-relaxed text-blue-500 montserrat_medium">
              Serijski broj unesite u formatu SM-YYYY-XXXXX, na primer SM-2026-12345.
            </p>
          </div>

          {error && (
            <div className="mb-5 flex items-start gap-2.5 rounded-lg border border-red-100 bg-red-50 px-3 py-2.5">
              <FaTimesCircle className="mt-0.5 shrink-0 text-base text-red-400" />
              <p className="text-xs leading-relaxed text-red-600 montserrat_medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-[#363636] montserrat_medium">Serijski broj</label>
                <input
                  type="text"
                  value={form.serialNumber}
                  onChange={handleSerialNumberChange}
                  required
                  placeholder="SM-YYYY-XXXXX"
                  maxLength={13}
                  className={inputClass}
                />
              </div>

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
                className={`${buttonClass} bg-gray-200 px-5 py-2.5 text-[#363636] after:bg-gray-400 hover:bg-gray-300 [text-shadow:3px_5px_2px_#b8b8b8] hover:[text-shadow:2px_2px_2px_#f2f2f2]`}
              >
                Odustani
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`${buttonClass} bg-[#469FFE] px-5 py-2.5 text-white after:bg-[#2b7bdc] hover:bg-[#2b7bdc] [text-shadow:3px_5px_2px_#1f5fb0] hover:[text-shadow:2px_2px_2px_#b5e0ff]`}
              >
                {loading ? "Čuvanje..." : "Sačuvaj brojilo"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
