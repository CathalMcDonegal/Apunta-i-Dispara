(()=>{
'use strict';
const base=()=>location.href.split('#')[0];
const setExamHome=()=>{
  try{history.replaceState({aidRoot:true,screen:'exams'},base()+'#exams')}catch(e){}
  document.querySelectorAll('.screen').forEach(s=>s.classList.toggle('active',s.id==='screen-exams'));
  document.querySelectorAll('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.screen==='exams'));
  window.scrollTo(0,0);
  const root=document.querySelector('#examRoot');
  if(root&&window.AID_EXAMS_HOME)window.AID_EXAMS_HOME();
};
const internalBack=()=>{
  if(location.hash==='#exams-question'||location.hash==='#exams-bank'||location.hash==='#exams-result'){
    setExamHome();
    return true;
  }
  return false;
};
// Capture the exam's own back buttons before their older onclick handlers run.
document.addEventListener('click',e=>{
  const b=e.target.closest('#examBack,#backBank,#back');
  if(!b)return;
  e.preventDefault();e.stopImmediatePropagation();
  setExamHome();
},true);
// Android/browser back: if an exam detail screen is active, always return to Exàmens first.
window.addEventListener('popstate',e=>{
  const h=location.hash;
  if(h==='#exams-question'||h==='#exams-bank'||h==='#exams-result'){
    setExamHome();
    return;
  }
  if(e.state?.aidRoot&&e.state.screen==='exams'){
    document.querySelectorAll('.screen').forEach(s=>s.classList.toggle('active',s.id==='screen-exams'));
    document.querySelectorAll('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.screen==='exams'));
  }
});
// Exàmens home -> previous app screen must be Inici, never an internal exam state.
document.addEventListener('click',e=>{
  const b=e.target.closest('[data-screen="exams"]');
  if(!b)return;
  setTimeout(()=>{
    if(location.hash!=='#exams')history.replaceState({aidRoot:true,screen:'exams'},base()+'#exams');
  },30);
},true);
})();
