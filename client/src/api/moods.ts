import { api } from './client'
import {
  getErrorMessage,
  normalizeMood,
  normalizeMoodList,
  normalizeStats,
} from './normalize'
import type { MoodFilters, MoodListResult, MoodNote, MoodStats, MoodType } from '@/types'

function buildParams(filters: Partial<MoodFilters>) {
  const params: Record<string, string | number> = {
    page: filters.page ?? 1,
    limit: filters.limit ?? 12,
  }
  if (filters.moodType) params.moodType = filters.moodType
  if (filters.faculty) params.faculty = filters.faculty
  if (filters.major) params.major = filters.major
  if (filters.dateFrom) params.dateFrom = filters.dateFrom
  if (filters.dateTo) params.dateTo = filters.dateTo
  return params
}

export async function listMoods(
  filters: Partial<MoodFilters>,
): Promise<MoodListResult> {
  try {
    const res = await api.get('/moods', { params: buildParams(filters) })
    return normalizeMoodList(res.data, {
      page: filters.page ?? 1,
      limit: filters.limit ?? 12,
    })
  } catch (err) {
    throw new Error(getErrorMessage(err, 'Could not load the board'))
  }
}

export interface ComposeMoodPayload {
  moodType: MoodType
  message: string
}

export async function createMood(
  payload: ComposeMoodPayload,
): Promise<MoodNote> {
  try {
    const res = await api.post('/moods', {
      moodType: payload.moodType,
      message: payload.message,
    })
    const raw = res.data?.data?.mood ?? res.data?.data ?? res.data
    return normalizeMood(raw)
  } catch (err) {
    throw new Error(getErrorMessage(err, 'Could not pin your mood'))
  }
}

export async function updateMood(
  id: string,
  payload: Partial<ComposeMoodPayload>,
): Promise<MoodNote> {
  try {
    const res = await api.patch(`/moods/${id}`, payload)
    const raw = res.data?.data?.mood ?? res.data?.data ?? res.data
    return normalizeMood(raw)
  } catch (err) {
    throw new Error(getErrorMessage(err, 'Could not update your note'))
  }
}

export async function deleteMood(id: string): Promise<void> {
  try {
    await api.delete(`/moods/${id}`)
  } catch (err) {
    throw new Error(getErrorMessage(err, 'Could not delete this note'))
  }
}

export async function fetchStats(): Promise<MoodStats> {
  try {
    const res = await api.get('/stats')
    return normalizeStats(res.data)
  } catch (err) {
    throw new Error(getErrorMessage(err, 'Could not load campus stats'))
  }
}
