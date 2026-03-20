Pages.admin = async function ({ tab = 'dashboard' }) {
  if (!window.Auth?.current) {
    sessionStorage.setItem('authRedirect', '/admin');
    Router.navigate('/auth?mode=login');
    return;
  }
  if (!window.Auth.isAdmin()) {
    App.render(`<div class="error-page"><h2>Akses ditolak.</h2><p style="color:var(--text-3);font-size:.9rem">Halaman ini hanya untuk admin.</p><a data-link="/" class="btn-watch">Kembali</a></div>`);
    return;
  }

  App.setPage('admin');
  App.render(`
    <div class="admin-page">
      <div class="admin-sidebar">
        <div class="admin-brand">Admin Panel</div>
        <nav class="admin-nav">
          <a class="admin-nav-item ${tab === 'dashboard' ? 'active' : ''}" data-link="/admin?tab=dashboard">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
            Dashboard
          </a>
          <a class="admin-nav-item ${tab === 'users' ? 'active' : ''}" data-link="/admin?tab=users">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
            Manajemen User
          </a>
          <a class="admin-nav-item ${tab === 'comments' ? 'active' : ''}" data-link="/admin?tab=comments">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
            Komentar
          </a>
        </nav>
        <a class="admin-back" data-link="/">← Kembali ke Situs</a>
      </div>

      <div class="admin-content" id="adminContent">
        <div class="admin-loading">Memuat...</div>
      </div>
    </div>
  `);

  loadAdminTab(tab);
};

