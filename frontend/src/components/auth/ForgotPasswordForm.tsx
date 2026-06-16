import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { usersApi } from "../../api_services/users/UsersAPIService";
import forgotPassIcon from "../../public/ForgotPass.png";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const inputClass =
    "w-full h-[45px] rounded-xl border border-[#469FFE] bg-white px-4 py-3 text-sm text-gray-800 shadow-[0_0_0_1.5px_#469FFE22] outline-none transition-all duration-200 placeholder:text-gray-400 hover:shadow-[0_0_0_2px_#469FFE55] focus:shadow-[0_0_0_2px_#469FFE] focus:scale-[0.98]";

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await usersApi.resetPasswordRequest(email);
    setLoading(false);

    if (!res.success) {
      setError(res.message ?? "Greška pri slanju zahteva.");
      return;
    }

    setSent(true);
  };

  return (
    <div className="w-full max-w-sm rounded-2xl bg-linear-to-b from-[#FAFAFA] to-white/1 backdrop-blur-2xl border border-white/40 px-4 py-4 shadow-lg">
      <div className="bg-[#FAFAFA] rounded-2xl p-6">
        <div className="text-center mb-8">
          <div className="w-22 h-22 rounded-2xl bg-white/8 border border-white/12 flex items-center justify-center mx-auto mb-4">
            <img src={forgotPassIcon} alt="Forgot password" className="h-50 w-50 object-contain" />
          </div>
          <h1 className="text-[#469FFE] montserrat_bold text-2xl">Zaboravljena lozinka</h1>
          <p className="text-sm text-[#363636] mt-1 montserrat_medium">
            Unesite email da bismo poslali link za resetovanje
          </p>
        </div>

        {sent ? (
          <div className="bg-green-50 border border-green-100 rounded-xl px-4 py-4 text-center montserrat_medium">
            <p className="text-green-600 text-sm font-medium montserrat_medium">✓ Email je poslat!</p>
            <p className="text-green-500 text-xs mt-1 montserrat_medium">
              Provjerite vaš inbox i kliknite na link za resetovanje lozinke.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs text-[#469FFE] mb-2 montserrat_semibold">
                Email adresa
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={inputClass}
                placeholder="your_email@example.com"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 px-8 z-30 montserrat_semibold py-2.5 bg-[#469FFE] hover:bg-[#2b7bdc] rounded-md text-white relative after:content-[''] after:-z-20 after:absolute after:h-1 after:w-1 after:bg-[#2b7bdc] after:left-5 overflow-hidden after:bottom-0 after:translate-y-full after:rounded-md hover:after:scale-[300] hover:after:transition-all hover:after:duration-700 after:transition-all after:duration-700 transition-all duration-700 [text-shadow:3px_5px_2px_#1f5fb0] hover:[text-shadow:2px_2px_2px_#b5e0ff] text-md disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Slanje..." : "Pošalji link"}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-[#363636] mt-6">
          <Link to="/login" className="text-[#469FFE] montserrat_semibold hover:underline">
            ← Nazad na prijavu
          </Link>
        </p>
      </div>
    </div>
  );
}