export const MOOD_TYPES = [
  'happy',
  'calm',
  'tired',
  'stressed',
  'sad',
  'excited',
  'angry',
] as const

export type MoodType = (typeof MOOD_TYPES)[number]

export type UserRole = 'student' | 'admin'

export interface User {
  id: string
  studentId: string
  email: string
  faculty: string
  major: string
  year: number
  role: UserRole
  alias?: string
  kmitlVerified?: boolean
}

export interface MoodNote {
  id: string
  moodType: MoodType
  emoji: string
  message: string
  color: string
  alias: string
  faculty: string
  major: string
  year: number
  createdAt: string
  updatedAt?: string
  rotation?: number
  /** Ownership and permission flags are supplied by the API. */
  isOwner?: boolean
  canEdit?: boolean
  canDelete?: boolean
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface MoodFilters {
  moodType: MoodType | ''
  faculty: string
  major: string
  dateFrom: string
  dateTo: string
  page: number
  limit: number
}

export interface MoodListResult {
  moods: MoodNote[]
  pagination: PaginationMeta
}

export interface MoodStats {
  distribution: Record<MoodType, number>
  byFaculty: Array<{
    faculty: string
    distribution: Partial<Record<MoodType, number>>
    total: number
  }>
  byMajor?: Array<{
    major: string
    faculty?: string
    distribution: Partial<Record<MoodType, number>>
    total: number
  }>
  dominantMood: MoodType | null
  totalMoods: number
}

export interface AuthResponse {
  accessToken: string
  user: User
}
