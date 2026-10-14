const menu = document.querySelector('.menu-toggle');
const nav = document.querySelector('#nav');
function closeMenu(){nav.classList.remove('open');menu.setAttribute('aria-expanded','false');}
menu.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));});
nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
document.addEventListener('pointerdown',e=>{if(!e.target.closest('.header') && nav.classList.contains('open'))closeMenu();});
document.addEventListener('keydown',e=>{if(e.key==='Escape' && nav.classList.contains('open')){closeMenu();menu.focus();}});
const dialog=document.querySelector('dialog');
document.querySelectorAll('[data-contact]').forEach(button=>button.addEventListener('click',()=>{closeMenu();const service=button.closest('.service');const message=document.querySelector('#message');if(service && !message.value)message.value=`I would like help with ${service.querySelector('summary>span:nth-child(2)').textContent.toLowerCase()}.`;dialog.showModal();document.querySelector('#name').focus();}));
document.querySelector('.dialog-close').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
function inquiryText(){const data=new FormData(document.querySelector('#contact-form'));return `Hello Christa,\n\nMy name is ${data.get('name')}. I would like to discuss moving to Valencia.\n\nEmail: ${data.get('email')}\nTimeframe: ${data.get('timeframe')}\nSuggested package: ${document.querySelector('#package-name').textContent}\n\n${data.get('message')}\n\nThank you!`;}
document.querySelector('#contact-form').addEventListener('submit',e=>{
 e.preventDefault(); const body=inquiryText();
 let preview=document.querySelector('#inquiry-preview');
 if(!preview){preview=document.createElement('textarea');preview.id='inquiry-preview';preview.readOnly=true;preview.rows=8;preview.setAttribute('aria-label','Prepared email text');e.target.append(preview);}
 preview.value=body;
 let emailLink=document.querySelector('#prepared-email-link');
 if(!emailLink){emailLink=document.createElement('a');emailLink.id='prepared-email-link';emailLink.className='text-link';emailLink.textContent='Open this draft in my email app ↗';e.target.append(emailLink);}
 emailLink.href='mailto:info@moving2valencia.eu?subject='+encodeURIComponent('Consultation request · Moving to Valencia')+'&body='+encodeURIComponent(body);
 document.querySelector('#contact-status').textContent='Your draft is ready below. Review it, copy it, or open your email app. Nothing has been sent.';
 preview.focus();
});
const neighborhoods={
 ruzafa:{tag:'Culture & connection',title:'A little energy.\nA lot of character.',copy:'Cafés, independent shops and a lively local market. Ruzafa is an inviting starting point if you like city life on your doorstep.',tags:['Café culture','City living','Local markets'],image:'city_ruzafa',caption:'Mercat de Russafa · actual neighbourhood photography'},
 cabanyal:{tag:'Sea air & everyday life',title:'Your day,\na little closer to the sea.',copy:'A maritime neighborhood with colorful streets and a distinctive identity. Explore El Cabanyal if beach access and a strong local character are on your wish list.',tags:['Near the beach','Maritime character','Colorful streets'],image:'service_harbor',caption:'Malvarrosa beach · coastal context for your move'},
 pla:{tag:'Green spaces & calmer days',title:'Room to breathe.\nRoom to settle.',copy:'Close to the Turia gardens, Pla del Real offers a greener setting for everyday life. A starting point for those who value parks and a calmer residential atmosphere.',tags:['Turia gardens','Residential feel','Green spaces'],image:'service_school',caption:'The Turia Gardens · green-space context for your routine'}
};
const tabs=[...document.querySelectorAll('[data-neighborhood]')];
function activateTab(button){
 const item=neighborhoods[button.dataset.neighborhood];tabs.forEach(tab=>{tab.setAttribute('aria-selected',String(tab===button));tab.tabIndex=tab===button?0:-1;});
 document.querySelector('#neighborhood').setAttribute('aria-labelledby',button.id);
 document.querySelector('#neighborhood-tag').textContent=item.tag;
 const title=document.querySelector('#neighborhood-title');title.replaceChildren();item.title.split('\n').forEach((line,i)=>{if(i)title.append(document.createElement('br'));title.append(document.createTextNode(line));});
 document.querySelector('#neighborhood-copy').textContent=item.copy;
 document.querySelector('#neighborhood-tags').replaceChildren(...item.tags.map(text=>{const span=document.createElement('span');span.textContent=text;return span;}));
 const picture=document.querySelector('.city-photo img');picture.src=`assets/jury-photo-${item.image}-1440.webp`;picture.srcset=`assets/jury-photo-${item.image}-640.webp 640w, assets/jury-photo-${item.image}-1440.webp 1440w`;picture.alt=item.caption;
 document.querySelector('#city-caption').textContent=item.caption;
}
tabs.forEach((button,i)=>{button.addEventListener('click',()=>activateTab(button));button.addEventListener('keydown',e=>{let next;if(e.key==='ArrowRight')next=(i+1)%tabs.length;if(e.key==='ArrowLeft')next=(i+tabs.length-1)%tabs.length;if(e.key==='Home')next=0;if(e.key==='End')next=tabs.length-1;if(next!==undefined){e.preventDefault();tabs[next].focus();activateTab(tabs[next]);}});});
const packages={
 essential:{name:'Practical essentials',price:'Scope discussed together',features:['Pre-move priorities and orientation','Formalities and appointment preparation','Banking and local-services questions']},
 full:{name:'Home & family',price:'A plan around your household',features:['Pre-move planning','Home finding: renting or buying','School-finding priorities','Practical formalities and settling in']},
 executive:{name:'Tailored relocation',price:'Your priorities, in one plan',features:['A tailored combination of relocation services','Home and formalities priorities','Family and school support where needed','Local orientation and ongoing questions']}
};
function updatePackage(){const selected=document.querySelector('#support').value;const p=packages[selected];document.querySelector('#package-name').textContent=p.name;document.querySelector('#package-price').textContent=p.price;document.querySelector('#package-features').replaceChildren(...p.features.map(feature=>{const li=document.createElement('li');li.textContent=feature;return li;}));document.querySelector('#family-note').textContent=document.querySelector('#household').value==='family'?(selected==='essential'?'Moving with children? Ask about school support in the Home & family support.':'We’ll tailor the family and school conversation to your priorities.'):'';}
document.querySelector('#household').addEventListener('change',updatePackage);document.querySelector('#support').addEventListener('change',updatePackage);
const tasks=[...document.querySelectorAll('[data-task]')];const key='moving2valencia-review-checklist-v1';
try{const saved=JSON.parse(localStorage.getItem(key)||'{}');tasks.forEach(task=>task.checked=saved[task.dataset.task]===true);}catch{}
function updateProgress(save=false){const count=tasks.filter(t=>t.checked).length;document.querySelector('progress').value=count;document.querySelector('#progress-label').textContent=`${count} of 3 steps complete`;if(save){try{localStorage.setItem(key,JSON.stringify(Object.fromEntries(tasks.map(t=>[t.dataset.task,t.checked]))));}catch{document.querySelector('.plan-form .fine').firstChild.textContent='Device storage unavailable. Progress is kept for this visit. ';}}}
tasks.forEach(t=>t.addEventListener('change',()=>updateProgress(true)));document.querySelector('.reset').addEventListener('click',()=>{tasks.forEach(t=>t.checked=false);updateProgress(true);});updateProgress();


