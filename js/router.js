const Router = {
  _routes: {},
  go(path, push=true) {
    const [base, qs] = path.split('?');
    const params = Object.fromEntries(new URLSearchParams(qs||''));
    if (push && location.pathname+location.search !== path) history.pushState({},'' ,path);
    const fn = this._routes[base] || this._routes['/404'];
    if (fn) { App.loading(true); window.scrollTo({top:0,behavior:'instant'}); Promise.resolve(fn(params)).finally(()=>App.loading(false)); }
  },
  on(p,fn) { this._routes[p]=fn; },
  start() {
    window.addEventListener('popstate', ()=>this.go(location.pathname+location.search,false));
    document.addEventListener('click', e=>{
      const el=e.target.closest('[data-go]');
      if(el){ e.preventDefault(); this.go(el.dataset.go); }
    });
    this.go(location.pathname+location.search,false);
  },
};
