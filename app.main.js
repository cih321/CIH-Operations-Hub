function setupTopbarLauncher(items){
  const btn = document.getElementById('appbtn');
  const panel = document.getElementById('apppanel');
  panel.innerHTML = items.map(a=>`<a class="tile" role="menuitem" href="${a.href}" tabindex="-1">
    <div class="ico" aria-hidden="true" style="font-size:22px">${a.icon}</div><div class="lbl">${a.label}</div></a>`).join('');
  let open=false;
  function setOpen(v){ open=v; panel.hidden=!v; btn.setAttribute('aria-expanded',String(v)); if(v) panel.querySelector('.tile')?.focus(); }
  btn.addEventListener('click',()=>setOpen(!open));
  document.addEventListener('keydown',e=>{ if(e.key==='Escape'&&open) setOpen(false); });
  document.addEventListener('click',e=>{ if(open && !panel.contains(e.target) && e.target!==btn) setOpen(false); });
}

/* Tiny utils */
function el(tag, cls){ const n=document.createElement(tag); if(cls) n.className=cls; return n; }
function fmtMoney(n){ return (n==null||n==='') ? '—' : `$${Number(n).toLocaleString()}`; }
function currentMonthlyCost(rentRows){
  const today = new Date().toISOString().slice(0,10);
  const row = rentRows.find(r => (!r.end || r.end >= today) && r.start <= today);
  return row ? row.monthly : null;
}
