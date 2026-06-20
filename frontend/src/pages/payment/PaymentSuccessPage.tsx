import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom"; 
import { AiOutlineLoading } from "react-icons/ai";
import { FaCheck, FaDownload, FaFileInvoiceDollar, FaHome } from "react-icons/fa";
import axios from "axios"; 
import { billApi } from "../../api_services/bills/BillAPIService";
import type { BillDto } from "../../models/bill/BillTypes";

const pendingPaymentBillKey = "pendingPaymentBill";

const formatCurrency = (value: number) =>
  `${Number(value).toLocaleString("sr-RS", { maximumFractionDigits: 2 })} RSD`;

const formatPeriod = (value: string) => {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("sr-RS", { month: "2-digit", year: "numeric" });
};

const readPendingBill = (): BillDto | null => {
  try {
    const raw = sessionStorage.getItem(pendingPaymentBillKey);
    return raw ? (JSON.parse(raw) as BillDto) : null;
  } catch {
    return null;
  }
};

export default function PaymentSuccessPage() {
  const bill = useMemo(readPendingBill, []);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [error, setError] = useState("");

  const [searchParams] = useSearchParams();

  useEffect(() => {
  const queryParams = new URLSearchParams(window.location.search);
  const sessionId = queryParams.get("session_id") || searchParams.get("session_id");

  if (sessionId) {
    console.log("[SMARTGRID] Pronađen session_id u ruteru, šaljem backendu:", sessionId);

    const timer = setTimeout(() => {
      
      axios.post(`https://localhost:7262/api/Bills/fulfill-payment?sessionId=${sessionId}`, {})
        .then(response => {
          console.log("[SMARTGRID] Uspeh! Račun uspešno proknjižen u bazi podataka!");
          sessionStorage.removeItem(pendingPaymentBillKey);
        })
        .catch(err => {
          console.error("[SMARTGRID] Greška prilikom proknjižavanja:", err.response?.data || err.message);
        });

    }, 1000);

    return () => clearTimeout(timer);
  }
}, [searchParams]);

  const handleDownloadPdf = async () => {
    if (!bill) return;

    setError("");
    setLoadingPdf(true);

    const response = await billApi.downloadPdf(bill);
    setLoadingPdf(false);

    if (!response.success || !response.data) {
      setError(response.message);
      return;
    }

    const pdfUrl = URL.createObjectURL(response.data);
    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = `Invoice_${bill.id}.pdf`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(pdfUrl), 60_000);
  };

  return (
    <main className="min-h-screen bg-linear-to-b from-white via-[#FAFAFA] to-[#87BFFC] px-4 py-8">
      <section className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-4xl items-center justify-center">
        <div className="w-full rounded-2xl border border-white/40 bg-linear-to-b from-[#FAFAFA] to-white/1 p-4 shadow-2xl backdrop-blur-2xl">
          <div className="rounded-2xl border border-gray-200 bg-[#FAFAFA] p-6 sm:p-8">
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-green-50">
              <div className="flex h-16 w-16 animate-[success-pop_650ms_ease-out] items-center justify-center rounded-full bg-green-500 text-white shadow-lg shadow-green-500/25">
                <FaCheck className="animate-[success-check_900ms_ease-out] text-3xl" />
              </div>
            </div>

            <div className="text-center">
              <p className="text-[11px] uppercase tracking-widest text-green-600 montserrat_medium">
                Payment completed
              </p>
              <h1 className="mt-2 text-3xl text-[#363636] montserrat_bold">
                Uspešno plaćanje
              </h1>
              <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-[#AFAFAF] montserrat_medium">
                Uplata je evidentirana. <br /> Ovde možete proveriti detalje računa i preuzeti PDF račun.
              </p>
            </div>

            {bill ? (
              <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 sm:col-span-2">
                  <div className="flex items-start gap-3">
                    <FaFileInvoiceDollar className="mt-1 shrink-0 text-[#469FFE]" />
                    <div>
                      <p className="text-[11px] uppercase tracking-widest text-gray-400 montserrat_medium">ID računa</p>
                      <p className="mt-1 break-all text-xs text-[#AFAFAF] montserrat_medium">{bill.id}</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-gray-200 bg-white px-4 py-3">
                  <p className="text-[11px] uppercase tracking-widest text-gray-400 montserrat_medium">Period</p>
                  <p className="mt-1 text-sm text-[#363636] montserrat_semibold">{formatPeriod(bill.billingPeriod)}</p>
                </div>

                <div className="rounded-lg border border-gray-200 bg-white px-4 py-3">
                  <p className="text-[11px] uppercase tracking-widest text-gray-400 montserrat_medium">Uplaćeno</p>
                  <p className="mt-1 text-sm text-green-600 montserrat_semibold">{formatCurrency(bill.totalAmount)}</p>
                </div>

                <div className="rounded-lg border border-gray-200 bg-white px-4 py-3">
                  <p className="text-[11px] uppercase tracking-widest text-gray-400 montserrat_medium">Brojilo</p>
                  <p className="mt-1 break-all text-xs text-[#AFAFAF] montserrat_medium">{bill.smartMeterId}</p>
                </div>

                <div className="rounded-lg border border-gray-200 bg-white px-4 py-3">
                  <p className="text-[11px] uppercase tracking-widest text-gray-400 montserrat_medium">Status</p>
                  <p className="mt-1 text-sm text-green-600 montserrat_semibold">Plaćeno</p>
                </div>
              </div>
            ) : (
              <div className="mt-8 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-center">
                <p className="text-sm text-blue-600 montserrat_medium">
                  Detalji računa nisu dostupni u ovoj sesiji.
                </p>
              </div>
            )}

            {error && (
              <div className="mt-5 rounded-lg border border-red-100 bg-red-50 px-4 py-3">
                <p className="text-sm text-red-600 montserrat_medium">{error}</p>
              </div>
            )}

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={!bill || loadingPdf}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-[#469FFE] px-5 py-2.5 text-sm text-white transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-[#2b7bdc] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 montserrat_semibold"
              >
                {loadingPdf ? <AiOutlineLoading className="animate-spin" /> : <FaDownload />}
                Preuzmi PDF
              </button>

              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center gap-2 rounded-md border border-gray-200 bg-white px-5 py-2.5 text-sm text-[#363636] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-blue-100 hover:bg-blue-50 hover:text-[#469FFE] active:scale-[0.98] montserrat_semibold"
              >
                <FaHome />
                Nazad na kontrolni panel
              </Link>
            </div>
          </div>
        </div>
      </section>

      <style>
        {`
          @keyframes success-pop {
            0% { transform: scale(0.55); opacity: 0; }
            65% { transform: scale(1.08); opacity: 1; }
            100% { transform: scale(1); opacity: 1; }
          }

          @keyframes success-check {
            0% { transform: scale(0.5) rotate(-18deg); opacity: 0; }
            45% { transform: scale(0.5) rotate(-18deg); opacity: 0; }
            100% { transform: scale(1) rotate(0deg); opacity: 1; }
          }
        `}
      </style>
    </main>
  );
}