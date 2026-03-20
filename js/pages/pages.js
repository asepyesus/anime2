// ─── LANDING ─────────────────────────────────────────────────────────────────
Pages.landing = async function() {
  if (window._user) { Router.go('/home'); return; }
  App.nav();
  App.page(`
    <div class="land">
      <section class="land-hero">
        <div class="land-hero-overlay"></div>
        <div class="land-hero-content">
          <div class="land-eyebrow">Platform Streaming Donghua #1</div>
          <h1 class="land-h1">Nonton <span>Donghua</span><br>Subtitle Indonesia</h1>
          <p class="land-desc">Ribuan judul donghua, update otomatis setiap hari, subtitle Indonesia lengkap. Gratis.</p>
          <div class="land-btns">
            <a class="btn-main" data-go="/auth">Mulai Nonton</a>
            <a class="btn-ghost" data-go="/browse">Jelajahi Konten</a>
          </div>
        </div>
      </section>

      <div class="land-strip"><div class="strip-track">
        ${['Donghua','Sub Indonesia','Update Harian','Gratis','HD Quality','Ribuan Judul'].map(t=>`<span>${t}</span><span class="strip-sep">·</span>`).join('').repeat(4)}
      </div></div>

      <section class="land-sec">
        <div class="land-sec-head">
          <div class="land-label">Terbaru</div>
          <h2>Update Hari Ini</h2>
        </div>
        <div id="land-latest">${UI.skel(8)}</div>
      </section>

      <section class="land-sec land-why">
        <h2>Kenapa Kicen Xensai?</h2>
        <div class="why-grid">
          ${[
            ['Sub Indonesia','Semua konten sudah dilengkapi subtitle Indonesia yang akurat.'],
            ['Update Otomatis','Episode baru langsung tersedia begitu tayang.'],
            ['Gratis','Tonton tanpa bayar. Premium untuk pengalaman lebih baik.'],
            ['Komunitas','Diskusi di kolom komentar bersama sesama penggemar.'],
          ].map(([t,d])=>`<div class="why-card"><h3>${t}</h3><p>${d}</p></div>`).join('')}
        </div>
      </section>

      <section class="land-cta">
        <h2>Mulai Sekarang</h2>
        <p>Gratis tanpa syarat. Daftar dalam 30 detik.</p>
        <a class="btn-main" data-go="/auth">Buat Akun Gratis</a>
      </section>
    </div>
  `);

  // Load latest donghua
  try {
    const res = await fetch(`${API_BASE}/`);
    const data = await res.json();
    const latest = data.results?.find(s=>s.section==='latest_release')?.cards || [];
    document.getElementById('land-latest').innerHTML =
      `<div class="cards-grid">${latest.slice(0,8).map(UI.card).join('')}</div>`;
  } catch {
    document.getElementById('land-latest').innerHTML = `<p class="empty">Gagal memuat.</p>`;
  }
};

// ─── HOME (after login) ───────────────────────────────────────────────────────
Pages.home = async function() {
  // Wait for auth to settle
  let tries=0;
  while(window._user===undefined && tries<25) { await new Promise(r=>setTimeout(r,100)); tries++; }
  if (!window._user) { Router.go('/'); return; }

  App.nav();
  const history = JSON.parse(localStorage.getItem('kx_hist')||'[]').slice(0,8);

  App.page(`
    <div class="home-pg">
      <div class="home-greet">
        <div class="hg-left">
          ${UI.ava(window._user)}
          <div>
            <div class="hg-hi">Selamat datang,</div>
            <div class="hg-name">${window._user.name||window._user.displayName||'Penonton'}</div>
          </div>
        </div>
        <a class="hg-search" data-go="/search">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        </a>
      </div>

      ${history.length ? `
        <section class="home-sec">
          <div class="sec-head">
            <h2>Lanjutkan Nonton</h2>
            <button class="sec-more" id="clear-hist">Hapus</button>
          </div>
          <div class="cont-row">
            ${history.map(item=>`
              <a class="cont-card" data-go="/watch?slug=${encodeURIComponent(item.epSlug)}&back=${encodeURIComponent(item.slug)}">
                <div class="cont-img">
                  ${item.thumbnail?`<img src="${item.thumbnail}" alt="${item.title}"/>`:`<div class="cont-np">${item.title?.charAt(0)}</div>`}
                  <div class="cont-shade"></div>
                  <div class="cont-play"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></div>
                </div>
                <div class="cont-info">
                  <div class="cont-title">${item.title}</div>
                  <div class="cont-ep">Ep ${item.ep||1}</div>
                </div>
              </a>
            `).join('')}
          </div>
        </section>
      ` : ''}

      <section class="home-sec">
        <div class="sec-head"><h2>Populer Hari Ini</h2><a class="sec-more" data-go="/browse">Lihat semua</a></div>
        <div id="popular-grid">${UI.skel(8)}</div>
      </section>

      <section class="home-sec">
        <div class="sec-head"><h2>Episode Terbaru</h2><a class="sec-more" data-go="/browse">Lihat semua</a></div>
        <div id="latest-grid">${UI.skel(8)}</div>
      </section>

      <section class="home-sec">
        <div class="sec-head"><h2>Rekomendasi</h2></div>
        <div id="rec-grid">${UI.skel(8)}</div>
      </section>
    </div>
  `);

  document.getElementById('clear-hist')?.addEventListener('click', () => {
    localStorage.removeItem('kx_hist');
    document.querySelector('.home-sec')?.remove();
  });

  try {
    const res = await fetch(`${API_BASE}/`);
    const data = await res.json();
    const sections = data.results || [];
    const get = name => sections.find(s=>s.section===name)?.cards || [];

    const render = (id, cards) => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = cards.length ? `<div class="cards-grid">${cards.slice(0,8).map(UI.card).join('')}</div>` : `<p class="empty">Tidak ada konten.</p>`;
    };

    render('popular-grid', get('popular_today'));
    render('latest-grid',  get('latest_release'));
    render('rec-grid',     get('recommendation'));
  } catch {
    ['popular-grid','latest-grid','rec-grid'].forEach(id => {
      const el = document.getElementById(id);
      if(el) el.innerHTML = `<p class="empty">Gagal memuat.</p>`;
    });
  }
};

