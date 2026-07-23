import { api, API_BASE_URL, setAccessToken } from './client'
import { getErrorMessage, normalizeAuthResponse, normalizeUser } from './normalize'
import type { AuthResponse, User } from '@/types'
import type { RegisterFormValues } from '@/lib/schemas'

async function applyAuth(raw: unknown): Promise<AuthResponse> {
  const auth = normalizeAuthResponse(raw)
  setAccessToken(auth.accessToken || null)
  return auth
}

export async function register(values: RegisterFormValues): Promise<AuthResponse> {
  try {
    const { data } = await api.post('/auth/register', {
      studentId: values.studentId,
      email: values.email,
      faculty: values.faculty,
      major: values.major,
      year: values.year,
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

export type SsoPrefill = {
  studentId: string
  email: string
  year: number | null
}

/** Reads SSO-attested identity from the httpOnly ticket cookie (display only). */
export async function fetchSsoPrefill(): Promise<SsoPrefill | null> {
  try {
    const { data } = await api.get('/auth/sso-prefill')
    const payload = data?.data ?? data
    if (
      typeof payload?.studentId === 'string' &&
      typeof payload?.email === 'string'
    ) {
      const year =
        typeof payload.year === 'number' && Number.isInteger(payload.year)
          ? payload.year
          : null
      return { studentId: payload.studentId, email: payload.email, year }
    }
    return null
  } catch {
    return null
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

export async function logout(): Promise<void> {
  try {
    await api.post('/auth/logout')
  } catch {
    // ignore network errors on logout
  } finally {
    setAccessToken(null)
  }
  // KMITL SSO sets CSP frame-ancestors 'self', so a hidden iframe end_session
  // is blocked. Local session is cleared above; the next KMITL login uses
  // prompt=login so a leftover IdP cookie cannot silently re-auth.
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

/** Restore session from httpOnly refresh cookie; returns user or null. */
export async function bootstrapSession(): Promise<User | null> {
  const refreshed = await refresh()
  if (!refreshed?.accessToken) return null
  if (refreshed.user?.id) return refreshed.user
  return fetchCurrentUser()
}
