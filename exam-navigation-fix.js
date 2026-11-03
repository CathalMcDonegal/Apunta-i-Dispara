(()=>{
'use strict';
const base=()=>location.href.split('#')[0];
const setExamHome=()=>{
  history.replaceState({aidRoot:true,screen:'exams'},base()+'#exams');
  history.pushState({aidExam:'navigation-fix'},base()+'#exams-navigation-fix');
  window.dispatchEvent(new PopStateEvent('popstate',{state:{aidExam:'navigation-fix'}}));
  history.replaceState({aidRoot:true,screen:'exams'},base()+'#exams');
};
document.addEventListener('click',e=>{
  const b=e.target.closest('#examBack,#backBank,#back');
  if(!b)return;
  e.preventDefault();e.stopImmediatePropagation();
  setExamHome();
},true);
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
})();
