import { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/auth/useAuthHook";
import userIcon from "../../public/user.png";
import tableIcon from "../../public/Table.png";

export default function AdminDashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [activeCard, setActiveCard] = useState<"create" | "table">("create");

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="relative min-h-screen bg-linear-to-b from-white via-[#FAFAFA] to-[#87BFFC] px-4 py-6 backdrop-blur-md">
      <div className="absolute right-4 top-4">
        <button
          type="button"
          onClick={handleLogout}
          className="px-4 py-2 rounded-md bg-[#469FFE] text-white text-sm font-semibold hover:bg-[#2b7bdc] transition-colors"
        >
          Odjava
        </button>
      </div>

      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-6xl items-center justify-center">
        <div className="flex w-full flex-col gap-4 md:flex-row" onMouseLeave={() => setActiveCard("create")}>
          <Link
            to="/admindashboard/create-user"
            onMouseEnter={() => setActiveCard("create")}
            onFocus={() => setActiveCard("create")}
            className={`group w-full min-w-0 rounded-2xl bg-linear-to-b from-[#FAFAFA] to-white/1 backdrop-blur-2xl border border-white/40 px-4 py-4 shadow-lg transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              activeCard === "create" ? "md:flex-[2.1_1_0%]" : "md:flex-[1_1_0%]"
            }`}
          >
            <div className="relative grid h-full min-h-55 grid-cols-1 items-stretch gap-6 rounded-2xl bg-[#FAFAFA] p-6 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] md:grid-cols-[minmax(0,1fr)_auto]">
              <div className={`flex flex-col justify-between transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${activeCard === "create" ? "opacity-100" : "opacity-85 md:pr-20"}`}>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-[#469FFE] montserrat_medium">Korisnici</p>
                  <h2 className={`mt-3 text-[#363636] montserrat_bold transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${activeCard === "create" ? "text-3xl" : "text-2xl"}`}>
                    Kreiraj novog korisnika
                  </h2>
                  <p className={`mt-3 max-w-md text-[#636363] montserrat_medium transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${activeCard === "create" ? "text-sm" : "text-xs"}`}>
                    Otvara puni obrazac za unos novog naloga i slanje aktivacionog emaila.
                  </p>
                </div>
              </div>

              <div className={`flex h-full min-h-40 items-center justify-center self-stretch rounded-2xl px-4 py-4 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] md:min-h-0 ${activeCard === "create" ? "md:w-56" : "md:absolute md:right-6 md:top-6 md:w-16 md:h-16 md:min-h-0 md:p-0"}`}>
                <img
                  src={userIcon}
                  alt="Korisnici"
                  className={`w-auto object-contain transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${activeCard === "create" ? "h-full max-h-56 opacity-100" : "h-10 w-10 max-h-10 opacity-90"}`}
                />
              </div>
            </div>
          </Link>

          <Link
            to="/admindashboard/users-table"
            onMouseEnter={() => setActiveCard("table")}
            onFocus={() => setActiveCard("table")}
            className={`group w-full min-w-0 rounded-2xl bg-linear-to-b from-[#FAFAFA] to-white/1 backdrop-blur-2xl border border-white/40 px-4 py-4 shadow-lg transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              activeCard === "table" ? "md:flex-[2.1_1_0%]" : "md:flex-[1_1_0%]"
            }`}
          >
            <div className="relative grid h-full min-h-55 grid-cols-1 items-stretch gap-6 rounded-2xl bg-[#FAFAFA] p-6 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] md:grid-cols-[minmax(0,1fr)_auto]">
              <div className={`flex flex-col justify-between transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${activeCard === "table" ? "opacity-100" : "opacity-85 md:pr-20"}`}>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-[#469FFE] montserrat_medium">Tabela</p>
                  <h2 className={`mt-3 text-[#363636] montserrat_bold transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${activeCard === "table" ? "text-3xl" : "text-2xl"}`}>
                    Pregled korisnika
                  </h2>
                  <p className={`mt-3 max-w-md text-[#636363] montserrat_medium transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${activeCard === "table" ? "text-sm" : "text-xs"}`}>
                    Pregled, suspenzija i brisanje korisničkih naloga iz sistema.
                  </p>
                </div>
              </div>

              <div className={`flex h-full min-h-40 items-center justify-center self-stretch rounded-2xl px-4 py-4 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] md:min-h-0 ${activeCard === "table" ? "md:w-56" : "md:absolute md:right-6 md:top-6 md:w-16 md:h-16 md:min-h-0 md:p-0"}`}>
                <img
                  src={tableIcon}
                  alt="Tabela"
                  className={`w-auto object-contain transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${activeCard === "table" ? "h-full max-h-56 opacity-100" : "h-10 w-10 max-h-10 opacity-90"}`}
                />
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}