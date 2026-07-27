import { Layout } from '@/components/Layout'
import { PinIcon } from '@/components/PinIcon'

export function SixSevenPage() {
  return (
    <Layout variant="plain">
      <div className="cork-texture flex min-h-[calc(100vh-64px)] flex-col items-center justify-center gap-4 px-4 text-center">
        <div className="postit-shadow relative w-full max-w-2xl rounded-sm bg-paper px-4 py-8 text-ink sm:px-6 sm:py-10">
          <div className="pin-shadow absolute -top-3 left-1/2 -translate-x-1/2">
            <PinIcon className="h-7 w-7" />
          </div>
          <div className="relative aspect-video w-full overflow-hidden rounded-sm">
            <iframe
              className="absolute inset-0 h-full w-full"
              src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=1"
              title="67"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
        </div>
      </div>
    </Layout>
  )
}
