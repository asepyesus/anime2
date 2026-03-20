Pages.browse = async function({ cat='anime', p='1' }) {
  UI.renderNav();
  const page = parseInt(p)||1;
  const info = C.CATS[cat]||C.CATS.anime;

  UI.setPage(`
    <div class="browse-pg">
      <div class="browse-head">
        <h1>${info.label}</h1>
        <div class="cat-tabs">
          ${Object.entries(C.CATS).map(([k,v])=>`
            <a class="cat-tab${cat===k?' on':''}" data-go="/browse?cat=${k}" style="--c:${v.color}">${v.label}</a>
          `).join('')}
        </div>
      </div>
      <div id="browse-grid">${UI.skel(20)}</div>
      <div id="browse-pg"></div>
    </div>
  `);

  try {
    let res;
    if (cat==='anime') res = await API.anime(page);
    else if (cat==='drakor') res = await API.drakor(page);
    else if (cat==='dracin') res = await API.dracin(page);
    else res = await API.donghua(page);

    document.getElementById('browse-grid').innerHTML = res.results.length
      ? `<div class="cards-grid">${res.results.map(UI.card).join('')}</div>`
      : `<p class="empty-msg">Tidak ada konten.</p>`;

    document.getElementById('browse-pg').innerHTML = UI.pages(page, res.pages);
    UI.bindPages(cat, page);
  } catch {
    document.getElementById('browse-grid').innerHTML = `<p class="empty-msg">Gagal memuat. Coba lagi.</p>`;
  }
};

Pages.detail = async function({ id, type='tv', cat='anime' }) {
  if (!id) { Router.go('/home'); return; }
  UI.renderNav();
  UI.setPage(`<div class="center-spinner"><div class="spinner"></div></div>`);

  try {
    let data;
    if (cat==='anime') { data = await API.animeDetail(id); }
    else { data = await API.tmdbDetail(id, type); data.category = cat; }

    UI.setPage(`
      <div class="detail-pg">
        <div class="detail-hero">
          <div class="detail-bg" style="background-image:url('${data.backdrop||data.poster||''}')"></div>
          <div class="detail-fade"></div>
          <div class="detail-body">
            <div class="detail-poster">
              ${data.poster?`<img src="${data.poster}" alt="${data.title}"/>`:`<div class="detail-np">${data.title?.charAt(0)}</div>`}
            </div>
            <div class="detail-info">
              <span class="detail-badge" style="background:${C.CATS[cat]?.color||'#666'}">${cat.toUpperCase()}</span>
              <h1 class="detail-title">${data.title}</h1>
              <div class="detail-meta">
                ${data.rating?`<span class="detail-score">★ ${data.rating}</span>`:''}
                ${data.year?`<span>${data.year}</span>`:''}
                ${data.episodes?`<span>${data.episodes} Episode</span>`:''}
                ${data.status?`<span>${data.status}</span>`:''}
              </div>
              <div class="detail-genres">
                ${(data.genres||[]).map(g=>`<span class="genre-chip">${g}</span>`).join('')}
              </div>
              <p class="detail-overview">${data.overview}</p>
              <div class="detail-btns">
                <a class="btn-watch-now" data-go="/watch?id=${id}&type=${type}&cat=${cat}&ep=1">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                  Tonton Sekarang
                </a>
                <button class="btn-wl" id="wl-btn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>
                  Watchlist
                </button>
                ${data.trailer?`<button class="btn-trailer" id="trailer-btn">Trailer</button>`:''}
              </div>
              ${data.studios?`<div class="detail-studio">${data.studios}</div>`:''}
            </div>
          </div>
        </div>

        ${(data.cast||[]).length?`
          <section class="det-section">
            <h2 class="det-sec-title">Pemeran</h2>
            <div class="cast-row">
              ${data.cast.map(c=>`
                <div class="cast-item">
                  ${c.photo?`<img src="${c.photo}" alt="${c.name}"/>`:`<div class="cast-ph">${c.name?.charAt(0)}</div>`}
                  <div class="cast-name">${c.name}</div>
                  <div class="cast-char">${c.char}</div>
                </div>
              `).join('')}
            </div>
          </section>
        `:''}

        ${data.trailer?`
          <div class="trailer-modal" id="trailer-modal">
            <div class="tm-box">
              <button class="tm-close" id="tm-close">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
              </button>
              <iframe src="https://www.youtube.com/embed/${data.trailer}?autoplay=1&rel=0" frameborder="0" allow="autoplay;fullscreen" allowfullscreen></iframe>
            </div>
          </div>
        `:''}
      </div>
    `);

    // Watchlist
    const wlBtn = document.getElementById('wl-btn');
    if (wlBtn && window.Auth?.current) {
      const inWL = await window.DB.inWatchlist(id, cat);
      updateWLBtn(wlBtn, inWL);
      wlBtn.addEventListener('click', async () => {
        try {
          const added = await window.DB.watchlistToggle({id,type,category:cat,title:data.title,poster:data.poster,rating:data.rating,year:data.year});
          updateWLBtn(wlBtn, added);
          UI.toast(added ? 'Ditambahkan ke watchlist' : 'Dihapus dari watchlist');
        } catch(e) {
          if (e.message==='login') { Router.go('/auth?m=login'); }
        }
      });
    } else if (wlBtn) {
      wlBtn.addEventListener('click', () => Router.go('/auth?m=login'));
    }

    // Trailer
    const tBtn = document.getElementById('trailer-btn');
    const tModal = document.getElementById('trailer-modal');
    const tClose = document.getElementById('tm-close');
    tBtn?.addEventListener('click', () => tModal?.classList.add('open'));
    tClose?.addEventListener('click', () => tModal?.classList.remove('open'));
    tModal?.addEventListener('click', e => { if(e.target===tModal) tModal.classList.remove('open'); });

  } catch {
    UI.setPage(`<div class="pg-err"><h2>Gagal memuat detail.</h2><a data-go="/home">Kembali</a></div>`);
  }
};

