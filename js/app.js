const App = {
  loading(v) {
    document.getElementById('bar')?.classList.toggle('on',v);
  },
  page(html, noFooter=false) {
    document.getElementById('page').innerHTML = html;
    document.getElementById('footer').innerHTML = noFooter ? '' : UI.footer();
  },
  nav() {
    document.getElementById('nav').innerHTML = UI.navbar();
    UI._bindNav();
  },
  toast(msg, type='ok') {
    const t=document.getElementById('toast');
    if(!t) return;
    t.textContent=msg; t.className='show '+(type==='err'?'err':'');
    clearTimeout(window._tt);
    window._tt=setTimeout(()=>t.className='',3000);
  },
};
