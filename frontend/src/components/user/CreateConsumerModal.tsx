import { useEffect, useState } from "react";
import { FaHome, FaInfoCircle, FaTimes, FaTimesCircle } from "react-icons/fa";
import { residentalObjectApi } from "../../api_services/residental_objects/ResidentalObjectAPIService";
import type {
  CreateResidentalObjectDto,
  ResidentalObjectType,
} from "../../models/residental_object/ResidentalObjectTypes";

interface CreateConsumerModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const emptyForm: CreateResidentalObjectDto = {
  name: "",
  type: "1",
  street: "",
  number: "",
  city: "",
  description: "",
};

const inputClass =
  "w-full h-[45px] rounded-xl border border-[#469FFE]/1 bg-white/4 px-4 py-3 text-sm text-[#469FFE] shadow-[0_0_0_1.5px_#469FFE,0_0_25px_-17px_#000] outline-none transition-all duration-200 ease-[cubic-bezier(0.19,1,0.22,1)] placeholder:text-[#469FFE]/60 hover:shadow-[0_0_0_2.5px_#67afff,0_0_25px_-15px_#000] focus:scale-[0.98] active:scale-[0.95] cursor-text montserrat_medium";

const buttonClass =
  "z-30 montserrat_semibold rounded-md relative after:content-[''] after:-z-20 after:absolute after:h-1 after:w-1 after:left-5 overflow-hidden after:bottom-0 after:translate-y-full after:rounded-md hover:after:scale-[300] hover:after:transition-all hover:after:duration-700 after:transition-all after:duration-700 transition-all duration-700 disabled:opacity-50 cursor-pointer";

const objectTypes: { value: ResidentalObjectType; label: string }[] = [
  { value: "0", label: "Kuća" },
  { value: "1", label: "Stan" },
  { value: "2", label: "Vikendica" },
];

export default function CreateConsumerModal({
  open,
  onClose,
  onCreated,
}: CreateConsumerModalProps) {
  const [form, setForm] = useState<CreateResidentalObjectDto>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;

    setForm(emptyForm);
    setError("");
  }, [open]);

  if (!open) return null;

  const setField =
    (field: keyof CreateResidentalObjectDto) =>
      (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setForm((prev) => ({ ...prev, [field]: event.target.value }));
      };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    const response = await residentalObjectApi.create({
      ...form,
      name: form.name.trim(),
      street: form.street.trim(),
      number: form.number.trim(),
      city: form.city.trim(),
      description: form.description?.trim(),
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
                  Novi objekat
                </p>
                <h3 className="mt-1 text-2xl text-[#363636] montserrat_bold">
                  Dodaj objekat
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

          <div className="mb-5 flex items-start gap-2.5 rounded-lg border border-blue-100 bg-[#87BFFC]/25 px-3 py-2.5">
            <FaInfoCircle className="mt-0.5 shrink-0 text-base text-blue-400" />
            <p className="text-xs leading-relaxed text-blue-500 montserrat_medium">
              Unesite osnovne informacije o objektu.
              Nakon kreiranja, možete dodati i uređivati njegova brojila.
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
                <label className="text-xs text-[#363636] montserrat_medium">Naziv</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={setField("name")}
                  required
                  placeholder="Porodična kuća"
                  className={inputClass}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-[#363636] montserrat_medium">Tip objekta</label>
                <select
                  value={form.type}
                  onChange={setField("type")}
                  required
                  className={inputClass}
                >
                  {objectTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-[#363636] montserrat_medium">Ulica</label>
                <input
                  type="text"
                  value={form.street}
                  onChange={setField("street")}
                  required
                  placeholder="Bulevar oslobođenja"
                  className={inputClass}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-[#363636] montserrat_medium">Broj</label>
                <input
                  type="text"
                  value={form.number}
                  onChange={setField("number")}
                  required
                  placeholder="12A"
                  className={inputClass}
                />
              </div>

              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className="text-xs text-[#363636] montserrat_medium">Grad</label>
                <input
                  type="text"
                  value={form.city}
                  onChange={setField("city")}
                  required
                  placeholder="Novi Sad"
                  className={inputClass}
                />
              </div>

              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className="text-xs text-[#363636] montserrat_medium">Opis</label>
                <textarea
                  value={form.description}
                  onChange={setField("description")}
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
                {loading ? "Čuvanje..." : "Sačuvaj"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div >
  );
}
