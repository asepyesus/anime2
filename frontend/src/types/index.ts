export interface AnimeItem {
  title: string
  slug: string
  url?: string
  thumbnail?: string
  poster?: string
  cover?: string
  eps?: string | number
  episode?: string | number
  type?: string
  status?: string
  rating?: string | number
  score?: string | number
}

export interface AnimeDetail {
  title: string
  thumbnail?: string
  poster?: string
  synopsis?: string
  description?: string
  overview?: string
  rating?: string | number
  status?: string
  type?: string
  genres?: (string | { name: string })[]
  episode?: EpisodeItem[]
  episodes?: EpisodeItem[]
  country?: string
  duration?: string
}

export interface EpisodeItem {
  slug: string
  title?: string
  name?: string
  subtitle?: string
  episode?: string | number
  url?: string
}

export interface EpisodeDetail {
  title?: string
  embed_url?: string
  servers?: ServerItem[]
  prev_episode?: { slug: string; url: string }
  next_episode?: { slug: string; url: string }
}

export interface ServerItem {
  name: string
  value: string
}

export interface VideoSource {
  type: "iframe" | "file" | "mirror" | "m3u8" | "mp4"
  url?: string
  raw?: string
  decoded?: string
  label?: string
  quality?: string
}

export interface Genre {
  name: string
  slug: string
  url?: string
}

export interface ApiResponse<T> {
  result: T | null
  results?: T
  source?: string
  total?: number
  error?: string
}

export interface HomeSection {
  section: string
  cards: AnimeItem[]
}
