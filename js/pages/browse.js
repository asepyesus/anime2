Pages.browse = async function ({ cat = 'anime', page = '1' }) {
  const currentPage = parseInt(page) || 1;
  const catInfo = CONFIG.CATEGORIES[cat] || CONFIG.CATEGORIES.anime;

  App.setPage('browse');
  App.render(`
    <div class="browse-header">
      <h1 class="browse-title">${catInfo.label}</h1>
      <div class="cat-tabs">
        ${Object.entries(CONFIG.CATEGORIES).map(([key, val]) => `
          <a class="cat-tab ${cat === key ? 'active' : ''}" data-link="/browse?cat=${key}">${val.label}</a>
        `).join('')}
      </div>
    </div>
    <div class="cards-grid" id="browse-grid">${Components.cardSkeleton(20)}</div>
    <div id="pagination-wrap"></div>
  `);

  try {
    let result;
    if (cat === 'anime') result = await API.getAnime(currentPage);
    else if (cat === 'drakor') result = await API.getDrakor(currentPage);
    else if (cat === 'dracin') result = await API.getDracin(currentPage);
    else if (cat === 'donghua') result = await API.getDonghua(currentPage);

    document.getElementById('browse-grid').innerHTML = result.results.map(Components.card).join('') || '<p class="empty">Tidak ada konten.</p>';

    const pgWrap = document.getElementById('pagination-wrap');
    pgWrap.innerHTML = Components.pagination(currentPage, result.total_pages);
    pgWrap.querySelectorAll('[data-page]').forEach(btn => {
      btn.addEventListener('click', () => {
        Router.navigate(`/browse?cat=${cat}&page=${btn.dataset.page}`);
      });
    });
  } catch (err) {
    document.getElementById('browse-grid').innerHTML = `<p class="error-msg">Gagal memuat konten. Coba lagi.</p>`;
  }
};
