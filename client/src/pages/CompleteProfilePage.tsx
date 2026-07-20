import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { AuthCard } from '@/components/AuthCard'
import { useAuth } from '@/context/AuthContext'
import { useLocale } from '@/context/LocaleContext'
import { completeProfileSchema, type CompleteProfileFormValues } from '@/lib/schemas'
import { KMITL_FACULTIES, majorsForFaculty } from '@/lib/moods'

export function CompleteProfilePage() {
  const { user, isAuthenticated, isBootstrapping, completeProfile } = useAuth()
  const { t } = useLocale()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const fromSso = searchParams.get('sso') === '1'
  const [submitError, setSubmitError] = useState<string | null>(null)

  const prefFaculty =
    user?.faculty && (KMITL_FACULTIES as readonly string[]).includes(user.faculty)
      ? user.faculty
      : ''
  const prefMajors = prefFaculty ? majorsForFaculty(prefFaculty) : []
  const prefMajor =
    user?.major && prefMajors.includes(user.major) ? user.major : ''

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CompleteProfileFormValues>({
    resolver: zodResolver(completeProfileSchema),
    defaultValues: {
      faculty: prefFaculty,
      major: prefMajor,
      ...(user?.year && user.year >= 1 && user.year <= 8 ? { year: user.year } : {}),
    },
  })

  const selectedFaculty = watch('faculty') || ''
  const majorChoices = selectedFaculty ? majorsForFaculty(selectedFaculty) : []

  // If bootstrap finishes after first paint, hydrate once from the session user.
  useEffect(() => {
    if (!user) return
    const faculty =
      user.faculty && (KMITL_FACULTIES as readonly string[]).includes(user.faculty)
        ? user.faculty
        : ''
    const majors = faculty ? majorsForFaculty(faculty) : []
    const major = user.major && majors.includes(user.major) ? user.major : ''
    if (faculty) setValue('faculty', faculty)
    if (major) setValue('major', major)
    if (user.year >= 1 && user.year <= 8) setValue('year', user.year)
  }, [user, setValue])

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
    return <Navigate to="/login" replace />
  }

  async function onSubmit(values: CompleteProfileFormValues) {
    setSubmitError(null)
    try {
      await completeProfile(values)
      navigate('/', { replace: true })
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : t('completeProfileFailed'))
    }
  }

  return (
    <Layout variant="auth">
      <AuthCard
        title={t('completeProfileTitle')}
        subtitle={fromSso ? t('completeProfileSubtitleSso') : t('completeProfileSubtitle')}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          {fromSso && (
            <p className="rounded-sm border border-brass-500/35 bg-brass-400/15 px-3 py-2 text-xs text-ink-soft">
              {t('completeProfileSsoBanner')}
            </p>
          )}

          <div>
            <label className="auth-label" htmlFor="complete-faculty">
              {t('registerFaculty')}
            </label>
            <select
              {...register('faculty', {
                onChange: () => setValue('major', ''),
              })}
              id="complete-faculty"
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
            <label className="auth-label" htmlFor="complete-major">
              {t('registerMajor')}
            </label>
            <select
              {...register('major')}
              id="complete-major"
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

          <div>
            <label className="auth-label" htmlFor="complete-year">
              {t('registerYear')}
            </label>
            <select
              {...register('year', { valueAsNumber: true })}
              id="complete-year"
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
            {errors.year && <p className="mt-1 text-xs text-red-700">{errors.year.message}</p>}
          </div>

          {submitError && (
            <p className="rounded-sm border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {submitError}
            </p>
          )}

          <button type="submit" disabled={isSubmitting} className="auth-btn-primary">
            {isSubmitting ? t('completeProfileSubmitting') : t('completeProfileSubmit')}
          </button>
        </form>
      </AuthCard>
    </Layout>
  )
}
