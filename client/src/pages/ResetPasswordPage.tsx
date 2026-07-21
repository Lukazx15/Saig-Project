import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { AuthCard } from '@/components/AuthCard'
import { PasswordInput } from '@/components/PasswordInput'
import { useLocale } from '@/context/LocaleContext'
import { resetPassword } from '@/api/auth'
import { resetPasswordSchema, type ResetPasswordFormValues } from '@/lib/schemas'

export function ResetPasswordPage() {
  const { t } = useLocale()
  const navigate = useNavigate()
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
  })

  async function onSubmit(values: ResetPasswordFormValues) {
    setSubmitError(null)
    try {
      await resetPassword(values)
      setSuccess(true)
      window.setTimeout(() => navigate('/login', { replace: true }), 1600)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : t('resetFailed'))
    }
  }

  return (
    <Layout variant="auth">
      <AuthCard
        title={t('resetTitle')}
        subtitle={t('resetSubtitle')}
        footer={
          <Link
            to="/login"
            className="font-semibold text-cork-800 underline-offset-2 transition-colors hover:text-cork-700 hover:underline"
          >
            {t('resetBackToLogin')}
          </Link>
        }
      >
        {success ? (
          <p className="rounded-sm border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            {t('resetSuccess')}
          </p>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="auth-label" htmlFor="reset-password">
                {t('registerPassword')}
              </label>
              <PasswordInput
                {...register('password')}
                id="reset-password"
                placeholder="••••••••"
                autoComplete="new-password"
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-700">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label className="auth-label" htmlFor="reset-confirm">
                {t('registerConfirm')}
              </label>
              <PasswordInput
                {...register('confirmPassword')}
                id="reset-confirm"
                placeholder="••••••••"
                autoComplete="new-password"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-700">{errors.confirmPassword.message}</p>
              )}
            </div>

            {submitError && (
              <p className="rounded-sm border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {submitError}
              </p>
            )}

            <button type="submit" disabled={isSubmitting} className="auth-btn-primary">
              {isSubmitting ? t('resetSubmitting') : t('resetSubmit')}
            </button>
          </form>
        )}
      </AuthCard>
    </Layout>
  )
}
