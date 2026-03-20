import Link from "next/link"
import type { AnimeItem } from "@/types"

interface Props {
  item: AnimeItem
  priority?: boolean
}

export function AnimeCard({ item, priority }: Props) {
  const thumb = item.thumbnail || item.poster || item.cover || ""
  const title = item.title || "Untitled"
  const eps   = item.eps || item.episode || ""
  const isEp  = /episode|eps-|ep-\d/i.test(item.slug || "")
  const href  = isEp ? `/episode/${item.slug}` : `/anime/${item.slug}`

  return (
    <Link href={href} className="group block">
      {/* Poster */}
      <div className="relative overflow-hidden rounded-2xl"
        style={{ aspectRatio: "2/3", background: "#141425" }}>

        {thumb ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumb}
            alt={title}
            loading={priority ? "eager" : "lazy"}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center"
            style={{ fontFamily: "var(--font-display)", fontSize: 40, color: "#1e1e32", fontWeight: 800 }}>
            {title.charAt(0)}
          </div>
        )}

        {/* Gradient */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "linear-gradient(to top,rgba(8,8,16,0.95) 0%,rgba(8,8,16,0.15) 45%,transparent 100%)" }} />

        {/* Episode badge */}
        {eps && (
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-lg text-xs font-semibold"
            style={{ background: "rgba(232,54,93,0.92)", color: "#fff", fontFamily: "var(--font-mono)" }}>
            Ep {eps}
          </div>
        )}

        {/* Type badge */}
        {item.type && (
          <div className="absolute top-2 right-2 px-2 py-0.5 rounded-lg text-xs"
            style={{ background: "rgba(8,8,16,0.88)", color: "#6b6b90", border: "1px solid #1e1e32" }}>
            {item.type}
          </div>
        )}

        {/* Play overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ background: "rgba(232,54,93,0.92)", backdropFilter: "blur(8px)" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>

        {/* Ongoing dot */}
        {item.status?.toLowerCase().includes("ongoing") && (
          <div className="absolute bottom-2 left-2 flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#00d4a8", animation: "pulse 2s ease-in-out infinite" }} />
            <span className="text-xs font-medium" style={{ color: "#00d4a8" }}>Ongoing</span>
          </div>
        )}
      </div>

      {/* Title */}
      <div className="mt-2.5 px-0.5">
        <p className="text-sm font-medium leading-snug line-clamp-2 transition-colors group-hover:text-white"
          style={{ color: "#c8c8e8" }}>
          {title}
        </p>
        {(item.rating || item.score) && (
          <p className="text-xs mt-0.5" style={{ color: "#f59e0b" }}>
            ★ {item.rating || item.score}
          </p>
        )}
      </div>
    </Link>
  )
}
