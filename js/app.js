// Inquiry Manager: hash routing, list with filters, new inquiry form, inquiry details.
import * as store from './store.js';
import { STATUSES, PRIORITIES, ASSIGNEES } from './store.js';
import { esc, icon, priorityBadge, statusBadge, priorityIcon, statusIcon, formatReceived } from './ui.js';

const $ = (sel, root = document) => root.querySelector(sel);
const listPane = $('#listPane');
const detailPane = $('#detailPane');
const appbarTitle = $('#appbarTitle');
const toastEl = $('#toast');
const toastText = $('#toastText');
const announceEl = $('#announce');
const wide = window.matchMedia('(min-width: 960px)');
const filters = { status: null, priority: null, query: '' };
let showResolved = false;
let currentId = null;
let firstRoute = true;

const plural = (n) => `${n} ${n === 1 ? 'inquiry' : 'inquiries'}`;

/* ---------- Feedback ---------- */
let toastTimer;
function toast(message) {
  toastText.textContent = message;
  toastEl.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('is-visible'), 4000);
  announceEl.textContent = '';
  setTimeout(() => { announceEl.textContent = message; }, 50);
}

/* ---------- List ---------- */
function buildListShell() {
  listPane.innerHTML = `
    <div class="list-head"><h1 class="pane-title" id="listTitle" tabindex="-1">Inquiries</h1></div>
    <div class="filters">
    <div class="tiles" role="group" aria-label="Filter by status">
      ${STATUSES.map((s) => `<button type="button" class="tile" data-status="${esc(s)}" aria-pressed="false"><span class="tile__label">${icon(statusIcon(s), 14)}${esc(s)}</span><span class="tile__count" data-count="${esc(s)}">0</span></button>`).join('')}
    </div>
      <div class="filters__right">
    <fieldset class="filter-group"><legend>Priority</legend>
      <div class="chips">${PRIORITIES.map((p) => `<button type="button" class="chip" data-priority="${p}" aria-pressed="false">${icon(priorityIcon(p))}${p}</button>`).join('')}</div>
    </fieldset>
    <label class="search">${icon('search', 20)}<span class="sr-only">Search inquiries by name, phone, email or message</span><input type="search" id="search" placeholder="Search name, phone or message" autocomplete="off"></label>
      </div>
    </div>
    <div class="summary-row"><p class="muted" id="summary" role="status"></p><button type="button" class="linklike" id="clearFilters" data-clear hidden>Clear filters</button></div>
    <div id="results"></div>`;
}

const byPriority = (a, b) => PRIORITIES.indexOf(a.priority) - PRIORITIES.indexOf(b.priority) || b.createdAt.localeCompare(a.createdAt);

function matchesFilters(i) {
  const q = filters.query.trim().toLowerCase();
  const priorityOk = !filters.priority || i.priority === filters.priority;
  const queryOk = !q || [i.name, i.phone, i.email, i.message].some((v) => v.toLowerCase().includes(q));
  return priorityOk && queryOk;
}

// Open inquiries (New and In progress), optionally narrowed by the status tile.
function visibleInquiries() {
  if (filters.status === 'Resolved') return [];
  return store.getAll().filter((i) => i.status !== 'Resolved' && (!filters.status || i.status === filters.status) && matchesFilters(i)).sort(byPriority);
}

// Resolved inquiries live in their own collapsed list under the open ones.
function resolvedInquiries() {
  return store.getAll().filter((i) => i.status === 'Resolved' && matchesFilters(i)).sort(byPriority);
}

function cardHtml(i) {
  const current = i.id === currentId ? ' aria-current="true"' : '';
  const resolved = i.status === 'Resolved' ? ' card--resolved' : '';
  return `<li><a class="card${resolved}" href="#/inquiry/${encodeURIComponent(i.id)}"${current}>
    <div class="card__top"><span class="card__name">${esc(i.name)}</span>${icon('right', 20)}</div>
    <div class="card__issue">${esc(i.message)}</div>
    <div class="card__badges">${priorityBadge(i.priority)}${statusBadge(i.status)}</div>
    <div class="card__assignee">${icon('user')}${esc(i.assignee)}</div>
  </a></li>`;
}

