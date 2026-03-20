Pages.search = async function ({ q = '' }) {
  App.setPage('search');
  App.render(`
    <div class="search-page">
      <h1 class="search-page-title">Pencarian</h1>
      <div class="search-box">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        <input type="text" id="searchPageInput" placeholder="Cari anime, drakor, donghua..." value="${q}" autocomplete="off" />
      </div>
      <div id="search-results">
        ${q ? Components.cardSkeleton(8) : '<p class="search-hint">Ketik sesuatu untuk mulai mencari.</p>'}
      </div>
    </div>
  `);

  const input = document.getElementById('searchPageInput');
  input.focus();

  if (q) await doSearch(q);

  let debounce;
  input.addEventListener('input', () => {
    clearTimeout(debounce);
    const val = input.value.trim();
    if (!val) {
      document.getElementById('search-results').innerHTML = '<p class="search-hint">Ketik sesuatu untuk mulai mencari.</p>';
      return;
    }
    document.getElementById('search-results').innerHTML = Components.cardSkeleton(8);
    debounce = setTimeout(() => doSearch(val), 500);
  });
};

async function doSearch(query) {
  try {
    const [tmdb, anime] = await Promise.allSettled([
      API.searchTMDB(query),
      API.searchAnime(query),
    ]);

    const results = [
      ...(anime.status === 'fulfilled' ? anime.value : []),
      ...(tmdb.status === 'fulfilled' ? tmdb.value : []),
    ];

    const el = document.getElementById('search-results');
    if (!el) return;

    if (!results.length) {
      el.innerHTML = `<p class="search-hint">Tidak ada hasil untuk "<strong>${query}</strong>".</p>`;
      return;
    }

    el.innerHTML = `
      <p class="search-count">${results.length} hasil untuk "<strong>${query}</strong>"</p>
      <div class="cards-grid">${results.map(Components.card).join('')}</div>
    `;
  } catch (_) {
    const el = document.getElementById('search-results');
    if (el) el.innerHTML = '<p class="error-msg">Pencarian gagal. Coba lagi.</p>';
  }
}
