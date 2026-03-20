import type { Metadata } from "next"
import { api, normalizeList } from "@/lib/api"
import { AnimeGrid } from "@/components/anime/AnimeGrid"
import { SectionHeader } from "@/components/ui/SectionHeader"
import { Pagination } from "@/components/ui/Pagination"
import Link from "next/link"

export const metadata: Metadata = { title: "Semua Donghua" }

interface Props {
  searchParams: { [k: string]: string | string[] | undefined }
}

export default async function AnimePage({ searchParams }: Props) {
  const page   = Math.max(1, parseInt(searchParams.page as string || "1"))
  const order  = (searchParams.order as string) || "title"
  const status = (searchParams.status as string) || ""

  const data  = await api.animeList(page, order, status)
  const items = normalizeList(data)

  const orderOpts  = [{ v: "title", l: "A–Z" }, { v: "latest", l: "Terbaru" }, { v: "rating", l: "Rating" }]
  const statusOpts = [{ v: "", l: "Semua" }, { v: "ongoing", l: "Ongoing" }, { v: "completed", l: "Tamat" }]

  const url = (p: number, o = order, s = status) =>
    `/anime?page=${p}&order=${o}&status=${s}`

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-10">
      <SectionHeader title="Semua Donghua" subtitle="Koleksi lengkap donghua subtitle Indonesia" />

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-8">
        <div className="flex items-center gap-2">
          <span className="text-xs" style={{ color: "#3a3a5c" }}>Urutkan:</span>
          <div className="flex gap-1.5">
            {orderOpts.map(o => (
              <Link key={o.v} href={url(1, o.v, status)}
                className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
                style={{
                  background: order === o.v ? "#e8365d" : "#141425",
                  color: order === o.v ? "#fff" : "#6b6b90",
                  border: `1px solid ${order === o.v ? "#e8365d" : "#1e1e32"}`,
                }}>{o.l}</Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs" style={{ color: "#3a3a5c" }}>Status:</span>
          <div className="flex gap-1.5">
            {statusOpts.map(s => (
              <Link key={s.v} href={url(1, order, s.v)}
                className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
                style={{
                  background: status === s.v ? "#e8365d" : "#141425",
                  color: status === s.v ? "#fff" : "#6b6b90",
                  border: `1px solid ${status === s.v ? "#e8365d" : "#1e1e32"}`,
                }}>{s.l}</Link>
            ))}
          </div>
        </div>
      </div>

      {data.error && (
        <div className="rounded-xl p-4 mb-6"
          style={{ background: "rgba(232,54,93,0.08)", border: "1px solid rgba(232,54,93,0.2)" }}>
          <p className="text-sm" style={{ color: "#e8365d" }}>Gagal memuat data. Pastikan backend berjalan.</p>
        </div>
      )}

      <AnimeGrid items={items} cols={5} />
      <Pagination page={page} hasNext={items.length >= 20} buildUrl={p => url(p)} />
    </div>
  )
}
