// Small UI helpers: escaping, icons, badges, date formatting.
export const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const ICONS = {
  alert: '<path d="M12 9v4M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0zM12 17h.01"/>',
  minus: '<path d="M5 12h14"/>',
  down: '<path d="M12 5v14M18 13l-6 6-6-6"/>',
  dot: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="1"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/>',
  check: '<circle cx="12" cy="12" r="9"/><path d="M9 12l2 2 4-4"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
  right: '<path d="M9 6l6 6-6 6"/>',
  left: '<path d="M15 6l-6 6 6 6"/>',
  chevron: '<path d="M6 9l6 6 6-6"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/>'
};
export const icon = (name, size = 16) =>
  `<svg class="icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${ICONS[name]}</svg>`;

const PRIORITY_ICON = { High: 'alert', Medium: 'minus', Low: 'down' };
const STATUS_ICON = { 'New': 'dot', 'In progress': 'clock', 'Resolved': 'check' };
export const priorityIcon = (p) => PRIORITY_ICON[p];
export const statusIcon = (s) => STATUS_ICON[s];
const slug = (s) => s.toLowerCase().replace(/\s+/g, '-');
export const priorityBadge = (p) => `<span class="badge badge--${slug(p)}">${icon(PRIORITY_ICON[p], 14)}${esc(p)}</span>`;
export const statusBadge = (s) => `<span class="badge badge--${slug(s)}">${icon(STATUS_ICON[s], 14)}${esc(s)}</span>`;

export function formatReceived(iso) {
  const d = new Date(iso);
  const time = d.toLocaleTimeString('en-CA', { hour: 'numeric', minute: '2-digit' }).replace(/\s/g, ' ').toLowerCase().replace(/\./g, '');
  const start = (x) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const days = Math.round((start(new Date()) - start(d)) / 86400000);
  if (days === 0) return `Today, ${time}`;
  if (days === 1) return `Yesterday, ${time}`;
  return `${d.toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })}, ${time}`;
}