function updateWLBtn(btn, inWL) {
  btn.innerHTML = inWL
    ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg> Tersimpan`
    : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg> Watchlist`;
  btn.style.borderColor = inWL ? 'var(--teal)' : '';
  btn.style.color = inWL ? 'var(--teal)' : '';
}


// ─── VIDEO SOURCES ──────────────────────────────────────────────────────────
// Uses Consumet API (open source) + HLS.js for real streaming
// Falls back to embed sources if Consumet unavailable

const CONSUMET = 'https://api.consumet.org';

async function getAnimeStreamUrl(malId, ep) {
  try {
    // Search anime on Gogoanime via Consumet
    const searchRes = await fetch(`${CONSUMET}/anime/gogoanime/info/${malId}?id=${malId}`);
    if (!searchRes.ok) throw new Error('search failed');
    const info = await searchRes.json();
    const epData = info.episodes?.find(e => e.number == ep) || info.episodes?.[ep-1];
    if (!epData) throw new Error('episode not found');

    const streamRes = await fetch(`${CONSUMET}/anime/gogoanime/watch/${epData.id}`);
    if (!streamRes.ok) throw new Error('stream failed');
    const stream = await streamRes.json();

    // Prefer 1080p, then 720p, then first available
    const sources = stream.sources || [];
    const hd = sources.find(s => s.quality === '1080p')
            || sources.find(s => s.quality === '720p')
            || sources[0];
    return hd?.url || null;
  } catch {
    return null;
  }
}

async function getDramaStreamUrl(tmdbId, type, ep) {
  try {
    const mediaType = type === 'movie' ? 'movies' : 'tv';
    const streamRes = await fetch(`${CONSUMET}/movies/dramacool/watch?episodeId=${tmdbId}&mediaId=${tmdbId}`);
    if (!streamRes.ok) throw new Error('drama stream failed');
    const stream = await streamRes.json();
    const sources = stream.sources || [];
    const hd = sources.find(s => s.quality === '1080p')
            || sources.find(s => s.quality === '720p')
            || sources[0];
    return hd?.url || null;
  } catch {
    return null;
  }
}

// ─── ANICHIN (DONGHUA) ───────────────────────────────────────────────────────
// Loads @zhadev/anichin browser SDK from CDN, then fetches embed URL per episode

