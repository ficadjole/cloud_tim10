import { Link } from "react-router-dom";
import CreateUserPanel from "../../components/admin/CreateUserPanel";

export default function CreateUserPage() {
  return (
    <main className="min-h-screen bg-linear-to-b from-white via-[#FAFAFA] to-[#87BFFC] px-4 py-6 backdrop-blur-md">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-6xl items-center justify-center">
        <div className="w-full">
          <div className="mb-4 flex items-center justify-between">
            <h1 className="montserrat_bold text-2xl text-[#363636]">Kreiranje korisnika</h1>
            <Link to="/admindashboard" className="text-sm text-[#469FFE] montserrat_semibold hover:underline">
              Nazad na dashboard
            </Link>
          </div>
          <CreateUserPanel />
        </div>
      </div>
    </main>
  );
}