(() => {
  const DOC_KEY='aid_documents_v1';
  const WEAPON_KEY='aid_weapons_v1';
  const AMMO_KEY='aid_ammo_v1';
  const load=(k,f)=>{try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(f))}catch{return f}};
  let documents=load(DOC_KEY,[]), weapons=load(WEAPON_KEY,[]), ammo=load(AMMO_KEY,[]);
  const $=s=>document.querySelector(s);
  const save=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
  const esc=v=>String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const fmt=v=>v?new Intl.DateTimeFormat('ca-ES',{day:'2-digit',month:'2-digit',year:'numeric'}).format(new Date(v+'T12:00:00')):'';
  const status=v=>{if(!v)return 'Sense data'; const d=new Date(v+'T23:59:59'),n=new Date(); const days=Math.ceil((d-n)/86400000); return days<0?'CADUCAT':days<=30?`Caduca en ${days} dies`:'Vigent'};
  function render(){
    const dl=$('#documentsList'),wl=$('#weaponsList'),al=$('#ammoList');
    if(dl)dl.innerHTML=documents.length?documents.map((d,i)=>`<article class="record-card"><div><b>${esc(d.name)}</b><small>${esc(d.number||'Sense número')} · ${fmt(d.expiry)||'Sense caducitat'}</small><span class="record-status ${status(d.expiry)==='Vigent'?'ok':status(d.expiry)==='CADUCAT'?'bad':'warn'}">${status(d.expiry)}</span></div><button data-doc-delete="${i}" class="record-delete">×</button></article>`).join(''):'<div class="empty-mini">Encara no hi ha documents.</div>';
    if(wl)wl.innerHTML=weapons.length?weapons.map((w,i)=>`<article class="record-card"><div><b>${esc(w.name)}</b><small>${esc(w.type)} · ${esc(w.caliber||'Calibre no indicat')}</small><small>${w.identifier?'Identificador: '+esc(w.identifier):'Sense identificador guardat'}</small></div><button data-weapon-delete="${i}" class="record-delete">×</button></article>`).join(''):'<div class="empty-mini">Encara no hi ha armes registrades.</div>';
    if(al)al.innerHTML=ammo.length?ammo.map((a,i)=>`<article class="record-card"><div><b>${esc(a.name)}</b><small>${esc(a.caliber||'Calibre no indicat')} · ${Number(a.quantity)||0} unitats</small></div><button data-ammo-delete="${i}" class="record-delete">×</button></article>`).join(''):'<div class="empty-mini">Encara no hi ha munició registrada.</div>';
    document.querySelectorAll('[data-doc-delete]').forEach(b=>b.onclick=()=>{documents.splice(+b.dataset.docDelete,1);save(DOC_KEY,documents);render();});
    document.querySelectorAll('[data-weapon-delete]').forEach(b=>b.onclick=()=>{weapons.splice(+b.dataset.weaponDelete,1);save(WEAPON_KEY,weapons);render();});
    document.querySelectorAll('[data-ammo-delete]').forEach(b=>b.onclick=()=>{ammo.splice(+b.dataset.ammoDelete,1);save(AMMO_KEY,ammo);render();});
  }
  function addDocument(){
    const name=$('#docName').value.trim(); if(!name)return alert('Indica el tipus de document.');
    documents.push({name,number:$('#docNumber').value.trim(),expiry:$('#docExpiry').value}); save(DOC_KEY,documents); ['docName','docNumber','docExpiry'].forEach(id=>$('#'+id).value=''); render();
  }
  function addWeapon(){
    const name=$('#weaponName').value.trim(); if(!name)return alert('Indica una arma.');
    weapons.push({name,type:$('#weaponType').value,caliber:$('#weaponCaliber').value.trim(),identifier:$('#weaponIdentifier').value.trim()}); save(WEAPON_KEY,weapons); ['weaponName','weaponCaliber','weaponIdentifier'].forEach(id=>$('#'+id).value=''); render();
  }
  function addAmmo(){
    const name=$('#ammoName').value.trim(); if(!name)return alert('Indica el tipus de munició.');
    ammo.push({name,caliber:$('#ammoCaliber').value.trim(),quantity:Number($('#ammoQuantity').value)||0}); save(AMMO_KEY,ammo); ['ammoName','ammoCaliber','ammoQuantity'].forEach(id=>$('#'+id).value=''); render();
  }
  window.initDocumentsWeapons=()=>{render(); $('#addDocumentBtn')?.addEventListener('click',addDocument); $('#addWeaponBtn')?.addEventListener('click',addWeapon); $('#addAmmoBtn')?.addEventListener('click',addAmmo);};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>window.initDocumentsWeapons()); else window.initDocumentsWeapons();
})();
