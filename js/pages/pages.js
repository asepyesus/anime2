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
    const d = ts?.toDate ? ts.toDate() : new Date(ts);
    const diff = (Date.now() - d) / 1000;
    if (diff < 60) return 'Baru saja';
    if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
    return `${Math.floor(diff / 86400)} hari lalu`;
  } catch { return ''; }
}

function _fmtAdminTime(ts) {
  try {
    const d = ts?.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch { return ''; }
}

function renderPagination(cur, total) {
  if (total <= 1) return '';
  const pages = [1];
  if (cur > 3) pages.push('…');
  for (let i = Math.max(2, cur - 1); i <= Math.min(total - 1, cur + 1); i++) pages.push(i);
  if (cur < total - 2) pages.push('…');
  if (total > 1) pages.push(total);
  return `<div class="pg">
    ${cur > 1 ? `<button class="pg-btn" data-page="${cur - 1}">‹ Prev</button>` : ''}
    ${pages.map(p => p === '…'
      ? `<span class="pg-dot">…</span>`
      : `<button class="pg-btn${p === cur ? ' on' : ''}" data-page="${p}">${p}</button>`
    ).join('')}
    ${cur < total ? `<button class="pg-btn" data-page="${cur + 1}">Next ›</button>` : ''}
  </div>`;
}

// Normalize API response — berbagai format dari backend
function _normalizeCards(data) {
  // bisa: { result: [...] } atau { results: [...] } atau array langsung
  const raw = data?.result ?? data?.results ?? data;
  if (Array.isArray(raw)) return raw;
  // bisa sections array: [{ section: 'latest_release', cards: [...] }]
  if (Array.isArray(raw)) return raw;
  return [];
}

function _getSection(sections, name) {
  if (!Array.isArray(sections)) return [];
  return sections.find(s => s.section === name)?.cards || [];
}

// ─── LANDING ─────────────────────────────────────────────────────────────────
Pages.landing = async function () {
  if (window._user) { Router.go('/home'); return; }
  App.nav();
  App.page(`
    <div class="land">
      <section class="land-hero">
        <div class="land-hero-overlay"></div>
        <div class="land-hero-content">
          <div class="land-eyebrow">Platform Streaming Donghua #1</div>
          <h1 class="land-h1">Nonton <span>Donghua</span><br>Subtitle Indonesia</h1>
          <p class="land-desc">Ribuan judul donghua, update otomatis setiap hari, subtitle Indonesia lengkap. Gratis selamanya.</p>
          <div class="land-btns">
            <a class="btn-main" data-go="/auth">Mulai Nonton Gratis</a>
            <a class="btn-ghost" data-go="/browse">Jelajahi Konten</a>
          </div>
        </div>
      </section>

      <div class="land-strip">
        <div class="strip-track">
          ${['Donghua', 'Sub Indonesia', 'Update Harian', 'Gratis', 'HD Quality', 'Ribuan Judul', 'Komunitas', 'No Ads']
            .map(t => `<span>${t}</span><span class="strip-sep">·</span>`).join('').repeat(4)}
        </div>
      </div>

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
            ['Sub Indonesia', 'Semua konten sudah dilengkapi subtitle Indonesia yang akurat dan rapi.'],
            ['Update Otomatis', 'Episode baru langsung tersedia setelah tayang, tanpa perlu nunggu lama.'],
            ['Sepenuhnya Gratis', 'Tonton tanpa bayar. Premium tersedia untuk pengalaman yang lebih baik.'],
            ['Komunitas Aktif', 'Diskusi dan berkomentar bersama sesama penggemar donghua.'],
          ].map(([t, d]) => `<div class="why-card"><h3>${t}</h3><p>${d}</p></div>`).join('')}
        </div>
      </section>

      <section class="land-stats">
        <div class="stat-item"><div class="stat-num">1000+</div><div class="stat-lbl">Judul Tersedia</div></div>
        <div class="stat-div"></div>
        <div class="stat-item"><div class="stat-num">50+</div><div class="stat-lbl">Update per Minggu</div></div>
        <div class="stat-div"></div>
        <div class="stat-item"><div class="stat-num">100%</div><div class="stat-lbl">Gratis Selamanya</div></div>
      </section>

      <section class="land-cta">
        <h2>Mulai Sekarang</h2>
        <p>Gratis tanpa syarat. Daftar dalam 30 detik.</p>
        <a class="btn-main" data-go="/auth">Buat Akun Gratis</a>
      </section>
    </div>
  `);

  try {
    const res  = await fetch(`${API_BASE}/`);
    const data = await res.json();
    const sections = data.results || [];
    const latest = _getSection(sections, 'latest_release') || _normalizeCards(data);
    document.getElementById('land-latest').innerHTML =
      latest.length
        ? `<div class="cards-grid">${latest.slice(0, 8).map(UI.card).join('')}</div>`
        : `<p class="empty">Konten sedang dimuat...</p>`;
  } catch {
    document.getElementById('land-latest').innerHTML = `<p class="empty">Gagal memuat. Coba refresh.</p>`;
  }
};

// ─── HOME ─────────────────────────────────────────────────────────────────────
Pages.home = async function () {
  let tries = 0;
  while (window._user === undefined && tries < 25) { await new Promise(r => setTimeout(r, 100)); tries++; }
  if (!window._user) { Router.go('/'); return; }

  App.nav();
  const history = JSON.parse(localStorage.getItem('kx_hist') || '[]').slice(0, 8);

  App.page(`
    <div class="home-pg">
      <div class="home-greet">
        <div class="hg-left">
          ${UI.ava(window._user)}
          <div>
            <div class="hg-hi">Selamat datang,</div>
            <div class="hg-name">${_esc(window._user.name || window._user.displayName || 'Penonton')}</div>
          </div>
        </div>
        <button class="hg-search" id="hg-search-btn" title="Cari">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
        </button>
      </div>

      ${history.length ? `
        <section class="home-sec">
          <div class="sec-head">
            <h2>Lanjutkan Nonton</h2>
            <button class="sec-more" id="clear-hist">Hapus riwayat</button>
          </div>
          <div class="cont-row">
            ${history.map(item => `
              <a class="cont-card" data-go="/watch?slug=${encodeURIComponent(item.epSlug || item.slug)}&back=${encodeURIComponent(item.slug)}">
                <div class="cont-img">
                  ${item.thumbnail ? `<img src="${item.thumbnail}" alt="${_escAttr(item.title)}"/>` : `<div class="cont-np">${item.title?.charAt(0) || '?'}</div>`}
                  <div class="cont-shade"></div>
                  <div class="cont-play">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                  </div>
                </div>
                <div class="cont-info">
                  <div class="cont-title">${_esc(item.title || '')}</div>
                  <div class="cont-ep">Ep ${item.ep || 1}</div>
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

  document.getElementById('hg-search-btn')?.addEventListener('click', () => Router.go('/search'));
  document.getElementById('clear-hist')?.addEventListener('click', () => {
    localStorage.removeItem('kx_hist');
    document.querySelector('.home-sec')?.remove();
  });

  try {
    const res = await fetch(`${API_BASE}/`);
    const data = await res.json();
    const sections = data.results || [];
    const get = name => _getSection(sections, name);

    const render = (id, cards) => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = cards.length
        ? `<div class="cards-grid">${cards.slice(0, 8).map(UI.card).join('')}</div>`
        : `<p class="empty">Tidak ada konten.</p>`;
    };

    render('popular-grid', get('popular_today'));
    render('latest-grid', get('latest_release'));
    render('rec-grid', get('recommendation'));
  } catch {
    ['popular-grid', 'latest-grid', 'rec-grid'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = `<p class="empty">Gagal memuat.</p>`;
    });
  }
};

// ─── BROWSE ───────────────────────────────────────────────────────────────────
Pages.browse = async function ({ page = '1', q = '' }) {
  App.nav();
  const pg = parseInt(page) || 1;

  App.page(`
    <div class="browse-pg">
      <div class="browse-head">
        <h1>Semua Donghua</h1>
        <div class="browse-search">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input id="browse-q" type="text" placeholder="Cari judul..." value="${_escAttr(q)}" autocomplete="off" spellcheck="false"/>
          ${q ? `<button id="browse-clear" class="browse-clear">✕</button>` : ''}
        </div>
      </div>
      <div id="browse-grid">${UI.skel(20)}</div>
      <div id="browse-pg"></div>
    </div>
  `);

  let debounce;
  document.getElementById('browse-q')?.addEventListener('input', e => {
    clearTimeout(debounce);
    debounce = setTimeout(() => {
      const v = e.target.value.trim();
      Router.go(v ? `/browse?q=${encodeURIComponent(v)}` : '/browse');
    }, 450);
  });

  document.getElementById('browse-clear')?.addEventListener('click', () => Router.go('/browse'));

  try {
    let cards = [];
    if (q) {
      const res  = await fetch(`${API_BASE}/search/${encodeURIComponent(q)}`);
      const data = await res.json();
      const raw  = data.result || data.results || [];
      cards = Array.isArray(raw) ? raw : [];
    } else {
      const res  = await fetch(`${API_BASE}/anime?page=${pg}`);
      const data = await res.json();
      cards = data.result || data.results || [];
      if (!Array.isArray(cards)) cards = [];
    }

    document.getElementById('browse-grid').innerHTML = cards.length
      ? `<div class="cards-grid">${cards.map(UI.card).join('')}</div>`
      : `<p class="empty">Tidak ada hasil ditemukan.</p>`;

    if (!q) {
      const pgEl = document.getElementById('browse-pg');
      if (pgEl) {
        pgEl.innerHTML = renderPagination(pg, 50);
        pgEl.querySelectorAll('[data-page]').forEach(btn => {
          btn.addEventListener('click', () => Router.go(`/browse?page=${btn.dataset.page}`));
        });
      }
    }
  } catch (e) {
    console.error('[browse]', e);
    document.getElementById('browse-grid').innerHTML = `<p class="empty">Gagal memuat konten. Coba refresh.</p>`;
  }
};

// ─── SEARCH ───────────────────────────────────────────────────────────────────
Pages.search = async function ({ q = '' }) {
  App.nav();

  App.page(`
    <div class="search-pg">
      <h1>Cari Donghua</h1>
      <div class="search-field">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input id="search-input" type="text" placeholder="Ketik nama donghua..." value="${_escAttr(q)}" autocomplete="off" spellcheck="false"/>
      </div>
      <div id="search-results">
        ${q ? UI.skel(10) : `<p class="empty">Ketik sesuatu untuk mulai mencari.</p>`}
      </div>
    </div>
  `);

  const input = document.getElementById('search-input');
  input?.focus();

  let debounce;
  const doSearch = async (query) => {
    if (!query) {
      document.getElementById('search-results').innerHTML = `<p class="empty">Ketik sesuatu untuk mulai mencari.</p>`;
      return;
    }
    document.getElementById('search-results').innerHTML = UI.skel(10);
    try {
      const res  = await fetch(`${API_BASE}/search/${encodeURIComponent(query)}`);
      const data = await res.json();
      const raw  = data.result || data.results || [];
      const cards = Array.isArray(raw) ? raw : [];
      const el = document.getElementById('search-results');
      if (!el) return;
      if (cards.length) {
        el.innerHTML = `<div class="s-count">Ditemukan <b>${cards.length}</b> hasil untuk "<b>${_esc(query)}</b>"</div>
          <div class="cards-grid">${cards.map(UI.card).join('')}</div>`;
      } else {
        el.innerHTML = `<p class="empty">Tidak ada hasil untuk "<b>${_esc(query)}</b>"</p>`;
      }
    } catch {
      document.getElementById('search-results').innerHTML = `<p class="empty">Gagal mencari. Coba lagi.</p>`;
    }
  };

  if (q) doSearch(q);

  input?.addEventListener('input', e => {
    clearTimeout(debounce);
    const v = e.target.value.trim();
    history.replaceState({}, '', v ? `/search?q=${encodeURIComponent(v)}` : '/search');
    debounce = setTimeout(() => doSearch(v), 420);
  });

  input?.addEventListener('keydown', e => {
    if (e.key === 'Enter') { clearTimeout(debounce); doSearch(input.value.trim()); }
  });
};

// ─── DETAIL ───────────────────────────────────────────────────────────────────
Pages.detail = async function ({ slug }) {
  if (!slug) { Router.go('/browse'); return; }
  App.nav();
  App.page(`<div class="center-spinner"><div class="spinner"></div></div>`);

  try {
    // Extract series slug from episode slug
    const seriesSlug = slug
      .replace(/-subtitle-indonesia.*$/, '')
      .replace(/-sub-indo.*$/, '')
      .replace(/-episode-\d+.*$/, '')
      .replace(/-eps-\d+.*$/, '')
      .replace(/-ep-\d+.*$/, '')
      .replace(/-tamat.*$/, '')
      .replace(/-+$/, '');

    const toTry = [...new Set([seriesSlug, slug])].filter(Boolean);
    let info = null, finalSlug = null;

    for (const s of toTry) {
      try {
        const r = await fetch(`${API_BASE}/${s}`);
        if (!r.ok) continue;
        const d = await r.json();
        if (d.result && (d.result.title || d.result.episode || d.result.episodes || d.result.status)) {
          info = d.result;
          finalSlug = s;
          break;
        }
      } catch {}
    }

    if (!info) throw new Error('not_found');

    const episodes = Array.isArray(info.episode) ? info.episode
      : Array.isArray(info.episodes) ? info.episodes : [];
    const title = info.title || info.name || slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    const thumb = info.thumbnail || info.poster || info.cover || '';
    const synopsis = info.synopsis || info.description || info.overview || '';

    const inWL = await window.DB?.inWatchlist(finalSlug).catch(() => false) || false;

    App.page(`
      <div class="detail-pg">
        <div class="detail-hero" style="--bg:url('${thumb}')">
          <div class="detail-fade"></div>
          <div class="detail-body">
            <div class="detail-poster">
              ${thumb
                ? `<img src="${thumb}" alt="${_escAttr(title)}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"/>
                   <div class="detail-np" style="display:none">${title.charAt(0)}</div>`
                : `<div class="detail-np">${title.charAt(0)}</div>`
              }
            </div>
            <div class="detail-info">
              <span class="detail-badge">DONGHUA</span>
              <h1>${_esc(title)}</h1>
              <div class="detail-meta">
                ${info.type     ? `<span>${_esc(info.type)}</span>`     : ''}
                ${info.status   ? `<span>${_esc(info.status)}</span>`   : ''}
                ${info.country  ? `<span>${_esc(info.country)}</span>`  : ''}
                ${info.duration ? `<span>${_esc(info.duration)}</span>` : ''}
                ${info.rating   ? `<span>★ ${_esc(String(info.rating))}</span>` : ''}
                ${episodes.length ? `<span>${episodes.length} Episode</span>` : ''}
              </div>
              ${info.genres?.length
                ? `<div class="detail-genres">${info.genres.map(g => `<span class="genre-chip">${_esc(g.name || g)}</span>`).join('')}</div>`
                : ''}
              ${synopsis ? `<p class="detail-overview">${_esc(synopsis)}</p>` : ''}
              <div class="detail-btns">
                ${episodes.length ? `
                  <a class="btn-watch-now" data-go="/watch?slug=${encodeURIComponent(episodes[episodes.length - 1].slug)}&back=${encodeURIComponent(finalSlug)}">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                    Episode Terbaru
                  </a>
                  ${episodes.length > 1 ? `
                    <a class="btn-ghost" style="font-size:.82rem;padding:.55rem 1rem"
                       data-go="/watch?slug=${encodeURIComponent(episodes[0].slug)}&back=${encodeURIComponent(finalSlug)}">
                      Ep 1
                    </a>` : ''}
                ` : ''}
                <button class="btn-wl${inWL ? ' saved' : ''}" id="wl-btn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="${inWL ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>
                  </svg>
                  ${inWL ? 'Tersimpan' : 'Watchlist'}
                </button>
              </div>
            </div>
          </div>
        </div>

        ${episodes.length ? `
          <section class="det-sec">
            <h2>Daftar Episode <span class="ep-count">${episodes.length} Episode</span></h2>
            <div class="ep-grid">
              ${episodes.map((ep, i) => `
                <a class="ep-card" data-go="/watch?slug=${encodeURIComponent(ep.slug)}&back=${encodeURIComponent(finalSlug)}">
                  <div class="ep-num">Ep ${ep.episode || i + 1}</div>
                  <div class="ep-title">${_esc(ep.subtitle || ep.name || ep.title || 'Episode ' + (ep.episode || i + 1))}</div>
                </a>
              `).join('')}
            </div>
          </section>
        ` : `<div class="center-spinner" style="min-height:200px"><p class="empty">Belum ada episode tersedia.</p></div>`}
      </div>
    `);

    document.getElementById('wl-btn')?.addEventListener('click', async () => {
      if (!window.Auth?.current) { Router.go('/auth'); return; }
      try {
        const added = await window.DB.watchlistToggle({ slug: finalSlug, title, thumbnail: thumb, type: 'donghua' });
        const btn = document.getElementById('wl-btn');
        if (btn) {
          btn.className = 'btn-wl' + (added ? ' saved' : '');
          btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="${added ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg> ${added ? 'Tersimpan' : 'Watchlist'}`;
        }
        App.toast(added ? 'Ditambahkan ke watchlist' : 'Dihapus dari watchlist');
      } catch { Router.go('/auth'); }
    });

  } catch (e) {
    App.page(`
      <div class="pg-err">
        <div class="pg-err-num">!</div>
        <h2>Konten Tidak Ditemukan</h2>
        <p>Donghua ini mungkin belum tersedia atau slug tidak valid.</p>
        <a data-go="/browse" class="btn-main">Jelajahi Konten Lain</a>
      </div>
    `);
  }
};

