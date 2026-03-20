"use client"
import Link from "next/link"
import { useEffect } from "react"

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => { console.error(error) }, [error])
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
          style={{ background: "rgba(232,54,93,0.1)", border: "1px solid rgba(232,54,93,0.2)" }}>
          <span className="text-xl" style={{ color: "#e8365d" }}>!</span>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2"
          style={{ fontFamily: "var(--font-display,Syne,sans-serif)" }}>Terjadi Kesalahan</h2>
        <p className="text-sm mb-8" style={{ color: "#6b6b90" }}>Sesuatu tidak berjalan dengan benar.</p>
        <div className="flex items-center justify-center gap-3">
          <button onClick={reset}
            className="px-6 py-3 rounded-xl text-sm font-semibold transition-all hover:scale-105"
            style={{ background: "#e8365d", color: "#fff" }}>
            Coba Lagi
          </button>
          <Link href="/"
            className="px-6 py-3 rounded-xl text-sm font-medium transition-all hover:bg-white/5"
            style={{ border: "1px solid #1e1e32", color: "#6b6b90" }}>
            Beranda
          </Link>
        </div>
      </div>
    </div>
  )
}
