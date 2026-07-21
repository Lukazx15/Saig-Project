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
  const { isAuthenticated, isBootstrapping } = useAuth()
  const { t } = useLocale()

  if (isBootstrapping) {
    return <BrandLoader message={t('checkingSession')} />
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
