import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import background from "../../public/bg.png";
import SetPasswordForm from "../../components/auth/SetPasswordForm";
import SetPasswordSuccess from "../../components/auth/SetPasswordSuccess";

export default function SetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token") ?? "";
  console.log("token from URL:", token);

  const [success, setSuccess] = useState(false);

  const handleSuccess = () => {
    setSuccess(true);
    setTimeout(() => navigate("/login"), 3000);
  };

  return (
    <main
      className="min-h-screen flex items-center justify-center px-4 bg-center bg-cover"
      style={{ backgroundImage: `url(${background})` }}
    >
      {success ? (
        <div className="w-full max-w-sm rounded-2xl bg-linear-to-b from-[#FAFAFA] to-white/1 backdrop-blur-2xl border border-white/40 px-4 py-4 shadow-lg">
          <div className="bg-[#FAFAFA] rounded-2xl p-6">
            <div className="text-center mb-8">
              <h1 className="text-[#469FFE] font-bold text-2xl">Postavi lozinku</h1>
              <p className="text-sm text-[#363636] mt-1">Unesite novu lozinku za vaš nalog</p>
            </div>
            <SetPasswordSuccess />
          </div>
        </div>
      ) : (
        <SetPasswordForm token={token} onSuccess={handleSuccess} />
      )}
    </main>
  );
}