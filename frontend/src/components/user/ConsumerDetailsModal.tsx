import { useEffect, useState } from "react";
import {
  FaBolt,
  FaChevronDown,
  FaChevronUp,
  FaEdit,
  FaHome,
  FaInfoCircle,
  FaMapMarkerAlt,
  FaPlus,
  FaSave,
  FaTimes,
  FaTrash,
} from "react-icons/fa";
import { residentalObjectApi } from "../../api_services/residental_objects/ResidentalObjectAPIService";
import type {
  ConsumerRow,
  ResidentalObjectType,
  UpdateResidentalObjectDto,
} from "../../models/residental_object/ResidentalObjectTypes";
import type { SmartMeterDto } from "../../models/smart_meter/SmartMeterTypes";

interface ConsumerDetailsModalProps {
  open: boolean;
  consumer: ConsumerRow | null;
  onClose: () => void;
  onAddMeter: (consumer: ConsumerRow) => void;
  onEditMeter: (meter: SmartMeterDto) => void;
  onRemoveMeter: (consumer: ConsumerRow, meter: SmartMeterDto) => void;
  onUpdated: (consumerId: string) => Promise<void> | void;
}

const detailItemClass = "rounded-lg border border-gray-200 bg-white px-3 py-3";
const inputClass =
  "w-full h-[43px] rounded-xl border border-[#469FFE]/1 bg-white px-4 py-3 text-sm text-[#469FFE] shadow-[0_0_0_1.5px_#469FFE,0_0_25px_-17px_#000] outline-none transition-all duration-200 placeholder:text-[#469FFE]/60 hover:shadow-[0_0_0_2.5px_#67afff,0_0_25px_-15px_#000] focus:scale-[0.98] cursor-text montserrat_medium";

const objectTypes: { value: ResidentalObjectType; label: string }[] = [
  { value: "0", label: "Kuca" },
  { value: "1", label: "Stan" },
  { value: "2", label: "Vikendica" },
];

const getObjectTypeLabel = (type: string | number) => {
  const normalized = String(type);

  if (normalized === "0") return "Kuća";
  if (normalized === "1") return "Stan";
  if (normalized === "2") return "Vikendica";

  return normalized || "Objekat";
};

const getConnectionTypeLabel = (type: SmartMeterDto["connectionType"]) => {
  const normalized = String(type ?? "");

  if (normalized === "1") return "Monofazni";
  if (normalized === "2") return "Trofazni";

  return type ? String(type) : "-";
};

const isMeterActive = (meter: SmartMeterDto, consumer: ConsumerRow) => {
  if (typeof meter.isActive === "boolean") return meter.isActive;

  const status = String(meter.status ?? "").toLowerCase();
  if (status === "1" || status === "paired" || status === "active") return true;
  if (status === "0" || status === "unpaired" || status === "inactive") return false;

  return consumer.isActive;
};

const getMeters = (consumer: ConsumerRow): SmartMeterDto[] => {
  if (consumer.smartMeters?.length) return consumer.smartMeters;
  if (consumer.connectedMeterId) return [{ id: consumer.connectedMeterId }];

  return [];
};

const parseAddress = (fullAddress: string) => {
  const [streetAndNumber = "", ...cityParts] = fullAddress.split(",");
  const city = cityParts.join(",").trim();
  const addressParts = streetAndNumber.trim().split(/\s+/).filter(Boolean);
  const number = addressParts.length > 1 ? addressParts[addressParts.length - 1] : "";
  const street = addressParts.length > 1 ? addressParts.slice(0, -1).join(" ") : streetAndNumber.trim();

  return { street, number, city };
};

const getInitialForm = (consumer: ConsumerRow): UpdateResidentalObjectDto => {
  const address = parseAddress(consumer.fullAddress);

  return {
    name: consumer.name,
    type: String(consumer.type) as ResidentalObjectType,
    street: address.street,
    number: address.number,
    city: address.city,
    description: consumer.description ?? "",
  };
};

