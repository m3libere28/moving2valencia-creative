(() => {
 const body=document.querySelector('body[data-jury-azahar]');if(!body)return;
 const reduced=matchMedia('(prefers-reduced-motion:reduce)');
 // All ceremonial waiting is removed; first meaningful content is available now.
 document.querySelector('#pre')?.remove();body.classList.add('ready');
 const menu=document.querySelector('#menu'),menuButton=document.querySelector('#menuBtn');
 if(menu){function menuState(){const open=menu.classList.contains('open');menu.hidden=!open;menu.inert=!open;menu.setAttribute('aria-hidden',String(!open));menuButton?.setAttribute('aria-expanded',String(open));}new MutationObserver(menuState).observe(menu,{attributes:true,attributeFilter:['class']});menuState();document.querySelector('#menuClose')?.addEventListener('click',()=>menuButton?.focus({preventScroll:true}));document.addEventListener('keydown',event=>{if(event.key==='Escape'&&menu.classList.contains('open')){menu.classList.remove('open');menuButton?.focus({preventScroll:true});}});}
 const modal=document.querySelector('#modal');let opener=null;
 document.addEventListener('click',event=>{const button=event.target.closest('[data-open]');if(button)opener=button;});
 modal?.addEventListener('close',()=>{modal.classList.remove('open');opener?.focus({preventScroll:true});});
 const values={rFam:['2 people','3–4 people','5+ people'],rTime:['1 month','3 months','6 months','12+ months'],rLvl:['Practical essentials','Home & family','Tailored support']};
 Object.entries(values).forEach(([id,labels])=>{const input=document.getElementById(id);if(!input)return;const update=()=>input.setAttribute('aria-valuetext',labels[Number(input.value)-1]||input.value);input.addEventListener('input',update);update();});
 // Free-standing map dots are a diagram; the adjacent native list is the control.
 document.querySelector('#fDots')?.setAttribute('aria-hidden','true');
 const motion=document.createElement('button');motion.type='button';motion.className='jury-azahar-motion';motion.textContent='Pause decorative motion';motion.setAttribute('aria-pressed','false');body.appendChild(motion);
 let manual=false;
 function sync(){const paused=manual||reduced.matches||document.hidden;body.dataset.azaharPaused=String(paused);motion.textContent=manual?'Play decorative motion':'Pause decorative motion';motion.setAttribute('aria-pressed',String(manual));motion.hidden=reduced.matches;document.querySelectorAll('video').forEach(video=>{if(paused)video.pause();});if(!paused&&window.juryAzaharPending){const pending=[...window.juryAzaharPending];window.juryAzaharPending.clear();pending.forEach(callback=>window.juryAzaharFrame(callback));}}
 motion.addEventListener('click',()=>{manual=!manual;sync();});reduced.addEventListener('change',sync);document.addEventListener('visibilitychange',sync);sync();
})();
