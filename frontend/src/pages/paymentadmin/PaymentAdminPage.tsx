import React from "react";
import TariffManagementPanel from "./TariffManagementPanel";
import { useAuth } from "../../hooks/auth/useAuthHook";
import DeviceStatusPanel from "../device/DeviceStatusPanel";
const PaymentAdminPage: React.FC = () => {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-linear-to-b from-white via-[#FAFAFA] to-[#87BFFC] px-4 py-6 backdrop-blur-md">
      <div className="mx-auto max-w-6xl">

        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#363636] montserrat_bold">
              Payment Administration
            </h1>
            <p className="text-sm text-[#636363] mt-2 montserrat_medium">
              Manage tariffs and billing configurations
            </p>
          </div>

          <button
            onClick={logout}
            className="text-sm px-4 py-2 rounded-lg border border-red-400/30 text-red-500 hover:bg-red-500/10 transition"
          >
            Logout
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-white/40 backdrop-blur-2xl shadow-lg p-6">
          <TariffManagementPanel />
        </div>
        <div className="bg-white rounded-2xl border border-white/40 backdrop-blur-2xl shadow-lg p-6">
          <DeviceStatusPanel />
        </div>
      </div>
    </div>
  );
};

export default PaymentAdminPage;