import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { AuthCard } from '@/components/AuthCard'
import { PasswordInput } from '@/components/PasswordInput'
import { useAuth } from '@/context/AuthContext'
import { useLocale } from '@/context/LocaleContext'
import { loginWithKmitl } from '@/api/auth'
import { loginSchema, type LoginFormValues } from '@/lib/schemas'

export function LoginPage() {
  const { login } = useAuth()
  const { t } = useLocale()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const ssoError = searchParams.get('ssoError')
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) })

  async function onSubmit(values: LoginFormValues) {
    setSubmitError(null)
    try {
      await login(values)
      const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/'
      navigate(from, { replace: true })
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : t('loginFailed'))
    }
  }

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
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="auth-label" htmlFor="login-student-id">
              {t('loginStudentId')}
            </label>
            <input
              {...register('studentId')}
              id="login-student-id"
              type="text"
              inputMode="numeric"
              placeholder="65010001"
              autoComplete="username"
              className="auth-input"
            />
            {errors.studentId && (
              <p className="mt-1 text-xs text-red-700">{errors.studentId.message}</p>
            )}
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between gap-2">
              <label className="auth-label mb-0" htmlFor="login-password">
                {t('loginPassword')}
              </label>
              <Link
                to="/forgot-password"
                className="text-xs font-medium text-cork-800 underline-offset-2 hover:underline"
              >
                {t('loginForgotPassword')}
              </Link>
            </div>
            <PasswordInput
              {...register('password')}
              id="login-password"
              placeholder="••••••••"
              autoComplete="current-password"
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-700">{errors.password.message}</p>
            )}
          </div>

          {(submitError || ssoError) && (
            <p className="rounded-sm border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {submitError ?? `${t('loginSsoFailed')}: ${ssoError}`}
            </p>
          )}

          <button type="submit" disabled={isSubmitting} className="auth-btn-primary">
            {isSubmitting ? t('loginSubmitting') : t('loginSubmit')}
          </button>

          <div className="flex items-center gap-3" aria-hidden="true">
            <span className="h-px flex-1 bg-ink/10" />
            <span className="text-xs uppercase tracking-wide text-ink-soft">{t('loginOr')}</span>
            <span className="h-px flex-1 bg-ink/10" />
          </div>

          <button type="button" onClick={loginWithKmitl} className="auth-btn-secondary">
            {t('loginKmitl')}
          </button>
        </form>
      </AuthCard>
    </Layout>
  )
}
