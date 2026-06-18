import { Link } from "react-router-dom";
import UserManagementPanel from "../../pages/admin/UserManagementPanel";

export default function AdminTablePage() {
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

          <UserManagementPanel />
        </div>
      </div>
    </main>
  );
}