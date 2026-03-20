Pages.auth = async function({ m='login' }) {
  // Already logged in — go home
  if (window._user) {
    Router.go(sessionStorage.getItem('_ar') || '/home');
    sessionStorage.removeItem('_ar');
    return;
  }

  UI.renderNav();
  UI.setPage(`
    <div class="auth-pg">
      <div class="auth-card">
        <a class="auth-logo" data-go="/">KICEN<span>XENSAI</span></a>
        <div class="auth-tabs">
          <button class="auth-tab${m==='login'?' on':''}" data-m="login">Masuk</button>
          <button class="auth-tab${m==='register'?' on':''}" data-m="register">Daftar</button>
        </div>
        <div id="auth-form">${m==='login' ? _loginForm() : _registerForm()}</div>
      </div>
    </div>
  `, { noFooter: true });

  document.querySelectorAll('.auth-tab').forEach(b => {
    b.addEventListener('click', () => {
      const mode = b.dataset.m;
      document.querySelectorAll('.auth-tab').forEach(x => x.classList.toggle('on', x.dataset.m === mode));
      document.getElementById('auth-form').innerHTML = mode === 'login' ? _loginForm() : _registerForm();
      _bindAuth(mode);
    });
  });

  _bindAuth(m);
};

function _loginForm() {
  return `
    <button class="btn-google" id="g-btn">
      <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
      Masuk dengan Google
    </button>
    <div class="auth-or"><span>atau</span></div>
    <div class="auth-field"><label>Email</label><input type="email" id="af-email" placeholder="email@kamu.com" autocomplete="email"/></div>
    <div class="auth-field"><label>Password</label><input type="password" id="af-pass" placeholder="Password" autocomplete="current-password"/></div>
    <div class="auth-err" id="af-err"></div>
    <button class="btn-auth" id="af-submit">Masuk</button>
    <p class="auth-foot">Belum punya akun? <a data-go="/auth?m=register">Daftar sekarang</a></p>
  `;
}

function _registerForm() {
  return `
    <button class="btn-google" id="g-btn">
      <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
      Daftar dengan Google
    </button>
    <div class="auth-or"><span>atau</span></div>
    <div class="auth-field"><label>Nama</label><input type="text" id="af-name" placeholder="Nama kamu" autocomplete="name"/></div>
    <div class="auth-field"><label>Email</label><input type="email" id="af-email" placeholder="email@kamu.com" autocomplete="email"/></div>
    <div class="auth-field"><label>Password</label><input type="password" id="af-pass" placeholder="Min. 6 karakter" autocomplete="new-password"/></div>
    <div class="auth-err" id="af-err"></div>
    <button class="btn-auth" id="af-submit">Buat Akun</button>
    <p class="auth-foot">Sudah punya akun? <a data-go="/auth?m=login">Masuk</a></p>
  `;
}

