import { api, API_BASE_URL, setAccessToken } from './client'
import { getErrorMessage, normalizeAuthResponse, normalizeUser } from './normalize'
import type { AuthResponse, User } from '@/types'
import type {
  ForgotPasswordFormValues,
  LoginFormValues,
  RegisterFormValues,
  ResetPasswordFormValues,
  CompleteProfileFormValues,
} from '@/lib/schemas'

async function applyAuth(raw: unknown): Promise<AuthResponse> {
  const auth = normalizeAuthResponse(raw)
  setAccessToken(auth.accessToken || null)
  return auth
}

export async function register(
  values: Omit<RegisterFormValues, 'confirmPassword'>,
  ssoTicket?: string,
): Promise<AuthResponse> {
  try {
    const { data } = await api.post('/auth/register', {
      studentId: values.studentId,
      email: values.email,
      faculty: values.faculty,
      major: values.major,
      year: values.year,
      password: values.password,
      ...(ssoTicket ? { ssoTicket } : {}),
    })
    return applyAuth(data)
  } catch (err) {
    throw new Error(getErrorMessage(err, 'Registration failed'))
  }
}

/** Full-page redirect to the backend's KMITL SSO entry point. */
export function loginWithKmitl() {
  window.location.href = `${API_BASE_URL}/api/auth/kmitl`
}

/** Reads studentId/email out of an SSO register ticket (display only — the server re-verifies). */
export function decodeSsoTicket(ticket: string): { studentId: string; email: string } | null {
  try {
    const payload = JSON.parse(atob(ticket.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
    if (typeof payload.studentId === 'string' && typeof payload.email === 'string') {
      return { studentId: payload.studentId, email: payload.email }
    }
    return null
  } catch {
    return null
  }
}

export async function login(values: LoginFormValues): Promise<AuthResponse> {
  try {
    const { data } = await api.post('/auth/login', {
      studentId: values.studentId,
      password: values.password,
    })
    return applyAuth(data)
  } catch (err) {
    throw new Error(getErrorMessage(err, 'Login failed'))
  }
}

export async function forgotPassword(
  values: ForgotPasswordFormValues,
): Promise<string> {
  try {
    const { data } = await api.post('/auth/forgot-password', {
      studentId: values.studentId,
      email: values.email,
    })
    const token = data?.data?.resetToken ?? data?.resetToken
    if (!token || typeof token !== 'string') {
      throw new Error('Could not start password reset')
    }
    return token
  } catch (err) {
    throw new Error(getErrorMessage(err, 'Could not verify your account'))
  }
}

export async function resetPassword(
  resetToken: string,
  values: ResetPasswordFormValues,
): Promise<void> {
  try {
    await api.post('/auth/reset-password', {
      resetToken,
      password: values.password,
    })
  } catch (err) {
    throw new Error(getErrorMessage(err, 'Could not reset password'))
  }
}

export async function refresh(): Promise<AuthResponse | null> {
  try {
    const { data } = await api.post('/auth/refresh')
    return applyAuth(data)
  } catch {
    setAccessToken(null)
    return null
  }
}

/** Hit KMITL end_session in a hidden iframe so SSO cookies clear without a visible redirect. */
function clearKmitlSsoSilently(logoutUrl: string): Promise<void> {
  return new Promise((resolve) => {
    const iframe = document.createElement('iframe')
    iframe.setAttribute('aria-hidden', 'true')
    iframe.tabIndex = -1
    iframe.style.cssText =
      'position:absolute;width:0;height:0;border:0;opacity:0;pointer-events:none'
    const done = () => {
      iframe.remove()
      resolve()
    }
    iframe.onload = () => done()
    iframe.onerror = () => done()
    // Cap wait — some IdPs never fire load reliably across origins.
    window.setTimeout(done, 1500)
    iframe.src = logoutUrl
    document.body.appendChild(iframe)
  })
}

export async function logout(): Promise<void> {
  let kmitlLogoutUrl: string | null = null
  try {
    const { data } = await api.post('/auth/logout')
    kmitlLogoutUrl =
      data?.data?.kmitlLogoutUrl ?? data?.kmitlLogoutUrl ?? null
  } catch {
    // ignore network errors on logout
  } finally {
    setAccessToken(null)
  }

  if (kmitlLogoutUrl) {
    try {
      await clearKmitlSsoSilently(kmitlLogoutUrl)
    } catch {
      // App session is already cleared; SSO prompt=login covers leftovers.
    }
  }
}

export async function fetchCurrentUser(): Promise<User | null> {
  const candidates = ['/auth/me', '/users/me', '/auth/profile']
  for (const path of candidates) {
    try {
      const { data } = await api.get(path)
      return normalizeUser(data)
    } catch {
      // try next shape
    }
  }
  return null
}

export async function completeProfile(
  values: CompleteProfileFormValues,
): Promise<User> {
  try {
    const { data } = await api.patch('/auth/profile', {
      faculty: values.faculty,
      major: values.major,
      year: values.year,
    })
    return normalizeUser(data)
  } catch (err) {
    throw new Error(getErrorMessage(err, 'Could not save your faculty and major'))
  }
}

/** Restore session from httpOnly refresh cookie; returns user or null. */
export async function bootstrapSession(): Promise<User | null> {
  const refreshed = await refresh()
  if (!refreshed?.accessToken) return null
  if (refreshed.user?.id) return refreshed.user
  return fetchCurrentUser()
}
