import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/auth/useAuthHook";
import { FaTimes, FaMoneyBillWave, FaNetworkWired } from "react-icons/fa";
import bg2 from "../../public/bg3.png";
import NotificationBell from "../../components/admin/notification/NotificationBell";
import TariffManagementPanel from "./TariffManagementPanel";
import DeviceStatusPanel from "../device/DeviceStatusPanel";
import meterIcon from "../../public/meter.png";
import tariffIcon from "../../public/tariff.png";

export default function PaymentAdminPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [activeCard, setActiveCard] = useState<"tariff" | "network" | null>(null);
  const [openPanel, setOpenPanel] = useState<"tariff" | "network" | null>(null);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div
      className="relative min-h-screen bg-cover bg-center bg-no-repeat px-6 py-8"
      style={{ backgroundImage: `url(${bg2})` }}
    >
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl flex-col items-left justify-center">
        <div className="mb-10 flex items-center justify-between gap-6 text-left">
          <div>
            <h1 className="text-6xl text-[#363636] montserrat_extrabold text-left">
              Payment<span className="text-[#469FFE]">Admin</span>
            </h1>
            <p className="mt-3 max-w-5xl text-lg text-[#636363] montserrat_medium">
              Administratorska kontrolna tabla za upravljanje tarifama i nadzor stanja mreže.
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <NotificationBell />
            <button
              type="button"
              onClick={handleLogout}
              className="px-6 py-3 rounded-md bg-[#469FFE] text-white text-base font-semibold hover:bg-[#2b7bdc] transition-colors"
            >
              Odjava
            </button>
          </div>
        </div>

        <div className="flex w-full flex-col gap-6 md:flex-row" onMouseLeave={() => setActiveCard(null)}>
          <div
            onMouseEnter={() => setActiveCard("tariff")}
            onFocus={() => setActiveCard("tariff")}
            onClick={() => setOpenPanel("tariff")}
            className={`group w-full min-w-0 rounded-2xl cursor-pointer bg-linear-to-b from-[#FAFAFA] to-white/1 backdrop-blur-2xl border border-white/40 px-6 py-6 shadow-lg transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              activeCard === "tariff" ? "md:flex-[2.1_1_0%]" : "md:flex-1"
            }`}
          >
            <div className="relative grid h-full min-h-70 grid-cols-1 items-stretch gap-8 rounded-2xl bg-[#FAFAFA] p-8 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] md:grid-cols-[minmax(0,1fr)_auto]">
              <div className={`flex flex-col justify-between transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${activeCard === "tariff" ? "opacity-100" : "opacity-85 md:pr-24"}`}>
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-[#469FFE] montserrat_medium">Tarife</p>
                  <h2 className={`mt-4 text-[#363636] montserrat_bold transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${activeCard === "tariff" ? "text-4xl" : "text-3xl"}`}>
                    Upravljanje tarifama
                  </h2>
                  <p className={`mt-4 max-w-md text-[#636363] montserrat_medium transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${activeCard === "tariff" ? "text-base" : "text-sm"}`}>
                    Definišite cene za VT/NT po zonama i fiksne troškove obračuna.
                  </p>
                </div>
              </div>

              <div className={`flex h-full min-h-48 items-center justify-center self-stretch rounded-2xl px-5 py-5 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] md:min-h-0 ${activeCard === "tariff" ? "md:w-64" : "md:absolute md:right-7 md:top-7 md:w-20 md:h-20 md:min-h-0 md:p-0"}`}>
                <img
                  src={tariffIcon}
                  alt="Tarife"
                  className={`w-auto object-contain transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${activeCard === "tariff" ? "h-full max-h-64 opacity-100" : "h-12 w-12 max-h-12 opacity-90"}`}
                />
              </div>
            </div>
          </div>

          <div
            onMouseEnter={() => setActiveCard("network")}
            onFocus={() => setActiveCard("network")}
            onClick={() => setOpenPanel("network")}
            className={`group w-full min-w-0 rounded-2xl cursor-pointer bg-linear-to-b from-[#FAFAFA] to-white/1 backdrop-blur-2xl border border-white/40 px-6 py-6 shadow-lg transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              activeCard === "network" ? "md:flex-[2.1_1_0%]" : "md:flex-1"
            }`}
          >
            <div className="relative grid h-full min-h-70 grid-cols-1 items-stretch gap-8 rounded-2xl bg-[#FAFAFA] p-8 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] md:grid-cols-[minmax(0,1fr)_auto]">
              <div className={`flex flex-col justify-between transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${activeCard === "network" ? "opacity-100" : "opacity-85 md:pr-24"}`}>
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-[#469FFE] montserrat_medium">Mreža</p>
                  <h2 className={`mt-4 text-[#363636] montserrat_bold transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${activeCard === "network" ? "text-4xl" : "text-3xl"}`}>
                    Status brojila
                  </h2>
                  <p className={`mt-4 max-w-md text-[#636363] montserrat_medium transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${activeCard === "network" ? "text-base" : "text-sm"}`}>
                    Praćenje online/offline statusa brojila i evidencija uplata.
                  </p>
                </div>
              </div>

              <div className={`flex h-full min-h-48 items-center justify-center self-stretch rounded-2xl px-5 py-5 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] md:min-h-0 ${activeCard === "network" ? "md:w-64" : "md:absolute md:right-7 md:top-7 md:w-20 md:h-20 md:min-h-0 md:p-0"}`}>
                <img
                  src={meterIcon}
                  alt="Korisnici"
                  className={`w-auto object-contain transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${activeCard === "network" ? "h-full max-h-64 opacity-100" : "h-12 w-12 max-h-12 opacity-90"}`}
                />
              </div>
              </div>
            </div>
          </div>

          {openPanel && (
            <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[#363636]/35 px-4 py-8 backdrop-blur-sm sm:py-10">
              <div className="w-full max-w-5xl rounded-2xl border border-white/40 bg-linear-to-b from-[#FAFAFA] to-white/1 p-4 shadow-2xl">
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

                  {openPanel === "tariff" ? <TariffManagementPanel /> : <DeviceStatusPanel />}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
  );
}