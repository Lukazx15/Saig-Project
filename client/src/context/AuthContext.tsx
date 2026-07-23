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

interface AuthContextValue {
  user: User | null
  isAuthenticated: boolean
  isAdmin: boolean
  isBootstrapping: boolean
  register: (values: RegisterFormValues) => Promise<void>
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
      register,
      logout,
    }),
    [user, isBootstrapping, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