function _bindAuth(mode) {
  const setErr  = msg => { const e = document.getElementById('af-err'); if (e) e.textContent = msg; };
  const setLoad = v   => { const b = document.getElementById('af-submit'); if (b) { b.disabled = v; b.style.opacity = v ? '.55' : '1'; b.textContent = v ? 'Memuat...' : (mode === 'login' ? 'Masuk' : 'Buat Akun'); } };

  // After successful Firebase auth, wait for onAuthStateChanged to fire
  // then navigate. This is reliable because Firebase triggers the listener
  // automatically after login/register.
  function goAfterAuth() {
    return new Promise(resolve => {
      // If _user already set (e.g. onAuthStateChanged already fired), go immediately
      if (window._user) { resolve(); return; }
      // Otherwise wait for the next state change (max 5s)
      const timer = setTimeout(resolve, 5000);
      const originalInit = window.Auth._authCallback;
      window._onNextAuthState = () => {
        clearTimeout(timer);
        resolve();
      };
    });
  }

  document.getElementById('g-btn')?.addEventListener('click', async () => {
    setErr('');
    try {
      await window.Auth.google();
      await goAfterAuth();
      const dest = sessionStorage.getItem('_ar') || '/home';
      sessionStorage.removeItem('_ar');
      Router.go(dest);
    } catch(e) {
      setErr(_errMsg(e.code));
    }
  });

  document.getElementById('af-submit')?.addEventListener('click', async () => {
    setErr('');
    const email = document.getElementById('af-email')?.value.trim();
    const pass  = document.getElementById('af-pass')?.value;

    if (mode === 'register') {
      const name = document.getElementById('af-name')?.value.trim();
      if (!name)  return setErr('Nama tidak boleh kosong.');
      if (!email) return setErr('Email tidak boleh kosong.');
      if (!pass)  return setErr('Password tidak boleh kosong.');
      if (pass.length < 6) return setErr('Password minimal 6 karakter.');
      try {
        setLoad(true);
        await window.Auth.register(email, pass, name);
        await goAfterAuth();
        Router.go('/home');
      } catch(e) {
        setErr(_errMsg(e.code));
      } finally {
        setLoad(false);
      }
    } else {
      if (!email) return setErr('Email tidak boleh kosong.');
      if (!pass)  return setErr('Password tidak boleh kosong.');
      try {
        setLoad(true);
        await window.Auth.login(email, pass);
        await goAfterAuth();
        const dest = sessionStorage.getItem('_ar') || '/home';
        sessionStorage.removeItem('_ar');
        Router.go(dest);
      } catch(e) {
        setErr(_errMsg(e.code));
      } finally {
        setLoad(false);
      }
    }
  });

  // Enter key support
  document.getElementById('af-pass')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('af-submit')?.click();
  });
}

function _errMsg(code) {
  const map = {
    'auth/user-not-found':     'Email tidak terdaftar.',
    'auth/wrong-password':     'Password salah.',
    'auth/invalid-credential': 'Email atau password salah.',
    'auth/email-already-in-use': 'Email sudah dipakai akun lain.',
    'auth/invalid-email':      'Format email tidak valid.',
    'auth/too-many-requests':  'Terlalu banyak percobaan. Coba lagi nanti.',
    'auth/popup-closed-by-user': 'Login Google dibatalkan.',
    'auth/popup-blocked':      'Popup diblokir browser. Izinkan popup untuk situs ini.',
    'auth/network-request-failed': 'Tidak ada koneksi internet.',
  };
  return map[code] || `Terjadi kesalahan (${code || 'unknown'}). Coba lagi.`;
}


Pages.premium = async function() {
  UI.renderNav();
  UI.setPage(`
    <div class="prem-pg">
      <div class="prem-hero">
        <h1>Pilih Paket</h1>
        <p>Nikmati konten tanpa batas.</p>
      </div>
      <div class="prem-plans">
        ${C.PLANS.map(plan=>`
          <div class="prem-card${plan.hot?' hot':''}">
            ${plan.hot?`<div class="prem-pop">Terpopuler</div>`:''}
            <div class="prem-card-head">
              <div class="prem-name" style="color:${plan.color}">${plan.name}</div>
              <div class="prem-price">
                ${plan.price===0
                  ? `<span class="pp-free">Gratis</span>`
                  : `<span class="pp-amt">Rp ${plan.price.toLocaleString('id-ID')}</span><span class="pp-per">/bulan</span>`
                }
              </div>
            </div>
            <ul class="prem-list">
              ${plan.perks.map(p=>`<li><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${plan.color}" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>${p}</li>`).join('')}
            </ul>
            <button class="prem-btn${plan.id==='free'?' free':''}" style="--c:${plan.color}" data-plan="${plan.id}">
              ${plan.id==='free'?'Pakai Gratis':`Pilih ${plan.name}`}
            </button>
          </div>
        `).join('')}
      </div>
      <div class="prem-pay-modal" id="pay-modal">
        <div class="ppm-box">
          <button class="ppm-close" id="pay-close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
          <div id="pay-content"></div>
        </div>
      </div>
    </div>
  `);

  document.querySelectorAll('.prem-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const plan = C.PLANS.find(p=>p.id===btn.dataset.plan);
      if (!plan || plan.id==='free') { UI.toast('Kamu menggunakan paket Gratis.'); return; }
      openPayment(plan);
    });
  });
  document.getElementById('pay-close')?.addEventListener('click', () => {
    document.getElementById('pay-modal')?.classList.remove('open');
  });
};

