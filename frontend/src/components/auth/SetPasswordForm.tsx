import React, { useState } from "react";
import client from "../../api_services/axios/axiosClient";
import axios from "axios";

type Props = {
  token: string;
  onSuccess?: () => void;
};

export default function SetPasswordForm({ token, onSuccess }: Props) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const inputClass =
    "w-full h-[45px] rounded-xl border border-[#469FFE] bg-white px-4 py-3 text-sm text-gray-800 shadow-[0_0_0_1.5px_#469FFE22] outline-none transition-all duration-200 placeholder:text-gray-400 hover:shadow-[0_0_0_2px_#469FFE55] focus:shadow-[0_0_0_2px_#469FFE] focus:scale-[0.98]";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Lozinke se ne poklapaju.");
      return;
    }
    if (password.length < 6) {
      setError("Lozinka mora imati najmanje 6 karaktera.");
      return;
    }

    setLoading(true);
    try {
      await client.post(
        `/User/set-password?token=${encodeURIComponent(token)}`,
        {
          password,
          confirmPassword: confirm,
        },
      );
      onSuccess?.();
    } catch (e) {
      setError(
        axios.isAxiosError(e)
          ? ((e.response?.data as { message?: string })?.message ??
              "Greška pri postavljanju lozinke.")
          : "Greška pri postavljanju lozinke.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm rounded-2xl bg-linear-to-b from-[#FAFAFA] to-white/1 backdrop-blur-2xl border border-white/40 px-4 py-4 shadow-lg">
      <div className="bg-[#FAFAFA] rounded-2xl p-6">
        <div className="text-center mb-10">
          <div className="w-12 h-12 rounded-2xl bg-white/8 border border-white/12 flex items-center justify-center mx-auto mb-4">
            <span className="text-white/60 text-lg">◈</span>
          </div>
          <h1 className="text-[#469FFE] montserrat_bold text-3xl">
            Postavi lozinku
          </h1>
          <p className="text-md text-[#363636] mt-1 montserrat_medium">
            Unesite novu lozinku za vaš nalog
          </p>
        </div>

        {error && (
          <div className="mb-5 bg-red-500/10 border border-red-500/20 text-red-300 text-sm px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs text-[#469FFE] mb-2 font-medium montserrat_semibold">
              Nova lozinka
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={inputClass}
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-xs text-[#469FFE] mb-2 font-medium montserrat_semibold">
              Potvrdi lozinku
            </label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              className={inputClass}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 px-8 z-30 montserrat_semibold py-2.5 bg-[#469FFE] hover:bg-[#2b7bdc] rounded-md text-white relative after:content-[''] after:-z-20 after:absolute after:h-1 after:w-1 after:bg-[#2b7bdc] after:left-5 overflow-hidden after:bottom-0 after:translate-y-full after:rounded-md hover:after:scale-[300] hover:after:transition-all hover:after:duration-700 after:transition-all after:duration-700 transition-all duration-700 [text-shadow:3px_5px_2px_#1f5fb0] hover:[text-shadow:2px_2px_2px_#b5e0ff] text-lg disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Čuvanje..." : "Postavi lozinku"}
          </button>
        </form>
      </div>
    </div>
  );
}
