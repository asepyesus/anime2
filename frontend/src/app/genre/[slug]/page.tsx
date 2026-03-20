import type { Metadata } from "next"
import Link from "next/link"
import { api, normalizeList } from "@/lib/api"
import { AnimeGrid } from "@/components/anime/AnimeGrid"
import { SectionHeader } from "@/components/ui/SectionHeader"
import { Pagination } from "@/components/ui/Pagination"

interface Props {
  params: { slug: string }
  searchParams: { [k: string]: string | string[] | undefined }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const name = params.slug.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
  return { title: `Genre: ${name}` }
}

export default async function GenreDetailPage({ params, searchParams }: Props) {
  const page  = Math.max(1, parseInt(searchParams.page as string || "1"))
  const data  = await api.genre(params.slug, page)
  const items = normalizeList(data)
  const name  = params.slug.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-10">
      <nav className="flex items-center gap-2 mb-6 text-sm" style={{ color: "#3a3a5c" }}>
        <Link href="/genre" className="transition-colors hover:text-white">Genre</Link>
        <span style={{ color: "#1e1e32" }}>/</span>
        <span style={{ color: "#e8e8f8" }}>{name}</span>
      </nav>

      <SectionHeader title={name} subtitle={`Donghua genre ${name}`} href="/genre" linkLabel="Semua genre" />

      {data.error && (
        <div className="rounded-xl p-4 mb-6"
          style={{ background: "rgba(232,54,93,0.08)", border: "1px solid rgba(232,54,93,0.2)" }}>
          <p className="text-sm" style={{ color: "#e8365d" }}>Gagal memuat konten.</p>
        </div>
      )}

      <AnimeGrid items={items} cols={5} />
      <Pagination page={page} hasNext={items.length >= 20} buildUrl={p => `/genre/${params.slug}?page=${p}`} />
    </div>
  )
}