async function loadAdminTab(tab) {
  const content = document.getElementById('adminContent');
  if (!content) return;

  if (tab === 'dashboard') {
    try {
      const stats = await window.DB.getStats();
      content.innerHTML = `
        <div class="admin-header"><h1>Dashboard</h1></div>
        <div class="admin-stats">
          <div class="admin-stat-card">
            <div class="stat-icon" style="background:rgba(230,62,109,0.15);color:var(--red)">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
            </div>
            <div>
              <div class="stat-val">${stats.users}</div>
              <div class="stat-lbl">Total User</div>
            </div>
          </div>
          <div class="admin-stat-card">
            <div class="stat-icon" style="background:rgba(0,201,167,0.15);color:var(--teal)">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
            </div>
            <div>
              <div class="stat-val">${stats.comments}</div>
              <div class="stat-lbl">Total Komentar</div>
            </div>
          </div>
          <div class="admin-stat-card">
            <div class="stat-icon" style="background:rgba(123,47,255,0.15);color:var(--purple)">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01"/></svg>
            </div>
            <div>
              <div class="stat-val">${window.Auth.current.name || window.Auth.current.displayName}</div>
              <div class="stat-lbl">Admin Aktif</div>
            </div>
          </div>
        </div>
        <div class="admin-quick">
          <h2>Aksi Cepat</h2>
          <div class="quick-actions">
            <a class="quick-btn" data-link="/admin?tab=users">Kelola User</a>
            <a class="quick-btn" data-link="/admin?tab=comments">Moderasi Komentar</a>
          </div>
        </div>
      `;
    } catch (e) {
      content.innerHTML = `<p class="error-msg">Gagal memuat statistik.</p>`;
    }
  }

  else if (tab === 'users') {
    content.innerHTML = `<div class="admin-header"><h1>Manajemen User</h1></div><div class="admin-loading">Memuat user...</div>`;
    try {
      const users = await window.DB.getAllUsers();
      const tableRows = users.map(u => `
        <tr class="${u.banned ? 'row-banned' : ''}">
          <td>
            <div class="user-cell">
              ${u.photo ? `<img src="${u.photo}" class="user-mini-avatar" alt="${u.name}" />` : `<div class="user-mini-avatar placeholder">${(u.name || 'U').charAt(0)}</div>`}
              <div>
                <div class="user-cell-name">${u.name || '-'}</div>
                <div class="user-cell-email">${u.email || '-'}</div>
              </div>
            </div>
          </td>
          <td><span class="role-badge ${u.role}">${u.role || 'user'}</span></td>
          <td><span class="status-badge ${u.banned ? 'banned' : 'active'}">${u.banned ? 'Dibanned' : 'Aktif'}</span></td>
          <td>
            <div class="admin-actions">
              <button class="admin-btn ${u.banned ? 'unban' : 'ban'}" data-uid="${u.id}" data-banned="${u.banned ? 'true' : 'false'}">
                ${u.banned ? 'Unban' : 'Ban'}
              </button>
              ${u.role !== 'admin' ? `<button class="admin-btn promote" data-uid="${u.id}">Jadikan Admin</button>` : ''}
              <button class="admin-btn delete-comments" data-uid="${u.id}">Hapus Komen</button>
            </div>
          </td>
        </tr>
      `).join('');

      document.getElementById('adminContent').innerHTML = `
        <div class="admin-header">
          <h1>Manajemen User</h1>
          <span class="admin-count">${users.length} user</span>
        </div>
        <div class="admin-table-wrap">
          <table class="admin-table">
            <thead><tr><th>User</th><th>Role</th><th>Status</th><th>Aksi</th></tr></thead>
            <tbody>${tableRows}</tbody>
          </table>
        </div>
      `;

      // Bind actions
      document.querySelectorAll('.admin-btn.ban, .admin-btn.unban').forEach(btn => {
        btn.addEventListener('click', async () => {
          const banned = btn.dataset.banned === 'false';
          if (!confirm(`${banned ? 'Ban' : 'Unban'} user ini?`)) return;
          await window.DB.banUser(btn.dataset.uid, banned);
          loadAdminTab('users');
        });
      });

      document.querySelectorAll('.admin-btn.promote').forEach(btn => {
        btn.addEventListener('click', async () => {
          if (!confirm('Jadikan user ini admin?')) return;
          await window.DB.setRole(btn.dataset.uid, 'admin');
          loadAdminTab('users');
        });
      });

      document.querySelectorAll('.admin-btn.delete-comments').forEach(btn => {
        btn.addEventListener('click', async () => {
          if (!confirm('Hapus semua komentar user ini?')) return;
          await window.DB.deleteUserComments(btn.dataset.uid);
          alert('Komentar berhasil dihapus.');
        });
      });

    } catch (e) {
      document.getElementById('adminContent').innerHTML = `<p class="error-msg">Gagal memuat user: ${e.message}</p>`;
    }
  }

  else if (tab === 'comments') {
    content.innerHTML = `<div class="admin-header"><h1>Moderasi Komentar</h1></div><div class="admin-loading">Memuat komentar...</div>`;
    try {
      const { getDocs, collection, orderBy, query, limit } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
      // Use DB helper via window
      // Show recent 50 comments
      const snap = await window._db_getDocs_comments();
      const comments = snap;

      document.getElementById('adminContent').innerHTML = `
        <div class="admin-header">
          <h1>Moderasi Komentar</h1>
          <span class="admin-count">${comments.length} komentar</span>
        </div>
        <div class="admin-comments-list">
          ${comments.length === 0 ? '<p class="empty">Belum ada komentar.</p>' : comments.map(c => `
            <div class="admin-comment-item" id="ac-${c.id}">
              <div class="ac-head">
                <strong>${c.name}</strong>
                <span class="comment-time">${formatAdminTime(c.createdAt)}</span>
                <span class="ac-content-id">${c.contentId}</span>
              </div>
              <p class="ac-text">${c.text}</p>
              <button class="admin-btn ban" data-id="${c.id}">Hapus</button>
            </div>
          `).join('')}
        </div>
      `;

      document.querySelectorAll('.admin-comment-item .admin-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
          if (!confirm('Hapus komentar ini?')) return;
          await window.DB.deleteComment(btn.dataset.id);
          document.getElementById(`ac-${btn.dataset.id}`)?.remove();
        });
      });

    } catch (e) {
      document.getElementById('adminContent').innerHTML = `<p class="error-msg">Gagal: ${e.message}</p>`;
    }
  }
}

function formatAdminTime(ts) {
  if (!ts) return '';
  try {
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch { return ''; }
}
