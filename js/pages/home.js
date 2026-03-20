Pages.home = async function() {
  // FIX: Wait for auth to be ready before checking user
  let tries = 0;
  while (window._user === undefined && tries < 20) { await new Promise(r=>setTimeout(r,100)); tries++; }
  
  UI.renderNav();
  const user = window._user;
  if (!user) { Router.go('/'); return; }

  const history = API.getHistory().slice(0, 8);

  UI.setPage(`
    <div class="home-pg">

      <!-- GREETING -->
      <div class="home-greet">
        <div class="home-greet-left">
          ${UI.avatar(user)}
          <div>
            <div class="hg-welcome">Selamat datang kembali,</div>
            <div class="hg-name">${user.name||user.displayName||'Penonton'}</div>
          </div>
        </div>
        <a class="hg-search-btn" data-go="/search">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        </a>
      </div>

      <!-- ANNOUNCEMENT -->
      <div class="home-announce">
        <div class="ha-bar"></div>
        <div class="ha-text">Platform ini terus diperbarui. Nikmati konten terbaru setiap hari.</div>
      </div>

      <!-- CONTINUE WATCHING -->
      ${history.length ? `
        <section class="home-section">
          <div class="hsec-head">
            <h2>Lanjutkan Nonton</h2>
            <button class="hsec-more" id="clearHistory">Hapus Semua</button>
          </div>
          <div class="continue-row" id="continue-row">
            ${history.map(item => `
              <a class="cont-card" data-go="/watch?id=${item.id}&type=${item.type||'tv'}&cat=${item.category}&ep=${item.ep||1}">
                <div class="cont-img">
                  ${item.poster ? `<img src="${item.poster}" alt="${item.title}" loading="lazy"/>` : `<div class="cont-np">${item.title?.charAt(0)||'?'}</div>`}
                  <div class="cont-shade"></div>
                  <div class="cont-play">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                  </div>
                </div>
                <div class="cont-info">
                  <div class="cont-title">${item.title}</div>
                  <div class="cont-sub">Episode ${item.ep||1}</div>
                </div>
              </a>
            `).join('')}
          </div>
        </section>
      ` : ''}

      <!-- CATEGORIES QUICK -->
      <div class="home-cats">
        ${Object.entries(C.CATS).map(([k,v]) => `
          <a class="home-cat" data-go="/browse?cat=${k}" style="--c:${v.color}">
            <span>${v.label}</span>
          </a>
        `).join('')}
      </div>

      <!-- TRENDING ANIME -->
      <section class="home-section">
        <div class="hsec-head">
          <h2>Trending Anime</h2>
          <a class="hsec-more" data-go="/browse?cat=anime">Lihat semua</a>
        </div>
        <div id="home-anime">${UI.skel(8)}</div>
      </section>

      <!-- DRAKOR -->
      <section class="home-section">
        <div class="hsec-head">
          <h2>Drama Korea</h2>
          <a class="hsec-more" data-go="/browse?cat=drakor">Lihat semua</a>
        </div>
        <div id="home-drakor">${UI.skel(8)}</div>
      </section>

      <!-- DONGHUA -->
      <section class="home-section">
        <div class="hsec-head">
          <h2>Donghua</h2>
          <a class="hsec-more" data-go="/browse?cat=donghua">Lihat semua</a>
        </div>
        <div id="home-donghua">${UI.skel(8)}</div>
      </section>

      <!-- DRACIN -->
      <section class="home-section">
        <div class="hsec-head">
          <h2>Drama China</h2>
          <a class="hsec-more" data-go="/browse?cat=dracin">Lihat semua</a>
        </div>
        <div id="home-dracin">${UI.skel(8)}</div>
      </section>

    </div>
  `);

  document.getElementById('clearHistory')?.addEventListener('click', () => {
    localStorage.removeItem('kx_history');
    document.getElementById('continue-row')?.closest('.home-section')?.remove();
  });

  const [anime, drakor, donghua, dracin] = await Promise.allSettled([
    API.anime(1), API.drakor(1), API.donghua(1), API.dracin(1),
  ]);

  const render = (id, res) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.innerHTML = res.status==='fulfilled'
      ? `<div class="cards-grid">${res.value.results.slice(0,8).map(UI.card).join('')}</div>`
      : `<p class="empty-msg">Gagal memuat.</p>`;
  };
  render('home-anime', anime);
  render('home-drakor', drakor);
  render('home-donghua', donghua);
  render('home-dracin', dracin);
};
