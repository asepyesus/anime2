const UI = {
  navbar() {
    const u = window._user;
    const p = location.pathname;
    return `
    <nav id="navbar">
      <a class="logo" data-go="${u?'/home':'/'}" >
        <svg viewBox="0 0 40 40" fill="none" width="32" height="32"><rect width="40" height="40" rx="10" fill="#E8365D"/><path d="M11 13v14l7-3.5 3 5.5 4-2.5-3-5.5 7-3.5L11 13z" fill="white"/></svg>
        <span>KICEN<b>XENSAI</b></span>
      </a>
      <div class="nav-links">
        <a class="nav-a${p==='/'||p==='/home'?' on':''}" data-go="${u?'/home':'/'}" >Beranda</a>
        <a class="nav-a${p.startsWith('/browse')?' on':''}" data-go="/browse">Donghua</a>
        <a class="nav-a${p==='/search'?' on':''}" data-go="/search">Cari</a>
      </div>
      <div class="nav-right">
        <button class="nav-icon" id="nb-search-btn" title="Cari">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        </button>
        ${u
          ? `<a class="nav-ava" data-go="/profile" title="Profil">
              ${u.photo||u.photoURL ? `<img src="${u.photo||u.photoURL}" alt="av"/>` : `<span>${(u.name||u.displayName||'K').charAt(0).toUpperCase()}</span>`}
            </a>`
          : `<a class="nav-login" data-go="/auth">Masuk</a>`
        }
        <a class="nav-premium" data-go="/premium">Premium</a>
        <button class="nav-menu-btn" id="nb-menu-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>
        </button>
      </div>
    </nav>
    <div class="nav-drawer" id="nb-drawer">
      <a class="drawer-a" data-go="${u?'/home':'/'}" >Beranda</a>
      <a class="drawer-a" data-go="/browse">Donghua</a>
      <a class="drawer-a" data-go="/search">Cari</a>
      <a class="drawer-a" data-go="/support">Bantuan</a>
      <div class="drawer-sep"></div>
      ${u
        ? `<a class="drawer-a" data-go="/profile">Profil — ${u.name||u.displayName||''}</a>
           ${u.role==='admin'?`<a class="drawer-a red" data-go="/admin">Admin Panel</a>`:''}
           <button class="drawer-a red" id="nb-logout">Keluar</button>`
        : `<a class="drawer-a" data-go="/auth">Masuk / Daftar</a>`
      }
      <a class="drawer-a gold" data-go="/premium">Premium</a>
    </div>
    <div class="search-bar" id="nb-searchbar">
      <div class="sb-inner">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        <input id="sb-input" type="text" placeholder="Cari donghua..." autocomplete="off"/>
        <button id="sb-close">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>
      </div>
    </div>`;
  },

  _bindNav() {
    const drawer  = document.getElementById('nb-drawer');
    const sb      = document.getElementById('nb-searchbar');
    const sbInput = document.getElementById('sb-input');

    document.getElementById('nb-menu-btn')?.addEventListener('click', () => drawer?.classList.toggle('open'));
    document.getElementById('nb-search-btn')?.addEventListener('click', () => { sb?.classList.add('open'); sbInput?.focus(); });
    document.getElementById('sb-close')?.addEventListener('click', () => sb?.classList.remove('open'));
    sbInput?.addEventListener('keydown', e => {
      if (e.key==='Enter' && e.target.value.trim()) { sb.classList.remove('open'); Router.go(`/search?q=${encodeURIComponent(e.target.value.trim())}`); }
      if (e.key==='Escape') sb.classList.remove('open');
    });
    document.getElementById('nb-logout')?.addEventListener('click', async () => { await window.Auth.logout(); Router.go('/'); });

    // Scroll hide/show navbar
    let last=0;
    window.removeEventListener('scroll', window._scrollFn);
    window._scrollFn = () => {
      const y=window.scrollY, nb=document.getElementById('navbar');
      if (!nb) return;
      nb.classList.toggle('scrolled', y>40);
      nb.classList.toggle('hide', y>last+8 && y>120);
      if (y<last-5) nb.classList.remove('hide');
      last=y;
    };
    window.addEventListener('scroll', window._scrollFn, {passive:true});
  },

  footer() {
    return `<footer>
      <div class="ft-inner">
        <div class="ft-brand">
          <a class="ft-logo" data-go="/">KICEN<span>XENSAI</span></a>
          <p>Platform nonton donghua subtitle Indonesia terlengkap.</p>
          <small>Developed by <strong>Kiki Faizal</strong></small>
        </div>
        <div class="ft-col"><h4>Navigasi</h4>
          <a data-go="/browse">Semua Donghua</a>
          <a data-go="/search">Pencarian</a>
          <a data-go="/premium">Premium</a>
          <a data-go="/support">Bantuan</a>
        </div>
      </div>
      <div class="ft-bottom">© 2025 Kicen Xensai · Developed by <strong>Kiki Faizal</strong></div>
    </footer>`;
  },

  // Donghua card from Anichin API
  card(item) {
    const slug = item.slug || '';
    const poster = item.thumbnail || '';
    const title  = item.title || 'Untitled';
    const eps    = item.eps   ? `Ep ${item.eps}` : '';
    const type   = item.type  || 'Donghua';

    return `
    <a class="card" data-go="/detail?slug=${encodeURIComponent(slug)}">
      <div class="card-img">
        ${poster ? `<img src="${poster}" alt="${title}" loading="lazy" onerror="this.style.display='none'"/>` : `<div class="card-np">${title.charAt(0)}</div>`}
        <div class="card-shade"></div>
        ${eps ? `<span class="card-eps">${eps}</span>` : ''}
        <div class="card-play">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
        </div>
      </div>
      <div class="card-info">
        <div class="card-title">${title}</div>
        <div class="card-type">${type}</div>
      </div>
    </a>`;
  },

  skel(n=12) {
    return `<div class="cards-grid">${Array(n).fill(`<div class="card skel"><div class="card-img"></div><div class="card-info"><div class="sk-line"></div><div class="sk-line short"></div></div></div>`).join('')}</div>`;
  },

  ava(user) {
    if (user?.photo||user?.photoURL) return `<img class="ava" src="${user.photo||user.photoURL}" alt="av"/>`;
    return `<div class="ava ph">${(user?.name||user?.displayName||'?').charAt(0).toUpperCase()}</div>`;
  },
};
