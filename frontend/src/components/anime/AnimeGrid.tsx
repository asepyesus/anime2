import type { AnimeItem } from "@/types"
import { AnimeCard } from "./AnimeCard"

interface Props {
  items: AnimeItem[]
  cols?: 2 | 3 | 4 | 5 | 6
  priority?: boolean
}

const COLS = {
  2: "grid-cols-2",
  3: "grid-cols-2 sm:grid-cols-3",
  4: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
  5: "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5",
  6: "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6",
}

export function AnimeGrid({ items, cols = 5, priority }: Props) {
  if (!items.length) return (
    <div className="rounded-2xl p-16 text-center" style={{ background: "#0f0f1a", border: "1px dashed #1e1e32" }}>
      <p style={{ color: "#3a3a5c", fontSize: 14 }}>Tidak ada konten ditemukan.</p>
    </div>
  )

  return (
    <div className={`grid gap-3 sm:gap-4 ${COLS[cols]}`}>
      {items.map((item, i) => (
        <AnimeCard key={`${item.slug}-${i}`} item={item} priority={priority && i < 4} />
      ))}
    </div>
  )
}
