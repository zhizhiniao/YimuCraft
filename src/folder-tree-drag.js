// Organize the displayed library tree without starting an OS file drag.
(() => {
  const list = $('folders');
  const heading = document.querySelector('.folder-heading');
  heading.querySelector('span').title = '把文件夹拖到这里可移回根目录';
  let gesture = null, highlight = null, frame = 0, suppressClick = false, saving = false;

  function mark(element) {
    if (highlight === element) return;
    highlight?.classList.remove('folder-drop-target');
    highlight = element;
    highlight?.classList.add('folder-drop-target');
  }

  function destination(x, y) {
    const element = document.elementFromPoint(x, y);
    if (heading.contains(element) || element === list) return {element: heading, path: ''};
    const row = element?.closest('.folder-row');
    return row && list.contains(row) ? {element: row, path: row.dataset.path} : null;
  }

  function hover() {
    const {x, y, source} = gesture;
    const target = destination(x, y);
    mark(target && target.path !== source ? target.element : null);
    const rect = list.getBoundingClientRect();
    if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
      if (y < rect.top + 22) list.scrollTop -= 8;
      else if (y > rect.bottom - 22) list.scrollTop += 8;
    }
    frame = requestAnimationFrame(hover);
  }

  function finish() {
    const previous = gesture;
    gesture = null;
    cancelAnimationFrame(frame);
    mark(null);
    list.classList.remove('folder-dragging');
    if (previous && list.hasPointerCapture(previous.id)) list.releasePointerCapture(previous.id);
    return previous;
  }

  async function drop({library, source}, parent) {
    saving = true;
    try {
      const result = await api.command('organizeFolder', library, source, parent);
      if (state.stats?.location !== library) return;
      state.collapsed.delete(result.parent);
      saveFolderState();
      state.folder = result.path;
      state.collection = null;
      state.unclassified = state.trash = false;
      state.typeShortcut = null;
      await stats();
      await refresh();
      status(parent ? '已移入 '+parent.split(/[\\/]/).pop() : '已移回文件夹根目录');
    } finally {
      saving = false;
    }
  }

  list.addEventListener('pointerdown', event => {
    if (event.button !== 0 || !event.isPrimary || saving || state.busy || !event.target.closest('.folder')) return;
    const row = event.target.closest('.folder-row');
    if (!row) return;
    suppressClick = false;
    gesture = {id:event.pointerId, source:row.dataset.path, library:state.stats.location,
      startX:event.clientX, startY:event.clientY, active:false};
  });
  document.addEventListener('pointermove', event => {
    if (event.pointerId !== gesture?.id) return;
    gesture.x = event.clientX;
    gesture.y = event.clientY;
    if (!gesture.active) {
      if (Math.hypot(gesture.x - gesture.startX, gesture.y - gesture.startY) < 5) return;
      gesture.active = true;
      suppressClick = true;
      list.setPointerCapture(event.pointerId);
      list.classList.add('folder-dragging');
      hover();
    }
    event.preventDefault();
  });
  document.addEventListener('pointerup', event => {
    if (event.pointerId !== gesture?.id) return;
    const previous = finish();
    if (!previous.active) return;
    const target = destination(event.clientX, event.clientY);
    if (target && target.path !== previous.source) run(() => drop(previous, target.path));
  });
  // A drag starting on the icon must not open its click-only appearance dialog.
  document.addEventListener('click', event => {
    if (suppressClick) {suppressClick = false; event.preventDefault(); event.stopImmediatePropagation();}
  }, true);
  document.addEventListener('pointerdown', () => {suppressClick = false;}, true);
  document.addEventListener('pointercancel', event => {if (event.pointerId === gesture?.id) finish();});
  list.addEventListener('lostpointercapture', event => {if (event.pointerId === gesture?.id) finish();});
  document.addEventListener('keydown', event => {if (event.key === 'Escape' && gesture) finish();});
  window.addEventListener('blur', finish);
})();