function updateList() {
  const all = store.getAll();
  listPane.querySelectorAll('[data-status]').forEach((b) => {
    b.setAttribute('aria-pressed', String(filters.status === b.dataset.status));
    $('[data-count]', b).textContent = all.filter((i) => i.status === b.dataset.status).length;
  });
  listPane.querySelectorAll('[data-priority]').forEach((b) => b.setAttribute('aria-pressed', String(filters.priority === b.dataset.priority)));

  const items = visibleInquiries();
  const resolved = resolvedInquiries();
  const onlyResolved = filters.status === 'Resolved';
  const active = Boolean(filters.status || filters.priority || filters.query.trim());
  let summary;
  if (!active) summary = `${items.length} open ${items.length === 1 ? 'inquiry' : 'inquiries'}, sorted by priority`;
  else {
    const parts = [filters.status || 'Open'];
    if (filters.priority) parts.push(`${filters.priority} priority`);
    if (filters.query.trim()) parts.push(`search "${filters.query.trim()}"`);
    summary = `${plural(onlyResolved ? resolved.length : items.length)} · ${parts.join(', ')}`;
  }
  $('#summary', listPane).textContent = summary;
  $('#clearFilters', listPane).hidden = !active;

  const results = $('#results', listPane);
  const open = showResolved || onlyResolved;
  const showResolvedSection = (!filters.status || onlyResolved) && all.some((i) => i.status === 'Resolved');
  let html;
  if (onlyResolved) html = all.some((i) => i.status === 'Resolved') ? '' : `<div class="empty"><h2>No resolved inquiries</h2><p class="muted">Resolved inquiries will show up here.</p></div>`;
  else if (items.length) html = `<div class="cards-head" aria-hidden="true"><span>Customer</span><span>Inquiry</span><span>Priority</span><span>Status</span><span>Assigned to</span><span></span></div><ul class="cards">${items.map(cardHtml).join('')}</ul>`;
  else if (active) html = `<div class="empty"><h2>No open inquiries match</h2><p class="muted">Try a different search or clear the filters.</p><button type="button" class="btn btn--secondary" data-clear>Clear filters</button></div>`;
  else html = `<div class="empty"><h2>No open inquiries</h2><p class="muted">New inquiries will show up here.</p><a class="btn btn--primary" href="#/new">${icon('plus', 18)}Add inquiry</a></div>`;
  if (showResolvedSection) {
    html += `<section class="resolved" aria-label="Resolved inquiries">
      <h2 class="resolved__heading"><button type="button" class="resolved__toggle" id="resolvedToggle" aria-expanded="${open}" aria-controls="resolvedList">${icon('check', 18)}<span>Resolved (${resolved.length})</span>${icon('chevron', 20)}</button></h2>
      <div id="resolvedList"${open ? '' : ' hidden'}>${resolved.length ? `<ul class="cards">${resolved.map(cardHtml).join('')}</ul>` : '<p class="muted resolved__none">No resolved inquiries match.</p>'}</div>
    </section>`;
  }
  results.innerHTML = html;
}

function setResolvedOpen(open) {
  showResolved = open || filters.status === 'Resolved';
  const toggle = $('#resolvedToggle', listPane);
  if (toggle) {
    toggle.setAttribute('aria-expanded', String(open));
    $('#resolvedList', listPane).hidden = !open;
  }
}

function wireList() {
  listPane.addEventListener('click', (e) => {
    const toggle = e.target.closest('#resolvedToggle');
    if (toggle) { if (filters.status !== 'Resolved') setResolvedOpen(!showResolved); return; }
    const t = e.target.closest('[data-status],[data-priority],[data-clear]');
    if (!t) return;
    if (t.dataset.status) filters.status = filters.status === t.dataset.status ? null : t.dataset.status;
    else if (t.dataset.priority) filters.priority = filters.priority === t.dataset.priority ? null : t.dataset.priority;
    else { filters.status = null; filters.priority = null; filters.query = ''; $('#search').value = ''; }
    const wasClear = 'clear' in t.dataset;
    updateList();
    if (wasClear) $('#search').focus();
  });
  $('#search').addEventListener('input', (e) => { filters.query = e.target.value; updateList(); });
}

