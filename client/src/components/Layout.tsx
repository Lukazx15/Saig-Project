import type { ReactNode } from 'react'
import { Navbar } from '@/components/Navbar'
import { LanguageSwitch } from '@/components/LanguageSwitch'

interface LayoutProps {
  children: ReactNode
  /**
   * 'board' — corkboard page content (navbar + open main).
   * 'plain' — dusk gradient pages (stats/admin).
   * 'auth' — full-bleed atmospheric login/register (no app chrome).
   */
  variant?: 'board' | 'plain' | 'auth'
}

export function Layout({ children, variant = 'plain' }: LayoutProps) {
  if (variant === 'auth') {
    return (
      <div className="auth-scene relative flex min-h-screen flex-col overflow-hidden">
        <div className="auth-ambient" aria-hidden="true">
          <span className="auth-drift auth-drift-a" />
          <span className="auth-drift auth-drift-b" />
          <span className="auth-drift auth-drift-c" />
          <span className="auth-drift auth-drift-d" />
          <span className="auth-glow" />
        </div>
        <div className="absolute right-4 top-4 z-20 sm:right-6 sm:top-5">
          <LanguageSwitch variant="auth" />
        </div>
        <main className="relative z-10 flex flex-1 flex-col">{children}</main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-night-950">
      <Navbar />
      <main
        className={
          variant === 'board'
            ? 'flex-1'
            : 'flex-1 bg-gradient-to-b from-night-950 via-night-900 to-night-950'
        }
      >
        {children}
      </main>
    </div>
  )
}
