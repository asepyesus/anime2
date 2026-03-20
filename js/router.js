const Router = {
  routes: {},
  current: null,

  register(path, handler) {
    this.routes[path] = handler;
  },

  async navigate(path, push = true) {
    if (push && this.current !== path) {
      history.pushState({}, '', path);
    }
    this.current = path;

    const [base, query] = path.split('?');
    const params = Object.fromEntries(new URLSearchParams(query || ''));

    const handler = this.routes[base] || this.routes['/404'];
    if (handler) {
      App.setLoading(true);
      try {
        await handler(params);
      } finally {
        App.setLoading(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  },

  init() {
    window.addEventListener('popstate', () => {
      this.navigate(location.pathname + location.search, false);
    });

    document.addEventListener('click', (e) => {
      const link = e.target.closest('[data-link]');
      if (link) {
        e.preventDefault();
        this.navigate(link.dataset.link);
      }
    });

    this.navigate(location.pathname + location.search, false);
  },
};
