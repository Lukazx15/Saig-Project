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
import type {
  CompleteProfileFormValues,
  LoginFormValues,
  RegisterFormValues,
} from '@/lib/schemas'

interface AuthContextValue {
  user: User | null
  isAuthenticated: boolean
  isAdmin: boolean
  needsProfileCompletion: boolean
  isBootstrapping: boolean
  login: (values: LoginFormValues) => Promise<User>
  register: (values: RegisterFormValues, ssoTicket?: string) => Promise<User>
  completeProfile: (values: CompleteProfileFormValues) => Promise<void>
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
    return loggedInUser
  }, [])

  const register = useCallback(async (values: RegisterFormValues, ssoTicket?: string) => {
    const { confirmPassword: _confirmPassword, ...rest } = values
    const { user: newUser } = await authApi.register(rest, ssoTicket)
    setUser(newUser)
    return newUser
  }, [])

  const completeProfile = useCallback(async (values: CompleteProfileFormValues) => {
    const updated = await authApi.completeProfile(values)
    setUser(updated)
  }, [])

  const logout = useCallback(async () => {
    await authApi.logout()
    setUser(null)
  }, [])

  const needsProfileCompletion = Boolean(user?.needsProfileCompletion)

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isAdmin: user?.role === 'admin',
      needsProfileCompletion,
      isBootstrapping,
      login,
      register,
      completeProfile,
      logout,
    }),
    [user, needsProfileCompletion, isBootstrapping, login, register, completeProfile, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
