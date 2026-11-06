// Data layer: inquiries live in localStorage (no backend). Falls back to memory if storage is blocked.
export const STATUSES = ['New', 'In progress', 'Resolved'];
export const PRIORITIES = ['High', 'Medium', 'Low'];
export const ASSIGNEES = ['Unassigned', 'Lee Park', 'Mia Chen'];
const KEY = 'inquiryManager.v1';
const H = 3600 * 1000;

function seed() {
  const now = Date.now();
  const mk = (id, name, phone, email, message, priority, status, assignee, ago) =>
    ({ id, name, phone, email, message, priority, status, assignee, createdAt: new Date(now - ago).toISOString() });
  return [
    mk('i1', 'Dana Whitfield', '555 0142', 'dana.whitfield@example.com', 'Order #1043 has not shipped yet. Could you tell me when it will arrive?', 'High', 'New', 'Unassigned', 2 * H),
    mk('i2', 'Marcus Bell', '555 0177', 'marcus.bell@example.com', 'Is the walnut shelf available in a 120 cm width? I need it before the end of the month.', 'High', 'In progress', 'Lee Park', 5 * H),
    mk('i3', 'Sam Okoye', '555 0123', '', 'Can I change the delivery address on my order? I moved last week.', 'Medium', 'In progress', 'Lee Park', 26 * H),
    mk('i4', 'Ana Torres', '555 0191', 'ana.torres@example.com', 'Do you ship to Newfoundland, and what does it cost?', 'Medium', 'New', 'Unassigned', 3 * H),
    mk('i5', 'Jo Martin', '555 0108', '', 'Is gift wrapping available for the cedar boxes?', 'Low', 'New', 'Unassigned', 6 * H),
    mk('i6', 'Reza Haddad', '555 0165', 'reza.haddad@example.com', 'What is the return window for sale items?', 'Low', 'In progress', 'Mia Chen', 48 * H),
    mk('i7', 'Lena Fischer', '555 0134', '', 'Do you have the blue ceramic planter in stock?', 'Medium', 'Resolved', 'Mia Chen', 72 * H)
  ];
}

let memory = null;
function read() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) { const data = JSON.parse(raw); if (Array.isArray(data)) return data; }
  } catch (e) { /* storage blocked or corrupt: fall through */ }
  return memory;
}
function write(list) {
  memory = list;
  try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) { /* keep in memory only */ }
}

let inquiries = read();
if (!inquiries) { inquiries = seed(); write(inquiries); }

export const getAll = () => inquiries.slice();
export const get = (id) => inquiries.find((q) => q.id === id) || null;

export function add({ name, phone, email, message, priority, assignee }) {
  const q = {
    id: 'i' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    name: name.trim(), phone: phone.trim(), email: (email || '').trim(), message: message.trim(),
    priority, status: 'New', assignee, createdAt: new Date().toISOString()
  };
  inquiries = [q, ...inquiries];
  write(inquiries);
  return q;
}

export function update(id, patch) {
  inquiries = inquiries.map((q) => (q.id === id ? { ...q, ...patch } : q));
  write(inquiries);
  return get(id);
}
