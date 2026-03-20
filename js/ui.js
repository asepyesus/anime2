const UI = {

  navbar() {
    const u = window._user;
    const p = location.pathname;
    const isHome = p === '/' || p === '/home';
    return `
    <nav id="navbar">
      <a class="logo" data-go="${u ? '/home' : '/'}">
        <svg viewBox="0 0 40 40" fill="none" width="30" height="30">
          <rect width="40" height="40" rx="10" fill="#E8365D"/>
          <path d="M11 13v14l7-3.5 3 5.5 4-2.5-3-5.5 7-3.5L11 13z" fill="white"/>
        </svg>
        <span>KICEN<b>XENSAI</b></span>
      </a>

      <div class="nav-links">
        <a class="nav-a${isHome ? ' on' : ''}" data-go="${u ? '/home' : '/'}">Beranda</a>
        <a class="nav-a${p.startsWith('/browse') ? ' on' : ''}" data-go="/browse">Donghua</a>
        <a class="nav-a${p === '/search' ? ' on' : ''}" data-go="/search">Cari</a>
      </div>

      <div class="nav-right">
        <button class="nav-icon" id="nb-search-btn" title="Cari">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
        </button>

        ${u
          ? `<a class="nav-ava" data-go="/profile" title="Profil">
              ${u.photo || u.photoURL
                ? `<img src="${u.photo || u.photoURL}" alt="av" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"/>
                   <span style="display:none">${(u.name || u.displayName || 'K').charAt(0).toUpperCase()}</span>`
                : `<span>${(u.name || u.displayName || 'K').charAt(0).toUpperCase()}</span>`
              }
            </a>`
          : `<a class="nav-login" data-go="/auth">Masuk</a>`
        }

        <a class="nav-premium" data-go="/premium">Premium</a>

        <button class="nav-menu-btn" id="nb-menu-btn" aria-label="Menu">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/>
          </svg>
        </button>
      </div>
    </nav>

    <div class="nav-drawer" id="nb-drawer">
      <a class="drawer-a" data-go="${u ? '/home' : '/'}">Beranda</a>
      <a class="drawer-a" data-go="/browse">Donghua</a>
      <a class="drawer-a" data-go="/search">Cari</a>
      <a class="drawer-a" data-go="/support">Bantuan</a>
      <div class="drawer-sep"></div>
      ${u
        ? `<a class="drawer-a" data-go="/profile">Profil — ${u.name || u.displayName || ''}</a>
           ${u.role === 'admin' ? `<a class="drawer-a red" data-go="/admin">Admin Panel</a>` : ''}
           <button class="drawer-a red" id="nb-logout">Keluar</button>`
        : `<a class="drawer-a" data-go="/auth">Masuk / Daftar</a>`
      }
      <a class="drawer-a gold" data-go="/premium">Premium</a>
    </div>

    <div class="search-bar" id="nb-searchbar">
      <div class="sb-inner">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input id="sb-input" type="text" placeholder="Cari donghua..." autocomplete="off" spellcheck="false"/>
        <button id="sb-close" aria-label="Tutup">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6 6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>
    </div>`;
  },

  _bindNav() {
    const drawer  = document.getElementById('nb-drawer');
    const sb      = document.getElementById('nb-searchbar');
    const sbInput = document.getElementById('sb-input');

    document.getElementById('nb-menu-btn')?.addEventListener('click', () => {
      drawer?.classList.toggle('open');
    });

    document.getElementById('nb-search-btn')?.addEventListener('click', () => {
      sb?.classList.add('open');
      sbInput?.focus();
    });

    document.getElementById('sb-close')?.addEventListener('click', () => {
      sb?.classList.remove('open');
      if (sbInput) sbInput.value = '';
    });

    sbInput?.addEventListener('keydown', e => {
      if (e.key === 'Enter' && e.target.value.trim()) {
        sb.classList.remove('open');
        Router.go(`/search?q=${encodeURIComponent(e.target.value.trim())}`);
        sbInput.value = '';
      }
      if (e.key === 'Escape') {
        sb.classList.remove('open');
        sbInput.value = '';
      }
    });

    document.getElementById('nb-logout')?.addEventListener('click', async () => {
      try {
        await window.Auth.logout();
        App.toast('Berhasil keluar');
        Router.go('/');
      } catch {
        App.toast('Gagal keluar', 'err');
      }
    });

    // Close drawer when clicking outside
    document.addEventListener('click', e => {
      if (drawer?.classList.contains('open') && !e.target.closest('#nb-drawer') && !e.target.closest('#nb-menu-btn')) {
        drawer.classList.remove('open');
      }
    }, { capture: true, once: false, passive: true });

    // Scroll hide/show navbar
    let lastY = 0;
    window.removeEventListener('scroll', window._scrollFn);
    window._scrollFn = () => {
      const y = window.scrollY;
      const nb = document.getElementById('navbar');
      if (!nb) return;
      nb.classList.toggle('scrolled', y > 40);
      if (y > lastY + 8 && y > 120) nb.classList.add('hide');
      if (y < lastY - 5) nb.classList.remove('hide');
      lastY = y;
    };
    window.addEventListener('scroll', window._scrollFn, { passive: true });
  },

  footer() {
    const y = new Date().getFullYear();
    return `
    <footer>
      <div class="ft-inner">
        <div class="ft-brand">
          <a class="ft-logo" data-go="/">KICEN<span>XENSAI</span></a>
          <p>Platform nonton donghua subtitle Indonesia terlengkap dan terupdate.</p>
          <div class="ft-dev">
            <small>Developed by <strong>Kiki Faizal</strong></small>
          </div>
          <div class="ft-socials">
            <a href="https://instagram.com/kiki_fzl" target="_blank" rel="noopener" class="ft-social-link">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/>
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
              </svg>
              @kiki_fzl
            </a>
            <a href="https://t.me/kyshiro1" target="_blank" rel="noopener" class="ft-social-link">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 3L2 10.5l7 1.5 2 6 3-3 4 3z"/>
              </svg>
              @kyshiro1
            </a>
            <a href="mailto:kikimodesad8@gmail.com" class="ft-social-link">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 01-2.06 0L2 7"/>
              </svg>
              Email
            </a>
          </div>
        </div>
        <div class="ft-col">
          <h4>Navigasi</h4>
          <a data-go="/browse">Semua Donghua</a>
          <a data-go="/search">Pencarian</a>
          <a data-go="/premium">Premium</a>
          <a data-go="/support">Bantuan</a>
        </div>
      </div>
      <div class="ft-bottom">
        © ${y} Kicen Xensai &middot; Developed by <strong>Kiki Faizal</strong> &middot; Kicen Developer
      </div>
    </footer>`;
  },

  // Card dari Anichin API — normalize berbagai format field
  card(item) {
    const slug    = item.slug || '';
    const poster  = item.thumbnail || item.poster || item.cover || '';
    const title   = item.title || item.name || 'Untitled';
    const eps     = item.eps || item.episode_number || '';
    const type    = item.type || '';
    const rating  = item.rating || item.score || '';
    const status  = item.status || '';

    return `
    <a class="card" data-go="/detail?slug=${encodeURIComponent(slug)}">
      <div class="card-img">
        ${poster
          ? `<img src="${poster}" alt="${_escAttr(title)}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"/>
             <div class="card-np" style="display:none">${title.charAt(0)}</div>`
          : `<div class="card-np">${title.charAt(0)}</div>`
        }
        <div class="card-shade"></div>
        ${eps ? `<span class="card-eps">Ep ${eps}</span>` : ''}
        ${status && status.toLowerCase().includes('ongoing') ? `<span class="card-status on">Ongoing</span>` : ''}
        <div class="card-play">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
        </div>
      </div>
      <div class="card-info">
        <div class="card-title">${title}</div>
        <div class="card-meta">
          ${type ? `<span class="card-type">${type}</span>` : ''}
          ${rating ? `<span class="card-rating">★ ${rating}</span>` : ''}
        </div>
      </div>
    </a>`;
  },

  skel(n = 12) {
    return `<div class="cards-grid">${
      Array(n).fill(`
        <div class="card skel">
          <div class="card-img"></div>
          <div class="card-info">
            <div class="sk-line"></div>
            <div class="sk-line short"></div>
          </div>
        </div>
      `).join('')
    }</div>`;
  },

  ava(user) {
    if (user?.photo || user?.photoURL) {
      return `<img class="ava" src="${user.photo || user.photoURL}" alt="av"
        onerror="this.outerHTML='<div class=\\'ava ph\\'>${(user?.name || user?.displayName || '?').charAt(0).toUpperCase()}</div>'"/>`;
    }
    return `<div class="ava ph">${(user?.name || user?.displayName || '?').charAt(0).toUpperCase()}</div>`;
  },
};

// Global escape helpers
function _esc(t = '') {
  return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function _escAttr(t = '') {
  return String(t).replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
