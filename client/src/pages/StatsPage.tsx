import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Layout } from '@/components/Layout'
import { fetchStats } from '@/api/moods'
import { MOOD_META } from '@/lib/moods'
import { MOOD_TYPES } from '@/types'
import type { MoodStats } from '@/types'
import { useLocale } from '@/context/LocaleContext'
import { MOOD_LABEL_KEYS } from '@/i18n'

export function StatsPage() {
  const { t } = useLocale()
  const [stats, setStats] = useState<MoodStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    fetchStats()
      .then((data) => mounted && setStats(data))
      .catch((err) =>
        mounted && setError(err instanceof Error ? err.message : t('statsFailed')),
      )
      .finally(() => mounted && setIsLoading(false))
    return () => {
      mounted = false
    }
  }, [t])

  const dominant = stats?.dominantMood
  const dominantMeta = dominant ? MOOD_META[dominant] : null
  const maxCount = stats ? Math.max(1, ...MOOD_TYPES.map((m) => stats.distribution[m])) : 1

  return (
    <Layout variant="plain">
      <div
        className="min-h-[calc(100vh-64px)] px-4 py-10 transition-colors duration-700 sm:px-6"
        style={{
          background: dominantMeta
            ? `radial-gradient(circle at 50% 0%, ${dominantMeta.tint}, transparent 60%), var(--color-night-950)`
            : undefined,
        }}
      >
        <div className="mx-auto max-w-4xl">
          <h1
            className="text-4xl text-paper sm:text-5xl"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {t('statsTitle')}
          </h1>
          <p className="mt-2 text-paper/70">{t('statsSubtitle')}</p>

          {isLoading && <p className="mt-10 text-paper/60">{t('statsLoading')}</p>}
          {error && (
            <p className="mt-10 rounded-sm bg-red-900/30 px-3 py-2 text-red-100">{error}</p>
          )}

          {stats && (
            <>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 flex items-center gap-4 rounded-sm border border-white/10 bg-white/5 p-5"
              >
                <span className="text-5xl">{dominantMeta?.emoji ?? '🤔'}</span>
                <div>
                  <p className="text-xs uppercase tracking-wide text-paper/50">
                    {t('statsDominant')}
                  </p>
                  <p
                    className="text-2xl text-paper"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {dominant
                      ? t(MOOD_LABEL_KEYS[dominant])
                      : t('statsNoMoods')}
                  </p>
                </div>
                <div className="ml-auto text-right">
                  <p className="text-xs uppercase tracking-wide text-paper/50">
                    {t('statsTotalPinned')}
                  </p>
                  <p className="text-2xl text-paper">{stats.totalMoods}</p>
                </div>
              </motion.div>

              <div className="mt-8 space-y-3">
                {MOOD_TYPES.map((mood, i) => {
                  const meta = MOOD_META[mood]
                  const count = stats.distribution[mood]
                  const pct = Math.max(4, (count / maxCount) * 100)
                  return (
                    <div key={mood} className="flex items-center gap-3">
                      <span className="w-28 shrink-0 text-sm text-paper/70">
                        {meta.emoji} {t(MOOD_LABEL_KEYS[mood])}
                      </span>
                      <div className="h-6 flex-1 overflow-hidden rounded-sm bg-white/5">
                        <motion.div
                          className="h-full rounded-sm"
                          style={{ backgroundColor: meta.color }}
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ delay: i * 0.05, type: 'spring', stiffness: 120, damping: 20 }}
                        />
                      </div>
                      <span className="w-8 shrink-0 text-right text-sm text-paper/60">
                        {count}
                      </span>
                    </div>
                  )
                })}
              </div>

              {stats.byFaculty.length > 0 && (
                <div className="mt-12">
                  <h2
                    className="mb-4 text-2xl text-paper"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {t('statsByFaculty')}
                  </h2>
                  <div className="space-y-3">
                    {stats.byFaculty.map((row) => (
                      <div key={row.faculty}>
                        <div className="mb-1 flex items-center justify-between text-sm text-paper/70">
                          <span>{row.faculty}</span>
                          <span className="text-paper/50">{row.total}</span>
                        </div>
                        <div className="flex h-3 overflow-hidden rounded-sm bg-white/5">
                          {MOOD_TYPES.map((mood) => {
                            const count = row.distribution[mood] ?? 0
                            const width = row.total > 0 ? (count / row.total) * 100 : 0
                            if (width <= 0) return null
                            return (
                              <div
                                key={mood}
                                style={{ width: `${width}%`, backgroundColor: MOOD_META[mood].color }}
                                title={`${t(MOOD_LABEL_KEYS[mood])}: ${count}`}
                              />
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  )
}
