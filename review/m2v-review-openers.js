/* Replay the film in the mounted preview, preserving the visitor's choices. */
(()=>{'use strict';const button=document.getElementById('replay-opener'),picker=document.getElementById('concept-picker');if(!button||!picker)return;
 const supported=new Set(['casa-editorial','blue-horizon','hola-valencia','valencia-plan','editorial-journey','valencia-bento','immersive-valencia','azahar','a-new-horizon','new-horizon-client']);
 const sync=()=>{button.hidden=!document.querySelector('#preview-surface iframe')||!supported.has(picker.value);};
 button.addEventListener('click',()=>document.querySelector('#preview-surface iframe')?.contentWindow.postMessage({type:'m2v:replay-opening'},location.protocol==='file:'?'*':location.origin));
 picker.addEventListener('change',sync);new MutationObserver(sync).observe(document.getElementById('preview-surface'),{childList:true,subtree:true,attributes:true,attributeFilter:['src']});sync();
})();