async function loadAnichinSDK() {
  if (window.AnichinScraper) return window.AnichinScraper;
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/@zhadev/anichin/dist/javascript/browser.min.js';
    s.onload = () => resolve(window.AnichinScraper);
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

// Convert TMDB title to Anichin slug format for searching
function titleToSlug(title) {
  return title.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

async function getDonghuaEmbedUrl(title, epNum) {
  try {
    const AnichinScraper = await loadAnichinSDK();
    const scraper = new AnichinScraper({ baseUrl: 'https://anichin.moe' });

    // Search by title
    const searchResult = await scraper.search(title, 1);
    if (!searchResult.success || !searchResult.data?.search?.lists?.length) {
      throw new Error('not found');
    }

    // Pick best match from search results
    const lists = searchResult.data.search.lists;
    const titleLower = title.toLowerCase();
    const match = lists.find(item =>
      item.title?.toLowerCase().includes(titleLower.split(' ')[0]) ||
      titleLower.includes(item.title?.toLowerCase().split(' ')[0] || '')
    ) || lists[0];

    if (!match?.slug) throw new Error('no slug');

    // Get series info to find episode slug
    const seriesResult = await scraper.series(match.slug);
    if (!seriesResult.success) throw new Error('series failed');

    const episodes = seriesResult.data?.series?.episodes || [];
    // Find the right episode
    const ep = episodes.find(e =>
      parseInt(e.episode_number) === epNum ||
      e.title?.includes(`Episode ${epNum}`) ||
      e.title?.includes(`Ep ${epNum}`)
    ) || episodes[epNum - 1] || episodes[episodes.length - 1];

    if (!ep?.slug) throw new Error('episode not found');

    // Get watch data with embed URL
    const watchResult = await scraper.watch(ep.slug);
    if (!watchResult.success) throw new Error('watch failed');

    const servers = watchResult.data?.watch?.servers || [];
    const server = servers[0];
    return server?.server_url || null;

  } catch (e) {
    console.warn('Anichin failed:', e.message);
    return null;
  }
}

// Embed fallbacks per category
function buildEmbedSources(id, cat, type, ep) {
  const epNum = parseInt(ep) || 1;

  if (cat === 'donghua') {
    // Donghua fallback embeds — Anichin is primary (handled in autoLoad)
    return [
      `https://vidsrc.to/embed/tv/${id}/${epNum}`,
      `https://vidsrc.xyz/embed/tv?tmdb=${id}&season=1&episode=${epNum}`,
      `https://2embed.skin/embedtv/${id}&s=1&e=${epNum}`,
    ];
  }

  if (cat === 'anime') {
    return [
      `https://embed.aniwave.to/e/${id}?ep=${epNum}`,
      `https://vidsrc.to/embed/anime/${id}/${epNum}`,
      `https://2anime.xyz/embed/${id}/${epNum}`,
    ];
  }

  // Drakor / Dracin
  const mt = type === 'movie' ? 'movie' : 'tv';
  if (mt === 'movie') {
    return [
      `https://vidsrc.to/embed/movie/${id}`,
      `https://vidsrc.xyz/embed/movie?tmdb=${id}`,
      `https://2embed.skin/embed/${id}`,
    ];
  }
  return [
    `https://vidsrc.to/embed/tv/${id}/${epNum}`,
    `https://vidsrc.xyz/embed/tv?tmdb=${id}&season=1&episode=${epNum}`,
    `https://2embed.skin/embedtv/${id}&s=1&e=${epNum}`,
  ];
}


Pages.watch = async function({ id, type='tv', cat='anime', ep='1' }) {
  if (!id) { Router.go('/home'); return; }
  UI.renderNav();
  UI.setPage(`<div class="center-spinner"><div class="spinner"></div></div>`, {noFooter:true});

  try {
    let data;
    if (cat==='anime') { data = await API.animeDetail(id); }
    else { data = await API.tmdbDetail(id, type); data.category = cat; }

    const epNum = parseInt(ep)||1;
    const totalEp = data.episodes||1;
    const epList = Array.from({length:Math.min(totalEp,500)},(_,i)=>i+1);

    // Save to history
    API.saveHistory({id,type:type||'tv',category:cat,title:data.title,poster:data.poster,rating:data.rating,year:data.year}, epNum);

    const embedSources = buildEmbedSources(id, cat, type, epNum);

    UI.setPage(`
      <div class="watch-layout">

        <!-- LEFT: PLAYER + INFO + COMMENTS -->
        <div class="watch-main">
          <div class="watch-player-wrap">
            <video id="hls-player" controls playsinline style="display:none;width:100%;height:100%;position:absolute;inset:0;background:#000"></video>
            <iframe
              id="watch-iframe"
              src=""
              frameborder="0"
              allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
              allowfullscreen
              referrerpolicy="no-referrer"
              title="${data.title} Episode ${epNum}"
              style="display:none"
            ></iframe>
            <div id="player-loading" class="player-loading">
              <div class="spinner" style="border-top-color:#fff;border-color:rgba(255,255,255,.15);border-top-color:white"></div>
              <span>Memuat video...</span>
            </div>
          </div>
          <div class="watch-src-bar">
            <span class="wsb-label">Server:</span>
            <button class="wsrc-btn on" data-type="consumet" id="srv-auto">
              ${cat === 'donghua' ? 'Anichin (Sub ID)' : 'Auto'}
            </button>
            ${embedSources.map((src,i) => `<button class="wsrc-btn" data-type="embed" data-src="${src}">Server ${i+2}</button>`).join('')}
          </div>

          <!-- INFO BAR -->
          <div class="watch-info">
            <div class="wi-left">
              <span class="wi-badge" style="background:${C.CATS[cat]?.color||'#666'}">${cat.toUpperCase()}</span>
              <div>
                <div class="wi-title">${data.title}</div>
                <div class="wi-meta">
                  ${data.rating?`<span class="wi-score">★ ${data.rating}</span>`:''}
                  ${data.year?`<span>${data.year}</span>`:''}
                  ${totalEp>1?`<span>Episode ${epNum} / ${totalEp}</span>`:''}
                </div>
              </div>
            </div>
            <div class="wi-right">
              <button class="wi-btn" id="wi-wl">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>
                Watchlist
              </button>
              <a class="wi-btn" data-go="/detail?id=${id}&type=${type}&cat=${cat}">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                Detail
              </a>
            </div>
          </div>

          <!-- EP NAV -->
          ${totalEp>1?`
            <div class="watch-ep-nav">
              ${epNum>1?`<a class="wen-btn" data-go="/watch?id=${id}&type=${type}&cat=${cat}&ep=${epNum-1}">Ep ${epNum-1}</a>`:`<span></span>`}
              ${epNum<totalEp?`<a class="wen-btn next" data-go="/watch?id=${id}&type=${type}&cat=${cat}&ep=${epNum+1}">Ep ${epNum+1}</a>`:`<span></span>`}
            </div>
          `:''}

          <!-- SYNOPSIS -->
          <div class="watch-synopsis">
            <div class="ws-head">
              <h3>Sinopsis</h3>
              <button class="ws-toggle" id="ws-toggle">Selengkapnya</button>
            </div>
            <p class="ws-text collapsed" id="ws-text">${data.overview}</p>
          </div>

          <!-- COMMENTS -->
          <div class="watch-comments">
            <h3>Komentar</h3>
            ${window.Auth?.current
              ? `<div class="wc-compose">
                  ${UI.avatar(window.Auth.current,'sm')}
                  <div class="wcc-wrap">
                    <textarea id="wc-input" placeholder="Tulis komentar..." rows="2"></textarea>
                    <div class="wcc-footer">
                      <span class="wcc-char" id="wcc-char">0/300</span>
                      <button class="wcc-send" id="wcc-send">Kirim</button>
                    </div>
                  </div>
                </div>`
              : `<div class="wc-login">
                  <span>Masuk untuk berkomentar</span>
                  <a class="btn-sm-red" data-go="/auth?m=login">Masuk</a>
                </div>`
            }
            <div id="wc-list"><div class="wc-loading">Memuat komentar...</div></div>
          </div>
        </div>

        <!-- SIDEBAR -->
        <div class="watch-sidebar">
          ${totalEp>1?`
            <div class="wsb-block">
              <div class="wsb-title">${totalEp} Episode</div>
              <div class="wsb-ep-list" id="wsb-eps">
                ${epList.map(n=>`
                  <a class="wsb-ep${n===epNum?' active':''}" data-go="/watch?id=${id}&type=${type}&cat=${cat}&ep=${n}">
                    <div class="wsb-ep-thumb">
                      ${data.poster?`<img src="${data.poster}" alt="ep${n}" loading="lazy"/>`:'<div class="wsb-ep-ph"></div>'}
                    </div>
                    <div class="wsb-ep-info">
                      <span class="wsb-ep-num">Episode ${n}</span>
                    </div>
                    ${n===epNum?`<span class="wsb-ep-dot"></span>`:''}
                  </a>
                `).join('')}
              </div>
            </div>
          `:''}
          <div class="wsb-block">
            <div class="wsb-title">Info</div>
            <div class="wsb-info-row"><span>Kategori</span><span>${C.CATS[cat]?.label||cat}</span></div>
            ${data.year?`<div class="wsb-info-row"><span>Tahun</span><span>${data.year}</span></div>`:''}
            ${data.status?`<div class="wsb-info-row"><span>Status</span><span>${data.status}</span></div>`:''}
            ${data.genres?.length?`<div class="wsb-info-row"><span>Genre</span><span>${data.genres.slice(0,3).join(', ')}</span></div>`:''}
          </div>
        </div>

      </div>
    `, {noFooter:true});

    // Scroll active ep
    setTimeout(() => document.querySelector('.wsb-ep.active')?.scrollIntoView({block:'nearest'}), 100);

    // Synopsis toggle
    const wsToggle = document.getElementById('ws-toggle');
    const wsText = document.getElementById('ws-text');
    wsToggle?.addEventListener('click', () => {
      const collapsed = wsText.classList.toggle('collapsed');
      wsToggle.textContent = collapsed ? 'Selengkapnya' : 'Lebih sedikit';
    });

    // Load HLS.js dynamically
    async function loadHLS() {
      if (window.Hls) return window.Hls;
      return new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest/dist/hls.min.js';
        s.onload = () => resolve(window.Hls);
        s.onerror = reject;
        document.head.appendChild(s);
      });
    }

    function showIframe(src) {
      const loading = document.getElementById('player-loading');
      const iframe  = document.getElementById('watch-iframe');
      const video   = document.getElementById('hls-player');
      if (loading) loading.style.display = 'none';
      if (video)   { video.style.display = 'none'; if (video.hlsInstance) { video.hlsInstance.destroy(); video.hlsInstance = null; } }
      if (iframe)  { iframe.style.display = ''; iframe.src = src; }
    }

    function showHLS(url) {
      const loading = document.getElementById('player-loading');
      const iframe  = document.getElementById('watch-iframe');
      const video   = document.getElementById('hls-player');
      if (loading) loading.style.display = 'none';
      if (iframe)  { iframe.style.display = 'none'; iframe.src = ''; }
      if (!video)  return;
      video.style.display = '';

      if (window.Hls?.isSupported()) {
        if (video.hlsInstance) video.hlsInstance.destroy();
        const hls = new window.Hls({ enableWorker: true, lowLatencyMode: false });
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, () => video.play().catch(() => {}));
        hls.on(window.Hls.Events.ERROR, (_, d) => {
          if (d.fatal) { hls.destroy(); showIframe(embedSources[0]); UI.toast('Auto gagal, pakai Server 2'); }
        });
        video.hlsInstance = hls;
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Safari native HLS
        video.src = url;
        video.play().catch(() => {});
      } else {
        showIframe(embedSources[0]);
      }
    }

    // Auto-load: use best available source per category
    async function autoLoad() {
      const loading = document.getElementById('player-loading');
      if (loading) loading.style.display = '';

      try {
        if (cat === 'donghua') {
          // Donghua: use Anichin (sub Indonesia) → embed fallback
          const embedUrl = await getDonghuaEmbedUrl(data.title, epNum);
          if (embedUrl) {
            showIframe(embedUrl);
          } else {
            showIframe(embedSources[0]);
          }
          return;
        }

        if (cat === 'anime') {
          // Anime: try Consumet/Gogoanime → embed fallback
          await loadHLS();
          const streamUrl = await getAnimeStreamUrl(id, epNum);
          if (streamUrl) {
            showHLS(streamUrl);
          } else {
            showIframe(embedSources[0]);
          }
          return;
        }

        // Drakor / Dracin: try Consumet Dramacool → embed fallback
        await loadHLS();
        const streamUrl = await getDramaStreamUrl(id, type, epNum);
        if (streamUrl) {
          showHLS(streamUrl);
        } else {
          showIframe(embedSources[0]);
        }

      } catch {
        showIframe(embedSources[0]);
      }
    }

    // Start auto load
    autoLoad();

    // Server switcher buttons
    document.querySelectorAll('.wsrc-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.wsrc-btn').forEach(b => b.classList.remove('on'));
        btn.classList.add('on');
        if (btn.dataset.type === 'consumet') {
          autoLoad();
        } else if (btn.dataset.src) {
          showIframe(btn.dataset.src);
          UI.toast('Berganti ke ' + btn.textContent);
        }
      });
    });

    // Watchlist
    const wlBtn = document.getElementById('wi-wl');
    if (wlBtn && window.Auth?.current) {
      const inWL = await window.DB.inWatchlist(id, cat);
      if (inWL) { wlBtn.style.color='var(--teal)'; wlBtn.style.borderColor='var(--teal)'; wlBtn.querySelector('svg').setAttribute('fill','currentColor'); }
      wlBtn.addEventListener('click', async () => {
        try {
          const added = await window.DB.watchlistToggle({id,type,category:cat,title:data.title,poster:data.poster,rating:data.rating,year:data.year});
          UI.toast(added?'Ditambahkan ke watchlist':'Dihapus dari watchlist');
        } catch(e) { if(e.message==='login') Router.go('/auth?m=login'); }
      });
    } else if (wlBtn) {
      wlBtn.addEventListener('click', () => Router.go('/auth?m=login'));
    }

    // Comments
    if (window.DB) {
      const contentId = `${cat}_${id}`;
      let unsub = window.DB.listenComments(contentId, renderComments.bind(null, contentId));

      const input = document.getElementById('wc-input');
      const charEl = document.getElementById('wcc-char');
      input?.addEventListener('input', () => {
        const l = input.value.length;
        if (l>300) input.value = input.value.slice(0,300);
        if (charEl) charEl.textContent = `${Math.min(l,300)}/300`;
      });
      document.getElementById('wcc-send')?.addEventListener('click', async () => {
        const t = input?.value.trim();
        if (!t) return;
        try { await window.DB.addComment(contentId, t); input.value=''; if(charEl) charEl.textContent='0/300'; }
        catch(e) { UI.toast(e.message==='login'?'Login dulu ya':'Komentar gagal dikirim','err'); }
      });
    }

  } catch(err) {
    console.error(err);
    UI.setPage(`<div class="pg-err"><h2>Gagal memuat.</h2><a data-go="/home">Kembali</a></div>`);
  }
};

