const Router = {
  _routes: {},
  _cur: null,

  on(path, fn) { this._routes[path] = fn; },

  async go(path, push=true) {
    const [base, qs] = path.split('?');
    const params = Object.fromEntries(new URLSearchParams(qs||''));
    if (push && this._cur !== path) history.pushState({}, '', path);
    this._cur = path;
    const fn = this._routes[base] || this._routes['/404'];
    if (!fn) return;
    UI.setLoading(true);
    window.scrollTo({top:0,behavior:'instant'});
    try { await fn(params); } catch(e) { console.error(e); }
    finally { UI.setLoading(false); }
  },

  start() {
    window.addEventListener('popstate', () => this.go(location.pathname+location.search, false));
    document.addEventListener('click', e => {
      const el = e.target.closest('[data-go]');
      if (el) { e.preventDefault(); this.go(el.dataset.go); }
    });
    this.go(location.pathname+location.search, false);
  },
};
