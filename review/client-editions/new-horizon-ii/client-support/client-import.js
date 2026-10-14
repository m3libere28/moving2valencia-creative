
(() => {
 document.querySelectorAll('video,audio').forEach(media=>{media.removeAttribute('autoplay');if(media.tagName==='VIDEO')media.muted=true;else media.pause();});
 const isArchiveForm=document.body.dataset.clientEdition==='azahar'||document.body.dataset.clientEdition==='new-horizon-ii';
 if(isArchiveForm)document.addEventListener('submit',event=>{if(!event.target.matches('#form,#draftForm'))return;event.preventDefault();event.stopImmediatePropagation();window.juryPrepareDraft(event.target);},true);
 const menu=document.querySelector('#menu'),modal=document.querySelector('#modal');let modalOpener=null,modalWasOpen=false;
 function sync(element){if(!element)return;const open=element.classList.contains('open');element.hidden=!open;element.setAttribute('aria-hidden',String(!open));element.inert=!open;if(element===modal){if(modalWasOpen&&!open)modalOpener?.focus({preventScroll:true});modalWasOpen=open;}}
 [menu,modal].forEach(element=>{if(!element)return;new MutationObserver(()=>sync(element)).observe(element,{attributes:true,attributeFilter:['class']});sync(element);});
 if(modal){document.addEventListener('click',event=>{const button=event.target.closest('[data-open]');if(button)modalOpener=button;});modal.addEventListener('keydown',event=>{if(event.key==='Escape')modalOpener?.focus({preventScroll:true});if(event.key!=='Tab')return;const controls=[...modal.querySelectorAll('button,a[href],input,select,textarea')].filter(control=>!control.disabled&&control.getBoundingClientRect().width);const first=controls[0],last=controls.at(-1);if(!first)return;if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}});}
})();