function renderComments(contentId, comments) {
  const el = document.getElementById('wc-list');
  if (!el) return;
  if (!comments.length) { el.innerHTML = `<p class="wc-empty">Belum ada komentar. Jadilah yang pertama.</p>`; return; }

  el.innerHTML = `<div class="wc-count">${comments.length} komentar</div>` + comments.map(c => `
    <div class="wc-item" id="wci-${c.id}">
      ${c.photo?`<img class="ava sm" src="${c.photo}" alt="${c.name}"/>`:`<div class="ava ph sm">${(c.name||'?').charAt(0)}</div>`}
      <div class="wci-body">
        <div class="wci-head">
          <span class="wci-name">${c.name}</span>
          <span class="wci-time">${fmtTime(c.createdAt)}</span>
          ${window.Auth?.current?.uid===c.uid||window.Auth?.isAdmin()?`<button class="wci-del" data-id="${c.id}">Hapus</button>`:''}
        </div>
        <p class="wci-text">${esc(c.text)}</p>
        <div class="wci-acts">
          <button class="wci-react" data-id="${c.id}" data-t="like">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14z"/><path d="M7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3"/></svg>
            ${c.likes||0}
          </button>
          <button class="wci-react" data-id="${c.id}" data-t="dislike">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 15v4a3 3 0 003 3l4-9V2H5.72a2 2 0 00-2 1.7l-1.38 9a2 2 0 002 2.3H10z"/></svg>
            ${c.dislikes||0}
          </button>
          ${window.Auth?.current?`<button class="wci-reply-btn" data-id="${c.id}">Balas</button>`:''}
        </div>
        <div class="wci-reply-wrap" id="wri-${c.id}" style="display:none">
          <textarea class="wri-input" placeholder="Balas komentar..." rows="2"></textarea>
          <button class="wri-send" data-id="${c.id}">Kirim Balasan</button>
        </div>
        ${(c.replies||[]).length?`
          <div class="wci-replies">
            ${c.replies.map(r=>`
              <div class="wci-rep">
                ${r.photo?`<img class="ava sm" src="${r.photo}" alt="${r.name}"/>`:`<div class="ava ph sm">${(r.name||'?').charAt(0)}</div>`}
                <div class="wcir-body">
                  <div class="wci-head"><span class="wci-name">${r.name}</span><span class="wci-time">${fmtTime(r.at)}</span></div>
                  <p class="wci-text">${esc(r.text)}</p>
                </div>
              </div>
            `).join('')}
          </div>
        `:''}
      </div>
    </div>
  `).join('');

  el.querySelectorAll('.wci-del').forEach(b => b.addEventListener('click', async () => {
    if (!confirm('Hapus komentar?')) return;
    await window.DB.deleteComment(b.dataset.id);
  }));
  el.querySelectorAll('.wci-react').forEach(b => b.addEventListener('click', async () => {
    if (!window.Auth?.current) { Router.go('/auth?m=login'); return; }
    try { await window.DB.reactComment(b.dataset.id, b.dataset.t); } catch {}
  }));
  el.querySelectorAll('.wci-reply-btn').forEach(b => b.addEventListener('click', () => {
    const w = document.getElementById(`wri-${b.dataset.id}`);
    if (w) w.style.display = w.style.display==='none'?'block':'none';
  }));
  el.querySelectorAll('.wri-send').forEach(b => b.addEventListener('click', async () => {
    const w = document.getElementById(`wri-${b.dataset.id}`);
    const t = w?.querySelector('textarea')?.value.trim();
    if (!t) return;
    try { await window.DB.addReply(b.dataset.id, t); w.style.display='none'; }
    catch(e) { UI.toast(e.message,'err'); }
  }));
}

