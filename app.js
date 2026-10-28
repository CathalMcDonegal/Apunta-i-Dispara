const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];

const species = [
  {name:'Senglar',icon:'🐗',type:'Caça major',note:'Ungulat. La normativa i els períodes varien segons temporada i modalitat.'},
  {name:'Cabirol',icon:'🦌',type:'Caça major',note:'Consulta períodes, sexes i modalitats autoritzades abans de la jornada.'},
  {name:'Guineu',icon:'🦊',type:'Caça menor',note:'Espècie cinegètica subjecta a la normativa vigent.'},
  {name:'Conill',icon:'🐇',type:'Caça menor',note:'Consulta les dates i les limitacions de cada temporada.'},
  {name:'Perdiu',icon:'🐦',type:'Caça menor',note:'Espècie de caça menor. Revisa sempre la regulació aplicable.'},
  {name:'Faisà',icon:'🪶',type:'Caça menor',note:'La seva caça pot estar sotmesa a condicions específiques.'},
  {name:'Tord',icon:'🐦',type:'Caça menor',note:'Consulta períodes hàbils i limitacions de captura.'},
  {name:'Colom',icon:'🕊️',type:'Caça menor',note:'Les modalitats i períodes depenen de la normativa vigent.'}
];

const state = {
  screen: localStorage.getItem('aid_screen') || 'home',
  diary: JSON.parse(localStorage.getItem('aid_diary') || '[]'),
  points: JSON.parse(localStorage.getItem('aid_points') || '[]'),
  profile: JSON.parse(localStorage.getItem('aid_profile') || '{}'),
  coords: null,
  deferredInstall: null
};

function save(key, value){ localStorage.setItem(key, JSON.stringify(value)); }
function toast(message){
  const el = $('#toast'); el.textContent = message; el.classList.add('show');
  clearTimeout(window.__toast); window.__toast = setTimeout(()=>el.classList.remove('show'),2400);
}
function today(){ return new Date().toISOString().slice(0,10); }
function formatDate(v){
  if(!v) return '';
  const d = new Date(v+'T12:00:00');
  return new Intl.DateTimeFormat('ca-ES',{day:'2-digit',month:'2-digit',year:'numeric'}).format(d);
}

function go(screen){
  state.screen = screen; save('aid_screen', screen);
  $$('.screen').forEach(s=>s.classList.toggle('active',s.id === `screen-${screen}`));
  $$('.nav-item').forEach(n=>n.classList.toggle('active',n.dataset.screen === screen));
  window.scrollTo({top:0,behavior:'smooth'});
  if(screen==='diary') renderDiary();
}

$$('[data-screen]').forEach(btn=>btn.addEventListener('click',()=>go(btn.dataset.screen)));
$$('[data-go]').forEach(btn=>btn.addEventListener('click',()=>go(btn.dataset.go)));

function renderStats(){
  $('#statDays').textContent = state.diary.length;
  $('#statCaptures').textContent = state.diary.reduce((n,d)=>n+(Number(d.captures)||0),0);
  $('#statKm').textContent = state.diary.reduce((n,d)=>n+(Number(d.km)||0),0).toFixed(1).replace('.',',');
}

function renderSpecies(filter=''){
  const q=filter.trim().toLowerCase();
  const list=species.filter(s=>!q || `${s.name} ${s.type} ${s.note}`.toLowerCase().includes(q));
  $('#speciesList').innerHTML=list.map(s=>`<article class="species-card"><div class="animal-icon">${s.icon}</div><div><b>${s.name}</b><small>${s.type}</small><small>${s.note}</small></div></article>`).join('');
}

function renderSeason(){
  $('#seasonList').innerHTML=species.map(s=>`<article class="season-card"><div class="animal-icon">${s.icon}</div><div><b>${s.name}</b><small>${s.type}</small></div><span class="badge">Consultar normativa</span></article>`).join('');
}

function renderDiary(){
  const list=$('#diaryList'), empty=$('#diaryEmpty');
  empty.style.display=state.diary.length?'none':'block';
  list.innerHTML=state.diary.slice().reverse().map((d,i)=>`<article class="diary-card"><b>${escapeHtml(d.zone||'Jornada sense zona')}</b><small>${formatDate(d.date)} · ${escapeHtml(d.mode||'Modalitat no indicada')}</small><div class="meta"><span>Observacions: ${escapeHtml(d.notes||'—')}</span></div></article>`).join('');
}
function escapeHtml(v){return String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}

