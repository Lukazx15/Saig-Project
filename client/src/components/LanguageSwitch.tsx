import { useLocale } from '@/context/LocaleContext'
import type { Locale } from '@/i18n'

interface LanguageSwitchProps {
  variant?: 'nav' | 'auth'
}

export function LanguageSwitch({ variant = 'nav' }: LanguageSwitchProps) {
  const { locale, setLocale, t } = useLocale()
  const options: Locale[] = ['th', 'en']

  return (
    <div
      className={
        variant === 'auth'
          ? 'inline-flex items-center rounded-full border border-white/15 bg-night-950/50 p-0.5 shadow-sm'
          : 'inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] p-0.5'
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
              'min-w-[2rem] rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide transition-all duration-200',
              isActive
                ? 'bg-brass-500 text-ink shadow-sm'
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
