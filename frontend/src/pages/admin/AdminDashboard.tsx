import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/auth/useAuthHook";

export default function AdminDashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex items-start justify-between gap-4">
      <p className="text-white/30 text-sm">Admin dashboard content goes here.</p>
      <button
        type="button"
        onClick={handleLogout}
        className="px-4 py-2 rounded-md bg-[#469FFE] text-white text-sm font-semibold hover:bg-[#2b7bdc] transition-colors"
      >
        Logout
      </button>
    </div>
  );
}
