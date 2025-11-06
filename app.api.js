/* API interface — keep shapes stable so you can swap to a real server later. */
const API = {
  listFacilities, getFacility, saveFacility,
  listRentPeriods, addRentPeriod, updateRentPeriod, deleteRentPeriod,
  listUtilities, addUtility, updateUtility, deleteUtility,
  listAccess, addAccess, updateAccess, deleteAccess,
  listLog, addLog, searchLog,
  uploadLeaseFile, listLeaseFiles,
};

/* ---- Mock implementation (localStorage) ---- */
const DBKEY = 'cih_ops_mock_v1';

function loadDB(){
  const raw = localStorage.getItem(DBKEY);
  if(raw) return JSON.parse(raw);
  // Seed sample data (edit freely)
  const seed = {
    facilities: [
      {
        id:'fac-001',
        community:'Flagstaff', state:'AZ', buildingId:'MTV-CLIN-01',
        street:'123 Pine Ave', mailing:'PO Box 77, Flagstaff, AZ 86001',
        gps:'35.1983,-111.6513', status:'Active',
        onedrive:'https://example.com/onedrive/fac-001',
        facts:{ year:1998, sqft:4820, type:'Clinic' },
        liaison:{ name:'Monica Alvarez', email:'monica@example.org', phone:'928-555-0199' },
        notes:'Primary clinic near downtown.',
        ownership:{ building:'Leased', land:'N/A', landlord:'Canyon Properties, LLC', notes:'' },
      },
      {
        id:'fac-002',
        community:'Tuba City', state:'AZ', buildingId:'TBC-OFF-02',
        street:'88 Hogan Rd', mailing:'Same as street',
        gps:'36.1333,-111.2397', status:'Active',
        onedrive:'', facts:{ year:2007, sqft:3600, type:'Office' },
        liaison:{ name:'Ray Yazzie', email:'ray@example.org', phone:'928-555-3377' },
        notes:'',
        ownership:{ building:'Owned', land:'Owned', landlord:'', notes:'' },
      },
    ],
    rent: [
      { id:'r1', facilityId:'fac-001', start:'2024-01-01', end:'2024-12-31', monthly:3350 },
      { id:'r2', facilityId:'fac-001', start:'2025-01-01', end:null,          monthly:3450 },
    ],
    utilities: [
      { id:'u1', facilityId:'fac-001', type:'Electric', provider:'APS', account:'123-456', meter:'E-778', start:'2023-01-01', avg:210, notes:'' },
      { id:'u2', facilityId:'fac-001', type:'Internet', provider:'CenturyLink', account:'CL-9982', meter:'', start:'2023-01-01', avg:95, notes:'50/10 Mbps' },
    ],
    access: [
      { id:'a1', facilityId:'fac-001', person:'Dana Nguyen', type:'Key', areas:'Front, Office', issued:'2024-02-10', reviewed:'2025-01-10' },
    ],
    log: [
      { id:'l1', facilityId:'fac-001', when:'2025-02-14T10:22:00Z', type:'Maintenance', title:'HVAC filter replaced', desc:'Changed MERV-13 filters.', files:[] },
    ],
    leaseFiles: [
      // { id:'f1', facilityId:'fac-001', name:'Lease-2025.pdf', data: 'data:...base64...' }
    ]
  };
  localStorage.setItem(DBKEY, JSON.stringify(seed));
  return seed;
}
function saveDB(db){ localStorage.setItem(DBKEY, JSON.stringify(db)); }
function db(){ return loadDB(); }
function uid(p){ return p + Math.random().toString(36).slice(2,9); }

/* Facilities */
async function listFacilities(){ return db().facilities; }
async function getFacility(id){ return db().facilities.find(f=>f.id===id)||null; }
async function saveFacility(fac){
  const d=db(); const i=d.facilities.findIndex(x=>x.id===fac.id);
  if(i>=0) d.facilities[i]=fac; else d.facilities.push(fac);
  saveDB(d); return fac;
}

/* Rent periods */
async function listRentPeriods(fid){ return db().rent.filter(r=>r.facilityId===fid); }
async function addRentPeriod(fid, row){ const d=db(); const rec={ id:uid('r'), facilityId:fid, ...row }; d.rent.push(rec); saveDB(d); return rec; }
async function updateRentPeriod(id, patch){ const d=db(); const i=d.rent.findIndex(r=>r.id===id); if(i<0) return null; d.rent[i]={...d.rent[i],...patch}; saveDB(d); return d.rent[i]; }
async function deleteRentPeriod(id){ const d=db(); d.rent=d.rent.filter(r=>r.id!==id); saveDB(d); }

/* Utilities */
async function listUtilities(fid){ return db().utilities.filter(u=>u.facilityId===fid); }
async function addUtility(fid,row){ const d=db(); const rec={ id:uid('u'), facilityId:fid, ...row }; d.utilities.push(rec); saveDB(d); return rec; }
async function updateUtility(id,patch){ const d=db(); const i=d.utilities.findIndex(x=>x.id===id); if(i<0) return null; d.utilities[i]={...d.utilities[i],...patch}; saveDB(d); return d.utilities[i]; }
async function deleteUtility(id){ const d=db(); d.utilities=d.utilities.filter(x=>x.id!==id); saveDB(d); }

/* Access */
async function listAccess(fid){ return db().access.filter(a=>a.facilityId===fid); }
async function addAccess(fid,row){ const d=db(); const rec={ id:uid('a'), facilityId:fid, ...row }; d.access.push(rec); saveDB(d); return rec; }
async function updateAccess(id,patch){ const d=db(); const i=d.access.findIndex(x=>x.id===id); if(i<0) return null; d.access[i]={...d.access[i],...patch}; saveDB(d); return d.access[i]; }
async function deleteAccess(id){ const d=db(); d.access=d.access.filter(x=>x.id!==id); saveDB(d); }

/* Log */
async function listLog(fid){ return db().log.filter(l=>l.facilityId===fid).sort((a,b)=>b.when.localeCompare(a.when)); }
async function addLog(fid,row){ const d=db(); const rec={ id:uid('l'), facilityId:fid, files:[], ...row }; d.log.push(rec); saveDB(d); return rec; }
async function searchLog(fid, q){ q=q.trim().toLowerCase(); return (await listLog(fid)).filter(l=> (l.title+l.desc).toLowerCase().includes(q)); }

/* Files (simple data-url store for prototype) */
async function uploadLeaseFile(fid, file){
  const d=db();
  const reader = await fileToDataURL(file);
  const rec = { id:uid('f'), facilityId:fid, name:file.name, data:reader };
  d.leaseFiles.push(rec); saveDB(d); return rec;
}
async function listLeaseFiles(fid){ return db().leaseFiles.filter(f=>f.facilityId===fid); }

function fileToDataURL(file){
  return new Promise(res=>{ const r=new FileReader(); r.onload=()=>res(r.result); r.readAsDataURL(file); });
}

/* Expose */
window.API = API;

/* ---- HOW TO SWAP TO REAL SERVER LATER ----
Create app.api.http.js that exports the same API functions using fetch():
  async function listFacilities(){ return fetch('/api/facilities').then(r=>r.json()); }
Then replace the <script src="app.api.js"> tag with your server version.
No UI changes required.
------------------------------------------- */
