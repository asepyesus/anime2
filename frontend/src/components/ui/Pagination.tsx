import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface Props {
  page: number
  hasNext: boolean
  buildUrl: (p: number) => string
}

export function Pagination({ page, hasNext, buildUrl }: Props) {
  if (page === 1 && !hasNext) return null
  return (
    <div className="flex items-center justify-center gap-3 mt-12">
      {page > 1 && (
        <Link href={buildUrl(page - 1)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm transition-all hover:bg-white/5"
          style={{ border: "1px solid #1e1e32", color: "#6b6b90" }}>
          <ChevronLeft size={14} /> Sebelumnya
        </Link>
      )}
      <span className="px-4 py-2 rounded-xl text-sm"
        style={{ background: "#141425", color: "#e8365d", fontFamily: "var(--font-mono)" }}>
        {page}
      </span>
      {hasNext && (
        <Link href={buildUrl(page + 1)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm transition-all hover:bg-white/5"
          style={{ border: "1px solid #1e1e32", color: "#6b6b90" }}>
          Berikutnya <ChevronRight size={14} />
        </Link>
      )}
    </div>
  )
}
