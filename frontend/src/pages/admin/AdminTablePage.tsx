import { Link } from "react-router-dom";

export default function AdminTablePage() {
  return (
    <main className="min-h-screen bg-linear-to-b from-white via-[#FAFAFA] to-[#87BFFC] px-4 py-6 backdrop-blur-md">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-5xl items-center justify-center">
        <div className="w-full rounded-3xl border border-white/40 bg-white/80 p-8 shadow-lg backdrop-blur-2xl">
          <p className="text-xs uppercase tracking-[0.3em] text-[#469FFE] montserrat_medium">U pripremi</p>
          <h1 className="mt-3 text-3xl text-[#363636] montserrat_bold">Tabela korisnika</h1>
          <p className="mt-3 max-w-xl text-sm text-[#636363] montserrat_medium">
            Ovaj ekran će kasnije prikazivati tabelu i filtere za pregled podataka.
          </p>
          <div className="mt-6">
            <Link
              to="/admindashboard"
              className="inline-flex items-center rounded-md bg-[#469FFE] px-4 py-2 text-sm text-white montserrat_semibold transition-colors hover:bg-[#2b7bdc]"
            >
              Nazad na dashboard
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}