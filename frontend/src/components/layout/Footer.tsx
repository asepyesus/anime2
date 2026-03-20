import Link from "next/link"
import { Play } from "lucide-react"

export function Footer() {
  return (
    <footer className="mt-20 border-t" style={{ borderColor: "#141425", background: "#080810" }}>
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2.5 w-fit">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: "linear-gradient(135deg,#e8365d,#b91c3c)" }}>
                <Play size={14} fill="white" color="white" />
              </div>
              <span className="text-lg font-bold tracking-wide" style={{ fontFamily: "var(--font-display,Syne,sans-serif)" }}>
                KICEN<span style={{ color: "#e8365d" }}>TV</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed" style={{ color: "#6b6b90", maxWidth: 240 }}>
              Platform streaming donghua subtitle Indonesia. Update setiap hari.
            </p>
            <div className="flex flex-col gap-1.5 mt-1">
              {[
                { label: "Instagram", val: "@kiki_fzl", href: "https://instagram.com/kiki_fzl" },
                { label: "Telegram", val: "@kyshiro1", href: "https://t.me/kyshiro1" },
                { label: "Email", val: "kikimodesad8@gmail.com", href: "mailto:kikimodesad8@gmail.com" },
              ].map(s => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs w-fit transition-colors hover:text-white"
                  style={{ color: "#3a3a5c" }}>
                  <span style={{ color: "#1e1e32", fontFamily: "var(--font-mono)" }}>{s.label}</span>
                  <span>{s.val}</span>
                </a>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: "#3a3a5c" }}>Navigasi</p>
            {[
              { href: "/", label: "Beranda" },
              { href: "/anime", label: "Semua Donghua" },
              { href: "/genre", label: "Genre" },
              { href: "/search", label: "Pencarian" },
            ].map(l => (
              <Link key={l.href} href={l.href} className="text-sm w-fit transition-colors hover:text-white" style={{ color: "#6b6b90" }}>
                {l.label}
              </Link>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: "#3a3a5c" }}>Developer</p>
            <div>
              <p className="text-sm font-semibold text-white">Kiki Faizal</p>
              <p className="text-xs mt-0.5" style={{ color: "#3a3a5c" }}>Kicen Developer</p>
            </div>
            <p className="text-xs leading-relaxed mt-2" style={{ color: "#3a3a5c" }}>
              Data bersumber dari anichin.moe via Railway API.
            </p>
          </div>
        </div>

        <div className="mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 border-t"
          style={{ borderColor: "#141425" }}>
          <p className="text-xs" style={{ color: "#1e1e32" }}>© {new Date().getFullYear()} KicenTV. All rights reserved.</p>
          <p className="text-xs" style={{ color: "#1e1e32", fontFamily: "var(--font-mono)" }}>Built by Kicen Developer</p>
        </div>
      </div>
    </footer>
  )
}
