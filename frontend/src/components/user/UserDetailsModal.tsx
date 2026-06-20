import { FaTimes, FaUser } from "react-icons/fa";
import { useLockBodyScroll } from "../../hooks/ui/useLockBodyScroll";
import type { UserListDto } from "../../models/user/UserTypes";

interface UserDetailsModalProps {
  open: boolean;
  user: UserListDto | null;
  actionLoading: boolean;
  onClose: () => void;
  onToggleStatus: () => void;
  onDelete: () => void;
}

const statusLabel: Record<string, string> = {
  Active: "Aktivan",
  Suspended: "Suspendovan",
  WaitingForConfirmation: "Čeka aktivaciju",
};

const statusColor: Record<string, string> = {
  Active: "bg-green-100 text-green-700",
  Suspended: "bg-red-100 text-red-700",
  WaitingForConfirmation: "bg-yellow-100 text-yellow-700",
};

const detailItemClass =
  "rounded-lg border border-gray-200 bg-white px-3 py-3";

export default function UserDetailsModal({
  open,
  user,
  actionLoading,
  onClose,
  onToggleStatus,
  onDelete,
}: UserDetailsModalProps) {
  useLockBodyScroll(false);

  if (!open || !user) {
    return (
      <div className="sticky top-6 h-fit">
        <div className="rounded-2xl border border-dashed border-[#469FFE]/20 bg-white/60 backdrop-blur-sm p-6 shadow-sm">
          <p className="text-center text-[#636363] montserrat_medium">
            Izaberi korisnika za prikaz detalja
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="sticky top-6 h-fit">
      <div className="rounded-2xl border border-white/40 bg-white/70 backdrop-blur-sm p-4 shadow-sm">
        <div className="rounded-2xl border border-gray-200 bg-[#FAFAFA] p-6">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-100">
                <FaUser className="text-lg text-[#469FFE]" />
              </div>

              <div>
                <p className="text-[11px] font-medium uppercase tracking-widest text-gray-400 montserrat_medium">
                  Detalji korisnika
                </p>

                <h3 className="mt-1 text-2xl text-[#363636] montserrat_bold">
                  {user.name}
                </h3>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-[#AFAFAF] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:text-[#469FFE] active:scale-[0.98]"
              aria-label="Zatvori detalje"
            >
              <FaTimes />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <div className={detailItemClass}>
              <p className="text-[11px] uppercase tracking-widest text-gray-400 montserrat_medium">
                ID korisnika
              </p>

              <p className="mt-1 break-all text-xs text-[#AFAFAF] montserrat_medium">
                {user.id}
              </p>
            </div>

            <div className={detailItemClass}>
              <p className="text-[11px] uppercase tracking-widest text-gray-400 montserrat_medium">
                Ime i prezime
              </p>

              <p className="mt-1 text-sm text-[#363636] montserrat_semibold">
                {user.name}
              </p>
            </div>

            <div className={detailItemClass}>
              <p className="text-[11px] uppercase tracking-widest text-gray-400 montserrat_medium">
                Rola
              </p>

              <p className="mt-1 text-sm text-[#363636] montserrat_semibold">
                {user.role}
              </p>
            </div>

            <div className={detailItemClass}>
              <p className="text-[11px] uppercase tracking-widest text-gray-400 montserrat_medium">
                Email
              </p>

              <p className="mt-1 break-all text-sm text-[#363636] montserrat_semibold">
                {user.email}
              </p>
            </div>

            <div className={detailItemClass}>
              <p className="text-[11px] uppercase tracking-widest text-gray-400 montserrat_medium">
                Telefon
              </p>

              <p className="mt-1 text-sm text-[#363636] montserrat_semibold">
                {user.phoneNumber || "—"}
              </p>
            </div>

            <div className={detailItemClass}>
              <p className="text-[11px] uppercase tracking-widest text-gray-400 montserrat_medium">
                Status
              </p>

              <span
                className={`mt-1 inline-block text-xs px-2 py-1 rounded-full montserrat_medium ${
                  statusColor[user.accountStatus] ??
                  "bg-gray-100 text-gray-600"
                }`}
              >
                {statusLabel[user.accountStatus] ?? user.accountStatus}
              </span>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-2 border-t border-gray-100 pt-4">
            <button
              type="button"
              onClick={onToggleStatus}
              disabled={
                actionLoading ||
                user.accountStatus === "WaitingForConfirmation"
              }
              className="w-full text-sm montserrat_semibold text-white bg-amber-500 hover:bg-amber-600 px-4 py-2.5 rounded-xl transition-all duration-300 disabled:opacity-40"
            >
              {user.accountStatus === "Suspended"
                ? "Aktiviraj nalog"
                : "Suspenduj nalog"}
            </button>

            <button
              type="button"
              onClick={onDelete}
              disabled={actionLoading}
              className="w-full text-sm montserrat_semibold text-white bg-red-500 hover:bg-red-600 px-4 py-2.5 rounded-xl transition-all duration-300 disabled:opacity-40"
            >
              Obriši korisnika
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}