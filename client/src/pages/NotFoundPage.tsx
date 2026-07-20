import { Link } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { useLocale } from '@/context/LocaleContext'

export function NotFoundPage() {
  const { t } = useLocale()

  return (
    <Layout variant="plain">
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center">
        <h1 className="text-5xl" style={{ fontFamily: 'var(--font-display)' }}>
          🧷
        </h1>
        <p className="text-paper/70">{t('notFoundMessage')}</p>
        <Link to="/" className="font-semibold text-brass-400 hover:underline">
          {t('notFoundBack')}
        </Link>
      </div>
    </Layout>
  )
}
