async function initFacilitiesPage(){
  const grid = document.getElementById('facGrid');
  const facs = await API.listFacilities();

  for(const f of facs){
    const rentRows = await API.listRentPeriods(f.id);
    const cost = currentMonthlyCost(rentRows);

    const card = el('article','card');
    const color = el('div','colorbar'); card.appendChild(color);

    const hdr = el('div','row');
    const name = el('div'); name.innerHTML = `<strong>${f.community}, ${f.state}</strong>`;
    hdr.appendChild(name); card.appendChild(hdr);

    const meta = el('div','kvrow');
    meta.innerHTML = `
      <div>📍 <span class="mono">Building ID:</span> ${f.buildingId||'—'}</div>
      <div>🏠 <span class="mono">Street:</span> ${f.street||'—'}</div>
      <div>📡 <span class="mono">GPS:</span> ${f.gps||'—'}</div>`;
    card.appendChild(meta);

    const pills = el('div','pills');
    pills.innerHTML = `
      <span class="pill">Status: ${f.status||'—'}</span>
      <span class="pill">Ownership: ${f.ownership?.building||'—'}</span>
      <span class="pill">Monthly: ${fmtMoney(cost)}</span>`;
    card.appendChild(pills);

    const btn = el('div'); btn.style.marginTop='auto';
    btn.innerHTML = `<button class="btn">Open Card</button>`;
    btn.querySelector('button').addEventListener('click',()=>openFacilityModal(f.id));
    card.appendChild(btn);

    grid.appendChild(card);
  }
}

/* MODAL + TABS */
const modal = {
  root: null, title:null, subtitle:null, closeBtn:null,
  currentId:null
};

function wireModal(){
  modal.root = document.getElementById('facilityModal');
  modal.title = document.getElementById('modaltitle');
  modal.subtitle = document.getElementById('modalSubtitle');
  modal.closeBtn = document.getElementById('modalClose');
  modal.closeBtn.addEventListener('click', closeModal);
  modal.root.addEventListener('click', e=>{ if(e.target===modal.root) closeModal(); });

  document.querySelectorAll('.tab').forEach(t=>{
    t.addEventListener('click', ()=>{
      document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));
      document.querySelectorAll('.tabpane').forEach(x=>x.classList.remove('active'));
      t.classList.add('active');
      document.getElementById('tab-'+t.dataset.tab).classList.add('active');
    });
  });

  // Wire Ownership actions
  document.getElementById('rentAddBtn').addEventListener('click', onAddRentRow);
  document.getElementById('leaseUploadBtn').addEventListener('click', onLeaseUpload);

  // Log
  document.getElementById('logAddBtn').addEventListener('click', onAddLog);
  document.getElementById('logSearch').addEventListener('input', onSearchLog);

  // Utilities
  document.getElementById('utilAddBtn').addEventListener('click', onAddUtility);

  // Access
  document.getElementById('accessAddBtn').addEventListener('click', onAddAccess);
}
wireModal();

async function openFacilityModal(facilityId){
  modal.currentId = facilityId;
  const f = await API.getFacility(facilityId);
  modal.title.textContent = `${f.community}, ${f.state}`;
  modal.subtitle.textContent = f.buildingId ? `Building ID: ${f.buildingId}` : '';
  // reset to Overview tab
  document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));
  document.querySelectorAll('.tabpane').forEach(x=>x.classList.remove('active'));
  document.querySelector('.tab[data-tab="overview"]').classList.add('active');
  document.getElementById('tab-overview').classList.add('active');
  // fill overview
  fillOverview(f);
  // fill ownership
  fillOwnership(f);
  // utilities
  renderUtilities(facilityId);
  // access
  renderAccess(facilityId);
  // log
  renderLog(facilityId);

  document.getElementById('facilityModal').hidden = false;
  document.getElementById('modalClose').focus();
}
function closeModal(){ document.getElementById('facilityModal').hidden = true; }

/* ---- Fillers ---- */
function fillOverview(f){
  setText('ov-status', f.status||'—');
  setText('ov-street', f.street||'—');
  setText('ov-mail', f.mailing||'—');
  setText('ov-gps', f.gps||'—');
  setLinkOrDash('ov-onedrive', f.onedrive);
  setText('ov-year', f.facts?.year ?? '—');
  setText('ov-sqft', f.facts?.sqft ?? '—');
  setText('ov-type', f.facts?.type ?? '—');
  setText('ov-liaison-name', f.liaison?.name ?? '—');
  setLinkOrDash('ov-liaison-email', f.liaison?.email ? `mailto:${f.liaison.email}` : '');
  setLinkOrDash('ov-liaison-phone', f.liaison?.phone ? `tel:${f.liaison.phone}` : '');
  setText('ov-notes', f.notes||'');
}

