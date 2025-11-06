/* ---- Global Reset ------------------------------------------------------ */
* { box-sizing: border-box; }

html, body {
  margin: 0; padding: 0;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, sans-serif;
  background: #fafafa; color: #111;
}

/* Keep content below the fixed top bar */
body { padding-top: 60px; }

/* ---- Top Navigation Bar ------------------------------------------------ */
.topbar{
  position:fixed; inset:0 0 auto 0; height:60px;
  display:flex; align-items:center; justify-content:space-between;
  padding:0 16px; background:#f3f4f6; border-bottom:1px solid #e5e7eb;
  box-shadow:0 2px 8px rgba(0,0,0,.06); z-index:1000;
}
.brand{ font-weight:600; color:#111; text-decoration:none; }
.brand:hover{ text-decoration:underline; }

/* ---- Launcher Button & Panel ------------------------------------------ */
.launcher{
  display:grid; place-items:center; border:none; background:transparent;
  padding:6px; cursor:pointer; border-radius:8px;
}
.launcher:hover{ background:rgba(0,0,0,.05); }
.launcher:focus{ outline:2px solid #2563eb; outline-offset:2px; }

.panel{
  position:absolute; top:56px; right:12px; width:320px; max-height:70vh; overflow-y:auto;
  background:#fff; border:1px solid #e5e7eb; border-radius:14px;
  box-shadow:0 12px 24px rgba(0,0,0,.12); padding:12px; z-index:1100;
}
.panel[hidden]{ display:none !important; }
.panel:not([hidden]){ display:grid; grid-template-columns:repeat(3,1fr); gap:8px; }

.tile{
  display:flex; flex-direction:column; align-items:center; justify-content:center;
  padding:10px; text-decoration:none; border-radius:10px; color:#111; font-size:14px;
}
.tile:hover,.tile:focus{ background:#f3f4f6; outline:none; }
.tile .ico{ font-size:22px; margin-bottom:6px; }

/* ---- Page Layout ------------------------------------------------------- */
.page{ max-width:1200px; margin:0 auto; padding:24px 16px; }
.page-title{ margin:0 0 16px 4px; font-size:22px; font-weight:700; }

/* ---- Facilities Grid & Card ------------------------------------------- */
.grid2{ display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:24px; }
@media (max-width:900px){ .grid2{ grid-template-columns:1fr; } }

/* New card look: big radius, soft shadow, fixed height */
.card{
  position:relative;
  background:#ffffff;
  border:1px solid #eceff3;
  border-radius:20px;
  box-shadow:0 10px 20px rgba(17,24,39,0.06);
  height:280px;                /* FIXED HEIGHT */
  padding:0; overflow:hidden; display:flex; flex-direction:column;
}

/* thin color line at top (you can vary per region/status) */
.card .colorbar{ height:6px; background:#c7d2fe; } /* indigo-200 */

/* inner padding and layout */
.card .card-body{ padding:16px; display:flex; flex-direction:column; gap:10px; }

/* header: community/state bold like the screenshot title style */
.card .card-title{
  font-size:18px; font-weight:800; letter-spacing:-0.01em;
}

.card .meta{
  display:grid; grid-template-columns:1fr; gap:6px;
  color:#374151; font-size:14px;
}
.card .meta .line{ display:flex; gap:8px; align-items:center; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.card .meta .label{ font-family:ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; color:#6b7280; }

/* pill row like small chips */
.pills{ display:flex; gap:8px; flex-wrap:wrap; margin-top:4px; }
.pill{
  background:#eef2ff; border:1px solid #dfe3ff; color:#1f2a7a;
  padding:4px 10px; font-size:12px; border-radius:999px; font-weight:600;
}

/* footer button anchored to bottom to keep heights equal */
.card-footer{
  margin-top:auto; padding:12px 16px; display:flex; justify-content:flex-end;
  background:linear-gradient(to top, rgba(0,0,0,0.02), rgba(0,0,0,0));
}

/* primary button */
.btn{
  background:#2563eb; color:#fff; border:none; border-radius:10px; padding:10px 14px;
  cursor:pointer; font-weight:600;
}
.btn:hover{ filter:brightness(.95); }

/* monospace helper for small values */
.mono{ font-family:ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }

/* ---- Modal & Tabs (unchanged from earlier) ---------------------------- */
.modal{ position:fixed; inset:0; background:rgba(0,0,0,.25); display:flex; align-items:center; justify-content:center; z-index:1200; }
.modal-card{ width:min(1200px,90vw); height:min(90vh,1000px); background:#fff; border-radius:14px; box-shadow:0 20px 40px rgba(0,0,0,.2); display:flex; flex-direction:column; }
.modal-head{ display:flex; align-items:center; justify-content:space-between; padding:14px 16px; border-bottom:1px solid #e5e7eb; position:sticky; top:0; background:#fff; z-index:1; }
.modal-title{ display:flex; flex-direction:column; gap:2px; }
.subtitle{ color:#6b7280; font-size:12px; }
.iconbtn{ border:none; background:transparent; cursor:pointer; font-size:18px; }

.tabs{ display:flex; gap:8px; padding:8px 12px; border-bottom:1px solid #e5e7eb; position:sticky; top:52px; background:#fff; z-index:1; }
.tab{ background:transparent; border:none; padding:8px 10px; border-radius:8px; cursor:pointer; }
.tab.active{ background:#f3f4f6; }
.tabpanes{ padding:12px 16px; overflow:auto; }
.tabpane{ display:none; }
.tabpane.active{ display:block; }

.kv{ display:grid; grid-template-columns:220px 1fr; gap:10px; align-items:start; margin:8px 0; }
.kv label{ color:#6b7280; }
.prewrap{ white-space:pre-wrap; }
.facts{ display:grid; grid-template-columns:repeat(3,1fr); gap:12px; }
.table{ width:100%; border-collapse:collapse; }
.table th,.table td{ border-bottom:1px solid #e5e7eb; padding:8px; }
.utilgrid{ display:grid; grid-template-columns:repeat(3,1fr); gap:12px; }
.util{ border:1px solid #e5e7eb; border-radius:10px; padding:10px; }
.logbar{ display:flex; gap:8px; margin-bottom:8px; }
.input{ padding:8px; border:1px solid #e5e7eb; border-radius:8px; width:100%; }
.loglist{ list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:8px; }
.logitem{ border:1px solid #e5e7eb; border-radius:10px; padding:10px; }
.chiplist{ display:flex; gap:8px; flex-wrap:wrap; }
.filelist{ list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:6px; }

/* Home hero placeholder */
.hero-blank{ display:grid; place-items:center; margin-top:40px; text-align:center; }