function openPayment(plan) {
  const modal = document.getElementById('pay-modal');
  const content = document.getElementById('pay-content');
  content.innerHTML = `
    <h2 class="pay-title">Paket <span style="color:${plan.color}">${plan.name}</span></h2>
    <div class="pay-price">Rp ${plan.price.toLocaleString('id-ID')} / bulan</div>
    <div class="pay-methods-label">Pilih Metode</div>
    <div class="pay-methods">
      ${C.PAY.map(p=>`<button class="pay-method" data-id="${p.id}">${p.label}</button>`).join('')}
    </div>
    <div id="pay-action"></div>
  `;
  modal?.classList.add('open');

  document.querySelectorAll('.pay-method').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.pay-method').forEach(b=>b.classList.remove('on'));
      btn.classList.add('on');
      document.getElementById('pay-action').innerHTML = `
        <button class="pay-go" style="background:${plan.color}">Bayar via ${btn.textContent}</button>
        <p class="pay-disc">Demo — tidak ada transaksi nyata.</p>
      `;
      document.querySelector('.pay-go')?.addEventListener('click', () => {
        document.getElementById('pay-action').innerHTML = `
          <div class="pay-ok">
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="${plan.color}" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="20 6 9 17 4 12"/></svg>
            <h3>Berhasil!</h3>
            <p>Paket ${plan.name} aktif sekarang.</p>
          </div>
        `;
      });
    });
  });
}

Pages.profile = async function() {
  if (!window.Auth?.current) { sessionStorage.setItem('_ar','/profile'); Router.go('/auth?m=login'); return; }
  UI.renderNav();
  const u = window.Auth.current;

  UI.setPage(`
    <div class="prof-pg">
      <div class="prof-header">
        <div class="prof-ava-wrap">
          ${u.photo||u.photoURL?`<img class="prof-ava" src="${u.photo||u.photoURL}" alt="avatar"/>`:`<div class="prof-ava ph">${(u.name||u.displayName||'K').charAt(0).toUpperCase()}</div>`}
        </div>
        <div class="prof-info">
          <h1>${u.name||u.displayName||'User'}</h1>
          <p>${u.email}</p>
          <div class="prof-badges">
            <span class="role-badge ${u.role||'user'}">${u.role||'user'}</span>
            ${u.banned?`<span class="status-badge banned">Dibanned</span>`:''}
          </div>
        </div>
        <div class="prof-acts">
          ${window.Auth.isAdmin()?`<a class="btn-sm-red" data-go="/admin">Admin Panel</a>`:''}
          <button class="btn-sm-outline" id="prof-logout">Keluar</button>
        </div>
      </div>

      <div class="prof-tabs">
        <button class="prof-tab on" data-tab="watchlist">Watchlist</button>
        <button class="prof-tab" data-tab="history">Riwayat</button>
      </div>
      <div id="prof-content"><div class="center-spinner"><div class="spinner"></div></div></div>
    </div>
  `);

  document.getElementById('prof-logout')?.addEventListener('click', async () => {
    await window.Auth.logout(); Router.go('/');
  });

  document.querySelectorAll('.prof-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.prof-tab').forEach(t=>t.classList.remove('on'));
      tab.classList.add('on');
      if (tab.dataset.tab==='watchlist') loadWatchlist();
      else loadHistory();
    });
  });

  loadWatchlist();
};

async function loadWatchlist() {
  const el = document.getElementById('prof-content');
  if (!el) return;
  try {
    const list = await window.DB.getWatchlist();
    el.innerHTML = list.length
      ? `<div class="cards-grid" style="padding:0">${list.map(UI.card).join('')}</div>`
      : `<p class="empty-msg" style="padding:2rem 0">Watchlist masih kosong.</p>`;
  } catch { el.innerHTML = `<p class="empty-msg">Gagal memuat.</p>`; }
}