// ─── BROWSE ───────────────────────────────────────────────────────────────────
Pages.browse = async function({ page='1', q='' }) {
  App.nav();
  const pg = parseInt(page)||1;

  App.page(`
    <div class="browse-pg">
      <div class="browse-head">
        <h1>Semua Donghua</h1>
        <div class="browse-search">
          <input id="browse-q" type="text" placeholder="Cari judul..." value="${q}" autocomplete="off"/>
        </div>
      </div>
      <div id="browse-grid">${UI.skel(20)}</div>
      <div id="browse-pg"></div>
    </div>
  `);

  // Search on type
  let debounce;
  document.getElementById('browse-q')?.addEventListener('input', e => {
    clearTimeout(debounce);
    debounce = setTimeout(() => {
      const v = e.target.value.trim();
      Router.go(v ? `/browse?q=${encodeURIComponent(v)}` : '/browse');
    }, 450);
  });

  try {
    let cards = [];

    if (q) {
      // Search mode - /search/<query> returns { results: [...] }
      const res  = await fetch(`${API_BASE}/search/${encodeURIComponent(q)}`);
      const data = await res.json();
      const raw  = data.results || data.result?.data || data.result || [];
      cards = Array.isArray(raw) ? raw : [];
    } else {
      // All donghua - /anime?page= returns { results: [...] }
      const res  = await fetch(`${API_BASE}/anime?page=${pg}`);
      const data = await res.json();
      cards = data.results || [];
    }

    const grid = document.getElementById('browse-grid');
    grid.innerHTML = cards.length
      ? `<div class="cards-grid">${cards.map(UI.card).join('')}</div>`
      : `<p class="empty">Tidak ada hasil.</p>`;

    // Show pagination
    if (!q) {
      const pgEl = document.getElementById('browse-pg');
      if (pgEl) {
        pgEl.innerHTML = renderPagination(pg, 50); // anichin has many pages
        pgEl.querySelectorAll('[data-page]').forEach(btn => {
          btn.addEventListener('click', () => Router.go(`/browse?page=${btn.dataset.page}`));
        });
      }
    }

  } catch(e) {
    console.error(e);
    document.getElementById('browse-grid').innerHTML = `<p class="empty">Gagal memuat konten. Coba refresh.</p>`;
  }
};

function renderPagination(cur, total) {
  if (total<=1) return '';
  const pages=[1];
  if (cur>3) pages.push('…');
  for (let i=Math.max(2,cur-1);i<=Math.min(total-1,cur+1);i++) pages.push(i);
  if (cur<total-2) pages.push('…');
  if (total>1) pages.push(total);
  return `<div class="pg">
    ${cur>1?`<button class="pg-btn" data-page="${cur-1}">Prev</button>`:''}
    ${pages.map(p=>p==='…'?`<span class="pg-dot">…</span>`:`<button class="pg-btn${p===cur?' on':''}" data-page="${p}">${p}</button>`).join('')}
    ${cur<total?`<button class="pg-btn" data-page="${cur+1}">Next</button>`:''}
  </div>`;
}

