import { Link } from "react-router-dom";
import { FaHome, FaTimesCircle } from "react-icons/fa";

export default function PaymentFailedPage() {
  return (
    <main className="min-h-screen bg-linear-to-b from-white via-[#FAFAFA] to-[#87BFFC] px-4 py-8">
      <section className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-2xl items-center justify-center">
        <div className="w-full rounded-2xl border border-white/40 bg-linear-to-b from-[#FAFAFA] to-white/1 p-4 shadow-2xl backdrop-blur-2xl">
          <div className="rounded-2xl border border-gray-200 bg-[#FAFAFA] p-8 text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-50">
              <FaTimesCircle className="text-5xl text-red-500" />
            </div>

            <p className="text-[11px] uppercase tracking-widest text-red-500 montserrat_medium">
              Payment failed
            </p>
            <h1 className="mt-2 text-3xl text-[#363636] montserrat_bold">
              Plaćanje nije uspelo
            </h1>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-[#AFAFAF] montserrat_medium">
              Uplata nije izvršena. Pokušajte ponovo.
            </p>

            <div className="mt-8">
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center gap-2 rounded-md bg-[#469FFE] px-5 py-2.5 text-sm text-white transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-[#2b7bdc] active:scale-[0.98] montserrat_semibold"
              >
                <FaHome />
                Nazad na kontrolni panel
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
