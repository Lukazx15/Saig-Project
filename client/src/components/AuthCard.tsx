import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { PinIcon } from '@/components/PinIcon'
import { useLocale } from '@/context/LocaleContext'

interface AuthCardProps {
  title: string
  subtitle: string
  children: ReactNode
  footer?: ReactNode
}

const easeOut = [0.22, 1, 0.36, 1] as const

/** Brand-first auth shell: dusk room + framed cork board + pinned paper. */
export function AuthCard({ title, subtitle, children, footer }: AuthCardProps) {
  const { t } = useLocale()

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-3 py-10 sm:px-6 sm:py-14">
      <div
        className="auth-cork-field wood-frame absolute inset-3 -z-0 rounded-sm sm:inset-5 md:inset-8"
        aria-hidden="true"
      />

      <div className="relative z-10 flex w-full max-w-md flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: easeOut }}
          className="mb-7 max-w-lg text-center sm:mb-9"
        >
          <h1
            className="text-[2.2rem] leading-[1.05] tracking-tight text-paper drop-shadow-sm sm:text-4xl md:text-[2.75rem]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {t('brandName')}
          </h1>
          <p
            className="mx-auto mt-2.5 max-w-sm text-lg text-paper/80 sm:text-xl"
            style={{ fontFamily: 'var(--font-hand)' }}
          >
            {t('brandTagline')}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -28, rotate: -2.4, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, rotate: -0.6, scale: 1 }}
          transition={{ type: 'spring', stiffness: 190, damping: 20, delay: 0.08 }}
          className="postit-shadow relative w-full rounded-sm bg-paper px-6 py-8 text-ink sm:px-8"
        >
          <motion.div
            initial={{ y: -18, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 320, damping: 16, delay: 0.26 }}
            className="pin-shadow absolute -top-4 left-1/2 -translate-x-1/2"
          >
            <PinIcon className="h-8 w-8" color="#c0392b" />
          </motion.div>

          <h2
            className="mb-1 text-2xl text-ink sm:text-3xl"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {title}
          </h2>
          <p className="mb-6 text-sm leading-relaxed text-ink-soft">{subtitle}</p>

          {children}

          {footer && <div className="mt-6 text-center text-sm text-ink-soft">{footer}</div>}
        </motion.div>
      </div>
    </div>
  )
}