function openDiary(){
  $('#diaryDate').value=today(); $('#diaryZone').value=''; $('#diaryNotes').value=''; $('#diaryMode').value='Espera';
  $('#diaryModal').classList.remove('hidden'); $('#diaryModal').setAttribute('aria-hidden','false');
}
function closeDiary(){ $('#diaryModal').classList.add('hidden'); $('#diaryModal').setAttribute('aria-hidden','true'); }
$('#newDiaryBtn').addEventListener('click',openDiary); $('#emptyNewDiary').addEventListener('click',openDiary); $('#closeDiary').addEventListener('click',closeDiary);
$('#diaryModal').addEventListener('click',e=>{if(e.target.id==='diaryModal')closeDiary()});
$('#saveDiaryBtn').addEventListener('click',()=>{
  state.diary.push({date:$('#diaryDate').value||today(),zone:$('#diaryZone').value.trim(),mode:$('#diaryMode').value,notes:$('#diaryNotes').value.trim(),captures:0,km:0});
  save('aid_diary',state.diary); closeDiary(); renderDiary(); renderStats(); toast('Jornada guardada');
});

$('#speciesSearch').addEventListener('input',e=>renderSpecies(e.target.value));

let watchId=null;
$('#locateBtn').addEventListener('click',()=>{
  if(!navigator.geolocation){toast('Aquest dispositiu no ofereix geolocalització');return;}
  $('#gpsStatus').textContent='Buscant posició…';
  navigator.geolocation.getCurrentPosition(pos=>{
    state.coords={lat:pos.coords.latitude,lon:pos.coords.longitude,accuracy:pos.coords.accuracy};
    $('#gpsStatus').textContent='Posició obtinguda';
    $('#gpsCoords').textContent=`${state.coords.lat.toFixed(6)}, ${state.coords.lon.toFixed(6)} · precisió ±${Math.round(state.coords.accuracy)} m`;
    $('#mapBox').dataset.coords=`${state.coords.lat},${state.coords.lon}`;
    toast('GPS actualitzat');
  },err=>{
    $('#gpsStatus').textContent='No s’ha pogut obtenir la posició';
    $('#gpsCoords').textContent=err.code===1?'Permís de localització denegat.':'Torna-ho a provar en un lloc amb millor senyal.';
    toast('No s’ha pogut obtenir el GPS');
  },{enableHighAccuracy:true,timeout:10000,maximumAge:30000});
});

$('#savePointBtn').addEventListener('click',()=>{
  if(!state.coords){toast('Primer obtén la teva posició');return;}
  state.points.push({...state.coords,created:new Date().toISOString()}); save('aid_points',state.points); renderPoints(); toast('Punt guardat');
});
function renderPoints(){
  $('#savedPointsText').textContent=state.points.length?`${state.points.length} punt${state.points.length===1?'':'s'} guardat${state.points.length===1?'':'s'}.`:'Encara no n’hi ha cap.';
}

$('#shareLocationBtn').addEventListener('click',async()=>{
  if(!state.coords){
    if(navigator.geolocation) navigator.geolocation.getCurrentPosition(p=>{state.coords={lat:p.coords.latitude,lon:p.coords.longitude,accuracy:p.coords.accuracy};shareCoords()},()=>toast('Obtén primer la posició GPS'));
    else toast('GPS no disponible');
    return;
  }
  shareCoords();
});
async function shareCoords(){
  const text=`La meva ubicació: ${state.coords.lat.toFixed(6)}, ${state.coords.lon.toFixed(6)}`;
  if(navigator.share){try{await navigator.share({title:'Ubicació — Apunta i Dispara',text});}catch{} }
  else if(navigator.clipboard){await navigator.clipboard.writeText(text);toast('Coordenades copiades');}
}

$('#saveProfileBtn').addEventListener('click',()=>{
  state.profile={name:$('#profileName').value.trim(),license:$('#profileLicense').value.trim(),insurance:$('#profileInsurance').value.trim()};
  save('aid_profile',state.profile); toast('Perfil guardat');
});
function loadProfile(){
  $('#profileName').value=state.profile.name||''; $('#profileLicense').value=state.profile.license||''; $('#profileInsurance').value=state.profile.insurance||'';
}

window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();state.deferredInstall=e;$('#installBtn').classList.remove('hidden')});
$('#installBtn').addEventListener('click',async()=>{
  if(!state.deferredInstall)return;
  state.deferredInstall.prompt(); await state.deferredInstall.userChoice; state.deferredInstall=null; $('#installBtn').classList.add('hidden');
});
window.addEventListener('appinstalled',()=>toast('Apunta i Dispara instal·lada'));

if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));}

window.addEventListener('popstate',()=>go(state.screen));
function boot(){renderStats();renderPoints();renderSpecies();renderSeason();renderDiary();loadProfile();go(state.screen);}
boot();
