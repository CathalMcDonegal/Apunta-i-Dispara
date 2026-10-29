(()=>{
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const K='aid.v2';let S={profile:{},docs:[],weapons:[],ammo:[],days:[],points:[]};
try{Object.assign(S,JSON.parse(localStorage.getItem(K)||'{}'))}catch(e){}
const save=()=>{try{localStorage.setItem(K,JSON.stringify(S))}catch(e){toast("No s'ha pogut desar")}};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove('show'),2200)}
const fd=d=>d?new Date(d+'T00:00').toLocaleDateString('ca',{day:'numeric',month:'short',year:'numeric'}):'';
const val=id=>$(id).value.trim();
const TR='<svg class="i"><use href="#trash"/></svg>';
function go(n){$$('.screen').forEach(s=>s.classList.toggle('active',s.id==='screen-'+n));$$('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.screen===n));scrollTo(0,0);if(n==='map')initMap()}
document.addEventListener('click',e=>{const g=e.target.closest('[data-go],[data-screen]');if(g)go(g.dataset.go||g.dataset.screen);
const d=e.target.closest('[data-del]');if(d){const[k,i]=d.dataset.del.split(':');if(k==='points'&&mk[i])map.removeLayer(mk[i]);S[k].splice(+i,1);save();if(k==='points')S.points.forEach((_,j)=>{});render()}});
// Caducitat
function exp(d){if(!d)return'';const n=Math.ceil((new Date(d+'T00:00')-new Date().setHours(0,0,0,0))/864e5);
return n<0?'<span class="badge bad">Caducat</span>':n<=30?`<span class="badge warn">Caduca en ${n} dies</span>`:`<span class="badge">Fins ${fd(d)}</span>`}
const row=(k,i,h)=>`<div class="item"><div>${h}</div><button class="del" data-del="${k}:${i}" aria-label="Elimina">${TR}</button></div>`;
// Temporada
let flt='all';
const today=()=>new Date().toISOString().slice(0,10);
const isOpen=s=>s.per.some(p=>!p.x&&p.a<=today()&&today()<=p.b);
const IC=(()=>{try{return JSON.parse(localStorage.getItem('aid.img')||'{}')}catch(e){return{}}})();
async function photo(img){const w=img.dataset.w;let u=IC[w];
if(!u){try{const r=await fetch('https://en.wikipedia.org/api/rest_v1/page/summary/'+encodeURIComponent(w));const j=await r.json();u=j.thumbnail&&j.thumbnail.source;if(u){IC[w]=u;try{localStorage.setItem('aid.img',JSON.stringify(IC))}catch(e){}}}catch(e){}}
if(u){img.onerror=()=>img.classList.add('hidden');img.src=u;img.classList.remove('hidden')}}
function season(){const q=val('#speciesSearch').toLowerCase();
const l=SPECIES.filter(s=>(flt==='all'||flt==='open'&&isOpen(s)||s.t===flt)&&s.n.toLowerCase().includes(q));
$('#seasonList').innerHTML=l.map(s=>`<article class="sp"><div class="sp-ph"><svg class="i"><use href="#paw"/></svg><img data-w="${esc(s.w)}" alt="${esc(s.n)}" class="hidden" loading="lazy"></div><div class="sp-b"><div class="sp-h"><span class="tag">${s.t==='major'?'Caça major':'Caça menor'}</span><span class="badge ${isOpen(s)?'':'bad'}">${isOpen(s)?'Oberta ara':'Tancada ara'}</span></div><h4>${esc(s.n)}</h4>${s.per.map(p=>`<p class="per">${esc(p.l)}</p>`).join('')}<p class="inf"><b>Dies:</b> ${esc(s.dies)}</p>${s.nota?`<p class="inf">${esc(s.nota)}</p>`:''}</div></article>`).join('')||'<p class="pad">Cap resultat.</p>';
$$('#seasonList img').forEach(photo)}
$('#speciesSearch').oninput=season;
$$('.filter').forEach(b=>b.onclick=()=>{flt=b.dataset.f;$$('.filter').forEach(x=>x.classList.toggle('active',x===b));season()});
// Render general
function render(){
$('#statDays').textContent=S.days.length;$('#statCaptures').textContent=S.days.reduce((a,d)=>a+(+d.cap||0),0);
$('#statKm').textContent=S.days.reduce((a,d)=>a+(+d.km||0),0).toFixed(1).replace('.',',');
$('#seasonSummary').textContent=SPECIES.filter(isOpen).length+' espècies obertes avui';
$('#diaryEmpty').classList.toggle('hidden',S.days.length>0);
$('#diaryList').innerHTML=[...S.days].map((d,i)=>[d,i]).sort((a,b)=>b[0].date.localeCompare(a[0].date)).map(([d,i])=>row('days',i,`<span class="tag">${esc(d.mode)}</span><h4>${esc(d.zone||'Sense zona')}</h4><div class="meta">${fd(d.date)} · ${d.cap} captures · ${d.km} km</div>${d.notes?`<p>${esc(d.notes)}</p>`:''}`)).join('');
$('#pointsList').innerHTML=S.points.map((p,i)=>row('points',i,`<b>${esc(p.n)}</b><div class="meta">${p.lat.toFixed(5)}, ${p.lng.toFixed(5)}</div>`)).join('')||'<p class="pad">Encara no n\'hi ha cap.</p>';
$('#docsList').innerHTML=S.docs.map((d,i)=>row('docs',i,`<b>${esc(d.name)}</b><div class="meta">${esc(d.num)}</div>${exp(d.exp)}`)).join('');
$('#weaponsList').innerHTML=S.weapons.map((w,i)=>row('weapons',i,`<b>${esc(w.name)}</b><div class="meta">${esc(w.type)} · ${esc(w.cal)} ${esc(w.id)}</div>`)).join('');
$('#ammoList').innerHTML=S.ammo.map((a,i)=>row('ammo',i,`<b>${esc(a.name)}</b><div class="meta">${esc(a.cal)} · ${a.qty} unitats</div>`)).join('')}
// Diari
const modal=$('#diaryModal');
function openD(){$('#dDate').value=new Date().toISOString().slice(0,10);$('#dZone').value='';$('#dNotes').value='';$('#dCap').value=0;$('#dKm').value=+(S.lastKm||0).toFixed(1);modal.classList.remove('hidden')}
$('#newDiaryBtn').onclick=$('#emptyNewDiary').onclick=openD;$('#closeDiary').onclick=()=>modal.classList.add('hidden');
$('#saveDiaryBtn').onclick=()=>{if(!val('#dDate'))return toast('Posa una data');
S.days.push({date:val('#dDate'),zone:val('#dZone'),mode:$('#dMode').value,cap:+$('#dCap').value||0,km:+$('#dKm').value||0,notes:val('#dNotes')});S.lastKm=0;save();modal.classList.add('hidden');render();toast('Jornada desada')};
// Perfil
const P=S.profile;[['#pName','name'],['#pLicense','lic'],['#pIns','ins'],['#pInsExp','insExp']].forEach(([id,k])=>$(id).value=P[k]||'');
$('#saveProfileBtn').onclick=()=>{S.profile={name:val('#pName'),lic:val('#pLicense'),ins:val('#pIns'),insExp:val('#pInsExp')};save();toast('Perfil desat')};
const add=(btn,k,get,need)=>$(btn).onclick=()=>{const o=get();if(!o[need])return toast('Omple el nom');S[k].push(o);save();render();toast('Afegit')};
add('#addDocBtn','docs',()=>({name:val('#docName'),num:val('#docNumber'),exp:val('#docExpiry')}),'name');
add('#addWeaponBtn','weapons',()=>({name:val('#wName'),type:$('#wType').value,cal:val('#wCal'),id:val('#wId')}),'name');
add('#addAmmoBtn','ammo',()=>({name:val('#aName'),cal:val('#aCal'),qty:+$('#aQty').value||0}),'name');
// Mapa
let map,me,line,watch=null,pos=null,trk=0,last=null,wAt=0;const mk=[];
const hav=(a,b)=>{const r=Math.PI/180,x=Math.sin((b.lat-a.lat)*r/2)**2+Math.cos(a.lat*r)*Math.cos(b.lat*r)*Math.sin((b.lng-a.lng)*r/2)**2;return 12742*Math.asin(Math.sqrt(x))};
function initMap(){if(map)return setTimeout(()=>map.invalidateSize(),50);
if(!window.L){$('#leafletMap').innerHTML='<p class="pad">El mapa necessita connexió la primera vegada.</p>';return}
map=L.map('leafletMap').setView([41.7,1.7],8);L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:18,attribution:'© OpenStreetMap'}).addTo(map);
line=L.polyline([],{color:'#ff6a1a',weight:4}).addTo(map);S.points.forEach(addMk)}
function addMk(p){mk.push(L.marker([p.lat,p.lng]).addTo(map).bindPopup(esc(p.n)))}
function setPos(c){pos={lat:c.latitude,lng:c.longitude};$('#gpsStatus').textContent='Posició obtinguda';
$('#gpsCoords').textContent=`${pos.lat.toFixed(5)}, ${pos.lng.toFixed(5)} · ±${Math.round(c.accuracy)} m`;
if(map){me?me.setLatLng(pos):me=L.circleMarker(pos,{radius:8,color:'#fff',fillColor:'#ff6a1a',fillOpacity:1}).addTo(map)}
if(Date.now()-wAt>6e5){wAt=Date.now();weather()}}
async function weather(){try{const r=await(await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${pos.lat}&longitude=${pos.lng}&current=temperature_2m,wind_speed_10m`)).json();
$('#weatherText').textContent=`${Math.round(r.current.temperature_2m)} °C · vent ${Math.round(r.current.wind_speed_10m)} km/h`}catch(e){$('#weatherText').textContent='Sense dades de temps.'}}
const gerr=()=>toast("No s'ha pogut obtenir la posició");
$('#locateBtn').onclick=()=>navigator.geolocation?navigator.geolocation.getCurrentPosition(p=>{setPos(p.coords);initMap();map&&map.setView(pos,15)},gerr,{enableHighAccuracy:true,timeout:15000}):gerr();
$('#trackBtn').onclick=()=>{const b=$('#trackBtn');if(watch!==null){navigator.geolocation.clearWatch(watch);watch=null;b.textContent='Iniciar recorregut';S.lastKm=(S.lastKm||0)+trk;save();toast(trk.toFixed(2)+' km recorreguts');return}
if(!navigator.geolocation)return gerr();initMap();trk=0;last=null;line&&line.setLatLngs([]);b.textContent='Aturar recorregut';
watch=navigator.geolocation.watchPosition(p=>{setPos(p.coords);if(last){const d=hav(last,pos);if(d>.01){trk+=d;last=pos;line&&line.addLatLng(pos)}}else{last=pos}},gerr,{enableHighAccuracy:true})};
$('#savePointBtn').onclick=()=>{if(!pos)return toast("Ubica't primer");const n=prompt('Nom del punt','Punt '+(S.points.length+1));if(!n)return;const p={n,lat:pos.lat,lng:pos.lng};S.points.push(p);save();map&&addMk(p);render()};
$('#shareLocationBtn').onclick=()=>navigator.geolocation?navigator.geolocation.getCurrentPosition(p=>{const u=`https://maps.google.com/?q=${p.coords.latitude},${p.coords.longitude}`;
navigator.share?navigator.share({title:'La meva ubicació',url:u}).catch(()=>{}):navigator.clipboard.writeText(u).then(()=>toast('Enllaç copiat'))},gerr,{enableHighAccuracy:true}):gerr();
render();season();
if('serviceWorker' in navigator)navigator.serviceWorker.register('sw.js').catch(()=>{});
})();
