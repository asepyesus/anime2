import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-[8rem] font-bold leading-none select-none mb-4"
          style={{ fontFamily: "var(--font-display,Syne,sans-serif)", color: "#0f0f1a" }}>
          404
        </div>
        <h1 className="text-2xl font-bold text-white mb-3"
          style={{ fontFamily: "var(--font-display,Syne,sans-serif)" }}>
          Halaman Tidak Ditemukan
        </h1>
        <p className="text-sm mb-8" style={{ color: "#6b6b90" }}>
          Konten yang kamu cari tidak ada atau sudah dihapus.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link href="/"
            className="px-6 py-3 rounded-xl text-sm font-semibold transition-all hover:scale-105"
            style={{ background: "#e8365d", color: "#fff", boxShadow: "0 0 20px rgba(232,54,93,0.3)" }}>
            Beranda
          </Link>
          <Link href="/anime"
            className="px-6 py-3 rounded-xl text-sm font-medium transition-all hover:bg-white/5"
            style={{ border: "1px solid #1e1e32", color: "#6b6b90" }}>
            Jelajahi
          </Link>
        </div>
      </div>
    </div>
  )
}
