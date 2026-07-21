import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import * as moodsApi from '@/api/moods'
import { useAuth } from '@/context/AuthContext'
import type { ComposeMoodFormValues } from '@/lib/schemas'
import type { MoodFilters, MoodNote, PaginationMeta } from '@/types'

const DEFAULT_FILTERS: MoodFilters = {
  moodType: '',
  faculty: '',
  major: '',
  dateFrom: '',
  dateTo: '',
  page: 1,
  limit: 12,
}

interface MoodContextValue {
  moods: MoodNote[]
  pagination: PaginationMeta
  filters: MoodFilters
  isLoading: boolean
  error: string | null
  setFilters: (patch: Partial<MoodFilters>) => void
  resetFilters: () => void
  setPage: (page: number) => void
  refresh: () => Promise<void>
  composeMood: (values: ComposeMoodFormValues) => Promise<MoodNote>
  editMood: (id: string, values: ComposeMoodFormValues) => Promise<MoodNote>
  removeMood: (id: string) => Promise<void>
}

const MoodContext = createContext<MoodContextValue | null>(null)

export function MoodProvider({ children }: { children: ReactNode }) {
  const { user, isBootstrapping } = useAuth()
  const [moods, setMoods] = useState<MoodNote[]>([])
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 1,
  })
  const [filters, setFiltersState] = useState<MoodFilters>(DEFAULT_FILTERS)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await moodsApi.listMoods(filters)
      setMoods(result.moods)
      setPagination(result.pagination)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load the board')
    } finally {
      setIsLoading(false)
    }
  }, [filters])

  // Wait for auth bootstrap (SSO redirect sets the refresh cookie, then
  // bootstrapSession installs the access token). Ownership flags
  // (canEdit/canDelete) only come back when the list request has a Bearer
  // token — re-fetch when session user changes after login/logout too.
  useEffect(() => {
    if (isBootstrapping) return
    void refresh()
  }, [filters, isBootstrapping, user?.id, refresh])

  const setFilters = useCallback((patch: Partial<MoodFilters>) => {
    setFiltersState((prev) => ({
      ...prev,
      ...patch,
      page: patch.page ?? 1,
    }))
  }, [])

  const resetFilters = useCallback(() => setFiltersState(DEFAULT_FILTERS), [])

  const setPage = useCallback((page: number) => {
    setFiltersState((prev) => ({ ...prev, page }))
  }, [])

  const composeMood = useCallback(
    async (values: ComposeMoodFormValues) => {
      const created = await moodsApi.createMood(values)
      setMoods((prev) => [created, ...prev])
      setPagination((prev) => ({ ...prev, total: prev.total + 1 }))
      return created
    },
    [],
  )

  const editMood = useCallback(
    async (id: string, values: ComposeMoodFormValues) => {
      const updated = await moodsApi.updateMood(id, values)
      setMoods((prev) => prev.map((m) => (m.id === id ? updated : m)))
      return updated
    },
    [],
  )

  const removeMood = useCallback(
    async (id: string) => {
      const limit = filters.limit
      const currentPage = filters.page
      const hadNextPage = pagination.page < pagination.totalPages
      const wasFullPage = moods.length >= limit

      // Peek the next page before delete so we can pull the note that will
      // slide into this page after the server re-paginates.
      let filler: MoodNote | null = null
      if (wasFullPage && hadNextPage) {
        try {
          const next = await moodsApi.listMoods({
            ...filters,
            page: currentPage + 1,
          })
          filler = next.moods.find((n) => n.id !== id) ?? null
        } catch {
          filler = null
        }
      }

      await moodsApi.deleteMood(id)

      setMoods((prev) => {
        const without = prev.filter((m) => m.id !== id)
        if (
          filler &&
          without.length < limit &&
          !without.some((m) => m.id === filler.id)
        ) {
          return [...without, filler]
        }
        return without
      })

      setPagination((prev) => {
        const total = Math.max(0, prev.total - 1)
        return {
          ...prev,
          total,
          totalPages: Math.max(1, Math.ceil(total / Math.max(limit, 1))),
        }
      })
    },
    [filters, moods.length, pagination.page, pagination.totalPages],
  )

  const value = useMemo<MoodContextValue>(
    () => ({
      moods,
      pagination,
      filters,
      isLoading,
      error,
      setFilters,
      resetFilters,
      setPage,
      refresh,
      composeMood,
      editMood,
      removeMood,
    }),
    [
      moods,
      pagination,
      filters,
      isLoading,
      error,
      setFilters,
      resetFilters,
      setPage,
      refresh,
      composeMood,
      editMood,
      removeMood,
    ],
  )

  return <MoodContext.Provider value={value}>{children}</MoodContext.Provider>
}

export function useMoods() {
  const ctx = useContext(MoodContext)
  if (!ctx) throw new Error('useMoods must be used within MoodProvider')
  return ctx
}
