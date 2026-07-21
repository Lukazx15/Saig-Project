import { useLocale } from '@/context/LocaleContext'
import type { Locale } from '@/i18n'

interface LanguageSwitchProps {
  /** nav = navbar chrome · board = pinned scrap on cork (auth) */
  variant?: 'nav' | 'board'
}

export function LanguageSwitch({ variant = 'nav' }: LanguageSwitchProps) {
  const { locale, setLocale, t } = useLocale()
  const options: Locale[] = ['th', 'en']
  const onBoard = variant === 'board'

  return (
    <div
      className={
        onBoard
          ? 'inline-flex items-center rounded-sm border border-ink/15 bg-paper p-0.5 shadow-sm'
          : 'inline-flex items-center rounded-sm border border-white/10 bg-night-900 p-0.5'
      }
      role="group"
      aria-label={t('langSwitch')}
    >
      {options.map((code) => {
        const isActive = locale === code
        return (
          <button
            key={code}
            type="button"
            onClick={() => setLocale(code)}
            aria-pressed={isActive}
            className={[
              'min-w-[1.75rem] rounded-sm px-2 py-1 text-[11px] font-semibold tracking-wide transition-colors duration-150 sm:min-w-[2rem] sm:px-2.5',
              isActive
                ? onBoard
                  ? 'bg-cork-800 text-paper'
                  : 'bg-brass-500 text-ink'
                : onBoard
                  ? 'text-ink-soft/70 hover:text-ink'
                  : 'text-paper/45 hover:text-paper/80',
            ].join(' ')}
          >
            {code === 'th' ? t('langTh') : t('langEn')}
          </button>
        )
      })}
    </div>
  )
}
