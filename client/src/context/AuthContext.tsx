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
import type { LoginFormValues, RegisterFormValues } from '@/lib/schemas'

interface AuthContextValue {
  user: User | null
  isAuthenticated: boolean
  isAdmin: boolean
  isBootstrapping: boolean
  login: (values: LoginFormValues) => Promise<void>
  register: (values: RegisterFormValues, ssoTicket?: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isBootstrapping, setIsBootstrapping] = useState(true)

  useEffect(() => {
    registerUnauthorizedHandler(() => setUser(null))
    let mounted = true
    authApi
      .bootstrapSession()
      .then((sessionUser) => {
        if (mounted) setUser(sessionUser)
      })
      .finally(() => {
        if (mounted) setIsBootstrapping(false)
      })
    return () => {
      mounted = false
      registerUnauthorizedHandler(null)
    }
  }, [])

  const login = useCallback(async (values: LoginFormValues) => {
    const { user: loggedInUser } = await authApi.login(values)
    setUser(loggedInUser)
  }, [])

  const register = useCallback(async (values: RegisterFormValues, ssoTicket?: string) => {
    const { confirmPassword: _confirmPassword, ...rest } = values
    const { user: newUser } = await authApi.register(rest, ssoTicket)
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
      login,
      register,
      logout,
    }),
    [user, isBootstrapping, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
