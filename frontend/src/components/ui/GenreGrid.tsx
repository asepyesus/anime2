"use client"
import Link from "next/link"
import { Tag } from "lucide-react"

interface Genre { name: string; slug: string; url?: string }

interface Props { genres: Genre[] }

export function GenreGrid({ genres }: Props) {
  if (!genres.length) return (
    <div className="rounded-2xl p-16 text-center" style={{ background: "#0f0f1a", border: "1px dashed #1e1e32" }}>
      <Tag size={28} className="mx-auto mb-3" style={{ color: "#1e1e32" }} />
      <p className="text-sm" style={{ color: "#3a3a5c" }}>Tidak ada genre tersedia.</p>
    </div>
  )

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
      {genres.map((g) => (
        <Link key={g.slug} href={`/genre/${g.slug}`}
          className="group flex items-center gap-2.5 px-4 py-3.5 rounded-2xl transition-all"
          style={{ background: "#0f0f1a", border: "1px solid #1e1e32" }}
          onMouseEnter={e => {
            e.currentTarget.style.background = "rgba(232,54,93,0.08)"
            e.currentTarget.style.borderColor = "rgba(232,54,93,0.2)"
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = "#0f0f1a"
            e.currentTarget.style.borderColor = "#1e1e32"
          }}>
          <Tag size={13} style={{ color: "#e8365d", flexShrink: 0 }} />
          <span className="text-sm font-medium truncate transition-colors group-hover:text-white"
            style={{ color: "#6b6b90" }}>
            {g.name}
          </span>
        </Link>
      ))}
    </div>
  )
}
