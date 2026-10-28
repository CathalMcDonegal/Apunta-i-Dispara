(() => {
  const OFFICIAL_VIEWER='https://sig.gencat.cat/visors/Cacera.html';
  const OFFICIAL_DATA='https://agricultura.gencat.cat/ca/serveis/cartografia-sig/bases-cartografiques/cacera-pesca-continental/arees-gestio-cinegetica';
  const mapScreen=document.querySelector('#screen-map');
  if(!mapScreen)return;

  const addStyles=()=>{
    if(document.querySelector('#huntingMapStyles'))return;
    const s=document.createElement('style');s.id='huntingMapStyles';
    s.textContent=`
      .hunt-map-tools{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin:10px 0}
      .hunt-map-tools a,.hunt-map-tools button{display:flex;align-items:center;justify-content:center;gap:7px;text-decoration:none}
      .hunt-zone-card{margin:10px 0;padding:13px 14px;border:1px solid rgba(255,255,255,.08);border-radius:15px;background:rgba(255,255,255,.035)}
      .hunt-zone-card b{display:block;margin-bottom:5px}.hunt-zone-card small{display:block;line-height:1.45;color:var(--muted)}
      .hunt-gps-row{display:flex;gap:8px;align-items:center;justify-content:space-between;margin-top:9px;flex-wrap:wrap}
      .hunt-gps-coords{font-size:.82rem;color:var(--muted);word-break:break-all}
      .hunt-status{margin-top:8px;font-size:.88rem}
      .hunt-status.ok{color:#8ee6a8}.hunt-status.warn{color:#ffd27a}.hunt-status.err{color:#ff9c9c}
    `;document.head.appendChild(s)
  };

  const getCoords=()=>new Promise((resolve,reject)=>{
    if(!navigator.geolocation)return reject(new Error('Aquest dispositiu no permet geolocalització.'));
    navigator.geolocation.getCurrentPosition(
      p=>resolve({lat:p.coords.latitude,lon:p.coords.longitude,accuracy:p.coords.accuracy}),
      e=>reject(new Error(e.message||'No s’ha pogut obtenir la ubicació.')),
      {enableHighAccuracy:true,timeout:15000,maximumAge:30000}
    )
  });

  const build=()=>{
    addStyles();
    if(document.querySelector('#huntMapTools'))return;
    const map=document.querySelector('#leafletMap');if(!map)return;

    const tools=document.createElement('div');
    tools.id='huntMapTools';tools.className='hunt-map-tools';
    tools.innerHTML=`
      <button class="secondary-btn" id="detectHuntingZoneBtn">📍 Detecta la meva zona</button>
      <a class="secondary-btn" href="${OFFICIAL_VIEWER}" target="_blank" rel="noopener">🗺️ Visor oficial</a>
    `;
    map.insertAdjacentElement('afterend',tools);

    const card=document.createElement('div');
    card.className='hunt-zone-card';
    card.id='huntZoneCard';
    card.innerHTML=`<b>🟢 Zona cinegètica</b><div class="hunt-status warn">Prem «Detecta la meva zona» per obtenir la teva posició GPS i obrir el visor oficial de caça.</div>`;
    tools.insertAdjacentElement('afterend',card);

    const btn=document.querySelector('#detectHuntingZoneBtn');
    btn?.addEventListener('click',async()=>{
      const status=card.querySelector('.hunt-status');
      btn.disabled=true;btn.textContent='📡 Localitzant…';status.className='hunt-status warn';status.textContent='Obtenint la posició GPS…';
      try{
        const pos=await getCoords();
        const coords=`${pos.lat.toFixed(6)}, ${pos.lon.toFixed(6)}`;
        status.className='hunt-status ok';
        status.innerHTML=`📍 Posició detectada: <span class="hunt-gps-coords">${coords} · precisió aprox. ${Math.round(pos.accuracy)} m</span><div class="hunt-gps-row"><span>La cartografia oficial identifica la figura cinegètica en aquest punt.</span></div>`;
        if(window.state)window.state.coords={lat:pos.lat,lon:pos.lon,accuracy:pos.accuracy};
        try{localStorage.setItem('aid_last_gps',JSON.stringify({lat:pos.lat,lon:pos.lon,accuracy:pos.accuracy,ts:Date.now()}))}catch(e){}
        // Center the app map on the user's position when Leaflet is available.
        try{if(window.map&&typeof window.map.setView==='function')window.map.setView([pos.lat,pos.lon],14)}catch(e){}
        // The official viewer is the authoritative source for the exact hunting figure.
        window.open(OFFICIAL_VIEWER,'_blank','noopener');
      }catch(err){
        status.className='hunt-status err';status.textContent='⚠️ '+(err.message||'No s’ha pogut obtenir la ubicació. Activa la ubicació del telèfon i torna-ho a provar.');
      }finally{btn.disabled=false;btn.textContent='📍 Detecta la meva zona'}
    });
  };

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',build);else build();
})();