async function fillOwnership(f){
  setText('own-building', f.ownership?.building ?? '—');
  setText('own-land',     f.ownership?.land ?? '—');
  setText('own-landlord', f.ownership?.landlord || '—');
  setText('own-notes', f.ownership?.notes || '');

  const tbody = document.querySelector('#rentTable tbody');
  tbody.innerHTML = '';
  const rows = await API.listRentPeriods(f.id);
  rows.forEach(r=>{
    const tr = el('tr');
    tr.innerHTML = `
      <td>${r.start||'—'}</td>
      <td>${r.end||'—'}</td>
      <td>${fmtMoney(r.monthly)}</td>
      <td><button class="iconbtn" data-id="${r.id}" data-act="edit">✏️</button>
          <button class="iconbtn" data-id="${r.id}" data-act="del">🗑️</button></td>`;
    tbody.appendChild(tr);
  });
  tbody.addEventListener('click', async (e)=>{
    const b=e.target.closest('button'); if(!b) return;
    const id=b.dataset.id, act=b.dataset.act;
    if(act==='del'){ await API.deleteRentPeriod(id); fillOwnership(f); refreshGridPill(f.id); }
    if(act==='edit'){
      const start=prompt('Start (YYYY-MM-DD):'); if(start===null) return;
      const end=prompt('End (YYYY-MM-DD or blank for none):',''); if(end===null) return;
      const monthly=parseFloat(prompt('Monthly rent:', '0')||'0');
      await API.updateRentPeriod(id,{ start, end:end||null, monthly }); fillOwnership(f); refreshGridPill(f.id);
    }
  }, { once:true });

  // lease uploads
  const files = await API.listLeaseFiles(f.id);
  const ul = document.getElementById('leaseUploads');
  ul.innerHTML = files.map(fi=>`<li><a href="${fi.data}" download="${fi.name}">${fi.name}</a></li>`).join('') || '<li>None</li>';
}

async function renderUtilities(fid){
  const cont = document.getElementById('utilCards');
  cont.innerHTML = '';
  const list = await API.listUtilities(fid);
  list.forEach(u=>{
    const c = el('div','util');
    c.innerHTML = `<strong>${u.type}</strong>
      <div><label>Provider</label> ${u.provider||'—'}</div>
      <div><label>Account</label> ${u.account||'—'}</div>
      <div><label>Meter</label> ${u.meter||'—'}</div>
      <div><label>Start</label> ${u.start||'—'}</div>
      <div><label>Avg $/mo</label> ${u.avg??'—'}</div>
      <div><label>Notes</label> ${u.notes||''}</div>
      <div style="margin-top:6px">
        <button class="btn btn-sm" data-id="${u.id}" data-act="edit">Edit</button>
        <button class="btn btn-sm" data-id="${u.id}" data-act="del" style="background:#ef4444">Delete</button>
      </div>`;
    cont.appendChild(c);
  });
  cont.addEventListener('click', async (e)=>{
    const b=e.target.closest('button'); if(!b) return;
    const id=b.dataset.id, act=b.dataset.act;
    if(act==='del'){ await API.deleteUtility(id); renderUtilities(fid); }
    if(act==='edit'){
      const type=prompt('Type (Electric/Water/Gas/Propane/Sewer/Trash/Internet):'); if(type===null) return;
      const provider=prompt('Provider:'); if(provider===null) return;
      const account=prompt('Account #:'); if(account===null) return;
      const meter=prompt('Meter/Service ID:','')||'';
      const start=prompt('Service Start (YYYY-MM-DD):','')||'';
      const avg=parseFloat(prompt('Average $/mo:', '0')||'0');
      const notes=prompt('Notes:','')||'';
      await API.updateUtility(id,{type,provider,account,meter,start,avg,notes}); renderUtilities(fid);
    }
  }, { once:true });
}

