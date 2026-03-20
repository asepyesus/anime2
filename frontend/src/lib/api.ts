import type { ApiResponse, AnimeItem, AnimeDetail, EpisodeDetail, VideoSource, Genre, HomeSection } from "@/types"

const BASE = process.env.NEXT_PUBLIC_API_URL || "https://anichin-api-production.up.railway.app"

async function get<T>(path: string, revalidate = 300): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(`${BASE}${path}`, {
      next: { revalidate },
      headers: { "Accept": "application/json" },
    })
    if (!res.ok) return { result: null, error: `HTTP ${res.status}` }
    return res.json()
  } catch (err) {
    return { result: null, error: String(err) }
  }
}

export const api = {
  home: (page = 1) => get<HomeSection[]>(`/?page=${page}`),
  search: (q: string) => get<AnimeItem[]>(`/search/${encodeURIComponent(q)}`, 60),
  animeDetail: (slug: string) => get<AnimeDetail>(`/${slug}`, 3600),
  episode: (slug: string) => get<EpisodeDetail>(`/episode/${slug}`, 60),
  videoSource: (slug: string) => get<VideoSource[]>(`/video-source/${slug}`, 60),
  genres: () => get<Genre[]>("/genres", 86400),
  genre: (slug: string, page = 1) => get<AnimeItem[]>(`/genre/${slug}?page=${page}`),
  animeList: (page = 1, order = "title", status = "") =>
    get<AnimeItem[]>(`/anime?page=${page}&order=${order}${status ? `&status=${status}` : ""}`),
}

// Normalize response — API returns various shapes
export function normalizeList(data: ApiResponse<any>): AnimeItem[] {
  const raw = data?.result ?? data?.results
  if (Array.isArray(raw)) return raw
  if (Array.isArray(raw?.data)) return raw.data
  return []
}

export function normalizeHomeSections(data: ApiResponse<any>): { section: string; cards: AnimeItem[] }[] {
  const raw = data?.result ?? data?.results
  if (Array.isArray(raw)) {
    // Could be sections array or flat cards array
    if (raw[0]?.section) return raw
    return [{ section: "latest_release", cards: raw }]
  }
  return []
}

export function extractVideoUrls(sources: VideoSource[]): VideoSource[] {
  const out: VideoSource[] = []

  for (const s of sources) {
    // Direct video files
    if (s.type === "file" && s.url) {
      const label = s.url.includes("1080") ? "1080p" : s.url.includes("720") ? "720p" : s.url.includes("480") ? "480p" : "Auto"
      out.push({ ...s, label, quality: label })
    }
    // M3U8 streams
    if (s.url?.endsWith(".m3u8") || s.url?.includes(".m3u8")) {
      out.push({ ...s, type: "m3u8", label: "Stream HD" })
    }
    // MP4 direct
    if (s.url?.endsWith(".mp4") || s.url?.includes(".mp4")) {
      out.push({ ...s, type: "mp4", label: "MP4" })
    }
    // Mirror decoded
    if (s.type === "mirror" && s.decoded) {
      out.push({ type: "iframe", url: s.decoded, label: "Mirror" })
    }
    // Iframe (filtered — skip if it's anichin.moe itself to avoid the bug in screenshot)
    if (s.type === "iframe" && s.url && !s.url.includes("anichin.moe")) {
      out.push({ ...s, label: "Server " + (out.length + 1) })
    }
  }

  return out.filter(s => s.url)
}
