'use strict';
/* Portal 1INFO-2 — núcleo compartilhado: utilitários, tema, navegação e toast */

// ── Utilitários ──────────────────────────────────────────────
function toMins(time) {
  const [h, m] = String(time || '00:00').split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}
function pad(value) { return String(value).padStart(2, '0'); }
function toDateKey(date) { return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`; }
function parseDateKey(key) {
  const [y, m, d] = String(key).split('-').map(Number);
  return new Date(y, m - 1, d);
}
function escapeHtml(value) {
  return String(value || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[c]));
}
function formatSize(bytes) {
  if (!bytes) return 'arquivo';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ── Toast ────────────────────────────────────────────────────
function showToast(message, duration = 2400) {
  document.querySelector('.toast')?.remove();
  const el = document.createElement('div');
  el.className = 'toast';
  el.setAttribute('role', 'status');
  el.textContent = message;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), duration);
}

// ── Tema ─────────────────────────────────────────────────────
function setTheme(dark) {
  if (dark) document.documentElement.setAttribute('data-theme', 'dark');
  else document.documentElement.removeAttribute('data-theme');
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#0E0B09' : '#F3EDE6');
  try { localStorage.setItem('theme', dark ? 'dark' : 'light'); } catch (e) { /* modo privado */ }
}

// ── Navegação (única fonte: edite aqui para mudar em todas as páginas) ──
const ICON = {
  index: '<path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/><polyline points="9 21 9 12 15 12 15 21"/>',
  aulas: '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
  calendario: '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/>',
  onibus: '<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/><path d="M7 8h10M7 11h5"/>',
  horarios: '<path d="M16 21v-2a4 4 0 0 0-8 0v2"/><circle cx="12" cy="7" r="4"/>'
};
const NAV = [
  ['index', 'Portal'], ['aulas', 'Grade'], ['calendario', 'Calendário'], ['onibus', 'Ônibus'], ['horarios', 'Professores']
];

function buildChrome() {
  const page = document.body.dataset.page;
  const svg = p => `<svg viewBox="0 0 24 24" aria-hidden="true">${p}</svg>`;

  const top = document.createElement('header');
  top.className = 'topnav';
  top.innerHTML = `
    <a href="index.html" class="nav-brand">
      <span class="nav-logo"><svg viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg></span>
      <span class="nav-title">Portal</span><span class="nav-tag">1INFO-2</span>
    </a>
    <button class="theme-btn" type="button" aria-label="Alternar tema">
      <svg class="i-moon" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
      <svg class="i-sun" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
    </button>`;
  top.querySelector('.theme-btn').addEventListener('click', e => {
    const apply = () => setTheme(!document.documentElement.hasAttribute('data-theme'));
    // glass.js troca por uma revelação circular; sem ele, troca direto
    if (window.lgThemeTransition) window.lgThemeTransition(e, apply); else apply();
  });

  const dock = document.createElement('nav');
  dock.className = 'lg-dock';
  dock.setAttribute('aria-label', 'Navegação principal');
  dock.innerHTML = '<span class="lg-lens" aria-hidden="true"></span>' + NAV.map(([id, label]) =>
    `<a class="lg-dock-item" href="${id}.html"${id === page ? ' aria-current="page"' : ''}>${svg(ICON[id])}<span>${label}</span></a>`
  ).join('');

  document.body.prepend(top);
  document.body.appendChild(dock);
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content',
    document.documentElement.hasAttribute('data-theme') ? '#0E0B09' : '#F3EDE6');
}

buildChrome();
// sincroniza o tema entre abas abertas
addEventListener('storage', e => { if (e.key === 'theme') setTheme(e.newValue === 'dark'); });
