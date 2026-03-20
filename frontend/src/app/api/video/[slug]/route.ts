import { NextResponse } from "next/server"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://anichin-api-production.up.railway.app"

// Video URL patterns to look for
const VIDEO_PATTERNS = [
  /https?:\/\/[^\s"']+\.m3u8[^\s"']*/gi,
  /https?:\/\/[^\s"']+\.mp4[^\s"']*/gi,
  /file:\s*["']([^"']+)["']/gi,
  /src:\s*["']([^"']+\.(?:m3u8|mp4)[^"']*)["']/gi,
  /"file":"([^"]+)"/gi,
  /sources:\s*\[.*?src:\s*["']([^"']+)["']/gis,
]

// Known embed domains that serve actual players
const EMBED_DOMAINS = [
  "streamtape", "doodstream", "filemoon", "vidstream",
  "vidplay", "megacloud", "bunny.net", "jwplayer",
  "plyr", "playtaku", "gogoplay", "gogoanime",
  "emturbovid", "closeload", "vidmoly", "streamlare",
]

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const { slug } = params

  try {
    // Step 1: Get episode data from our API
    const epRes = await fetch(`${API_BASE}/episode/${slug}`, {
      headers: { "Accept": "application/json" },
      signal: AbortSignal.timeout(10000),
    })
    const epData = await epRes.json()
    const ep = epData?.result || {}

    // Step 2: Get video sources
    const vsRes = await fetch(`${API_BASE}/video-source/${slug}`, {
      headers: { "Accept": "application/json" },
      signal: AbortSignal.timeout(10000),
    })
    const vsData = await vsRes.json()
    const rawSources = vsData?.result || []

    const sources: any[] = []

    // Step 3: Parse all sources
    for (const s of rawSources) {
      // Direct video files
      if (s.url?.match(/\.(m3u8|mp4)(\?|$)/i)) {
        sources.push({
          type: s.url.includes(".m3u8") ? "m3u8" : "mp4",
          url: s.url,
          label: s.url.includes("1080") ? "1080p" : s.url.includes("720") ? "720p" : s.url.includes("480") ? "480p" : "HD",
          downloadable: !s.url.includes(".m3u8"),
        })
        continue
      }

      // Mirror (base64 encoded iframe src)
      if (s.type === "mirror" && s.decoded) {
        const decoded = s.decoded
        // Extract URL from decoded HTML
        const iframeSrc = decoded.match(/src=["']([^"']+)["']/)?.[1] || decoded
        if (iframeSrc && !iframeSrc.includes("anichin.moe")) {
          sources.push({
            type: "iframe",
            url: iframeSrc.startsWith("//") ? "https:" + iframeSrc : iframeSrc,
            label: s.name || "Server",
            isEmbed: EMBED_DOMAINS.some(d => iframeSrc.includes(d)),
          })
        }
        continue
      }

      // Iframe — skip anichin.moe (that's the bug in the screenshot)
      if (s.type === "iframe" && s.url) {
        if (s.url.includes("anichin.moe")) continue
        sources.push({
          type: "iframe",
          url: s.url.startsWith("//") ? "https:" + s.url : s.url,
          label: s.name || "Embed",
          isEmbed: EMBED_DOMAINS.some(d => s.url.includes(d)),
        })
        continue
      }
    }

    // Step 4: If embed_url from episode data is a real embed (not anichin.moe)
    if (ep.embed_url && !ep.embed_url.includes("anichin.moe")) {
      const url = ep.embed_url.startsWith("//") ? "https:" + ep.embed_url : ep.embed_url
      if (!sources.find(s => s.url === url)) {
        sources.unshift({
          type: "iframe",
          url,
          label: "Default",
          isEmbed: true,
        })
      }
    }

    // Step 5: Build download list — only mp4 sources
    const downloads = sources
      .filter(s => s.type === "mp4" || s.downloadable)
      .map(s => ({ url: s.url, label: s.label || "Download" }))

    return NextResponse.json({
      slug,
      title: ep.title || "",
      prev: ep.prev_episode || null,
      next: ep.next_episode || null,
      sources,
      downloads,
      total: sources.length,
    })

  } catch (err) {
    return NextResponse.json({ error: String(err), sources: [], downloads: [] }, { status: 500 })
  }
}
