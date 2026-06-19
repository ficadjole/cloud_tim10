import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./components/protected_route/ProtectedRoute";
import SetPasswordPage from "./pages/auth/SetPasswordPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";

import LoginPage    from "./pages/auth/LoginPage";
import NotFoundPage from "./pages/not_found/NotFoundPage";

import UserDashboard from "./pages/user/UserDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import CreateUserPage from "./pages/admin/CreateUserPage.tsx";
import AdminTablePage from "./pages/admin/AdminTablePage.tsx";
import PaymentAdminPage from "./pages/paymentadmin/PaymentAdminPage";
import PaymentSuccessPage from "./pages/payment/PaymentSuccessPage";
import PaymentFailedPage from "./pages/payment/PaymentFailedPage";


export default function App() {
  return (
    <Routes>
      <Route path="/login"    element={<LoginPage />} />

      {/* User routes */}
      <Route path="/dashboard" element={<ProtectedRoute requiredRole="User"><UserDashboard /></ProtectedRoute>} />
      <Route path="/payment-success" element={<ProtectedRoute requiredRole="User"><PaymentSuccessPage /></ProtectedRoute>} />
      <Route path="/payment-failed" element={<ProtectedRoute requiredRole="User"><PaymentFailedPage /></ProtectedRoute>} />

      {/* Admin routes */}
      <Route path="/admindashboard" element={<ProtectedRoute requiredRole="SysAdmin"><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admindashboard/create-user" element={<ProtectedRoute requiredRole="SysAdmin"><CreateUserPage /></ProtectedRoute>} />
      <Route path="/admindashboard/users-table" element={<ProtectedRoute requiredRole="SysAdmin"><AdminTablePage /></ProtectedRoute>} />
      {/*<Route path="/admindashboard" element={<AdminDashboard />} />*/}

      {/* Payment Admin routes */}
      <Route path="/payment-admin" element={<ProtectedRoute requiredRole="PaymentAdmin"><PaymentAdminPage /></ProtectedRoute>} />

      <Route path="/set-password" element={<SetPasswordPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      <Route path="/"    element={<Navigate to="/login" replace />} />
      <Route path="/404" element={<NotFoundPage />} />
      <Route path="*"    element={<Navigate to="/404" replace />} />
    </Routes>
  );
}
