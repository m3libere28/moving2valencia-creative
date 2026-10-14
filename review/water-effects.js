// Recorded coastal motion replaces the photograph distortion renderer.
(() => {
 const scene=document.querySelector('[data-proposal="7"] .stick');
 const film=scene?.querySelector('.coastal-film');if(!film)return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let visible=true,loaded=false;
 scene.dataset.waterRenderer='coastal-film';
 window.setDark=value=>{scene.style.setProperty('--coast-dark',String(Math.max(0,Math.min(.55,value*.55))));};
 function sync(){
  const running=visible&&!document.hidden&&!reduced.matches&&document.documentElement.dataset.motionPaused!=='true';
  if(!running){film.pause();if(reduced.matches)scene.classList.remove('film-playing');return;}
  if(!loaded){film.src=innerWidth<=700?'assets/coastal-waves-mobile.mp4':'assets/coastal-waves-hd.mp4';film.load();loaded=true;}
  film.play().then(()=>scene.classList.add('film-playing')).catch(()=>{scene.classList.remove('film-playing');if(document.documentElement.dataset.motionPaused!=='true')document.documentElement.dataset.motionPaused='true';const button=scene.querySelector('.scene-motion-toggle');if(button){button.textContent='Play waves';button.setAttribute('aria-pressed','true');}});
 }
 film.addEventListener('error',()=>scene.classList.remove('film-playing'));
 film.addEventListener('playing',()=>scene.classList.add('film-playing'));
 new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;sync();},{threshold:.05}).observe(scene);
 document.addEventListener('visibilitychange',sync);reduced.addEventListener('change',sync);
 new MutationObserver(sync).observe(document.documentElement,{attributes:true,attributeFilter:['data-motion-paused']});
 sync();
})();
