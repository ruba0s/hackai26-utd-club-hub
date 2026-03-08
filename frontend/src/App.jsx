import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import ProtectedRoute from "./components/auth/ProtectedRoute";

import LandingPage from "./pages/LandingPage";
import LoginPage   from "./pages/LoginPage";
import SignupPage  from "./pages/SignupPage";
import Quiz        from "./pages/Quiz";
import Dashboard   from "./pages/Dashboard";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* ── Public ──────────────────────────────────────── */}
          <Route path="/"       element={<LandingPage />} />
          <Route path="/login"  element={<LoginPage   />} />
          <Route path="/signup" element={<SignupPage   />} />

          {/* ── Auth required, quiz NOT yet done ─────────────── */}
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute requireQuiz={false}>
                <Quiz />
              </ProtectedRoute>
            }
          />

          {/* ── Auth required + quiz done ─────────────────────── */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute requireQuiz={true}>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* ── Catch-all → landing ──────────────────────────── */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}