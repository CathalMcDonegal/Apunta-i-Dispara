(()=>{
const I={
 map:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 18l-6 3V6l6-3 6 3 6-3v15l-6 3-6-3Z"/><path d="M9 3v15M15 6v15"/></svg>',
 pin:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg>',
 calendar:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="4" width="18" height="17" rx="3"/><path d="M7 2v4M17 2v4M3 9h18"/><path d="M8 13h2M14 13h2M8 17h2"/></svg>',
 book:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v17H6.5A2.5 2.5 0 0 0 4 22V5.5Z"/><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/></svg>',
 shield:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3 20 6v6c0 5-3.3 8-8 9-4.7-1-8-4-8-9V6l8-3Z"/><path d="M12 8v5M12 16h.01"/></svg>',
 paw:'<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="8" cy="7" r="2.3"/><circle cx="16" cy="7" r="2.3"/><circle cx="5.5" cy="12" r="2.2"/><circle cx="18.5" cy="12" r="2.2"/><path d="M12 11c-3.4 0-5.8 2.8-5.8 5.5 0 2.1 1.7 3.5 3.8 3.5 1.2 0 1.5-.7 2-.7s.8.7 2 .7c2.1 0 3.8-1.4 3.8-3.5C17.8 13.8 15.4 11 12 11Z"/></svg>',
 user:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="8" r="4"/><path d="M4 21c.8-4.1 3.4-6 8-6s7.2 1.9 8 6"/></svg>',
 home:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m3 11 9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9Z"/></svg>',
 compass:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2.3 4.7-4.7 2.3 2.3-4.7 4.7-2.3Z"/></svg>',
 cross:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 4v16M4 12h16"/></svg>',
 target:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M1 12h4M19 12h4"/></svg>'
};
const put=(el,key)=>{if(el&&I[key]){el.innerHTML=I[key];el.classList.add('svg-icon')}};
function polish(){
 document.querySelectorAll('.quick-card').forEach(b=>{const t=b.textContent;put(b.querySelector('.quick-icon'),t.includes('Mapa')?'map':t.includes('Temporada')?'calendar':t.includes('Diari')?'book':'shield')});
 document.querySelectorAll('.nav-item').forEach(b=>{const t=b.textContent;put(b.querySelector('span'),t.includes('Inici')?'home':t.includes('Mapa')?'map':t.includes('Temporada')?'calendar':t.includes('Espècies')?'paw':'user')});
 document.querySelectorAll('.animal-icon').forEach(e=>put(e,'paw'));
 const map=document.querySelector('.compass'); if(map) put(map,'compass');
 document.querySelectorAll('.list-row>span').forEach(e=>{const t=e.textContent; const k=t.includes('📅')?'calendar':t.includes('🗺️')?'map':t.includes('📖')?'book':t.includes('👤')?'user':t.includes('📍')?'pin':t.includes('⚠️')?'shield':t.includes('🏛️')?'book':t.includes('📜')?'book':null;if(k)put(e,k)});
 document.querySelectorAll('.account-section h3').forEach(h=>{const t=h.textContent;h.classList.add('section-icon-title'); if(t.includes('Llicències')) h.dataset.icon='book'; else if(t.includes('Armes')) h.dataset.icon='target'; else h.dataset.icon='cross'});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',polish);else polish();
new MutationObserver(polish).observe(document.body,{childList:true,subtree:true});
})();