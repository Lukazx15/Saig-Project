import { NavLink, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { useLocale } from '@/context/LocaleContext'
import { LanguageSwitch } from '@/components/LanguageSwitch'

function NavItem({ to, end, children }: { to: string; end?: boolean; children: string }) {
  return (
    <NavLink to={to} end={end} className="relative">
      {({ isActive }) => (
        <span
          className={[
            'relative z-10 inline-flex items-center rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors duration-200',
            isActive ? 'text-ink' : 'text-paper/60 hover:text-paper',
          ].join(' ')}
        >
          {isActive && (
            <motion.span
              layoutId="nav-pill"
              className="absolute inset-0 -z-10 rounded-full bg-brass-500 shadow-[0_0_0_1px_rgba(217,165,68,0.35)]"
              transition={{ type: 'spring', stiffness: 420, damping: 34 }}
            />
          )}
          {children}
        </span>
      )}
    </NavLink>
  )
}

export function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth()
  const { t } = useLocale()
  const navigate = useNavigate()

  const displayName = user?.alias || user?.studentId || ''
  const initial = (displayName.trim().charAt(0) || '?').toUpperCase()

  async function handleLogout() {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <header className="sticky top-0 z-40">
      <div className="border-b border-white/[0.07] bg-night-950/75 backdrop-blur-xl supports-[backdrop-filter]:bg-night-950/60">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:h-16 sm:px-6">
          <NavLink
            to="/"
            className="min-w-0 transition-opacity hover:opacity-90"
          >
            <span
              className="block truncate text-[1.05rem] font-semibold tracking-tight text-paper sm:text-xl"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {t('brandName')}
            </span>
          </NavLink>

          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <nav className="hidden items-center rounded-full border border-white/10 bg-white/[0.03] p-1 sm:flex">
              <NavItem to="/" end>
                {t('navBoard')}
              </NavItem>
              {isAuthenticated && <NavItem to="/stats">{t('navCampusVibe')}</NavItem>}
              {isAdmin && <NavItem to="/admin">{t('navModeration')}</NavItem>}
            </nav>

            {/* Mobile links — compact, no pill chrome */}
            <nav className="flex items-center gap-0.5 sm:hidden">
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `rounded-full px-2.5 py-1 text-xs font-medium ${
                    isActive ? 'bg-brass-500 text-ink' : 'text-paper/60'
                  }`
                }
              >
                {t('navBoard')}
              </NavLink>
              {isAuthenticated && (
                <NavLink
                  to="/stats"
                  className={({ isActive }) =>
                    `rounded-full px-2.5 py-1 text-xs font-medium ${
                      isActive ? 'bg-brass-500 text-ink' : 'text-paper/60'
                    }`
                  }
                >
                  {t('navCampusVibe')}
                </NavLink>
              )}
              {isAdmin && (
                <NavLink
                  to="/admin"
                  className={({ isActive }) =>
                    `rounded-full px-2.5 py-1 text-xs font-medium ${
                      isActive ? 'bg-brass-500 text-ink' : 'text-paper/60'
                    }`
                  }
                >
                  {t('navModeration')}
                </NavLink>
              )}
            </nav>

            <LanguageSwitch />

            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <div
                  className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] py-1 pl-1 pr-3 sm:flex"
                  title={displayName}
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-brass-400 to-cork-600 text-xs font-bold text-ink">
                    {initial}
                  </span>
                  <span className="max-w-[7.5rem] truncate text-sm text-paper/70">
                    {displayName}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-full border border-white/10 px-3 py-1.5 text-sm text-paper/65 transition-colors hover:border-white/20 hover:bg-white/[0.05] hover:text-paper"
                >
                  {t('navSignOut')}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <NavLink
                  to="/login"
                  className="rounded-full px-3 py-1.5 text-sm font-medium text-paper/70 transition-colors hover:bg-white/[0.05] hover:text-paper"
                >
                  {t('navLogIn')}
                </NavLink>
                <NavLink
                  to="/register"
                  className="rounded-full bg-brass-500 px-3.5 py-1.5 text-sm font-semibold text-ink shadow-[0_0_20px_-4px_rgba(217,165,68,0.55)] transition-all hover:bg-brass-400 hover:shadow-[0_0_24px_-2px_rgba(217,165,68,0.65)]"
                >
                  {t('navJoin')}
                </NavLink>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
