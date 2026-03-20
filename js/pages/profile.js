Pages.profile = async function () {
  if (!window.Auth?.current) {
    sessionStorage.setItem('authRedirect', '/profile');
    Router.navigate('/auth?mode=login');
    return;
  }

  App.setPage('profile');
  const user = window.Auth.current;

  App.render(`
    <div class="profile-page">
      <div class="profile-header">
        <div class="profile-avatar">
          ${user.photoURL || user.photo
            ? `<img src="${user.photoURL || user.photo}" alt="${user.displayName || user.name}" />`
            : `<span>${(user.displayName || user.name || 'U').charAt(0).toUpperCase()}</span>`
          }
        </div>
        <div class="profile-info">
          <h1 class="profile-name">${user.displayName || user.name || 'User'}</h1>
          <p class="profile-email">${user.email}</p>
          <div class="profile-badges">
            <span class="role-badge ${user.role || 'user'}">${user.role || 'user'}</span>
            ${user.banned ? '<span class="status-badge banned">Dibanned</span>' : ''}
          </div>
        </div>
        <div class="profile-actions">
          ${window.Auth.isAdmin() ? '<a class="btn-watch" data-link="/admin">Admin Panel</a>' : ''}
          <button class="btn-detail" id="logoutBtn">Keluar</button>
        </div>
      </div>

      <div class="profile-tabs">
        <button class="profile-tab active" data-tab="watchlist">Watchlist</button>
      </div>

      <div id="profile-content">
        <div class="admin-loading">Memuat watchlist...</div>
      </div>
    </div>
  `);

  document.getElementById('logoutBtn')?.addEventListener('click', async () => {
    await window.Auth.logout();
    Router.navigate('/');
  });

  // Load watchlist
  try {
    const watchlist = await window.DB.getWatchlist();
    const content = document.getElementById('profile-content');
    if (!content) return;

    if (!watchlist.length) {
      content.innerHTML = `<p class="empty" style="padding:3rem">Belum ada yang disimpan ke watchlist.</p>`;
      return;
    }

    content.innerHTML = `<div class="cards-grid" style="padding:0 3rem 3rem">${watchlist.map(Components.card).join('')}</div>`;
  } catch (e) {
    document.getElementById('profile-content').innerHTML = `<p class="error-msg">Gagal memuat watchlist.</p>`;
  }
};
