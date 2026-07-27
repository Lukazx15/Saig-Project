import { useEffect } from 'react'
import { Layout } from '@/components/Layout'
import { PinIcon } from '@/components/PinIcon'

const TENOR_EMBED_SRC = 'https://tenor.com/embed.js'

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
