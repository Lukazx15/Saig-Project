import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { BrandLoader } from '@/components/BrandLoader'
import { useAuth } from '@/context/AuthContext'
import { useLocale } from '@/context/LocaleContext'

interface GuestRouteProps {
  children: ReactNode
}

/** Guest-only routes: authenticated users are sent to the board. */
export function GuestRoute({ children }: GuestRouteProps) {
  const { isAuthenticated, isBootstrapping, isApiWaking } = useAuth()
  const { t } = useLocale()

  if (isBootstrapping) {
    return (
      <BrandLoader
        message={isApiWaking ? t('wakingSession') : t('checkingSession')}
        detail={isApiWaking ? t('wakingSessionHint') : undefined}
      />
    )
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
