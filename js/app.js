const App = {
  setLoading(state) {
    document.getElementById('global-loader')?.classList.toggle('show', state);
  },

  setPage(name) {
    document.body.dataset.page = name;
    const nav = document.getElementById('app-nav');
    if (nav) nav.innerHTML = Components.navbar(location.pathname + location.search);
    this.bindNav();
  },

  render(html) {
    document.getElementById('app-content').innerHTML = html;
  },

  bindNav() {
    document.getElementById('navBurger')?.addEventListener('click', () => {
      document.getElementById('navMobile')?.classList.toggle('open');
    });

    document.getElementById('searchToggle')?.addEventListener('click', () => {
      document.getElementById('searchBar')?.classList.add('open');
      document.getElementById('searchInput')?.focus();
    });

    document.getElementById('searchClose')?.addEventListener('click', () => {
      document.getElementById('searchBar')?.classList.remove('open');
    });

    document.getElementById('searchInput')?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const val = e.target.value.trim();
        if (val) {
          document.getElementById('searchBar')?.classList.remove('open');
          Router.navigate(`/search?q=${encodeURIComponent(val)}`);
        }
      }
    });

    let lastY = 0;
    const onScroll = () => {
      const navbar = document.getElementById('navbar');
      if (!navbar) return;
      const y = window.scrollY;
      navbar.classList.toggle('scrolled', y > 60);
      navbar.classList.toggle('hidden', y > lastY + 5 && y > 200);
      navbar.classList.toggle('visible', y < lastY - 5);
      lastY = y;
    };
    window.removeEventListener('scroll', window._navScroll);
    window._navScroll = onScroll;
    window.addEventListener('scroll', onScroll, { passive: true });
  },
};

window.App = App;
