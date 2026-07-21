import { PinIcon } from '@/components/PinIcon'
import { useLocale } from '@/context/LocaleContext'

interface BrandLoaderProps {
  message?: string
  /** Full-viewport dusk + cork pulse (auth/session). Board uses compact. */
  variant?: 'page' | 'board'
}

/** Branded session / board wait — pin + scrap paper, never an empty night void. */
export function BrandLoader({ message, variant = 'page' }: BrandLoaderProps) {
  const { t } = useLocale()
  const label = message ?? t('loadingSession')

  const pulse = (
    <div className="relative flex flex-col items-center gap-4">
      <div className="relative">
        <div
          className="postit-shadow brand-loader-paper rounded-sm bg-paper px-8 py-6 text-ink"
          style={{ transform: 'rotate(-1.5deg)' }}
        >
          <p
            className="text-base leading-snug text-ink-soft sm:text-lg"
            style={{ fontFamily: 'var(--font-hand)' }}
          >
            {label}
          </p>
        </div>
        <div className="pin-shadow brand-loader-pin absolute -top-3 left-1/2 -translate-x-1/2">
          <PinIcon className="h-7 w-7" />
        </div>
      </div>
    </div>
  )

  if (variant === 'board') {
    return <div className="flex justify-center py-16">{pulse}</div>
  }

  return (
    <div className="auth-scene relative flex min-h-screen flex-col items-center justify-center px-4">
      <div className="auth-cork-field pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="relative z-10">{pulse}</div>
    </div>
  )
}
