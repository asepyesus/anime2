const API = {
  async tmdb(path, params = {}) {
    const url = new URL(`${CONFIG.TMDB_BASE}${path}`);
    url.searchParams.set('api_key', CONFIG.TMDB_KEY);
    url.searchParams.set('language', 'id-ID');
    for (const [k, v] of Object.entries(params)) {
      url.searchParams.set(k, v);
    }
    const res = await fetch(url);
    if (!res.ok) throw new Error(`TMDB error: ${res.status}`);
    return res.json();
  },

  async jikan(path, params = {}) {
    const url = new URL(`${CONFIG.JIKAN_BASE}${path}`);
    for (const [k, v] of Object.entries(params)) {
      url.searchParams.set(k, v);
    }
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Jikan error: ${res.status}`);
    return res.json();
  },

  // Anime via Jikan
  async getAnime(page = 1) {
    const data = await this.jikan('/anime', { page, limit: 20, order_by: 'popularity', sort: 'asc' });
    return { results: data.data.map(this.normalizeAnime), total_pages: data.pagination?.last_visible_page || 1 };
  },

  async getTrendingAnime() {
    const data = await this.jikan('/top/anime', { limit: 20, filter: 'airing' });
    return data.data.map(this.normalizeAnime);
  },

  async searchAnime(query) {
    const data = await this.jikan('/anime', { q: query, limit: 20 });
    return data.data.map(this.normalizeAnime);
  },

  async getAnimeDetail(id) {
    const data = await this.jikan(`/anime/${id}/full`);
    const a = data.data;
    return {
      id: a.mal_id,
      type: 'anime',
      title: a.title,
      title_id: a.title_english || a.title,
      overview: a.synopsis || 'Tidak ada sinopsis.',
      poster: a.images?.jpg?.large_image_url || null,
      backdrop: a.trailer?.images?.maximum_image_url || a.images?.jpg?.large_image_url || null,
      rating: a.score,
      year: a.year || (a.aired?.from ? new Date(a.aired.from).getFullYear() : '-'),
      genres: a.genres?.map(g => g.name) || [],
      episodes: a.episodes,
      status: a.status,
      studios: a.studios?.map(s => s.name).join(', ') || '-',
      trailer: a.trailer?.embed_url || null,
    };
  },

  normalizeAnime(a) {
    return {
      id: a.mal_id,
      type: 'anime',
      category: 'anime',
      title: a.title_english || a.title,
      poster: a.images?.jpg?.large_image_url || null,
      rating: a.score,
      year: a.year || '-',
      episodes: a.episodes || '?',
      status: a.status,
      genres: a.genres?.map(g => g.name).slice(0, 2) || [],
    };
  },

  // Drakor via TMDB
  async getDrakor(page = 1) {
    const data = await this.tmdb('/discover/tv', {
      with_origin_country: 'KR',
      sort_by: 'popularity.desc',
      page,
    });
    return { results: data.results.map(i => this.normalizeTMDB(i, 'drakor')), total_pages: Math.min(data.total_pages, 500) };
  },

  async getTrendingDrakor() {
    const data = await this.tmdb('/trending/tv/week', { with_origin_country: 'KR' });
    return data.results.filter(i => i.origin_country?.includes('KR')).slice(0, 20).map(i => this.normalizeTMDB(i, 'drakor'));
  },

  // Dracin via TMDB
  async getDracin(page = 1) {
    const data = await this.tmdb('/discover/tv', {
      with_origin_country: 'CN',
      without_genres: '16',
      sort_by: 'popularity.desc',
      page,
    });
    return { results: data.results.map(i => this.normalizeTMDB(i, 'dracin')), total_pages: Math.min(data.total_pages, 500) };
  },

  // Donghua via TMDB
  async getDonghua(page = 1) {
    const data = await this.tmdb('/discover/tv', {
      with_origin_country: 'CN',
      with_genres: '16',
      sort_by: 'popularity.desc',
      page,
    });
    return { results: data.results.map(i => this.normalizeTMDB(i, 'donghua')), total_pages: Math.min(data.total_pages, 500) };
  },

  async getTMDBDetail(id, type = 'tv') {
    const data = await this.tmdb(`/${type}/${id}`, { append_to_response: 'credits,videos' });
    return {
      id: data.id,
      type,
      title: data.title || data.name,
      overview: data.overview || 'Tidak ada sinopsis.',
      poster: data.poster_path ? `${CONFIG.TMDB_IMG}/w500${data.poster_path}` : null,
      backdrop: data.backdrop_path ? `${CONFIG.TMDB_IMG}/original${data.backdrop_path}` : null,
      rating: data.vote_average?.toFixed(1),
      year: (data.first_air_date || data.release_date || '').slice(0, 4),
      genres: data.genres?.map(g => g.name) || [],
      episodes: data.number_of_episodes,
      seasons: data.number_of_seasons,
      status: data.status,
      cast: data.credits?.cast?.slice(0, 8).map(c => ({
        name: c.name,
        character: c.character,
        photo: c.profile_path ? `${CONFIG.TMDB_IMG}/w185${c.profile_path}` : null,
      })) || [],
      trailer: data.videos?.results?.find(v => v.type === 'Trailer')?.key || null,
    };
  },

  async searchTMDB(query) {
    const data = await this.tmdb('/search/multi', { query, include_adult: false });
    return data.results
      .filter(i => i.media_type !== 'person')
      .map(i => this.normalizeTMDB(i, i.origin_country?.includes('KR') ? 'drakor' : i.original_language === 'zh' ? 'dracin' : 'tv'));
  },

  normalizeTMDB(item, category) {
    return {
      id: item.id,
      type: item.media_type === 'movie' ? 'movie' : 'tv',
      category,
      title: item.title || item.name,
      poster: item.poster_path ? `${CONFIG.TMDB_IMG}/w342${item.poster_path}` : null,
      rating: item.vote_average?.toFixed(1),
      year: (item.first_air_date || item.release_date || '').slice(0, 4),
      genres: [],
    };
  },

  async getTrending() {
    const [anime, drakor, dracin, donghua] = await Promise.allSettled([
      this.getTrendingAnime(),
      this.getTrendingDrakor(),
      this.getDracin(1),
      this.getDonghua(1),
    ]);
    return [
      ...(anime.status === 'fulfilled' ? anime.value.slice(0, 5) : []),
      ...(drakor.status === 'fulfilled' ? drakor.value.slice(0, 5) : []),
      ...(dracin.status === 'fulfilled' ? dracin.value.results?.slice(0, 5) || [] : []),
      ...(donghua.status === 'fulfilled' ? donghua.value.results?.slice(0, 5) || [] : []),
    ];
  },
};
