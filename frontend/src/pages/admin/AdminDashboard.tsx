import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/auth/useAuthHook";
import CreateUserPanel from "../../components/admin/CreateUserPanel";

export default function AdminDashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();

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
          Logout
        </button>
      </div>

      <div className="flex min-h-[calc(100vh-3rem)] items-center justify-center">
        <CreateUserPanel />
      </div>
    </div>
  );
}
