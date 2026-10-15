/* A finite, pausable opening. Choosing a scene keeps it open for exploration. */
(() => {
 const dialog=document.querySelector('.m2v-opening[data-opener-for="valencia-plan"]');
 if(!dialog)return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const stage=dialog.querySelector('.m2v-planner-stage');
 const pause=dialog.querySelector('[data-film-pause]');
 const choices=[...dialog.querySelectorAll('[data-planner-scene]')];
 const duration=9600;
 const scenes={city:['A new perspective.','Arts & Sciences','THE CITY IS YOURS','VALÈNCIA'],sea:['A little more breathing room.','Mediterranean','SPACE TO BREATHE','SEA AIR'],neighbourhood:['The feeling of finding your place.','El Cabanyal','A PLACE TO BELONG','YOUR LIFE']};
 let frame=0,closeTimer=0,last=0,elapsed=0,paused=false,manualPaused=false,exploring=false,previous=null;
 function scene(key){
  if(!scenes[key])return;
  stage.dataset.scene=key;
  choices.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.plannerScene===key)));
  const [caption,location,kicker,title]=scenes[key];
  dialog.querySelector('[data-planner-caption]').textContent=caption;
  dialog.querySelector('[data-planner-location]').textContent=location;
  dialog.querySelector('[data-planner-photo-kicker]').textContent=kicker;
  dialog.querySelector('[data-planner-photo-title]').textContent=title;
 }
 function stop(){cancelAnimationFrame(frame);frame=0;}
 function complete(){stop();clearTimeout(closeTimer);if(dialog.open)dialog.close();dialog.hidden=true;dialog.classList.remove('is-leaving','is-paused');if(previous?.isConnected)previous.focus({preventScroll:true});document.dispatchEvent(new CustomEvent('m2v:opener-finished'));}
 function finish(){if(!dialog.open)return;stop();dialog.classList.add('is-leaving');closeTimer=setTimeout(complete,reduced.matches?0:650);}
 function tick(now){
  if(!dialog.open||paused||reduced.matches)return;
  elapsed+=Math.min(100,now-last);last=now;
  if(!exploring){
   const key=elapsed<4000?'city':elapsed<6800?'sea':'neighbourhood';
   if(stage.dataset.scene!==key)scene(key);
   dialog.style.setProperty('--planner-progress',String(Math.min(1,elapsed/duration)));
   if(elapsed>=duration){finish();return;}
  }
  if(exploring&&elapsed>=8000){stop();return;}
  frame=requestAnimationFrame(tick);
 }
 function resume(){stop();last=performance.now();if(dialog.open&&!paused&&!reduced.matches)frame=requestAnimationFrame(tick);}
 function setPaused(value){paused=value;dialog.classList.toggle('is-paused',paused);pause.textContent=value?'Play motion':'Pause motion';pause.setAttribute('aria-pressed',String(value));if(paused)stop();else resume();}
 function open(hold=false){
  stop();clearTimeout(closeTimer);previous=document.activeElement;elapsed=0;exploring=hold;paused=false;manualPaused=false;
  dialog.hidden=false;dialog.classList.remove('is-leaving','is-paused');dialog.style.setProperty('--planner-progress','0');
  scene('city');pause.hidden=reduced.matches;pause.textContent='Pause motion';pause.setAttribute('aria-pressed','false');
  const film=dialog.querySelector('.m2v-film');film.style.display='none';void film.offsetHeight;film.style.display='';
  try{if(!dialog.open)dialog.showModal();}catch{dialog.hidden=true;return;}
  resume();
 }
 choices.forEach(button=>button.addEventListener('click',()=>{exploring=true;scene(button.dataset.plannerScene);dialog.style.setProperty('--planner-progress','1');}));
 pause.addEventListener('click',()=>{manualPaused=!paused;setPaused(!paused);});
 dialog.querySelectorAll('[data-film-exit]').forEach(button=>button.addEventListener('click',finish));
 dialog.addEventListener('cancel',event=>{event.preventDefault();finish();});
 dialog.addEventListener('close',()=>{stop();clearTimeout(closeTimer);dialog.hidden=true;});
 document.querySelector('[data-film-replay]')?.addEventListener('click',()=>open(true));
 addEventListener('message',event=>{if(event.source===parent&&(event.origin===location.origin||location.protocol==='file:')&&event.data?.type==='m2v:replay-opening')open(true);});
 document.addEventListener('visibilitychange',()=>{if(!dialog.open)return;if(document.hidden)setPaused(true);else if(!manualPaused)setPaused(false);});
 reduced.addEventListener('change',()=>{if(reduced.matches&&dialog.open)complete();});
 if(!reduced.matches&&!location.hash)open();
})();
