import { useEffect, useId, useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { useLocale } from '@/context/LocaleContext'
import { LanguageSwitch } from '@/components/LanguageSwitch'

function SidebarNavLink({
  to,
  end,
  children,
  onNavigate,
}: {
  to: string
  end?: boolean
  children: string
  onNavigate: () => void
}) {
  return (
    <NavLink to={to} end={end} onClick={onNavigate} className="block">
      {({ isActive }) => (
        <span
          className={[
            'flex items-center rounded-sm px-3 py-2.5 text-sm font-medium transition-colors duration-150',
            isActive
              ? 'bg-cork-800 text-paper'
              : 'text-paper/65 hover:bg-white/[0.04] hover:text-paper',
          ].join(' ')}
        >
          {children}
        </span>
      )}
    </NavLink>
  )
}

function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <span className="relative block h-3.5 w-4" aria-hidden="true">
      <span
        className={[
          'absolute left-0 block h-[1.5px] w-full bg-current transition-all duration-200',
          open ? 'top-[6px] rotate-45' : 'top-0',
        ].join(' ')}
      />
      <span
        className={[
          'absolute left-0 top-[6px] block h-[1.5px] w-full bg-current transition-all duration-200',
          open ? 'opacity-0' : 'opacity-100',
        ].join(' ')}
      />
      <span
        className={[
          'absolute left-0 block h-[1.5px] w-full bg-current transition-all duration-200',
          open ? 'top-[6px] -rotate-45' : 'top-[12px]',
        ].join(' ')}
      />
    </span>
  )
}

export function Navbar() {
  const { user, isAuthenticated, isAdmin, isBootstrapping, logout } = useAuth()
  const { t } = useLocale()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuTitleId = useId()

  const displayName = user?.alias || user?.studentId || ''
  const initial = (displayName.trim().charAt(0) || '?').toUpperCase()

  function closeMenu() {
    setMenuOpen(false)
  }

  async function handleLogout() {
    closeMenu()
    await logout()
    navigate('/login', { replace: true })
  }

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!menuOpen) return

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setMenuOpen(false)
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [menuOpen])

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-cork-900/80 bg-night-950">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:h-16 sm:px-6">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-controls="app-sidebar"
              aria-label={menuOpen ? t('navMenuClose') : t('navMenuOpen')}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm border border-white/10 bg-night-900 text-paper/80 transition-colors hover:border-white/20 hover:text-paper"
            >
              <HamburgerIcon open={menuOpen} />
            </button>

            <NavLink to="/" className="min-w-0 shrink transition-opacity hover:opacity-90">
              <span
                className="block truncate text-[1.05rem] font-semibold tracking-tight text-paper sm:text-xl"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {t('brandName')}
              </span>
            </NavLink>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <LanguageSwitch />

            {isBootstrapping ? (
              <span
                className="h-8 w-[4.5rem] rounded-sm bg-white/[0.06] sm:w-[5.5rem]"
                aria-hidden="true"
              />
            ) : isAuthenticated ? (
              <button
                type="button"
                onClick={handleLogout}
                aria-label={t('navSignOut')}
                title={t('navSignOut')}
                className="flex h-8 w-8 items-center justify-center rounded-sm border border-white/15 text-paper/70 transition-colors hover:border-white/25 hover:bg-night-900 hover:text-paper sm:h-auto sm:w-auto sm:px-3 sm:py-1.5 sm:text-sm sm:text-paper/65"
              >
                <span className="hidden sm:inline">{t('navSignOut')}</span>
                <svg
                  className="h-4 w-4 sm:hidden"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </button>
            ) : (
              <div className="flex items-center gap-1 sm:gap-2">
                <NavLink
                  to="/login"
                  className="rounded-sm px-2.5 py-1.5 text-xs font-medium text-paper/70 transition-colors hover:bg-night-900 hover:text-paper sm:px-3 sm:text-sm"
                >
                  {t('navLogIn')}
                </NavLink>
                <NavLink
                  to="/register"
                  className="rounded-sm bg-brass-500 px-3 py-1.5 text-xs font-semibold text-ink transition-colors hover:bg-brass-400 sm:px-3.5 sm:text-sm"
                >
                  {t('navJoin')}
                </NavLink>
              </div>
            )}
          </div>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <div className="fixed inset-0 z-50">
            <motion.button
              type="button"
              aria-label={t('navMenuClose')}
              className="absolute inset-0 bg-night-950/75"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={closeMenu}
            />

            <motion.aside
              id="app-sidebar"
              role="dialog"
              aria-modal="true"
              aria-labelledby={menuTitleId}
              className="absolute inset-y-0 left-0 flex w-[min(18.5rem,88vw)] flex-col border-r border-white/10 bg-night-900"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 380, damping: 36 }}
            >
              <div className="flex items-center justify-between gap-3 border-b border-white/[0.07] px-4 py-4">
                <span
                  id={menuTitleId}
                  className="truncate text-base font-semibold tracking-tight text-paper"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {t('brandName')}
                </span>
                <button
                  type="button"
                  onClick={closeMenu}
                  aria-label={t('navMenuClose')}
                  className="flex h-8 w-8 items-center justify-center rounded-sm border border-white/10 text-paper/70 transition-colors hover:border-white/20 hover:bg-white/[0.05] hover:text-paper"
                >
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    aria-hidden="true"
                  >
                    <path d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </button>
              </div>

              {isAuthenticated && (
                <div className="border-b border-white/[0.07] px-4 py-4">
                  <div className="flex items-center gap-3" title={displayName}>
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-cork-700 text-sm font-bold text-paper">
                      {initial}
                    </span>
                    <span className="min-w-0 truncate text-sm text-paper/80">{displayName}</span>
                  </div>
                </div>
              )}

              <nav className="flex flex-1 flex-col gap-1 p-3" aria-label={t('brandName')}>
                <SidebarNavLink to="/" end onNavigate={closeMenu}>
                  {t('navBoard')}
                </SidebarNavLink>
                {isAuthenticated && (
                  <SidebarNavLink to="/stats" onNavigate={closeMenu}>
                    {t('navCampusVibe')}
                  </SidebarNavLink>
                )}
                {isAdmin && (
                  <SidebarNavLink to="/admin" onNavigate={closeMenu}>
                    {t('navModeration')}
                  </SidebarNavLink>
                )}
              </nav>

              {isAuthenticated && (
                <div className="border-t border-white/[0.07] p-3">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full rounded-sm border border-white/10 px-3 py-2.5 text-left text-sm font-medium text-paper/65 transition-colors hover:border-white/20 hover:bg-white/[0.04] hover:text-paper"
                  >
                    {t('navSignOut')}
                  </button>
                </div>
              )}
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
