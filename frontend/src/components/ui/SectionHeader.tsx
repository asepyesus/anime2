import Link from "next/link"
import { ChevronRight } from "lucide-react"

interface Props {
  title: string
  subtitle?: string
  href?: string
  linkLabel?: string
}

export function SectionHeader({ title, subtitle, href, linkLabel = "Lihat semua" }: Props) {
  return (
    <div className="flex items-end justify-between mb-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white"
          style={{ fontFamily: "var(--font-display,Syne,sans-serif)", letterSpacing: "0.01em" }}>
          {title}
        </h2>
        {subtitle && <p className="text-sm mt-1" style={{ color: "#6b6b90" }}>{subtitle}</p>}
      </div>
      {href && (
        <Link href={href}
          className="flex items-center gap-1 text-sm transition-colors hover:text-white group"
          style={{ color: "#6b6b90" }}>
          {linkLabel}
          <ChevronRight size={14} className="transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  )
}