async function renderAccess(fid){
  const tbody = document.querySelector('#accessTable tbody');
  tbody.innerHTML = '';
  const list = await API.listAccess(fid);
  list.forEach(a=>{
    const tr = el('tr');
    tr.innerHTML = `<td>${a.person}</td><td>${a.type}</td><td>${a.areas||''}</td>
      <td>${a.issued||''}</td><td>${a.reviewed||''}</td>
      <td><button class="iconbtn" data-id="${a.id}" data-act="edit">✏️</button>
          <button class="iconbtn" data-id="${a.id}" data-act="del">🗑️</button></td>`;
    tbody.appendChild(tr);
  });
  tbody.addEventListener('click', async (e)=>{
    const b=e.target.closest('button'); if(!b) return;
    const id=b.dataset.id, act=b.dataset.act;
    if(act==='del'){ await API.deleteAccess(id); renderAccess(fid); }
    if(act==='edit'){
      const person=prompt('Person:'); if(person===null) return;
      const type=prompt('Access Type (Key/Fob/Keypad/Door Group):'); if(type===null) return;
      const areas=prompt('Areas/Doors:','')||'';
      const issued=prompt('Issued (YYYY-MM-DD):','')||'';
      const reviewed=prompt('Reviewed (YYYY-MM-DD):','')||'';
      await API.updateAccess(id,{person,type,areas,issued,reviewed}); renderAccess(fid);
    }
  }, { once:true });
}

async function renderLog(fid, q){
  const list = q ? await API.searchLog(fid, q) : await API.listLog(fid);
  const ul = document.getElementById('logList');
  ul.innerHTML = '';
  list.forEach(l=>{
    const li = el('li','logitem');
    const when = new Date(l.when).toLocaleString();
    li.innerHTML = `<div><strong>${l.type}</strong> • ${l.title||''}</div>
      <div class="muted">${when}</div>
      <div class="prewrap" style="margin-top:6px">${l.desc||''}</div>
      ${l.files?.length? `<div style="margin-top:6px">${l.files.map(f=>`<a href="${f.data}" download="${f.name}">📎 ${f.name}</a>`).join(' ')}</div>`:''}`;
    ul.appendChild(li);
  });
}

/* ---- Actions ---- */
async function onAddRentRow(){
  const f = await API.getFacility(modal.currentId);
  const start=prompt('Start (YYYY-MM-DD):'); if(start===null) return;
  const end=prompt('End (YYYY-MM-DD or blank):',''); if(end===null) return;
  const monthly=parseFloat(prompt('Monthly rent:', '0')||'0');
  await API.addRentPeriod(f.id,{ start, end:end||null, monthly });
  fillOwnership(f); refreshGridPill(f.id);
}
async function onLeaseUpload(){
  const f = await API.getFacility(modal.currentId);
  const file = document.getElementById('leaseFile').files[0];
  if(!file) return alert('Choose a file first.');
  await API.uploadLeaseFile(f.id, file);
  fillOwnership(f);
}
async function onAddUtility(){
  const fid = modal.currentId;
  const type=prompt('Type (Electric/Water/Gas/Propane/Sewer/Trash/Internet):'); if(type===null) return;
  const provider=prompt('Provider:'); if(provider===null) return;
  const account=prompt('Account #:','')||'';
  const meter=prompt('Meter/Service ID:','')||'';
  const start=prompt('Service Start (YYYY-MM-DD):','')||'';
  const avg=parseFloat(prompt('Average $/mo:', '0')||'0');
  const notes=prompt('Notes:','')||'';
  await API.addUtility(fid,{type,provider,account,meter,start,avg,notes});
  renderUtilities(fid);
}
async function onAddAccess(){
  const fid = modal.currentId;
  const person=prompt('Person:'); if(person===null) return;
  const type=prompt('Access Type (Key/Fob/Keypad/Door Group):'); if(type===null) return;
  const areas=prompt('Areas/Doors:','')||'';
  const issued=prompt('Issued (YYYY-MM-DD):','')||'';
  const reviewed=prompt('Reviewed (YYYY-MM-DD):','')||'';
  await API.addAccess(fid,{person,type,areas,issued,reviewed});
  renderAccess(fid);
}
async function onAddLog(){
  const fid = modal.currentId;
  const type=prompt('Type (Maintenance/Inspection/Incident/Delivery/Other):'); if(type===null) return;
  const title=prompt('Title:','')||'';
  const desc=prompt('Description:','')||'';
  const when=new Date().toISOString();
  const rec = await API.addLog(fid,{ type, title, desc, when });
  renderLog(fid);
}
function onSearchLog(e){ renderLog(modal.currentId, e.target.value); }

/* helpers */
function setText(id,val){ document.getElementById(id).textContent = (val==null||val==='') ? '—' : val; }
function setLinkOrDash(id, href){
  const elx = document.getElementById(id); elx.innerHTML='';
  if(href){ const a=document.createElement('a'); a.href=href; a.textContent = href.startsWith('mailto:')||href.startsWith('tel:')? href.split(':')[1] : 'Open'; a.target="_blank"; elx.appendChild(a); }
  else elx.textContent='—';
}
async function refreshGridPill(fid){
  // quick refresh of monthly pill by re-rendering grid (simple for now)
  document.getElementById('facGrid').innerHTML=''; initFacilitiesPage();
}
