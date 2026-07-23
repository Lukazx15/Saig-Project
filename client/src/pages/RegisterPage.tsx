import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { AuthCard } from '@/components/AuthCard'
import { useAuth } from '@/context/AuthContext'
import { useLocale } from '@/context/LocaleContext'
import { fetchSsoPrefill, loginWithKmitl, type SsoPrefill } from '@/api/auth'
import { registerSchema, type RegisterFormValues } from '@/lib/schemas'
import { KMITL_FACULTIES, majorsForFaculty } from '@/lib/moods'

export function RegisterPage() {
  const { register: registerUser } = useAuth()
  const { t } = useLocale()
  const navigate = useNavigate()
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [ssoIdentity, setSsoIdentity] = useState<SsoPrefill | null>(null)
  const [ssoLoading, setSsoLoading] = useState(true)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  })

  useEffect(() => {
    let mounted = true
    fetchSsoPrefill()
      .then((identity) => {
        if (!mounted || !identity) return
        setSsoIdentity(identity)
        reset({
          studentId: identity.studentId,
          email: identity.email,
          ...(identity.year != null ? { year: identity.year } : {}),
        })
      })
      .finally(() => {
        if (mounted) setSsoLoading(false)
      })
    return () => {
      mounted = false
    }
  }, [reset])

  const selectedFaculty = watch('faculty') || ''
  const selectedYear = watch('year')
  const majorChoices = selectedFaculty ? majorsForFaculty(selectedFaculty) : []
  const yearLocked = Boolean(ssoIdentity && ssoIdentity.year != null)

  async function onSubmit(values: RegisterFormValues) {
    setSubmitError(null)
    try {
      await registerUser(values)
      navigate('/', { replace: true })
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : t('registerFailed'))
    }
  }

  if (ssoLoading) {
    return (
      <Layout variant="auth">
        <AuthCard title={t('registerTitle')} subtitle={t('registerLoading')}>
          <p className="text-center text-sm text-ink-soft">{t('registerLoading')}</p>
        </AuthCard>
      </Layout>
    )
  }

  if (!ssoIdentity) {
    return (
      <Layout variant="auth">
        <AuthCard
          title={t('registerTitle')}
          subtitle={t('registerSubtitle')}
          footer={
            <>
              {t('registerAlready')}{' '}
              <Link
                to="/login"
                className="font-semibold text-cork-800 underline-offset-2 transition-colors hover:text-cork-700 hover:underline"
              >
                {t('registerSignIn')}
              </Link>
            </>
          }
        >
          <button type="button" onClick={loginWithKmitl} className="auth-btn-primary">
            {t('registerContinueKmitl')}
          </button>
        </AuthCard>
      </Layout>
    )
  }

  return (
    <Layout variant="auth">
      <AuthCard
        title={t('registerTitle')}
        subtitle={t('registerSubtitleSso')}
        footer={
          <>
            {t('registerAlready')}{' '}
            <Link
              to="/login"
              className="font-semibold text-cork-800 underline-offset-2 transition-colors hover:text-cork-700 hover:underline"
            >
              {t('registerSignIn')}
            </Link>
          </>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <p className="rounded-sm border border-brass-500/35 bg-brass-400/15 px-3 py-2 text-xs text-ink-soft">
            {t('registerSsoBanner')}
          </p>

          <div>
            <label className="auth-label" htmlFor="register-student-id">
              {t('loginStudentId')}
            </label>
            <input
              {...register('studentId')}
              id="register-student-id"
              type="text"
              inputMode="numeric"
              placeholder="65010001"
              readOnly
              autoComplete="username"
              className="auth-input"
            />
            {errors.studentId && (
              <p className="mt-1 text-xs text-red-700">{errors.studentId.message}</p>
            )}
          </div>

          <div>
            <label className="auth-label" htmlFor="register-email">
              {t('registerEmail')}
            </label>
            <input
              {...register('email')}
              id="register-email"
              type="email"
              placeholder="65010001@kmitl.ac.th"
              readOnly
              autoComplete="email"
              className="auth-input"
            />
            {errors.email && <p className="mt-1 text-xs text-red-700">{errors.email.message}</p>}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="auth-label" htmlFor="register-faculty">
                {t('registerFaculty')}
              </label>
              <select
                {...register('faculty', {
                  onChange: () => setValue('major', ''),
                })}
                id="register-faculty"
                defaultValue=""
                className="auth-input"
              >
                <option value="" disabled>
                  {t('registerSelect')}
                </option>
                {KMITL_FACULTIES.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
              {errors.faculty && (
                <p className="mt-1 text-xs text-red-700">{errors.faculty.message}</p>
              )}
            </div>

            <div>
              <label className="auth-label" htmlFor="register-year">
                {t('registerYear')}
              </label>
              {yearLocked ? (
                <>
                  <input type="hidden" {...register('year', { valueAsNumber: true })} />
                  <select
                    id="register-year"
                    disabled
                    value={selectedYear ?? ''}
                    className="auth-input"
                    aria-readonly="true"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((y) => (
                      <option key={y} value={y}>
                        {t('registerYearOption', { n: y })}
                      </option>
                    ))}
                  </select>
                </>
              ) : (
                <select
                  {...register('year', { valueAsNumber: true })}
                  id="register-year"
                  defaultValue=""
                  className="auth-input"
                >
                  <option value="" disabled>
                    {t('registerSelect')}
                  </option>
                  {[1, 2, 3, 4, 5, 6].map((y) => (
                    <option key={y} value={y}>
                      {t('registerYearOption', { n: y })}
                    </option>
                  ))}
                </select>
              )}
              {errors.year && <p className="mt-1 text-xs text-red-700">{errors.year.message}</p>}
            </div>
          </div>

          <div>
            <label className="auth-label" htmlFor="register-major">
              {t('registerMajor')}
            </label>
            <select
              {...register('major')}
              id="register-major"
              defaultValue=""
              disabled={!selectedFaculty}
              className="auth-input"
            >
              <option value="" disabled>
                {selectedFaculty ? t('registerSelectMajor') : t('registerSelectFacultyFirst')}
              </option>
              {majorChoices.map((major) => (
                <option key={major} value={major}>
                  {major}
                </option>
              ))}
            </select>
            {errors.major && <p className="mt-1 text-xs text-red-700">{errors.major.message}</p>}
          </div>

          {submitError && (
            <p className="rounded-sm border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {submitError}
            </p>
          )}

          <button type="submit" disabled={isSubmitting} className="auth-btn-primary">
            {isSubmitting ? t('registerSubmitting') : t('registerSubmit')}
          </button>
        </form>
      </AuthCard>
    </Layout>
  )
}
