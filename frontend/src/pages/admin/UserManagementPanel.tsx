import { useEffect, useState } from "react";
import { usersApi } from "../../api_services/users/UsersAPIService";
import type { UserListDto } from "../../models/user/UserTypes";
import UserDetailsModal from "../../components/user/UserDetailsModal";

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
    <div className="w-full max-w-7xl mx-auto">
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[#469FFE] montserrat_medium">
            Nalozi
          </p>
          <h2 className="mt-1 text-4xl text-[#363636] montserrat_extrabold">
            Upravljanje korisnicima
          </h2>
          <p className="mt-1 text-md text-[#636363] montserrat_medium">
            Pregled, suspenzija i brisanje korisničkih naloga
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl montserrat_medium">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[1fr-250px] gap-8">
  <div className="rounded-2xl border border-white/40 bg-white/60 backdrop-blur-sm shadow-sm overflow-hidden w-full">
    <table className="w-full text-sm table-auto">
      <thead>
        <tr className="text-left border-b border-[#469FFE]/10">
          <th className="px-5 py-4 text-xs uppercase tracking-[0.2em] text-[#469FFE] montserrat_semibold">
            Ime
          </th>
          <th className="px-5 py-4 text-xs uppercase tracking-[0.2em] text-[#469FFE] montserrat_semibold">
            Email
          </th>
          <th className="px-5 py-4 text-xs uppercase tracking-[0.2em] text-[#469FFE] montserrat_semibold">
            Rola
          </th>
          <th className="px-5 py-4 text-xs uppercase tracking-[0.2em] text-[#469FFE] montserrat_semibold">
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
            className={`border-t border-[#469FFE]/5 cursor-pointer transition-all duration-200 hover:bg-[#469FFE]/4 ${
              selectedId === u.id ? "bg-[#469FFE]/10" : ""
            }`}
          >
            <td className="px-5 py-4 text-[#363636] montserrat_medium">
              {u.name}
            </td>
            <td className="px-5 py-4 text-[#636363] montserrat_medium">
              {u.email}
            </td>
            <td className="px-5 py-4 text-[#636363] montserrat_medium">
              {u.role}
            </td>
            <td className="px-5 py-4">
              <span
                className={`text-xs px-2 py-1 rounded-full montserrat_medium ${
                  statusColor[u.accountStatus] ??
                  "bg-gray-100 text-gray-600"
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

  <UserDetailsModal
    open={!!selectedUser}
    user={selectedUser}
    actionLoading={actionLoading}
    onClose={() => setSelectedId(null)}
    onToggleStatus={handleToggleStatus}
    onDelete={handleDelete}
  />
</div>

    </div>
    </div>
  );
}