export default function ConsumerDetailsModal({
  open,
  consumer,
  onClose,
  onAddMeter,
  onEditMeter,
  onRemoveMeter,
  onUpdated,
}: ConsumerDetailsModalProps) {
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<UpdateResidentalObjectDto | null>(null);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState("");

  useEffect(() => {
    if (!open || !consumer) return;

    setForm(getInitialForm(consumer));
    setIsEditing(false);
    setEditError("");
  }, [open, consumer]);

  if (!open || !consumer) return null;

  const meters = getMeters(consumer);
  const description = consumer.description?.trim();

  const setField =
    (field: keyof UpdateResidentalObjectDto) =>
      (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setForm((prev) => (prev ? { ...prev, [field]: event.target.value } : prev));
      };

  const handleEditSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form) return;

    setEditError("");
    setSaving(true);

    const response = await residentalObjectApi.update(consumer.id, {
      ...form,
      name: form.name.trim(),
      street: form.street.trim(),
      number: form.number.trim(),
      city: form.city.trim(),
      description: form.description?.trim(),
    });

    setSaving(false);

    if (!response.success) {
      setEditError(response.message);
      return;
    }

    await onUpdated(consumer.id);
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#363636]/35 px-4 backdrop-blur-sm">
      <div className="w-full max-w-3xl rounded-2xl border border-white/40 bg-linear-to-b from-[#FAFAFA] to-white/1 p-4 shadow-2xl">
        <div className="max-h-[90vh] overflow-y-auto rounded-2xl border border-gray-200 bg-[#FAFAFA] p-6">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-100">
                <FaHome className="text-lg text-[#469FFE]" />
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-widest text-gray-400 montserrat_medium">
                  Detalji objekta
                </p>
                <h3 className="mt-1 text-2xl text-[#363636] montserrat_bold">
                  {consumer.name}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!isEditing && (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-3 text-xs text-[#469FFE] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-blue-100 active:scale-[0.98] montserrat_semibold"
                >
                  <FaEdit />
                  Izmeni
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-[#AFAFAF] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:text-[#469FFE] active:scale-[0.98]"
                aria-label="Zatvori modal"
              >
                <FaTimes />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className={`${detailItemClass} sm:col-span-2`}>
              <p className="text-[11px] uppercase tracking-widest text-gray-400 montserrat_medium">ID objekta</p>
              <p className="mt-1 break-all text-xs text-[#AFAFAF] montserrat_medium">{consumer.id}</p>
            </div>

            {isEditing && form ? (
              <form onSubmit={handleEditSubmit} className="grid grid-cols-1 gap-3 sm:col-span-2 sm:grid-cols-2">
                {editError && (
                  <div className="rounded-lg border border-red-100 bg-red-50 px-3 py-2.5 text-xs text-red-600 montserrat_medium sm:col-span-2">
                    {editError}
                  </div>
                )}

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-[#363636] montserrat_medium">Naziv</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={setField("name")}
                    required
                    className={inputClass}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-[#363636] montserrat_medium">Tip objekta</label>
                  <select value={form.type} onChange={setField("type")} required className={inputClass}>
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
                    className={inputClass}
                  />
                </div>

                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label className="text-xs text-[#363636] montserrat_medium">Opis</label>
                  <textarea
                    value={form.description}
                    onChange={setField("description")}
                    rows={3}
                    className={`${inputClass} h-auto min-h-24 resize-none`}
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 border-t border-gray-100 pt-4 sm:col-span-2">
                  <button
                    type="button"
                    onClick={() => {
                      setForm(getInitialForm(consumer));
                      setIsEditing(false);
                      setEditError("");
                    }}
                    disabled={saving}
                    className="rounded-md bg-gray-200 px-4 py-2 text-sm text-[#363636] transition-colors hover:bg-gray-300 disabled:opacity-50 montserrat_semibold"
                  >
                    Odustani
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-md bg-[#469FFE] px-4 py-2 text-sm text-white transition-colors hover:bg-[#2b7bdc] disabled:opacity-50 montserrat_semibold"
                  >
                    <FaSave />
                    {saving ? "Čuvanje..." : "Sačuvaj"}
                  </button>
                </div>
              </form>
            ) : (
              <>
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

                <div className={`${detailItemClass} sm:col-span-2`}>
                  <button
                    type="button"
                    onClick={() => setIsDescriptionOpen((prev) => !prev)}
                    className="flex w-full items-center justify-between gap-3 text-left"
                  >
                    <span className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-gray-400 montserrat_medium">
                      <FaInfoCircle className="text-[#469FFE]" />
                      Opis
                    </span>
                    {isDescriptionOpen ? (
                      <FaChevronUp className="text-[#469FFE]" />
                    ) : (
                      <FaChevronDown className="text-[#469FFE]" />
                    )}
                  </button>

                  {isDescriptionOpen && (
                    <p className={`mt-3 whitespace-pre-wrap text-sm leading-relaxed text-[#363636] montserrat_medium ${description ? "" : "italic text-[#AFAFAF]"}`}>
                      {description || "Nema opisa ovog objekta"}
                    </p>
                  )}
                </div>
              </>
            )}

            <div className={`${detailItemClass} sm:col-span-2`}>
              <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  <FaBolt className="text-[#469FFE]" />
                  <p className="text-[11px] uppercase tracking-widest text-gray-400 montserrat_medium">Brojila</p>
                </div>
                <button
                  type="button"
                  onClick={() => onAddMeter(consumer)}
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-[#469FFE] px-3 py-2 text-xs text-white montserrat_semibold transition-colors hover:bg-[#2b7bdc]"
                >
                  <FaPlus />
                  Dodaj brojilo
                </button>
              </div>

              <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px] border-collapse text-left">
                    <thead className="bg-[#FAFAFA]">
                      <tr className="border-b border-gray-200 text-[11px] uppercase tracking-widest text-gray-400 montserrat_medium">
                        <th className="px-3 py-2.5">SerialNumber</th>
                        <th className="px-3 py-2.5">ID</th>
                        <th className="px-3 py-2.5">ConnectionType</th>
                        <th className="px-3 py-2.5 text-center">Aktivno</th>
                        <th className="px-3 py-2.5 text-right">Akcije</th>
                      </tr>
                    </thead>
                    <tbody>
                      {meters.length === 0 && (
                        <tr>
                          <td className="px-3 py-5 text-center text-sm italic text-[#AFAFAF] montserrat_medium" colSpan={5}>
                            Nema povezanih brojila.
                          </td>
                        </tr>
                      )}

                      {meters.map((meter) => (
                          <tr key={meter.id} className="border-b border-gray-100 last:border-b-0">
                            <td className="px-3 py-3 text-sm text-[#363636] montserrat_semibold">
                              {meter.serialNumber || "-"}
                            </td>
                            <td className="px-3 py-3 text-xs text-[#AFAFAF] montserrat_medium">
                              <span className="break-all">{meter.id}</span>
                            </td>
                            <td className="px-3 py-3 text-sm text-[#363636] montserrat_medium">
                              {getConnectionTypeLabel(meter.connectionType)}
                            </td>
                            <td className="px-3 py-3">
                              <div className="flex justify-center">
                                <span
                                  className={`h-3 w-3 rounded-full ${isMeterActive(meter, consumer) ? "bg-green-500" : "bg-gray-300"}`}
                                  aria-label={isMeterActive(meter, consumer) ? "Aktivno" : "Neaktivno"}
                                />
                              </div>
                            </td>
                            <td className="px-3 py-3 text-right">
                              <div className="flex justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => onEditMeter(meter)}
                                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-blue-100 bg-blue-50 text-[#469FFE] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-blue-100 active:scale-[0.98]"
                                  aria-label="Izmeni brojilo"
                                >
                                  <FaEdit />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => onRemoveMeter(consumer, meter)}
                                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-red-100 bg-red-50 text-red-400 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-red-200 hover:bg-red-100 active:scale-[0.98]"
                                  aria-label="Ukloni brojilo"
                                >
                                  <FaTrash />
                                </button>
                              </div>
                            </td>
                          </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
