import type {
  AuthResponse,
  MoodListResult,
  MoodNote,
  MoodStats,
  MoodType,
  PaginationMeta,
  User,
  UserRole,
} from '@/types'
import { MOOD_TYPES } from '@/types'
import { colorForMood, dominantFromDistribution, isMoodType, MOOD_META } from '@/lib/moods'

function asRecord(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === 'object'
    ? (value as Record<string, unknown>)
    : {}
}

function pickString(...candidates: unknown[]): string {
  for (const c of candidates) {
    if (typeof c === 'string' && c.length > 0) return c
  }
  return ''
}

function pickNumber(...candidates: unknown[]): number | undefined {
  for (const c of candidates) {
    if (typeof c === 'number' && Number.isFinite(c)) return c
    if (typeof c === 'string' && c.trim() !== '' && !Number.isNaN(Number(c))) {
      return Number(c)
    }
  }
  return undefined
}

function pickBool(...candidates: unknown[]): boolean | undefined {
  for (const c of candidates) {
    if (typeof c === 'boolean') return c
  }
  return undefined
}

export function normalizeUser(raw: unknown): User {
  const r = asRecord(raw)
  const data = asRecord(r.data)
  const nested = asRecord(r.user ?? data.user)
  const src = Object.keys(nested).length ? nested : Object.keys(data).length ? data : r

  const roleRaw = pickString(src.role, 'student').toLowerCase()
  const role: UserRole = roleRaw === 'admin' ? 'admin' : 'student'

  return {
    id: pickString(src.id, src._id),
    studentId: pickString(src.studentId, src.student_id),
    email: pickString(src.email),
    faculty: pickString(src.faculty),
    major: pickString(src.major),
    year: pickNumber(src.year) ?? 1,
    role,
    alias: pickString(src.alias) || undefined,
    kmitlVerified: pickBool(src.kmitlVerified),
    needsProfileCompletion: pickBool(
      src.needsProfileCompletion,
      src.needs_profile_completion,
    ),
  }
}

export function normalizeAuthResponse(raw: unknown): AuthResponse {
  const r = asRecord(raw)
  const data = asRecord(r.data)
  const accessToken = pickString(
    r.accessToken,
    r.access_token,
    r.token,
    data.accessToken,
    data.access_token,
    data.token,
  )

  const userSource = r.user ?? data.user ?? data ?? r
  return {
    accessToken,
    user: normalizeUser(userSource),
  }
}

export function normalizeMood(raw: unknown): MoodNote {
  const r = asRecord(raw)
  const moodRaw = pickString(r.moodType, r.mood_type, r.type, r.mood)
  const moodType: MoodType = isMoodType(moodRaw) ? moodRaw : 'calm'
  const author = asRecord(r.author)
  const isOwner = pickBool(r.isOwner, r.is_owner, r.owned)
  const canEdit = pickBool(r.canEdit, r.can_edit)
  const canDelete = pickBool(r.canDelete, r.can_delete)

  return {
    id: pickString(r.id, r._id),
    moodType,
    emoji: pickString(r.emoji, MOOD_META[moodType].emoji) || MOOD_META[moodType].emoji,
    message: pickString(r.message, r.content, r.text, r.body),
    color: colorForMood(moodType, pickString(r.color) || undefined),
    alias: pickString(r.alias, r.anonymousAlias, r.displayName, 'Anonymous Student'),
    faculty: pickString(r.faculty, author.faculty),
    major: pickString(r.major, author.major),
    year: pickNumber(r.year, author.year) ?? 0,
    createdAt: pickString(r.createdAt, r.created_at, r.date) || new Date().toISOString(),
    updatedAt: pickString(r.updatedAt, r.updated_at) || undefined,
    rotation: pickNumber(r.rotation),
    isOwner,
    canEdit,
    canDelete,
  }
}

function normalizePagination(
  raw: unknown,
  listLength: number,
  fallbackPage: number,
  fallbackLimit: number,
): PaginationMeta {
  const r = asRecord(raw)
  const nested = asRecord(r.pagination ?? r.meta ?? r.pageInfo)
  const src = Object.keys(nested).length ? nested : r

  const page = pickNumber(src.page, src.currentPage, r.page) ?? fallbackPage
  const limit = pickNumber(src.limit, src.pageSize, src.perPage, r.limit) ?? fallbackLimit
  const total =
    pickNumber(src.total, src.totalCount, src.count, r.total, r.totalCount) ?? listLength
  const totalPages =
    pickNumber(src.totalPages, src.pages, r.totalPages) ??
    Math.max(1, Math.ceil(total / Math.max(limit, 1)))

  return { page, limit, total, totalPages }
}

export function normalizeMoodList(
  raw: unknown,
  opts: { page: number; limit: number },
): MoodListResult {
  const r = asRecord(raw)
  const dataSrc = r.data ?? r
  const data = asRecord(dataSrc)
  const rawList = Array.isArray(dataSrc)
    ? dataSrc
    : Array.isArray(data.moods)
      ? data.moods
      : Array.isArray(r.moods)
        ? r.moods
        : Array.isArray(data.results)
          ? data.results
          : Array.isArray(data.items)
            ? data.items
            : []

  const moods = rawList.map((item) => normalizeMood(item))
  const pagination = normalizePagination(data, moods.length, opts.page, opts.limit)

  return { moods, pagination }
}

