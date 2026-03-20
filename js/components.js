const Components = {
  navbar(activePage = '') {
    const links = [
      { label: 'Beranda', path: '/' },
      { label: 'Anime', path: '/browse?cat=anime' },
      { label: 'Donghua', path: '/browse?cat=donghua' },
      { label: 'Drakor', path: '/browse?cat=drakor' },
      { label: 'Dracin', path: '/browse?cat=dracin' },
    ];

    return `
      <nav class="navbar" id="navbar">
        <a class="nav-logo" data-link="/">KICEN<span>XENSAI</span></a>
        <div class="nav-links">
          ${links.map(l => `
            <a class="nav-link ${activePage === l.path ? 'active' : ''}" data-link="${l.path}">${l.label}</a>
          `).join('')}
        </div>
        <div class="nav-actions">
          <button class="nav-search-btn" id="searchToggle">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          </button>
          ${window.Auth?.current
            ? `<a class="nav-avatar" data-link="/profile" title="${window.Auth.current.displayName || window.Auth.current.name}">
                ${(window.Auth.current.photoURL || window.Auth.current.photo)
                  ? `<img src="${window.Auth.current.photoURL || window.Auth.current.photo}" alt="profil" />`
                  : `<span>${(window.Auth.current.displayName || window.Auth.current.name || 'U').charAt(0).toUpperCase()}</span>`
                }
              </a>`
            : `<a class="btn-login-nav" data-link="/auth?mode=login">Masuk</a>`
          }
          <a class="btn-premium" data-link="/premium">Premium</a>
        </div>
        <button class="nav-burger" id="navBurger">
          <span></span><span></span><span></span>
        </button>
      </nav>
      <div class="nav-mobile" id="navMobile">
        ${links.map(l => `<a class="nav-mobile-link" data-link="${l.path}">${l.label}</a>`).join('')}
        <a class="nav-mobile-link highlight" data-link="/premium">Premium</a>
      </div>
      <div class="search-bar" id="searchBar">
        <div class="search-inner">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input type="text" id="searchInput" placeholder="Cari anime, drakor, donghua..." autocomplete="off" />
          <button id="searchClose">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>
      </div>
    `;
  },

  footer() {
    return `
      <footer class="footer">
        <div class="footer-inner">
          <div class="footer-brand">
            <span class="footer-logo">KICEN<span>XENSAI</span></span>
            <p>Platform streaming konten Asia. Anime, Donghua, Drakor, Dracin — satu tempat.</p>
            <p class="footer-dev">Developed by <strong>Kiki Faizal</strong></p>
          </div>
          <div class="footer-col">
            <h4>Kategori</h4>
            <a data-link="/browse?cat=anime">Anime</a>
            <a data-link="/browse?cat=donghua">Donghua</a>
            <a data-link="/browse?cat=drakor">Drakor</a>
            <a data-link="/browse?cat=dracin">Dracin</a>
          </div>
          <div class="footer-col">
            <h4>Layanan</h4>
            <a data-link="/premium">Paket Premium</a>
            <a data-link="/">Trending</a>
            <a data-link="/search">Pencarian</a>
          </div>
        </div>
        <div class="footer-bottom">
          <span>© 2025 Kicen Xensai. Developed by Kiki Faizal.</span>
        </div>
      </footer>
    `;
  },

  card(item) {
    const catColor = {
      anime: '#e63e6d',
      donghua: '#00c9a7',
      drakor: '#7b2fff',
      dracin: '#f59e0b',
    };

    const color = catColor[item.category] || '#6b7280';
    const poster = item.poster
      ? `<img src="${item.poster}" alt="${item.title}" loading="lazy" onerror="this.parentElement.classList.add('no-poster')" />`
      : `<div class="card-no-img">${item.title?.charAt(0) || '?'}</div>`;

    return `
      <div class="card" data-link="/detail?id=${item.id}&type=${item.type}&cat=${item.category}">
        <div class="card-thumb">
          ${poster}
          <div class="card-overlay"></div>
          <span class="card-cat" style="background:${color}">${item.category?.toUpperCase()}</span>
          ${item.rating ? `<span class="card-rating">${item.rating}</span>` : ''}
          <div class="card-play">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
          </div>
        </div>
        <div class="card-info">
          <div class="card-title">${item.title || 'Untitled'}</div>
          <div class="card-meta">${item.year || ''} ${item.episodes ? `· ${item.episodes} ep` : ''}</div>
        </div>
      </div>
    `;
  },

  cardSkeleton(count = 8) {
    return Array(count).fill('<div class="card skeleton"><div class="card-thumb"></div><div class="card-info"><div class="sk-line"></div><div class="sk-line short"></div></div></div>').join('');
  },

  heroSlide(item) {
    const backdrop = item.backdrop || item.poster || '';
    return `
      <div class="hero-slide" style="--bg: url('${backdrop}')">
        <div class="hero-slide-inner">
          <span class="hero-cat">${item.category?.toUpperCase()}</span>
          <h1 class="hero-title">${item.title}</h1>
          <p class="hero-overview">${(item.overview || '').slice(0, 160)}${item.overview?.length > 160 ? '...' : ''}</p>
          <div class="hero-actions">
            <a class="btn-watch" data-link="/detail?id=${item.id}&type=${item.type}&cat=${item.category}">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
              Tonton
            </a>
            <a class="btn-info" data-link="/detail?id=${item.id}&type=${item.type}&cat=${item.category}">Info Lebih Lanjut</a>
          </div>
        </div>
      </div>
    `;
  },

  pagination(current, total) {
    if (total <= 1) return '';
    const pages = [];
    const max = Math.min(total, 500);

    pages.push(1);
    if (current > 3) pages.push('...');
    for (let i = Math.max(2, current - 1); i <= Math.min(max - 1, current + 1); i++) pages.push(i);
    if (current < max - 2) pages.push('...');
    if (max > 1) pages.push(max);

    return `
      <div class="pagination">
        ${current > 1 ? `<button class="pg-btn" data-page="${current - 1}">Prev</button>` : ''}
        ${pages.map(p => p === '...'
          ? `<span class="pg-dots">...</span>`
          : `<button class="pg-btn ${p === current ? 'active' : ''}" data-page="${p}">${p}</button>`
        ).join('')}
        ${current < max ? `<button class="pg-btn" data-page="${current + 1}">Next</button>` : ''}
      </div>
    `;
  },
};
