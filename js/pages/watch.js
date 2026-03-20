Pages.watch = async function ({ id, type = 'tv', cat = 'anime', ep = '1' }) {
  if (!id) { Router.navigate('/'); return; }

  App.setPage('watch');
  App.render(`<div class="watch-loading" style="min-height:80vh;display:flex;align-items:center;justify-content:center"><div class="spinner"></div></div>`);

  try {
    let data;
    if (cat === 'anime') {
      data = await API.getAnimeDetail(id);
    } else {
      data = await API.getTMDBDetail(id, type);
      data.category = cat;
    }

    const epNum = parseInt(ep) || 1;
    const totalEp = data.episodes || 1;

    // Build episode list
    const episodes = Array.from({ length: totalEp > 500 ? 500 : totalEp }, (_, i) => i + 1);

    // Video source — use YouTube trailer or fallback embed
    const videoSrc = data.trailer
      ? `https://www.youtube.com/embed/${data.trailer}?autoplay=0&rel=0&modestbranding=1`
      : null;

    App.render(`
      <div class="watch-page">
        <!-- Player area -->
        <div class="watch-main">
          <div class="watch-player-wrap">
            ${videoSrc
              ? `<iframe class="watch-iframe" src="${videoSrc}" frameborder="0" allowfullscreen allow="autoplay; fullscreen; picture-in-picture" title="${data.title} - Episode ${epNum}"></iframe>`
              : `<div class="watch-no-video">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"/></svg>
                  <p>Video tidak tersedia untuk konten ini</p>
                  <span>Konten ini tidak memiliki video yang bisa diputar</span>
                </div>`
            }
          </div>

          <!-- Info bar -->
          <div class="watch-info-bar">
            <div class="watch-info-left">
              <span class="watch-cat-badge" style="background:var(--cat-${cat})">${cat.toUpperCase()}</span>
              <div>
                <h1 class="watch-title">${data.title}</h1>
                <div class="watch-meta">
                  ${data.rating ? `<span class="watch-rating">${data.rating}</span>` : ''}
                  ${data.year ? `<span>${data.year}</span>` : ''}
                  ${totalEp > 1 ? `<span>Episode ${epNum} dari ${totalEp}</span>` : ''}
                </div>
              </div>
            </div>
            <div class="watch-info-right">
              <button class="watch-action-btn" id="watchlistBtn" title="Tambah ke Watchlist">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>
                Watchlist
              </button>
              <a class="watch-action-btn" data-link="/detail?id=${id}&type=${type}&cat=${cat}">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
                Detail
              </a>
            </div>
          </div>

          <!-- Episode navigation -->
          ${totalEp > 1 ? `
            <div class="watch-ep-nav">
              ${epNum > 1 ? `<a class="ep-nav-btn" data-link="/watch?id=${id}&type=${type}&cat=${cat}&ep=${epNum - 1}">← Episode ${epNum - 1}</a>` : '<span></span>'}
              ${epNum < totalEp ? `<a class="ep-nav-btn primary" data-link="/watch?id=${id}&type=${type}&cat=${cat}&ep=${epNum + 1}">Episode ${epNum + 1} →</a>` : '<span></span>'}
            </div>
          ` : ''}
        </div>

        <!-- Sidebar -->
        <div class="watch-sidebar">
          <!-- Episode list -->
          ${totalEp > 1 ? `
            <div class="watch-sidebar-block">
              <h3 class="sidebar-title">${totalEp} Episode</h3>
              <div class="ep-list" id="epList">
                ${episodes.map(n => `
                  <a class="ep-item ${n === epNum ? 'active' : ''}" data-link="/watch?id=${id}&type=${type}&cat=${cat}&ep=${n}">
                    <div class="ep-thumb">
                      ${data.poster ? `<img src="${data.poster}" alt="ep ${n}" loading="lazy" />` : '<div class="ep-thumb-ph"></div>'}
                      <div class="ep-thumb-overlay">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                      </div>
                    </div>
                    <div class="ep-info">
                      <span class="ep-num">Episode ${n}</span>
                    </div>
                    ${n === epNum ? '<span class="ep-playing">Diputar</span>' : ''}
                  </a>
                `).join('')}
              </div>
            </div>
          ` : ''}

          <!-- Description -->
          <div class="watch-sidebar-block">
            <h3 class="sidebar-title">Sinopsis</h3>
            <p class="watch-overview">${data.overview || 'Tidak ada sinopsis.'}</p>
          </div>
        </div>
      </div>

      <!-- Comments section -->
      <div class="comments-section">
        <div class="comments-inner">
          <h2 class="comments-title">Komentar</h2>

          <!-- Add comment -->
          <div class="comment-add" id="commentAddWrap">
            ${window.Auth?.current
              ? `
                <div class="comment-input-row">
                  <div class="comment-avatar">${getAvatar(window.Auth.current)}</div>
                  <div class="comment-input-wrap">
                    <textarea id="commentInput" placeholder="Tulis komentar..." rows="2"></textarea>
                    <div class="comment-input-actions">
                      <span class="comment-char" id="commentChar">0/300</span>
                      <button class="btn-submit-comment" id="submitComment">Kirim</button>
                    </div>
                  </div>
                </div>
              `
              : `<div class="comment-login-prompt">
                  <p>Masuk untuk berkomentar</p>
                  <a class="btn-watch" data-link="/auth?mode=login">Masuk</a>
                </div>`
            }
          </div>

          <!-- Comments list -->
          <div id="comments-list"><div class="comments-loading">Memuat komentar...</div></div>
        </div>
      </div>
    `);

    // Watchlist button
    const wBtn = document.getElementById('watchlistBtn');
    if (wBtn && window.Auth?.current && window.DB) {
      const inWL = await window.DB.isInWatchlist(id, cat);
      updateWatchlistBtn(wBtn, inWL);
      wBtn.addEventListener('click', async () => {
        try {
          const added = await window.DB.toggleWatchlist({ id, type, category: cat, title: data.title, poster: data.poster, rating: data.rating, year: data.year });
          updateWatchlistBtn(wBtn, added);
        } catch (e) {
          if (e.message === 'Harus login dulu') Router.navigate('/auth?mode=login');
        }
      });
    }

    // Comments
    if (window.DB) {
      const contentId = `${cat}_${id}`;
      let unsubscribe = window.DB.listenComments(contentId, (comments) => {
        renderComments(comments, contentId);
      });

      // Submit comment
      const textarea = document.getElementById('commentInput');
      const charCount = document.getElementById('commentChar');
      textarea?.addEventListener('input', () => {
        const len = textarea.value.length;
        charCount.textContent = `${len}/300`;
        if (len > 300) textarea.value = textarea.value.slice(0, 300);
      });

      document.getElementById('submitComment')?.addEventListener('click', async () => {
        const text = textarea?.value.trim();
        if (!text) return;
        try {
          await window.DB.addComment(contentId, text);
          textarea.value = '';
          charCount.textContent = '0/300';
        } catch (e) {
          alert(e.message);
        }
      });
    }

    // Scroll active episode into view
    setTimeout(() => {
      document.querySelector('.ep-item.active')?.scrollIntoView({ block: 'nearest' });
    }, 100);

  } catch (err) {
    App.render(`<div class="error-page"><h2>Gagal memuat konten.</h2><a data-link="/" class="btn-watch">Kembali</a></div>`);
  }
};