Pages.search = async function({ q='' }) {
  UI.renderNav();
  UI.setPage(`
    <div class="search-pg">
      <h1>Pencarian</h1>
      <div class="search-field">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        <input type="text" id="si" value="${q}" placeholder="Cari anime, drakor, donghua..." autocomplete="off"/>
      </div>
      <div id="sr">${q ? UI.skel(8) : `<p class="empty-msg">Ketik untuk mulai mencari.</p>`}</div>
    </div>
  `);

  const input = document.getElementById('si');
  input?.focus();
  if (q) doSearch(q);

  let t;
  input?.addEventListener('input', () => {
    const v = input.value.trim();
    clearTimeout(t);
    if (!v) { document.getElementById('sr').innerHTML = `<p class="empty-msg">Ketik untuk mulai mencari.</p>`; return; }
    document.getElementById('sr').innerHTML = UI.skel(8);
    t = setTimeout(() => doSearch(v), 450);
  });
};

async function doSearch(q) {
  const el = document.getElementById('sr');
  if (!el) return;
  try {
    const [anime, tmdb] = await Promise.allSettled([API.searchAnime(q), API.searchTMDB(q)]);
    const r = [...(anime.status==='fulfilled'?anime.value:[]), ...(tmdb.status==='fulfilled'?tmdb.value:[])];
    el.innerHTML = r.length
      ? `<p class="search-count">${r.length} hasil untuk "<b>${q}</b>"</p><div class="cards-grid">${r.map(UI.card).join('')}</div>`
      : `<p class="empty-msg">Tidak ada hasil untuk "${q}"</p>`;
  } catch { el.innerHTML = `<p class="empty-msg">Pencarian gagal.</p>`; }
}

function fmtTime(ts) {
  if (!ts) return '';
  try {
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    const diff = (Date.now() - d.getTime()) / 1000;
    if (diff < 60) return 'Baru saja';
    if (diff < 3600) return `${Math.floor(diff/60)} menit lalu`;
    if (diff < 86400) return `${Math.floor(diff/3600)} jam lalu`;
    return `${Math.floor(diff/86400)} hari lalu`;
  } catch { return ''; }
}
function esc(t='') { return t.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
