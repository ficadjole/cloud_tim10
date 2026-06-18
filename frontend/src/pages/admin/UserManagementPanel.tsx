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

  if (loading) return <div className="text-sm text-gray-400 p-6">Učitavanje korisnika…</div>;

  return (
    <div className="w-full font-sans">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-medium text-gray-900">Upravljanje korisnicima</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Pregled, suspenzija i brisanje korisničkih naloga
          </p>
        </div>
        <span className="text-2xl text-gray-400">👤</span>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-lg px-3 py-2.5 mb-4 text-xs text-red-600">
          {error}
        </div>
      )}

      <div className="flex gap-5">
        <div className="flex-1 bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-xs text-gray-500 uppercase tracking-wide">
                <th className="px-4 py-3 font-medium">Ime</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Rola</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-gray-400">
                    Nema korisnika.
                  </td>
                </tr>
              )}
              {users.map((u) => (
                <tr
                  key={u.id}
                  onClick={() => setSelectedId(u.id)}
                  className={`border-t border-gray-100 cursor-pointer transition-colors ${
                    u.id === selectedId ? "bg-blue-50" : "hover:bg-gray-50"
                  }`}
                >
                  <td className="px-4 py-3 text-gray-800">{u.name}</td>
                  <td className="px-4 py-3 text-gray-600">{u.email}</td>
                  <td className="px-4 py-3 text-gray-600">{u.role}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${statusColor[u.accountStatus] ?? "bg-gray-100 text-gray-600"}`}>
                      {statusLabel[u.accountStatus] ?? u.accountStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="w-72 shrink-0 bg-white border border-gray-200 rounded-xl p-5">
          {!selectedUser ? (
            <p className="text-sm text-gray-400">Izaberi korisnika iz tabele.</p>
          ) : (
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Ime i prezime</p>
                <p className="text-sm text-gray-800 font-medium">{selectedUser.name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Email</p>
                <p className="text-sm text-gray-800">{selectedUser.email}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Telefon</p>
                <p className="text-sm text-gray-800">{selectedUser.phoneNumber || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Rola</p>
                <p className="text-sm text-gray-800">{selectedUser.role}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Status</p>
                <span className={`text-xs px-2 py-1 rounded-full ${statusColor[selectedUser.accountStatus] ?? "bg-gray-100 text-gray-600"}`}>
                  {statusLabel[selectedUser.accountStatus] ?? selectedUser.accountStatus}
                </span>
              </div>

              <hr className="border-gray-100 my-1" />

              <button
                onClick={handleToggleStatus}
                disabled={actionLoading || selectedUser.accountStatus === "WaitingForConfirmation"}
                className="text-sm font-medium text-white bg-amber-500 hover:bg-amber-600 px-4 py-2 rounded-lg transition-all disabled:opacity-50"
              >
                {selectedUser.accountStatus === "Suspended" ? "Aktiviraj nalog" : "Suspenduj nalog"}
              </button>

              <button
                onClick={handleDelete}
                disabled={actionLoading}
                className="text-sm font-medium text-white bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition-all disabled:opacity-50"
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