function updateWatchlistBtn(btn, inList) {
  btn.innerHTML = inList
    ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg> Tersimpan`
    : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg> Watchlist`;
  btn.style.color = inList ? 'var(--teal)' : '';
}

function renderComments(comments, contentId) {
  const list = document.getElementById('comments-list');
  if (!list) return;

  if (!comments.length) {
    list.innerHTML = '<p class="no-comments">Belum ada komentar. Jadilah yang pertama!</p>';
    return;
  }

  list.innerHTML = `
    <div class="comments-count">${comments.length} Komentar</div>
    ${comments.map(c => `
      <div class="comment-item" id="comment-${c.id}">
        <div class="comment-avatar">${getAvatarFromData(c)}</div>
        <div class="comment-body">
          <div class="comment-head">
            <span class="comment-name">${c.name}</span>
            <span class="comment-time">${formatTime(c.createdAt)}</span>
            ${(window.Auth?.current?.uid === c.uid || window.Auth?.isAdmin?.()) ? `
              <button class="comment-delete" data-id="${c.id}">Hapus</button>
            ` : ''}
          </div>
          <p class="comment-text">${escapeHtml(c.text)}</p>
          <div class="comment-actions">
            <button class="comment-react like-btn" data-id="${c.id}" data-type="like">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14z"/><path d="M7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3"/></svg>
              ${c.likes || 0}
            </button>
            <button class="comment-react dislike-btn" data-id="${c.id}" data-type="dislike">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 15v4a3 3 0 003 3l4-9V2H5.72a2 2 0 00-2 1.7l-1.38 9a2 2 0 002 2.3H10z"/><path d="M17 2h2.67A2.31 2.31 0 0122 4v7a2.31 2.31 0 01-2.33 2H17"/></svg>
              ${c.dislikes || 0}
            </button>
            ${window.Auth?.current ? `<button class="comment-reply-btn" data-id="${c.id}">Balas</button>` : ''}
          </div>

          <!-- Reply input -->
          <div class="reply-input-wrap" id="reply-wrap-${c.id}" style="display:none">
            <textarea class="reply-textarea" id="reply-input-${c.id}" placeholder="Tulis balasan..." rows="2"></textarea>
            <button class="btn-reply-submit" data-id="${c.id}">Kirim Balasan</button>
          </div>

          <!-- Replies -->
          ${c.replies?.length ? `
            <div class="replies-list">
              ${c.replies.map(r => `
                <div class="reply-item">
                  <div class="comment-avatar small">${getAvatarFromData(r)}</div>
                  <div class="reply-body">
                    <div class="comment-head">
                      <span class="comment-name">${r.name}</span>
                      <span class="comment-time">${formatTime(r.createdAt)}</span>
                    </div>
                    <p class="comment-text">${escapeHtml(r.text)}</p>
                  </div>
                </div>
              `).join('')}
            </div>
          ` : ''}
        </div>
      </div>
    `).join('')}
  `;

  // Bind events
  list.querySelectorAll('.comment-react').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!window.Auth?.current) { Router.navigate('/auth?mode=login'); return; }
      try { await window.DB.reactComment(btn.dataset.id, btn.dataset.type); }
      catch (e) { console.error(e); }
    });
  });

  list.querySelectorAll('.comment-delete').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('Hapus komentar ini?')) return;
      await window.DB.deleteComment(btn.dataset.id);
    });
  });

  list.querySelectorAll('.comment-reply-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const wrap = document.getElementById(`reply-wrap-${btn.dataset.id}`);
      if (wrap) { wrap.style.display = wrap.style.display === 'none' ? 'block' : 'none'; }
    });
  });

  list.querySelectorAll('.btn-reply-submit').forEach(btn => {
    btn.addEventListener('click', async () => {
      const text = document.getElementById(`reply-input-${btn.dataset.id}`)?.value.trim();
      if (!text) return;
      try {
        await window.DB.addReply(btn.dataset.id, text);
        document.getElementById(`reply-wrap-${btn.dataset.id}`).style.display = 'none';
      } catch (e) { alert(e.message); }
    });
  });
}

function getAvatar(user) {
  if (user.photoURL || user.photo) {
    return `<img src="${user.photoURL || user.photo}" alt="${user.displayName || user.name}" />`;
  }
  return `<span>${(user.displayName || user.name || 'U').charAt(0).toUpperCase()}</span>`;
}

function getAvatarFromData(c) {
  if (c.photo) return `<img src="${c.photo}" alt="${c.name}" />`;
  return `<span>${(c.name || 'U').charAt(0).toUpperCase()}</span>`;
}

function formatTime(ts) {
  if (!ts) return '';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return 'Baru saja';
  if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
  return `${Math.floor(diff / 86400)} hari lalu`;
}

function escapeHtml(text) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