/* ---------- Forms ---------- */
const titleHtml = (text) => `<h2 class="pane-title" id="paneTitle" tabindex="-1" role="heading" aria-level="${wide.matches ? 2 : 1}">${esc(text)}</h2>`;

function field({ id, label, type = 'text', value = '', optional = false, error = '', textarea = false, placeholder = '' }) {
  const attrs = error ? ` aria-invalid="true" aria-describedby="${id}-error"` : '';
  const control = textarea
    ? `<textarea class="input" id="${id}" name="${id}" placeholder="${esc(placeholder)}"${attrs}>${esc(value)}</textarea>`
    : `<input class="input" id="${id}" name="${id}" type="${type}" value="${esc(value)}" placeholder="${esc(placeholder)}" autocomplete="off"${attrs}>`;
  return `<div class="field"><label for="${id}">${esc(label)}${optional ? ' <span class="optional">(optional)</span>' : ''}</label>${control}${error ? `<p class="field-error" id="${id}-error">${icon('alert')}${esc(error)}</p>` : ''}</div>`;
}

function selectField(id, label, options, value) {
  return `<div class="field"><label for="${id}">${esc(label)}</label><div class="select"><select id="${id}" name="${id}">${options.map((o) => `<option value="${esc(o)}"${o === value ? ' selected' : ''}>${esc(o)}</option>`).join('')}</select>${icon('chevron', 20)}</div></div>`;
}

function validate(v) {
  const e = {};
  if (!v.name.trim()) e.name = "Enter the customer's name";
  if (!v.phone.trim()) e.phone = 'Enter a phone number';
  else if (v.phone.replace(/\D/g, '').length < 7) e.phone = 'Enter a valid phone number, for example 555 0142';
  if (v.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email.trim())) e.email = 'Enter a valid email address, for example name@example.com';
  if (!v.message.trim()) e.message = 'Enter what the inquiry is about';
  return e;
}

function renderNew(values = { name: '', phone: '', email: '', message: '', priority: 'Medium', assignee: 'Unassigned' }, errors = {}) {
  const keys = Object.keys(errors);
  const summary = keys.length ? `<div class="error-summary" id="errorSummary" tabindex="-1" role="group" aria-labelledby="errorTitle">
      <p class="error-summary__title" id="errorTitle">${icon('alert', 20)}${keys.length} ${keys.length === 1 ? 'field needs' : 'fields need'} attention</p>
      <ul>${keys.map((k) => `<li><button type="button" class="linklike" data-focus="${k}">${esc(errors[k])}</button></li>`).join('')}</ul></div>` : '';
  detailPane.innerHTML = `${titleHtml('New inquiry')}
    <form class="form" id="newForm" novalidate>
      ${summary}
      ${field({ id: 'name', label: 'Customer name', value: values.name, error: errors.name, placeholder: 'For example, Dana Whitfield' })}
      ${field({ id: 'phone', label: 'Phone', type: 'tel', value: values.phone, error: errors.phone, placeholder: 'For example, 555 0142' })}
      ${field({ id: 'email', label: 'Email', type: 'email', value: values.email, optional: true, error: errors.email, placeholder: 'name@example.com' })}
      ${field({ id: 'message', label: 'Inquiry', textarea: true, value: values.message, error: errors.message, placeholder: 'What does the customer want to know?' })}
      ${selectField('priority', 'Priority', PRIORITIES, values.priority)}
      ${selectField('assignee', 'Assigned to', ASSIGNEES, values.assignee)}
      <div class="actions">
        <button type="submit" class="btn btn--primary btn--block">Save inquiry</button>
        <a class="btn btn--secondary btn--block" href="#/">Cancel</a>
      </div>
    </form>`;
  const form = $('#newForm');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(form).entries());
    const errs = validate(d);
    if (Object.keys(errs).length) { renderNew(d, errs); $('#errorSummary').focus(); return; }
    store.add(d);
    filters.status = null; filters.priority = null; filters.query = ''; $('#search').value = '';
    toast('Inquiry saved');
    if (location.hash === '#/') route(); else location.hash = '#/';
  });
  form.addEventListener('click', (e) => {
    const b = e.target.closest('[data-focus]');
    if (b) $('#' + b.dataset.focus).focus();
  });
}

