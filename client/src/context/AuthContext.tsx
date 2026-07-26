import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import * as authApi from '@/api/auth'
import { registerUnauthorizedHandler } from '@/api/client'
import type { User } from '@/types'
import type { RegisterFormValues } from '@/lib/schemas'

/** After this wait, show cold-start copy instead of a generic spinner. */
const API_WAKING_AFTER_MS = 4_000

interface AuthContextValue {
  user: User | null
  isAuthenticated: boolean
  isAdmin: boolean
  isBootstrapping: boolean
  /** True when bootstrap is still running past the cold-start threshold. */
  isApiWaking: boolean
  register: (values: RegisterFormValues) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isBootstrapping, setIsBootstrapping] = useState(true)
  const [isApiWaking, setIsApiWaking] = useState(false)

  useEffect(() => {
    registerUnauthorizedHandler(() => setUser(null))
    let mounted = true
    const wakeTimer = window.setTimeout(() => {
      if (mounted) setIsApiWaking(true)
    }, API_WAKING_AFTER_MS)

    authApi
      .bootstrapSession()
      .then((sessionUser) => {
        if (mounted) setUser(sessionUser)
      })
      .finally(() => {
        if (mounted) {
          setIsBootstrapping(false)
          setIsApiWaking(false)
        }
        window.clearTimeout(wakeTimer)
      })
    return () => {
      mounted = false
      window.clearTimeout(wakeTimer)
      registerUnauthorizedHandler(null)
    }
  }, [])

  const register = useCallback(async (values: RegisterFormValues) => {
    const { user: newUser } = await authApi.register(values)
    setUser(newUser)
  }, [])

  const logout = useCallback(async () => {
    await authApi.logout()
    setUser(null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isAdmin: user?.role === 'admin',
      isBootstrapping,
      isApiWaking,
      register,
      logout,
    }),
    [user, isBootstrapping, isApiWaking, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
