"use client"
import { useEffect, useState } from "react"

export function IntroAnimation() {
  const [phase, setPhase] = useState<"in"|"hold"|"out"|"done">("in")
  const [show, setShow] = useState(true)

  useEffect(() => {
    if (sessionStorage.getItem("kx_intro")) { setShow(false); return }
    const t1 = setTimeout(() => setPhase("hold"), 600)
    const t2 = setTimeout(() => setPhase("out"), 2400)
    const t3 = setTimeout(() => { setShow(false); sessionStorage.setItem("kx_intro","1") }, 3100)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [])

  if (!show) return null

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "#080810",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1.5rem",
        transition: phase === "out" ? "opacity 0.7s ease, transform 0.7s ease" : "none",
        opacity: phase === "out" ? 0 : 1,
        transform: phase === "out" ? "scale(1.05)" : "scale(1)",
        pointerEvents: phase === "out" ? "none" : "all",
      }}
    >
      {/* Grid bg */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        backgroundImage: "linear-gradient(rgba(232,54,93,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(232,54,93,0.03) 1px,transparent 1px)",
        backgroundSize: "48px 48px",
      }}/>

      {/* Glow */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse 50% 40% at 50% 50%, rgba(232,54,93,0.1) 0%, transparent 70%)",
        transition: "opacity 0.5s", opacity: phase === "in" ? 0 : 1,
      }}/>

      {/* Logo */}
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem",
        transition: "all 0.7s cubic-bezier(0.16,1,0.3,1)",
        opacity: phase === "in" ? 0 : 1,
        transform: phase === "in" ? "translateY(20px) scale(0.9)" : "none",
        filter: phase === "in" ? "blur(12px)" : "none",
      }}>
        <div style={{
          width: 72, height: 72, borderRadius: 18,
          background: "linear-gradient(135deg,#e8365d,#b91c3c)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 0 60px rgba(232,54,93,0.5), 0 0 120px rgba(232,54,93,0.2)",
        }}>
          <svg viewBox="0 0 40 40" width="38" height="38" fill="none">
            <path d="M10 12v16l8-4 3 6 5-3-3-6 8-4L10 12z" fill="white" strokeLinejoin="round"/>
          </svg>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{
            fontFamily: "var(--font-display,Syne,sans-serif)",
            fontSize: "2.8rem", fontWeight: 800, letterSpacing: "0.08em",
            color: "#fff", lineHeight: 1,
          }}>
            KICEN<span style={{ color: "#e8365d" }}>TV</span>
          </div>
          <div style={{
            fontFamily: "var(--font-mono,'JetBrains Mono',monospace)",
            fontSize: "0.65rem", letterSpacing: "0.35em", textTransform: "uppercase",
            color: "#3a3a5c", marginTop: "0.4rem",
            transition: "opacity 0.4s 0.2s", opacity: phase === "hold" || phase === "out" ? 1 : 0,
          }}>
            Donghua Sub Indo
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{
        width: 140, height: 2, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden",
        transition: "opacity 0.3s", opacity: phase === "hold" ? 1 : 0,
      }}>
        <div style={{
          height: "100%", borderRadius: 2,
          background: "linear-gradient(90deg,#e8365d,#ff6b7a)",
          width: phase === "hold" ? "100%" : "0%",
          transition: "width 1.5s cubic-bezier(0.4,0,0.2,1)",
        }}/>
      </div>
    </div>
  )
}
