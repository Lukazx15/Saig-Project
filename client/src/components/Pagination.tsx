import type { PaginationMeta } from '@/types'
import { useLocale } from '@/context/LocaleContext'

interface PaginationProps {
  pagination: PaginationMeta
  onPageChange: (page: number) => void
}

export function Pagination({ pagination, onPageChange }: PaginationProps) {
  const { t } = useLocale()
  const { page, totalPages, total } = pagination
  if (totalPages <= 1) return null

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1,
  )

  return (
    <div className="flex flex-wrap items-center justify-center gap-1.5 py-6">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        className="rounded-sm border border-white/15 px-3 py-1.5 text-sm text-paper/80 disabled:opacity-30 hover:bg-white/10"
      >
        {t('paginationPrev')}
      </button>

      {pages.map((p, idx) => (
        <span key={p} className="flex items-center">
          {idx > 0 && pages[idx - 1] !== p - 1 && (
            <span className="px-1 text-paper/40">…</span>
          )}
          <button
            type="button"
            onClick={() => onPageChange(p)}
            className={`h-8 min-w-8 rounded-sm px-2 text-sm font-medium transition ${
              p === page ? 'bg-brass-500 text-ink' : 'text-paper/70 hover:bg-white/10'
            }`}
          >
            {p}
          </button>
        </span>
      ))}

      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        className="rounded-sm border border-white/15 px-3 py-1.5 text-sm text-paper/80 disabled:opacity-30 hover:bg-white/10"
      >
        {t('paginationNext')}
      </button>

      <span className="ml-2 text-xs text-paper/50">{t('paginationTotal', { n: total })}</span>
    </div>
  )
}
