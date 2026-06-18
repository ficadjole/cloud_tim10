import { useEffect, useState } from "react";
import { usersApi } from "../../api_services/users/UsersAPIService";
import type { UserListDto } from "../../models/user/UserTypes";

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

export default function UserManagementPanel() {
  const [users, setUsers] = useState<UserListDto[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const loadUsers = async () => {
    const res = await usersApi.getAll();
    if (res.success && res.data) {
      setUsers(res.data);
    } else {
      setError(res.message ?? "Greška pri učitavanju korisnika");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const selectedUser = users.find((u) => u.id === selectedId) ?? null;

  const handleToggleStatus = async () => {
    if (!selectedUser) return;
    const newStatus = selectedUser.accountStatus === "Suspended" ? "Active" : "Suspended";
    setActionLoading(true);
    const res = await usersApi.updateStatus(selectedUser.id, newStatus);
    setActionLoading(false);
    if (res.success) await loadUsers();
    else setError(res.message ?? "Greška pri promeni statusa");
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    if (!confirm(`Da li sigurno želiš da obrišeš korisnika ${selectedUser.name}?`)) return;
    setActionLoading(true);
    const res = await usersApi.deleteUser(selectedUser.id);
    setActionLoading(false);
    if (res.success) {
      setSelectedId(null);
      await loadUsers();
    } else {
      setError(res.message ?? "Greška pri brisanju korisnika");
    }
  };

  if (loading)
    return (
      <div className="text-sm text-[#636363] montserrat_medium p-6">
        Učitavanje korisnika…
      </div>
    );

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[#469FFE] montserrat_medium">
            Nalozi
          </p>
          <h2 className="mt-1 text-2xl text-[#363636] montserrat_bold">
            Upravljanje korisnicima
          </h2>
          <p className="mt-1 text-sm text-[#636363] montserrat_medium">
            Pregled, suspenzija i brisanje korisničkih naloga
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl montserrat_medium">
          {error}
        </div>
      )}

      <div className="flex gap-5">
        <div className="flex-1 rounded-2xl border border-white/40 bg-white/60 backdrop-blur-sm shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-[#469FFE]/10">
                <th className="px-4 py-3 text-xs uppercase tracking-[0.2em] text-[#469FFE] montserrat_semibold">
                  Ime
                </th>
                <th className="px-4 py-3 text-xs uppercase tracking-[0.2em] text-[#469FFE] montserrat_semibold">
                  Email
                </th>
                <th className="px-4 py-3 text-xs uppercase tracking-[0.2em] text-[#469FFE] montserrat_semibold">
                  Rola
                </th>
                <th className="px-4 py-3 text-xs uppercase tracking-[0.2em] text-[#469FFE] montserrat_semibold">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-8 text-center text-sm text-[#636363] montserrat_medium"
                  >
                    Nema korisnika.
                  </td>
                </tr>
              )}
              {users.map((u) => (
                <tr
                  key={u.id}
                  onClick={() => setSelectedId(u.id)}
                  className={`border-t border-[#469FFE]/5 cursor-pointer transition-all duration-200 ${
                    u.id === selectedId
                      ? "bg-[#469FFE]/8"
                      : "hover:bg-[#469FFE]/4"
                  }`}
                >
                  <td className="px-4 py-3 text-[#363636] montserrat_medium">
                    {u.name}
                  </td>
                  <td className="px-4 py-3 text-[#636363] montserrat_medium">
                    {u.email}
                  </td>
                  <td className="px-4 py-3 text-[#636363] montserrat_medium">
                    {u.role}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-1 rounded-full montserrat_medium ${
                        statusColor[u.accountStatus] ?? "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {statusLabel[u.accountStatus] ?? u.accountStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="w-68 shrink-0 rounded-2xl border border-white/40 bg-white/60 backdrop-blur-sm shadow-sm p-5">
          {!selectedUser ? (
            <div className="h-full flex items-center justify-center">
              <p className="text-sm text-[#636363] montserrat_medium text-center">
                Izaberi korisnika<br />iz tabele.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#469FFE] montserrat_semibold mb-1">
                  Ime i prezime
                </p>
                <p className="text-sm text-[#363636] montserrat_medium">
                  {selectedUser.name}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#469FFE] montserrat_semibold mb-1">
                  Email
                </p>
                <p className="text-sm text-[#636363] montserrat_medium break-all">
                  {selectedUser.email}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#469FFE] montserrat_semibold mb-1">
                  Telefon
                </p>
                <p className="text-sm text-[#636363] montserrat_medium">
                  {selectedUser.phoneNumber || "—"}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#469FFE] montserrat_semibold mb-1">
                  Rola
                </p>
                <p className="text-sm text-[#636363] montserrat_medium">
                  {selectedUser.role}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#469FFE] montserrat_semibold mb-1">
                  Status
                </p>
                <span
                  className={`text-xs px-2 py-1 rounded-full montserrat_medium ${
                    statusColor[selectedUser.accountStatus] ?? "bg-gray-100 text-gray-600"
                  }`}
                >
                  {statusLabel[selectedUser.accountStatus] ?? selectedUser.accountStatus}
                </span>
              </div>

              <div className="border-t border-[#469FFE]/10 my-1" />

              <button
                onClick={handleToggleStatus}
                disabled={
                  actionLoading ||
                  selectedUser.accountStatus === "WaitingForConfirmation"
                }
                className="text-sm montserrat_semibold text-white bg-amber-500 hover:bg-amber-600 px-4 py-2.5 rounded-xl transition-all duration-300 disabled:opacity-40 cursor-pointer"
              >
                {selectedUser.accountStatus === "Suspended"
                  ? "Aktiviraj nalog"
                  : "Suspenduj nalog"}
              </button>

              <button
                onClick={handleDelete}
                disabled={actionLoading}
                className="text-sm montserrat_semibold text-white bg-red-500 hover:bg-red-600 px-4 py-2.5 rounded-xl transition-all duration-300 disabled:opacity-40 cursor-pointer"
              >
                Obriši korisnika
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}