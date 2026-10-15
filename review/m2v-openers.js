/* Native dialog owns modality, so closing cannot leave a blur or inert page behind. */
(()=>{'use strict';
 const dialog=document.querySelector('.m2v-opening');if(!dialog)return;
 const reduce=matchMedia('(prefers-reduced-motion: reduce)'),pause=dialog.querySelector('[data-film-pause]');
 let timer=0,closing=0,remaining=4800,started=0,paused=false,manualPause=false,previous=null,held=false;
 const clear=()=>{clearTimeout(timer);timer=0;};
 function complete(){clear();clearTimeout(closing);dialog.classList.remove('is-leaving','is-paused');if(dialog.open)dialog.close();dialog.hidden=true;previous?.isConnected&&previous.focus?.({preventScroll:true});document.dispatchEvent(new CustomEvent('m2v:opener-finished'));}
 function finish(){if(!dialog.open)return;clear();dialog.classList.add('is-leaving');closing=setTimeout(complete,reduce.matches?0:650);}
 function schedule(){clear();if(!paused&&!reduce.matches&&!held){started=performance.now();timer=setTimeout(finish,remaining);}}
 function setPaused(value){if(!dialog.open)return;if(value&&!paused){remaining=Math.max(0,remaining-(performance.now()-started));clear();}paused=value;dialog.classList.toggle('is-paused',paused);pause.textContent=paused?'Play motion':'Pause motion';pause.setAttribute('aria-pressed',String(paused));if(!paused)schedule();}
 function open(hold=false){clear();clearTimeout(closing);held=hold===true;previous=document.activeElement;remaining=4800;paused=false;manualPause=false;dialog.classList.remove('is-paused','is-leaving');dialog.hidden=false;
  // Restart the finite CSS film for each replay without recreating the content page.
  const film=dialog.querySelector('.m2v-film');film.style.display='none';void film.offsetHeight;film.style.display='';
  pause.hidden=reduce.matches;pause.textContent='Pause motion';pause.setAttribute('aria-pressed','false');
  try{if(!dialog.open)dialog.showModal();schedule();}catch{dialog.hidden=true;return;}
 }
 dialog.querySelectorAll('[data-film-exit]').forEach(b=>b.addEventListener('click',finish));
 pause.addEventListener('click',()=>{manualPause=!paused;setPaused(!paused);});
 dialog.addEventListener('cancel',event=>{event.preventDefault();finish();});
 dialog.addEventListener('close',()=>{clear();clearTimeout(closing);dialog.hidden=true;});
 document.querySelector('[data-film-replay]')?.addEventListener('click',()=>open(true));
 addEventListener('message',event=>{if(event.source===parent&&(event.origin===location.origin||location.protocol==='file:')&&event.data?.type==='m2v:replay-opening')open(true);});
 document.addEventListener('visibilitychange',()=>{if(!dialog.open)return;if(document.hidden)setPaused(true);else if(!manualPause)setPaused(false);});
 reduce.addEventListener('change',()=>{if(reduce.matches&&dialog.open)complete();});
 // Hash links and reduced-motion visitors go directly to the actual content.
 if(!reduce.matches&&!location.hash)open();
})();
