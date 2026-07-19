import { forwardRef, useState, type InputHTMLAttributes } from 'react'
import { useLocale } from '@/context/LocaleContext'

type PasswordInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  id: string
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  function PasswordInput({ className = 'auth-input', id, ...props }, ref) {
    const { t } = useLocale()
    const [visible, setVisible] = useState(false)

    return (
      <div className="relative">
        <input
          {...props}
          ref={ref}
          id={id}
          type={visible ? 'text' : 'password'}
          className={`${className} pr-12`}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? t('passwordHide') : t('passwordShow')}
          aria-pressed={visible}
          className="absolute inset-y-0 right-0 flex items-center px-3 text-xs font-semibold text-ink-soft/70 transition-colors hover:text-ink"
        >
          {visible ? t('passwordHide') : t('passwordShow')}
        </button>
      </div>
    )
  },
)
