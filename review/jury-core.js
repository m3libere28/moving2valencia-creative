// Preferences stay on this browser and become an editable consultation note.
(() => {
 const notes=[...document.querySelectorAll('[data-journal]')];
 const message=document.querySelector('#message');
 const journalKey='m2v-casa-journal';
 function addNote(text){if(message && !message.value.includes(text))message.value+=(message.value.trim()?'\n':'')+text;}
 notes.forEach(button=>button.addEventListener('click',()=>{
  const selected=button.getAttribute('aria-pressed')!=='true';button.setAttribute('aria-pressed',String(selected));
  const chosen=notes.filter(b=>b.getAttribute('aria-pressed')==='true').map(b=>b.dataset.journal);
  try{localStorage.setItem(journalKey,JSON.stringify(chosen));}catch{}
  document.querySelector('#journal-feedback').textContent=chosen.length?'Your journal: '+chosen.join(' · ')+'. You can edit these priorities in the consultation draft.':'Select a detail to plan around.';
  if(message){const other=message.value.split('\n').filter(x=>!x.startsWith('My everyday priorities:')).join('\n').trim();message.value=other+(other&&chosen.length?'\n':'')+(chosen.length?'My everyday priorities: '+chosen.join('; ')+'.':'');}
 }));
 try{const saved=JSON.parse(localStorage.getItem(journalKey)||'[]');notes.filter(b=>saved.includes(b.dataset.journal)).forEach(b=>b.click());}catch{}
 document.querySelectorAll('[data-horizon]').forEach(button=>button.addEventListener('click',()=>{
  const sea=button.dataset.horizon==='sea';
  document.querySelectorAll('[data-horizon]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
  const image=document.querySelector('.hero-visual>img');
  if(image){const stem=sea?'hero_bg':'hero_valencia';image.src=`assets/jury-photo-${stem}-1440.webp`;image.srcset=`assets/jury-photo-${stem}-640.webp 640w, assets/jury-photo-${stem}-1440.webp 1440w`;image.alt=sea?'Evening clouds above Malvarrosa beach, Valencia':'Valencia rooftops seen from the Micalet';}
  document.querySelector(`[data-neighborhood="${sea?'cabanyal':'ruzafa'}"]`)?.click();
  if(message){const other=message.value.split('\n').filter(x=>!x.startsWith('I am drawn to')).join('\n').trim();message.value=other+(other?'\n':'')+(sea?'I am drawn to coastal life and would like to explore home-finding options.':'I am drawn to city life and would like to explore neighbourhood options.');}
 }));
 function routeFeedback(){const done=[...document.querySelectorAll('[data-task]')].filter(x=>x.checked).length;document.querySelectorAll('.jury-route-progress i').forEach((x,i)=>x.classList.toggle('on',i<done));}
 document.querySelectorAll('[data-task]').forEach(x=>x.addEventListener('change',routeFeedback));document.querySelector('.reset')?.addEventListener('click',routeFeedback);routeFeedback();
})();