// ─── WATCH ────────────────────────────────────────────────────────────────────
Pages.watch = async function ({ slug, back = '' }) {
  if (!slug) { Router.go('/browse'); return; }
  App.nav();
  App.page(`<div class="center-spinner"><div class="spinner"></div></div>`, true);

  try {
    const epRes  = await fetch(`${API_BASE}/episode/${slug}`);
    const epData = await epRes.json();
    const epInfo = epData.result || {};

    let seriesEps = [], seriesTitle = '';
    if (back) {
      try {
        const sRes  = await fetch(`${API_BASE}/${back}`);
        const sData = await sRes.json();
        const r     = sData.result || {};
        const raw   = r.episode || r.episodes || [];
        seriesEps   = Array.isArray(raw) ? raw : [];
        seriesTitle = typeof r.title === 'string' ? r.title : '';
      } catch {}
    }

    const epNum = typeof epInfo.episode === 'string' || typeof epInfo.episode === 'number'
      ? String(epInfo.episode) : '?';

    if (!seriesTitle) {
      seriesTitle = epInfo.anime_title || epInfo.series_title || epInfo.title || back.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    }

    const curIdx = seriesEps.findIndex(e => e.slug === slug);
    const prevEp = curIdx > 0 ? seriesEps[curIdx - 1] : null;
    const nextEp = curIdx >= 0 && curIdx < seriesEps.length - 1 ? seriesEps[curIdx + 1] : null;

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
              loading="lazy"
            ></iframe>
          </div>

          <div class="ep-nav-bar">
            ${prevEp
              ? `<a class="ep-nav-btn" data-go="/watch?slug=${encodeURIComponent(prevEp.slug)}&back=${encodeURIComponent(back)}">← Sebelumnya</a>`
              : `<span></span>`}
            <span class="ep-nav-info">${_esc(seriesTitle)} · Ep ${epNum}</span>
            ${nextEp
              ? `<a class="ep-nav-btn next" data-go="/watch?slug=${encodeURIComponent(nextEp.slug)}&back=${encodeURIComponent(back)}">Selanjutnya →</a>`
              : `<span></span>`}
          </div>

          <div class="watch-info">
            <div class="wi-title">${_esc(seriesTitle)}</div>
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
                    <textarea id="cc-input" placeholder="Tulis komentar..." rows="2" maxlength="300"></textarea>
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

    _saveHistory({ slug: back || slug, epSlug: slug, title: seriesTitle, thumbnail: '', ep: epNum });
    setTimeout(() => document.querySelector('.wsb-ep.active')?.scrollIntoView({ block: 'nearest' }), 150);

    if (window.DB) {
      const cid = `watch_${slug}`;
      window._unsubComment = window.DB.listenComments(cid, comments => _renderComments(cid, comments));
      const ccInput = document.getElementById('cc-input');
      const ccChar  = document.getElementById('cc-char');
      ccInput?.addEventListener('input', () => {
        if (ccChar) ccChar.textContent = `${ccInput.value.length}/300`;
      });
      document.getElementById('cc-send')?.addEventListener('click', async () => {
        const t = ccInput?.value.trim();
        if (!t) return;
        const btn = document.getElementById('cc-send');
        if (btn) { btn.disabled = true; btn.textContent = '...'; }
        try {
          await window.DB.addComment(cid, t);
          if (ccInput) ccInput.value = '';
          if (ccChar) ccChar.textContent = '0/300';
        } catch (e) {
          App.toast(e.message === 'login' ? 'Login dulu ya' : e.message === 'banned' ? 'Akun kamu dibanned' : 'Gagal kirim', 'err');
        } finally {
          if (btn) { btn.disabled = false; btn.textContent = 'Kirim'; }
        }
      });
    }

  } catch (e) {
    App.page(`
      <div class="pg-err">
        <div class="pg-err-num">!</div>
        <h2>Gagal Memuat Video</h2>
        <p>Terjadi masalah saat memuat episode ini.</p>
        <a data-go="/browse" class="btn-main">Kembali</a>
      </div>
    `, true);
  }
};

