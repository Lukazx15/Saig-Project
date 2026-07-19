import type { Locale, MessageKey, Messages } from './types'
import { en } from './en'
import { th } from './th'

export type { Locale, MessageKey, Messages, TranslationKey } from './types'
export { en } from './en'
export { th } from './th'

export const messages: Record<Locale, Messages> = {
  en,
  th,
}

/** @deprecated prefer `messages` — kept so older imports keep working */
export const translations = messages

export const MOOD_LABEL_KEYS = {
  happy: 'moodHappy',
  calm: 'moodCalm',
  tired: 'moodTired',
  stressed: 'moodStressed',
  sad: 'moodSad',
  excited: 'moodExcited',
  angry: 'moodAngry',
} as const satisfies Record<string, MessageKey>
