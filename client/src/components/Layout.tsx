import type { ReactNode } from 'react'
import { Navbar } from '@/components/Navbar'
import { LanguageSwitch } from '@/components/LanguageSwitch'

interface LayoutProps {
  children: ReactNode
  /**
   * 'board' — corkboard page content (navbar + open main).
   * 'plain' — solid dusk pages (stats/admin).
   * 'auth' — full-bleed login/register (no app chrome).
   */
  variant?: 'board' | 'plain' | 'auth'
}

export function Layout({ children, variant = 'plain' }: LayoutProps) {
  if (variant === 'auth') {
    return (
      <div className="auth-scene relative flex min-h-screen flex-col">
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
      <main className="flex-1">{children}</main>
    </div>
  )
}
