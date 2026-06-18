import React from "react";
import TariffManagementPanel from "./TariffManagementPanel";
import { useAuth } from "../../hooks/auth/useAuthHook";
import DeviceStatusPanel from "../device/DeviceStatusPanel";
import NotificationBell from "../../components/admin/notification/NotificationBell";

const PaymentAdminPage: React.FC = () => {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-linear-to-b from-white via-[#FAFAFA] to-[#87BFFC] px-4 py-10 backdrop-blur-md">
      <div className="mx-auto max-w-6xl">

        <div className="grid gap-4 grid-cols-1 md:grid-cols-3 auto-rows-auto">

          {/* Header — full width */}
          <div className="md:col-span-3 rounded-2xl bg-linear-to-b from-[#FAFAFA] to-white/1 backdrop-blur-2xl border border-white/40 px-4 py-4 shadow-lg">
            <div className="rounded-2xl bg-[#FAFAFA] px-6 py-5 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-[#469FFE] montserrat_medium">
                  Administracija
                </p>
                <h1 className="mt-1 text-3xl text-[#363636] montserrat_bold">
                  Payment Administration
                </h1>
                <p className="mt-1 text-sm text-[#636363] montserrat_medium">
                  Manage tariffs and billing configurations
                </p>
              </div>
              <div className="flex items-center gap-3">
                <NotificationBell />
                <button
                  onClick={logout}
                  className="text-sm px-4 py-2 montserrat_semibold rounded-xl border border-red-400/30 text-red-500 hover:bg-red-500/10 transition-all duration-200"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>

          {/* Tariff panel — left, 1 col */}
          <div className="md:col-span-1 rounded-2xl bg-linear-to-b from-[#FAFAFA] to-white/1 backdrop-blur-2xl border border-white/40 px-4 py-4 shadow-lg">
            <div className="rounded-2xl bg-[#FAFAFA] p-6 h-full">
              <TariffManagementPanel />
            </div>
          </div>

          {/* Device status panel — right, 2 cols */}
          <div className="md:col-span-2 rounded-2xl bg-linear-to-b from-[#FAFAFA] to-white/1 backdrop-blur-2xl border border-white/40 px-4 py-4 shadow-lg">
            <div className="rounded-2xl bg-[#FAFAFA] p-6 h-full">
              <DeviceStatusPanel />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PaymentAdminPage;