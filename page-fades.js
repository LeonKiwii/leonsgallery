(() => {
  'use strict';
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let leaving = false;
  let exitAnimation = null;
  let navigationVersion = 0;

  function restorePage() {
    navigationVersion += 1;
    leaving = false;
    exitAnimation?.cancel();
    exitAnimation = null;
  }

  window.fadeNavigate = async destination => {
    if (leaving) return;
    const url = new URL(destination, location.href);
    leaving = true;
    const version = ++navigationVersion;
    window.dispatchEvent(new Event('leon:navigate'));
    try {
      if (!reducedMotion.matches && document.body?.animate) {
        exitAnimation = document.body.animate(
          [{ opacity: getComputedStyle(document.body).opacity }, { opacity: 0 }],
          { duration: 400, easing: 'ease-in-out', fill: 'forwards' }
        );
        // A cancelled animation must not leave the page invisible or block its link.
        await exitAnimation.finished.catch(() => {});
      }
      if (version === navigationVersion) location.assign(url.href);
    } catch (error) {
      restorePage();
      throw error;
    }
  };

  document.addEventListener('click', event => {
    const link = event.target instanceof Element ? event.target.closest('a[href]') : null;
    if (!link || event.defaultPrevented || event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if ((link.target && link.target !== '_self') || link.hasAttribute('download') || link.hasAttribute('data-no-fade')) return;
    const url = new URL(link.href, location.href);
    const sameDocument = url.pathname === location.pathname && url.search === location.search;
    if (url.origin !== location.origin || !url.pathname.endsWith('.html') || (sameDocument && url.hash)) return;
    if (link.matches('.menu-label') && !location.pathname.endsWith('/menu.html')) {
      try { sessionStorage.setItem('leon-menu-origin', location.href.split('#')[0]); } catch {}
    }
    event.preventDefault();
    // Keep legacy route-specific wipe handlers from competing with the shared fade.
    event.stopImmediatePropagation();
    window.fadeNavigate(url.href);
  }, true);

  if (typeof HTMLDialogElement !== 'undefined') {
    const nativeShowModal = HTMLDialogElement.prototype.showModal;
    const nativeClose = HTMLDialogElement.prototype.close;
    const states = new WeakMap();
    const stateFor = dialog => {
      if (!states.has(dialog)) states.set(dialog, { animation: null, version: 0, closing: false });
      return states.get(dialog);
    };

    HTMLDialogElement.prototype.showModal = function () {
      const state = stateFor(this);
      const wasOpen = this.open;
      const wasClosing = state.closing;
      const opacity = wasOpen ? getComputedStyle(this).opacity : '0';
      nativeShowModal.call(this);
      state.version += 1;
      state.closing = false;
      state.animation?.cancel();
      state.animation = null;
      if (!reducedMotion.matches && (!wasOpen || wasClosing)) {
        state.animation = this.animate([{ opacity }, { opacity: 1 }], { duration: 450, easing: 'ease-in-out' });
      }
    };

    HTMLDialogElement.prototype.close = function (value) {
      const state = stateFor(this);
      if (!this.open || state.closing) return;
      const opacity = getComputedStyle(this).opacity;
      state.closing = true;
      const version = ++state.version;
      state.animation?.cancel();
      const finish = () => {
        if (version !== state.version) return;
        nativeClose.call(this, value);
        state.animation?.cancel();
        state.animation = null;
        state.closing = false;
      };
      if (reducedMotion.matches) { finish(); return; }
      state.animation = this.animate([{ opacity }, { opacity: 0 }], { duration: 350, easing: 'ease-in-out', fill: 'forwards' });
      state.animation.finished.then(finish, finish);
    };

    document.addEventListener('cancel', event => {
      if (!(event.target instanceof HTMLDialogElement)) return;
      // Append at the target phase so a dialog's own preventDefault (the Abyss
      // invitation, for example) is respected before deciding to fade it away.
      event.target.addEventListener('cancel', function fadeDismiss(cancelEvent) {
        if (cancelEvent.defaultPrevented) return;
        cancelEvent.preventDefault();
        this.close();
      }, { once: true });
    }, true);
  }

  addEventListener('pageshow', restorePage);
  reducedMotion.addEventListener('change', () => {
    if (reducedMotion.matches) exitAnimation?.finish();
  });
})();
