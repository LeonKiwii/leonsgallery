(() => {
  'use strict';
  const trigger = document.querySelector('.about-trigger');
  const panel = document.querySelector('.about-panel');
  const header = document.querySelector('.masthead');
  if (!trigger || !panel) return;

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const inertBefore = new Map();
  let open = false;
  let closeTimer;
  let entranceFrame;
  let previousOverflow = null;
  panel.tabIndex = -1;

  function isolateBackground() {
    if (previousOverflow !== null) return;
    previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    [...document.body.children].forEach(element => {
      if (element === panel || element === header || /^(SCRIPT|STYLE|LINK|AUDIO)$/.test(element.tagName)) return;
      inertBefore.set(element, element.inert);
      element.inert = true;
    });
  }

  function restoreBackground() {
    inertBefore.forEach((wasInert, element) => { element.inert = wasInert; });
    inertBefore.clear();
    if (previousOverflow !== null) document.documentElement.style.overflow = previousOverflow;
    previousOverflow = null;
  }

  function setOpen(value, { restoreFocus = true } = {}) {
    open = value;
    clearTimeout(closeTimer);
    cancelAnimationFrame(entranceFrame);
    trigger.setAttribute('aria-expanded', String(value));
    document.body.classList.toggle('about-open', value);
    if (value) {
      isolateBackground();
      panel.hidden = false;
      // Commit the hidden-to-visible state before starting the opacity transition.
      panel.getBoundingClientRect();
      entranceFrame = requestAnimationFrame(() => {
        if (!open) return;
        panel.classList.add('is-open');
        panel.focus({ preventScroll: true });
      });
    } else {
      panel.classList.remove('is-open');
      const finish = () => {
        if (open) return;
        panel.hidden = true;
        restoreBackground();
      };
      if (reducedMotion.matches) finish();
      else closeTimer = setTimeout(finish, 400);
      if (restoreFocus) trigger.focus({ preventScroll: true });
    }
    window.dispatchEvent(new Event('aboutstate'));
  }

  trigger.addEventListener('click', () => setOpen(!open));
  panel.addEventListener('click', event => {
    if (event.target === panel) setOpen(false);
  });
  window.addEventListener('leon:navigate', () => {
    if (open) setOpen(false, { restoreFocus: false });
  });

  function focusableControls() {
    const selector = 'a[href],button:not([disabled]),input:not([disabled]),[tabindex]:not([tabindex="-1"])';
    return [...(header?.querySelectorAll(selector) || []), ...panel.querySelectorAll(selector)]
      .filter(element => element.getClientRects().length && !element.closest('[inert]'));
  }

  document.addEventListener('keydown', event => {
    if (!open) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopImmediatePropagation();
      setOpen(false);
    } else if (event.key === 'Tab') {
      const controls = focusableControls();
      if (!controls.length) { event.preventDefault(); panel.focus(); return; }
      const index = controls.indexOf(document.activeElement);
      const next = index === -1 ? (event.shiftKey ? controls.length - 1 : 0) : (index + (event.shiftKey ? -1 : 1) + controls.length) % controls.length;
      event.preventDefault();
      controls[next].focus({ preventScroll: true });
    }
  }, true);

  if (location.hash === '#about') setOpen(true);
})();
