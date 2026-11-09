// A full-height divider: the folder tree keeps its preferred width across restarts.
(() => {
  'use strict';
  const sidebar = document.querySelector('body > .sidebar');
  if (!sidebar) return;
  const MIN = 190, DEFAULT = 260, MAX = 900, KEY = 'sidebarWidth';
  const divider = document.createElement('div');
  divider.id = 'sidebarResize';
  divider.className = 'sidebar-resizer';
  divider.tabIndex = 0;
  divider.setAttribute('role', 'separator');
  divider.setAttribute('aria-orientation', 'vertical');
  divider.setAttribute('aria-label', '调整文件夹栏宽度');
  divider.title = '拖动调整宽度；双击恢复默认；方向键微调';
  sidebar.id ||= 'librarySidebar';
  divider.setAttribute('aria-controls', sidebar.id);
  sidebar.after(divider);
  let preferred = DEFAULT, drag = null;
  try {
    const saved = Number(localStorage.getItem(KEY));
    if (Number.isFinite(saved) && saved >= MIN && saved <= MAX) preferred = saved;
  } catch {}
  const visibleWidth = element => element ? element.getBoundingClientRect().width : 0;
  function maximum() {
    return Math.max(MIN, Math.min(MAX, window.innerWidth - visibleWidth(document.querySelector('body > .rail')) - visibleWidth(document.querySelector('body > #detail')) - 360 - 6));
  }
  function apply() {
    const max = maximum(), value = Math.round(Math.max(MIN, Math.min(max, preferred)));
    sidebar.style.width = value + 'px';
    divider.setAttribute('aria-valuemin', String(MIN));
    divider.setAttribute('aria-valuemax', String(Math.floor(max)));
    divider.setAttribute('aria-valuenow', String(value));
    divider.setAttribute('aria-valuetext', value + ' 像素');
  }
  function save() { try { localStorage.setItem(KEY, String(preferred)); } catch {} }
  function finish(cancel = false) {
    if (!drag) return;
    const current = drag;
    drag = null;
    if (cancel) preferred = current.preferred;
    document.body.classList.remove('resizing-sidebar');
    if (divider.hasPointerCapture(current.id)) divider.releasePointerCapture(current.id);
    apply();
    if (!cancel) save();
  }
  divider.addEventListener('pointerdown', event => {
    if (event.button !== 0) return;
    event.preventDefault();
    divider.focus();
    drag = { id: event.pointerId, x: event.clientX, width: visibleWidth(sidebar), preferred };
    divider.setPointerCapture(event.pointerId);
    document.body.classList.add('resizing-sidebar');
  });
  divider.addEventListener('pointermove', event => {
    if (!drag || drag.id !== event.pointerId) return;
    preferred = Math.round(Math.max(MIN, Math.min(maximum(), drag.width + event.clientX - drag.x)));
    apply();
  });
  divider.addEventListener('pointerup', event => { if (drag?.id === event.pointerId) finish(); });
  divider.addEventListener('pointercancel', () => finish(true));
  divider.addEventListener('lostpointercapture', () => finish(true));
  window.addEventListener('blur', () => finish(true));
  divider.addEventListener('dblclick', () => { finish(true); preferred = DEFAULT; apply(); save(); });
  divider.addEventListener('keydown', event => {
    if (event.key === 'Escape' && drag) { event.preventDefault(); finish(true); return; }
    const current = visibleWidth(sidebar), step = event.shiftKey ? 50 : 10;
    const values = { ArrowLeft: current - step, ArrowRight: current + step, Home: MIN, End: maximum() };
    if (!(event.key in values)) return;
    event.preventDefault();
    preferred = Math.round(Math.max(MIN, Math.min(maximum(), values[event.key])));
    apply(); save();
  });
  const observer = new ResizeObserver(apply);
  observer.observe(document.body);
  const detail = document.querySelector('body > #detail');
  if (detail) observer.observe(detail);
  // Canvas mode hides the utility rail; recalculate when returning to the library.
  new MutationObserver(apply).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  window.addEventListener('resize', apply);
  apply();
})();
