import type { ReactNode } from "react";
import { FaTimes } from "react-icons/fa";

export default function UserDashboardPanelModal({
  children,
  onClose,
}: {
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[#363636]/35 px-4 py-8 backdrop-blur-sm sm:py-10">
      <div className="w-full max-w-6xl rounded-2xl border border-white/40 bg-linear-to-b from-[#FAFAFA] to-white/1 p-4 shadow-2xl">
        <div className="max-h-[calc(100vh-5rem)] overflow-y-auto rounded-2xl border border-gray-200 bg-[#FAFAFA] p-6 md:p-8">
          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 bg-white text-[#AFAFAF] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:text-[#469FFE] active:scale-[0.98]"
              aria-label="Zatvori modal"
            >
              <FaTimes />
            </button>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
