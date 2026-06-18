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
    "w-full h-[38px] rounded-xl border border-[#469FFE]/30 bg-white/60 px-3 text-sm text-[#363636] outline-none transition-all duration-200 placeholder:text-gray-400 hover:border-[#469FFE]/60 focus:border-[#469FFE] focus:ring-2 focus:ring-[#469FFE]/10 montserrat_medium";

  if (loading)
    return (
      <div className="text-sm text-[#636363] montserrat_medium p-4">
        Učitavanje tarifa…
      </div>
    );

  const zones = [
    { label: "Zelena zona", color: "#22c55e", vt: "GHT" as const, nt: "GLT" as const, range: "0 – 350 kWh" },
    { label: "Plava zona", color: "#3b82f6", vt: "BHT" as const, nt: "BLT" as const, range: "351 – 1200 kWh" },
    { label: "Crvena zona", color: "#ef4444", vt: "RHT" as const, nt: "RLT" as const, range: "preko 1200 kWh" },
  ];

  return (
    <div className="w-full">
      <div className="mb-6">
        <p className="text-xs uppercase tracking-[0.3em] text-[#469FFE] montserrat_medium">
          Tarife
        </p>
        <h2 className="mt-1 text-2xl text-[#363636] montserrat_bold">
          Tarifni modeli
        </h2>
        <p className="mt-1 text-sm text-[#636363] montserrat_medium">
          Definišite cene za VT/NT po zonama i fiksne troškove
        </p>
      </div>

      {error && (
        <div className="mb-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl montserrat_medium">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 bg-green-500/10 border border-green-500/20 text-green-600 text-sm px-4 py-3 rounded-xl montserrat_medium">
          ✓ Tarife su uspešno sačuvane.
        </div>
      )}

      <div className="flex flex-col gap-5">
        {zones.map((z) => (
          <div key={z.label}>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: z.color }} />
              <p className="text-sm text-[#363636] montserrat_semibold">{z.label}</p>
              <span className="text-xs text-[#636363] montserrat_medium">({z.range})</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-[#469FFE] montserrat_semibold">
                  Cena VT (RSD/kWh)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={tariff[z.vt]}
                  onChange={set(z.vt)}
                  className={inputClass}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-[#469FFE] montserrat_semibold">
                  Cena NT (RSD/kWh)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={tariff[z.nt]}
                  onChange={set(z.nt)}
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-[#469FFE]/10 my-5" />

      <p className="text-xs uppercase tracking-[0.2em] text-[#469FFE] montserrat_semibold mb-3">
        Fiksni troškovi
      </p>
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-[#469FFE] montserrat_semibold">
            Cena obračunske snage (RSD/kW)
          </label>
          <input
            type="number"
            step="0.01"
            value={tariff.BillingPowerPrice}
            onChange={set("BillingPowerPrice")}
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-[#469FFE] montserrat_semibold">
            Trošak snabdevača (RSD)
          </label>
          <input
            type="number"
            step="0.01"
            value={tariff.SupplierCost}
            onChange={set("SupplierCost")}
            className={inputClass}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="text-sm montserrat_semibold text-white bg-[#469FFE] hover:bg-[#2b7bdc] px-6 py-2.5 rounded-xl transition-all duration-300 disabled:opacity-50 cursor-pointer"
        >
          {saving ? "Čuvanje…" : "Sačuvaj izmene"}
        </button>
      </div>
    </div>
  );
}