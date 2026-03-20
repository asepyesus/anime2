import type { Config } from "tailwindcss"

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg:      "#080810",
        surface: "#0f0f1a",
        card:    "#141425",
        border:  "#1e1e32",
        muted:   "#3a3a5c",
        dim:     "#6b6b90",
        text:    "#e8e8f8",
        red:     "#e8365d",
        "red-dark": "#b91c3c",
        gold:    "#f59e0b",
        teal:    "#00d4a8",
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body:    ["var(--font-body)"],
        mono:    ["var(--font-mono)"],
      },
      keyframes: {
        fadeUp:    { from: { opacity: "0", transform: "translateY(16px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        shimmer:   { from: { backgroundPosition: "-200% 0" }, to: { backgroundPosition: "200% 0" } },
        marquee:   { from: { transform: "translateX(0)" }, to: { transform: "translateX(-50%)" } },
        scanLine:  { from: { transform: "translateY(-100%)" }, to: { transform: "translateY(100vh)" } },
        popIn:     { from: { opacity: "0", transform: "scale(0.8)" }, to: { opacity: "1", transform: "scale(1)" } },
        pulse:     { "0%,100%": { opacity: "1" }, "50%": { opacity: "0.4" } },
        spin:      { to: { transform: "rotate(360deg)" } },
      },
      animation: {
        fadeUp:   "fadeUp 0.5s ease both",
        shimmer:  "shimmer 1.8s linear infinite",
        marquee:  "marquee 28s linear infinite",
        scanLine: "scanLine 3s linear infinite",
        popIn:    "popIn 0.6s cubic-bezier(0.34,1.56,0.64,1) both",
        pulse:    "pulse 2s ease-in-out infinite",
        spin:     "spin 0.8s linear infinite",
      },
    },
  },
  plugins: [],
}

export default config
