(() => {
 const player=document.querySelector('#valencia-documentary');
 const play=document.querySelector('[data-cinema-play]');
 const error=document.querySelector('#cinema-error');
 const phone=matchMedia('(max-width:700px)').matches;
 // Select one actual HD rendition before a request, including the background clip.
 document.querySelectorAll('video[data-hd]').forEach(video=>{
  video.src=phone?video.dataset.phone:video.dataset.hd;
 });
 if(!player||!play)return;
 play.addEventListener('click',()=>{
  player.controls=true;
  player.play().then(()=>{play.hidden=true;error.hidden=true;}).catch(()=>{
   play.hidden=false;error.hidden=false;
  });
 });
 player.addEventListener('playing',()=>{play.hidden=true;error.hidden=true;});
 player.addEventListener('error',()=>{
  player.style.opacity='1';play.hidden=true;error.hidden=false;
 });
})();
