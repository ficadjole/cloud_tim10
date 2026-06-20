import { useState } from "react";
import { Link } from "react-router-dom";
import { FaTimes, FaUsers } from "react-icons/fa";
import UserManagementPanel from "../../pages/admin/UserManagementPanel";

export default function AdminTablePage() {
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  return (
    <main className="min-h-screen flex items-start justify-center bg-linear-to-b from-white via-[#FAFAFA] to-[#87BFFC] px-4 py-10">
      <div className="w-full max-w-5xl rounded-2xl bg-linear-to-b from-[#FAFAFA] to-white/1 backdrop-blur-2xl border border-white/40 px-4 py-4 shadow-lg">
        <div className="rounded-2xl bg-[#FAFAFA] p-6 md:p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[#469FFE] montserrat_medium">
                Korisnici
              </p>
              <h1 className="mt-2 text-3xl text-[#363636] montserrat_bold">
                Tabela korisnika
              </h1>
              <p className="mt-1 text-sm text-[#636363] montserrat_medium">
                Upravljajte nalozima, suspenzijama i brisanjem korisnika
              </p>
            </div>
            <Link
              to="/admindashboard"
              className="inline-flex items-center rounded-md bg-[#469FFE] px-4 py-2 text-sm text-white montserrat_semibold transition-colors hover:bg-[#2b7bdc]"
            >
              ← Nazad
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setIsPanelOpen(true)}
            className="group w-full rounded-2xl border border-white/40 bg-white/60 backdrop-blur-sm shadow-sm px-6 py-8 text-left transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-blue-100">
                <FaUsers className="text-xl text-[#469FFE]" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-[#469FFE] montserrat_medium">
                  Nalozi
                </p>
                <h2 className="mt-1 text-xl text-[#363636] montserrat_bold">
                  Upravljanje korisnicima
                </h2>
                <p className="mt-1 text-sm text-[#636363] montserrat_medium">
                  Klikni da otvoriš pregled, suspenziju i brisanje korisničkih naloga
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {isPanelOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[#363636]/35 px-4 py-8 backdrop-blur-sm sm:py-10">
          <div className="w-full max-w-5xl rounded-2xl border border-white/40 bg-linear-to-b from-[#FAFAFA] to-white/1 p-4 shadow-2xl">
            <div className="max-h-[calc(100vh-5rem)] overflow-y-auto rounded-2xl border border-gray-200 bg-[#FAFAFA] p-6 md:p-8">
              <div className="mb-2 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => setIsPanelOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-[#AFAFAF] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:text-[#469FFE] active:scale-[0.98]"
                  aria-label="Zatvori modal"
                >
                  <FaTimes />
                </button>
              </div>

              <UserManagementPanel />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}