// ─── COMMENTS RENDERER ────────────────────────────────────────────────────────
function _renderComments(cid, comments) {
  const el = document.getElementById('comment-list');
  if (!el) return;
  if (!comments.length) { el.innerHTML = `<p class="empty">Belum ada komentar. Jadilah yang pertama!</p>`; return; }

  el.innerHTML = `<div class="c-count">${comments.length} komentar</div>` + comments.map(c => `
    <div class="c-item" id="ci-${c.id}">
      ${c.photo ? `<img class="ava sm" src="${c.photo}" alt="${_escAttr(c.name)}" onerror="this.style.display='none'"/>` : `<div class="ava ph sm">${(c.name || '?').charAt(0)}</div>`}
      <div class="c-body">
        <div class="c-head">
          <span class="c-name">${_esc(c.name)}</span>
          <span class="c-time">${_fmtTime(c.createdAt)}</span>
          ${window.Auth?.current?.uid === c.uid || window.Auth?.isAdmin()
            ? `<button class="c-del" data-id="${c.id}">Hapus</button>` : ''}
        </div>
        <p class="c-text">${_esc(c.text)}</p>
        <div class="c-acts">
          <button class="c-react" data-id="${c.id}" data-t="like">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14z"/>
            </svg>
            ${c.likes || 0}
          </button>
          <button class="c-react" data-id="${c.id}" data-t="dislike">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M10 15v4a3 3 0 003 3l4-9V2H5.72a2 2 0 00-2 1.7l-1.38 9a2 2 0 002 2.3H10z"/>
            </svg>
            ${c.dislikes || 0}
          </button>
          ${window.Auth?.current ? `<button class="c-reply-btn" data-id="${c.id}">Balas</button>` : ''}
        </div>
        <div class="c-reply-wrap" id="crw-${c.id}" style="display:none">
          <textarea class="c-reply-input" placeholder="Balas komentar..." rows="2" maxlength="300"></textarea>
          <button class="c-reply-send" data-id="${c.id}">Kirim</button>
        </div>
        ${c.replies?.length ? `
          <div class="c-replies">
            ${c.replies.map(r => `
              <div class="c-rep">
                ${r.photo ? `<img class="ava sm" src="${r.photo}" onerror="this.style.display='none'"/>` : `<div class="ava ph sm">${(r.name || '?').charAt(0)}</div>`}
                <div class="c-body">
                  <div class="c-head">
                    <span class="c-name">${_esc(r.name)}</span>
                    <span class="c-time">${_fmtTime(r.at)}</span>
                  </div>
                  <p class="c-text">${_esc(r.text)}</p>
                </div>
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>
    </div>
  `).join('');

  el.querySelectorAll('.c-del').forEach(b => b.addEventListener('click', async () => {
    if (!confirm('Hapus komentar ini?')) return;
    try { await window.DB.deleteComment(b.dataset.id); App.toast('Komentar dihapus'); }
    catch { App.toast('Gagal hapus', 'err'); }
  }));

  el.querySelectorAll('.c-react').forEach(b => b.addEventListener('click', async () => {
    if (!window.Auth?.current) { Router.go('/auth'); return; }
    try { await window.DB.reactComment(b.dataset.id, b.dataset.t); }
    catch {}
  }));

  el.querySelectorAll('.c-reply-btn').forEach(b => b.addEventListener('click', () => {
    const w = document.getElementById(`crw-${b.dataset.id}`);
    if (w) {
      w.style.display = w.style.display === 'none' ? 'block' : 'none';
      w.querySelector('textarea')?.focus();
    }
  }));

  el.querySelectorAll('.c-reply-send').forEach(b => b.addEventListener('click', async () => {
    const w = document.getElementById(`crw-${b.dataset.id}`);
    const t = w?.querySelector('textarea')?.value.trim();
    if (!t) return;
    try {
      await window.DB.addReply(b.dataset.id, t);
      if (w) w.style.display = 'none';
      App.toast('Balasan terkirim');
    } catch (e) {
      App.toast(e.message || 'Gagal kirim', 'err');
    }
  }));
}

// ─── AUTH ─────────────────────────────────────────────────────────────────────
Pages.auth = async function () {
  if (window._user) { Router.go('/home'); return; }
  App.nav();

  let tab = 'login';
  const render = (err = '') => {
    App.page(`
      <div class="auth-pg">
        <div class="auth-card">
          <a class="auth-logo" data-go="/">KICEN<span>XENSAI</span></a>

          <div class="auth-tabs">
            <button class="auth-tab${tab === 'login' ? ' on' : ''}" id="tab-login">Masuk</button>
            <button class="auth-tab${tab === 'register' ? ' on' : ''}" id="tab-register">Daftar</button>
          </div>

          <button class="btn-google" id="btn-google">
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Lanjutkan dengan Google
          </button>

          <div class="auth-or"><span>atau</span></div>

          ${tab === 'register' ? `
            <div class="auth-field">
              <label>Nama</label>
              <input id="auth-name" type="text" placeholder="Nama kamu" autocomplete="name"/>
            </div>
          ` : ''}

          <div class="auth-field">
            <label>Email</label>
            <input id="auth-email" type="email" placeholder="email@kamu.com" autocomplete="email"/>
          </div>

          <div class="auth-field">
            <label>Password</label>
            <input id="auth-pass" type="password" placeholder="Min. 6 karakter" autocomplete="${tab === 'login' ? 'current-password' : 'new-password'}"/>
          </div>

          <div class="auth-err" id="auth-err">${err}</div>
          <button class="btn-auth" id="btn-auth">${tab === 'login' ? 'Masuk' : 'Buat Akun'}</button>

          <p class="auth-foot">
            ${tab === 'login'
              ? `Belum punya akun? <a id="sw-tab">Daftar sekarang</a>`
              : `Sudah punya akun? <a id="sw-tab">Masuk</a>`}
          </p>
        </div>
      </div>
    `, true);

    document.getElementById('tab-login')?.addEventListener('click', () => { tab = 'login'; render(); });
    document.getElementById('tab-register')?.addEventListener('click', () => { tab = 'register'; render(); });
    document.getElementById('sw-tab')?.addEventListener('click', () => { tab = tab === 'login' ? 'register' : 'login'; render(); });

    document.getElementById('btn-google')?.addEventListener('click', async () => {
      const btn = document.getElementById('btn-google');
      if (btn) btn.disabled = true;
      try {
        await window.Auth.google();
        Router.go('/home');
      } catch (e) {
        render(e.message?.includes('popup') ? 'Popup diblokir. Coba lagi.' : 'Login Google gagal. Coba lagi.');
      }
    });

    document.getElementById('btn-auth')?.addEventListener('click', async () => {
      const email = document.getElementById('auth-email')?.value.trim();
      const pass  = document.getElementById('auth-pass')?.value;
      const name  = document.getElementById('auth-name')?.value.trim();
      if (!email || !pass) { render('Email dan password wajib diisi.'); return; }
      if (tab === 'register' && !name) { render('Nama wajib diisi.'); return; }
      if (pass.length < 6) { render('Password minimal 6 karakter.'); return; }

      const btn = document.getElementById('btn-auth');
      if (btn) { btn.disabled = true; btn.textContent = '...'; }

      try {
        if (tab === 'login') {
          await window.Auth.login(email, pass);
        } else {
          await window.Auth.register(email, pass, name);
        }
        Router.go('/home');
      } catch (e) {
        const msg = e.code === 'auth/user-not-found' || e.code === 'auth/wrong-password' || e.code === 'auth/invalid-credential'
          ? 'Email atau password salah.'
          : e.code === 'auth/email-already-in-use' ? 'Email sudah terdaftar.'
          : e.code === 'auth/invalid-email' ? 'Format email tidak valid.'
          : e.code === 'auth/weak-password' ? 'Password terlalu lemah.'
          : e.message || 'Terjadi kesalahan.';
        render(msg);
      }
    });

    // Enter key submit
    document.getElementById('auth-pass')?.addEventListener('keydown', e => {
      if (e.key === 'Enter') document.getElementById('btn-auth')?.click();
    });
  };

  render();
};

// ─── PREMIUM ─────────────────────────────────────────────────────────────────
Pages.premium = async function () {
  App.nav();
  App.page(`
    <div class="prem-pg">
      <div class="prem-hero">
        <h1>Pilihan Premium</h1>
        <p>Tingkatkan pengalaman nonton kamu</p>
      </div>
      <div class="prem-plans">
        ${PLANS.map(plan => `
          <div class="prem-card${plan.hot ? ' hot' : ''}">
            ${plan.hot ? `<div class="prem-pop">PALING POPULER</div>` : ''}
            <div class="prem-name" style="color:${plan.color}">${plan.name}</div>
            <div class="prem-price">
              ${plan.price === 0
                ? `<span class="pp-free">Gratis</span>`
                : `<span style="font-size:.88rem;color:var(--t3);margin-right:2px">Rp</span><span class="pp-amt">${plan.price.toLocaleString('id')}</span><span class="pp-per">/bulan</span>`
              }
            </div>
            <ul class="prem-list">
              ${plan.perks.map(p => `<li><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>${p}</li>`).join('')}
            </ul>
            <button class="prem-btn${plan.price === 0 ? ' free' : ''}" style="--c:${plan.color}"
              data-plan="${plan.id}" id="plan-${plan.id}">
              ${plan.price === 0 ? 'Paket Saat Ini' : `Pilih ${plan.name}`}
            </button>
          </div>
        `).join('')}
      </div>
    </div>

    <div class="pay-modal" id="pay-modal">
      <div class="pay-box" id="pay-box">
        <button class="pay-close" id="pay-close">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6 6 18M6 6l12 12"/>
          </svg>
        </button>
        <div id="pay-content"></div>
      </div>
    </div>
  `);

  const openModal = (plan) => {
    if (!window.Auth?.current) { Router.go('/auth'); return; }
    document.getElementById('pay-content').innerHTML = `
      <h2>${plan.name}</h2>
      <div class="pay-price">Rp ${plan.price.toLocaleString('id')}/bulan</div>
      <div class="pay-methods-label">Pilih metode pembayaran</div>
      <div class="pay-methods">
        ${PAY_METHODS.map(m => `<button class="pay-method" data-m="${m.id}">${m.label}</button>`).join('')}
      </div>
      <button class="pay-go" id="pay-go" style="background:${plan.color}" disabled>Bayar Sekarang</button>
      <p class="pay-disc">Demo — pembayaran tidak diproses</p>
    `;

    let selectedMethod = null;
    document.querySelectorAll('.pay-method').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.pay-method').forEach(b => b.classList.remove('on'));
        btn.classList.add('on');
        selectedMethod = btn.dataset.m;
        document.getElementById('pay-go').disabled = false;
      });
    });

    document.getElementById('pay-go')?.addEventListener('click', () => {
      document.getElementById('pay-content').innerHTML = `
        <div class="pay-ok">
          <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="${plan.color}" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          <h3>Pesanan Diterima!</h3>
          <p>Ini adalah demo. Pembayaran nyata belum diproses.</p>
          <button class="btn-main" id="pay-done">Tutup</button>
        </div>
      `;
      document.getElementById('pay-done')?.addEventListener('click', () => {
        document.getElementById('pay-modal').classList.remove('open');
      });
    });

    document.getElementById('pay-modal').classList.add('open');
  };

  PLANS.filter(p => p.price > 0).forEach(plan => {
    document.getElementById(`plan-${plan.id}`)?.addEventListener('click', () => openModal(plan));
  });

  document.getElementById('pay-close')?.addEventListener('click', () => {
    document.getElementById('pay-modal').classList.remove('open');
  });

  document.getElementById('pay-modal')?.addEventListener('click', e => {
    if (e.target === document.getElementById('pay-modal')) {
      document.getElementById('pay-modal').classList.remove('open');
    }
  });
};

