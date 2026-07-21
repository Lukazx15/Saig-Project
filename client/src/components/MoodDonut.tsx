import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { MOOD_META } from '@/lib/moods'
import { MOOD_TYPES, type MoodType } from '@/types'
import { useLocale } from '@/context/LocaleContext'
import { MOOD_LABEL_KEYS } from '@/i18n'

interface MoodDonutProps {
  distribution: Record<MoodType, number>
  total: number
  dominantMood: MoodType | null
  size?: number
}

type Slice = {
  mood: MoodType
  count: number
  start: number
  end: number
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  }
}

function describeArc(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number,
) {
  const start = polarToCartesian(cx, cy, r, endAngle)
  const end = polarToCartesian(cx, cy, r, startAngle)
  const largeArc = endAngle - startAngle > 180 ? 1 : 0
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`
}

export function MoodDonut({
  distribution,
  total,
  dominantMood,
  size = 260,
}: MoodDonutProps) {
  const { t } = useLocale()
  const cx = size / 2
  const cy = size / 2
  const radius = size * 0.36
  const stroke = size * 0.14

  const slices = useMemo(() => {
    const result: Slice[] = []
    if (total <= 0) return result
    let angle = 0
    for (const mood of MOOD_TYPES) {
      const count = distribution[mood] ?? 0
      if (count <= 0) continue
      const sweep = (count / total) * 360
      result.push({
        mood,
        count,
        start: angle,
        end: angle + sweep,
      })
      angle += sweep
    }
    return result
  }, [distribution, total])

  const dominantMeta = dominantMood ? MOOD_META[dominantMood] : null

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[280px]">
      <svg viewBox={`0 0 ${size} ${size}`} className="h-full w-full" role="img" aria-label={t('statsDonutLabel')}>
        {/* Track */}
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke="rgba(36, 26, 18, 0.08)"
          strokeWidth={stroke}
        />

        {total <= 0 ? null : slices.length === 1 ? (
          // Full circle when one mood owns 100%
          <motion.circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke={MOOD_META[slices[0].mood].color}
            strokeWidth={stroke}
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0.4 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          />
        ) : (
          slices.map((slice, i) => {
            // Tiny gap between slices so they read clearly
            const gap = 1.2
            const start = slice.start + gap / 2
            const end = Math.max(start + 0.5, slice.end - gap / 2)
            return (
              <motion.path
                key={slice.mood}
                d={describeArc(cx, cy, radius, start, end)}
                fill="none"
                stroke={MOOD_META[slice.mood].color}
                strokeWidth={stroke}
                strokeLinecap="butt"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{
                  delay: i * 0.06,
                  duration: 0.7,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <title>
                  {t(MOOD_LABEL_KEYS[slice.mood])}: {slice.count}
                </title>
              </motion.path>
            )
          })
        )}
      </svg>

      <div className="pointer-events-none absolute inset-[22%] flex flex-col items-center justify-center overflow-hidden px-2 text-center">
        <span
          className="h-3 w-3 rounded-sm"
          style={{ backgroundColor: dominantMeta?.color ?? 'rgba(36,26,18,0.2)' }}
          aria-hidden="true"
        />
        <p className="mt-2 max-w-full text-[9px] font-semibold uppercase leading-tight tracking-wide text-ink-soft/70 sm:text-[10px]">
          {t('statsDominantShort')}
        </p>
        <p
          className="mt-0.5 max-w-full truncate text-base text-ink sm:text-lg"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {dominantMood ? t(MOOD_LABEL_KEYS[dominantMood]) : t('statsNoMoods')}
        </p>
        <p className="mt-0.5 max-w-full truncate text-[11px] text-ink-soft/70">
          {total} {t('statsDonutTotal')}
        </p>
      </div>
    </div>
  )
}
