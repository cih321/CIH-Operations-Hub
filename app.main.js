/* app.main.js
   - Top bar launcher (9-dot menu) with proper open/close behavior
   - Basic helpers shared by pages (el, fmtMoney, currentMonthlyCost)
*/

/* ---------------- Topbar App Launcher ---------------- */

function setupTopbarLauncher(items) {
  const btn   = document.getElementById('appbtn');
  const panel = document.getElementById('apppanel');
  if (!btn || !panel) return;

  // Render tiles
  panel.innerHTML = (items || [])
    .map(a => `
      <a class="tile" role="menuitem" href="${a.href}" tabindex="-1" data-id="${a.id}">
        <div class="ico" aria-hidden="true" style="font-size:22px">${a.icon || '⬜'}</div>
        <div class="lbl">${a.label}</div>
      </a>
    `)
    .join('');

  let open = false;

  function firstTile()  { return panel.querySelector('.tile'); }
  function tilesArray() { return Array.from(panel.querySelectorAll('.tile')); }

  function setOpen(v) {
    open = v;
    panel.hidden = !v;                               // <-- respect [hidden]
    btn.setAttribute('aria-expanded', String(v));
    if (v) {
      // Move focus into the panel for keyboard users
      const t = firstTile();
      if (t) t.focus();
    } else {
      // Return focus to the button
      btn.focus();
    }
  }

  // Toggle on button click
  btn.addEventListener('click', () => setOpen(!open));

  // Close on click outside
  document.addEventListener('click', (e) => {
    if (!open) return;
    const withinPanel = panel.contains(e.target);
    const isButton    = e.target === btn || btn.contains(e.target);
    if (!withinPanel && !isButton) setOpen(false);
  });

  // Keyboard interactions
  document.addEventListener('keydown', (e) => {
    if (!open) return;

    // Esc closes the panel
    if (e.key === 'Escape') {
      e.preventDefault();
      setOpen(false);
      return;
    }
  });

  // Arrow-key navigation within tiles
  panel.addEventListener('keydown', (e) => {
    const tiles = tilesArray();
    if (!tiles.length) return;

    const cols = 3; // matches CSS grid-template-columns
    const i = tiles.indexOf(document.activeElement);
    if (i === -1) return;

    const go = (idx) => { tiles[Math.max(0, Math.min(idx, tiles.length - 1))].focus(); };

    switch (e.key) {
      case 'ArrowRight': e.preventDefault(); go(i + 1); break;
      case 'ArrowLeft':  e.preventDefault(); go(i - 1); break;
      case 'ArrowDown':  e.preventDefault(); go(i + cols); break;
      case 'ArrowUp':    e.preventDefault(); go(i - cols); break;
      case 'Home':       e.preventDefault(); go(0); break;
      case 'End':        e.preventDefault(); go(tiles.length - 1); break;
      default: break;
    }
  });

  // Initialize closed
  setOpen(false);
}

// Expose for HTML pages to call
window.setupTopbarLauncher = setupTopbarLauncher;

/* ---------------- Small Helpers (shared) -------------- */

// Create element with class
function el(tag, cls) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  return n;
}

// Format money safely
function fmtMoney(n) {
  return (n == null || n === '') ? '—' : `$${Number(n).toLocaleString()}`;
}

// Pick current monthly cost from rent rows
function currentMonthlyCost(rentRows) {
  if (!Array.isArray(rentRows) || !rentRows.length) return null;
  const today = new Date().toISOString().slice(0, 10);
  const row = rentRows.find(r =>
    (!r.end || r.end >= today) && r.start <= today
  );
  return row ? row.monthly : null;
}

// Expose helpers globally (used by other scripts)
window.el = el;
window.fmtMoney = fmtMoney;
window.currentMonthlyCost = currentMonthlyCost;
