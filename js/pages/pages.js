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
// ─── RENDER COMMENTS ─────────────────────────────────────────────────────────
function renderComments(cid, comments) {
  const el = document.getElementById('comment-list');
  if (!el) return;
  if (!comments.length) { el.innerHTML = `<p class="empty">Belum ada komentar.</p>`; return; }
  el.innerHTML = `<div class="c-count">${comments.length} komentar</div>` + comments.map(c => `
    <div class="c-item">
      ${c.photo ? `<img class="ava sm" src="${c.photo}" alt="${c.name}"/>` : `<div class="ava ph sm">${(c.name||'?').charAt(0)}</div>`}
      <div class="c-body">
        <div class="c-head">
          <span class="c-name">${c.name}</span>
          <span class="c-time">${_fmtTime(c.createdAt)}</span>
          ${window.Auth?.current?.uid===c.uid||window.Auth?.isAdmin() ? `<button class="c-del" data-id="${c.id}">Hapus</button>` : ''}
        </div>
        <p class="c-text">${_esc(c.text)}</p>
        <div class="c-acts">
          <button class="c-react" data-id="${c.id}" data-t="like">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14z"/></svg>
            ${c.likes||0}
          </button>
          <button class="c-react" data-id="${c.id}" data-t="dislike">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 15v4a3 3 0 003 3l4-9V2H5.72a2 2 0 00-2 1.7l-1.38 9a2 2 0 002 2.3H10z"/></svg>
            ${c.dislikes||0}
          </button>
          ${window.Auth?.current ? `<button class="c-reply-btn" data-id="${c.id}">Balas</button>` : ''}
        </div>
        <div class="c-reply-wrap" id="crw-${c.id}" style="display:none">
          <textarea class="c-reply-input" placeholder="Balas..." rows="2"></textarea>
          <button class="c-reply-send" data-id="${c.id}">Kirim</button>
        </div>
        ${c.replies?.length ? `<div class="c-replies">${c.replies.map(r=>`
          <div class="c-rep">
            ${r.photo?`<img class="ava sm" src="${r.photo}"/>`:`<div class="ava ph sm">${(r.name||'?').charAt(0)}</div>`}
            <div class="c-body">
              <div class="c-head"><span class="c-name">${r.name}</span><span class="c-time">${_fmtTime(r.at)}</span></div>
              <p class="c-text">${_esc(r.text)}</p>
            </div>
          </div>`).join('')}</div>` : ''}
      </div>
    </div>
  `).join('');

  el.querySelectorAll('.c-del').forEach(b => b.addEventListener('click', async () => { if(!confirm('Hapus?'))return; await window.DB.deleteComment(b.dataset.id); }));
  el.querySelectorAll('.c-react').forEach(b => b.addEventListener('click', async () => { if(!window.Auth?.current){Router.go('/auth');return;} try{await window.DB.reactComment(b.dataset.id,b.dataset.t);}catch{} }));
  el.querySelectorAll('.c-reply-btn').forEach(b => b.addEventListener('click', () => { const w=document.getElementById(`crw-${b.dataset.id}`); if(w) w.style.display=w.style.display==='none'?'block':'none'; }));
  el.querySelectorAll('.c-reply-send').forEach(b => b.addEventListener('click', async () => { const w=document.getElementById(`crw-${b.dataset.id}`); const t=w?.querySelector('textarea')?.value.trim(); if(!t)return; try{await window.DB.addReply(b.dataset.id,t);w.style.display='none';}catch(e){App.toast(e.message,'err');} }));
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function _saveHistory(item) {
  try {
    const h = JSON.parse(localStorage.getItem('kx_hist') || '[]');
    const idx = h.findIndex(x => x.slug === item.slug);
    if (idx > -1) h.splice(idx, 1);
    h.unshift(item);
    localStorage.setItem('kx_hist', JSON.stringify(h.slice(0, 20)));
  } catch {}
}

function _fmtTime(ts) {
  if (!ts) return '';
  try {
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    const diff = (Date.now() - d) / 1000;
    if (diff < 60) return 'Baru saja';
    if (diff < 3600) return `${Math.floor(diff/60)} menit lalu`;
    if (diff < 86400) return `${Math.floor(diff/3600)} jam lalu`;
    return `${Math.floor(diff/86400)} hari lalu`;
  } catch { return ''; }
}

function _fmtAdminTime(ts) {
  try {
    const d = ts?.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString('id-ID', { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' });
  } catch { return ''; }
}

function _esc(t = '') {
  return t.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

Pages.watch = async function({ slug, back='' }) {
  if (!slug) { Router.go('/browse'); return; }
  App.nav();
  App.page(`<div class="center-spinner"><div class="spinner"></div></div>`, true);

  try {
    // Fetch episode + series info
    const epRes = await fetch(`${API_BASE}/episode/${slug}`);
    const epData = await epRes.json();
    const epInfo = epData.result || {};

    // Get series episodes for sidebar
    let seriesEps = [];
    let seriesTitle = '';
    if (back) {
      try {
        const sRes  = await fetch(`${API_BASE}/${back}`);
        const sData = await sRes.json();
        const r     = sData.result || {};
        // API returns "episode" (singular) as array
        const raw   = r.episode || r.episodes || [];
        seriesEps   = Array.isArray(raw) ? raw : [];
        seriesTitle = typeof r.title === 'string' ? r.title : '';
      } catch {}
    }

    // epInfo.episode is episode NUMBER (string like "162"), not array
    const epNum = typeof epInfo.episode === 'string' || typeof epInfo.episode === 'number'
      ? String(epInfo.episode)
      : '?';

    // seriesTitle fallback from epInfo
    if (!seriesTitle) {
      seriesTitle = typeof epInfo.anime_title === 'string' ? epInfo.anime_title
        : typeof epInfo.series_title === 'string' ? epInfo.series_title
        : typeof epInfo.title === 'string' ? epInfo.title
        : back.replace(/-/g,' ').replace(/\w/g,c=>c.toUpperCase());
    }

    // Prev / Next episode in sidebar list
    const curIdx = seriesEps.findIndex(e => e.slug === slug);
    const prevEp = curIdx > 0 ? seriesEps[curIdx - 1] : null;
    const nextEp = curIdx >= 0 && curIdx < seriesEps.length - 1 ? seriesEps[curIdx + 1] : null;

    // Embed URL — use anichin.moe direct episode page
    const embedUrl = `https://anichin.moe/${slug}/`;

    App.page(`
      <div class="watch-pg">
        <div class="watch-main">

          <div class="watch-player">
            <iframe
              id="watch-iframe"
              src="${embedUrl}"
              frameborder="0"
              scrolling="no"
              allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
              allowfullscreen
              referrerpolicy="no-referrer"
            ></iframe>
          </div>

          <div class="ep-nav-bar">
            ${prevEp
              ? `<a class="ep-nav-btn" data-go="/watch?slug=${encodeURIComponent(prevEp.slug)}&back=${encodeURIComponent(back)}">← Sebelumnya</a>`
              : `<span></span>`}
            <span class="ep-nav-info">${seriesTitle} · Ep ${epNum}</span>
            ${nextEp
              ? `<a class="ep-nav-btn next" data-go="/watch?slug=${encodeURIComponent(nextEp.slug)}&back=${encodeURIComponent(back)}">Selanjutnya →</a>`
              : `<span></span>`}
          </div>

          <div class="watch-info">
            <div class="wi-title">${seriesTitle}</div>
            <div class="wi-sub">Episode ${epNum}${epInfo.date ? ' · ' + epInfo.date : ''}</div>
            <div class="wi-acts">
              ${back ? `<a class="wi-btn" data-go="/detail?slug=${encodeURIComponent(back)}">← Detail Series</a>` : ''}
            </div>
          </div>

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

        ${seriesEps.length ? `
          <div class="watch-sidebar">
            <div class="wsb-head">${seriesEps.length} Episode</div>
            <div class="wsb-ep-list">
              ${seriesEps.map((ep, i) => `
                <a class="wsb-ep${ep.slug === slug ? ' active' : ''}"
                   data-go="/watch?slug=${encodeURIComponent(ep.slug)}&back=${encodeURIComponent(back)}">
                  <span class="wsb-ep-num">Ep ${ep.episode || i + 1}</span>
                  ${ep.slug === slug ? '<span class="wsb-dot"></span>' : ''}
                </a>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `, true);

    // Save history
    _saveHistory({
      slug: back || slug,
      epSlug: slug,
      title: seriesTitle,
      thumbnail: '',
      ep: epNum,
    });

    // Scroll active ep into view
    setTimeout(() => document.querySelector('.wsb-ep.active')?.scrollIntoView({ block: 'nearest' }), 100);

    // Comments
    if (window.DB) {
      const cid = `watch_${slug}`;
      window.DB.listenComments(cid, renderComments.bind(null, cid));
      const ccInput = document.getElementById('cc-input');
      const ccChar  = document.getElementById('cc-char');
      ccInput?.addEventListener('input', () => {
        if (ccInput.value.length > 300) ccInput.value = ccInput.value.slice(0, 300);
        if (ccChar) ccChar.textContent = `${ccInput.value.length}/300`;
      });
      document.getElementById('cc-send')?.addEventListener('click', async () => {
        const t = ccInput?.value.trim();
        if (!t) return;
        try { await window.DB.addComment(cid, t); ccInput.value = ''; if (ccChar) ccChar.textContent = '0/300'; }
        catch(e) { App.toast(e.message === 'login' ? 'Login dulu ya' : 'Gagal kirim', 'err'); }
      });
    }

  } catch(e) {
    App.page(`
      <div class="pg-err">
        <h2>Error</h2>
        <div style="background:#0d0d1a;border:1px solid #333;border-radius:8px;padding:1rem;margin:1rem 0;font-family:monospace;font-size:.72rem;text-align:left;word-break:break-all;max-width:500px">
          <div style="color:#e8365d">${e.message}</div>
          <div style="color:#888;margin-top:.3rem">Slug: ${slug}</div>
          <div style="color:#888;margin-top:.3rem">Back: ${back}</div>
        </div>
        <a data-go="/browse" class="btn-main" style="margin-top:1rem">Kembali</a>
      </div>
    `, true);
  }
};


