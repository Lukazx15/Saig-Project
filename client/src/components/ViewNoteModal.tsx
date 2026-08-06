import { AnimatePresence, motion } from 'framer-motion'
import { createPortal } from 'react-dom'
import { PinIcon } from '@/components/PinIcon'
import { MOOD_META } from '@/lib/moods'
import type { MoodNote } from '@/types'
import { useLocale } from '@/context/LocaleContext'
import { MOOD_LABEL_KEYS } from '@/i18n'

interface ViewNoteModalProps {
  note: MoodNote
  isOpen: boolean
  onClose: () => void
}

function formatDate(iso: string, locale: string) {
  try {
    return new Date(iso).toLocaleDateString(locale === 'th' ? 'th-TH' : undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  } catch {
    return ''
  }
}

export function ViewNoteModal({ note, isOpen, onClose }: ViewNoteModalProps) {
  const { t, locale } = useLocale()
  const meta = MOOD_META[note.moodType]

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.article
            role="dialog"
            aria-modal="true"
            aria-label={t('postItViewFull')}
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.85, y: 30, rotate: -3 }}
            animate={{ opacity: 1, scale: 1, y: 0, rotate: -1 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            className="postit-shadow relative w-full max-w-sm rounded-sm p-6"
            style={{ backgroundColor: meta.color }}
          >
            <div className="pin-shadow absolute -top-3 left-1/2 -translate-x-1/2">
              <PinIcon className="h-6 w-6" />
            </div>

            <div className="mb-3 flex items-start justify-between gap-2">
              <span
                className="inline-block h-2.5 w-2.5 rounded-sm ring-1 ring-ink/15"
                style={{ backgroundColor: meta.color }}
                title={t(MOOD_LABEL_KEYS[note.moodType])}
                aria-label={t(MOOD_LABEL_KEYS[note.moodType])}
              />
              <button
                type="button"
                onClick={onClose}
                aria-label={t('postItClose')}
                className="rounded-sm bg-black/10 px-1.5 py-0.5 text-xs text-ink-soft hover:bg-black/20"
              >
                ✕
              </button>
            </div>

            <p
              className="max-h-[min(60vh,24rem)] overflow-y-auto break-words text-lg leading-snug text-ink sm:text-xl"
              style={{ fontFamily: 'var(--font-hand)' }}
            >
              {note.message}
            </p>

            <div className="mt-4 flex items-center justify-between gap-2 text-xs text-ink-soft/80">
              <span className="truncate font-medium">{note.alias}</span>
              <span className="shrink-0">{formatDate(note.createdAt, locale)}</span>
            </div>
            {note.faculty ? (
              <div className="mt-0.5 truncate text-[11px] text-ink-soft/60">{note.faculty}</div>
            ) : null}
          </motion.article>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
