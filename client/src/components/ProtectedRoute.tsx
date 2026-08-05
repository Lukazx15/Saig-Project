import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router'
import { BrandLoader } from '@/components/BrandLoader'
import { useAuth } from '@/context/AuthContext'
import { useLocale } from '@/context/LocaleContext'

interface ProtectedRouteProps {
  children: ReactNode
  requireAdmin?: boolean
}

export function ProtectedRoute({ children, requireAdmin }: ProtectedRouteProps) {
  const { isAuthenticated, isAdmin, isBootstrapping, isApiWaking } = useAuth()
  const { t } = useLocale()
  const location = useLocation()

  if (isBootstrapping) {
    return (
      <BrandLoader
        message={isApiWaking ? t('wakingSession') : t('loadingSession')}
        detail={isApiWaking ? t('wakingSessionHint') : undefined}
      />
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
