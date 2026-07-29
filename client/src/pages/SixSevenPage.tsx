import { useEffect } from 'react'
import confetti from 'canvas-confetti'
import { Layout } from '@/components/Layout'
import { PinIcon } from '@/components/PinIcon'

const TENOR_EMBED_SRC = 'https://tenor.com/embed.js'

const FIREWORK_COLORS = ['#ff6b35', '#f7c948', '#2ec4b6', '#e63946', '#457b9d']

/** Fire a short fireworks-style burst from one side of the screen. */
function fireFirework(originX: number) {
  confetti({
    particleCount: 80,
    spread: 80,
    startVelocity: 50,
    origin: { x: originX, y: 0.75 },
    colors: FIREWORK_COLORS,
    ticks: 220,
    gravity: 1.05,
    scalar: 1.15,
    zIndex: 9999,
  })
}

/**
 * Launch staggered bursts. Returns timeout ids so the caller can cancel
 * them if the page unmounts (important under React Strict Mode).
 */
function launchFireworks(schedule: (fn: () => void, ms: number) => void) {
  const origins = [0.15, 0.85, 0.3, 0.7, 0.5]
  const delays = [0, 200, 450, 700, 950]
  delays.forEach((delay, i) => {
    schedule(() => fireFirework(origins[i] ?? 0.5), delay)
  })
}

export function SixSevenPage() {
  useEffect(() => {
    document.querySelector(`script[src="${TENOR_EMBED_SRC}"]`)?.remove()
    const script = document.createElement('script')
    script.src = TENOR_EMBED_SRC
    script.async = true
    document.body.appendChild(script)
    return () => {
      script.remove()
    }
  }, [])

  // Auto-launch on mount. Do NOT gate with a ref — Strict Mode runs
  // effect → cleanup → effect, and a ref would skip the second run after
  // the first timeout was already cleared.
  useEffect(() => {
    const timers: number[] = []
    const schedule = (fn: () => void, ms: number) => {
      timers.push(window.setTimeout(fn, ms))
    }

    // Small delay so the page paints first, then fireworks.
    schedule(() => launchFireworks(schedule), 300)

    return () => {
      timers.forEach((id) => window.clearTimeout(id))
    }
  }, [])

  return (
    <Layout variant="plain">
      <div className="cork-texture flex min-h-[calc(100vh-64px)] flex-col items-center justify-center gap-4 px-4 text-center">
        <div className="postit-shadow relative w-full max-w-2xl rounded-sm bg-paper px-4 py-8 text-ink sm:px-6 sm:py-10">
          <div className="pin-shadow absolute -top-3 left-1/2 -translate-x-1/2">
            <PinIcon className="h-7 w-7" />
          </div>
          <div
            className="tenor-gif-embed w-full overflow-hidden rounded-sm"
            data-postid="15087359750872636720"
            data-share-method="host"
            data-aspect-ratio="1.76596"
            data-width="100%"
          >
            <a href="https://tenor.com/view/max-verstappen-f1-formule-1-gif-15087359750872636720">
              Max Verstappen F1 GIF
            </a>
            from{' '}
            <a href="https://tenor.com/search/max+verstappen-gifs">Max Verstappen GIFs</a>
          </div>
        </div>
      </div>
    </Layout>
  )
}