// ─── PROFILE ─────────────────────────────────────────────────────────────────
Pages.profile = async function () {
  let tries = 0;
  while (window._user === undefined && tries < 25) { await new Promise(r => setTimeout(r, 100)); tries++; }
  if (!window._user) { Router.go('/auth'); return; }

  App.nav();
  const u = window._user;
  let activeTab = 'watchlist';

  const renderTab = async () => {
    const el = document.getElementById('prof-tab-content');
    if (!el) return;
    el.innerHTML = `<div class="center-spinner" style="min-height:180px"><div class="spinner"></div></div>`;

    if (activeTab === 'watchlist') {
      try {
        const wl = await window.DB.getWatchlist();
        el.innerHTML = wl.length
          ? `<div class="cards-grid">${wl.map(UI.card).join('')}</div>`
          : `<p class="empty">Watchlist masih kosong.</p>`;
      } catch { el.innerHTML = `<p class="empty">Gagal memuat watchlist.</p>`; }
    }
  };

  App.page(`
    <div class="prof-pg">
      <div class="prof-header">
        ${u.photo || u.photoURL
          ? `<img class="prof-ava" src="${u.photo || u.photoURL}" alt="av" onerror="this.className='prof-ava ph';this.outerHTML='<div class=\\'prof-ava ph\\'>${(u.name || u.displayName || '?').charAt(0).toUpperCase()}</div>'"/>`
          : `<div class="prof-ava ph">${(u.name || u.displayName || '?').charAt(0).toUpperCase()}</div>`
        }
        <div class="prof-info">
          <h1>${_esc(u.name || u.displayName || 'Penonton')}</h1>
          <p>${_esc(u.email || '')}</p>
          <div class="prof-badges">
            <span class="badge-role ${u.role || 'user'}">${u.role === 'admin' ? 'Admin' : 'Member'}</span>
            ${u.banned ? `<span class="badge-banned">Dibanned</span>` : `<span class="badge-active">Aktif</span>`}
          </div>
        </div>
        <div class="prof-acts">
          ${u.role === 'admin' ? `<a class="btn-sm" data-go="/admin">Admin Panel</a>` : ''}
          <button class="btn-sm-out" id="btn-logout">Keluar</button>
        </div>
      </div>

      <div class="prof-tabs">
        <button class="prof-tab on" data-tab="watchlist" id="ptab-watchlist">Watchlist</button>
      </div>

      <div id="prof-tab-content"></div>
    </div>
  `);

  document.getElementById('btn-logout')?.addEventListener('click', async () => {
    await window.Auth.logout();
    App.toast('Berhasil keluar');
    Router.go('/');
  });

  document.querySelectorAll('.prof-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.prof-tab').forEach(b => b.classList.remove('on'));
      btn.classList.add('on');
      activeTab = btn.dataset.tab;
      renderTab();
    });
  });

  renderTab();
};

