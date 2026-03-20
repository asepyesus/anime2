const App = {
  loading(v) {
    document.getElementById('bar')?.classList.toggle('on', v);
  },

  page(html, noFooter = false) {
    document.getElementById('page').innerHTML = html;
    document.getElementById('footer').innerHTML = noFooter ? '' : UI.footer();
    // Re-bind any data-go links inside the new page
    document.getElementById('page').querySelectorAll('[data-go]').forEach(el => {
      el.addEventListener('click', e => {
        e.preventDefault();
        Router.go(el.dataset.go);
      });
    });
  },

  nav() {
    document.getElementById('nav').innerHTML = UI.navbar();
    UI._bindNav();
  },

  toast(msg, type = 'ok') {
    const t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg;
    t.className = 'show ' + (type === 'err' ? 'err' : type === 'warn' ? 'warn' : '');
    clearTimeout(window._tt);
    window._tt = setTimeout(() => t.className = '', 3200);
  },
};
