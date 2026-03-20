import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { api } from "@/lib/api"
import { EpisodeList } from "@/components/anime/EpisodeList"
import { Star, Play, Layers, ChevronLeft } from "lucide-react"

interface Props { params: { slug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { result } = await api.animeDetail(params.slug)
  return {
    title: result?.title || "Detail Anime",
    description: (result?.synopsis || result?.description || "").slice(0, 160),
  }
}

export default async function AnimeDetailPage({ params }: Props) {
  const { result, error } = await api.animeDetail(params.slug)
  if (!result || error) notFound()

  const episodes = (result.episode || result.episodes || []) as any[]
  const thumb    = result.thumbnail || result.poster || ""
  const synopsis = result.synopsis || result.description || result.overview || ""
  const genres   = result.genres || []

  const latestEp = episodes[episodes.length - 1]
  const firstEp  = episodes[0]

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8">

      <Link href="/anime"
        className="inline-flex items-center gap-2 text-sm mb-8 transition-colors hover:text-white"
        style={{ color: "#3a3a5c" }}>
        <ChevronLeft size={14} /> Semua Donghua
      </Link>

      {/* Hero card */}
      <div className="relative rounded-3xl overflow-hidden mb-10"
        style={{ background: "#0f0f1a", border: "1px solid #1e1e32" }}>

        {/* Blurred bg */}
        {thumb && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={thumb} alt="" className="w-full h-full object-cover opacity-10"
              style={{ filter: "blur(40px)", transform: "scale(1.2)" }} />
            <div className="absolute inset-0"
              style={{ background: "linear-gradient(to right,rgba(15,15,26,0.98),rgba(15,15,26,0.75) 60%,rgba(15,15,26,0.4))" }} />
          </div>
        )}

        <div className="relative flex flex-col md:flex-row gap-8 p-6 sm:p-10">
          {/* Poster */}
          <div className="shrink-0 mx-auto md:mx-0">
            <div className="relative overflow-hidden rounded-2xl"
              style={{ width: 200, height: 300, background: "#141425", boxShadow: "0 24px 60px rgba(0,0,0,0.7)" }}>
              {thumb ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={thumb} alt={result.title} className="w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center"
                  style={{ fontFamily: "var(--font-display)", fontSize: 52, color: "#1e1e32", fontWeight: 800 }}>
                  {result.title?.charAt(0)}
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="flex flex-col gap-4 text-center md:text-left">
            <div>
              <span className="inline-block px-2.5 py-0.5 rounded-lg text-xs font-semibold mb-3"
                style={{ background: "rgba(232,54,93,0.15)", color: "#e8365d", border: "1px solid rgba(232,54,93,0.25)" }}>
                DONGHUA
              </span>
              <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight"
                style={{ fontFamily: "var(--font-display)" }}>
                {result.title}
              </h1>
            </div>

            {/* Meta badges */}
            <div className="flex flex-wrap items-center gap-2 justify-center md:justify-start">
              {result.rating && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl"
                  style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)" }}>
                  <Star size={11} fill="#f59e0b" stroke="none" />
                  <span className="text-sm font-semibold" style={{ color: "#f59e0b" }}>{result.rating}</span>
                </div>
              )}
              {result.status && (
                <span className="px-2.5 py-1 rounded-xl text-xs"
                  style={{
                    background: result.status.toLowerCase().includes("ongoing") ? "rgba(0,212,168,0.1)" : "#141425",
                    color: result.status.toLowerCase().includes("ongoing") ? "#00d4a8" : "#6b6b90",
                    border: `1px solid ${result.status.toLowerCase().includes("ongoing") ? "rgba(0,212,168,0.2)" : "#1e1e32"}`,
                  }}>
                  {result.status}
                </span>
              )}
              {result.type && (
                <span className="px-2.5 py-1 rounded-xl text-xs"
                  style={{ background: "#141425", color: "#6b6b90", border: "1px solid #1e1e32" }}>
                  {result.type}
                </span>
              )}
              {episodes.length > 0 && (
                <div className="flex items-center gap-1.5 text-xs" style={{ color: "#6b6b90" }}>
                  <Layers size={12} /> {episodes.length} Episode
                </div>
              )}
            </div>

            {/* Genres */}
            {genres.length > 0 && (
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                {genres.map((g: any) => {
                  const name = typeof g === "string" ? g : g.name
                  return (
                    <Link key={name} href={`/genre/${name.toLowerCase().replace(/\s+/g,"-")}`}
                      className="px-3 py-1 rounded-xl text-xs transition-all hover:scale-105"
                      style={{ background: "#141425", color: "#6b6b90", border: "1px solid #1e1e32" }}>
                      {name}
                    </Link>
                  )
                })}
              </div>
            )}

            {/* Synopsis */}
            {synopsis && (
              <p className="text-sm leading-relaxed" style={{ color: "#6b6b90", maxWidth: 540 }}>
                {synopsis}
              </p>
            )}

            {/* Buttons */}
            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              {latestEp && (
                <Link href={`/episode/${latestEp.slug}`}
                  className="flex items-center gap-2.5 px-6 py-3 rounded-xl text-sm font-semibold transition-all hover:scale-105"
                  style={{ background: "#e8365d", color: "#fff", boxShadow: "0 0 24px rgba(232,54,93,0.35)" }}>
                  <Play size={16} fill="#fff" /> Episode Terbaru
                </Link>
              )}
              {firstEp && episodes.length > 1 && (
                <Link href={`/episode/${firstEp.slug}`}
                  className="flex items-center gap-2.5 px-6 py-3 rounded-xl text-sm font-medium transition-all hover:bg-white/10"
                  style={{ background: "rgba(255,255,255,0.06)", color: "#c8c8e8", border: "1px solid #1e1e32" }}>
                  Mulai dari Ep 1
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Episodes */}
      {episodes.length > 0 ? (
        <div>
          <h2 className="text-xl font-bold text-white mb-5" style={{ fontFamily: "var(--font-display)" }}>
            Daftar Episode
          </h2>
          <EpisodeList episodes={episodes} />
        </div>
      ) : (
        <div className="rounded-2xl p-10 text-center"
          style={{ background: "#0f0f1a", border: "1px dashed #1e1e32" }}>
          <p className="text-sm" style={{ color: "#3a3a5c" }}>Belum ada episode tersedia.</p>
        </div>
      )}
    </div>
  )
}
