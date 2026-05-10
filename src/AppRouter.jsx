import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import { AuthLayout } from "./components/auth/AuthLayout.jsx";
import { ProtectedRoute } from "./components/ProtectedRoute.jsx";
import { AuthRedirect } from "./components/AuthRedirect.jsx";
import { SessionModal } from "./components/SessionModal.jsx";
import { AppShell } from "./components/AppShell.jsx";
import { LoginPage } from "./pages/LoginPage.jsx";
import { SignupPage } from "./pages/SignupPage.jsx";
import { ForgotPasswordPage } from "./pages/ForgotPassword.jsx";
import { ResetPasswordPage } from "./pages/ResetPassword.jsx";

const HomePage = lazy(() => import("./App.jsx"));
const ProfilePage = lazy(() => import("./pages/ProfilePage.jsx").then((m) => ({ default: m.ProfilePage })));
const LeaderboardPage = lazy(() =>
  import("./pages/LeaderboardPage.jsx").then((m) => ({ default: m.LeaderboardPage }))
);
const AnalyticsPage = lazy(() =>
  import("./pages/AnalyticsPage.jsx").then((m) => ({ default: m.AnalyticsPage }))
);
const ChallengePage = lazy(() =>
  import("./pages/ChallengePage.jsx").then((m) => ({ default: m.ChallengePage }))
);
const SettingsPage = lazy(() =>
  import("./pages/SettingsPage.jsx").then((m) => ({ default: m.SettingsPage }))
);

function PageFallback() {
  return <div className="py-16 text-center font-mono text-sm text-mist-400">Loading page...</div>;
}

function RouterShell() {
  const { sessionWarningOpen, setSessionWarningOpen, extendSession, logout } = useAuth();
  const location = useLocation();

  return (
    <>
      <Suspense fallback={<PageFallback />}>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <Routes location={location}>
        <Route
          path="/login"
          element={
            <AuthRedirect>
              <AuthLayout>
                <LoginPage />
              </AuthLayout>
            </AuthRedirect>
          }
        />
        <Route
          path="/signup"
          element={
            <AuthRedirect>
              <AuthLayout>
                <SignupPage />
              </AuthLayout>
            </AuthRedirect>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <AuthLayout>
              <ForgotPasswordPage />
            </AuthLayout>
          }
        />
        <Route
          path="/reset-password/:token"
          element={
            <AuthLayout>
              <ResetPasswordPage />
            </AuthLayout>
          }
        />
          <Route
            element={
              <ProtectedRoute>
                <AppShell />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<HomePage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/challenge" element={<ChallengePage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </Suspense>
      <SessionModal
        open={sessionWarningOpen}
        onExtend={async () => {
          await extendSession();
          setSessionWarningOpen(false);
        }}
        onLogout={async () => {
          await logout();
          setSessionWarningOpen(false);
        }}
      />
    </>
  );
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <RouterShell />
      </AuthProvider>
    </BrowserRouter>
  );
}
