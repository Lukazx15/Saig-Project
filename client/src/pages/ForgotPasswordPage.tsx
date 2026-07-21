import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { AuthCard } from '@/components/AuthCard'
import { useLocale } from '@/context/LocaleContext'
import { forgotPassword } from '@/api/auth'
import { forgotPasswordSchema, type ForgotPasswordFormValues } from '@/lib/schemas'

export function ForgotPasswordPage() {
  const { t } = useLocale()
  const navigate = useNavigate()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  async function onSubmit(values: ForgotPasswordFormValues) {
    setSubmitError(null)
    try {
      await forgotPassword(values)
      navigate('/reset-password', { replace: true })
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : t('forgotFailed'))
    }
  }

  return (
    <Layout variant="auth">
      <AuthCard
        title={t('forgotTitle')}
        subtitle={t('forgotSubtitle')}
        footer={
          <Link
            to="/login"
            className="font-semibold text-cork-800 underline-offset-2 transition-colors hover:text-cork-700 hover:underline"
          >
            {t('forgotBackToLogin')}
          </Link>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="auth-label" htmlFor="forgot-student-id">
              {t('loginStudentId')}
            </label>
            <input
              {...register('studentId')}
              id="forgot-student-id"
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
            <label className="auth-label" htmlFor="forgot-email">
              {t('registerEmail')}
            </label>
            <input
              {...register('email')}
              id="forgot-email"
              type="email"
              placeholder="65010001@kmitl.ac.th"
              autoComplete="email"
              className="auth-input"
            />
            {errors.email && <p className="mt-1 text-xs text-red-700">{errors.email.message}</p>}
          </div>

          {submitError && (
            <p className="rounded-sm border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {submitError}
            </p>
          )}

          <button type="submit" disabled={isSubmitting} className="auth-btn-primary">
            {isSubmitting ? t('forgotSubmitting') : t('forgotSubmit')}
          </button>
        </form>
      </AuthCard>
    </Layout>
  )
}
