import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/auth/useAuthHook";
import userIcon from "../../public/user.png";
import tableIcon from "../../public/Table.png";
import bg2 from "../../public/bg3.png";
import { FaTimes } from "react-icons/fa";
import UserManagementPanel from "./UserManagementPanel";
import CreateUserPanel from "../../components/admin/CreateUserPanel";

export default function AdminDashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [activeCard, setActiveCard] = useState<"create" | "table" | null>(null);
  const [openPanel, setOpenPanel] = useState<"create" | "table" | null>(null);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="relative min-h-screen bg-cover bg-center bg-no-repeat px-6 py-8" style={{ backgroundImage: `url(${bg2})` }}>
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl flex-col items-left justify-center">
        <div className="mb-10 flex items-center justify-between gap-6 text-left">
          <div>
            <h1 className="text-6xl text-[#363636] montserrat_extrabold text-left">System<span className="text-[#469FFE]">Admin</span></h1>
            <p className="mt-3 max-w-5xl text-lg text-[#636363] montserrat_medium">
              Administratorska kontrolna tabla za upravljanje korisničkim nalozima i pregled svih registrovanih korisnika u sistemu.
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="shrink-0 px-6 py-3 rounded-md bg-[#469FFE] text-white text-base font-semibold hover:bg-[#2b7bdc] transition-colors"
          >
            Odjava
          </button>
        </div>


        <div className="flex w-full flex-col gap-6 md:flex-row" onMouseLeave={() => setActiveCard(null)}>
          <div
            onMouseEnter={() => setActiveCard("create")}
            onFocus={() => setActiveCard("create")}
            onClick={() => setOpenPanel("create")}
            className={`group w-full min-w-0 rounded-2xl cursor-pointer bg-linear-to-b from-[#FAFAFA] to-white/1 backdrop-blur-2xl border border-white/40 px-6 py-6 shadow-lg transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              activeCard === "create" ? "md:flex-[2.1_1_0%]" : "md:flex-1"
            }`}
          >
            <div className="relative grid h-full min-h-70 grid-cols-1 items-stretch gap-8 rounded-2xl bg-[#FAFAFA] p-8 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] md:grid-cols-[minmax(0,1fr)_auto]">
              <div className={`flex flex-col justify-between transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${activeCard === "create" ? "opacity-100" : "opacity-85 md:pr-24"}`}>
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-[#469FFE] montserrat_medium">Korisnici</p>
                  <h2 className={`mt-4 text-[#363636] montserrat_bold transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${activeCard === "create" ? "text-4xl" : "text-3xl"}`}>
                    Kreiraj novog korisnika
                  </h2>
                  <p className={`mt-4 max-w-md text-[#636363] montserrat_medium transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${activeCard === "create" ? "text-base" : "text-sm"}`}>
                    Otvara puni obrazac za unos novog naloga i slanje aktivacionog emaila.
                  </p>
                </div>
              </div>

              <div className={`flex h-full min-h-48 items-center justify-center self-stretch rounded-2xl px-5 py-5 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] md:min-h-0 ${activeCard === "create" ? "md:w-64" : "md:absolute md:right-7 md:top-7 md:w-20 md:h-20 md:min-h-0 md:p-0"}`}>
                <img
                  src={userIcon}
                  alt="Korisnici"
                  className={`w-auto object-contain transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${activeCard === "create" ? "h-full max-h-64 opacity-100" : "h-12 w-12 max-h-12 opacity-90"}`}
                />
              </div>
            </div>
          </div>

          <div
            onMouseEnter={() => setActiveCard("table")}
            onFocus={() => setActiveCard("table")}
            onClick={() => setOpenPanel("table")}
            className={`group w-full min-w-0 rounded-2xl bg-linear-to-b cursor-pointer from-[#FAFAFA] to-white/1 backdrop-blur-2xl border border-white/40 px-6 py-6 shadow-lg transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              activeCard === "table" ? "md:flex-[2.1_1_0%]" : "md:flex-1"
            }`}
          >
            <div className="relative grid h-full min-h-70 grid-cols-1 items-stretch gap-8 rounded-2xl bg-[#FAFAFA] p-8 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] md:grid-cols-[minmax(0,1fr)_auto]">
              <div className={`flex flex-col justify-between transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${activeCard === "table" ? "opacity-100" : "opacity-85 md:pr-24"}`}>
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-[#469FFE] montserrat_medium">Tabela</p>
                  <h2 className={`mt-4 text-[#363636] montserrat_bold transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${activeCard === "table" ? "text-4xl" : "text-3xl"}`}>
                    Pregled korisnika
                  </h2>
                  <p className={`mt-4 max-w-md text-[#636363] montserrat_medium transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${activeCard === "table" ? "text-base" : "text-sm"}`}>
                    Pregled, suspenzija i brisanje korisničkih naloga iz sistema.
                  </p>
                </div>
              </div>

              <div className={`flex h-full min-h-48 items-center justify-center self-stretch rounded-2xl px-5 py-5 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] md:min-h-0 ${activeCard === "table" ? "md:w-64" : "md:absolute md:right-7 md:top-7 md:w-20 md:h-20 md:min-h-0 md:p-0"}`}>
                <img
                  src={tableIcon}
                  alt="Tabela"
                  className={`w-auto object-contain transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${activeCard === "table" ? "h-full max-h-64 opacity-100" : "h-12 w-12 max-h-12 opacity-90"}`}
                />
              </div>
            </div>
          </div>

          {openPanel && (
              <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[#363636]/35 px-4 py-8 backdrop-blur-sm sm:py-10">
                <div className={`w-full rounded-2xl border border-white/40 bg-linear-to-b from-[#FAFAFA] to-white/1 p-4 shadow-2xl ${
                  openPanel === "create" ? "max-w-3xl" : "max-w-5xl"
                }`}>
                  <div className="max-h-[calc(100vh-5rem)] overflow-y-auto rounded-2xl border border-gray-200 bg-[#FAFAFA] p-6 md:p-8">
                    <div className="mb-2 flex items-center justify-end">
                      <button
                        type="button"
                        onClick={() => setOpenPanel(null)}
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-[#AFAFAF] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:text-[#469FFE] active:scale-[0.98]"
                        aria-label="Zatvori modal"
                      >
                        <FaTimes />
                      </button>
                    </div>

                    {openPanel === "create" ? <CreateUserPanel /> : <UserManagementPanel />}
                  </div>
                </div>
              </div>
            )}
        </div>
      </div>
    </div>

    
  );
}