import { useState } from "react";
import {
  FaUserCircle,
  FaInfoCircle,
  FaTimesCircle,
  FaCheckCircle,
  FaBolt,
  FaChartBar,
} from "react-icons/fa";
import { usersApi } from "../../api_services/users/UsersAPIService";
import type { CreateUserDto } from "../../models/user/UserTypes";

type Role = "SysAdmin" | "PaymentAdmin" | "User";

interface CreateUserForm {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  role: Role;
}

export default function CreateUserPanel() {
  const [form, setForm] = useState<CreateUserForm>({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    role: "User",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const set =
    (field: keyof CreateUserForm) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async () => {
    console.log("Sending:", form);
    setError("");
    setSuccess(false);
    setLoading(true);
    const dto: CreateUserDto = { ...form };
    const res = await usersApi.create(dto);
    setLoading(false);
    if (res.message) {
      setError(res.message ?? "Greška pri kreiranju korisnika");
      return;
    }
    setSuccess(true);
    setForm({
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      role: "User",
    });
  };

  const inputClass =
    "w-full h-[38px] rounded-xl border border-[#469FFE]/30 bg-white/60 px-3 text-sm text-[#363636] outline-none transition-all duration-200 placeholder:text-gray-400 hover:border-[#469FFE]/60 focus:border-[#469FFE] focus:ring-2 focus:ring-[#469FFE]/10 montserrat_medium";

  const labelClass = "text-xs text-[#469FFE] montserrat_semibold";

  return (
    <div className="w-full max-w-screen-sm rounded-2xl bg-linear-to-b from-[#FAFAFA] to-white/1 backdrop-blur-2xl border border-white/40 px-4 py-4 shadow-lg">
      <div className="flex items-center justify-between mb-5 bg-[#FAFAFA] rounded-2xl p-6">
        <div>
          <h2 className="text-2xl font-medium mb-1 montserrat_bold text-[#363636]">
            Kreiranje novog korisnika
          </h2>
          <p className="text-sm text-[#AFAFAF] mt-0.5 montserrat_medium">
            Sistem će automatski poslati aktivacioni email
          </p>
        </div>
        <FaUserCircle className="text-4xl text-[#469FFE]" />
      </div>

      <div className="bg-[#FAFAFA] border border-gray-200 rounded-xl p-6">
        <div className="flex items-start gap-2.5 bg-[#87BFFC]/25 border border-blue-100 rounded-lg px-3 py-2.5 mb-5">
          <FaInfoCircle className="mt-0.5 text-base text-blue-400 shrink-0" />
          <p className="text-xs text-blue-500 leading-relaxed montserrat_medium">
            Nakon kreiranja naloga, korisnik će dobiti email sa vremenski
            ograničenim linkom za postavljanje lozinke.
          </p>
        </div>

        {error && (
          <div className="flex items-start gap-2.5 bg-red-50 border border-red-100 rounded-lg px-3 py-2.5 mb-5">
            <FaTimesCircle className="mt-0.5 text-base text-red-400 shrink-0" />
            <p className="text-xs text-red-600 leading-relaxed">{error}</p>
          </div>
        )}

        {success && (
          <div className="flex items-start gap-2.5 bg-green-50 border border-green-100 rounded-lg px-3 py-2.5 mb-5">
            <FaCheckCircle className="mt-0.5 text-base text-green-400 shrink-0" />
            <p className="text-xs text-green-600 leading-relaxed">
              Korisnik je uspešno kreiran. Aktivacioni email je poslat.
            </p>
          </div>
        )}

        <p className="text-[11px] font-medium uppercase tracking-widest text-gray-400 mb-3 montserrat_medium">
          Lični podaci
        </p>
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>Ime</label>
            <input
              type="text"
              value={form.firstName}
              onChange={set("firstName")}
              placeholder="Nikola"
              className={inputClass}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>Prezime</label>
            <input
              type="text"
              value={form.lastName}
              onChange={set("lastName")}
              placeholder="Knežević"
              className={inputClass}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>Email adresa</label>
            <input
              type="email"
              value={form.email}
              onChange={set("email")}
              placeholder="nikola@example.com"
              className={inputClass}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>Kontakt telefon</label>
            <input
              type="tel"
              value={form.phoneNumber}
              onChange={set("phoneNumber")}
              placeholder="+381 6X XXX XXXX"
              className={inputClass}
            />
          </div>
        </div>

        <hr className="border-gray-100 mb-5" />

        <p className="text-[11px] font-medium uppercase tracking-widest text-gray-400 mb-3 montserrat_medium">
          Uloga u sistemu
        </p>
        <div className="grid grid-cols-2 gap-2.5 mb-5">
          <button
            onClick={() => setForm((p) => ({ ...p, role: "User" }))}
            className={`flex items-start gap-3 rounded-lg border p-3 text-left transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98] ${
              form.role === "User"
                ? "border-[#469FFE] bg-blue-50 shadow-md"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${form.role === "User" ? "bg-blue-100" : "bg-gray-100"}`}
            >
              <FaBolt className="text-base text-[#469FFE]" />
            </div>
            <div>
              <p className="text-sm font-medium text-[#363636] montserrat_semibold">
                Potrošač
              </p>
              <p className="text-xs text-[#AFAFAF] mt-0.5 montserrat_medium">
                Pristup sopstvenim objektima i brojalima
              </p>
            </div>
          </button>

          <button
            onClick={() => setForm((p) => ({ ...p, role: "PaymentAdmin" }))}
            className={`flex items-start gap-3 rounded-lg border p-3 text-left transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98] ${
              form.role === "PaymentAdmin"
                ? "border-[#469FFE] bg-blue-50 shadow-md"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${form.role === "PaymentAdmin" ? "bg-blue-100" : "bg-gray-100"}`}
            >
              <FaChartBar className="text-base text-[#469FFE]" />
            </div>
            <div>
              <p className="text-sm font-medium text-[#363636] montserrat_semibold">
                Administrator naplate
              </p>
              <p className="text-xs text-[#AFAFAF] mt-0.5 montserrat_medium">
                Upravljanje tarifama, zonama i izveštajima
              </p>
            </div>
          </button>
        </div>

        <hr className="border-gray-100 mb-5" />

        <div className="flex items-center justify-end gap-2.5">
          <button
            onClick={() =>
              setForm({
                firstName: "",
                lastName: "",
                email: "",
                phoneNumber: "",
                role: "User",
              })
            }
            className="mt-2 px-5 z-30 montserrat_semibold py-2.5 bg-gray-200 hover:bg-gray-300 rounded-md text-[#363636] relative after:content-[''] after:-z-20 after:absolute after:h-1 after:w-1 after:bg-gray-400 after:left-5 overflow-hidden after:bottom-0 after:translate-y-full after:rounded-md hover:after:scale-[300] hover:after:transition-all hover:after:duration-700 after:transition-all after:duration-700 transition-all duration-700 [text-shadow:3px_5px_2px_#b8b8b8] hover:[text-shadow:2px_2px_2px_#f2f2f2] text-md border border-gray-300 disabled:opacity-50 cursor-pointer"
          >
            Odustani
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="mt-2 px-5 z-30 montserrat_semibold py-2.5 bg-[#469FFE] hover:bg-[#2b7bdc] rounded-md text-white relative after:content-[''] after:-z-20 after:absolute after:h-1 after:w-1 after:bg-[#2b7bdc] after:left-5 overflow-hidden after:bottom-0 after:translate-y-full after:rounded-md hover:after:scale-[300] hover:after:transition-all hover:after:duration-700 after:transition-all after:duration-700 transition-all duration-700 [text-shadow:3px_5px_2px_#1f5fb0] hover:[text-shadow:2px_2px_2px_#b5e0ff] text-md disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Slanje..." : "Kreiraj"}
          </button>
        </div>
      </div>
    </div>
  );
}
