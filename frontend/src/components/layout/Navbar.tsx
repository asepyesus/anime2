"use client"
import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { Search, Menu, X, Play } from "lucide-react"

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState("")
  const router = useRouter()
  const pathname = usePathname()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30)
    window.addEventListener("scroll", fn, { passive: true })
    return () => window.removeEventListener("scroll", fn)
  }, [])

  useEffect(() => { setMenuOpen(false); setSearchOpen(false) }, [pathname])
  useEffect(() => { if (searchOpen) inputRef.current?.focus() }, [searchOpen])

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!query.trim()) return
    router.push(`/search?q=${encodeURIComponent(query.trim())}`)
    setQuery(""); setSearchOpen(false)
  }

  const links = [
    { href: "/", label: "Beranda" },
    { href: "/anime", label: "Donghua" },
    { href: "/genre", label: "Genre" },
  ]

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: scrolled ? "rgba(8,8,16,0.96)" : "linear-gradient(to bottom,rgba(8,8,16,0.85),transparent)",
          backdropFilter: scrolled ? "blur(16px)" : "none",
          borderBottom: scrolled ? "1px solid rgba(30,30,50,0.8)" : "none",
        }}>
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6">
          <div className="flex items-center h-16 gap-4">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105"
                style={{ background: "linear-gradient(135deg,#e8365d,#b91c3c)" }}>
                <Play size={14} fill="white" color="white" />
              </div>
              <span className="text-lg font-bold tracking-wide" style={{ fontFamily: "var(--font-display,Syne,sans-serif)" }}>
                KICEN<span style={{ color: "#e8365d" }}>TV</span>
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1 flex-1 ml-4">
              {links.map(l => (
                <Link key={l.href} href={l.href}
                  className="px-3 py-1.5 rounded-lg text-sm transition-all duration-200 hover:text-white"
                  style={{ color: pathname === l.href ? "#e8365d" : "#6b6b90", fontWeight: pathname === l.href ? 600 : 400 }}>
                  {l.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-2 ml-auto">
              {/* Search desktop */}
              {searchOpen ? (
                <form onSubmit={submit} className="hidden md:flex items-center gap-2">
                  <input ref={inputRef} type="text" value={query} onChange={e => setQuery(e.target.value)}
                    placeholder="Cari donghua..." autoComplete="off"
                    className="w-56 px-3 py-1.5 text-sm rounded-xl outline-none"
                    style={{ background: "#141425", border: "1px solid #1e1e32", color: "#e8e8f8" }}
                    onBlur={() => !query && setSearchOpen(false)} />
                </form>
              ) : (
                <button onClick={() => setSearchOpen(true)}
                  className="hidden md:flex w-9 h-9 items-center justify-center rounded-xl transition-colors hover:bg-white/5"
                  style={{ color: "#6b6b90" }}>
                  <Search size={17} />
                </button>
              )}

              {/* Mobile search */}
              <button onClick={() => setSearchOpen(!searchOpen)}
                className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white/5"
                style={{ color: "#6b6b90" }}>
                <Search size={17} />
              </button>

              {/* Mobile menu */}
              <button onClick={() => setMenuOpen(!menuOpen)}
                className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white/5"
                style={{ color: "#6b6b90" }}>
                {menuOpen ? <X size={17} /> : <Menu size={17} />}
              </button>
            </div>
          </div>

          {/* Mobile search bar */}
          {searchOpen && (
            <div className="md:hidden pb-3">
              <form onSubmit={submit}>
                <input ref={inputRef} type="text" value={query} onChange={e => setQuery(e.target.value)}
                  placeholder="Cari donghua..." autoComplete="off"
                  className="w-full px-4 py-2.5 text-sm rounded-xl outline-none"
                  style={{ background: "#141425", border: "1px solid #1e1e32", color: "#e8e8f8" }} />
              </form>
            </div>
          )}
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden px-4 pb-4 flex flex-col gap-1 border-t"
            style={{ background: "#080810", borderColor: "#141425" }}>
            {links.map(l => (
              <Link key={l.href} href={l.href}
                className="py-2.5 px-3 rounded-xl text-sm"
                style={{ color: pathname === l.href ? "#e8365d" : "#6b6b90" }}>
                {l.label}
              </Link>
            ))}
          </div>
        )}
      </header>
      <div className="h-16" />
    </>
  )
}
