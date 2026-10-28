(() => {
  const OFFICIAL_VIEWER='https://sig.gencat.cat/visors/Cacera.html';
  const OFFICIAL_KMZ='https://gencat.cat/agricultura/sig/bases/agescin.kmz';
  const mapScreen=document.querySelector('#screen-map');
  if(!mapScreen)return;

  const addStyles=()=>{
    if(document.querySelector('#huntingMapStyles'))return;
    const s=document.createElement('style');s.id='huntingMapStyles';
    s.textContent=`
      .hunt-map-tools{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin:10px 0}
      .hunt-map-tools a,.hunt-map-tools button{display:flex;align-items:center;justify-content:center;gap:7px;text-decoration:none}
      .hunt-zone-card{margin:10px 0;padding:14px;border:1px solid rgba(255,255,255,.08);border-radius:15px;background:rgba(255,255,255,.035)}
      .hunt-zone-card b{display:block;margin-bottom:7px}.hunt-zone-card small{display:block;line-height:1.45;color:var(--muted)}
      .hunt-gps-coords{font-size:.82rem;color:var(--muted);word-break:break-all}
      .hunt-status{margin-top:8px;font-size:.88rem;line-height:1.45}.hunt-status.ok{color:#8ee6a8}.hunt-status.warn{color:#ffd27a}.hunt-status.err{color:#ff9c9c}
      .hunt-result{margin-top:10px;padding:11px;border-radius:12px;background:rgba(255,255,255,.045)}
      .hunt-result strong{display:block;font-size:1rem;margin-bottom:4px}.hunt-result span{display:block;color:var(--muted);font-size:.84rem;margin-top:3px}
    `;document.head.appendChild(s)
  };

  const getCoords=()=>new Promise((resolve,reject)=>{
    if(!navigator.geolocation)return reject(new Error('Aquest dispositiu no permet geolocalitzacio.'));
    navigator.geolocation.getCurrentPosition(
      p=>resolve({lat:p.coords.latitude,lon:p.coords.longitude,accuracy:p.coords.accuracy}),
      e=>reject(new Error(e.message||'No s’ha pogut obtenir la ubicacio.')),
      {enableHighAccuracy:true,timeout:15000,maximumAge:30000}
    )
  });

  const loadScript=src=>new Promise((resolve,reject)=>{
    if(window.JSZip)return resolve();
    const s=document.createElement('script');s.src=src;s.onload=resolve;s.onerror=()=>reject(new Error('No s’ha pogut carregar el lector cartografic.'));document.head.appendChild(s)
  });

  const pointInRing=(lat,lon,ring)=>{
    let inside=false;
    for(let i=0,j=ring.length-1;i<ring.length;j=i++){
      const yi=ring[i][0],xi=ring[i][1],yj=ring[j][0],xj=ring[j][1];
      const intersect=((xi>lon)!==(xj>lon)) && (lat < (yj-yi)*(lon-xi)/(xj-xi)+yi);
      if(intersect)inside=!inside;
    }
    return inside;
  };

  const pointInPolygon=(lat,lon,rings)=>{
    if(!rings?.length||!pointInRing(lat,lon,rings[0]))return false;
    for(let i=1;i<rings.length;i++)if(pointInRing(lat,lon,rings[i]))return false;
    return true;
  };

  const text=el=>el?.textContent?.trim()||'';
  const readPlacemark=pm=>{
    const name=text(pm.querySelector('name'));
    const data={};
    pm.querySelectorAll('ExtendedData Data').forEach(d=>{const n=d.getAttribute('name')||'';data[n]=text(d.querySelector('value'))});
    const polygons=[];
    pm.querySelectorAll('Polygon').forEach(poly=>{
      const outer=poly.querySelector('outerBoundaryIs LinearRing coordinates');
      if(!outer)return;
      const ring=text(outer).split(/\s+/).map(v=>v.split(',')).filter(v=>v.length>=2).map(v=>[Number(v[1]),Number(v[0])]).filter(v=>Number.isFinite(v[0])&&Number.isFinite(v[1]));
      if(ring.length>2)polygons.push(ring);
    });
    return {name,data,polygons};
  };

  let zonesPromise=null;
  const loadZones=async()=>{
    if(zonesPromise)return zonesPromise;
    zonesPromise=(async()=>{
      await loadScript('https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js');
      const r=await fetch(OFFICIAL_KMZ,{mode:'cors',cache:'no-store'});
      if(!r.ok)throw new Error('La font cartografica oficial no es accessible des del navegador.');
      const zip=await JSZip.loadAsync(await r.arrayBuffer());
      const kmlEntry=Object.values(zip.files).find(f=>/\.kml$/i.test(f.name));
      if(!kmlEntry)throw new Error('El fitxer cartografic oficial no conte KML.');
      const xml=await kmlEntry.async('text');
      const doc=new DOMParser().parseFromString(xml,'application/xml');
      const zones=[];doc.querySelectorAll('Placemark').forEach(pm=>{const z=readPlacemark(pm);if(z.polygons.length)zones.push(z)});
      if(!zones.length)throw new Error('No s’han pogut llegir els poligons de la cartografia oficial.');
      return zones;
    })();
    try{return await zonesPromise}catch(e){zonesPromise=null;throw e}
  };

  const identify=async(pos)=>{
    const zones=await loadZones();
    const matches=zones.filter(z=>z.polygons.some(r=>pointInPolygon(pos.lat,pos.lon,[r])));
    if(!matches.length)return null;
    return matches[0];
  };

  const build=()=>{
    addStyles();
    if(document.querySelector('#huntMapTools'))return;
    const map=document.querySelector('#leafletMap');if(!map)return;
    const tools=document.createElement('div');tools.id='huntMapTools';tools.className='hunt-map-tools';
    tools.innerHTML=`<button class="secondary-btn" id="detectHuntingZoneBtn">📍 Detecta la meva zona</button><a class="secondary-btn" href="${OFFICIAL_VIEWER}" target="_blank" rel="noopener">🗺️ Visor oficial</a>`;
    map.insertAdjacentElement('afterend',tools);
    const card=document.createElement('div');card.className='hunt-zone-card';card.id='huntZoneCard';
    card.innerHTML=`<b>🟢 Zona cinegètica</b><div class="hunt-status warn">Prem «Detecta la meva zona» per comprovar automàticament el punt amb la cartografia oficial.</div>`;
    tools.insertAdjacentElement('afterend',card);
    document.querySelector('#detectHuntingZoneBtn')?.addEventListener('click',async()=>{
      const btn=document.querySelector('#detectHuntingZoneBtn');const status=card.querySelector('.hunt-status');
      btn.disabled=true;btn.textContent='📡 Comprovant…';status.className='hunt-status warn';status.textContent='Obtenint la posició GPS i consultant la cartografia oficial…';
      try{
        const pos=await getCoords();
        try{localStorage.setItem('aid_last_gps',JSON.stringify({...pos,ts:Date.now()}))}catch(e){}
        if(window.state)window.state.coords={lat:pos.lat,lon:pos.lon,accuracy:pos.accuracy};
        try{if(window.map&&typeof window.map.setView==='function')window.map.setView([pos.lat,pos.lon],14)}catch(e){}
        const zone=await identify(pos);
        if(zone){
          const keys=Object.keys(zone.data);const values=Object.values(zone.data).filter(Boolean);
          const meta=values.slice(0,3).map(v=>`<span>${v.replace(/[<>]/g,'')}</span>`).join('');
          status.className='hunt-status ok';status.innerHTML=`📍 Posicio: <span class="hunt-gps-coords">${pos.lat.toFixed(6)}, ${pos.lon.toFixed(6)} · precisio aprox. ${Math.round(pos.accuracy)} m</span>`;
          const result=document.createElement('div');result.className='hunt-result';result.innerHTML=`<strong>🎯 ${zone.name||'Zona cinegetica'}</strong>${meta}`;card.appendChild(result);
        }else{
          status.className='hunt-status warn';status.innerHTML=`📍 Posicio detectada: <span class="hunt-gps-coords">${pos.lat.toFixed(6)}, ${pos.lon.toFixed(6)}</span><br>No s’ha trobat cap figura cinegetica en aquest punt de la cartografia oficial.`;
        }
      }catch(err){
        status.className='hunt-status err';status.innerHTML=`⚠️ ${err.message||'No s’ha pogut consultar la cartografia.'}<br><small>Pots obrir el visor oficial per contrastar el punt.</small>`;
      }finally{btn.disabled=false;btn.textContent='📍 Detecta la meva zona'}
    });
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',build);else build();
})();