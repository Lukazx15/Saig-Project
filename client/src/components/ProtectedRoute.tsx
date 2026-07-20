import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useLocale } from '@/context/LocaleContext'

interface ProtectedRouteProps {
  children: ReactNode
  requireAdmin?: boolean
  /** Allow this route even when faculty/major still need confirmation. */
  allowIncompleteProfile?: boolean
}

export function ProtectedRoute({
  children,
  requireAdmin,
  allowIncompleteProfile = false,
}: ProtectedRouteProps) {
  const { isAuthenticated, isAdmin, needsProfileCompletion, isBootstrapping } = useAuth()
  const { t } = useLocale()
  const location = useLocation()

  if (isBootstrapping) {
    return (
      <div className="auth-scene flex min-h-screen items-center justify-center px-4">
        <p className="text-sm text-paper/60" style={{ fontFamily: 'var(--font-body)' }}>
          {t('loadingSession')}
        </p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />
  }

  if (needsProfileCompletion && !allowIncompleteProfile) {
    return <Navigate to="/complete-profile" replace />
  }

  return <>{children}</>
}
