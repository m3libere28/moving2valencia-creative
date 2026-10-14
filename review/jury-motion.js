(()=>{'use strict';
 const root=document.body,identity=root.dataset.juryMotionRefined;if(!identity)return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 // The map-first route keeps its original native atlas controller; this page
 // owns only the page motion switch formerly provided by the scroll opening.
 if(identity==='valencia-3d-atlas'){
  const control=document.querySelector('#motion-toggle');let manual=false,paused=reduced.matches;
  function sync(){root.classList.toggle('motion-paused',paused);if(control){control.setAttribute('aria-pressed',String(paused));const label=control.querySelector('span:last-child');if(label)label.textContent=paused?'Play motion':'Pause motion';}if(paused)document.querySelectorAll('video').forEach(video=>video.pause());}
  control?.addEventListener('click',()=>{manual=true;paused=!paused;sync();});reduced.addEventListener('change',()=>{if(!manual){paused=reduced.matches;sync();}});sync();
  // Retained city/sea comparison uses a native range, without the scroll runtime.
  const slider=document.querySelector('#rhythm-slider'),stage=document.querySelector('.rhythm-stage');slider?.addEventListener('input',()=>{stage?.style.setProperty('--split',slider.value+'%');slider.setAttribute('aria-valuetext',`${slider.value} percent city, ${100-slider.value} percent sea`);});
  const rail=document.querySelector('.ritual-grid');document.querySelectorAll('[data-gallery]').forEach(button=>button.addEventListener('click',()=>rail?.scrollBy({left:(button.dataset.gallery==='next'?1:-1)*rail.clientWidth*.7,behavior:paused?'instant':'smooth'})));
 }
 // Optional chapters remain in the DOM for their existing controls. They are
 // static reading paths: no pinned scroll timeline inside a collapsed disclosure.
 function staticOptionalChapters(){const triggers=window.ScrollTrigger?.getAll?.()||[];triggers.forEach(trigger=>{if(trigger.trigger?.closest('.jury-optional'))trigger.kill(true);});window.ScrollTrigger?.refresh?.();}
 function afterOptionalToggle(event){const detail=event.currentTarget;if(!detail.open){detail.querySelectorAll('video').forEach(video=>video.pause());}else{window.dispatchEvent(new Event('resize'));window.ScrollTrigger?.refresh?.();}}
 document.querySelectorAll('.jury-optional').forEach(detail=>detail.addEventListener('toggle',afterOptionalToggle));
 function openOptionalHash(hash,scroll=true){let id;try{id=decodeURIComponent(hash.slice(1));}catch{return false;}const target=document.getElementById(id),detail=target?.closest('.jury-optional');if(!detail)return false;detail.open=true;requestAnimationFrame(()=>{window.ScrollTrigger?.refresh?.();if(scroll)target.scrollIntoView({behavior:reduced.matches?'auto':'smooth'});});return true;}
 document.addEventListener('click',event=>{const anchor=event.target.closest('a[href^="#"]');if(!anchor||anchor.hash.length<2)return;if(openOptionalHash(anchor.hash)){event.preventDefault();if(location.hash!==anchor.hash)history.pushState(null,'',anchor.hash);}});
 window.addEventListener('hashchange',()=>openOptionalHash(location.hash));
 function finishChapters(){staticOptionalChapters();openOptionalHash(location.hash);}
 if(document.readyState==='complete')finishChapters();else window.addEventListener('load',finishChapters,{once:true});
 // A short trail makes the route understandable without a cinematic intro.
 const trail=[...document.querySelectorAll('.jury-route-strip>a')];if('IntersectionObserver' in window && trail.length){const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting)trail.forEach(link=>{if(link.hash==='#'+entry.target.id)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});}),{rootMargin:'-12% 0px -65% 0px'});trail.forEach(link=>{const target=document.querySelector(link.hash);if(target)observer.observe(target);});}
})();