// ─── DETAIL ───────────────────────────────────────────────────────────────────
Pages.detail = async function({ slug }) {
  if (!slug) { Router.go('/browse'); return; }
  App.nav();
  App.page(`<div class="center-spinner"><div class="spinner"></div></div>`);

  try {
    // Cards from homepage/browse use episode slugs like:
    //   "perfect-world-episode-260-subtitle-indonesia"
    // But the API detail endpoint needs series slug like:
    //   "perfect-world"
    // From debug: series slug is everything BEFORE "-episode-N"

    // Step 1: extract series slug
    const seriesSlug = slug
      .split('-episode-')[0]        // "perfect-world-episode-260..." -> "perfect-world"
      .split('-subtitle-indonesia')[0]
      .split('-tamat')[0]
      .replace(/-+$/, '');           // trim trailing dashes

    console.log('[Detail] slug:', slug, '-> seriesSlug:', seriesSlug);

    // Step 2: try series slug, then original
    const toTry = [...new Set([seriesSlug, slug])].filter(Boolean);
    let info = null, finalSlug = null;

    for (const s of toTry) {
      try {
        const r = await fetch(API_BASE + '/' + s);
        const d = await r.json();
        console.log('[Detail] tried:', s, 'result keys:', Object.keys(d.result || {}));
        if (d.result && (d.result.title || d.result.episode || d.result.status)) {
          info = d.result;
          finalSlug = s;
          break;
        }
      } catch(e) { console.warn('[Detail]', s, e.message); }
    }

    if (!info) throw new Error('not found');

    // Normalize field names (API uses "episode" not "episodes")
    const episodes = info.episode || info.episodes || [];
    const title    = info.title || info.name || slug.replace(/-/g,' ').replace(/\b\w/g,c=>c.toUpperCase());
    const thumb    = info.thumbnail || info.poster || '';

    const inWL = await window.DB?.inWatchlist(finalSlug) || false;

    App.page(`
      <div class="detail-pg">
        <div class="detail-hero" style="--bg:url('${thumb}')">
          <div class="detail-fade"></div>
          <div class="detail-body">
            <div class="detail-poster">
              ${thumb ? `<img src="${thumb}" alt="${title}"/>` : `<div class="detail-np">${title.charAt(0)}</div>`}
            </div>
            <div class="detail-info">
              <span class="detail-badge">DONGHUA</span>
              <h1>${title}</h1>
              <div class="detail-meta">
                ${info.type   ? `<span>${info.type}</span>`   : ''}
                ${info.status ? `<span>${info.status}</span>` : ''}
                ${info.country? `<span>${info.country}</span>`: ''}
                ${info.duration?`<span>${info.duration}</span>`:''}
                ${episodes.length ? `<span>${episodes.length} Episode</span>` : ''}
              </div>
              ${info.genres?.length ? `<div class="detail-genres">${info.genres.map(g=>`<span class="genre-chip">${g.name||g}</span>`).join('')}</div>` : ''}
              <p class="detail-overview">${info.synopsis||info.description||''}</p>
              <div class="detail-btns">
                ${episodes.length ? `
                  <a class="btn-watch-now" data-go="/watch?slug=${encodeURIComponent(episodes[episodes.length-1].slug)}&back=${encodeURIComponent(finalSlug)}">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                    Episode Terbaru
                  </a>
                  ${episodes.length > 1 ? `<a class="btn-ghost" style="font-size:.82rem;padding:.55rem 1rem" data-go="/watch?slug=${encodeURIComponent(episodes[0].slug)}&back=${encodeURIComponent(finalSlug)}">Ep 1</a>` : ''}
                ` : ''}
                <button class="btn-wl${inWL?' saved':''}" id="wl-btn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="${inWL?'currentColor':'none'}" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>
                  ${inWL?'Tersimpan':'Watchlist'}
                </button>
              </div>
            </div>
          </div>
        </div>

        ${episodes.length ? `
          <section class="det-sec">
            <h2>Daftar Episode <span class="ep-count">${episodes.length} Episode</span></h2>
            <div class="ep-grid">
              ${episodes.map((ep,i)=>`
                <a class="ep-card" data-go="/watch?slug=${encodeURIComponent(ep.slug)}&back=${encodeURIComponent(finalSlug)}">
                  <div class="ep-num">Ep ${ep.episode||i+1}</div>
                  <div class="ep-title">${ep.subtitle||ep.name||ep.title||'Episode '+(ep.episode||i+1)}</div>
                </a>
              `).join('')}
            </div>
          </section>
        ` : ''}
      </div>
    `);

    // Watchlist
    document.getElementById('wl-btn')?.addEventListener('click', async () => {
      if (!window.Auth?.current) { Router.go('/auth'); return; }
      try {
        const added = await window.DB.watchlistToggle({ slug:finalSlug, title, thumbnail:thumb, type:'donghua' });
        const btn = document.getElementById('wl-btn');
        if (btn) {
          btn.className = 'btn-wl' + (added?' saved':'');
          btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="${added?'currentColor':'none'}" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg> ${added?'Tersimpan':'Watchlist'}`;
        }
        App.toast(added ? 'Ditambahkan ke watchlist' : 'Dihapus dari watchlist');
      } catch { Router.go('/auth'); }
    });

  } catch(e) {
    // Show debug info on screen for HP users
    App.page(`
      <div class="pg-err">
        <h2>Debug Info</h2>
        <div style="background:#0d0d1a;border:1px solid #333;border-radius:8px;padding:1rem;margin:1rem 0;font-family:monospace;font-size:.75rem;text-align:left;word-break:break-all;max-width:500px">
          <div style="color:#e8365d;margin-bottom:.5rem">Error: ${e.message}</div>
          <div style="color:#888">Slug asli: <span style="color:#eee">${slug}</span></div>
          <div style="color:#888;margin-top:.25rem">Series slug: <span style="color:#eee">${slug.split('-episode-')[0]}</span></div>
          <div style="color:#888;margin-top:.25rem">API URL dicoba: <span style="color:#eee">${API_BASE}/${slug.split('-episode-')[0]}</span></div>
        </div>
        <p style="color:var(--t3);font-size:.8rem;max-width:400px;text-align:center">Screenshot info di atas dan kirim ke developer</p>
        <a data-go="/browse" class="btn-main" style="margin-top:1.5rem">Kembali</a>
      </div>
    `);
  }
};

// ─── WATCH ────────────────────────────────────────────────────────────────────
Pages.watch = async function({ slug, back='', ep='1' }) {
  if (!slug) { Router.go('/browse'); return; }
  App.nav();
  App.page(`<div class="center-spinner"><div class="spinner"></div></div>`, true);

  try {
    // Get video sources for this episode
    // Fetch episode info and video sources in parallel
    const [vsRes, epRes] = await Promise.all([
      fetch(`${API_BASE}/video-source/${encodeURIComponent(slug)}`),
      fetch(`${API_BASE}/episode/${encodeURIComponent(slug)}`),
    ]);
    
    const vsData = await vsRes.json();
    const epData = await epRes.json();
    const epInfo = epData.result || {};
    
    // Build sources list
    let sources = [];
    
    // Try API video sources first
    if (vsRes.ok && vsData.result) {
      const raw = vsData.result;
      if (Array.isArray(raw)) sources = raw;
      else if (Array.isArray(raw.sources)) sources = raw.sources;
      else if (Array.isArray(raw.servers)) sources = raw.servers;
      else if (raw.url || raw.src) sources = [raw];
    }
    
    // Always add Anichin embed as fallback (works for all episodes)
    // Anichin episode page URL pattern: https://anichin.moe/<slug>/
    const anichinEmbed = `https://anichin.moe/${slug}/`;
    sources.push({ 
      name: 'Anichin', 
      src: anichinEmbed,
      url: anichinEmbed 
    });

    // Get series info for episode list
    let seriesEps = [];
    let seriesTitle = epInfo.anime_title || epInfo.series_title || epInfo.title || '';
    if (back) {
      try {
        const sRes  = await fetch(`${API_BASE}/${encodeURIComponent(back)}`);
        const sData = await sRes.json();
        seriesEps   = sData.result?.episodes || [];
        seriesTitle = sData.result?.title || seriesTitle;
      } catch {}
    }

    // Save to history
    _saveHistory({ slug:back||slug, epSlug:slug, title:seriesTitle, thumbnail:epInfo.thumbnail||epInfo.anime_thumbnail||'', ep:epInfo.episode_number||ep });

    // Find prev/next
    const curIdx  = seriesEps.findIndex(e=>e.slug===slug);
    const prevEp  = curIdx > 0 ? seriesEps[curIdx-1] : null;
    const nextEp  = curIdx < seriesEps.length-1 ? seriesEps[curIdx+1] : null;

    // Primary source (first available)
    // Normalize primary source - check all possible URL fields
    const primary = sources[0] || null;

    App.page(`
      <div class="watch-pg">
        <div class="watch-main">

          <!-- PLAYER -->
          <div class="watch-player" id="watch-player">
            ${primary?.src || primary?.url || primary?.link || primary?.stream_url
              ? `<iframe id="watch-iframe" 
                  src="${primary.src||primary.url||primary.link||primary.stream_url}" 
                  frameborder="0" 
                  allow="autoplay;fullscreen;picture-in-picture;encrypted-media" 
                  allowfullscreen 
                  referrerpolicy="no-referrer"
                ></iframe>`
              : `<div class="no-video">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="2" width="20" height="20" rx="4"/><path d="m10 8 6 4-6 4V8z"/></svg>
                  <p>Video tidak tersedia untuk episode ini</p>
                  <span style="font-size:.75rem;color:var(--t3);margin-top:.25rem">${sources.length} sumber ditemukan</span>
                </div>`
            }
          </div>

          <!-- SERVER SWITCHER -->
          ${sources.length > 1 ? `
            <div class="server-bar">
              <span class="server-label">Server:</span>
              ${sources.map((src,i)=>{
                const url = src.src||src.url||src.link||src.stream_url||'';
                const label = src.server||src.name||src.quality||`Server ${i+1}`;
                return `<button class="srv-btn${i===0?' on':''}" data-src="${url}" data-idx="${i}">${label}</button>`;
              }).join('')}
            </div>
          ` : ''}

          <!-- EP NAV -->
          <div class="ep-nav">
            ${prevEp ? `<a class="ep-nav-btn" data-go="/watch?slug=${encodeURIComponent(prevEp.slug)}&back=${encodeURIComponent(back)}">← Ep Sebelumnya</a>` : '<span></span>'}
            ${nextEp ? `<a class="ep-nav-btn next" data-go="/watch?slug=${encodeURIComponent(nextEp.slug)}&back=${encodeURIComponent(back)}">Ep Selanjutnya →</a>` : '<span></span>'}
          </div>

          <!-- INFO -->
          <div class="watch-info">
            <div class="wi-title">${seriesTitle}</div>
            <div class="wi-sub">
              ${epInfo.episode_number?`Episode ${epInfo.episode_number}`:''}
              ${epInfo.released?`· ${epInfo.released}`:''}
            </div>
            <div class="wi-acts">
              ${back ? `<a class="wi-btn" data-go="/detail?slug=${encodeURIComponent(back)}">Detail Series</a>` : ''}
            </div>
          </div>

          <!-- COMMENTS -->
          <div class="watch-comments">
            <h3>Komentar</h3>
            ${window.Auth?.current
              ? `<div class="comment-compose">
                  ${UI.ava(window.Auth.current)}
                  <div class="cc-wrap">
                    <textarea id="cc-input" placeholder="Tulis komentar..." rows="2"></textarea>
                    <div class="cc-footer">
                      <span class="cc-char" id="cc-char">0/300</span>
                      <button class="cc-send" id="cc-send">Kirim</button>
                    </div>
                  </div>
                </div>`
              : `<div class="comment-login">
                  <span>Masuk untuk berkomentar</span>
                  <a class="btn-sm" data-go="/auth">Masuk</a>
                </div>`
            }
            <div id="comment-list"><p class="empty">Memuat komentar...</p></div>
          </div>
        </div>

        <!-- SIDEBAR: EPISODE LIST -->
        ${seriesEps.length ? `
          <div class="watch-sidebar">
            <div class="wsb-head">${seriesEps.length} Episode</div>
            <div class="wsb-ep-list" id="ep-list">
              ${seriesEps.map((ep,i)=>`
                <a class="wsb-ep${ep.slug===slug?' active':''}" data-go="/watch?slug=${encodeURIComponent(ep.slug)}&back=${encodeURIComponent(back)}">
                  <span class="wsb-ep-num">Ep ${ep.episode_number||i+1}</span>
                  ${ep.slug===slug?`<span class="wsb-dot"></span>`:''}
                </a>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `, true);

    // Scroll active ep
    setTimeout(()=>document.querySelector('.wsb-ep.active')?.scrollIntoView({block:'nearest'}),100);

    // Server switcher
    document.querySelectorAll('.srv-btn').forEach(btn=>{
      btn.addEventListener('click',()=>{
        const iframe=document.getElementById('watch-iframe');
        if(iframe && btn.dataset.src){ iframe.src=btn.dataset.src; }
        document.querySelectorAll('.srv-btn').forEach(b=>b.classList.remove('on'));
        btn.classList.add('on');
      });
    });

    // Comments
    if (window.DB) {
      const cid = `watch_${slug}`;
      window.DB.listenComments(cid, renderComments.bind(null, cid));
      const ccInput = document.getElementById('cc-input');
      const ccChar  = document.getElementById('cc-char');
      ccInput?.addEventListener('input',()=>{ const l=ccInput.value.length; if(l>300)ccInput.value=ccInput.value.slice(0,300); ccChar.textContent=`${Math.min(l,300)}/300`; });
      document.getElementById('cc-send')?.addEventListener('click', async()=>{
        const t=ccInput?.value.trim();
        if(!t) return;
        try { await window.DB.addComment(cid,t); ccInput.value=''; ccChar.textContent='0/300'; }
        catch(e){ App.toast(e.message==='login'?'Login dulu ya':'Gagal kirim komentar','err'); }
      });
    }

  } catch(e) {
    App.page(`
      <div class="pg-err">
        <h2>Debug Watch Error</h2>
        <div style="background:#0d0d1a;border:1px solid #333;border-radius:8px;padding:1rem;margin:1rem 0;font-family:monospace;font-size:.72rem;text-align:left;word-break:break-all;max-width:500px">
          <div style="color:#e8365d;margin-bottom:.5rem">Error: ${e.message}</div>
          <div style="color:#888">Episode slug:<br/><span style="color:#eee">${slug}</span></div>
          <div style="color:#888;margin-top:.3rem">Series (back):<br/><span style="color:#eee">${back}</span></div>
          <div style="color:#888;margin-top:.3rem">video-source URL:<br/><span style="color:#00d4a8">${API_BASE}/video-source/${slug}</span></div>
        </div>
        <p style="color:var(--t3);font-size:.78rem;max-width:380px;text-align:center">Screenshot dan kirim ke developer</p>
        <a data-go="/browse" class="btn-main" style="margin-top:1rem">Kembali</a>
      </div>
    `, true);
  }
};

function _saveHistory(item) {
  try {
    const h = JSON.parse(localStorage.getItem('kx_hist')||'[]');
    const idx = h.findIndex(x=>x.slug===item.slug);
    if(idx>-1) h.splice(idx,1);
    h.unshift(item);
    localStorage.setItem('kx_hist', JSON.stringify(h.slice(0,20)));
  } catch {}
}

function renderComments(cid, comments) {
  const el=document.getElementById('comment-list');
  if(!el) return;
  if(!comments.length){ el.innerHTML=`<p class="empty">Belum ada komentar.</p>`; return; }
  el.innerHTML=`<div class="c-count">${comments.length} komentar</div>`+comments.map(c=>`
    <div class="c-item">
      ${c.photo?`<img class="ava sm" src="${c.photo}" alt="${c.name}"/>`:`<div class="ava ph sm">${(c.name||'?').charAt(0)}</div>`}
      <div class="c-body">
        <div class="c-head"><span class="c-name">${c.name}</span><span class="c-time">${_fmtTime(c.createdAt)}</span>
          ${window.Auth?.current?.uid===c.uid||window.Auth?.isAdmin()?`<button class="c-del" data-id="${c.id}">Hapus</button>`:''}
        </div>
        <p class="c-text">${_esc(c.text)}</p>
        <div class="c-acts">
          <button class="c-react" data-id="${c.id}" data-t="like"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14z"/><path d="M7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3"/></svg>${c.likes||0}</button>
          <button class="c-react" data-id="${c.id}" data-t="dislike"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 15v4a3 3 0 003 3l4-9V2H5.72a2 2 0 00-2 1.7l-1.38 9a2 2 0 002 2.3H10z"/></svg>${c.dislikes||0}</button>
          ${window.Auth?.current?`<button class="c-reply-btn" data-id="${c.id}">Balas</button>`:''}
        </div>
        <div class="c-reply-wrap" id="crw-${c.id}" style="display:none">
          <textarea class="c-reply-input" placeholder="Balas..." rows="2"></textarea>
          <button class="c-reply-send" data-id="${c.id}">Kirim</button>
        </div>
        ${c.replies?.length?`<div class="c-replies">${c.replies.map(r=>`
          <div class="c-rep">
            ${r.photo?`<img class="ava sm" src="${r.photo}"/>`:`<div class="ava ph sm">${(r.name||'?').charAt(0)}</div>`}
            <div class="c-body"><div class="c-head"><span class="c-name">${r.name}</span><span class="c-time">${_fmtTime(r.at)}</span></div><p class="c-text">${_esc(r.text)}</p></div>
          </div>`).join('')}</div>`:''}
      </div>
    </div>
  `).join('');

  el.querySelectorAll('.c-del').forEach(b=>b.addEventListener('click',async()=>{ if(!confirm('Hapus?'))return; await window.DB.deleteComment(b.dataset.id); }));
  el.querySelectorAll('.c-react').forEach(b=>b.addEventListener('click',async()=>{ if(!window.Auth?.current){Router.go('/auth');return;} try{await window.DB.reactComment(b.dataset.id,b.dataset.t);}catch{} }));
  el.querySelectorAll('.c-reply-btn').forEach(b=>b.addEventListener('click',()=>{ const w=document.getElementById(`crw-${b.dataset.id}`); if(w)w.style.display=w.style.display==='none'?'block':'none'; }));
  el.querySelectorAll('.c-reply-send').forEach(b=>b.addEventListener('click',async()=>{ const w=document.getElementById(`crw-${b.dataset.id}`); const t=w?.querySelector('textarea')?.value.trim(); if(!t)return; try{await window.DB.addReply(b.dataset.id,t);w.style.display='none';}catch(e){App.toast(e.message,'err');} }));
}

// ─── SEARCH ───────────────────────────────────────────────────────────────────
Pages.search = async function({ q='' }) {
  App.nav();
  App.page(`
    <div class="search-pg">
      <h1>Pencarian</h1>
      <div class="search-field">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        <input id="search-input" type="text" value="${q}" placeholder="Cari judul donghua..." autocomplete="off"/>
      </div>
      <div id="search-result">${q?UI.skel(8):'<p class="empty">Ketik untuk mencari.</p>'}</div>
    </div>
  `);

  const input=document.getElementById('search-input');
  input?.focus();
  if(q) doSearch(q);

  let debounce;
  input?.addEventListener('input',()=>{
    clearTimeout(debounce);
    const v=input.value.trim();
    if(!v){document.getElementById('search-result').innerHTML='<p class="empty">Ketik untuk mencari.</p>';return;}
    document.getElementById('search-result').innerHTML=UI.skel(8);
    debounce=setTimeout(()=>doSearch(v),450);
  });
};

async function doSearch(q) {
  const el=document.getElementById('search-result');
  if(!el) return;
  try {
    const res  = await fetch(`${API_BASE}/search/${encodeURIComponent(q)}`);
    const data = await res.json();
    // API returns { result: { data: [...] } } or { result: [...] }
    // Search returns { results: [...], query: "...", total: N }
    let items = [];
    if (Array.isArray(data.results)) {
      items = data.results;
    } else if (Array.isArray(data.result)) {
      items = data.result;
    } else if (Array.isArray(data.result?.data)) {
      items = data.result.data;
    }
    const cards = items.map(item=>({ 
      slug: item.slug, title: item.title || item.headline, 
      thumbnail: item.thumbnail, eps: item.eps, 
      type: item.type || 'Donghua',
      status: item.status,
    }));
    el.innerHTML = cards.length
      ? `<p class="s-count">${cards.length} hasil untuk "<b>${q}</b>"</p><div class="cards-grid">${cards.map(UI.card).join('')}</div>`
      : `<p class="empty">Tidak ada hasil untuk "<b>${q}</b>"</p>`;
  } catch(e) {
    console.error(e);
    el.innerHTML=`<p class="empty">Pencarian gagal. Coba lagi.</p>`;
  }
}

// ─── AUTH ─────────────────────────────────────────────────────────────────────
Pages.auth = async function({ m='login' }) {
  if (window._user) { Router.go('/home'); return; }
  App.nav();

  const renderForm = (mode) => `
    <div class="auth-pg">
      <div class="auth-card">
        <a class="auth-logo" data-go="/">KICEN<span>XENSAI</span></a>
        <div class="auth-tabs">
          <button class="auth-tab${mode==='login'?' on':''}" data-m="login">Masuk</button>
          <button class="auth-tab${mode==='register'?' on':''}" data-m="register">Daftar</button>
        </div>
        <button class="btn-google" id="g-btn">
          <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
          ${mode==='login'?'Masuk':'Daftar'} dengan Google
        </button>
        <div class="auth-or"><span>atau</span></div>
        ${mode==='register'?`<div class="auth-field"><label>Nama</label><input id="af-name" type="text" placeholder="Nama kamu" autocomplete="name"/></div>`:''}
        <div class="auth-field"><label>Email</label><input id="af-email" type="email" placeholder="email@kamu.com" autocomplete="email"/></div>
        <div class="auth-field"><label>Password</label><input id="af-pass" type="password" placeholder="${mode==='register'?'Min. 6 karakter':'Password'}" autocomplete="${mode==='register'?'new-password':'current-password'}"/></div>
        <div class="auth-err" id="af-err"></div>
        <button class="btn-auth" id="af-submit">${mode==='login'?'Masuk':'Buat Akun'}</button>
        <p class="auth-foot">${mode==='login'?'Belum punya akun?':'Sudah punya akun?'} <a data-go="/auth?m=${mode==='login'?'register':'login'}">${mode==='login'?'Daftar':'Masuk'}</a></p>
      </div>
    </div>
  `;

  App.page(renderForm(m), true);
  bindAuth(m);

  // Tab switching
  document.querySelectorAll('.auth-tab').forEach(tab=>{
    tab.addEventListener('click',()=>{
      const mode=tab.dataset.m;
      App.page(renderForm(mode), true);
      bindAuth(mode);
    });
  });
};

function bindAuth(mode) {
  const setErr = msg=>{ const e=document.getElementById('af-err'); if(e) e.textContent=msg; };
  const setLoad= v  =>{ const b=document.getElementById('af-submit'); if(b){b.disabled=v;b.style.opacity=v?'.55':'1';b.textContent=v?'Memuat...':(mode==='login'?'Masuk':'Buat Akun');} };

  function waitForAuth() {
    return new Promise(resolve=>{
      if(window._user){ resolve(); return; }
      window._onNextAuth=()=>resolve();
      setTimeout(resolve, 5000);
    });
  }

  document.getElementById('g-btn')?.addEventListener('click',async()=>{
    setErr('');
    try { await window.Auth.google(); await waitForAuth(); Router.go(sessionStorage.getItem('_ar')||'/home'); sessionStorage.removeItem('_ar'); }
    catch(e){ setErr(_authErr(e.code)); }
  });

  document.getElementById('af-submit')?.addEventListener('click',async()=>{
    setErr('');
    const email=document.getElementById('af-email')?.value.trim();
    const pass =document.getElementById('af-pass')?.value;
    if(mode==='register'){
      const name=document.getElementById('af-name')?.value.trim();
      if(!name) return setErr('Nama tidak boleh kosong.');
      if(!email) return setErr('Email tidak boleh kosong.');
      if(!pass||pass.length<6) return setErr('Password minimal 6 karakter.');
      try{ setLoad(true); await window.Auth.register(email,pass,name); await waitForAuth(); Router.go('/home'); }
      catch(e){ setErr(_authErr(e.code)); } finally{ setLoad(false); }
    } else {
      if(!email) return setErr('Email tidak boleh kosong.');
      if(!pass) return setErr('Password tidak boleh kosong.');
      try{ setLoad(true); await window.Auth.login(email,pass); await waitForAuth(); Router.go(sessionStorage.getItem('_ar')||'/home'); sessionStorage.removeItem('_ar'); }
      catch(e){ setErr(_authErr(e.code)); } finally{ setLoad(false); }
    }
  });

  document.getElementById('af-pass')?.addEventListener('keydown',e=>{ if(e.key==='Enter') document.getElementById('af-submit')?.click(); });
}

function _authErr(code){
  return({'auth/user-not-found':'Email tidak terdaftar.','auth/wrong-password':'Password salah.','auth/invalid-credential':'Email atau password salah.','auth/email-already-in-use':'Email sudah dipakai.','auth/invalid-email':'Format email tidak valid.','auth/too-many-requests':'Terlalu banyak percobaan.','auth/popup-closed-by-user':'Login dibatalkan.','auth/popup-blocked':'Popup diblokir browser.','auth/network-request-failed':'Tidak ada koneksi.'}[code]||`Terjadi kesalahan. Coba lagi.`);
}

// ─── PREMIUM ──────────────────────────────────────────────────────────────────
Pages.premium = async function() {
  App.nav();
  App.page(`
    <div class="prem-pg">
      <div class="prem-hero"><h1>Pilih Paket</h1><p>Nikmati konten tanpa batas.</p></div>
      <div class="prem-plans">
        ${PLANS.map(plan=>`
          <div class="prem-card${plan.hot?' hot':''}">
            ${plan.hot?`<div class="prem-pop">Terpopuler</div>`:''}
            <div class="prem-name" style="color:${plan.color}">${plan.name}</div>
            <div class="prem-price">${plan.price===0?`<span class="pp-free">Gratis</span>`:`<span class="pp-amt">Rp ${plan.price.toLocaleString('id-ID')}</span><span class="pp-per">/bln</span>`}</div>
            <ul class="prem-list">${plan.perks.map(p=>`<li><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${plan.color}" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>${p}</li>`).join('')}</ul>
            <button class="prem-btn${plan.id==='free'?' free':''}" style="--c:${plan.color}" data-plan="${plan.id}">${plan.id==='free'?'Pakai Gratis':`Pilih ${plan.name}`}</button>
          </div>
        `).join('')}
      </div>
      <div class="pay-modal" id="pay-modal">
        <div class="pay-box">
          <button class="pay-close" id="pay-close"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg></button>
          <div id="pay-content"></div>
        </div>
      </div>
    </div>
  `);

  document.querySelectorAll('.prem-btn').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const plan=PLANS.find(p=>p.id===btn.dataset.plan);
      if(!plan||plan.id==='free'){App.toast('Kamu pakai paket Gratis.');return;}
      const modal=document.getElementById('pay-modal');
      const content=document.getElementById('pay-content');
      content.innerHTML=`
        <h2>Paket <span style="color:${plan.color}">${plan.name}</span></h2>
        <div class="pay-price">Rp ${plan.price.toLocaleString('id-ID')} / bulan</div>
        <div class="pay-methods-label">Pilih Metode</div>
        <div class="pay-methods">${PAY_METHODS.map(m=>`<button class="pay-method" data-m="${m.id}">${m.label}</button>`).join('')}</div>
        <div id="pay-action"></div>`;
      modal.classList.add('open');
      document.querySelectorAll('.pay-method').forEach(mb=>{
        mb.addEventListener('click',()=>{
          document.querySelectorAll('.pay-method').forEach(b=>b.classList.remove('on')); mb.classList.add('on');
          document.getElementById('pay-action').innerHTML=`<button class="pay-go" style="background:${plan.color}">Bayar via ${mb.textContent}</button><p class="pay-disc">Demo — tidak ada transaksi nyata.</p>`;
          document.querySelector('.pay-go')?.addEventListener('click',()=>{
            document.getElementById('pay-action').innerHTML=`<div class="pay-ok"><svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="${plan.color}" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="20 6 9 17 4 12"/></svg><h3>Berhasil!</h3><p>Paket ${plan.name} aktif.</p></div>`;
          });
        });
      });
    });
  });
  document.getElementById('pay-close')?.addEventListener('click',()=>document.getElementById('pay-modal')?.classList.remove('open'));
};

// ─── PROFILE ──────────────────────────────────────────────────────────────────
Pages.profile = async function() {
  if(!window._user){sessionStorage.setItem('_ar','/profile');Router.go('/auth');return;}
  App.nav();
  const u=window._user;
  App.page(`
    <div class="prof-pg">
      <div class="prof-header">
        ${u.photo||u.photoURL?`<img class="prof-ava" src="${u.photo||u.photoURL}" alt="av"/>`:`<div class="prof-ava ph">${(u.name||u.displayName||'K').charAt(0).toUpperCase()}</div>`}
        <div class="prof-info">
          <h1>${u.name||u.displayName||'User'}</h1>
          <p>${u.email}</p>
          <div class="prof-badges">
            <span class="badge-role ${u.role||'user'}">${u.role||'user'}</span>
            ${u.banned?`<span class="badge-banned">Banned</span>`:''}
          </div>
        </div>
        <div class="prof-acts">
          ${window.Auth.isAdmin()?`<a class="btn-sm" data-go="/admin">Admin</a>`:''}
          <button class="btn-sm-out" id="logout-btn">Keluar</button>
        </div>
      </div>
      <div class="prof-tabs">
        <button class="prof-tab on" data-tab="wl">Watchlist</button>
        <button class="prof-tab" data-tab="hist">Riwayat</button>
      </div>
      <div id="prof-content"><div class="center-spinner"><div class="spinner"></div></div></div>
    </div>
  `);

  document.getElementById('logout-btn')?.addEventListener('click',async()=>{await window.Auth.logout();Router.go('/');});
  document.querySelectorAll('.prof-tab').forEach(tab=>{
    tab.addEventListener('click',()=>{
      document.querySelectorAll('.prof-tab').forEach(t=>t.classList.remove('on')); tab.classList.add('on');
      tab.dataset.tab==='wl' ? loadWL() : loadHist();
    });
  });
  loadWL();
};

async function loadWL() {
  const el=document.getElementById('prof-content');
  try {
    const list=await window.DB.getWatchlist();
    el.innerHTML=list.length?`<div class="cards-grid">${list.map(UI.card).join('')}</div>`:`<p class="empty" style="padding:2rem 0">Watchlist kosong.</p>`;
  } catch { el.innerHTML=`<p class="empty">Gagal memuat.</p>`; }
}
function loadHist() {
  const el=document.getElementById('prof-content');
  const h=JSON.parse(localStorage.getItem('kx_hist')||'[]');
  el.innerHTML=h.length?`<div class="cards-grid">${h.map(UI.card).join('')}</div>`:`<p class="empty" style="padding:2rem 0">Riwayat kosong.</p>`;
}

// ─── ADMIN ────────────────────────────────────────────────────────────────────
Pages.admin = async function({ tab='dash' }) {
  if(!window.Auth?.current){sessionStorage.setItem('_ar','/admin');Router.go('/auth');return;}
  if(!window.Auth.isAdmin()){App.page(`<div class="pg-err"><h2>Akses ditolak.</h2><a data-go="/home" class="btn-main">Kembali</a></div>`);return;}
  App.nav();
  App.page(`
    <div class="admin-layout">
      <div class="admin-rail">
        <div class="admin-rail-title">Admin</div>
        <a class="admin-nav${tab==='dash'?' on':''}" data-go="/admin?tab=dash">Dashboard</a>
        <a class="admin-nav${tab==='users'?' on':''}" data-go="/admin?tab=users">Users</a>
        <a class="admin-nav${tab==='comments'?' on':''}" data-go="/admin?tab=comments">Komentar</a>
        <a class="admin-back" data-go="/home">← Kembali</a>
      </div>
      <div class="admin-main" id="admin-main"><div class="center-spinner"><div class="spinner"></div></div></div>
    </div>
  `, true);

  const main=document.getElementById('admin-main');
  if(tab==='dash'){
    try{
      const s=await window.DB.stats();
      main.innerHTML=`<h1>Dashboard</h1><div class="admin-stats"><div class="as-card"><div class="as-num">${s.users}</div><div class="as-lbl">Total User</div></div><div class="as-card"><div class="as-num">${s.comments}</div><div class="as-lbl">Total Komentar</div></div></div><div class="admin-quick"><h2>Aksi Cepat</h2><a class="btn-sm" data-go="/admin?tab=users">Kelola User</a><a class="btn-sm" data-go="/admin?tab=comments">Moderasi</a></div>`;
    }catch{main.innerHTML=`<p class="empty">Gagal memuat.</p>`;}
  } else if(tab==='users'){
    try{
      const users=await window.DB.getUsers();
      main.innerHTML=`<h1>Users <span class="admin-badge">${users.length}</span></h1><div class="admin-table-wrap"><table class="admin-table"><thead><tr><th>User</th><th>Role</th><th>Status</th><th>Aksi</th></tr></thead><tbody>${users.map(u=>`<tr class="${u.banned?'row-ban':''}"><td><div class="ut-cell">${u.photo?`<img class="mini-av" src="${u.photo}"/>`:`<div class="mini-av ph">${(u.name||'?').charAt(0)}</div>`}<div><div class="ut-name">${u.name||'-'}</div><div class="ut-email">${u.email||'-'}</div></div></div></td><td><span class="badge-role ${u.role||'user'}">${u.role||'user'}</span></td><td><span class="badge-${u.banned?'banned':'active'}">${u.banned?'Banned':'Aktif'}</span></td><td><div class="tbl-acts"><button class="tbl-btn ${u.banned?'unban':'ban'}" data-uid="${u.id}" data-banned="${u.banned||false}">${u.banned?'Unban':'Ban'}</button>${u.role!=='admin'?`<button class="tbl-btn promote" data-uid="${u.id}">Jadikan Admin</button>`:''}<button class="tbl-btn del-c" data-uid="${u.id}">Hapus Komen</button></div></td></tr>`).join('')}</tbody></table></div>`;
      main.querySelectorAll('.tbl-btn.ban,.tbl-btn.unban').forEach(b=>b.addEventListener('click',async()=>{const ban=b.dataset.banned!=='true';if(!confirm(`${ban?'Ban':'Unban'}?`))return;await window.DB.banUser(b.dataset.uid,ban);Router.go('/admin?tab=users');}));
      main.querySelectorAll('.tbl-btn.promote').forEach(b=>b.addEventListener('click',async()=>{if(!confirm('Jadikan admin?'))return;await window.DB.setRole(b.dataset.uid,'admin');Router.go('/admin?tab=users');}));
      main.querySelectorAll('.tbl-btn.del-c').forEach(b=>b.addEventListener('click',async()=>{if(!confirm('Hapus semua komentar?'))return;await window.DB.nukeComments(b.dataset.uid);App.toast('Komentar dihapus.');}));
    }catch(e){main.innerHTML=`<p class="empty">Gagal: ${e.message}</p>`;}
  } else if(tab==='comments'){
    try{
      const comments=await window.DB.recentComments();
      main.innerHTML=`<h1>Komentar <span class="admin-badge">${comments.length}</span></h1><div class="admin-comments">${!comments.length?'<p class="empty">Belum ada komentar.</p>':comments.map(c=>`<div class="ac-card" id="acc-${c.id}"><div class="ac-head"><b>${c.name}</b><span class="ac-time">${_fmtAdminTime(c.createdAt)}</span><span class="ac-cid">${c.contentId}</span></div><p class="ac-text">${c.text}</p><button class="tbl-btn ban" data-id="${c.id}">Hapus</button></div>`).join('')}</div>`;
      main.querySelectorAll('.ac-card .tbl-btn').forEach(b=>b.addEventListener('click',async()=>{if(!confirm('Hapus?'))return;await window.DB.deleteComment(b.dataset.id);document.getElementById(`acc-${b.dataset.id}`)?.remove();}));
    }catch(e){main.innerHTML=`<p class="empty">Gagal: ${e.message}</p>`;}
  }
};

// ─── SUPPORT ─────────────────────────────────────────────────────────────────
Pages.support = async function() {
  App.nav();
  App.page(`
    <div class="support-pg">
      <div class="support-hero">
        <div class="supp-logo-wrap">
          <div id="supp-logo-click" class="supp-logo-btn">
            <svg viewBox="0 0 60 60" fill="none" width="60" height="60"><rect width="60" height="60" rx="14" fill="#E8365D"/><path d="M18 20v20l10-5 4 8 6-3-4-8 10-5L18 20z" fill="white"/></svg>
          </div>
        </div>
        <h1>Bantuan</h1>
        <p>Temukan jawaban atau hubungi kami.</p>
      </div>

      <div id="supp-contact" style="display:none" class="supp-contact-wrap">
        <div class="supp-contact-card">
          <h3>Hubungi Tim</h3>
          <div class="supp-contacts">
            <a class="sci" href="https://instagram.com/kiki_fzl1" target="_blank"><div class="sci-ico ig"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg></div><div><span class="sci-lbl">Instagram</span><span class="sci-val">@kiki_fzl1</span></div></a>
            <a class="sci" href="https://t.me/kyshiro1" target="_blank"><div class="sci-ico tg"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2 11 13"/><path d="M22 2 15 22l-4-9-9-4 20-7z"/></svg></div><div><span class="sci-lbl">Telegram</span><span class="sci-val">@kyshiro1</span></div></a>
            <a class="sci" href="mailto:kikimodesad8@gmail.com"><div class="sci-ico em"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg></div><div><span class="sci-lbl">Email</span><span class="sci-val">kikimodesad8@gmail.com</span></div></a>
          </div>
        </div>
      </div>

      <div class="support-cards">
        ${[['Video tidak bisa diputar','Coba ganti server. Ada beberapa pilihan server di bawah player.'],['Masalah login','Pastikan email dan password benar. Izinkan popup untuk Google login.'],['Masalah pembayaran','Hubungi kami dengan bukti transaksi. Diproses dalam 1x24 jam.'],['Laporkan bug','Klik logo di atas untuk menghubungi tim kami langsung.']].map(([t,d])=>`<div class="support-card"><h3>${t}</h3><p>${d}</p></div>`).join('')}
      </div>

      <div class="faq-title">FAQ</div>
      ${[['Bagaimana cara upgrade Premium?','Klik tombol Premium di navbar, pilih paket, lalu pilih metode pembayaran.'],['Kenapa video error?','Coba ganti server. Setiap konten punya beberapa pilihan server.'],['Apakah ada aplikasi Android?','Belum ada app resmi. Gunakan browser mobile untuk pengalaman terbaik.']].map(([q,a])=>`<div class="faq-item"><button class="faq-q"><span>${q}</span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg></button><div class="faq-a">${a}</div></div>`).join('')}
    </div>
  `);

  document.getElementById('supp-logo-click')?.addEventListener('click',()=>{
    const el=document.getElementById('supp-contact');
    if(el){ el.style.display=el.style.display==='none'?'block':'none'; if(el.style.display==='block') el.scrollIntoView({behavior:'smooth',block:'center'}); }
  });
  document.querySelectorAll('.faq-q').forEach(btn=>{
    btn.addEventListener('click',()=>{ const item=btn.closest('.faq-item'); const was=item.classList.contains('open'); document.querySelectorAll('.faq-item').forEach(i=>i.classList.remove('open')); if(!was)item.classList.add('open'); });
  });
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function _fmtTime(ts){if(!ts)return'';try{const d=ts.toDate?ts.toDate():new Date(ts);const diff=(Date.now()-d)/1000;if(diff<60)return'Baru saja';if(diff<3600)return`${Math.floor(diff/60)} menit lalu`;if(diff<86400)return`${Math.floor(diff/3600)} jam lalu`;return`${Math.floor(diff/86400)} hari lalu`;}catch{return'';}}
function _fmtAdminTime(ts){try{const d=ts?.toDate?ts.toDate():new Date(ts);return d.toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'});}catch{return'';}}
function _esc(t=''){return t.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
