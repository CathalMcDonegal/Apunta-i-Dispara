(() => {
  const DOC_KEY='aid_documents_v1';
  const WEAPON_KEY='aid_weapons_v1';
  const AMMO_KEY='aid_ammo_v1';
  const load=(k,f)=>{try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(f))}catch{return f}};
  let documents=load(DOC_KEY,[]), weapons=load(WEAPON_KEY,[]), ammo=load(AMMO_KEY,[]);
  const $=s=>document.querySelector(s);
  const save=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
  const esc=v=>String(v??'').replace(/[&<>'\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','\"':'&quot;'}[c]));
  const fmt=v=>v?new Intl.DateTimeFormat('ca-ES',{day:'2-digit',month:'2-digit',year:'numeric'}).format(new Date(v+'T12:00:00')):'';
  const daysLeft=v=>{if(!v)return null;const d=new Date(v+'T23:59:59'),n=new Date();return Math.ceil((d-n)/86400000)};
  const status=v=>{const d=daysLeft(v);if(d===null)return 'Sense data';return d<0?'CADUCAT':d<=30?`Caduca en ${Math.max(0,d)} dies`:'Vigent'};
  const statusClass=v=>{const d=daysLeft(v);return d===null?'warn':d<0?'bad':d<=30?'warn':'ok'};
  const docIcon=name=>{const n=String(name||'').toLowerCase();if(n.includes('arma'))return '🔐';if(n.includes('caça')||n.includes('caca'))return '🏹';if(n.includes('asseg'))return '🛡️';if(n.includes('permís')||n.includes('permis'))return '📜';return '📄'};

  function injectWalletStyles(){
    if($('#walletStyles'))return;
    const s=document.createElement('style');s.id='walletStyles';s.textContent=`
      .wallet-dashboard{margin:0 0 14px;padding:15px;border:1px solid var(--line);border-radius:20px;background:linear-gradient(145deg,#1b291d,#121b15)}
      .wallet-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:12px}.wallet-head b{font-size:17px}.wallet-head small{display:block;color:var(--muted);font-size:10px;margin-top:2px}
      .wallet-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.wallet-stat{padding:10px;border-radius:13px;background:rgba(255,255,255,.045);border:1px solid rgba(255,255,255,.06)}.wallet-stat span{display:block;color:var(--muted);font-size:10px}.wallet-stat strong{display:block;font-size:22px;margin-top:2px}.wallet-stat.alert strong{color:#e6b65c}
      .wallet-alert{margin-top:10px;padding:10px 11px;border-radius:12px;background:rgba(211,167,44,.10);border:1px solid rgba(211,167,44,.25);font-size:11px;line-height:1.4}.wallet-alert.bad{background:rgba(185,52,43,.11);border-color:rgba(185,52,43,.3)}
      .wallet-alert b{display:block;margin-bottom:2px}.wallet-actions{display:flex;gap:8px;margin-top:10px}.wallet-actions button{flex:1}
      .wallet-import{display:none}.wallet-summary-line{display:flex;gap:8px;flex-wrap:wrap;margin-top:8px}.wallet-summary-line span{font-size:10px;color:var(--muted);background:#1d291f;border-radius:8px;padding:5px 7px}
      @media(max-width:380px){.wallet-grid{grid-template-columns:1fr 1fr}.wallet-stat:last-child{grid-column:1/-1}.wallet-actions{flex-direction:column}}
    `;document.head.appendChild(s);
  }

  function ensureDashboard(){
    const profile=$('#screen-profile');if(!profile)return null;
    let dash=$('#walletDashboard');
    if(!dash){dash=document.createElement('div');dash.id='walletDashboard';dash.className='wallet-dashboard';const first=profile.querySelector('.profile-card');profile.insertBefore(dash,first||profile.firstChild)}
    return dash;
  }

  function expiringDocuments(){return documents.map((d,i)=>({d,i,days:daysLeft(d.expiry)})).filter(x=>x.days!==null&&x.days<=30).sort((a,b)=>a.days-b.days)};

  function renderDashboard(){
    const dash=ensureDashboard();if(!dash)return;
    const alerts=expiringDocuments(),expired=alerts.filter(x=>x.days<0),soon=alerts.filter(x=>x.days>=0);
    let alertHtml='';
    if(expired.length) alertHtml+=`<div class="wallet-alert bad"><b>⚠️ ${expired.length} document${expired.length===1?'':'s'} caducat${expired.length===1?'':'s'}</b>${expired.slice(0,3).map(x=>`${esc(x.d.name)} · ${fmt(x.d.expiry)}`).join('<br>')}</div>`;
    else if(soon.length) alertHtml+=`<div class="wallet-alert"><b>⏳ ${soon.length} document${soon.length===1?'':'s'} a punt de caducar</b>${soon.slice(0,3).map(x=>`${esc(x.d.name)} · ${status(x.d.expiry)}`).join('<br>')}</div>`;
    else alertHtml='<div class="wallet-alert"><b>✓ Documentació al dia</b><span>No hi ha cap document amb caducitat dins dels pròxims 30 dies.</span></div>';
    dash.innerHTML=`<div class="wallet-head"><div><b>🪪 Cartera del caçador</b><small>Control ràpid de documentació i equip</small></div></div><div class="wallet-grid"><div class="wallet-stat"><span>Documents</span><strong>${documents.length}</strong></div><div class="wallet-stat ${alerts.length?'alert':''}"><span>Alertes</span><strong>${alerts.length}</strong></div><div class="wallet-stat"><span>Armes</span><strong>${weapons.length}</strong></div></div>${alertHtml}<div class="wallet-summary-line"><span>🎯 Munició: ${ammo.reduce((n,a)=>n+(Number(a.quantity)||0),0)} unitats</span><span>📦 Tipus: ${ammo.length}</span></div><div class="wallet-actions"><button class="secondary-btn" id="exportWalletBtn">↧ Còpia de seguretat</button><button class="secondary-btn" id="importWalletBtn">↥ Restaurar còpia</button><input id="walletImportInput" class="wallet-import" type="file" accept="application/json,.json"></div>`;
    $('#exportWalletBtn')?.addEventListener('click',exportWallet);
    $('#importWalletBtn')?.addEventListener('click',()=>$('#walletImportInput')?.click());
    $('#walletImportInput')?.addEventListener('change',importWallet);
  }

  function render(){
    documents=load(DOC_KEY,[]);weapons=load(WEAPON_KEY,[]);ammo=load(AMMO_KEY,[]);
    renderDashboard();
    const dl=$('#documentsList'),wl=$('#weaponsList'),al=$('#ammoList');
    if(dl)dl.innerHTML=documents.length?documents.map((d,i)=>`<article class="record-card"><div><b>${docIcon(d.name)} ${esc(d.name)}</b><small>${esc(d.number||'Sense número')} · ${fmt(d.expiry)||'Sense caducitat'}</small><span class="record-status ${statusClass(d.expiry)}">${status(d.expiry)}</span></div><button data-doc-delete="${i}" class="record-delete" aria-label="Eliminar document">×</button></article>`).join(''):'<div class="empty-mini">Encara no hi ha documents.</div>';
    if(wl)wl.innerHTML=weapons.length?weapons.map((w,i)=>`<article class="record-card"><div><b>🔫 ${esc(w.name)}</b><small>${esc(w.type)} · ${esc(w.caliber||'Calibre no indicat')}</small><small>${w.identifier?'Identificador: '+esc(w.identifier):'Sense identificador guardat'}</small></div><button data-weapon-delete="${i}" class="record-delete" aria-label="Eliminar arma">×</button></article>`).join(''):'<div class="empty-mini">Encara no hi ha armes registrades.</div>';
    if(al)al.innerHTML=ammo.length?ammo.map((a,i)=>`<article class="record-card"><div><b>🎯 ${esc(a.name)}</b><small>${esc(a.caliber||'Calibre no indicat')} · ${Number(a.quantity)||0} unitats</small></div><button data-ammo-delete="${i}" class="record-delete" aria-label="Eliminar munició">×</button></article>`).join(''):'<div class="empty-mini">Encara no hi ha munició registrada.</div>';
    document.querySelectorAll('[data-doc-delete]').forEach(b=>b.onclick=()=>{documents.splice(+b.dataset.docDelete,1);save(DOC_KEY,documents);render();});
    document.querySelectorAll('[data-weapon-delete]').forEach(b=>b.onclick=()=>{weapons.splice(+b.dataset.weaponDelete,1);save(WEAPON_KEY,weapons);render();});
    document.querySelectorAll('[data-ammo-delete]').forEach(b=>b.onclick=()=>{ammo.splice(+b.dataset.ammoDelete,1);save(AMMO_KEY,ammo);render();});
  }

  function addDocument(){
    const name=$('#docName').value.trim();if(!name){alert('Indica el tipus de document.');return}
    documents.push({name,number:$('#docNumber').value.trim(),expiry:$('#docExpiry').value});save(DOC_KEY,documents);['docName','docNumber','docExpiry'].forEach(id=>$('#'+id).value='');render();
  }
  function addWeapon(){
    const name=$('#weaponName').value.trim();if(!name){alert('Indica una arma.');return}
    weapons.push({name,type:$('#weaponType').value,caliber:$('#weaponCaliber').value.trim(),identifier:$('#weaponIdentifier').value.trim()});save(WEAPON_KEY,weapons);['weaponName','weaponCaliber','weaponIdentifier'].forEach(id=>$('#'+id).value='');render();
  }
  function addAmmo(){
    const name=$('#ammoName').value.trim();if(!name){alert('Indica el tipus de munició.');return}
    ammo.push({name,caliber:$('#ammoCaliber').value.trim(),quantity:Number($('#ammoQuantity').value)||0});save(AMMO_KEY,ammo);['ammoName','ammoCaliber','ammoQuantity'].forEach(id=>$('#'+id).value='');render();
  }
  function exportWallet(){
    const data={app:'Apunta i Dispara',version:1,exportedAt:new Date().toISOString(),documents,weapons,ammo};
    const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`apunta-i-dispara-cartera-${new Date().toISOString().slice(0,10)}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  async function importWallet(e){
    const file=e.target.files?.[0];if(!file)return;
    try{
      const data=JSON.parse(await file.text());
      if(data?.app!=='Apunta i Dispara' || !Array.isArray(data.documents) || !Array.isArray(data.weapons) || !Array.isArray(data.ammo)) throw new Error('format');
      if(!confirm('Això substituirà la cartera actual per la còpia seleccionada. Vols continuar?')){e.target.value='';return;}
      documents=data.documents;weapons=data.weapons;ammo=data.ammo;
      save(DOC_KEY,documents);save(WEAPON_KEY,weapons);save(AMMO_KEY,ammo);render();alert('Còpia restaurada correctament.');
    }catch{alert('No s’ha pogut restaurar la còpia. Selecciona un fitxer JSON creat per Apunta i Dispara.');}
    e.target.value='';
  }

  window.initDocumentsWeapons=()=>{injectWalletStyles();render();$('#addDocumentBtn')?.addEventListener('click',addDocument);$('#addWeaponBtn')?.addEventListener('click',addWeapon);$('#addAmmoBtn')?.addEventListener('click',addAmmo)};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>window.initDocumentsWeapons());else window.initDocumentsWeapons();
})();
