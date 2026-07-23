import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'

// Production on Vercel proxies /api → Render (see vercel.json), so the
 // browser talks same-origin and httpOnly cookies (refresh / SSO ticket) work.
 // Locally, default to the Express dev server unless VITE_API_URL overrides.
export const API_BASE_URL =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ||
  (import.meta.env.DEV ? 'http://localhost:4000' : '')

/** In-memory access token — never persisted to storage (XSS-safer). */
let accessToken: string | null = null
let onUnauthorized: (() => void) | null = null
let refreshPromise: Promise<string | null> | null = null

export function setAccessToken(token: string | null) {
  accessToken = token
}

/** Registered by AuthContext so the interceptor can force a logout when refresh fails. */
export function registerUnauthorizedHandler(handler: (() => void) | null) {
  onUnauthorized = handler
}

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

interface RetryableConfig extends InternalAxiosRequestConfig {
  _retried?: boolean
}

async function performRefresh(): Promise<string | null> {
  try {
    const res = await axios.post(
      `${API_BASE_URL}/api/auth/refresh`,
      {},
      { withCredentials: true },
    )
    const token =
      res.data?.data?.accessToken ?? res.data?.accessToken ?? res.data?.token ?? null
    setAccessToken(token)
    return token
  } catch {
    setAccessToken(null)
    return null
  }
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetryableConfig | undefined
    const status = error.response?.status
    const url = original?.url ?? ''
    const isAuthRoute =
      url.includes('/auth/register') ||
      url.includes('/auth/refresh') ||
      url.includes('/auth/logout')

    if (status === 401 && original && !original._retried && !isAuthRoute) {
      original._retried = true
      if (!refreshPromise) {
        refreshPromise = performRefresh().finally(() => {
          refreshPromise = null
        })
      }
      const token = await refreshPromise
      if (token) {
        original.headers = original.headers ?? {}
        original.headers.Authorization = `Bearer ${token}`
        return api(original)
      }
      onUnauthorized?.()
    }

    return Promise.reject(error)
  },
)
