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
import { PinIcon } from '@/components/PinIcon'

interface FilterBarProps {
  filters: MoodFilters
  onChange: (patch: Partial<MoodFilters>) => void
  onReset: () => void
}

export function FilterBar({ filters, onChange, onReset }: FilterBarProps) {
  const { t } = useLocale()
  const hasActiveFilters =
    filters.moodType || filters.faculty || filters.major || filters.dateFrom || filters.dateTo

  const majorOptions = filters.faculty ? majorsForFaculty(filters.faculty) : null

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
    <div className="filter-wood relative rounded-sm p-2 sm:p-2.5">
      <div className="pin-shadow absolute -top-2.5 left-5 z-10 sm:left-7">
        <PinIcon className="h-5 w-5" />
      </div>

      <div className="filter-paper rounded-sm px-2.5 pb-2.5 pt-3.5 sm:px-3.5 sm:pb-3 sm:pt-4">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => onChange({ moodType: '' })}
            className={`rounded-sm px-2.5 py-1 text-xs font-medium transition sm:text-sm ${
              !filters.moodType
                ? 'bg-ink text-paper'
                : 'bg-ink/8 text-ink-soft hover:bg-ink/12'
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
                title={t(MOOD_LABEL_KEYS[type])}
                className={`inline-flex items-center gap-1.5 rounded-sm px-2 py-1 text-xs font-medium transition sm:px-2.5 sm:text-sm ${
                  active ? 'bg-ink text-paper' : 'bg-ink/8 text-ink-soft hover:bg-ink/12'
                }`}
              >
                <span
                  className="h-2 w-2 shrink-0 rounded-sm ring-1 ring-ink/20"
                  style={{ backgroundColor: meta.color }}
                  aria-hidden="true"
                />
                <span>{t(MOOD_LABEL_KEYS[type])}</span>
              </button>
            )
          })}
        </div>

        <div className="mt-2.5 grid grid-cols-2 gap-2 sm:mt-3 sm:grid-cols-4">
          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-medium text-ink-soft/80">{t('filterFaculty')}</span>
            <select
              value={filters.faculty}
              onChange={(e) => handleFacultyChange(e.target.value)}
              className="filter-select"
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
            <span className="text-[11px] font-medium text-ink-soft/80">{t('filterMajor')}</span>
            <select
              value={filters.major}
              onChange={(e) => onChange({ major: e.target.value })}
              className="filter-select"
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
            <span className="text-[11px] font-medium text-ink-soft/80">{t('filterDateFrom')}</span>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => onChange({ dateFrom: e.target.value })}
              aria-label={t('filterDateFrom')}
              className="filter-select"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-medium text-ink-soft/80">{t('filterDateTo')}</span>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => onChange({ dateTo: e.target.value })}
              aria-label={t('filterDateTo')}
              className="filter-select"
            />
          </label>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            className="mt-2 text-xs font-medium text-ink-soft underline-offset-2 hover:text-ink hover:underline"
          >
            {t('filterClear')}
          </button>
        )}
      </div>
    </div>
  )
}
