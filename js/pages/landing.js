Pages.landing = async function() {
  // FIX: If user already logged in, go straight to home
  if (window._user) { Router.go('/home'); return; }
  UI.renderNav();
  document.getElementById('app-footer').innerHTML = '';

  UI.setPage(`
    <div class="land">

      <!-- HERO -->
      <section class="land-hero">
        <div class="land-hero-bg">
          <div class="lhb-item" style="background-image:url('https://image.tmdb.org/t/p/w1280/qJeU7KM4nT2C1WpOrwPcSDGFUWE.jpg')"></div>
          <div class="lhb-item" style="background-image:url('https://image.tmdb.org/t/p/w1280/suaEOtk1N1sgg2MTM7oZd2cfVp3.jpg')"></div>
          <div class="lhb-item" style="background-image:url('https://image.tmdb.org/t/p/w1280/3bhkrj58Vtu7enYsLegHQDbe3dI.jpg')"></div>
        </div>
        <div class="land-hero-overlay"></div>
        <div class="land-hero-content">
          <div class="lhc-inner">
            <div class="land-eyebrow">Platform Streaming Asia</div>
            <h1 class="land-h1">Nonton<br/><span class="land-h1-red">Anime</span> sampai<br/><span class="land-h1-gold">Drama Asia</span></h1>
            <p class="land-desc">Ribuan judul anime, donghua, drama Korea, dan drama China. Subtitle Indonesia, update cepat, satu platform.</p>
            <div class="land-cta">
              <a class="land-btn-main" data-go="/auth?m=register">Mulai Gratis</a>
              <a class="land-btn-ghost" data-go="/browse?cat=anime">Jelajahi Konten</a>
            </div>
            <div class="land-stats">
              <div class="land-stat"><strong>12.000+</strong><span>Judul</span></div>
              <div class="land-stat-sep"></div>
              <div class="land-stat"><strong>4</strong><span>Kategori</span></div>
              <div class="land-stat-sep"></div>
              <div class="land-stat"><strong>Sub ID</strong><span>Semua Konten</span></div>
            </div>
          </div>
        </div>
        <div class="land-scroll-hint">
          <span>Scroll</span>
          <div class="land-scroll-line"></div>
        </div>
      </section>

      <!-- MARQUEE STRIP -->
      <div class="land-strip">
        <div class="land-strip-track">
          ${['Anime','Donghua','Drakor','Dracin','Sub Indonesia','HD Quality','Update Cepat','Gratis'].map(t=>`<span>${t}</span><span class="strip-dot"></span>`).join('').repeat(3)}
        </div>
      </div>

      <!-- FEATURED TITLES -->
      <section class="land-section">
        <div class="land-sec-head">
          <div class="land-sec-label">Pilihan Editor</div>
          <h2 class="land-sec-title">Judul yang Wajib Ditonton</h2>
        </div>
        <div class="land-featured-grid" id="land-featured">
          ${Array(6).fill(`<div class="land-feat-card skel"><div class="lfc-img"></div><div class="lfc-info"><div class="sk-line"></div><div class="sk-line short"></div></div></div>`).join('')}
        </div>
      </section>

      <!-- CATEGORIES -->
      <section class="land-section land-cats-section">
        <div class="land-sec-head">
          <div class="land-sec-label">Semua Genre</div>
          <h2 class="land-sec-title">Temukan Tontonan Favorit</h2>
        </div>
        <div class="land-cat-cards">
          <a class="land-cat-card" data-go="/browse?cat=anime" style="--c:#E8365D">
            <div class="lcc-bg" style="background-image:url('https://image.tmdb.org/t/p/w500/qJeU7KM4nT2C1WpOrwPcSDGFUWE.jpg')"></div>
            <div class="lcc-overlay"></div>
            <div class="lcc-content">
              <div class="lcc-label">Anime</div>
              <div class="lcc-sub">Action, Fantasy, Romance</div>
            </div>
          </a>
          <a class="land-cat-card" data-go="/browse?cat=donghua" style="--c:#00D4A8">
            <div class="lcc-bg" style="background-image:url('https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsLegHQDbe3dI.jpg')"></div>
            <div class="lcc-overlay"></div>
            <div class="lcc-content">
              <div class="lcc-label">Donghua</div>
              <div class="lcc-sub">Xianxia, Cultivation, Wuxia</div>
            </div>
          </a>
          <a class="land-cat-card" data-go="/browse?cat=drakor" style="--c:#7C3AED">
            <div class="lcc-bg" style="background-image:url('https://image.tmdb.org/t/p/w500/suaEOtk1N1sgg2MTM7oZd2cfVp3.jpg')"></div>
            <div class="lcc-overlay"></div>
            <div class="lcc-content">
              <div class="lcc-label">Drakor</div>
              <div class="lcc-sub">Romance, Thriller, Historical</div>
            </div>
          </a>
          <a class="land-cat-card" data-go="/browse?cat=dracin" style="--c:#F59E0B">
            <div class="lcc-bg" style="background-image:url('https://image.tmdb.org/t/p/w500/qJeU7KM4nT2C1WpOrwPcSDGFUWE.jpg')"></div>
            <div class="lcc-overlay"></div>
            <div class="lcc-content">
              <div class="lcc-label">Dracin</div>
              <div class="lcc-sub">Period, Romance, Epic</div>
            </div>
          </a>
        </div>
      </section>

      <!-- WHY -->
      <section class="land-section land-why">
        <div class="land-sec-head">
          <div class="land-sec-label">Kenapa Kicen Xensai</div>
          <h2 class="land-sec-title">Dibuat untuk Penggemar Asia</h2>
        </div>
        <div class="land-why-grid">
          <div class="land-why-card">
            <div class="lwc-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>
            </div>
            <h3>Sub Indonesia Akurat</h3>
            <p>Terjemahan yang tepat dan mudah dipahami, termasuk istilah kultural khas Asia.</p>
          </div>
          <div class="land-why-card">
            <div class="lwc-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
            </div>
            <h3>Update Cepat</h3>
            <p>Episode baru tersedia dalam hitungan jam setelah tayang di negara asalnya.</p>
          </div>
          <div class="land-why-card">
            <div class="lwc-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
            </div>
            <h3>Multi Perangkat</h3>
            <p>Tonton di HP, tablet, laptop, atau Smart TV. Progress tersinkronisasi otomatis.</p>
          </div>
          <div class="land-why-card">
            <div class="lwc-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            </div>
            <h3>Download Offline</h3>
            <p>Unduh episode favoritmu dan tonton tanpa koneksi internet kapanpun kamu mau.</p>
          </div>
          <div class="land-why-card">
            <div class="lwc-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            </div>
            <h3>Bebas Iklan</h3>
            <p>Nikmati marathon drama tanpa gangguan. Paket premium memberikan pengalaman bersih.</p>
          </div>
          <div class="land-why-card">
            <div class="lwc-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <h3>Komunitas Aktif</h3>
            <p>Diskusikan episode favoritmu bersama jutaan pengguna lain di kolom komentar.</p>
          </div>
        </div>
      </section>

      <!-- FINAL CTA -->
      <section class="land-cta-section">
        <div class="land-cta-inner">
          <div class="land-cta-logo">KICEN<span>XENSAI</span></div>
          <h2>Mulai Nonton Sekarang</h2>
          <p>Gratis 30 hari pertama. Tidak perlu kartu kredit.</p>
          <a class="land-btn-main large" data-go="/auth?m=register">Buat Akun Gratis</a>
          <div class="land-cta-plans">
            <span>Free</span>
            <span>Premium — Rp 29.000/bln</span>
            <span>Ultra — Rp 49.000/bln</span>
          </div>
        </div>
      </section>

    </div>
    ${UI.footer()}
  `, {noFooter:true});

  // Load featured
  loadFeatured();
  // Animate hero bg
  heroLoop();
};

