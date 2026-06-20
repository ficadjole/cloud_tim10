import { useEffect, useState } from "react";
import { FaTimes } from "react-icons/fa";
import { billApi } from "../../api_services/bills/BillAPIService";
import type { BillDto } from "../../models/bill/BillTypes";

const statusLabel: Record<string, string> = {
  Paid: "Plaćen",
  Unpaid: "Neplaćen",
};

const statusColor: Record<string, string> = {
  Paid: "bg-green-100 text-green-700",
  Unpaid: "bg-red-100 text-red-700",
};

interface Props {
  smartMeterId: string;
  meterLabel: string;
  onClose: () => void;
}

export default function BillsModal({ smartMeterId, meterLabel, onClose }: Props) {
  const [bills, setBills] = useState<BillDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      const res = await billApi.getByMeter(smartMeterId, 1, 20);
      if (res.success && res.data) {
        setBills(res.data.items);
      } else {
        setError(res.message ?? "Greška pri učitavanju računa");
      }
      setLoading(false);
    })();
  }, [smartMeterId]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[#363636]/35 px-4 py-8 backdrop-blur-sm sm:py-10"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-2xl border border-white/40 bg-linear-to-b from-[#FAFAFA] to-white/1 p-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="max-h-[calc(100vh-5rem)] overflow-y-auto rounded-2xl border border-gray-200 bg-[#FAFAFA] p-6 md:p-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[#469FFE] montserrat_medium">
                Evidencija uplata
              </p>
              <h2 className="mt-1 text-2xl text-[#363636] montserrat_bold">
                {meterLabel}
              </h2>
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

          {loading && (
            <div className="text-sm text-[#636363] montserrat_medium py-8 text-center">
              Učitavanje računa…
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl montserrat_medium mb-4">
              {error}
            </div>
          )}

          {!loading && !error && bills.length === 0 && (
            <div className="text-sm text-[#636363] montserrat_medium py-8 text-center">
              Nema izdatih računa za ovo brojilo.
            </div>
          )}

          {!loading && bills.length > 0 && (
            <div className="flex flex-col gap-3">
              {bills.map((b) => (
                <div
                  key={b.id}
                  className="rounded-xl border border-[#469FFE]/10 bg-white/60 p-4 flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm text-[#363636] montserrat_semibold">
                      {new Date(b.billingPeriod).toLocaleDateString("sr-RS", {
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                    <p className="text-xs text-[#636363] montserrat_medium mt-0.5">
                      VT: {b.highTariffKWh.toFixed(1)} kWh · NT: {b.lowTariffKWh.toFixed(1)} kWh
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="text-sm text-[#363636] montserrat_semibold">
                      {b.totalAmount.toFixed(2)} RSD
                    </p>
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full montserrat_medium ${
                        statusColor[b.status] ?? "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {statusLabel[b.status] ?? b.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}