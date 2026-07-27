import type { Locale, MessageKey, Messages } from './types'
import type { MoodType } from '@/types'
import { en } from './en'
import { th } from './th'

export type { Locale, MessageKey, Messages } from './types'

export const messages: Record<Locale, Messages> = {
  en,
  th,
}

export const MOOD_LABEL_KEYS = {
  happy: 'moodHappy',
  calm: 'moodCalm',
  tired: 'moodTired',
  stressed: 'moodStressed',
  sad: 'moodSad',
  excited: 'moodExcited',
  angry: 'moodAngry',
  sleepy: 'moodSleepy',
  hungry: 'moodHungry',
  thirsty: 'moodThirsty',
  cold: 'moodCold',
  hot: 'moodHot',
  sick: 'moodSick',
  pain: 'moodPain', 
} as const satisfies Record<MoodType, MessageKey>
