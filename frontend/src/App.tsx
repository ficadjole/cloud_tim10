import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./components/protected_route/ProtectedRoute";

import LoginPage    from "./pages/auth/LoginPage";
import NotFoundPage from "./pages/not_found/NotFoundPage";

import UserDashboard from "./pages/user/UserDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";

export default function App() {
  return (
    <Routes>
      <Route path="/login"    element={<LoginPage />} />

      {/* User routes */}
      <Route path="/dashboard" element={<ProtectedRoute requiredRole="User"><UserDashboard /></ProtectedRoute>} />

      {/* Admin routes */}
      {/*<Route path="/admindashboard"       element={<ProtectedRoute requiredRole="SysAdmin"><AdminDashboard /></ProtectedRoute>} />*/}
      <Route path="/admindashboard" element={<AdminDashboard />} />

      <Route path="/"    element={<Navigate to="/login" replace />} />
      <Route path="/404" element={<NotFoundPage />} />
      <Route path="*"    element={<Navigate to="/404" replace />} />
    </Routes>
  );
}
