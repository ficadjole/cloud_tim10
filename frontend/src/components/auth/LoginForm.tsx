import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useAuth } from "../../hooks/auth/useAuthHook";
import type { IAuthAPIService } from "../../api_services/auth/IAuthAPIService";
import { isAuthError } from "../../types/auth/AuthResponse";
import { Link } from "react-router-dom";
import technicianPortrait from "../../public/Technician Portrait 3.png";

const ROLE_CLAIM = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";

export function LoginForm({ authApi }: { authApi: IAuthAPIService }) {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const inputClass =
    "w-full h-[45px] rounded-xl  border-[#469FFE]  bg-white/4 px-4 py-3 text-sm text-[#469FFE] shadow-[0_0_0_1.5px_#469FFE,0_0_25px_-17px_#000] outline-none transition-all duration-200 ease-[cubic-bezier(0.19,1,0.22,1)] placeholder:text-gray-500 hover:shadow-[0_0_0_2.5px_#67afff,0_0_25px_-15px_#000]  focus:scale-[0.98]  active:scale-[0.95] cursor-text";

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await authApi.login(email, password);

    if (isAuthError(res)) {
      setError(res.message ?? "Invalid credentials");
      setLoading(false);
      return;
}



const claims = jwtDecode<{ 
  [ROLE_CLAIM]?: string 
}>(res.token);
const role = claims?.[ROLE_CLAIM] ?? res.user.role;

console.log("Final role:", role);

login(res.token, {
  id: res.user.id,
  name: res.user.name,
  email: res.user.email,
  username: res.user.email,
  role,
});

let target = "/dashboard";

if (role === "SysAdmin") {
  target = "/admindashboard";
} else if (role === "PaymentAdmin") {
  target = "/payment-admin";
}



navigate(target, { replace: true });
  };

  return (
    <div className="w-full max-w-5xl rounded-2xl bg-linear-to-b from-[#FAFAFA] to-white/1 backdrop-blur-2xl border border-white/40 px-4 py-4 shadow-lg">
      <div className="grid overflow-hidden rounded-2xl bg-[#FAFAFA] md:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <div className="p-6 md:p-8">
          <div className="text-center mb-10">
            <h1 className="text-[#469FFE] montserrat_bold text-3xl">Welcome back</h1>
            <p className="text-md text-[#363636] mt-1 montserrat_medium">Sign in to your account</p>
          </div>

          {error && (
            <div className="mb-5 bg-red-500/10 border border-red-500/20 text-red-300 text-sm px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <form onSubmit={submit} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs text-[#469FFE] mb-2 font-medium montserrat_semibold">email</label>
              <input
                type="text"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className={inputClass}
                placeholder="your_email"
              />
            </div>
            <div>
              <label className="block text-xs text-[#469FFE] mb-2 font-medium montserrat_semibold">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className={inputClass}
                placeholder="••••••••"
              />
            </div>

            <div className="text-center text-sm text-[#469FFE] montserrat_semibold">
              <Link to="/forgot-password" className="text-[#469FFE] hover:underline">
                Zaboravili ste lozinku?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 px-8 z-30 montserrat_semibold py-2.5 bg-[#469FFE] hover:bg-[#2b7bdc] rounded-md text-white relative after:content-[''] after:-z-20 after:absolute after:h-1 after:w-1 after:bg-[#2b7bdc] after:left-5 overflow-hidden after:bottom-0 after:translate-y-full after:rounded-md hover:after:scale-[300] hover:after:transition-all hover:after:duration-700 after:transition-all after:duration-700 transition-all duration-700 [text-shadow:3px_5px_2px_#1f5fb0] hover:[text-shadow:2px_2px_2px_#b5e0ff] text-lg disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>

        <div className="relative min-h-80 overflow-hidden md:min-h-full">
          <img
            src={technicianPortrait}
            alt="Technician Portrait"
            className="h-full w-full object-cover object-center"
          />
        </div>
      </div>
    </div>
  );
}
