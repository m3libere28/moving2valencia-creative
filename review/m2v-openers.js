/* Native dialog owns modality, so closing cannot leave a blur or inert page behind. */
(()=>{'use strict';
 const dialog=document.querySelector('.m2v-opening');if(!dialog)return;
 const reduce=matchMedia('(prefers-reduced-motion: reduce)'),pause=dialog.querySelector('[data-film-pause]');
 const video=dialog.querySelector('video[data-film-video]');
 const chooseFilm=()=>{if(!video?.getAttribute)return false;const mode=matchMedia('(max-width: 900px)').matches?'mobile':'desktop',src=video.getAttribute('data-film-'+mode),poster=video.getAttribute('data-film-poster-'+mode),changed=Boolean(src&&video.getAttribute('src')!==src);if(changed)video.setAttribute('src',src);if(poster)video.setAttribute('poster',poster);if(changed)video.load?.();return changed;};
 const playMedia=()=>{if(video&&!reduce.matches){const playing=video.play?.();playing?.catch?.(()=>{});}};
 const duration=Math.min(10000,Math.max(3000,Number(dialog.getAttribute?.('data-film-duration'))||4800));
 let timer=0,closing=0,remaining=duration,started=0,paused=false,manualPause=false,previous=null,held=false;
 const clear=()=>{clearTimeout(timer);timer=0;};
 function complete(){clear();clearTimeout(closing);video?.pause?.();dialog.classList.remove('is-leaving','is-paused');if(dialog.open)dialog.close();dialog.hidden=true;previous?.isConnected&&previous.focus?.({preventScroll:true});document.dispatchEvent(new CustomEvent('m2v:opener-finished'));}
 function finish(){if(!dialog.open)return;clear();dialog.classList.add('is-leaving');closing=setTimeout(complete,reduce.matches?0:650);}
 function schedule(){clear();if(!paused&&!reduce.matches&&!held){started=performance.now();timer=setTimeout(finish,remaining);}}
 function setPaused(value){if(!dialog.open)return;if(value&&!paused){remaining=Math.max(0,remaining-(performance.now()-started));clear();}paused=value;dialog.classList.toggle('is-paused',paused);pause.textContent=paused?'Play motion':'Pause motion';pause.setAttribute('aria-pressed',String(paused));if(paused)video?.pause?.();else{playMedia();schedule();}}
 function open(hold=false){clear();clearTimeout(closing);held=hold===true;previous=document.activeElement;remaining=duration;paused=false;manualPause=false;dialog.classList.remove('is-paused','is-leaving');dialog.hidden=false;
  // Restart the finite CSS film for each replay without recreating the content page.
  const film=dialog.querySelector('.m2v-film');film.style.display='none';void film.offsetHeight;film.style.display='';
  pause.hidden=reduce.matches;pause.textContent='Pause motion';pause.setAttribute('aria-pressed','false');
  try{if(!dialog.open)dialog.showModal();chooseFilm();if(video)video.currentTime=0;playMedia();schedule();}catch{video?.pause?.();dialog.hidden=true;return;}
 }
 dialog.querySelectorAll('[data-film-exit]').forEach(b=>b.addEventListener('click',finish));
 pause.addEventListener('click',()=>{manualPause=!paused;setPaused(!paused);});
 dialog.addEventListener('cancel',event=>{event.preventDefault();finish();});
 dialog.addEventListener('close',()=>{clear();clearTimeout(closing);video?.pause?.();dialog.hidden=true;});
 document.querySelector('[data-film-replay]')?.addEventListener('click',()=>open(true));
 // The review can resize an open film when switching between desktop and phone.
 addEventListener('resize',()=>{if(!video||!dialog.open)return;const time=video.currentTime,playing=!video.paused;if(!chooseFilm())return;video.addEventListener('loadedmetadata',()=>{if(!dialog.open)return;video.currentTime=Math.min(time,Number.isFinite(video.duration)?video.duration:time);if(playing&&!paused&&!reduce.matches)playMedia();},{once:true});});
 addEventListener('message',event=>{if(event.source===parent&&(event.origin===location.origin||location.protocol==='file:')&&event.data?.type==='m2v:replay-opening')open(true);});
 document.addEventListener('visibilitychange',()=>{if(!dialog.open)return;if(document.hidden)setPaused(true);else if(!manualPause)setPaused(false);});
 reduce.addEventListener('change',()=>{if(reduce.matches&&dialog.open)complete();});
 // Hash links and reduced-motion visitors go directly to the actual content.
 if(!reduce.matches&&!location.hash)open();
})();
