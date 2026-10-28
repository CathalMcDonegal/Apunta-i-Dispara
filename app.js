const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];

const OFFICIAL = {
  hunting: 'https://agricultura.gencat.cat/ca/ambits/medi-natural/casa/guia-cacador/periodes-habils-caca/',
  rules: 'https://agricultura.gencat.cat/ca/ambits/medi-natural/casa/normativa/',
  zones: 'https://agricultura.gencat.cat/ca/ambits/medi-natural/casa/terrenys-cinegetics/',
  dogc: 'https://dogc.gencat.cat/'
};

const species = [
  {name:'Senglar',icon:'🐗',type:'Caça major',start:'2026-06-01',end:'2027-05-31',note:'Períodes i modalitats segons terreny i PTGC.'},
  {name:'Cabirol',icon:'🦌',type:'Caça major',start:'2026-09-06',end:'2027-08-15',note:'Pot requerir permís segons modalitat i territori.'},
  {name:'Cérvol',icon:'🦌',type:'Caça major',start:'2026-09-13',end:'2027-02-28',note:'Permís i precinte en els supòsits previstos.'},
  {name:'Isard',icon:'🏔️',type:'Caça major',start:null,end:null,note:'Regulat segons reserves i zones de gestió pública.'},
  {name:'Cabra salvatge',icon:'🐐',type:'Caça major',start:'2026-10-11',end:'2027-05-31',note:'Permís i precinte en els supòsits previstos.'},
  {name:'Mufló',icon:'🐏',type:'Caça major',start:'2026-09-06',end:'2027-03-28',note:'Consulta el PTGC i la normativa aplicable al terreny.'},
  {name:'Gamo',icon:'🦌',type:'Caça major',start:'2026-09-06',end:'2027-03-28',note:'Consulta el PTGC i la normativa aplicable al terreny.'},
  {name:'Guineu',icon:'🦊',type:'Caça menor',start:'2026-09-06',end:'2027-03-28',note:'Hi ha limitacions territorials específiques.'},
  {name:'Conill',icon:'🐇',type:'Caça menor',start:'2026-10-11',end:'2027-02-07',note:'En determinats territoris pot tenir règims específics.'},
  {name:'Perdiu roja',icon:'🐦',type:'Caça menor',start:'2026-10-11',end:'2027-01-03',note:'Consulta també les limitacions de captures i terreny.'},
  {name:'Perdiu xerra de muntanya',icon:'🐦',type:'Caça menor',start:'2026-10-11',end:'2026-12-27',note:'Màxims i obligacions específiques segons la normativa.'},
  {name:'Tord comú',icon:'🐦',type:'Caça menor',start:'2026-10-11',end:'2027-02-14',note:'Període general de caça menor.'},
  {name:'Tord ala-roig',icon:'🐦',type:'Caça menor',start:'2026-10-11',end:'2027-02-14',note:'Període general de caça menor.'},
  {name:'Griva',icon:'🐦',type:'Caça menor',start:'2026-10-11',end:'2027-01-31',note:'Període general de caça menor.'},
  {name:'Becada',icon:'🐦',type:'Caça menor',start:'2026-10-11',end:'2027-02-07',note:'Màxims de captures i prohibició de caça a l’aguait.'},
  {name:'Becadell comú',icon:'🐦',type:'Caça menor',start:'2026-10-11',end:'2027-02-21',note:'Només en territoris autoritzats segons la resolució.'},
  {name:'Ànec collverd',icon:'🦆',type:'Caça menor',start:'2026-10-11',end:'2027-03-07',note:'Règim específic a les Terres de l’Ebre.'},
  {name:'Tudó',icon:'🕊️',type:'Caça menor',start:'2026-10-11',end:'2027-02-07',note:'Pot tenir règims territorials específics.'},
  {name:'Faisà',icon:'🪶',type:'Caça menor',start:'2026-10-11',end:'2027-02-07',note:'Consulta la regulació del terreny cinegètic.'}
];

