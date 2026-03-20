const UI = {
  setLoading(v) {
    document.getElementById('pg-bar')?.classList.toggle('on', v);
  },

  setPage(html, opts={}) {
    const pg = document.getElementById('page');
    if (!pg) return;
    pg.innerHTML = html;
    if (!opts.noFooter) document.getElementById('app-footer').innerHTML = UI.footer();
    else document.getElementById('app-footer').innerHTML = '';
    // bind dots menu
    pg.querySelectorAll('[data-dots]').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const existing = document.querySelector('.dots-menu.open');
        if (existing && existing.dataset.for !== btn.dataset.dots) existing.classList.remove('open');
        const menu = document.querySelector(`.dots-menu[data-for="${btn.dataset.dots}"]`);
        menu?.classList.toggle('open');
      });
    });
    document.addEventListener('click', () => {
      document.querySelectorAll('.dots-menu.open').forEach(m => m.classList.remove('open'));
    }, {once:true});
  },

  renderNav() {
    const nav = document.getElementById('app-nav');
    if (!nav) return;
    const u = window._user;
    const path = location.pathname;
    const links = [
      {label:'Beranda', go:'/home'},
      {label:'Anime', go:'/browse?cat=anime'},
      {label:'Donghua', go:'/browse?cat=donghua'},
      {label:'Drakor', go:'/browse?cat=drakor'},
      {label:'Dracin', go:'/browse?cat=dracin'},
    ];
    nav.innerHTML = `
      <nav id="navbar">
        <a class="nb-logo" data-go="/home">
          <div class="nb-logo-icon">
            <svg viewBox="0 0 32 32" fill="none"><rect width="32" height="32" rx="8" fill="#E8365D"/><path d="M9 10v12l5.5-2.5 2.5 4.5 3.5-2-2.5-4.5 5.5-2.5L9 10z" fill="white"/></svg>
          </div>
          <span>KICEN<b>XENSAI</b></span>
        </a>
        <div class="nb-links">
          ${links.map(l=>`<a class="nb-link${path===l.go||path.startsWith(l.go.split('?')[0]+'?')?' on':''}" data-go="${l.go}">${l.label}</a>`).join('')}
        </div>
        <div class="nb-right">
          <button class="nb-icon" id="nb-search" aria-label="Cari">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          </button>
          ${u
            ? `<a class="nb-avatar" data-go="/profile" title="${u.name||u.displayName||'Profil'}">
                ${(u.photo||u.photoURL)?`<img src="${u.photo||u.photoURL}" alt="avatar"/>`:`<span>${(u.name||u.displayName||'K').charAt(0).toUpperCase()}</span>`}
              </a>`
            : `<a class="nb-login" data-go="/auth?m=login">Masuk</a>`
          }
          <a class="nb-premium" data-go="/premium">Premium</a>
          <button class="nb-menu-btn" id="nb-menu" aria-label="Menu">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="5" r="1" fill="currentColor"/><circle cx="12" cy="12" r="1" fill="currentColor"/><circle cx="12" cy="19" r="1" fill="currentColor"/></svg>
          </button>
        </div>
      </nav>
      <div class="nb-drawer" id="nb-drawer">
        ${links.map(l=>`<a class="nb-drawer-link" data-go="${l.go}">${l.label}</a>`).join('')}
        <a class="nb-drawer-link" data-go="/support">Bantuan</a>
        <div class="nb-drawer-sep"></div>
        ${u
          ? `<a class="nb-drawer-link" data-go="/profile">Profil</a>
             ${u.role==='admin'?`<a class="nb-drawer-link red" data-go="/admin">Admin Panel</a>`:''}
             <button class="nb-drawer-link red" id="nb-logout">Keluar</button>`
          : `<a class="nb-drawer-link" data-go="/auth?m=login">Masuk</a>
             <a class="nb-drawer-link" data-go="/auth?m=register">Daftar</a>`
        }
        <a class="nb-drawer-link gold" data-go="/premium">Premium</a>
      </div>
      <div class="nb-search-bar" id="nb-searchbar">
        <div class="nb-search-inner">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input type="text" id="nb-search-input" placeholder="Cari judul..." autocomplete="off"/>
          <button id="nb-search-close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>
      </div>
    `;
    this._bindNav();
  },

  _bindNav() {
    const drawer = document.getElementById('nb-drawer');
    const searchbar = document.getElementById('nb-searchbar');

    document.getElementById('nb-menu')?.addEventListener('click', () => {
      drawer?.classList.toggle('open');
    });
    document.getElementById('nb-search')?.addEventListener('click', () => {
      searchbar?.classList.add('open');
      document.getElementById('nb-search-input')?.focus();
    });
    document.getElementById('nb-search-close')?.addEventListener('click', () => {
      searchbar?.classList.remove('open');
    });
    document.getElementById('nb-search-input')?.addEventListener('keydown', e => {
      if (e.key==='Enter') {
        const v = e.target.value.trim();
        if (v) { searchbar?.classList.remove('open'); Router.go(`/search?q=${encodeURIComponent(v)}`); }
      }
      if (e.key==='Escape') searchbar?.classList.remove('open');
    });
    document.getElementById('nb-logout')?.addEventListener('click', async () => {
      await window.Auth?.logout();
      Router.go('/');
    });

    // Scroll behavior
    let last = 0;
    const nb = document.getElementById('navbar');
    window.removeEventListener('scroll', window._scrollNav);
    window._scrollNav = () => {
      const y = window.scrollY;
      if (nb) {
        nb.classList.toggle('scrolled', y > 40);
        nb.classList.toggle('up', y < last - 5);
        nb.classList.toggle('down', y > last + 8 && y > 100);
      }
      last = y;
    };
    window.addEventListener('scroll', window._scrollNav, {passive:true});
  },

  toast(msg, type='info') {
    const t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg;
    t.className = `toast-show ${type}`;
    clearTimeout(window._toastTimer);
    window._toastTimer = setTimeout(() => t.className = '', 3000);
  },

  avatar(user, size='md') {
    const cl = size==='sm' ? 'ava sm' : 'ava';
    if (user?.photo||user?.photoURL) return `<img class="${cl}" src="${user.photo||user.photoURL}" alt="av"/>`;
    return `<div class="${cl} ph">${(user?.name||user?.displayName||'?').charAt(0).toUpperCase()}</div>`;
  },

  card(item, opts={}) {
    if (!item) return '';
    const col = C.CATS[item.category]?.color || '#6B7280';
    const poster = item.poster
      ? `<img src="${item.poster}" alt="${item.title}" loading="lazy" onerror="this.style.display='none';this.nextSibling.style.display='flex'"/>
         <div class="card-np" style="display:none">${(item.title||'?').charAt(0)}</div>`
      : `<div class="card-np">${(item.title||'?').charAt(0)}</div>`;

    return `
      <div class="card" data-go="/detail?id=${item.id}&type=${item.type||'tv'}&cat=${item.category}">
        <div class="card-thumb">
          ${poster}
          <div class="card-shade"></div>
          <span class="card-badge" style="background:${col}">${(item.category||'').toUpperCase()}</span>
          ${item.rating?`<span class="card-score">★${item.rating}</span>`:''}
          <div class="card-hover-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
          </div>
        </div>
        <div class="card-meta">
          <div class="card-title">${item.title||''}</div>
          <div class="card-info">${item.year||''} ${item.episodes&&item.episodes!=='?'?`· ${item.episodes} ep`:''}</div>
        </div>
      </div>
    `;
  },

  skel(n=8) {
    return `<div class="cards-grid">${Array(n).fill(`
      <div class="card skel">
        <div class="card-thumb"><div class="sk-img"></div></div>
        <div class="card-meta"><div class="sk-line"></div><div class="sk-line short"></div></div>
      </div>`).join('')}</div>`;
  },

  pages(cur, total) {
    if (total<=1) return '';
    const max = Math.min(total,200), ps=[];
    ps.push(1);
    if (cur>3) ps.push('…');
    for (let i=Math.max(2,cur-1);i<=Math.min(max-1,cur+1);i++) ps.push(i);
    if (cur<max-2) ps.push('…');
    if (max>1) ps.push(max);
    return `<div class="pg">${cur>1?`<button class="pg-btn" data-page="${cur-1}">Prev</button>`:''}
    ${ps.map(p=>p==='…'?`<span class="pg-dot">…</span>`:`<button class="pg-btn${p===cur?' on':''}" data-page="${p}">${p}</button>`).join('')}
    ${cur<max?`<button class="pg-btn" data-page="${cur+1}">Next</button>`:''}</div>`;
  },

  bindPages(cat, cur) {
    document.querySelectorAll('[data-page]').forEach(b => {
      b.addEventListener('click', () => Router.go(`/browse?cat=${cat}&p=${b.dataset.page}`));
    });
  },

  footer() {
    return `<footer class="footer">
      <div class="foot-inner">
        <div class="foot-brand">
          <a class="foot-logo" data-go="/home">KICEN<span>XENSAI</span></a>
          <p>Platform nonton anime, donghua, drama Korea, dan drama China terlengkap dengan subtitle Indonesia.</p>
          <small>Developed by <strong>Kiki Faizal</strong></small>
        </div>
        <div class="foot-col"><h4>Konten</h4>
          <a data-go="/browse?cat=anime">Anime</a>
          <a data-go="/browse?cat=donghua">Donghua</a>
          <a data-go="/browse?cat=drakor">Drakor</a>
          <a data-go="/browse?cat=dracin">Dracin</a>
        </div>
        <div class="foot-col"><h4>Lainnya</h4>
          <a data-go="/premium">Paket Premium</a>
          <a data-go="/support">Bantuan</a>
          <a data-go="/profile">Profil</a>
        </div>
      </div>
      <div class="foot-bottom">
        <span>© 2025 Kicen Xensai. Developed by <strong>Kiki Faizal</strong>.</span>
      </div>
    </footer>`;
  },
};
