"use client"
import { useState, useEffect, useRef } from "react"
import { Download, Server, AlertCircle, RefreshCw, ExternalLink } from "lucide-react"

interface Source {
  type: string
  url: string
  label?: string
  quality?: string
  downloadable?: boolean
  isEmbed?: boolean
}

interface Download {
  url: string
  label: string
}

interface Props {
  slug: string
  title?: string
}

export function VideoPlayer({ slug, title }: Props) {
  const [sources, setSources] = useState<Source[]>([])
  const [downloads, setDownloads] = useState<Download[]>([])
  const [activeIdx, setActiveIdx] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showDl, setShowDl] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    setError("")
    setSources([])
    setActiveIdx(0)

    fetch(`/api/video/${slug}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) throw new Error(data.error)
        const srcs: Source[] = data.sources || []
        setSources(srcs)
        setDownloads(data.downloads || [])
        if (!srcs.length) setError("Tidak ada sumber video tersedia. Coba refresh.")
      })
      .catch(e => setError(e.message || "Gagal memuat video."))
      .finally(() => setLoading(false))
  }, [slug])

  const active = sources[activeIdx]

  const isDirectVideo = active?.type === "mp4" || active?.type === "m3u8"
  const isIframe = active?.type === "iframe"

  return (
    <div className="flex flex-col gap-4">
      {/* Player area */}
      <div className="relative overflow-hidden rounded-2xl" style={{ background: "#000", boxShadow: "0 24px 80px rgba(0,0,0,0.8)" }}>
        <div className="player-wrap">
          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3"
              style={{ background: "#0a0a14" }}>
              <div className="w-10 h-10 rounded-full border-2 border-transparent animate-spin"
                style={{ borderTopColor: "#e8365d" }} />
              <p className="text-sm" style={{ color: "#3a3a5c" }}>Memuat sumber video...</p>
            </div>
          )}

          {!loading && error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6"
              style={{ background: "#0a0a14" }}>
              <AlertCircle size={36} style={{ color: "#e8365d" }} />
              <div className="text-center">
                <p className="text-sm font-medium text-white mb-1">Gagal Memuat Video</p>
                <p className="text-xs" style={{ color: "#6b6b90" }}>{error}</p>
              </div>
              <div className="flex gap-3 flex-wrap justify-center">
                <button onClick={() => { setError(""); setLoading(true); fetch(`/api/video/${slug}`).then(r=>r.json()).then(d=>{setSources(d.sources||[]);setDownloads(d.downloads||[]);if(!d.sources?.length)setError("Tidak ada sumber video.");}).catch(e=>setError(e.message)).finally(()=>setLoading(false)) }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
                  style={{ background: "#e8365d", color: "#fff" }}>
                  <RefreshCw size={14} /> Coba Lagi
                </button>
                <a href={`https://anichin.moe/${slug}/`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
                  style={{ background: "#141425", color: "#c8c8e8", border: "1px solid #1e1e32" }}>
                  <ExternalLink size={14} /> Buka di Anichin
                </a>
              </div>
            </div>
          )}

          {!loading && !error && active && (
            <>
              {isDirectVideo ? (
                // Native HTML5 video for mp4
                active.type === "mp4" ? (
                  <video
                    key={active.url}
                    controls
                    autoPlay
                    className="w-full h-full"
                    style={{ background: "#000" }}
                    onError={() => {
                      // Try next source
                      if (activeIdx < sources.length - 1) setActiveIdx(i => i + 1)
                      else setError("Semua sumber gagal. Coba server lain.")
                    }}
                  >
                    <source src={active.url} type="video/mp4" />
                  </video>
                ) : (
                  // M3U8 stream — open in new tab (HLS needs library, simpler UX)
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4"
                    style={{ background: "#0a0a14" }}>
                    <div className="w-14 h-14 rounded-full flex items-center justify-center"
                      style={{ background: "rgba(232,54,93,0.15)", border: "1px solid rgba(232,54,93,0.3)" }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="#e8365d"><path d="M8 5v14l11-7z"/></svg>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-white mb-1">Stream HLS Tersedia</p>
                      <p className="text-xs mb-3" style={{ color: "#6b6b90" }}>Gunakan player eksternal untuk stream HLS</p>
                      <a href={active.url} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
                        style={{ background: "#e8365d", color: "#fff" }}>
                        <ExternalLink size={14} /> Buka Stream
                      </a>
                    </div>
                  </div>
                )
              ) : isIframe ? (
                <iframe
                  ref={iframeRef}
                  key={active.url}
                  src={active.url}
                  allowFullScreen
                  allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
                  referrerPolicy="no-referrer"
                  className="w-full h-full border-0"
                  title={title || "Video Player"}
                  onError={() => {
                    if (activeIdx < sources.length - 1) setActiveIdx(i => i + 1)
                  }}
                />
              ) : null}
            </>
          )}

          {/* No source fallback */}
          {!loading && !error && !active && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3"
              style={{ background: "#0a0a14" }}>
              <p className="text-sm" style={{ color: "#3a3a5c" }}>Tidak ada sumber video.</p>
              <a href={`https://anichin.moe/${slug}/`} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm"
                style={{ background: "#141425", color: "#c8c8e8", border: "1px solid #1e1e32" }}>
                <ExternalLink size={13} /> Tonton di Anichin
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Controls bar */}
      {!loading && sources.length > 0 && (
        <div className="flex flex-col gap-3">
          {/* Server selector */}
          {sources.length > 1 && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Server size={13} style={{ color: "#3a3a5c" }} />
                <span className="text-xs font-semibold tracking-wider uppercase" style={{ color: "#3a3a5c" }}>
                  Pilih Server
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {sources.map((s, i) => (
                  <button key={i} onClick={() => setActiveIdx(i)}
                    className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
                    style={{
                      background: activeIdx === i ? "#e8365d" : "#141425",
                      color: activeIdx === i ? "#fff" : "#6b6b90",
                      border: `1px solid ${activeIdx === i ? "#e8365d" : "#1e1e32"}`,
                    }}>
                    {s.label || s.quality || `Server ${i + 1}`}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Download section */}
          <div className="rounded-2xl overflow-hidden" style={{ background: "#0f0f1a", border: "1px solid #1e1e32" }}>
            <button onClick={() => setShowDl(!showDl)}
              className="w-full flex items-center justify-between px-4 py-3 transition-colors hover:bg-white/5"
              style={{ color: downloads.length > 0 ? "#e8365d" : "#3a3a5c" }}>
              <div className="flex items-center gap-2.5">
                <Download size={15} />
                <span className="text-sm font-medium">
                  {downloads.length > 0 ? `Download Video (${downloads.length} kualitas)` : "Download Tidak Tersedia"}
                </span>
              </div>
              {downloads.length > 0 && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  style={{ transform: showDl ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              )}
            </button>

            {showDl && downloads.length > 0 && (
              <div className="border-t px-4 py-3 flex flex-wrap gap-2" style={{ borderColor: "#1e1e32" }}>
                {downloads.map((dl, i) => (
                  <a key={i} href={dl.url} download target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all hover:scale-105"
                    style={{ background: "rgba(232,54,93,0.1)", color: "#e8365d", border: "1px solid rgba(232,54,93,0.25)" }}>
                    <Download size={12} />
                    {dl.label || `Download ${i + 1}`}
                  </a>
                ))}
              </div>
            )}

            {downloads.length === 0 && !loading && (
              <div className="border-t px-4 py-3" style={{ borderColor: "#1e1e32" }}>
                <p className="text-xs" style={{ color: "#3a3a5c" }}>
                  Download otomatis tidak tersedia untuk episode ini. Video menggunakan embed player dari server pihak ketiga.
                </p>
              </div>
            )}
          </div>

          {/* Tip */}
          <div className="px-4 py-3 rounded-xl flex items-start gap-2.5"
            style={{ background: "#0f0f1a", border: "1px solid #1e1e32" }}>
            <AlertCircle size={13} style={{ color: "#e8365d", flexShrink: 0, marginTop: 1 }} />
            <p className="text-xs leading-relaxed" style={{ color: "#6b6b90" }}>
              Jika video tidak muncul, coba ganti server lain. Gunakan adblocker untuk pengalaman menonton lebih nyaman.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
