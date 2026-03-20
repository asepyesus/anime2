import type { Metadata } from "next"
import { api, normalizeList } from "@/lib/api"
import { SectionHeader } from "@/components/ui/SectionHeader"
import { GenreGrid } from "@/components/ui/GenreGrid"

export const metadata: Metadata = { title: "Genre Donghua" }

export default async function GenrePage() {
  const data   = await api.genres()
  const genres = normalizeList(data)

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-10">
      <SectionHeader title="Semua Genre" subtitle="Temukan donghua berdasarkan genre favorit" />

      {data.error && (
        <div className="rounded-xl p-4 mb-8"
          style={{ background: "rgba(232,54,93,0.08)", border: "1px solid rgba(232,54,93,0.2)" }}>
          <p className="text-sm" style={{ color: "#e8365d" }}>Gagal memuat genre.</p>
        </div>
      )}

      <GenreGrid genres={genres} />
    </div>
  )
}
