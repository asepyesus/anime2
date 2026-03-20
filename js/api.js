const API = {
  async tmdb(path, p = {}) {
    const u = new URL(`${C.TMDB_URL}${path}`);
    u.searchParams.set('api_key', C.TMDB);
    u.searchParams.set('language', 'id-ID');
    Object.entries(p).forEach(([k,v]) => u.searchParams.set(k, v));
    const r = await fetch(u); if (!r.ok) throw new Error('TMDB ' + r.status);
    return r.json();
  },
  async jikan(path, p = {}) {
    const u = new URL(`${C.JIKAN}${path}`);
    Object.entries(p).forEach(([k,v]) => u.searchParams.set(k, v));
    const r = await fetch(u); if (!r.ok) throw new Error('Jikan ' + r.status);
    return r.json();
  },

  // Normalizers
  _na(a) {
    return { id:a.mal_id, type:'anime', category:'anime',
      title: a.title_english || a.title,
      poster: a.images?.jpg?.large_image_url || null,
      rating: a.score, year: a.year || '', episodes: a.episodes || '?',
      status: a.status, genres: a.genres?.map(g=>g.name)||[] };
  },
  _nt(i, cat) {
    return { id:i.id, type: i.media_type==='movie'?'movie':'tv', category: cat,
      title: i.title || i.name,
      poster: i.poster_path ? `${C.IMG}/w342${i.poster_path}` : null,
      backdrop: i.backdrop_path ? `${C.IMG}/w780${i.backdrop_path}` : null,
      rating: i.vote_average?.toFixed(1), year: (i.first_air_date||i.release_date||'').slice(0,4) };
  },

  // Lists
  async anime(page=1) {
    const d = await this.jikan('/anime',{page,limit:20,order_by:'popularity',sort:'asc'});
    return { results: d.data.map(a=>this._na(a)), pages: d.pagination?.last_visible_page||1 };
  },
  async donghua(page=1) {
    const d = await this.tmdb('/discover/tv',{with_origin_country:'CN',with_genres:'16',sort_by:'popularity.desc',page});
    return { results: d.results.map(i=>this._nt(i,'donghua')), pages: Math.min(d.total_pages||1,200) };
  },
  async drakor(page=1) {
    const d = await this.tmdb('/discover/tv',{with_origin_country:'KR',sort_by:'popularity.desc',page});
    return { results: d.results.map(i=>this._nt(i,'drakor')), pages: Math.min(d.total_pages||1,200) };
  },
  async dracin(page=1) {
    const d = await this.tmdb('/discover/tv',{with_origin_country:'CN',without_genres:'16',sort_by:'popularity.desc',page});
    return { results: d.results.map(i=>this._nt(i,'dracin')), pages: Math.min(d.total_pages||1,200) };
  },

  // Trending per cat
  async trending(cat) {
    try {
      if (cat==='anime') { const d=await this.jikan('/top/anime',{limit:10,filter:'airing'}); return d.data.map(a=>this._na(a)); }
      if (cat==='drakor') { const d=await this.tmdb('/discover/tv',{with_origin_country:'KR',sort_by:'popularity.desc'}); return d.results.slice(0,10).map(i=>this._nt(i,'drakor')); }
      if (cat==='dracin') { const d=await this.tmdb('/discover/tv',{with_origin_country:'CN',without_genres:'16',sort_by:'popularity.desc'}); return d.results.slice(0,10).map(i=>this._nt(i,'dracin')); }
      if (cat==='donghua') { const d=await this.tmdb('/discover/tv',{with_origin_country:'CN',with_genres:'16',sort_by:'popularity.desc'}); return d.results.slice(0,10).map(i=>this._nt(i,'donghua')); }
    } catch { return []; }
    return [];
  },

  // Detail
  async animeDetail(id) {
    const d = await this.jikan(`/anime/${id}/full`);
    const a = d.data;
    return { id:a.mal_id, type:'anime', category:'anime',
      title: a.title_english||a.title, title_jp: a.title,
      overview: a.synopsis||'Tidak ada sinopsis.',
      poster: a.images?.jpg?.large_image_url||null,
      backdrop: a.trailer?.images?.maximum_image_url||a.images?.jpg?.large_image_url||null,
      rating: a.score, year: a.year||(a.aired?.from?new Date(a.aired.from).getFullYear():''),
      genres: a.genres?.map(g=>g.name)||[], episodes: a.episodes||1,
      status: a.status, studios: a.studios?.map(s=>s.name).join(', ')||'',
      trailer: a.trailer?.embed_url||null };
  },
  async tmdbDetail(id, type='tv') {
    const d = await this.tmdb(`/${type}/${id}`,{append_to_response:'credits,videos'});
    return { id:d.id, type, title: d.title||d.name,
      overview: d.overview||'Tidak ada sinopsis.',
      poster: d.poster_path?`${C.IMG}/w500${d.poster_path}`:null,
      backdrop: d.backdrop_path?`${C.IMG}/original${d.backdrop_path}`:null,
      rating: d.vote_average?.toFixed(1),
      year: (d.first_air_date||d.release_date||'').slice(0,4),
      genres: d.genres?.map(g=>g.name)||[],
      episodes: d.number_of_episodes||1, seasons: d.number_of_seasons,
      status: d.status,
      cast: d.credits?.cast?.slice(0,10).map(c=>({
        name:c.name, char:c.character,
        photo:c.profile_path?`${C.IMG}/w185${c.profile_path}`:null })) || [],
      trailer: d.videos?.results?.find(v=>v.type==='Trailer')?.key||null };
  },

  // Search
  async searchAnime(q) {
    const d = await this.jikan('/anime',{q,limit:20});
    return d.data.map(a=>this._na(a));
  },
  async searchTMDB(q) {
    const d = await this.tmdb('/search/multi',{query:q,include_adult:false});
    return d.results.filter(i=>i.media_type!=='person').map(i=>{
      const cat = i.origin_country?.includes('KR')?'drakor':i.original_language==='zh'?'dracin':'drakor';
      return this._nt(i, cat);
    });
  },

  // History tracking
  saveHistory(item, ep=1) {
    try {
      const h = JSON.parse(localStorage.getItem('kx_history')||'[]');
      const idx = h.findIndex(x=>x.id===item.id && x.category===item.category);
      const entry = {...item, ep, watchedAt: Date.now()};
      if (idx>-1) h.splice(idx,1);
      h.unshift(entry);
      localStorage.setItem('kx_history', JSON.stringify(h.slice(0,30)));
    } catch {}
  },
  getHistory() {
    try { return JSON.parse(localStorage.getItem('kx_history')||'[]'); } catch { return []; }
  },
};
