(() => {
  'use strict';
  const homeURL = new URL('index.html', location.href).href;
  const menuURL = new URL('menu.html', location.href).href;
  const isMenu = location.pathname.endsWith('/menu.html');
  const navigate = url => window.fadeNavigate ? window.fadeNavigate(url) : location.assign(url);

  function rememberOrigin() {
    if (isMenu) return;
    try { sessionStorage.setItem('leon-menu-origin', location.href.split('#')[0]); } catch {}
  }

  function menuReturnURL() {
    try {
      const origin = new URL(sessionStorage.getItem('leon-menu-origin') || homeURL, location.href);
      const directory = new URL('.', location.href).pathname;
      if (origin.origin === location.origin && origin.pathname.startsWith(directory) && origin.pathname.endsWith('.html') && origin.href !== menuURL) return origin.href;
    } catch {}
    return homeURL;
  }

  window.openMenuContext = () => { rememberOrigin(); navigate(menuURL); };
  window.closeMenuContext = () => navigate(menuReturnURL());

  document.querySelectorAll('.brand-home').forEach(link => {
    link.href = homeURL;
    link.removeAttribute('target');
  });
  if (isMenu) {
    const back = document.querySelector('.return-bar a');
    if (back) back.href = menuReturnURL();
  }

  document.addEventListener('click', event => {
    if (!(event.target instanceof Element)) return;
    if (event.target.closest('.menu-label')) rememberOrigin();
    const brand = event.target.closest('.masthead .theme-toggle');
    if (!brand) return;
    if (document.body.classList.contains('door-mode') || document.body.classList.contains('portal-bursting') || document.body.classList.contains('about-open')) {
      event.preventDefault();
      event.stopImmediatePropagation();
      navigate(homeURL);
    }
  }, true);
})();
