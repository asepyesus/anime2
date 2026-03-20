import type { Metadata } from "next"
import Link from "next/link"
import { api } from "@/lib/api"
import { VideoPlayer } from "@/components/player/VideoPlayer"
import { EpisodeList } from "@/components/anime/EpisodeList"
import { ChevronLeft, ChevronRight, Home, List } from "lucide-react"

interface Props { params: { slug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { result } = await api.episode(params.slug)
  return { title: result?.title || "Nonton Episode" }
}

export default async function EpisodePage({ params }: Props) {
  const { slug } = params

  // Fetch episode info
  const { result: ep } = await api.episode(slug)

  // Derive series slug
  const animeSlug = slug
    .replace(/-subtitle-indonesia.*$/i, "")
    .replace(/-sub-indo.*$/i, "")
    .replace(/-episode-\d+.*$/i, "")
    .replace(/-eps-\d+.*$/i, "")
    .replace(/-ep-\d+.*$/i, "")
    .replace(/-tamat.*$/i, "")
    .replace(/-+$/, "")

  // Fetch series for episode list
  const { result: anime } = await api.animeDetail(animeSlug)
  const episodes = (anime?.episode || anime?.episodes || []) as any[]
  const seriesTitle = anime?.title || ep?.title?.split(" Episode")[0] || ""

  const prevSlug = ep?.prev_episode?.slug
  const nextSlug = ep?.next_episode?.slug
  const epMatch  = slug.match(/episode-(\d+)/i) || slug.match(/-e?p?s?-?(\d+)/i)
  const epNum    = epMatch?.[1] || "?"

  return (
    <div className="max-w-screen-xl mx-auto px-0 sm:px-6 py-4 sm:py-8">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 px-4 sm:px-0 mb-4 flex-wrap text-xs"
        style={{ color: "#3a3a5c" }}>
        <Link href="/" className="transition-colors hover:text-white"><Home size={13} /></Link>
        <span style={{ color: "#1e1e32" }}>/</span>
        <Link href={`/anime/${animeSlug}`}
          className="transition-colors hover:text-white truncate max-w-[150px]">
          {seriesTitle || animeSlug}
        </Link>
        <span style={{ color: "#1e1e32" }}>/</span>
        <span style={{ color: "#6b6b90" }}>Ep {epNum}</span>
      </nav>

      {/* Title */}
      <h1 className="px-4 sm:px-0 mb-5 text-xl sm:text-2xl font-bold leading-tight"
        style={{ fontFamily: "var(--font-display)", color: "#fff" }}>
        {seriesTitle && <span style={{ color: "#e8365d" }}>{seriesTitle}</span>}
        {seriesTitle ? ` — Episode ${epNum}` : `Episode ${epNum}`}
      </h1>

      {/* Grid layout: player + sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">

        {/* Left */}
        <div className="flex flex-col gap-5">

          {/* ★ VIDEO PLAYER — fetches /api/video/[slug] which filters out anichin.moe iframes */}
          <VideoPlayer slug={slug} title={ep?.title || `Episode ${epNum}`} />

          {/* Prev / Next */}
          <div className="flex items-center justify-between gap-3 px-0">
            {prevSlug ? (
              <Link href={`/episode/${prevSlug}`}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:bg-white/5 group shrink-0"
                style={{ border: "1px solid #1e1e32", color: "#6b6b90" }}>
                <ChevronLeft size={15} className="transition-transform group-hover:-translate-x-0.5" />
                Sebelumnya
              </Link>
            ) : <div />}

            <Link href={`/anime/${animeSlug}`}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs transition-all hover:bg-white/5"
              style={{ border: "1px solid #1e1e32", color: "#6b6b90" }}>
              <List size={13} /> Semua Ep
            </Link>

            {nextSlug ? (
              <Link href={`/episode/${nextSlug}`}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90 shrink-0"
                style={{ background: "#e8365d", color: "#fff", boxShadow: "0 0 14px rgba(232,54,93,0.3)" }}>
                Selanjutnya
                <ChevronRight size={15} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
            ) : <div />}
          </div>

          {/* Info strip */}
          <div className="rounded-2xl px-5 py-4 grid grid-cols-2 sm:grid-cols-3 gap-4"
            style={{ background: "#0f0f1a", border: "1px solid #1e1e32" }}>
            {[
              { label: "Serial", value: seriesTitle || "-" },
              { label: "Episode", value: `Episode ${epNum}` },
              { label: "Subtitle", value: "Indonesia" },
            ].map(it => (
              <div key={it.label}>
                <p className="text-xs mb-1" style={{ color: "#3a3a5c" }}>{it.label}</p>
                <p className="text-sm font-medium text-white truncate">{it.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right: episode list */}
        {episodes.length > 0 && (
          <div className="lg:sticky lg:top-20 lg:self-start px-4 sm:px-0">
            <EpisodeList episodes={episodes} currentSlug={slug} animeSlug={animeSlug} />
          </div>
        )}
      </div>
    </div>
  )
}
