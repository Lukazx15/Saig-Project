import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { FilterBar } from '@/components/FilterBar'
import { PostIt } from '@/components/PostIt'
import { Pagination } from '@/components/Pagination'
import { ComposeModal } from '@/components/ComposeModal'
import { useAuth } from '@/context/AuthContext'
import { useLocale } from '@/context/LocaleContext'
import { useMoods } from '@/context/MoodContext'
import type { ComposeMoodFormValues } from '@/lib/schemas'
import type { MoodNote } from '@/types'

export function BoardPage() {
  const { isAuthenticated } = useAuth()
  const { t } = useLocale()
  const { moods, pagination, filters, isLoading, error, setFilters, resetFilters, setPage, composeMood, editMood, removeMood } =
    useMoods()
  const navigate = useNavigate()
  const [isComposeOpen, setIsComposeOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<MoodNote | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  function handleComposeClick() {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    setIsComposeOpen(true)
  }

  async function handleCreate(values: ComposeMoodFormValues) {
    await composeMood(values)
  }

  async function handleEditSubmit(values: ComposeMoodFormValues) {
    if (!editingNote) return
    await editMood(editingNote.id, values)
  }

  async function handleDelete(note: MoodNote) {
    setDeleteError(null)
    if (!window.confirm(t('boardDeleteConfirm'))) return
    try {
      await removeMood(note.id)
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : t('boardDeleteFailed'))
    }
  }

  return (
    <Layout variant="board">
      <div className="cork-texture min-h-[calc(100vh-64px)] pb-16">
        <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6 sm:pt-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="mb-7 text-center"
          >
            <h1
              className="text-3xl leading-tight text-paper drop-shadow-sm sm:text-5xl"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {t('boardTitle')}
            </h1>
            <p
              className="mx-auto mt-2 max-w-lg text-base text-paper/75 sm:text-lg"
              style={{ fontFamily: 'var(--font-hand)' }}
            >
              {t('boardSubtitle')}
            </p>
          </motion.div>

          <div className="mb-6">
            <FilterBar filters={filters} onChange={setFilters} onReset={resetFilters} />
          </div>

          {error && (
            <p className="mb-4 rounded-sm bg-red-900/30 px-3 py-2 text-center text-sm text-red-100">
              {error}
            </p>
          )}
          {deleteError && (
            <p className="mb-4 rounded-sm bg-red-900/30 px-3 py-2 text-center text-sm text-red-100">
              {deleteError}
            </p>
          )}

          {isLoading && moods.length === 0 ? (
            <div className="py-20 text-center text-paper/70">{t('boardLoading')}</div>
          ) : moods.length === 0 ? (
            <div className="py-20 text-center text-paper/70">{t('boardEmpty')}</div>
          ) : (
            // Remount on filter/page change so Next/Prev doesn't cross-fade
            // two pages. Same key on delete → popLayout lets siblings fill the gap.
            <div
              key={[
                filters.page,
                filters.moodType,
                filters.faculty,
                filters.major,
                filters.dateFrom,
                filters.dateTo,
              ].join('|')}
              className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4"
            >
              <AnimatePresence mode="popLayout">
                {moods.map((note) => (
                  <PostIt
                    key={note.id}
                    note={note}
                    onEdit={(n) => setEditingNote(n)}
                    onDelete={handleDelete}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}

          <Pagination pagination={pagination} onPageChange={setPage} />
        </div>

        <motion.button
          type="button"
          onClick={handleComposeClick}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.97 }}
          className="postit-shadow fixed bottom-6 right-6 z-30 flex items-center gap-2 rounded-sm bg-brass-500 px-4 py-3 text-sm font-semibold text-ink sm:bottom-8 sm:right-8"
        >
          <span className="text-lg leading-none" aria-hidden="true">
            +
          </span>
          {t('boardPinCta')}
        </motion.button>
      </div>

      <ComposeModal
        isOpen={isComposeOpen}
        onClose={() => setIsComposeOpen(false)}
        onSubmit={handleCreate}
      />

      <ComposeModal
        key={editingNote?.id ?? 'edit-empty'}
        isOpen={Boolean(editingNote)}
        onClose={() => setEditingNote(null)}
        onSubmit={handleEditSubmit}
        title={t('boardEditTitle')}
        initialValues={
          editingNote
            ? { moodType: editingNote.moodType, message: editingNote.message }
            : undefined
        }
      />
    </Layout>
  )
}
