import type { Metadata } from "next"
import { Syne, DM_Sans, JetBrains_Mono } from "next/font/google"
import "./globals.css"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { IntroAnimation } from "@/components/intro/IntroAnimation"

const syne = Syne({
  subsets: ["latin"],
  weight: ["400","500","600","700","800"],
  variable: "--font-display",
  display: "swap",
})
const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300","400","500","600"],
  variable: "--font-body",
  display: "swap",
})
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400","500"],
  variable: "--font-mono",
  display: "swap",
})

export const metadata: Metadata = {
  title: { default: "KicenTV — Nonton Donghua Sub Indo", template: "%s | KicenTV" },
  description: "Nonton donghua subtitle Indonesia terlengkap. Update harian. Gratis tanpa registrasi.",
  keywords: ["donghua", "anime china", "sub indo", "streaming", "kicentv"],
  authors: [{ name: "Kiki Faizal" }],
  creator: "Kicen Developer",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${syne.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}>
      <body>
        <IntroAnimation />
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
