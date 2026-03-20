Pages.home = async function () {
  App.setPage('home');
  App.render(`
    <div id="hero-section">
      <div class="hero-loading">
        <div class="hero-skeleton"></div>
      </div>
    </div>

    <section class="section">
      <div class="section-head">
        <h2 class="section-title">Trending Minggu Ini</h2>
      </div>
      <div class="cards-grid" id="trending-grid">${Components.cardSkeleton(8)}</div>
    </section>

    <section class="section">
      <div class="section-head">
        <h2 class="section-title">Anime Populer</h2>
        <a class="see-all" data-link="/browse?cat=anime">Lihat Semua</a>
      </div>
      <div class="cards-grid" id="anime-grid">${Components.cardSkeleton(8)}</div>
    </section>

    <section class="section">
      <div class="section-head">
        <h2 class="section-title">Drama Korea</h2>
        <a class="see-all" data-link="/browse?cat=drakor">Lihat Semua</a>
      </div>
      <div class="cards-grid" id="drakor-grid">${Components.cardSkeleton(8)}</div>
    </section>

    <section class="section">
      <div class="section-head">
        <h2 class="section-title">Drama China</h2>
        <a class="see-all" data-link="/browse?cat=dracin">Lihat Semua</a>
      </div>
      <div class="cards-grid" id="dracin-grid">${Components.cardSkeleton(8)}</div>
    </section>

    <section class="section">
      <div class="section-head">
        <h2 class="section-title">Donghua</h2>
        <a class="see-all" data-link="/browse?cat=donghua">Lihat Semua</a>
      </div>
      <div class="cards-grid" id="donghua-grid">${Components.cardSkeleton(8)}</div>
    </section>
  `);

  // Load semua konten parallel
  const [trending, anime, drakor, dracin, donghua] = await Promise.allSettled([
    API.getTrendingAnime(),
    API.getAnime(1),
    API.getDrakor(1),
    API.getDracin(1),
    API.getDonghua(1),
  ]);

  // Hero slider
  const heroItems = [];
  if (anime.status === 'fulfilled') heroItems.push(...anime.value.results.slice(0, 3));
  if (drakor.status === 'fulfilled') heroItems.push(...drakor.value.results.slice(0, 2));

  if (heroItems.length > 0) {
    // Ambil detail item pertama untuk hero
    let heroData = heroItems[0];
    if (heroData.type === 'anime') {
      try {
        heroData = await API.getAnimeDetail(heroData.id);
      } catch (_) {}
    } else {
      try {
        heroData = { ...heroData, ...await API.getTMDBDetail(heroData.id, 'tv') };
      } catch (_) {}
    }
    renderHero(heroItems, heroData);
  }

  // Render grids
  if (trending.status === 'fulfilled') {
    document.getElementById('trending-grid').innerHTML = trending.value.slice(0, 8).map(Components.card).join('');
  }
  if (anime.status === 'fulfilled') {
    document.getElementById('anime-grid').innerHTML = anime.value.results.slice(0, 8).map(Components.card).join('');
  }
  if (drakor.status === 'fulfilled') {
    document.getElementById('drakor-grid').innerHTML = drakor.value.results.slice(0, 8).map(Components.card).join('');
  }
  if (dracin.status === 'fulfilled') {
    document.getElementById('dracin-grid').innerHTML = dracin.value.results.slice(0, 8).map(Components.card).join('');
  }
  if (donghua.status === 'fulfilled') {
    document.getElementById('donghua-grid').innerHTML = donghua.value.results.slice(0, 8).map(Components.card).join('');
  }
};

function renderHero(items, featured) {
  const heroSection = document.getElementById('hero-section');
  if (!heroSection) return;

  heroSection.innerHTML = `
    <div class="hero">
      <div class="hero-bg" style="--bg: url('${featured.backdrop || featured.poster || ''}')"></div>
      <div class="hero-content">
        <span class="hero-cat-badge">${featured.category?.toUpperCase() || 'FEATURED'}</span>
        <h1 class="hero-main-title">${featured.title || ''}</h1>
        <div class="hero-meta">
          ${featured.rating ? `<span class="hero-rating">${featured.rating}</span>` : ''}
          ${featured.year ? `<span>${featured.year}</span>` : ''}
          ${featured.episodes ? `<span>${featured.episodes} Episode</span>` : ''}
          ${featured.genres?.slice(0, 2).map(g => `<span>${g}</span>`).join('') || ''}
        </div>
        <p class="hero-overview">${(featured.overview || '').slice(0, 200)}${featured.overview?.length > 200 ? '...' : ''}</p>
        <div class="hero-btns">
          <a class="btn-watch" data-link="/detail?id=${featured.id}&type=${featured.type || 'tv'}&cat=${featured.category || 'anime'}">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
            Tonton
          </a>
          <a class="btn-detail" data-link="/detail?id=${featured.id}&type=${featured.type || 'tv'}&cat=${featured.category || 'anime'}">
            Detail
          </a>
        </div>
      </div>
      <div class="hero-thumb-strip">
        ${items.slice(0, 5).map((item, i) => `
          <div class="hero-thumb ${i === 0 ? 'active' : ''}" data-index="${i}" data-link="/detail?id=${item.id}&type=${item.type}&cat=${item.category}">
            ${item.poster ? `<img src="${item.poster}" alt="${item.title}" loading="lazy" />` : '<div class="thumb-placeholder"></div>'}
          </div>
        `).join('')}
      </div>
    </div>
  `;
}
