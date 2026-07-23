import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { MoodProvider } from '@/context/MoodContext'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { GuestRoute } from '@/components/GuestRoute'
import { BoardPage } from '@/pages/BoardPage'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { StatsPage } from '@/pages/StatsPage'
import { AdminPage } from '@/pages/AdminPage'
import { NotFoundPage } from '@/pages/NotFoundPage'

/**
 * Routing model:
 * - Board is public (browse + filters); pin/compose requires login
 * - Stats + admin require a verified session (admin for moderation)
 * - Login / register are guest-only (KMITL SSO only; no local passwords)
 *
 * LocaleProvider lives in main.tsx so Fast Refresh of App routes
 * does not drop the locale context under BoardPage / auth pages.
 */
function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* MoodProvider only on the board — auth/stats/admin must not prefetch moods. */}
        <Route
          path="/"
          element={
            <MoodProvider>
              <BoardPage />
            </MoodProvider>
          }
        />
        <Route
          path="/login"
          element={
            <GuestRoute>
              <LoginPage />
            </GuestRoute>
          }
        />
        <Route
          path="/register"
          element={
            <GuestRoute>
              <RegisterPage />
            </GuestRoute>
          }
        />
        <Route
          path="/stats"
          element={
            <ProtectedRoute>
              <StatsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute requireAdmin>
              <AdminPage />
            </ProtectedRoute>
          }
        />
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </AuthProvider>
  )
}

export default App
