import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { AuthCard } from '@/components/AuthCard'
import { useLocale } from '@/context/LocaleContext'
import { loginWithKmitl } from '@/api/auth'

export function LoginPage() {
  const { t } = useLocale()
  const [searchParams, setSearchParams] = useSearchParams()
  // Capture once so clearing the query does not hide the error banner.
  const [ssoError] = useState(() => searchParams.get('ssoError'))

  useEffect(() => {
    if (!searchParams.has('ssoError')) return
    const next = new URLSearchParams(searchParams)
    next.delete('ssoError')
    setSearchParams(next, { replace: true })
  }, [searchParams, setSearchParams])

  return (
    <Layout variant="auth">
      <AuthCard
        title={t('loginTitle')}
        subtitle={t('loginSubtitle')}
        footer={
          <>
            {t('loginNewHere')}{' '}
            <Link
              to="/register"
              className="font-semibold text-cork-800 underline-offset-2 transition-colors hover:text-cork-700 hover:underline"
            >
              {t('loginCreateAccount')}
            </Link>
          </>
        }
      >
        <div className="space-y-4">
          {ssoError && (
            <p className="rounded-sm border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {t('loginSsoFailed')}: {ssoError}
            </p>
          )}

          <button type="button" onClick={loginWithKmitl} className="auth-btn-primary">
            {t('loginKmitl')}
          </button>
        </div>
      </AuthCard>
    </Layout>
  )
}