// ─── ADMIN ────────────────────────────────────────────────────────────────────
Pages.admin = async function () {
  let tries = 0;
  while (window._user === undefined && tries < 25) { await new Promise(r => setTimeout(r, 100)); tries++; }
  if (!window._user || !window.Auth?.isAdmin()) { Router.go('/'); return; }

  App.nav();

  let section = 'dashboard';

  const renderSection = async () => {
    const el = document.getElementById('admin-main-content');
    if (!el) return;
    el.innerHTML = `<div class="center-spinner" style="min-height:180px"><div class="spinner"></div></div>`;

    document.querySelectorAll('.admin-nav').forEach(a => a.classList.toggle('on', a.dataset.sec === section));

    if (section === 'dashboard') {
      try {
        const s = await window.DB.stats();
        el.innerHTML = `
          <h1>Dashboard <span class="admin-badge">Admin</span></h1>
          <div class="admin-stats">
            <div class="as-card"><div class="as-num">${s.users}</div><div class="as-lbl">Total User</div></div>
            <div class="as-card"><div class="as-num">${s.comments}</div><div class="as-lbl">Total Komentar</div></div>
          </div>
        `;
      } catch { el.innerHTML = `<p class="empty">Gagal memuat stats.</p>`; }
    }

    if (section === 'users') {
      try {
        const users = await window.DB.getUsers();
        el.innerHTML = `
          <h1>Manajemen User <span class="admin-badge">${users.length}</span></h1>
          <div class="admin-table-wrap">
            <table class="admin-table">
              <thead><tr>
                <th>User</th><th>Role</th><th>Status</th><th>Aksi</th>
              </tr></thead>
              <tbody>
                ${users.map(u => `
                  <tr class="${u.banned ? 'row-ban' : ''}" id="urow-${u.id}">
                    <td>
                      <div class="ut-cell">
                        ${u.photo ? `<img class="mini-av" src="${u.photo}" alt="" onerror="this.style.display='none'"/>` : `<div class="mini-av ph">${(u.name || '?').charAt(0)}</div>`}
                        <div><div class="ut-name">${_esc(u.name || 'User')}</div><div class="ut-email">${_esc(u.email || '')}</div></div>
                      </div>
                    </td>
                    <td><span class="badge-role ${u.role || 'user'}">${u.role || 'user'}</span></td>
                    <td>${u.banned ? `<span class="badge-banned">Banned</span>` : `<span class="badge-active">Aktif</span>`}</td>
                    <td>
                      <div class="tbl-acts">
                        <button class="tbl-btn ${u.banned ? 'unban' : 'ban'}" data-uid="${u.id}" data-ban="${u.banned ? 'false' : 'true'}">
                          ${u.banned ? 'Unban' : 'Ban'}
                        </button>
                        ${u.role !== 'admin' ? `<button class="tbl-btn promote" data-uid="${u.id}" data-role="admin">Promote</button>` : ''}
                        <button class="tbl-btn del-c" data-uid="${u.id}" data-action="nuke">Hapus Komen</button>
                      </div>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `;

        el.querySelectorAll('[data-ban]').forEach(btn => {
          btn.addEventListener('click', async () => {
            const v = btn.dataset.ban === 'true';
            await window.DB.banUser(btn.dataset.uid, v);
            App.toast(v ? 'User dibanned' : 'User di-unban');
            renderSection();
          });
        });
        el.querySelectorAll('[data-role]').forEach(btn => {
          btn.addEventListener('click', async () => {
            if (!confirm('Jadikan admin?')) return;
            await window.DB.setRole(btn.dataset.uid, btn.dataset.role);
            App.toast('Role diupdate');
            renderSection();
          });
        });
        el.querySelectorAll('[data-action="nuke"]').forEach(btn => {
          btn.addEventListener('click', async () => {
            if (!confirm('Hapus SEMUA komentar user ini?')) return;
            await window.DB.nukeComments(btn.dataset.uid);
            App.toast('Komentar dihapus semua');
          });
        });
      } catch { el.innerHTML = `<p class="empty">Gagal memuat user.</p>`; }
    }

    if (section === 'comments') {
      try {
        const comments = await window.DB.recentComments();
        el.innerHTML = `
          <h1>Komentar Terbaru <span class="admin-badge">${comments.length}</span></h1>
          <div class="admin-comments">
            ${comments.map(c => `
              <div class="ac-card" id="acc-${c.id}">
                <div class="ac-head">
                  <b>${_esc(c.name)}</b>
                  <span class="ac-time">${_fmtAdminTime(c.createdAt)}</span>
                  <span class="ac-cid">${_esc(c.contentId || '')}</span>
                  <button class="tbl-btn ban" data-id="${c.id}">Hapus</button>
                </div>
                <p class="ac-text">${_esc(c.text)}</p>
              </div>
            `).join('')}
          </div>
        `;
        el.querySelectorAll('[data-id]').forEach(btn => {
          btn.addEventListener('click', async () => {
            await window.DB.deleteComment(btn.dataset.id);
            document.getElementById(`acc-${btn.dataset.id}`)?.remove();
            App.toast('Komentar dihapus');
          });
        });
      } catch { el.innerHTML = `<p class="empty">Gagal memuat komentar.</p>`; }
    }
  };

  App.page(`
    <div class="admin-layout">
      <aside class="admin-rail">
        <div class="admin-rail-title">Admin Panel</div>
        <a class="admin-nav on" data-sec="dashboard">Dashboard</a>
        <a class="admin-nav" data-sec="users">Users</a>
        <a class="admin-nav" data-sec="comments">Komentar</a>
        <a class="admin-back" data-go="/home">← Kembali</a>
      </aside>
      <div class="admin-main" id="admin-main-content"></div>
    </div>
  `);

  document.querySelectorAll('.admin-nav[data-sec]').forEach(a => {
    a.addEventListener('click', () => { section = a.dataset.sec; renderSection(); });
  });

  renderSection();
};

// ─── SUPPORT ─────────────────────────────────────────────────────────────────
Pages.support = async function () {
  App.nav();
  App.page(`
    <div class="support-pg">
      <div class="support-hero">
        <h1>Pusat Bantuan</h1>
        <p>Ada yang bisa kami bantu?</p>
      </div>

      <div class="supp-contact-wrap">
        <div class="supp-contact-card">
          <h3>Hubungi Developer</h3>
          <div class="supp-contacts">
            <a class="sci" href="https://instagram.com/kiki_fzl" target="_blank" rel="noopener">
              <div class="sci-ico ig">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/>
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
                </svg>
              </div>
              <div><span class="sci-lbl">Instagram</span><span class="sci-val">@kiki_fzl</span></div>
            </a>
            <a class="sci" href="https://t.me/kyshiro1" target="_blank" rel="noopener">
              <div class="sci-ico tg">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 3L2 10.5l7 1.5 2 6 3-3 4 3z"/>
                </svg>
              </div>
              <div><span class="sci-lbl">Telegram</span><span class="sci-val">@kyshiro1</span></div>
            </a>
            <a class="sci" href="mailto:kikimodesad8@gmail.com">
              <div class="sci-ico em">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 01-2.06 0L2 7"/>
                </svg>
              </div>
              <div><span class="sci-lbl">Email</span><span class="sci-val">kikimodesad8@gmail.com</span></div>
            </a>
          </div>
        </div>
      </div>

      <div class="support-cards">
        ${[
          ['Video tidak muter?', 'Coba ganti server atau refresh halaman. Pastikan koneksi stabil.'],
          ['Subtitle tidak ada?', 'Subtitle sudah tertanam di video dari sumbernya. Pastikan player aktif.'],
          ['Akun bermasalah?', 'Hubungi kami via Instagram atau Telegram untuk bantuan akun.'],
          ['Mau request donghua?', 'Kirim request via Telegram atau Instagram kami.'],
        ].map(([t, d]) => `<div class="support-card"><h3>${t}</h3><p>${d}</p></div>`).join('')}
      </div>

      <div class="faq-title">FAQ</div>
      ${[
        ['Apakah Kicen Xensai gratis?', 'Ya, sepenuhnya gratis. Premium tersedia untuk fitur tambahan.'],
        ['Dari mana sumber videonya?', 'Video diambil dari anichin.moe via embed.'],
        ['Bagaimana cara daftar?', 'Klik tombol Daftar di halaman Masuk, isi email dan password, selesai.'],
        ['Apakah ada aplikasi mobile?', 'Belum ada. Tapi website ini responsif untuk HP.'],
      ].map(([q, a]) => `
        <div class="faq-item">
          <button class="faq-q">
            ${q}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>
          <div class="faq-a">${a}</div>
        </div>
      `).join('')}
    </div>
  `);

  document.querySelectorAll('.faq-q').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.closest('.faq-item').classList.toggle('open');
    });
  });
};
