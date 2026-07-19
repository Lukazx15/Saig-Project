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

/** Brand-first auth shell: dusk atmosphere + pinned paper card. */
export function AuthCard({ title, subtitle, children, footer }: AuthCardProps) {
  const { t } = useLocale()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12 sm:py-16">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, ease: easeOut }}
        className="mb-9 max-w-lg text-center sm:mb-11"
      >
        <motion.p
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.05, ease: easeOut }}
          className="mb-4 text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-brass-400"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          {t('brandTag')}
        </motion.p>

        <h1
          className="text-[2.65rem] leading-[1.02] tracking-tight text-paper sm:text-5xl md:text-[3.35rem]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {t('brandName')}
        </h1>
        <p
          className="mx-auto mt-3 max-w-sm text-lg text-paper/70 sm:text-xl"
          style={{ fontFamily: 'var(--font-hand)' }}
        >
          {t('brandTagline')}
        </p>
      </motion.div>

      <div className="relative w-full max-w-md">
        <motion.div
          aria-hidden="true"
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.08, ease: easeOut }}
          className="auth-cork-panel absolute -inset-3 -z-10 rounded-sm sm:-inset-4"
        />

        <motion.div
          initial={{ opacity: 0, y: -32, rotate: -2.8, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, rotate: -0.7, scale: 1 }}
          transition={{ type: 'spring', stiffness: 190, damping: 20, delay: 0.14 }}
          className="postit-shadow relative w-full rounded-sm bg-paper px-6 py-8 text-ink sm:px-8"
        >
          <motion.div
            initial={{ y: -22, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 320, damping: 16, delay: 0.32 }}
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
