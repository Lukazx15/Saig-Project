import {
  MOOD_META,
  KMITL_FACULTIES,
  KMITL_MAJORS_BY_FACULTY,
  majorsForFaculty,
} from '@/lib/moods'
import { MOOD_TYPES } from '@/types'
import type { MoodFilters } from '@/types'
import { useLocale } from '@/context/LocaleContext'
import { MOOD_LABEL_KEYS } from '@/i18n'

interface FilterBarProps {
  filters: MoodFilters
  onChange: (patch: Partial<MoodFilters>) => void
  onReset: () => void
}

export function FilterBar({ filters, onChange, onReset }: FilterBarProps) {
  const { t } = useLocale()
  const hasActiveFilters =
    filters.moodType || filters.faculty || filters.major || filters.dateFrom || filters.dateTo

  const majorOptions = filters.faculty
    ? majorsForFaculty(filters.faculty)
    : null

  function handleFacultyChange(faculty: string) {
    const nextMajors = faculty ? majorsForFaculty(faculty) : null
    const majorStillValid = nextMajors
      ? nextMajors.includes(filters.major)
      : Boolean(filters.major)
    onChange({
      faculty,
      major: majorStillValid ? filters.major : '',
    })
  }

  return (
    <div className="wood-frame rounded-sm bg-cork-900/85 p-3 sm:p-4">
      <div className="flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          onClick={() => onChange({ moodType: '' })}
          className={`rounded-sm px-3 py-1.5 text-sm font-medium transition ${
            !filters.moodType
              ? 'bg-brass-500 text-ink'
              : 'bg-black/25 text-paper/75 hover:bg-black/35'
          }`}
        >
          {t('filterAllMoods')}
        </button>
        {MOOD_TYPES.map((type) => {
          const meta = MOOD_META[type]
          const active = filters.moodType === type
          return (
            <button
              key={type}
              type="button"
              onClick={() => onChange({ moodType: active ? '' : type })}
              className="flex items-center gap-1.5 rounded-sm px-2.5 py-1.5 text-sm font-medium transition"
              style={{
                backgroundColor: active ? meta.color : 'rgba(0,0,0,0.25)',
                color: active ? '#241a12' : 'rgba(251,246,236,0.75)',
              }}
            >
              <span aria-hidden="true">{meta.emoji}</span>
              <span className="hidden sm:inline">{t(MOOD_LABEL_KEYS[type])}</span>
            </button>
          )
        })}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <label className="flex flex-col gap-1">
          <span className="text-[11px] font-medium text-paper/55">{t('filterFaculty')}</span>
          <select
            value={filters.faculty}
            onChange={(e) => handleFacultyChange(e.target.value)}
            className="rounded-sm border border-white/12 bg-night-950/80 px-2 py-1.5 text-sm text-paper focus:border-brass-500 focus:outline-none"
          >
            <option value="">{t('filterAnyFaculty')}</option>
            {KMITL_FACULTIES.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-[11px] font-medium text-paper/55">{t('filterMajor')}</span>
          <select
            value={filters.major}
            onChange={(e) => onChange({ major: e.target.value })}
            className="rounded-sm border border-white/12 bg-night-950/80 px-2 py-1.5 text-sm text-paper focus:border-brass-500 focus:outline-none"
          >
            <option value="">{t('filterAnyMajor')}</option>
            {majorOptions
              ? majorOptions.map((major) => (
                  <option key={major} value={major}>
                    {major}
                  </option>
                ))
              : KMITL_FACULTIES.map((faculty) => (
                  <optgroup key={faculty} label={faculty}>
                    {KMITL_MAJORS_BY_FACULTY[faculty].map((major) => (
                      <option key={`${faculty}-${major}`} value={major}>
                        {major}
                      </option>
                    ))}
                  </optgroup>
                ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-[11px] font-medium text-paper/55">{t('filterDateFrom')}</span>
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => onChange({ dateFrom: e.target.value })}
            aria-label={t('filterDateFrom')}
            className="rounded-sm border border-white/12 bg-night-950/80 px-2 py-1.5 text-sm text-paper focus:border-brass-500 focus:outline-none"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-[11px] font-medium text-paper/55">{t('filterDateTo')}</span>
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => onChange({ dateTo: e.target.value })}
            aria-label={t('filterDateTo')}
            className="rounded-sm border border-white/12 bg-night-950/80 px-2 py-1.5 text-sm text-paper focus:border-brass-500 focus:outline-none"
          />
        </label>
      </div>

      {hasActiveFilters && (
        <button
          type="button"
          onClick={onReset}
          className="mt-2 text-xs font-medium text-paper/55 underline-offset-2 hover:text-paper hover:underline"
        >
          {t('filterClear')}
        </button>
      )}
    </div>
  )
}
