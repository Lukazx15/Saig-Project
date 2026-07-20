import { motion } from 'framer-motion'
import { PinIcon } from '@/components/PinIcon'
import { MOOD_META, rotationForId } from '@/lib/moods'
import type { MoodNote } from '@/types'
import { useLocale } from '@/context/LocaleContext'

interface PostItProps {
  note: MoodNote
  onEdit?: (note: MoodNote) => void
  onDelete?: (note: MoodNote) => void
}

function formatDate(iso: string, locale: string) {
  try {
    return new Date(iso).toLocaleDateString(locale === 'th' ? 'th-TH' : undefined, {
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return ''
  }
}

export function PostIt({ note, onEdit, onDelete }: PostItProps) {
  const { t, locale } = useLocale()
  const rotation = note.rotation ?? rotationForId(note.id)
  const meta = MOOD_META[note.moodType]

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: -28, scale: 0.88, rotate: 0 }}
      animate={{ opacity: 1, y: 0, scale: 1, rotate: rotation }}
      exit={{ opacity: 0, scale: 0.82, transition: { duration: 0.18 } }}
      whileHover={{ rotate: 0, scale: 1.04, zIndex: 10 }}
      transition={{
        layout: { type: 'spring', stiffness: 380, damping: 32 },
        type: 'spring',
        stiffness: 320,
        damping: 22,
      }}
      className="postit-shadow group relative flex h-56 w-full flex-col justify-between rounded-sm p-4 sm:h-60"
      style={{ backgroundColor: note.color }}
    >
      <div className="pin-shadow absolute -top-3 left-1/2 -translate-x-1/2">
        <PinIcon className="h-6 w-6" />
      </div>

      <div className="flex items-start justify-between gap-2">
        <span className="text-2xl leading-none">{note.emoji || meta.emoji}</span>
        {(note.canEdit || note.canDelete) && (
          <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100 sm:opacity-70">
            {note.canEdit && onEdit && (
              <button
                type="button"
                onClick={() => onEdit(note)}
                aria-label={t('postItEdit')}
                className="rounded-sm bg-black/10 px-1.5 py-0.5 text-xs text-ink-soft hover:bg-black/20"
              >
                {t('postItEdit')}
              </button>
            )}
            {note.canDelete && onDelete && (
              <button
                type="button"
                onClick={() => onDelete(note)}
                aria-label={t('postItDelete')}
                className="rounded-sm bg-black/10 px-1.5 py-0.5 text-xs text-ink-soft hover:bg-black/20"
              >
                ✕
              </button>
            )}
          </div>
        )}
      </div>

      <p
        className="line-clamp-4 flex-1 overflow-hidden text-lg leading-snug text-ink"
        style={{ fontFamily: 'var(--font-hand)' }}
      >
        {note.message}
      </p>

      <div className="flex items-center justify-between text-[11px] text-ink-soft/80">
        <span className="truncate font-medium">{note.alias}</span>
        <span className="shrink-0">{formatDate(note.createdAt, locale)}</span>
      </div>
    </motion.article>
  )
}