function renderDetails(id) {
  const q = store.get(id);
  if (!q) {
    detailPane.innerHTML = `${titleHtml('Inquiry not found')}<p>This inquiry no longer exists.</p><a class="btn btn--secondary" href="#/">Back to inquiries</a>`;
    return;
  }
  detailPane.innerHTML = `${titleHtml('Inquiry details')}
    <form class="form" id="detailForm" data-id="${esc(q.id)}" novalidate>
      ${selectField('priority', 'Priority', PRIORITIES, q.priority)}
      <section class="details" aria-label="Inquiry from ${esc(q.name)}">
        <div class="details__head"><p class="details__name">${esc(q.name)}</p>${statusBadge(q.status)}</div>
        <dl>
          <div><dt>Phone</dt><dd>${esc(q.phone)}</dd></div>
          ${q.email ? `<div><dt>Email</dt><dd>${esc(q.email)}</dd></div>` : ''}
          <div><dt>Received</dt><dd>${esc(formatReceived(q.createdAt))}</dd></div>
          <div><dt>Inquiry</dt><dd>${esc(q.message)}</dd></div>
        </dl>
      </section>
      ${selectField('assignee', 'Assigned to', ASSIGNEES, q.assignee)}
      ${selectField('status', 'Update status', STATUSES, q.status)}
      <div class="actions">
        <button type="submit" class="btn btn--primary btn--block">Save</button>
        <div class="actions__row">
          ${q.status !== 'Resolved' ? `<button type="button" class="btn btn--secondary" id="resolveBtn">${icon('check', 18)}Resolve</button>` : ''}
          <a class="btn btn--secondary" href="#/">Cancel</a>
        </div>
      </div>
    </form>`;
  const form = $('#detailForm');
  const save = (forceStatus) => {
    const d = Object.fromEntries(new FormData(form).entries());
    store.update(q.id, { priority: d.priority, assignee: d.assignee, status: forceStatus || d.status });
    toast(forceStatus ? 'Inquiry resolved' : 'Changes saved');
    if (wide.matches) { renderDetails(q.id); updateList(); $('#paneTitle').focus(); }
    else location.hash = '#/';
  };
  form.addEventListener('submit', (e) => { e.preventDefault(); save(null); });
  const resolve = $('#resolveBtn');
  if (resolve) resolve.addEventListener('click', () => save('Resolved'));
}

/* ---------- Routing ---------- */
function parseRoute() {
  const h = location.hash.replace(/^#\/?/, '');
  if (h === 'new') return { view: 'new' };
  const m = h.match(/^inquiry\/(.+)$/);
  if (m) return { view: 'details', id: decodeURIComponent(m[1]) };
  return { view: 'list' };
}

function route() {
  const r = parseRoute();
  document.body.dataset.view = r.view;
  currentId = r.id || null;
  const names = { list: '', new: 'New inquiry', details: 'Inquiry details' };
  appbarTitle.textContent = names[r.view];
  document.title = (names[r.view] ? names[r.view] + ' · ' : '') + 'Inquiry Manager';
  if (r.view === 'new') renderNew();
  else if (r.view === 'details') renderDetails(r.id);
  else detailPane.innerHTML = '<p class="placeholder">Select an inquiry to see its details, or choose Add inquiry to log a new one.</p>';
  updateList();
  if (!firstRoute) {
    const target = r.view === 'list' ? $('#listTitle') : $('#paneTitle');
    if (target) target.focus();
    window.scrollTo(0, 0);
  }
  firstRoute = false;
}

wide.addEventListener('change', () => { const t = $('#paneTitle'); if (t) t.setAttribute('aria-level', wide.matches ? '2' : '1'); });
buildListShell();
wireList();
route();
window.addEventListener('hashchange', route);