async function loadFeatured() {
  const el = document.getElementById('land-featured');
  if (!el) return;
  try {
    const [anime, drakor] = await Promise.allSettled([
      API.anime(1),
      API.drakor(1),
    ]);
    const items = [
      ...(anime.status==='fulfilled' ? anime.value.results.slice(0,3) : []),
      ...(drakor.status==='fulfilled' ? drakor.value.results.slice(0,3) : []),
    ];
    if (!items.length) { el.innerHTML = '<p class="empty-msg">Gagal memuat.</p>'; return; }
    el.innerHTML = items.map(item => `
      <a class="land-feat-card" data-go="/detail?id=${item.id}&type=${item.type||'tv'}&cat=${item.category}">
        <div class="lfc-img">
          ${item.poster ? `<img src="${item.poster}" alt="${item.title}" loading="lazy"/>` : `<div class="lfc-np">${item.title?.charAt(0)}</div>`}
          <div class="lfc-shade"></div>
          <span class="lfc-badge" style="background:${C.CATS[item.category]?.color||'#666'}">${item.category?.toUpperCase()}</span>
        </div>
        <div class="lfc-info">
          <div class="lfc-title">${item.title}</div>
          <div class="lfc-sub">${item.year||''} ${item.rating?`· ★${item.rating}`:''}</div>
        </div>
      </a>
    `).join('');
  } catch { el.innerHTML = '<p class="empty-msg">Gagal memuat konten.</p>'; }
}

function heroLoop() {
  const items = document.querySelectorAll('.lhb-item');
  if (!items.length) return;
  let idx = 0;
  items[0].classList.add('active');
  setInterval(() => {
    items[idx].classList.remove('active');
    idx = (idx + 1) % items.length;
    items[idx].classList.add('active');
  }, 4000);
}