const state = {
  screen: localStorage.getItem('aid_screen') || 'home',
  diary: JSON.parse(localStorage.getItem('aid_diary') || '[]'),
  points: JSON.parse(localStorage.getItem('aid_points') || '[]'),
  profile: JSON.parse(localStorage.getItem('aid_profile') || '{}'),
  coords: null,
  deferredInstall: null,
  map: null,
  marker: null
};

function save(key,value){ localStorage.setItem(key,JSON.stringify(value)); }
function escapeHtml(v){return String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
function toast(message){const el=$('#toast');el.textContent=message;el.classList.add('show');clearTimeout(window.__toast);window.__toast=setTimeout(()=>el.classList.remove('show'),2500);}
function today(){return new Date().toISOString().slice(0,10);}
function formatDate(v){if(!v)return '';const d=new Date(v+'T12:00:00');return new Intl.DateTimeFormat('ca-ES',{day:'2-digit',month:'2-digit',year:'numeric'}).format(d);}
function isOpen(s){const d=today();return !!(s.start&&s.end&&d>=s.start&&d<=s.end);}
function seasonLabel(s){if(!s.start||!s.end)return 'Consultar normativa';return isOpen(s)?'EN PERÍODE HÀBIL':'Fora de període';}

function go(screen){
  state.screen=screen;save('aid_screen',screen);
  $$('.screen').forEach(s=>s.classList.toggle('active',s.id===`screen-${screen}`));
  $$('.nav-item').forEach(n=>n.classList.toggle('active',n.dataset.screen===screen));
  window.scrollTo({top:0,behavior:'smooth'});
  if(screen==='diary')renderDiary();
  if(screen==='map')setTimeout(initMap,50);
  if(screen==='profile')loadProfile();
}
$$('[data-screen]').forEach(b=>b.addEventListener('click',()=>go(b.dataset.screen)));
$$('[data-go]').forEach(b=>b.addEventListener('click',()=>go(b.dataset.go)));

function renderStats(){
  $('#statDays').textContent=state.diary.length;
  $('#statCaptures').textContent=state.diary.reduce((n,d)=>n+(Number(d.captures)||0),0);
  $('#statKm').textContent=state.diary.reduce((n,d)=>n+(Number(d.km)||0),0).toFixed(1).replace('.',',');
}
function renderSpecies(filter=''){
  const q=filter.trim().toLowerCase();
  const list=species.filter(s=>!q||`${s.name} ${s.type} ${s.note}`.toLowerCase().includes(q));
  $('#speciesList').innerHTML=list.map(s=>`<article class="species-card"><div class="animal-icon">${s.icon}</div><div><b>${s.name}</b><small>${s.type}</small><small>${s.note}</small><span class="species-status ${isOpen(s)?'open':''}">${seasonLabel(s)}</span></div></article>`).join('');
}
function renderSeason(filter='Totes'){
  const list=species.filter(s=>filter==='Totes'||(filter==='Caça major'&&s.type==='Caça major')||(filter==='Caça menor'&&s.type==='Caça menor'));
  $('#seasonList').innerHTML=list.map(s=>`<article class="season-card"><div class="animal-icon">${s.icon}</div><div><b>${s.name}</b><small>${s.type}${s.start?` · ${formatDate(s.start)} → ${formatDate(s.end)}`:''}</small><small>${s.note}</small></div><span class="badge ${isOpen(s)?'open':''}">${seasonLabel(s)}</span></article>`).join('');
}
function renderDiary(){
  const list=$('#diaryList'),empty=$('#diaryEmpty');
  empty.style.display=state.diary.length?'none':'block';
  list.innerHTML=state.diary.slice().reverse().map((d,i)=>`<article class="diary-card"><div class="diary-top"><div><b>${escapeHtml(d.zone||'Jornada sense zona')}</b><small>${formatDate(d.date)} · ${escapeHtml(d.mode||'Modalitat no indicada')}</small></div><button class="delete-diary" data-delete="${state.diary.length-1-i}" aria-label="Eliminar jornada">×</button></div><div class="meta"><span>Captures: ${Number(d.captures)||0}</span><span>Km: ${(Number(d.km)||0).toFixed(1)}</span>${d.notes?`<span>${escapeHtml(d.notes)}</span>`:''}</div></article>`).join('');
  $$('.delete-diary').forEach(b=>b.addEventListener('click',()=>{state.diary.splice(Number(b.dataset.delete),1);save('aid_diary',state.diary);renderDiary();renderStats();toast('Jornada eliminada');}));
}
function openDiary(){
  $('#diaryDate').value=today();$('#diaryZone').value='';$('#diaryNotes').value='';$('#diaryMode').value='Espera';$('#diaryCaptures').value='0';$('#diaryKm').value='0';
  $('#diaryModal').classList.remove('hidden');$('#diaryModal').setAttribute('aria-hidden','false');
}
function closeDiary(){$('#diaryModal').classList.add('hidden');$('#diaryModal').setAttribute('aria-hidden','true');}
$('#newDiaryBtn').addEventListener('click',openDiary);$('#emptyNewDiary').addEventListener('click',openDiary);$('#closeDiary').addEventListener('click',closeDiary);
$('#diaryModal').addEventListener('click',e=>{if(e.target.id==='diaryModal')closeDiary();});
$('#saveDiaryBtn').addEventListener('click',()=>{
  const item={date:$('#diaryDate').value||today(),zone:$('#diaryZone').value.trim(),mode:$('#diaryMode').value,notes:$('#diaryNotes').value.trim(),captures:Number($('#diaryCaptures').value)||0,km:Number($('#diaryKm').value)||0};
  state.diary.push(item);save('aid_diary',state.diary);closeDiary();renderDiary();renderStats();toast('Jornada guardada');
});
$('#speciesSearch').addEventListener('input',e=>renderSpecies(e.target.value));
$$('.filter').forEach(b=>b.addEventListener('click',()=>{$$('.filter').forEach(x=>x.classList.remove('active'));b.classList.add('active');renderSeason(b.textContent.trim());}));

let watchId=null;
function updateLocation(pos){
  state.coords={lat:pos.coords.latitude,lon:pos.coords.longitude,accuracy:pos.coords.accuracy};
  $('#gpsStatus').textContent='Posició obtinguda';
  $('#gpsCoords').textContent=`${state.coords.lat.toFixed(6)}, ${state.coords.lon.toFixed(6)} · ±${Math.round(state.coords.accuracy)} m`;
  if(state.map){state.map.setView([state.coords.lat,state.coords.lon],14);if(state.marker)state.marker.setLatLng([state.coords.lat,state.coords.lon]);else state.marker=L.marker([state.coords.lat,state.coords.lon]).addTo(state.map).bindPopup('La teva posició');}
}
function getPosition(callback){
  if(!navigator.geolocation){toast('Aquest dispositiu no ofereix geolocalització');return;}
  $('#gpsStatus').textContent='Buscant posició…';
  navigator.geolocation.getCurrentPosition(p=>{updateLocation(p);if(callback)callback();toast('GPS actualitzat');},err=>{$('#gpsStatus').textContent='No s’ha pogut obtenir la posició';$('#gpsCoords').textContent=err.code===1?'Permís de localització denegat.':'Torna-ho a provar en un lloc amb millor senyal.';toast('No s’ha pogut obtenir el GPS');},{enableHighAccuracy:true,timeout:12000,maximumAge:30000});
}
$('#locateBtn').addEventListener('click',()=>getPosition(()=>loadWeather()));
$('#trackBtn')?.addEventListener('click',()=>{
  if(!navigator.geolocation){toast('GPS no disponible');return;}
  if(watchId){navigator.geolocation.clearWatch(watchId);watchId=null;$('#trackBtn').textContent='▶ Iniciar seguiment';toast('Seguiment aturat');return;}
  watchId=navigator.geolocation.watchPosition(updateLocation,()=>toast('Error de GPS'),{enableHighAccuracy:true,maximumAge:3000,timeout:10000});
  $('#trackBtn').textContent='■ Aturar seguiment';toast('Seguiment GPS actiu');
});
$('#savePointBtn').addEventListener('click',()=>{
  if(!state.coords){toast('Primer obtén la teva posició');return;}
  state.points.push({...state.coords,created:new Date().toISOString(),name:`Punt ${state.points.length+1}`});save('aid_points',state.points);renderPoints();toast('Punt guardat');
});
function renderPoints(){const el=$('#savedPointsText');el.textContent=state.points.length?`${state.points.length} punt${state.points.length===1?'':'s'} guardat${state.points.length===1?'':'s'}.`:'Encara no n’hi ha cap.';}

function initMap(){
  if(state.map||!window.L)return;
  state.map=L.map('leafletMap',{zoomControl:false}).setView([41.75,1.75],8);
  L.control.zoom({position:'bottomright'}).addTo(state.map);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap'}).addTo(state.map);
  if(state.coords)updateLocation({coords:state.coords});
}
$('#shareLocationBtn').addEventListener('click',async()=>{if(!state.coords){getPosition(()=>shareCoords());return;}shareCoords();});
async function shareCoords(){
  const text=`La meva ubicació — Apunta i Dispara: https://maps.google.com/?q=${state.coords.lat},${state.coords.lon}`;
  if(navigator.share){try{await navigator.share({title:'Ubicació — Apunta i Dispara',text});}catch{}}
  else if(navigator.clipboard){await navigator.clipboard.writeText(text);toast('Enllaç d’ubicació copiat');}
}

async function loadWeather(){
  if(!state.coords)return;
  const el=$('#weatherText');if(!el)return;el.textContent='Actualitzant…';
  try{
    const u=`https://api.open-meteo.com/v1/forecast?latitude=${state.coords.lat}&longitude=${state.coords.lon}&current=temperature_2m,wind_speed_10m,precipitation&daily=sunrise,sunset&timezone=auto`;
    const r=await fetch(u);if(!r.ok)throw new Error();
    const d=await r.json(),c=d.current;
    el.innerHTML=`<b>${Math.round(c.temperature_2m)}°C</b><span>Vent ${Math.round(c.wind_speed_10m)} km/h · Pluja ${Number(c.precipitation||0).toFixed(1)} mm</span><small>Sortida ${new Date(d.daily.sunrise[0]).toLocaleTimeString('ca-ES',{hour:'2-digit',minute:'2-digit'})} · Posta ${new Date(d.daily.sunset[0]).toLocaleTimeString('ca-ES',{hour:'2-digit',minute:'2-digit'})}</small>`;
  }catch{el.innerHTML='<small>No disponible ara. Comprova la connexió.</small>';}
}

$('#saveProfileBtn').addEventListener('click',()=>{
  state.profile={name:$('#profileName').value.trim(),license:$('#profileLicense').value.trim(),insurance:$('#profileInsurance').value.trim(),insuranceExpiry:$('#profileInsuranceExpiry').value};
  save('aid_profile',state.profile);toast('Perfil guardat');
});
function loadProfile(){$('#profileName').value=state.profile.name||'';$('#profileLicense').value=state.profile.license||'';$('#profileInsurance').value=state.profile.insurance||'';$('#profileInsuranceExpiry').value=state.profile.insuranceExpiry||'';}

window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();state.deferredInstall=e;$('#installBtn').classList.remove('hidden');});
$('#installBtn').addEventListener('click',async()=>{if(!state.deferredInstall)return;state.deferredInstall.prompt();await state.deferredInstall.userChoice;state.deferredInstall=null;$('#installBtn').classList.add('hidden');});
window.addEventListener('appinstalled',()=>toast('Apunta i Dispara instal·lada'));
if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
window.addEventListener('popstate',()=>go('home'));
function boot(){renderStats();renderPoints();renderSpecies();renderSeason();renderDiary();loadProfile();go(state.screen);const current=species.filter(s=>isOpen(s)).length;$('#seasonSummary').textContent=`${current} espècies amb període hàbil avui`;}
boot();