import { useCallback, useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Layout } from '@/components/Layout'
import { Pagination } from '@/components/Pagination'
import { BrandLoader } from '@/components/BrandLoader'
import { listMoods, deleteMood } from '@/api/moods'
import { MOOD_META } from '@/lib/moods'
import type { MoodNote, PaginationMeta } from '@/types'
import { useLocale } from '@/context/LocaleContext'
import { MOOD_LABEL_KEYS } from '@/i18n'

function formatDateTime(iso: string, locale: string) {
  try {
    return new Date(iso).toLocaleString(locale === 'th' ? 'th-TH' : undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

function AdminNoteCard({
  note,
  pending,
  confirming,
  onAskDelete,
  onCancelDelete,
  onConfirmDelete,
}: {
  note: MoodNote
  pending: boolean
  confirming: boolean
  onAskDelete: () => void
  onCancelDelete: () => void
  onConfirmDelete: () => void
}) {
  const { t, locale } = useLocale()
  const meta = MOOD_META[note.moodType]
  const facultyLine = [note.faculty, note.major].filter(Boolean).join(' · ')

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="postit-shadow flex flex-col gap-3 rounded-sm bg-paper p-4 text-ink sm:flex-row sm:items-start sm:gap-4 sm:p-5"
    >
      <div className="min-w-0 flex-1 space-y-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className="inline-flex items-center gap-1.5 rounded-sm px-2 py-0.5 text-xs font-semibold"
            style={{ backgroundColor: meta.color, color: '#241a12' }}
          >
            <span
              className="h-1.5 w-1.5 rounded-sm bg-ink/40"
              aria-hidden="true"
            />
            {t(MOOD_LABEL_KEYS[note.moodType])}
          </span>
          <span className="text-xs text-ink-soft/70">{formatDateTime(note.createdAt, locale)}</span>
        </div>

        <p
          className="text-base leading-snug text-ink sm:text-lg"
          style={{ fontFamily: 'var(--font-hand)' }}
        >
          {note.message}
        </p>

        <div className="space-y-0.5 text-xs text-ink-soft sm:text-sm">
          <p className="font-medium text-ink-soft">{note.alias}</p>
          {facultyLine ? <p className="text-ink-soft/75">{facultyLine}</p> : null}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:flex-col sm:items-stretch">
        {confirming ? (
          <>
            <p className="mb-0 w-full text-xs leading-snug text-ink-soft sm:mb-1 sm:max-w-[9.5rem]">
              {t('adminDeleteConfirm', { alias: note.alias })}
            </p>
            <button
              type="button"
              onClick={onCancelDelete}
              disabled={pending}
              className="rounded-sm bg-ink/8 px-3 py-2 text-xs font-medium text-ink-soft hover:bg-ink/12 disabled:opacity-50"
            >
              {t('boardDeleteKeep')}
            </button>
            <button
              type="button"
              onClick={onConfirmDelete}
              disabled={pending}
              className="rounded-sm bg-ink px-3 py-2 text-xs font-semibold text-paper hover:bg-ink/85 disabled:opacity-50"
            >
              {pending ? t('adminDeleting') : t('adminDelete')}
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={onAskDelete}
            className="rounded-sm border border-ink/20 bg-white/60 px-3 py-2 text-xs font-semibold text-ink-soft transition hover:border-red-800/40 hover:bg-red-50 hover:text-red-900 sm:min-w-[5.5rem]"
          >
            {t('adminDelete')}
          </button>
        )}
      </div>
    </motion.article>
  )
}

export function AdminPage() {
  const { t } = useLocale()
  const [notes, setNotes] = useState<MoodNote[]>([])
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [query, setQuery] = useState('')

  const load = useCallback(
    async (page: number) => {
      setIsLoading(true)
      setError(null)
      setConfirmId(null)
      try {
        const result = await listMoods({ page, limit: 20 })
        setNotes(result.moods)
        setPagination(result.pagination)
      } catch (err) {
        setError(err instanceof Error ? err.message : t('adminLoadFailed'))
      } finally {
        setIsLoading(false)
      }
    },
    [t],
  )

  useEffect(() => {
    load(1)
  }, [load])

  const filteredNotes = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return notes
    return notes.filter((note) => {
      const haystack = [note.message, note.alias, note.faculty, note.major, note.moodType]
        .join(' ')
        .toLowerCase()
      return haystack.includes(q)
    })
  }, [notes, query])

  async function handleConfirmDelete(note: MoodNote) {
    setPendingId(note.id)
    setError(null)
    try {
      await deleteMood(note.id)
      setNotes((prev) => prev.filter((n) => n.id !== note.id))
      setPagination((prev) => ({ ...prev, total: Math.max(0, prev.total - 1) }))
      setConfirmId(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('adminDeleteFailed'))
    } finally {
      setPendingId(null)
    }
  }

  return (
    <Layout variant="plain">
      <div className="cork-texture min-h-[calc(100vh-64px)] px-4 py-8 sm:px-6 sm:py-10">
        <div className="mx-auto max-w-3xl">
          <header className="mb-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h1
                  className="text-3xl text-paper sm:text-4xl"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {t('adminTitle')}
                </h1>
                <p className="mt-2 max-w-md text-paper/75" style={{ fontFamily: 'var(--font-hand)' }}>
                  {t('adminSubtitle')}
                </p>
              </div>
              {!isLoading && (
                <p className="rounded-sm bg-cork-900/50 px-2.5 py-1 text-xs font-medium text-paper/70">
                  {t('paginationTotal', { n: pagination.total })}
                </p>
              )}
            </div>

            <label className="mt-5 block">
              <span className="sr-only">{t('adminSearch')}</span>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('adminSearchPlaceholder')}
                className="w-full rounded-sm border border-cork-900/40 bg-paper px-3 py-2.5 text-sm text-ink placeholder:text-ink-soft/50 focus:border-cork-700 focus:outline-none focus:ring-2 focus:ring-cork-700/25"
              />
            </label>
          </header>

          {error && (
            <p className="mb-4 rounded-sm bg-red-900/35 px-3 py-2 text-sm text-red-100">{error}</p>
          )}

          {isLoading ? (
            <BrandLoader message={t('adminLoading')} variant="board" />
          ) : notes.length === 0 ? (
            <p className="py-16 text-center text-paper/65" style={{ fontFamily: 'var(--font-hand)' }}>
              {t('adminEmpty')}
            </p>
          ) : filteredNotes.length === 0 ? (
            <p className="py-12 text-center text-paper/65" style={{ fontFamily: 'var(--font-hand)' }}>
              {t('adminSearchEmpty')}
            </p>
          ) : (
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {filteredNotes.map((note) => (
                  <AdminNoteCard
                    key={note.id}
                    note={note}
                    pending={pendingId === note.id}
                    confirming={confirmId === note.id}
                    onAskDelete={() => setConfirmId(note.id)}
                    onCancelDelete={() => setConfirmId(null)}
                    onConfirmDelete={() => handleConfirmDelete(note)}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}

          <Pagination pagination={pagination} onPageChange={load} />
        </div>
      </div>
    </Layout>
  )
}
