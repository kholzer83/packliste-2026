'use strict';

const LS = 'packliste_2026_';

function getState(id) {
  try { return JSON.parse(localStorage.getItem(LS + id) || '{}'); }
  catch { return {}; }
}

function saveState(id, s) {
  localStorage.setItem(LS + id, JSON.stringify(s));
}

function esc(str) {
  return String(str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function getRemovedItems(id) {
  return new Set(getState(id).removed_items || []);
}

// ── Progress ─────────────────────────────────────────────

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

// ── Checkbox item (predefined) ────────────────────────────

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

// ── Custom item ────────────────────────────────────────────

function makeCustomItem(item, eventId, onUpdate) {
  const li = document.createElement('li');
  li.className = 'check-item';

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
    const s = getState(eventId);
    const idx = (s.custom_items || []).findIndex(c => c.id === item.id);
    if (idx !== -1) s.custom_items[idx].checked = cb.checked;
    saveState(eventId, s);
    label.classList.toggle('checked', cb.checked);
    refreshProgress(eventId);
  });

  del.addEventListener('click', () => {
    const s = getState(eventId);
    s.custom_items = (s.custom_items || []).filter(c => c.id !== item.id);
    saveState(eventId, s);
    onUpdate();
    refreshProgress(eventId);
  });

  return li;
}

// ── Category block ─────────────────────────────────────────

function makeCategoryBlock(cat, eventId, onChange, showTitle = true) {
  const removed = getRemovedItems(eventId);
  const visibleItems = cat.items.filter(i => !removed.has(i.id));

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
  visibleItems.forEach(item => ul.appendChild(makeCheckItem(item, eventId, onChange)));
  div.appendChild(ul);
  return div;
}

// ── Section widget ─────────────────────────────────────────

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

// ── Render basis tab ───────────────────────────────────────

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

  // Restore link for basis
  root.appendChild(makeRestoreLink('basis'));

  requestAnimationFrame(() => refreshProgress('basis'));
  return root;
}

// ── Render trip tab ────────────────────────────────────────

function renderTripTab(ev) {
  const root = document.createElement('div');

  // Trip header
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

  // Basis section — collapsible, starts closed
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

  // Extras section — open by default
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

  // Custom items section
  const customSec = document.createElement('div');
  customSec.className = 'section open custom-section';
  customSec.style.display = 'none';

  const customHdr = document.createElement('div');
  customHdr.className = 'section-header';
  customHdr.style.cursor = 'default';
  customHdr.innerHTML = '<div class="section-title">✏️ Eigene Einträge</div>';

  const customBody = document.createElement('div');
  customBody.className = 'section-body';

  customSec.append(customHdr, customBody);
  root.appendChild(customSec);

  function renderCustoms() {
    customBody.innerHTML = '';
    const s = getState(ev.id);
    const customs = s.custom_items || [];
    if (customs.length === 0) { customSec.style.display = 'none'; return; }
    customSec.style.display = '';

    const grouped = {};
    customs.forEach(item => {
      const k = item.category || 'diverses';
      if (!grouped[k]) grouped[k] = [];
      grouped[k].push(item);
    });

    BASE_ESSENTIALS.forEach(cat => {
      if (!grouped[cat.id]) return;
      const div = document.createElement('div');
      div.className = 'category';
      const t = document.createElement('div');
      t.className = 'cat-title';
      t.textContent = cat.icon + ' ' + cat.name;
      const ul = document.createElement('ul');
      ul.className = 'checklist';
      grouped[cat.id].forEach(item => ul.appendChild(makeCustomItem(item, ev.id, () => {
        renderCustoms(); refreshProgress(ev.id);
      })));
      div.append(t, ul);
      customBody.appendChild(div);
    });
  }
  renderCustoms();

  // Add custom input
  const addDiv = document.createElement('div');
  addDiv.className = 'add-custom';

  const addTitle = document.createElement('div');
  addTitle.className = 'add-custom-title';
  addTitle.textContent = 'Eigene Items hinzufügen';

  const addRow = document.createElement('div');
  addRow.className = 'add-row';

  const sel = document.createElement('select');
  sel.className = 'add-select';
  BASE_ESSENTIALS.forEach(cat => {
    const o = document.createElement('option');
    o.value = cat.id;
    o.textContent = cat.icon + ' ' + cat.name;
    sel.appendChild(o);
  });

  const inp = document.createElement('input');
  inp.type = 'text';
  inp.className = 'add-input';
  inp.placeholder = 'Neues Item eingeben…';
  inp.maxLength = 120;

  const addBtn = document.createElement('button');
  addBtn.className = 'btn-add';
  addBtn.textContent = '+ Hinzufügen';

  addRow.append(sel, inp, addBtn);
  addDiv.append(addTitle, addRow);
  root.appendChild(addDiv);

  // Restore deleted items link
  root.appendChild(makeRestoreLink(ev.id));

  function doAdd() {
    const text = inp.value.trim();
    if (!text) { inp.focus(); return; }
    const s = getState(ev.id);
    if (!s.custom_items) s.custom_items = [];
    s.custom_items.push({
      id: 'c_' + Date.now() + '_' + Math.random().toString(36).slice(2,6),
      text, checked: false, category: sel.value
    });
    saveState(ev.id, s);
    inp.value = '';
    inp.focus();
    renderCustoms();
    refreshProgress(ev.id);
  }

  addBtn.addEventListener('click', doAdd);
  inp.addEventListener('keydown', e => { if (e.key === 'Enter') doAdd(); });

  requestAnimationFrame(() => refreshProgress(ev.id));
  return root;
}

// ── Restore deleted items link ─────────────────────────────

function makeRestoreLink(eventId) {
  const wrap = document.createElement('div');
  wrap.className = 'restore-wrap';

  function updateVisibility() {
    const removed = getRemovedItems(eventId);
    wrap.style.display = removed.size > 0 ? '' : 'none';
  }

  const link = document.createElement('button');
  link.className = 'btn-restore';
  link.textContent = '↺ Ausgeblendete Items wiederherstellen';

  link.addEventListener('click', () => {
    const s = getState(eventId);
    s.removed_items = [];
    saveState(eventId, s);
    // Force full re-render of current tab
    activeTab = null;
    switchTab(eventId);
  });

  wrap.appendChild(link);
  updateVisibility();
  return wrap;
}

// ── Progress bar DOM ───────────────────────────────────────

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

// ── Tabs ───────────────────────────────────────────────────

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
      let name = ev.name.replace(' Grand Prix',' GP').replace(' MotoGP','').replace('–','/');
      if (name.length > 15) name = name.slice(0,14) + '…';
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

document.addEventListener('DOMContentLoaded', () => {
  buildTabs();
  switchTab('basis');
});
