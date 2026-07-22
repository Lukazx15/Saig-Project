import { useState, type PointerEvent } from 'react'
import { motion } from 'framer-motion'
import { PinIcon } from '@/components/PinIcon'
import { MOOD_META, pinOffsetForId, pinOffsetXForId, pinSizeForId, rotationForId } from '@/lib/moods'
import type { MoodNote } from '@/types'
import { useLocale } from '@/context/LocaleContext'
import { MOOD_LABEL_KEYS } from '@/i18n'

interface PostItProps {
  note: MoodNote
  /** When true (tap on mobile / hover on desktop), note sits straight for reading. */
  straightened?: boolean
  onStraighten?: (note: MoodNote) => void
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

const SIZE_CLASS = {
  short: 'min-h-[10.5rem] sm:min-h-[12.5rem]',
  medium: 'min-h-[12rem] sm:min-h-[14.5rem]',
  tall: 'min-h-[13.5rem] sm:min-h-[16.5rem]',
} as const

export function PostIt({ note, straightened = false, onStraighten, onEdit, onDelete }: PostItProps) {
  const { t, locale } = useLocale()
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [hovered, setHovered] = useState(false)
  const rotation = note.rotation ?? rotationForId(note.id)
  const offsetY = pinOffsetForId(note.id)
  const offsetX = pinOffsetXForId(note.id)
  const size = pinSizeForId(note.id)
  const meta = MOOD_META[note.moodType]
  const zBase = (Math.abs(pinOffsetForId(note.id)) % 5) + 1
  const isStraight = straightened || hovered || confirmDelete

  function handlePointerUp(event: PointerEvent<HTMLElement>) {
    if ((event.target as HTMLElement).closest('button')) return
    // Touch / pen: tap toggles straighten (hover does not work on mobile).
    if (event.pointerType === 'touch' || event.pointerType === 'pen') {
      onStraighten?.(note)
    }
  }

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: -28, scale: 0.88, rotate: 0 }}
      animate={{
        opacity: 1,
        x: offsetX,
        y: isStraight ? offsetY - 2 : offsetY,
        scale: isStraight ? 1.03 : 1,
        rotate: isStraight ? 0 : rotation,
        zIndex: isStraight ? 20 : zBase,
      }}
      exit={{ opacity: 0, scale: 0.82, transition: { duration: 0.18 } }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onPointerUp={handlePointerUp}
      transition={{
        layout: { type: 'spring', stiffness: 380, damping: 32 },
        type: 'spring',
        stiffness: 320,
        damping: 22,
      }}
      className={`postit-shadow group relative -mb-2 flex w-full cursor-pointer flex-col justify-between rounded-sm p-3 touch-manipulation sm:-mb-3 sm:p-4 ${SIZE_CLASS[size]}`}
      style={{ backgroundColor: note.color, zIndex: isStraight ? 20 : zBase }}
    >
      <div className="pin-shadow absolute -top-3 left-1/2 -translate-x-1/2">
        <PinIcon className="h-6 w-6" />
      </div>

      <div className="flex items-start justify-between gap-2">
        <span
          className="inline-block h-2.5 w-2.5 rounded-sm ring-1 ring-ink/15"
          style={{ backgroundColor: meta.color }}
          title={t(MOOD_LABEL_KEYS[note.moodType])}
          aria-label={t(MOOD_LABEL_KEYS[note.moodType])}
        />
        {(note.canEdit || note.canDelete) && !confirmDelete && (
          <div className="flex gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
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
                onClick={() => setConfirmDelete(true)}
                aria-label={t('postItDelete')}
                className="rounded-sm bg-black/10 px-1.5 py-0.5 text-xs text-ink-soft hover:bg-black/20"
              >
                ✕
              </button>
            )}
          </div>
        )}
      </div>

      {confirmDelete ? (
        <div className="flex flex-1 flex-col justify-center gap-2 py-2">
          <p className="text-sm leading-snug text-ink">{t('boardDeleteConfirm')}</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setConfirmDelete(false)}
              className="rounded-sm bg-black/10 px-2.5 py-1 text-xs font-medium text-ink-soft hover:bg-black/20"
            >
              {t('boardDeleteKeep')}
            </button>
            <button
              type="button"
              onClick={() => {
                setConfirmDelete(false)
                onDelete?.(note)
              }}
              className="rounded-sm bg-ink px-2.5 py-1 text-xs font-semibold text-paper hover:bg-ink/85"
            >
              {t('boardDeleteUnpin')}
            </button>
          </div>
        </div>
      ) : (
        <p
          className="line-clamp-5 flex-1 overflow-hidden text-base leading-snug text-ink sm:text-lg"
          style={{ fontFamily: 'var(--font-hand)' }}
        >
          {note.message}
        </p>
      )}

      <div className="flex items-center justify-between gap-2 text-[11px] text-ink-soft/80">
        <span className="truncate font-medium">{note.alias}</span>
        <span className="shrink-0">{formatDate(note.createdAt, locale)}</span>
      </div>
      {note.faculty ? (
        <div className="truncate text-[10px] text-ink-soft/60">{note.faculty}</div>
      ) : null}
    </motion.article>
  )
}
