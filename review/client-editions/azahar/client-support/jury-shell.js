// A complete preview/copy/edit path for the imported consultation forms.
(() => {
 function prepare(form,preparedBody){
  if(!form.reportValidity())return;
  const values=[...form.querySelectorAll('input,textarea,select')].filter(x=>!['submit','button','hidden'].includes(x.type)).map(x=>{
   const labelElement=x.labels?.[0]||(x.id&&form.querySelector(`label[for="${x.id}"]`));
   let label=x.name||x.id||'Detail';
   if(labelElement){const copy=labelElement.cloneNode(true);copy.querySelectorAll('input,select,textarea,button').forEach(control=>control.remove());label=copy.textContent;}
   return `${label.trim()}: ${x.value.trim()}`;
  });
  const body=preparedBody||'Hello Christa Brokke,\n\nI would like to discuss moving to Valencia.\n\n'+values.join('\n')+'\n\nPlease let me know a suitable time for a first conversation.';
  let panel=form.parentElement.querySelector('.jury-draft');
  if(!panel){
   panel=document.createElement('section');panel.className='jury-draft';panel.setAttribute('aria-label','Email draft preview');
   panel.innerHTML='<h3 tabindex="-1">Your email draft</h3><p>Nothing has been sent. Review the text, then copy it or open your email app.</p><textarea readonly aria-label="Prepared email text"></textarea><div class="jury-draft-actions"><button type="button" class="jury-copy">Copy draft</button><a class="jury-mail" href="#">Open email app ↗</a><button type="button" class="jury-edit">Edit details</button></div><p class="jury-copy-status" role="status" aria-live="polite"></p>';
   form.after(panel);
   panel.querySelector('.jury-edit').onclick=()=>{panel.hidden=true;form.hidden=false;form.querySelector('input,textarea,select')?.focus();};
   panel.querySelector('.jury-copy').onclick=()=>{
    const text=panel.querySelector('textarea'),status=panel.querySelector('[role=status]');
    function fallback(){text.focus();text.select();status.textContent='Copy the selected text using your device’s copy command.';}
    if(navigator.clipboard?.writeText)navigator.clipboard.writeText(text.value).then(()=>status.textContent='Draft copied. Paste it into a new email to send it.',fallback);else fallback();
   };
  }
  panel.querySelector('textarea').value=body;
  panel.querySelector('.jury-mail').href='mailto:info@moving2valencia.eu?subject='+encodeURIComponent('Consultation request · Valencia')+'&body='+encodeURIComponent(body);
  form.hidden=true;panel.hidden=false;panel.querySelector('h3').focus();
 }
 window.juryPrepareDraft=prepare;
 const enquiry=document.querySelector('#jury-enquiry-form'),priorities=document.querySelector('#jury-priorities');
 priorities?.addEventListener('input',()=>priorities.dataset.edited='true');
 enquiry?.addEventListener('submit',event=>{event.preventDefault();prepare(enquiry);});
 function carryChoices(){
  if(!priorities||priorities.dataset.edited==='true')return;
  if(document.body.dataset.juryConcept==='valencia-bento'){
   const places=[...document.querySelectorAll('[data-save-district][aria-pressed="true"]')].map(b=>b.dataset.saveDistrict),month=document.querySelector('#selected-move-month')?.value;
   priorities.value='Neighbourhoods to discuss: '+(places.join(', ')||'Open to ideas')+'\nPreferred move month: '+(month||'To discuss')+'\nMy household and daily priorities: ';
  }else if(document.body.dataset.juryConcept==='immersive-valencia'){
   const choice=name=>{const input=document.querySelector(`[name="${name}"]:checked`);return input?document.querySelector(`label[for="${input.id}"]`)?.textContent.trim():'';};
   priorities.value='Support to discuss: '+(document.querySelector('#pn')?.textContent||'To discuss')+'\nHousehold: '+choice('h')+'\nPreferred timing: '+choice('w')+'\nMy priorities: ';
  }
 }
 // Whitespace-only names are not valid input.
 document.querySelectorAll('form input[required]').forEach(input=>input.addEventListener('input',()=>input.setCustomValidity(input.value.trim()?'':'Please complete this field.')));
 document.querySelectorAll('dialog').forEach(dialog=>{
  let opener;document.addEventListener('click',e=>{const b=e.target.closest('[data-book],[data-open],[data-book-open],#dockBook');if(b){opener=b;carryChoices();}});
  dialog.addEventListener('close',()=>opener?.focus({preventScroll:true}));
 });
 // Full-page chapter menus keep keyboard focus in the visible navigation.
 const menu=document.querySelector('#menu'),menuOpener=document.querySelector('#menu-toggle,#menuBtn');
 if(menu&&menu.tagName!=='DIALOG'&&menuOpener){
  const main=document.querySelector('main'),footer=document.querySelector('footer');let wasOpen=false,nextTarget=null;
  function menuState(){const open=!menu.hidden&&getComputedStyle(menu).display!=='none';if(main)main.inert=open;if(footer)footer.inert=open;if(open&&!wasOpen)menu.querySelector('button,a')?.focus({preventScroll:true});if(!open&&wasOpen){if(nextTarget){nextTarget.tabIndex=-1;nextTarget.focus({preventScroll:true});nextTarget=null;}else menuOpener.focus({preventScroll:true});}wasOpen=open;}
  menu.querySelectorAll('a[href^="#"]').forEach(anchor=>anchor.addEventListener('click',()=>nextTarget=document.getElementById(anchor.hash.slice(1))));
  new MutationObserver(menuState).observe(menu,{attributes:true,attributeFilter:['hidden','class']});menuState();
  document.addEventListener('keydown',event=>{if(!wasOpen||event.key!=='Tab')return;const controls=[...menu.querySelectorAll('a[href],button:not([disabled])')].filter(el=>el.getBoundingClientRect().width>0);if(!controls.length)return;const first=controls[0],last=controls.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}});
 }
})();
