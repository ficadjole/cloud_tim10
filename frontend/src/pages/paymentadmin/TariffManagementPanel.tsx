import { useState, useEffect } from "react";
import { tariffApi } from "../../api_services/tariff/TariffAPIService";
import type { TariffDto } from "../../types/tariff/TarifTypes";

const EMPTY: TariffDto = {
  GHT: 0, GLT: 0, BHT: 0, BLT: 0, RHT: 0, RLT: 0,
  BillingPowerPrice: 0, SupplierCost: 0,
};

export default function TariffManagementPanel() {
  const [tariff, setTariff] = useState<TariffDto>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await tariffApi.get();
       console.log("tariff response:", res);
      if (res.success && res.data) setTariff(res.data);
      else setError(res.message ?? "Greška pri učitavanju tarifa");
      setLoading(false);
    })();
  }, []);

  const set = (field: keyof TariffDto) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setTariff((prev) => ({ ...prev, [field]: parseFloat(e.target.value) || 0 }));

  const handleSave = async () => {
    setError("");
    setSuccess(false);
    setSaving(true);
    const res = await tariffApi.update(tariff);
    setSaving(false);
    if (!res.success) {
      setError(res.message ?? "Greška pri čuvanju tarifa");
      return;
    }
    setSuccess(true);
  };

  const inputClass =
    "w-full h-[38px] rounded-lg border border-[#469FFE]/30 bg-white px-3 text-sm text-gray-800 outline-none transition-all placeholder:text-gray-400 hover:border-[#469FFE]/60 focus:border-[#469FFE] focus:ring-2 focus:ring-[#469FFE]/10";

  if (loading) return <div className="text-sm text-gray-400 p-6">Učitavanje tarifa…</div>;

  const zones = [
    { label: "Zelena zona", color: "#22c55e", vt: "GHT" as const, nt: "GLT" as const, range: "0 – 350 kWh" },
    { label: "Plava zona", color: "#3b82f6", vt: "BHT" as const, nt: "BLT" as const, range: "351 – 1200 kWh" },
    { label: "Crvena zona", color: "#ef4444", vt: "RHT" as const, nt: "RLT" as const, range: "preko 1200 kWh" },
  ];

  return (
    <div className="w-full max-w-2xl font-sans">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-medium text-gray-900">Upravljanje tarifnim modelima</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Definišite cene za VT/NT po zonama i fiksne troškove
          </p>
        </div>
        <span className="text-2xl text-gray-400">⚡</span>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        {error && (
          <div className="bg-red-50 border border-red-100 rounded-lg px-3 py-2.5 mb-5 text-xs text-red-600">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-100 rounded-lg px-3 py-2.5 mb-5 text-xs text-green-600">
            ✓ Tarife su uspešno sačuvane.
          </div>
        )}

        <div className="space-y-5">
          {zones.map((z) => (
            <div key={z.label}>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: z.color }} />
                <p className="text-sm font-medium text-gray-800">{z.label}</p>
                <span className="text-xs text-gray-400">({z.range})</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-gray-500">Cena VT (RSD/kWh)</label>
                  <input type="number" step="0.01" value={tariff[z.vt]} onChange={set(z.vt)} className={inputClass} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-gray-500">Cena NT (RSD/kWh)</label>
                  <input type="number" step="0.01" value={tariff[z.nt]} onChange={set(z.nt)} className={inputClass} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <hr className="border-gray-100 my-5" />

        <p className="text-[11px] font-medium uppercase tracking-widest text-gray-400 mb-3">
          Fiksni troškovi
        </p>
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-gray-500">Cena obračunske snage (RSD/kW)</label>
            <input type="number" step="0.01" value={tariff.BillingPowerPrice} onChange={set("BillingPowerPrice")} className={inputClass} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-gray-500">Trošak snabdevača (RSD)</label>
            <input type="number" step="0.01" value={tariff.SupplierCost} onChange={set("SupplierCost")} className={inputClass} />
          </div>
        </div>

        <div className="flex items-center justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="text-sm font-medium text-white bg-[#469FFE] hover:bg-[#2b7bdc] px-5 py-2 rounded-lg transition-all disabled:opacity-50"
          >
            {saving ? "Čuvanje…" : "Sačuvaj izmene"}
          </button>
        </div>
      </div>
    </div>
  );
}