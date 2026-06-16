import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LoginForm } from "../../components/auth/LoginForm";
import { authApi } from "../../api_services/auth/AuthAPIService";
import { useAuth } from "../../hooks/auth/useAuthHook";
import background from "../../public/bg.png";

export default function LoginPage() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

useEffect(() => {
  if (!isAuthenticated || !user) return;
  if (user.role === "SysAdmin") {
  navigate("/admindashboard");
} else if (user.role === "PaymentAdmin") {
  navigate("/payment-admin");
} else {
  navigate("/dashboard");
}
}, [isAuthenticated, user, navigate]);

  return (
    <main
      className="min-h-screen flex items-center justify-center px-4 bg-center bg-cover"
      style={{ backgroundImage: `url(${background})` }}>
      <LoginForm authApi={authApi} />
    </main>
  );
}
