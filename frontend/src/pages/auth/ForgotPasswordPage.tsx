import background from "../../public/bg.png";
import ForgotPasswordForm from "../../components/auth/ForgotPasswordForm.tsx";

export default function ForgotPasswordPage() {
  return (
    <main
      className="min-h-screen flex items-center justify-center px-4 bg-center bg-cover"
      style={{ backgroundImage: `url(${background})` }}
    >
      <ForgotPasswordForm />
    </main>
  );
}