// A portable plan makes the selector useful beyond this review page.
document.querySelector('.save-plan')?.addEventListener('click',()=>{
 const p=packages[document.querySelector('#support').value];
 const text=`MY VALENCIA STARTING PLAN\n\nHousehold: ${document.querySelector('#household').selectedOptions[0].textContent}\nSuggested starting point: ${p.name} · ${p.price}\nPrices and scope to be confirmed with Christa.\n\nIncluded starting scope:\n${p.features.map(f=>'• '+f).join('\n')}\n\nMy next steps:\n${tasks.map(t=>`${t.checked?'[x]':'[ ]'} ${t.parentElement.textContent.trim()}`).join('\n')}\n\nContact: info@moving2valencia.eu\nThis is an exploration plan, not a booking or a quote.`;
 const url=URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='my-valencia-starting-plan.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
});
document.querySelector('.copy-inquiry')?.addEventListener('click',async()=>{
 const form=document.querySelector('#contact-form');if(!form.reportValidity())return;
 try{await navigator.clipboard.writeText(inquiryText());document.querySelector('#contact-status').textContent='Email text copied. Paste it into an email to info@moving2valencia.eu.';}
 catch{let preview=document.querySelector('#inquiry-preview');if(!preview){preview=document.createElement('textarea');preview.id='inquiry-preview';preview.readOnly=true;preview.rows=8;preview.setAttribute('aria-label','Prepared email text to copy');form.append(preview);}preview.value=inquiryText();preview.focus();preview.select();document.querySelector('#contact-status').textContent='Select and copy the prepared text below, then email info@moving2valencia.eu.';}
});
if('IntersectionObserver' in window){const sectionLinks=[...nav.querySelectorAll('a[href^="#"]')];const observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting)sectionLinks.forEach(link=>{if(link.hash==='#'+entry.target.id)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});},{rootMargin:'-15% 0px -65% 0px'});sectionLinks.forEach(link=>{const section=document.querySelector(link.hash);if(section)observer.observe(section);});}

// juryNameValidation: spaces are not a valid name; retain every field after errors.
 const juryNameInput=document.querySelector('#name');
 juryNameInput.addEventListener('input',()=>juryNameInput.setCustomValidity(juryNameInput.value.trim()?'':'Please enter your name.'));
 let juryContactOpener=null;
 document.querySelectorAll('[data-contact]').forEach(b=>b.addEventListener('click',()=>{juryContactOpener=b;}));
 dialog.addEventListener('close',()=>juryContactOpener?.focus({preventScroll:true}));
