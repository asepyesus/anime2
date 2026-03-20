import type { Metadata } from "next"
import { api, normalizeList } from "@/lib/api"
import { AnimeGrid } from "@/components/anime/AnimeGrid"
import { Search } from "lucide-react"

interface Props {
  searchParams: { [k: string]: string | string[] | undefined }
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const q = searchParams.q as string || ""
  return { title: q ? `Cari: ${q}` : "Pencarian" }
}

export default async function SearchPage({ searchParams }: Props) {
  const q     = ((searchParams.q as string) || "").trim()
  let items   = []
  let error   = ""

  if (q) {
    const data = await api.search(q)
    items = normalizeList(data)
    error = data.error || ""
  }

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center gap-3 mb-8">
        <Search size={20} style={{ color: "#e8365d" }} />
        <h1 className="text-3xl font-bold text-white"
          style={{ fontFamily: "var(--font-display,Syne,sans-serif)" }}>
          {q ? `Hasil: "${q}"` : "Pencarian"}
        </h1>
      </div>

      {q && (
        <p className="text-sm mb-6" style={{ color: "#6b6b90" }}>
          {items.length > 0 ? `${items.length} hasil ditemukan` : "Tidak ada hasil"}
        </p>
      )}

      {!q && (
        <div className="rounded-2xl p-16 text-center" style={{ background: "#0f0f1a", border: "1px dashed #1e1e32" }}>
          <Search size={32} className="mx-auto mb-4" style={{ color: "#1e1e32" }} />
          <p className="text-sm" style={{ color: "#3a3a5c" }}>Gunakan kotak pencarian di navbar untuk mencari donghua.</p>
        </div>
      )}

      {error && (
        <div className="rounded-xl p-4 mb-6"
          style={{ background: "rgba(232,54,93,0.08)", border: "1px solid rgba(232,54,93,0.2)" }}>
          <p className="text-sm" style={{ color: "#e8365d" }}>Pencarian gagal. Coba lagi.</p>
        </div>
      )}

      {q && !error && <AnimeGrid items={items} cols={5} />}
    </div>
  )
}
