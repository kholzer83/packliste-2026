'use strict';

const LS = 'packliste_2026_';

// Fixed Firestore document — no auth needed.
// Change this path if you want to reset or use a different "family".
const FB_DOC = 'packliste2026/holzer';

// ── In-memory cache ───────────────────────────────────────
// Populated from Firestore on load; kept in sync via onSnapshot.

const _cache = {};

function getState(id) {
  if (_cache[id] !== undefined) return { ..._cache[id] };
  try { return JSON.parse(localStorage.getItem(LS + id) || '{}'); }
  catch { return {}; }
}

function saveState(id, s) {
  _cache[id] = { ...s };
  try { localStorage.setItem(LS + id, JSON.stringify(s)); } catch {}
  _fbSave(id, s);
}

// ── Firebase / Firestore ──────────────────────────────────

let _db = null, _appReady = false, _unsubSnap = null, _pendingSaves = 0;

function _fbSave(id, state) {
  if (!_db) return;
  _pendingSaves++;
  _setSyncStatus('saving');
  _db.doc(FB_DOC)
    .set({ [id]: JSON.stringify(state) }, { merge: true })
    .then(() => {
      _pendingSaves--;
      if (_pendingSaves === 0) _setSyncStatus('ok');
    })
    .catch(e => {
      _pendingSaves--;
      console.warn('[Firebase] write error:', e);
      _setSyncStatus('error');
    });
}

function _fbSetupSync() {
  if (_unsubSnap) _unsubSnap();

  // If Firestore doesn't respond within 4s (offline / wrong config), show app from localStorage
  const fallback = setTimeout(() => {
    if (!_appReady) {
      _appReady = true;
      _hideLoading();
      buildTabs();
      switchTab('basis');
    }
  }, 4000);

  _unsubSnap = _db.doc(FB_DOC).onSnapshot(snap => {
    clearTimeout(fallback);
    if (snap.exists) {
      const data = snap.data();
      let changed = false;
      Object.entries(data).forEach(([key, raw]) => {
        try {
          const parsed = JSON.parse(raw);
          if (JSON.stringify(_cache[key]) !== JSON.stringify(parsed)) {
            _cache[key] = parsed;
            try { localStorage.setItem(LS + key, raw); } catch {}
            changed = true;
          }
        } catch {}
      });

      if (!_appReady) {
        _appReady = true;
        _hideLoading();
        buildTabs();
        switchTab('basis');
      } else if (changed && activeTab) {
        // Re-render when another device changed data
        const tab = activeTab;
        activeTab = null;
        switchTab(tab);
      }
    } else {
      // No Firestore data yet — migrate localStorage and start
      _fbMigrateLocalStorage();
      if (!_appReady) {
        _appReady = true;
        _hideLoading();
        buildTabs();
        switchTab('basis');
      }
    }
  }, err => {
    clearTimeout(fallback);
    console.warn('[Firebase] listener error:', err);
    _setSyncStatus('error');
    if (!_appReady) {
      _appReady = true;
      _hideLoading();
      buildTabs();
      switchTab('basis');
    }
  });
}

function _fbMigrateLocalStorage() {
  if (!_db) return;
  const ids = ['basis', ...EVENTS.map(e => e.id)];
  const updates = {};
  ids.forEach(id => {
    const raw = localStorage.getItem(LS + id);
    if (raw && raw !== '{}') {
      try { JSON.parse(raw); updates[id] = raw; } catch {}
    }
  });
  if (Object.keys(updates).length > 0) {
    _db.doc(FB_DOC).set(updates, { merge: true })
      .catch(e => console.warn('[Firebase] migration error:', e));
  }
}

function _hideLoading() {
  const el = document.getElementById('loadingOverlay');
  if (el) el.style.display = 'none';
}

function _setSyncStatus(state) {
  const el = document.getElementById('syncStatus');
  if (!el) return;
  if (state === 'ok')     { el.textContent = '●'; el.className = 'sync-status sync-ok'; el.title = 'Synchronisiert'; }
  if (state === 'saving') { el.textContent = '●'; el.className = 'sync-status sync-saving'; el.title = 'Speichert…'; }
  if (state === 'error')  { el.textContent = '●'; el.className = 'sync-status sync-error'; el.title = 'Sync-Fehler (offline?)'; }
}

function initFirebase() {
  try {
    firebase.initializeApp(FIREBASE_CONFIG);
    _db = firebase.firestore();
    _fbSetupSync();
  } catch (e) {
    console.error('[Firebase] init error:', e);
    // Fallback: run with localStorage only
    _hideLoading();
    buildTabs();
    switchTab('basis');
  }
}

