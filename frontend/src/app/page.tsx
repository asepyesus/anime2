import { api, normalizeHomeSections, normalizeList } from "@/lib/api"
import { AnimeGrid } from "@/components/anime/AnimeGrid"
import { SectionHeader } from "@/components/ui/SectionHeader"
import Link from "next/link"

export const revalidate = 180

export default async function HomePage() {
  const homeData = await api.home(1)
  const sections = normalizeHomeSections(homeData)

  const getSection = (name: string) =>
    sections.find(s => s.section === name)?.cards ||
    sections.find(s => s.section?.includes(name.split("_")[0]))?.cards || []

  const latest  = getSection("latest_release")
  const popular = getSection("popular_today")
  const all = latest.length ? latest : normalizeList(homeData)

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6">

      {/* ── HERO ── */}
      <section className="relative mb-16 overflow-hidden rounded-3xl"
        style={{ background: "#0f0f1a", border: "1px solid #1e1e32" }}>

        {/* Decorative grid */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: "linear-gradient(rgba(232,54,93,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(232,54,93,0.04) 1px,transparent 1px)",
          backgroundSize: "52px 52px",
        }}/>

        {/* Glow blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div style={{
            position: "absolute", top: "-20%", left: "-10%", width: "60%", height: "100%",
            background: "radial-gradient(ellipse at center,rgba(232,54,93,0.1) 0%,transparent 60%)",
          }}/>
          <div style={{
            position: "absolute", bottom: "-30%", right: "-5%", width: "50%", height: "80%",
            background: "radial-gradient(ellipse at center,rgba(0,212,168,0.05) 0%,transparent 60%)",
          }}/>
        </div>

        <div className="relative px-8 py-16 sm:px-14 sm:py-20 flex flex-col gap-6" style={{ maxWidth: 680 }}>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#e8365d" }}/>
            <span className="text-xs tracking-widest uppercase"
              style={{ color: "#e8365d", fontFamily: "var(--font-mono)" }}>
              Update Harian
            </span>
          </div>

          <h1 style={{
            fontFamily: "var(--font-display,Syne,sans-serif)",
            fontSize: "clamp(2.8rem,6vw,5.5rem)",
            fontWeight: 800, lineHeight: 0.95, letterSpacing: "-0.01em", color: "#fff",
          }}>
            NONTON<br />
            <span style={{ color: "#e8365d" }}>DONGHUA</span><br />
            SUB INDO
          </h1>

          <p style={{ color: "#6b6b90", fontSize: "0.95rem", lineHeight: 1.75, maxWidth: 380 }}>
            Ribuan judul donghua subtitle Indonesia. Gratis, tanpa registrasi, update setiap hari.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link href="/anime"
              className="px-6 py-3 rounded-xl text-sm font-semibold transition-all hover:scale-105 hover:opacity-90"
              style={{ background: "#e8365d", color: "#fff", boxShadow: "0 0 24px rgba(232,54,93,0.35)" }}>
              Jelajahi Donghua
            </Link>
            <Link href="/genre"
              className="px-6 py-3 rounded-xl text-sm font-medium transition-all hover:bg-white/10"
              style={{ background: "rgba(255,255,255,0.06)", color: "#c8c8e8", border: "1px solid #1e1e32" }}>
              Lihat Genre
            </Link>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 pt-2">
            {[["1000+","Judul"],["Harian","Update"],["100%","Gratis"]].map(([v,l]) => (
              <div key={l}>
                <div className="text-lg font-bold text-white"
                  style={{ fontFamily: "var(--font-display,Syne,sans-serif)" }}>{v}</div>
                <div className="text-xs" style={{ color: "#3a3a5c" }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LATEST ── */}
      {all.length > 0 && (
        <section className="mb-14">
          <SectionHeader title="Update Terbaru" subtitle="Episode baru yang baru ditambahkan" href="/anime" />
          <AnimeGrid items={all.slice(0, 10)} cols={5} priority />
        </section>
      )}

      {/* ── POPULAR ── */}
      {popular.length > 0 && (
        <section className="mb-14">
          <SectionHeader title="Populer Hari Ini" subtitle="Paling banyak ditonton sekarang" href="/anime" />
          <AnimeGrid items={popular.slice(0, 10)} cols={5} />
        </section>
      )}

      {/* ── EMPTY STATE ── */}
      {!all.length && !popular.length && (
        <div className="rounded-2xl p-16 text-center mb-14"
          style={{ background: "#0f0f1a", border: "1px dashed #1e1e32" }}>
          <p className="text-sm" style={{ color: "#3a3a5c" }}>
            Pastikan API backend berjalan di{" "}
            <span style={{ fontFamily: "var(--font-mono)", color: "#6b6b90" }}>
              {process.env.NEXT_PUBLIC_API_URL}
            </span>
          </p>
        </div>
      )}
    </div>
  )
}
