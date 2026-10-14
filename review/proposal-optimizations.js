(() => {
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 // Carry the visitor's chosen starting point into the email they review and send.
 document.addEventListener('click',event=>{const trigger=event.target.closest('[popovertarget="book"],[data-book-open],[data-book]');if(!trigger)return;const plan=trigger.closest('.plan');const barrio=trigger.textContent.match(/Discuss (.+) with Christa/);const choice=plan?.querySelector('b')?.textContent||barrio?.[1]||document.querySelector('#pn')?.textContent;if(!choice)return;document.querySelectorAll('#book a[href^="mailto:"],#dlg a[href^="mailto:"]').forEach(link=>{link.href='mailto:info@moving2valencia.eu?subject='+encodeURIComponent('Relocation consultation — '+choice)+'&body='+encodeURIComponent('Hello Christa,\n\nI would like to discuss '+choice+' as a starting point for my move to Valencia. Please help me confirm the right scope, availability and next steps.\n\nMy expected move date:\nWho is moving:\nMy priorities:\n');});},true);
 const scene=document.querySelector('[data-proposal="7"] .stick');
 if(scene){const button=document.createElement('button');button.type='button';button.className='scene-motion-toggle';button.textContent='Pause waves';button.setAttribute('aria-pressed','false');scene.appendChild(button);button.addEventListener('click',()=>{const paused=document.documentElement.dataset.motionPaused!=='true';document.documentElement.dataset.motionPaused=String(paused);button.textContent=paused?'Play waves':'Pause waves';button.setAttribute('aria-pressed',String(paused));});button.hidden=reduced.matches;reduced.addEventListener('change',()=>{button.hidden=reduced.matches;});}
 const videos=[...document.querySelectorAll('video')];
 const near=new Set();
 const observer=new IntersectionObserver(entries=>entries.forEach(({target,isIntersecting})=>{if(isIntersecting)near.add(target);else near.delete(target);sync(target);}),{rootMargin:'100px'});
 function sync(video){if(!near.has(video)||document.hidden||reduced.matches||video.dataset.userPaused==='true')video.pause();else if(video.hasAttribute('autoplay'))video.play().catch(()=>{});}
 videos.forEach(video=>{video.preload='none';observer.observe(video);if(reduced.matches)video.removeAttribute('autoplay');});
 document.addEventListener('visibilitychange',()=>videos.forEach(sync));reduced.addEventListener('change',()=>videos.forEach(sync));
 // A user-triggered clip can choose the phone rendition without fetching both.
 document.querySelectorAll('[data-vid]').forEach(button=>{
  if(innerWidth<=700)button.dataset.vid=button.dataset.vid.replace('-hd.mp4','-mobile.mp4');
 });
 videos.forEach(video=>{const source=video.querySelector('source');const path=source?.getAttribute('src');if(innerWidth<=700&&path?.startsWith('assets/valencia-')&&path.endsWith('-hd.mp4')){source.src=path.replace('-hd.mp4','-mobile.mp4');video.load();}});
 videos.filter(video=>video.hasAttribute('autoplay')).forEach(video=>{
  const control=document.createElement('button');control.className='media-motion-toggle';control.type='button';control.textContent='Pause motion';control.setAttribute('aria-label','Pause background video');video.parentElement.appendChild(control);
  control.addEventListener('click',()=>{const stop=video.dataset.userPaused!=='true';video.dataset.userPaused=String(stop);control.textContent=stop?'Play motion':'Pause motion';control.setAttribute('aria-label',stop?'Play background video':'Pause background video');if(stop)video.pause();else video.play().catch(()=>{});});
 });
 // Prevent unhandled storage failures in private browsing from breaking core UX.
 document.querySelectorAll('video').forEach(video=>video.addEventListener('error',()=>{video.style.opacity='0';}));
})();

