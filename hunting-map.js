(() => {
  const OFFICIAL_VIEWER='https://sig.gencat.cat/visors/cacera.html';
  const mapScreen=document.querySelector('#screen-map');
  if(!mapScreen)return;
  const addStyles=()=>{if(document.querySelector('#huntingMapStyles'))return;const s=document.createElement('style');s.id='huntingMapStyles';s.textContent=`
    .hunt-map-tools{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin:10px 0}
    .hunt-map-tools a,.hunt-map-tools button{display:flex;align-items:center;justify-content:center;gap:7px;text-decoration:none}
    .hunt-zone-card{margin:10px 0;padding:13px 14px;border:1px solid rgba(255,255,255,.08);border-radius:15px;background:rgba(255,255,255,.035)}
    .hunt-zone-card b{display:block;margin-bottom:4px}.hunt-zone-card small{display:block;line-height:1.45;color:var(--muted)}
  `;document.head.appendChild(s)};
  const build=()=>{
    addStyles();
    if(document.querySelector('#huntMapTools'))return;
    const map=document.querySelector('#leafletMap');if(!map)return;
    const tools=document.createElement('div');tools.id='huntMapTools';tools.className='hunt-map-tools';
    tools.innerHTML=`<a class="secondary-btn" href="${OFFICIAL_VIEWER}" target="_blank" rel="noopener">🗺️ Visor oficial</a><button class="secondary-btn" id="openOfficialMapBtn">📍 Veure caça oficial</button>`;
    map.insertAdjacentElement('afterend',tools);
    const card=document.createElement('div');card.className='hunt-zone-card';card.innerHTML='<b>🟢 Cartografia cinegètica oficial</b><small>El visor de la Generalitat permet consultar figures cinegètiques, cercar per nom, matrícula, municipi o comarca i descarregar límits. La cartografia s actualitza periòdicament i té caràcter orientatiu.</small>';
    tools.insertAdjacentElement('afterend',card);
    document.querySelector('#openOfficialMapBtn')?.addEventListener('click',()=>window.open(OFFICIAL_VIEWER,'_blank','noopener'));
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',build);else build();
})();
