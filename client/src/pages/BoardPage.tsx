import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { FilterBar } from '@/components/FilterBar'
import { PostIt } from '@/components/PostIt'
import { Pagination } from '@/components/Pagination'
import { ComposeModal } from '@/components/ComposeModal'
import { BrandLoader } from '@/components/BrandLoader'
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
    try {
      await removeMood(note.id)
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : t('boardDeleteFailed'))
    }
  }

  return (
    <Layout variant="board">
      <div className="cork-texture min-h-[calc(100vh-64px)] pb-24 sm:pb-16">
        <div className="mx-auto max-w-6xl px-3 pt-6 sm:px-6 sm:pt-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="mb-5 text-center sm:mb-7"
          >
            <h1
              className="text-[1.65rem] leading-tight text-paper drop-shadow-sm sm:text-4xl"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {t('boardTitle')}
            </h1>
            <p
              className="mx-auto mt-2 max-w-md text-pretty px-1 text-sm leading-snug text-paper/75 sm:max-w-xl sm:text-lg"
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
            <BrandLoader message={t('boardLoading')} variant="board" />
          ) : moods.length === 0 ? (
            <p
              className="py-20 text-center text-paper/70"
              style={{ fontFamily: 'var(--font-hand)' }}
            >
              {t('boardEmpty')}
            </p>
          ) : (
            <div
              key={[
                filters.page,
                filters.moodType,
                filters.faculty,
                filters.major,
                filters.dateFrom,
                filters.dateTo,
              ].join('|')}
              className="grid grid-cols-2 items-start gap-x-1 gap-y-4 sm:grid-cols-3 sm:gap-x-2 sm:gap-y-6 md:grid-cols-4"
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
          className="postit-shadow fixed bottom-5 right-4 z-30 flex items-center gap-2 rounded-sm bg-brass-500 px-3.5 py-3 text-sm font-semibold text-ink sm:bottom-8 sm:right-8 sm:px-4"
        >
          <span className="text-lg leading-none" aria-hidden="true">
            +
          </span>
          <span className="max-w-[9rem] truncate sm:max-w-none">{t('boardPinCta')}</span>
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
