import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { composeMoodSchema, type ComposeMoodFormValues } from '@/lib/schemas'
import { MOOD_META } from '@/lib/moods'
import { MOOD_TYPES } from '@/types'
import type { MoodType } from '@/types'
import { useLocale } from '@/context/LocaleContext'
import { MOOD_LABEL_KEYS } from '@/i18n'

interface ComposeModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (values: ComposeMoodFormValues) => Promise<void>
  initialValues?: Partial<ComposeMoodFormValues>
  title?: string
}

export function ComposeModal({
  isOpen,
  onClose,
  onSubmit,
  initialValues,
  title,
}: ComposeModalProps) {
  const { t } = useLocale()
  const [submitError, setSubmitError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ComposeMoodFormValues>({
    resolver: zodResolver(composeMoodSchema),
    defaultValues: {
      moodType: initialValues?.moodType ?? 'calm',
      message: initialValues?.message ?? '',
    },
  })

  const moodType = watch('moodType')
  const message = watch('message') ?? ''
  const meta = MOOD_META[moodType as MoodType]
  const heading = title ?? t('composeTitle')

  async function submit(values: ComposeMoodFormValues) {
    setSubmitError(null)
    try {
      await onSubmit(values)
      reset({ moodType: 'calm', message: '' })
      onClose()
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : t('composeFailed'))
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.85, y: 30, rotate: -3 }}
            animate={{ opacity: 1, scale: 1, y: 0, rotate: -1 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            className="postit-shadow w-full max-w-sm rounded-sm p-6 transition-colors duration-300"
            style={{ backgroundColor: meta.color }}
          >
            <h2
              className="mb-4 text-2xl text-ink"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {heading}
            </h2>

            <form onSubmit={handleSubmit(submit)} className="space-y-4">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-soft">
                  {t('composeFeeling')}
                </p>
                <div className="flex flex-wrap gap-2">
                  {MOOD_TYPES.map((type) => {
                    const m = MOOD_META[type]
                    const active = type === moodType
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setValue('moodType', type)}
                        className={`flex items-center gap-1 rounded-sm border px-2.5 py-1 text-sm font-medium transition ${
                          active
                            ? 'border-ink bg-ink text-paper'
                            : 'border-ink/20 bg-white/40 text-ink-soft hover:bg-white/70'
                        }`}
                      >
                        <span>{m.emoji}</span>
                        <span>{t(MOOD_LABEL_KEYS[type])}</span>
                      </button>
                    )
                  })}
                </div>
                {errors.moodType && (
                  <p className="mt-1 text-xs text-red-800">{errors.moodType.message}</p>
                )}
              </div>

              <div>
                <textarea
                  {...register('message')}
                  rows={4}
                  maxLength={280}
                  placeholder={t('composePlaceholder')}
                  className="w-full resize-none rounded-sm border border-ink/15 bg-white/50 p-3 text-lg text-ink placeholder:text-ink-soft/50 focus:border-ink/40 focus:outline-none"
                  style={{ fontFamily: 'var(--font-hand)' }}
                />
                <div className="mt-1 flex items-center justify-between text-xs text-ink-soft">
                  <span>{errors.message?.message}</span>
                  <span>{message.length}/280</span>
                </div>
              </div>

              {submitError && (
                <p className="rounded-sm bg-red-900/10 px-2 py-1 text-sm text-red-900">
                  {submitError}
                </p>
              )}

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-sm px-4 py-2 text-sm font-medium text-ink-soft hover:bg-black/5"
                >
                  {t('composeCancel')}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-sm bg-ink px-5 py-2 text-sm font-semibold text-paper transition hover:bg-ink/85 disabled:opacity-60"
                >
                  {isSubmitting ? t('composePinning') : t('composePin')}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
