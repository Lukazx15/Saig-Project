import { Link } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { PinIcon } from '@/components/PinIcon'
import { useLocale } from '@/context/LocaleContext'

export function NotFoundPage() {
  const { t } = useLocale()

  return (
    <Layout variant="plain">
      <div className="cork-texture flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
        <div className="postit-shadow relative w-full max-w-xs rounded-sm bg-paper px-6 py-10 text-ink">
          <div className="pin-shadow absolute -top-3 left-1/2 -translate-x-1/2">
            <PinIcon className="h-7 w-7" />
          </div>
          <p
            className="text-lg leading-snug"
            style={{ fontFamily: 'var(--font-hand)' }}
          >
            {t('notFoundMessage')}
          </p>
          <Link
            to="/"
            className="mt-5 inline-block text-sm font-semibold text-cork-800 underline-offset-2 hover:underline"
          >
            {t('notFoundBack')}
          </Link>
        </div>
      </div>
    </Layout>
  )
}
