import Link from "next/link"
import type { EpisodeItem } from "@/types"
import { Play } from "lucide-react"

interface Props {
  episodes: EpisodeItem[]
  currentSlug?: string
  animeSlug?: string
}

export function EpisodeList({ episodes, currentSlug, animeSlug }: Props) {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "#0f0f1a", border: "1px solid #1e1e32" }}>
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "#1e1e32" }}>
        <h3 className="text-sm font-semibold text-white">Daftar Episode</h3>
        <span className="text-xs" style={{ color: "#3a3a5c", fontFamily: "var(--font-mono)" }}>
          {episodes.length} eps
        </span>
      </div>
      <div className="overflow-y-auto" style={{ maxHeight: 360 }}>
        {episodes.map((ep, i) => {
          const active = ep.slug === currentSlug
          const href = `/episode/${ep.slug}`
          return (
            <Link key={ep.slug} href={href}
              className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-white/5"
              style={{
                background: active ? "rgba(232,54,93,0.08)" : "transparent",
                borderLeft: `2px solid ${active ? "#e8365d" : "transparent"}`,
              }}>
              <Play size={11} style={{ color: active ? "#e8365d" : "#3a3a5c", flexShrink: 0 }}
                fill={active ? "#e8365d" : "none"} />
              <span className="text-sm truncate"
                style={{ color: active ? "#e8365d" : "#6b6b90" }}>
                {ep.subtitle || ep.name || ep.title || `Episode ${ep.episode || episodes.length - i}`}
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
