import { useEffect, useRef } from 'react'
import confetti from 'canvas-confetti'
import { Layout } from '@/components/Layout'
import { PinIcon } from '@/components/PinIcon'

const TENOR_EMBED_SRC = 'https://tenor.com/embed.js'

/** Fire a short fireworks-style burst from one side of the screen. */
function fireFirework(originX: number) {
  confetti({
    particleCount: 60,
    spread: 70,
    startVelocity: 45,
    origin: { x: originX, y: 0.7 },
    colors: ['#ff6b35', '#f7c948', '#2ec4b6', '#e63946', '#457b9d'],
    ticks: 200,
    gravity: 1.1,
    scalar: 1.1,
  })
}

/** Launch a few staggered bursts so it feels like fireworks, not just confetti. */
function launchFireworks() {
  const delays = [0, 250, 500, 800]
  const origins = [0.2, 0.8, 0.35, 0.65]
  delays.forEach((delay, i) => {
    window.setTimeout(() => fireFirework(origins[i] ?? 0.5), delay)
  })
}

export function SixSevenPage() {
  const didLaunch = useRef(false)

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

  // Auto-launch fireworks once when the page mounts.
  useEffect(() => {
    if (didLaunch.current) return
    didLaunch.current = true
    const timer = window.setTimeout(launchFireworks, 400)
    return () => window.clearTimeout(timer)
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
          <button
            type="button"
            onClick={launchFireworks}
            className="mt-6 rounded-sm bg-ink px-4 py-2 text-sm font-medium text-paper transition hover:opacity-90"
          >
            ยิงพลุอีกครั้ง
          </button>
        </div>
      </div>
    </Layout>
  )
}
