import { useCallback, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Layout } from '@/components/Layout'
import { Pagination } from '@/components/Pagination'
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

export function AdminPage() {
  const { t, locale } = useLocale()
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

  const load = useCallback(
    async (page: number) => {
      setIsLoading(true)
      setError(null)
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

  async function handleDelete(note: MoodNote) {
    if (!window.confirm(t('adminDeleteConfirm', { alias: note.alias }))) return
    setPendingId(note.id)
    try {
      await deleteMood(note.id)
      setNotes((prev) => prev.filter((n) => n.id !== note.id))
      setPagination((prev) => ({ ...prev, total: Math.max(0, prev.total - 1) }))
    } catch (err) {
      setError(err instanceof Error ? err.message : t('adminDeleteFailed'))
    } finally {
      setPendingId(null)
    }
  }

  return (
    <Layout variant="plain">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <h1
          className="text-4xl text-paper sm:text-5xl"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {t('adminTitle')}
        </h1>
        <p className="mt-2 text-paper/70">{t('adminSubtitle')}</p>

        {error && (
          <p className="mt-6 rounded-sm bg-red-900/30 px-3 py-2 text-red-100">{error}</p>
        )}

        {isLoading ? (
          <p className="mt-10 text-paper/60">{t('adminLoading')}</p>
        ) : notes.length === 0 ? (
          <p className="mt-10 text-paper/60">{t('adminEmpty')}</p>
        ) : (
          <div className="mt-6 overflow-x-auto overflow-y-hidden rounded-sm border border-white/10">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-white/5 text-paper/60">
                <tr>
                  <th className="px-3 py-2 font-medium">{t('adminColMood')}</th>
                  <th className="px-3 py-2 font-medium">{t('adminColMessage')}</th>
                  <th className="px-3 py-2 font-medium">{t('adminColAlias')}</th>
                  <th className="hidden px-3 py-2 font-medium sm:table-cell">
                    {t('adminColFaculty')}
                  </th>
                  <th className="hidden px-3 py-2 font-medium sm:table-cell">
                    {t('adminColPinned')}
                  </th>
                  <th className="px-3 py-2 font-medium" />
                </tr>
              </thead>
              <tbody>
                {notes.map((note) => (
                  <motion.tr
                    key={note.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="border-t border-white/5 text-paper/85"
                  >
                    <td className="px-3 py-2">
                      <span
                        className="inline-flex items-center gap-1 rounded-sm px-2 py-0.5 text-xs font-medium"
                        style={{ backgroundColor: MOOD_META[note.moodType].color, color: '#241a12' }}
                      >
                        {note.emoji} {t(MOOD_LABEL_KEYS[note.moodType])}
                      </span>
                    </td>
                    <td className="max-w-xs truncate px-3 py-2">{note.message}</td>
                    <td className="px-3 py-2">{note.alias}</td>
                    <td className="hidden px-3 py-2 text-paper/60 sm:table-cell">
                      {note.faculty} / {note.major}
                    </td>
                    <td className="hidden px-3 py-2 text-paper/60 sm:table-cell">
                      {formatDateTime(note.createdAt, locale)}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <button
                        type="button"
                        disabled={pendingId === note.id}
                        onClick={() => handleDelete(note)}
                        className="rounded-sm border border-red-400/40 px-2.5 py-1 text-xs font-medium text-red-300 hover:bg-red-400/10 disabled:opacity-50"
                      >
                        {pendingId === note.id ? t('adminDeleting') : t('adminDelete')}
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination pagination={pagination} onPageChange={load} />
      </div>
    </Layout>
  )
}