function emptyDistribution(): Record<MoodType, number> {
  return Object.fromEntries(MOOD_TYPES.map((m) => [m, 0])) as Record<MoodType, number>
}

/** A count cell can arrive as a bare number or as `{ count, color }`. */
function pickCount(value: unknown): number | undefined {
  if (typeof value === 'number' || typeof value === 'string') return pickNumber(value)
  const rec = asRecord(value)
  return pickNumber(rec.count, rec.total, rec.value)
}

/**
 * Per-group mood breakdowns arrive either as an array of rows
 * (`[{ faculty, moods/distribution, total }]`) or as a plain map
 * (`{ [faculty]: { [moodType]: count } }`, as returned by the backend's
 * `groupByKey` helper). Normalize both into the array shape the UI expects.
 */
function normalizeGroupedBreakdown(
  raw: unknown,
  groupKey: 'faculty' | 'major',
): Array<{ faculty: string; distribution: Record<MoodType, number>; total: number }> {
  if (Array.isArray(raw)) {
    return raw.map((item) => {
      const row = asRecord(item)
      const dist = emptyDistribution()
      const nested = asRecord(row.moods ?? row.distribution ?? row.counts)
      for (const mood of MOOD_TYPES) {
        dist[mood] = pickCount(nested[mood]) ?? 0
      }
      const total =
        pickNumber(row.total, row.count) ?? Object.values(dist).reduce((a, b) => a + b, 0)
      return {
        faculty: pickString(row[groupKey], row.name, 'Unknown'),
        distribution: dist,
        total,
      }
    })
  }

  const map = asRecord(raw)
  return Object.entries(map).map(([name, moodsForGroup]) => {
    const dist = emptyDistribution()
    const nested = asRecord(moodsForGroup)
    for (const mood of MOOD_TYPES) {
      dist[mood] = pickCount(nested[mood]) ?? 0
    }
    return {
      faculty: name,
      distribution: dist,
      total: Object.values(dist).reduce((a, b) => a + b, 0),
    }
  })
}

export function normalizeStats(raw: unknown): MoodStats {
  const r = asRecord(raw)
  const data = asRecord(r.data)
  const src = Object.keys(data).length ? data : r

  const distribution = emptyDistribution()
  const distRaw = asRecord(src.distribution ?? src.moodDistribution ?? src.counts)

  for (const mood of MOOD_TYPES) {
    distribution[mood] = pickCount(distRaw[mood]) ?? 0
  }

  // Also accept array form: [{ moodType, count }] (some backends return `byMoodType`)
  const distArr = src.byMoodType ?? src.moods
  if (Array.isArray(distArr)) {
    for (const item of distArr) {
      const row = asRecord(item)
      const key = pickString(row.moodType, row.mood, row.type)
      if (isMoodType(key)) {
        distribution[key] = pickNumber(row.count, row.total, row.value) ?? distribution[key]
      }
    }
  }

  const byFacultyRaw = src.byFaculty ?? src.facultyStats ?? src.perFaculty ?? []
  const byFaculty = normalizeGroupedBreakdown(byFacultyRaw, 'faculty')

  const byMajorRaw = src.byMajor ?? src.majorStats
  const byMajor = byMajorRaw
    ? normalizeGroupedBreakdown(byMajorRaw, 'major').map((row) => ({
        major: row.faculty,
        distribution: row.distribution,
        total: row.total,
      }))
    : undefined

  // `dominantMood` may be a bare mood-type string, or an object like
  // `{ moodType, color, count }`.
  const dominantObj = asRecord(src.dominantMood)
  const dominantRaw = pickString(
    dominantObj.moodType,
    typeof src.dominantMood === 'string' ? src.dominantMood : undefined,
    src.dominant,
    src.campusVibe,
  )
  const dominantMood = isMoodType(dominantRaw)
    ? dominantRaw
    : dominantFromDistribution(distribution)

  const totalMoods =
    pickNumber(src.totalMoods, src.total, src.count) ??
    Object.values(distribution).reduce((a, b) => a + b, 0)

  return {
    distribution,
    byFaculty,
    byMajor,
    dominantMood,
    totalMoods,
  }
}

export function getErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (typeof error === 'string') return error
  const axiosLike = asRecord(error)
  const response = asRecord(axiosLike.response)
  const data = asRecord(response.data)
  if (typeof data.message === 'string' && data.message) return data.message
  if (typeof data.error === 'string' && data.error) return data.error
  const nestedError = asRecord(data.error)
  if (typeof nestedError.message === 'string' && nestedError.message) {
    return nestedError.message
  }
  if (Array.isArray(data.errors) && data.errors.length) {
    const first = asRecord(data.errors[0])
    const msg = pickString(first.msg, first.message)
    if (msg) return msg
  }
  if (typeof axiosLike.message === 'string' && axiosLike.message) return axiosLike.message
  return fallback
}