function loadHistory() {
  const el = document.getElementById('prof-content');
  if (!el) return;
  const h = API.getHistory();
  el.innerHTML = h.length
    ? `<div class="cards-grid" style="padding:0">${h.map(UI.card).join('')}</div>`
    : `<p class="empty-msg" style="padding:2rem 0">Riwayat tontonan kosong.</p>`;
}

Pages.admin = async function({ tab='dash' }) {
  if (!window.Auth?.current) { sessionStorage.setItem('_ar','/admin'); Router.go('/auth?m=login'); return; }
  if (!window.Auth.isAdmin()) { UI.setPage(`<div class="pg-err"><h2>Akses ditolak.</h2><a data-go="/home">Kembali</a></div>`); return; }
  UI.renderNav();

  const navItems = [
    {id:'dash', label:'Dashboard'},
    {id:'users', label:'Kelola User'},
    {id:'comments', label:'Moderasi Komentar'},
  ];

  UI.setPage(`
    <div class="admin-layout">
      <div class="admin-rail">
        <div class="admin-rail-title">Admin Panel</div>
        <nav>
          ${navItems.map(n=>`<a class="admin-nav-item${tab===n.id?' on':''}" data-go="/admin?tab=${n.id}">${n.label}</a>`).join('')}
        </nav>
        <a class="admin-back" data-go="/home">Kembali ke Situs</a>
      </div>
      <div class="admin-main" id="admin-main">
        <div class="center-spinner"><div class="spinner"></div></div>
      </div>
    </div>
  `, {noFooter:true});

  const main = document.getElementById('admin-main');

  if (tab==='dash') {
    try {
      const s = await window.DB.stats();
      main.innerHTML = `
        <h1 class="admin-title">Dashboard</h1>
        <div class="admin-stats">
          <div class="admin-stat"><div class="as-num">${s.users}</div><div class="as-label">Total User</div></div>
          <div class="admin-stat"><div class="as-num">${s.comments}</div><div class="as-label">Total Komentar</div></div>
          <div class="admin-stat"><div class="as-num">KIKI ADMIN</div><div class="as-label">Admin Aktif</div></div>
        </div>
        <div class="admin-quick">
          <h2>Aksi Cepat</h2>
          <a class="admin-qbtn" data-go="/admin?tab=users">Kelola User</a>
          <a class="admin-qbtn" data-go="/admin?tab=comments">Moderasi Komentar</a>
        </div>
      `;
    } catch { main.innerHTML=`<p class="empty-msg">Gagal memuat statistik.</p>`; }
  }

  else if (tab==='users') {
    try {
      const users = await window.DB.getUsers();
      main.innerHTML = `
        <h1 class="admin-title">Kelola User <span class="admin-badge">${users.length} user</span></h1>
        <div class="admin-table-wrap">
          <table class="admin-table">
            <thead><tr><th>User</th><th>Role</th><th>Status</th><th>Aksi</th></tr></thead>
            <tbody>
              ${users.map(u=>`
                <tr class="${u.banned?'banned-row':''}">
                  <td><div class="ut-cell">
                    ${u.photo?`<img class="mini-ava" src="${u.photo}" alt="${u.name}"/>`:`<div class="mini-ava ph">${(u.name||'?').charAt(0)}</div>`}
                    <div><div class="ut-name">${u.name||'-'}</div><div class="ut-email">${u.email||'-'}</div></div>
                  </div></td>
                  <td><span class="role-badge ${u.role||'user'}">${u.role||'user'}</span></td>
                  <td><span class="status-badge ${u.banned?'banned':'active'}">${u.banned?'Banned':'Aktif'}</span></td>
                  <td><div class="tbl-acts">
                    <button class="tbl-btn ${u.banned?'unban':'ban'}" data-uid="${u.id}" data-banned="${u.banned||false}">${u.banned?'Unban':'Ban'}</button>
                    ${u.role!=='admin'?`<button class="tbl-btn promote" data-uid="${u.id}">Admin</button>`:''}
                    <button class="tbl-btn del" data-uid="${u.id}">Hapus Komen</button>
                  </div></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
      main.querySelectorAll('.tbl-btn.ban,.tbl-btn.unban').forEach(b=>b.addEventListener('click',async()=>{
        const ban = b.dataset.banned!=='true'; if(!confirm(`${ban?'Ban':'Unban'}?`))return;
        await window.DB.banUser(b.dataset.uid,ban); Router.go('/admin?tab=users');
      }));
      main.querySelectorAll('.tbl-btn.promote').forEach(b=>b.addEventListener('click',async()=>{
        if(!confirm('Jadikan admin?'))return; await window.DB.setRole(b.dataset.uid,'admin'); Router.go('/admin?tab=users');
      }));
      main.querySelectorAll('.tbl-btn.del').forEach(b=>b.addEventListener('click',async()=>{
        if(!confirm('Hapus semua komentar user ini?'))return; await window.DB.nukeComments(b.dataset.uid); UI.toast('Komentar dihapus.');
      }));
    } catch(e) { main.innerHTML=`<p class="empty-msg">Gagal: ${e.message}</p>`; }
  }

  else if (tab==='comments') {
    try {
      const comments = await window.DB.recentComments();
      main.innerHTML = `
        <h1 class="admin-title">Moderasi Komentar <span class="admin-badge">${comments.length} komentar</span></h1>
        <div class="admin-comments">
          ${!comments.length ? '<p class="empty-msg">Belum ada komentar.</p>' : comments.map(c=>`
            <div class="admin-c-card" id="acc-${c.id}">
              <div class="acc-head">
                <b>${c.name}</b>
                <span class="acc-time">${fmtAdminTime(c.createdAt)}</span>
                <span class="acc-cid">${c.contentId}</span>
              </div>
              <p class="acc-text">${c.text}</p>
              <button class="tbl-btn ban" data-id="${c.id}">Hapus</button>
            </div>
          `).join('')}
        </div>
      `;
      main.querySelectorAll('.admin-c-card .tbl-btn').forEach(b=>b.addEventListener('click',async()=>{
        if(!confirm('Hapus?'))return;
        await window.DB.deleteComment(b.dataset.id);
        document.getElementById(`acc-${b.dataset.id}`)?.remove();
      }));
    } catch(e) { main.innerHTML=`<p class="empty-msg">Gagal: ${e.message}</p>`; }
  }
};

