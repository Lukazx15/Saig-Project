import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Layout } from '@/components/Layout'
import { MoodDonut } from '@/components/MoodDonut'
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
    setIsLoading(true)
    setError(null)
    fetchStats()
      .then((data) => {
        if (mounted) setStats(data)
      })
      .catch((err) => {
        if (mounted) {
          setError(err instanceof Error ? err.message : t('statsFailed'))
        }
      })
      .finally(() => {
        if (mounted) setIsLoading(false)
      })
    return () => {
      mounted = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const dominant = stats?.dominantMood
  const dominantMeta = dominant ? MOOD_META[dominant] : null
  const maxCount = stats ? Math.max(1, ...MOOD_TYPES.map((m) => stats.distribution[m])) : 1

  return (
    <Layout variant="plain">
      <div
        className="cork-texture min-h-[calc(100vh-64px)] px-4 py-10 sm:px-6"
        style={
          dominantMeta
            ? {
                boxShadow: `inset 0 120px 160px -120px ${dominantMeta.tint}`,
              }
            : undefined
        }
      >
        <div className="mx-auto max-w-4xl">
          <h1
            className="text-3xl text-paper sm:text-4xl"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {t('statsTitle')}
          </h1>
          <p
            className="mt-2 text-paper/75"
            style={{ fontFamily: 'var(--font-hand)' }}
          >
            {t('statsSubtitle')}
          </p>

          {isLoading && <p className="mt-10 text-paper/60">{t('statsLoading')}</p>}
          {error && (
            <p className="mt-10 rounded-sm bg-red-900/30 px-3 py-2 text-red-100">{error}</p>
          )}

          {stats && (
            <>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="postit-shadow mt-8 grid gap-8 rounded-sm bg-paper p-5 text-ink sm:grid-cols-[minmax(0,280px)_1fr] sm:items-center sm:gap-10 sm:p-7"
              >
                <MoodDonut
                  distribution={stats.distribution}
                  total={stats.totalMoods}
                  dominantMood={stats.dominantMood}
                />

                <div>
                  <p className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft">
                    {t('statsDistribution')}
                  </p>
                  <div className="space-y-2.5">
                    {MOOD_TYPES.map((mood, i) => {
                      const meta = MOOD_META[mood]
                      const count = stats.distribution[mood]
                      const share =
                        stats.totalMoods > 0
                          ? Math.round((count / stats.totalMoods) * 100)
                          : 0
                      const barPct = Math.max(count > 0 ? 6 : 0, (count / maxCount) * 100)
                      return (
                        <div key={mood} className="flex items-center gap-3">
                          <span
                            className="h-2.5 w-2.5 shrink-0 rounded-sm"
                            style={{ backgroundColor: meta.color }}
                            aria-hidden="true"
                          />
                          <span className="w-24 shrink-0 text-sm text-ink-soft sm:w-28">
                            {t(MOOD_LABEL_KEYS[mood])}
                          </span>
                          <div className="h-2 flex-1 overflow-hidden rounded-sm bg-ink/10">
                            <motion.div
                              className="h-full rounded-sm"
                              style={{ backgroundColor: meta.color }}
                              initial={{ width: 0 }}
                              animate={{ width: `${barPct}%` }}
                              transition={{
                                delay: 0.15 + i * 0.04,
                                type: 'spring',
                                stiffness: 140,
                                damping: 22,
                              }}
                            />
                          </div>
                          <span className="w-14 shrink-0 text-right text-sm tabular-nums text-ink-soft">
                            {count}
                            <span className="ml-1 text-[11px] text-ink-soft/60">{share}%</span>
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </motion.div>

              {stats.byFaculty.length > 0 && (
                <div className="mt-12">
                  <h2
                    className="mb-4 text-2xl text-paper"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {t('statsByFaculty')}
                  </h2>
                  <div className="space-y-3 rounded-sm border border-cork-900/40 bg-cork-900/40 p-4">
                    {stats.byFaculty.map((row) => (
                      <div key={row.faculty}>
                        <div className="mb-1 flex items-center justify-between text-sm text-paper/75">
                          <span>{row.faculty}</span>
                          <span className="text-paper/50">{row.total}</span>
                        </div>
                        <div className="flex h-3 overflow-hidden rounded-sm bg-night-950/50">
                          {MOOD_TYPES.map((mood) => {
                            const count = row.distribution[mood] ?? 0
                            const width = row.total > 0 ? (count / row.total) * 100 : 0
                            if (width <= 0) return null
                            return (
                              <div
                                key={mood}
                                style={{
                                  width: `${width}%`,
                                  backgroundColor: MOOD_META[mood].color,
                                }}
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
