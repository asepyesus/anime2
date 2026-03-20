Pages.detail = async function ({ id, type = 'tv', cat = 'anime' }) {
  if (!id) { Router.navigate('/'); return; }

  App.setPage('detail');
  App.render(`<div class="detail-loading">${Components.cardSkeleton(1)}</div>`);

  try {
    let data;
    if (cat === 'anime') {
      data = await API.getAnimeDetail(id);
    } else {
      data = await API.getTMDBDetail(id, type);
      data.category = cat;
    }

    App.render(`
      <div class="detail-hero" style="--bg: url('${data.backdrop || data.poster || ''}')">
        <div class="detail-hero-overlay"></div>
        <div class="detail-hero-content">
          <div class="detail-poster">
            ${data.poster ? `<img src="${data.poster}" alt="${data.title}" />` : `<div class="poster-placeholder">${data.title?.charAt(0)}</div>`}
          </div>
          <div class="detail-info">
            <span class="detail-cat-badge" style="background: var(--cat-${cat})">${cat.toUpperCase()}</span>
            <h1 class="detail-title">${data.title}</h1>
            <div class="detail-meta">
              ${data.rating ? `<span class="detail-rating">${data.rating} / 10</span>` : ''}
              ${data.year ? `<span>${data.year}</span>` : ''}
              ${data.episodes ? `<span>${data.episodes} Episode</span>` : ''}
              ${data.seasons ? `<span>${data.seasons} Season</span>` : ''}
              ${data.status ? `<span>${data.status}</span>` : ''}
            </div>
            <div class="detail-genres">
              ${data.genres?.map(g => `<span class="genre-tag">${g}</span>`).join('') || ''}
            </div>
            <p class="detail-overview">${data.overview}</p>
            <div class="detail-actions">
              <a class="btn-watch" data-link="/watch?id=${id}&type=${type}&cat=${cat}&ep=1">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                Tonton Sekarang
              </a>
              ${data.trailer ? `
                <button class="btn-detail" id="trailerBtn">Lihat Trailer</button>
              ` : ''}
              ${data.studios ? `<span class="detail-studio">${data.studios}</span>` : ''}
            </div>
          </div>
        </div>
      </div>

      ${data.cast?.length ? `
        <section class="section">
          <h2 class="section-title">Pemeran</h2>
          <div class="cast-row">
            ${data.cast.map(c => `
              <div class="cast-card">
                ${c.photo ? `<img src="${c.photo}" alt="${c.name}" />` : `<div class="cast-placeholder">${c.name?.charAt(0)}</div>`}
                <div class="cast-name">${c.name}</div>
                <div class="cast-char">${c.character}</div>
              </div>
            `).join('')}
          </div>
        </section>
      ` : ''}

      ${data.trailer ? `
        <div class="trailer-modal" id="trailerModal">
          <div class="trailer-box">
            <button class="trailer-close" id="trailerClose">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </button>
            <iframe
              src="https://www.youtube.com/embed/${data.trailer}?autoplay=1"
              frameborder="0"
              allow="autoplay; fullscreen"
              allowfullscreen
            ></iframe>
          </div>
        </div>
      ` : ''}
    `);

    // Trailer modal
    const trailerBtn = document.getElementById('trailerBtn');
    const trailerModal = document.getElementById('trailerModal');
    const trailerClose = document.getElementById('trailerClose');

    if (trailerBtn && trailerModal) {
      trailerBtn.addEventListener('click', () => trailerModal.classList.add('open'));
      trailerClose.addEventListener('click', () => trailerModal.classList.remove('open'));
      trailerModal.addEventListener('click', (e) => {
        if (e.target === trailerModal) trailerModal.classList.remove('open');
      });
    }

  } catch (err) {
    App.render(`<div class="error-page"><h2>Gagal memuat detail.</h2><a data-link="/" class="btn-watch">Kembali</a></div>`);
  }
};
