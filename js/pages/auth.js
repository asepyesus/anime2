Pages.auth = async function ({ mode = 'login' }) {
  App.setPage('auth');
  App.render(`
    <div class="auth-page">
      <div class="auth-card">
        <a class="auth-logo" data-link="/">KICEN<span>XENSAI</span></a>
        <div class="auth-tabs">
          <button class="auth-tab ${mode === 'login' ? 'active' : ''}" data-mode="login">Masuk</button>
          <button class="auth-tab ${mode === 'register' ? 'active' : ''}" data-mode="register">Daftar</button>
        </div>

        <div id="auth-form-wrap">
          ${mode === 'login' ? renderLogin() : renderRegister()}
        </div>
      </div>
    </div>
  `);

  bindAuthTabs();
};

function renderLogin() {
  return `
    <button class="btn-google" id="btnGoogle">
      <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
      Masuk dengan Google
    </button>
    <div class="auth-divider"><span>atau</span></div>
    <div class="auth-field">
      <label>Email</label>
      <input type="email" id="authEmail" placeholder="email@kamu.com" />
    </div>
    <div class="auth-field">
      <label>Password</label>
      <input type="password" id="authPassword" placeholder="••••••••" />
    </div>
    <div id="auth-error" class="auth-error"></div>
    <button class="btn-auth-submit" id="btnEmailLogin">Masuk</button>
    <p class="auth-switch">Belum punya akun? <a data-link="/auth?mode=register">Daftar sekarang</a></p>
  `;
}

function renderRegister() {
  return `
    <button class="btn-google" id="btnGoogle">
      <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
      Daftar dengan Google
    </button>
    <div class="auth-divider"><span>atau</span></div>
    <div class="auth-field">
      <label>Nama</label>
      <input type="text" id="authName" placeholder="Nama kamu" />
    </div>
    <div class="auth-field">
      <label>Email</label>
      <input type="email" id="authEmail" placeholder="email@kamu.com" />
    </div>
    <div class="auth-field">
      <label>Password</label>
      <input type="password" id="authPassword" placeholder="Min. 6 karakter" />
    </div>
    <div id="auth-error" class="auth-error"></div>
    <button class="btn-auth-submit" id="btnEmailRegister">Buat Akun</button>
    <p class="auth-switch">Sudah punya akun? <a data-link="/auth?mode=login">Masuk</a></p>
  `;
}

function bindAuthTabs() {
  document.querySelectorAll('.auth-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      Router.navigate(`/auth?mode=${tab.dataset.mode}`);
    });
  });

  // Google login
  document.getElementById('btnGoogle')?.addEventListener('click', async () => {
    try {
      await window.Auth.loginGoogle();
      Router.navigate(sessionStorage.getItem('authRedirect') || '/');
      sessionStorage.removeItem('authRedirect');
    } catch (e) {
      showAuthError(e.message);
    }
  });

  // Email login
  document.getElementById('btnEmailLogin')?.addEventListener('click', async () => {
    const email = document.getElementById('authEmail').value.trim();
    const pass = document.getElementById('authPassword').value;
    if (!email || !pass) return showAuthError('Isi semua kolom ya.');
    try {
      setAuthLoading(true);
      await window.Auth.loginEmail(email, pass);
      Router.navigate(sessionStorage.getItem('authRedirect') || '/');
      sessionStorage.removeItem('authRedirect');
    } catch (e) {
      showAuthError(getFriendlyError(e.code));
    } finally { setAuthLoading(false); }
  });

  // Email register
  document.getElementById('btnEmailRegister')?.addEventListener('click', async () => {
    const name = document.getElementById('authName')?.value.trim();
    const email = document.getElementById('authEmail').value.trim();
    const pass = document.getElementById('authPassword').value;
    if (!name || !email || !pass) return showAuthError('Isi semua kolom ya.');
    if (pass.length < 6) return showAuthError('Password minimal 6 karakter.');
    try {
      setAuthLoading(true);
      await window.Auth.registerEmail(email, pass, name);
      Router.navigate('/');
    } catch (e) {
      showAuthError(getFriendlyError(e.code));
    } finally { setAuthLoading(false); }
  });
}

function showAuthError(msg) {
  const el = document.getElementById('auth-error');
  if (el) el.textContent = msg;
}

function setAuthLoading(state) {
  const btns = document.querySelectorAll('.btn-auth-submit, .btn-google');
  btns.forEach(b => { b.disabled = state; b.style.opacity = state ? '0.6' : '1'; });
}

function getFriendlyError(code) {
  const map = {
    'auth/user-not-found': 'Email tidak terdaftar.',
    'auth/wrong-password': 'Password salah.',
    'auth/email-already-in-use': 'Email sudah dipakai.',
    'auth/invalid-email': 'Format email tidak valid.',
    'auth/too-many-requests': 'Terlalu banyak percobaan. Coba lagi nanti.',
    'auth/popup-closed-by-user': 'Login dibatalkan.',
  };
  return map[code] || 'Terjadi kesalahan. Coba lagi.';
}
