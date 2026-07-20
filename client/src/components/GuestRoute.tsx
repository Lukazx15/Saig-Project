import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useLocale } from '@/context/LocaleContext'

interface GuestRouteProps {
  children: ReactNode
}

/** Guest-only routes: authenticated users are sent to the board (or profile setup). */
export function GuestRoute({ children }: GuestRouteProps) {
  const { isAuthenticated, needsProfileCompletion, isBootstrapping } = useAuth()
  const { t } = useLocale()

  if (isBootstrapping) {
    return (
      <div className="auth-scene flex min-h-screen items-center justify-center px-4">
        <p className="text-sm text-paper/60" style={{ fontFamily: 'var(--font-body)' }}>
          {t('checkingSession')}
        </p>
      </div>
    )
  }

  if (isAuthenticated) {
    return (
      <Navigate to={needsProfileCompletion ? '/complete-profile' : '/'} replace />
    )
  }

  return <>{children}</>
}