// ── Utility ───────────────────────────────────────────────

function esc(str) {
  return String(str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function getRemovedItems(id) {
  return new Set(getState(id).removed_items || []);
}

// ── Progress ──────────────────────────────────────────────

function calcProgress(eventId) {
  const s = getState(eventId);
  const removed = new Set(s.removed_items || []);
  let total = 0, checked = 0;

  BASE_ESSENTIALS.forEach(cat => cat.items.forEach(item => {
    if (removed.has(item.id)) return;
    total++; if (s[item.id]) checked++;
  }));

  if (eventId !== 'basis') {
    const ev = EVENTS.find(e => e.id === eventId);
    if (ev) ev.extras.forEach(cat => cat.items.forEach(item => {
      if (removed.has(item.id)) return;
      total++; if (s[item.id]) checked++;
    }));
  }

  (s.custom_items || []).forEach(item => { total++; if (item.checked) checked++; });
  return { checked, total };
}

function refreshProgress(eventId) {
  const { checked, total } = calcProgress(eventId);
  const pct = total > 0 ? Math.round(checked / total * 100) : 0;
  const fill = document.getElementById('pf');
  const cnt  = document.getElementById('pc');
  if (fill) fill.style.width = pct + '%';
  if (cnt)  cnt.textContent  = `${checked} / ${total} gepackt`;
}

// ── Badge helpers ─────────────────────────────────────────

function setBadge(el, checked, total) {
  if (!el) return;
  el.textContent = `${checked}/${total}`;
  el.classList.toggle('done', total > 0 && checked === total);
}

function calcItems(items, eventId) {
  const s = getState(eventId);
  const removed = new Set(s.removed_items || []);
  const visible = items.filter(i => !removed.has(i.id));
  return { checked: visible.filter(i => s[i.id]).length, total: visible.length };
}

// ── Predefined checkbox item ──────────────────────────────

function makeCheckItem(item, eventId, onChange) {
  const s = getState(eventId);
  const li = document.createElement('li');
  li.className = 'check-item';

  const label = document.createElement('label');
  if (s[item.id]) label.classList.add('checked');

  const cb = document.createElement('input');
  cb.type = 'checkbox';
  cb.checked = !!s[item.id];

  const span = document.createElement('span');
  span.className = 'item-text';
  span.textContent = item.text;

  const del = document.createElement('button');
  del.className = 'btn-del';
  del.textContent = '✕';
  del.title = 'Item ausblenden';

  label.append(cb, span);
  li.append(label, del);

  cb.addEventListener('change', () => {
    const ns = getState(eventId);
    ns[item.id] = cb.checked;
    saveState(eventId, ns);
    label.classList.toggle('checked', cb.checked);
    refreshProgress(eventId);
    if (onChange) onChange();
  });

  del.addEventListener('click', () => {
    const ns = getState(eventId);
    if (!ns.removed_items) ns.removed_items = [];
    if (!ns.removed_items.includes(item.id)) ns.removed_items.push(item.id);
    delete ns[item.id];
    saveState(eventId, ns);
    li.remove();
    refreshProgress(eventId);
    if (onChange) onChange();
  });

  return li;
}

// ── Category block with inline custom items + add row ─────

function makeCategoryBlock(cat, eventId, onBadgeChange, showTitle = true) {
  const removed = getRemovedItems(eventId);
  const visiblePredefined = cat.items.filter(i => !removed.has(i.id));

  const div = document.createElement('div');
  div.className = 'category';

  if (showTitle) {
    const title = document.createElement('div');
    title.className = 'cat-title';
    title.textContent = cat.icon + ' ' + cat.name;
    div.appendChild(title);
  }

  const ul = document.createElement('ul');
  ul.className = 'checklist';

  visiblePredefined.forEach(item => ul.appendChild(makeCheckItem(item, eventId, onBadgeChange)));

  function renderCustomItems() {
    ul.querySelectorAll('li.custom-li').forEach(el => el.remove());
    const s = getState(eventId);
    (s.custom_items || [])
      .filter(item => item.category === cat.id)
      .forEach(item => {
        const li = document.createElement('li');
        li.className = 'check-item custom-li';

        const label = document.createElement('label');
        if (item.checked) label.classList.add('checked');

        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.checked = !!item.checked;

        const span = document.createElement('span');
        span.className = 'item-text';
        span.textContent = item.text;

        const del = document.createElement('button');
        del.className = 'btn-del';
        del.textContent = '✕';
        del.title = 'Löschen';

        label.append(cb, span);
        li.append(label, del);

        cb.addEventListener('change', () => {
          const ns = getState(eventId);
          const idx = (ns.custom_items || []).findIndex(c => c.id === item.id);
          if (idx !== -1) ns.custom_items[idx].checked = cb.checked;
          saveState(eventId, ns);
          label.classList.toggle('checked', cb.checked);
          refreshProgress(eventId);
        });

        del.addEventListener('click', () => {
          const ns = getState(eventId);
          ns.custom_items = (ns.custom_items || []).filter(c => c.id !== item.id);
          saveState(eventId, ns);
          li.remove();
          refreshProgress(eventId);
        });

        ul.appendChild(li);
      });
  }

  renderCustomItems();
  div.appendChild(ul);

  const addRow = document.createElement('div');
  addRow.className = 'cat-add-row';

  const addInput = document.createElement('input');
  addInput.type = 'text';
  addInput.className = 'cat-add-input';
  addInput.placeholder = 'Item hinzufügen…';
  addInput.maxLength = 120;

  const addBtn = document.createElement('button');
  addBtn.className = 'cat-add-btn';
  addBtn.textContent = '+';
  addBtn.title = 'Hinzufügen';

  addRow.append(addInput, addBtn);
  div.appendChild(addRow);

  function doAdd() {
    const text = addInput.value.trim();
    if (!text) { addInput.focus(); return; }
    const s = getState(eventId);
    if (!s.custom_items) s.custom_items = [];
    s.custom_items.push({
      id: 'c_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      text, checked: false, category: cat.id
    });
    saveState(eventId, s);
    addInput.value = '';
    addInput.focus();
    renderCustomItems();
    refreshProgress(eventId);
  }

  addBtn.addEventListener('click', doAdd);
  addInput.addEventListener('keydown', e => { if (e.key === 'Enter') doAdd(); });

  return div;
}

// ── Section widget ────────────────────────────────────────

function makeSection(titleHtml, isOpen, collapsible) {
  const sec = document.createElement('div');
  sec.className = 'section' + (isOpen ? ' open' : '');

  const hdr = document.createElement('div');
  hdr.className = 'section-header';
  if (!collapsible) hdr.style.cursor = 'default';

  const ttl = document.createElement('div');
  ttl.className = 'section-title';
  ttl.innerHTML = titleHtml;

  const right = document.createElement('div');
  right.className = 'section-right';

  const badge = document.createElement('span');
  badge.className = 'section-badge';
  right.appendChild(badge);

  if (collapsible) {
    const arr = document.createElement('span');
    arr.className = 'section-toggle';
    arr.innerHTML = '&#9660;';
    right.appendChild(arr);
    hdr.addEventListener('click', () => sec.classList.toggle('open'));
  }

  hdr.append(ttl, right);

  const body = document.createElement('div');
  body.className = 'section-body';

  sec.append(hdr, body);
  return { sec, body, badge };
}

// ── Render basis tab ──────────────────────────────────────

function renderBasisTab() {
  const root = document.createElement('div');

  const intro = document.createElement('div');
  intro.className = 'basis-intro';
  intro.innerHTML = '<strong>Basis-Essentials</strong> — Grundlage für alle 7 Reisewochenenden. Jeder Trip hat seine eigene unabhängige Kopie dieser Liste.';
  root.appendChild(intro);

  root.appendChild(makeProgressBar());

  BASE_ESSENTIALS.forEach(cat => {
    const { sec, body, badge } = makeSection(`${cat.icon} ${esc(cat.name)}`, true, true);
    const refresh = () => {
      const { checked, total } = calcItems(cat.items, 'basis');
      setBadge(badge, checked, total);
    };
    body.appendChild(makeCategoryBlock(cat, 'basis', () => { refresh(); refreshProgress('basis'); }, false));
    refresh();
    root.appendChild(sec);
  });

  root.appendChild(makeRestoreLink('basis'));

  requestAnimationFrame(() => refreshProgress('basis'));
  return root;
}

// ── Render trip tab ───────────────────────────────────────

function renderTripTab(ev) {
  const root = document.createElement('div');

  const hdr = document.createElement('div');
  hdr.className = 'trip-header';
  hdr.innerHTML = `
    <div class="trip-flag-big">${ev.flag}</div>
    <div class="trip-info">
      <h2>${esc(ev.name)}</h2>
      <div class="trip-meta">
        <span>📅 ${esc(ev.dates)}</span>
        <span>🏨 ${esc(ev.hotel)}</span>
        <span>🚗 ${esc(ev.transport)}</span>
        <span>🎪 ${esc(ev.hospitality)}</span>
      </div>
    </div>
    ${ev.note ? `<div class="trip-note">⭐ ${esc(ev.note)}</div>` : ''}
  `;
  root.appendChild(hdr);

  root.appendChild(makeProgressBar());

  const { sec: bSec, body: bBody, badge: bBadge } = makeSection('📋 Basis-Essentials', false, true);
  bSec.classList.add('basis-section');

  const refreshBasis = () => {
    let total = 0, checked = 0;
    BASE_ESSENTIALS.forEach(cat => { const r = calcItems(cat.items, ev.id); total += r.total; checked += r.checked; });
    setBadge(bBadge, checked, total);
  };

  BASE_ESSENTIALS.forEach(cat => {
    bBody.appendChild(makeCategoryBlock(cat, ev.id, () => { refreshBasis(); refreshProgress(ev.id); }));
  });
  refreshBasis();
  root.appendChild(bSec);

  if (ev.extras && ev.extras.length > 0) {
    const { sec: eSec, body: eBody, badge: eBadge } = makeSection('⭐ Trip-spezifische Extras', true, true);

    const refreshExtras = () => {
      let total = 0, checked = 0;
      ev.extras.forEach(cat => { const r = calcItems(cat.items, ev.id); total += r.total; checked += r.checked; });
      setBadge(eBadge, checked, total);
    };

    ev.extras.forEach(cat => {
      const catData = { id: cat.categoryId, icon: cat.icon, name: cat.name, items: cat.items };
      eBody.appendChild(makeCategoryBlock(catData, ev.id, () => { refreshExtras(); refreshProgress(ev.id); }));
    });
    refreshExtras();
    root.appendChild(eSec);
  }

  root.appendChild(makeRestoreLink(ev.id));

  requestAnimationFrame(() => refreshProgress(ev.id));
  return root;
}

// ── Restore deleted items ─────────────────────────────────

function makeRestoreLink(eventId) {
  const wrap = document.createElement('div');
  wrap.className = 'restore-wrap';
  wrap.style.display = getRemovedItems(eventId).size > 0 ? '' : 'none';

  const link = document.createElement('button');
  link.className = 'btn-restore';
  link.textContent = '↺ Ausgeblendete Items wiederherstellen';

  link.addEventListener('click', () => {
    const s = getState(eventId);
    s.removed_items = [];
    saveState(eventId, s);
    activeTab = null;
    switchTab(eventId);
  });

  wrap.appendChild(link);
  return wrap;
}

// ── Progress bar DOM ──────────────────────────────────────

function makeProgressBar() {
  const wrap = document.createElement('div');
  wrap.className = 'progress-wrap';
  wrap.innerHTML = `
    <div class="progress-label">
      <span class="progress-text">Fortschritt</span>
      <span class="progress-count" id="pc">–</span>
    </div>
    <div class="progress-track"><div class="progress-fill" id="pf" style="width:0%"></div></div>
  `;
  return wrap;
}

// ── Tabs ──────────────────────────────────────────────────

let activeTab = null;

function switchTab(id) {
  if (activeTab === id) return;
  activeTab = id;

  document.querySelectorAll('.tab-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.tab === id)
  );

  const active = document.querySelector(`.tab-btn[data-tab="${id}"]`);
  if (active) active.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });

  const app = document.getElementById('app');
  app.innerHTML = '';
  app.appendChild(id === 'basis' ? renderBasisTab() : renderTripTab(EVENTS.find(e => e.id === id)));
}

function buildTabs() {
  const list = document.getElementById('tabList');

  const tabs = [
    { id: 'basis', flag: '📋', name: 'Basis' },
    ...EVENTS.map(ev => {
      let name = ev.name.replace(' Grand Prix', ' GP').replace(' MotoGP', '').replace('–', '/');
      if (name.length > 15) name = name.slice(0, 14) + '…';
      return { id: ev.id, flag: ev.flag, name };
    })
  ];

  tabs.forEach(({ id, flag, name }) => {
    const btn = document.createElement('button');
    btn.className = 'tab-btn';
    btn.dataset.tab = id;
    btn.innerHTML = `<span class="tab-flag">${flag}</span><span class="tab-name">${esc(name)}</span>`;
    btn.addEventListener('click', () => switchTab(id));
    list.appendChild(btn);
  });
}

// ── Boot ──────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', initFirebase);