function fmtAdminTime(ts) {
  try { const d=ts?.toDate?ts.toDate():new Date(ts); return d.toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}); } catch{return '';}
}

Pages.support = async function() {
  UI.renderNav();
  UI.setPage(`
    <div class="support-pg">
      <div class="support-hero">
        <div class="supp-logo-wrap">
          <div class="supp-logo-click" id="supp-logo-reveal">
            <svg viewBox="0 0 60 60" fill="none" width="56" height="56">
              <rect width="60" height="60" rx="14" fill="#E8365D"/>
              <path d="M18 20v20l10-5 4 8 6-3-4-8 10-5L18 20z" fill="white" stroke="white" stroke-width="0.5" stroke-linejoin="round"/>
            </svg>
          </div>
        </div>
        <h1>Bantuan</h1>
        <p>Temukan jawaban atau hubungi tim kami langsung.</p>
      </div>

      <!-- HIDDEN CONTACT - revealed on logo click -->
      <div class="supp-contact-hidden" id="supp-contact-reveal" style="display:none">
        <div class="supp-contact-card">
          <h3>Hubungi Tim</h3>
          <div class="supp-contacts">
            <a class="supp-contact-item" href="https://instagram.com/kiki_fzl1" target="_blank" rel="noopener">
              <div class="sci-icon ig">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              </div>
              <div class="sci-info">
                <span class="sci-label">Instagram</span>
                <span class="sci-val">@kiki_fzl1</span>
              </div>
            </a>
            <a class="supp-contact-item" href="https://t.me/kyshiro1" target="_blank" rel="noopener">
              <div class="sci-icon tg">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2 11 13"/><path d="M22 2 15 22l-4-9-9-4 20-7z"/></svg>
              </div>
              <div class="sci-info">
                <span class="sci-label">Telegram</span>
                <span class="sci-val">@kyshiro1</span>
              </div>
            </a>
            <a class="supp-contact-item" href="mailto:kikimodesad8@gmail.com">
              <div class="sci-icon em">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              </div>
              <div class="sci-info">
                <span class="sci-label">Email</span>
                <span class="sci-val">kikimodesad8@gmail.com</span>
              </div>
            </a>
          </div>
        </div>
      </div>

      <div class="support-cards">
        ${[
          ['Video tidak bisa diputar','Coba ganti ke Server 2, 3, atau 4 di halaman tonton. Setiap server punya konten berbeda.'],
          ['Masalah login / daftar','Pastikan email dan password benar. Untuk login Google, izinkan popup dari browser.'],
          ['Masalah pembayaran','Hubungi kami dengan menyertakan bukti transaksi. Diproses dalam 1x24 jam.'],
          ['Laporkan bug','Temukan tampilan rusak atau fitur bermasalah? Klik logo di atas untuk menghubungi kami.'],
        ].map(([t,d])=>`
          <div class="support-card">
            <h3>${t}</h3>
            <p>${d}</p>
          </div>
        `).join('')}
      </div>

      <div class="support-faq-title">Pertanyaan Umum</div>
      ${[
        ['Bagaimana cara upgrade Premium?','Klik tombol Premium di navbar, pilih paket, lalu pilih metode pembayaran.'],
        ['Kenapa video tidak bisa diputar?','Coba ganti server. Tersedia 4 server berbeda di bawah player.'],
        ['Apakah ada aplikasi Android?','Saat ini tersedia via browser. Tampilan sudah dioptimalkan untuk mobile.'],
        ['Kenapa komentar saya dihapus?','Komentar yang melanggar aturan komunitas dihapus oleh admin.'],
        ['Data saya aman?','Kicen Xensai menggunakan Firebase Authentication dari Google.'],
      ].map(([q,a])=>`
        <div class="faq-item">
          <button class="faq-q">
            <span>${q}</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>
          </button>
          <div class="faq-a">${a}</div>
        </div>
      `).join('')}

      <div class="support-contact">
        <h3>Kirim Laporan</h3>
        <p>Tidak menemukan jawaban? Tim kami merespons dalam 1x24 jam.</p>
        <textarea id="supp-msg" rows="4" placeholder="Ceritakan masalah atau pertanyaan kamu..."></textarea>
        <div style="display:flex;align-items:center;gap:1rem;margin-top:.75rem">
          <button class="btn-supp-send" id="supp-send">Kirim</button>
          <span id="supp-status" style="font-size:.8rem;color:var(--t2)"></span>
        </div>
      </div>
    </div>
  `);

  // Logo click reveals contact info
  document.getElementById('supp-logo-reveal')?.addEventListener('click', () => {
    const el = document.getElementById('supp-contact-reveal');
    if (el) {
      el.style.display = el.style.display === 'none' ? 'block' : 'none';
      if (el.style.display === 'block') {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  });

  document.querySelectorAll('.faq-q').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const item=btn.closest('.faq-item'); const was=item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach(i=>i.classList.remove('open'));
      if(!was)item.classList.add('open');
    });
  });
  document.getElementById('supp-send')?.addEventListener('click',()=>{
    const msg=document.getElementById('supp-msg')?.value.trim();
    const st=document.getElementById('supp-status');
    if(!msg){if(st)st.textContent='Tulis pesannya dulu.';return;}
    if(st)st.textContent='Laporan terkirim. Terima kasih!';
    if(document.getElementById('supp-msg'))document.getElementById('supp-msg').value='';
    setTimeout(()=>{if(st)st.textContent='';},4000);
  });
};
