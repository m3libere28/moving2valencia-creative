// Local review instrumentation. Inactive on normal visitor URLs; no transmission.
(() => {
 if(!new URLSearchParams(location.search).has('jury-audit'))return;
 const base=document.currentScript.src;
 const results={device:{width:innerWidth,height:innerHeight},environment:'Local Chromium lab sample; not field p75 or a real-phone measurement',lcpMs:null,cls:0,longTasks:[],axe:null};
 results.sourceSha=document.querySelector('meta[name="jury-source-sha"]')?.content||null;
 const observers=[];
 function observe(type,fn){try{const o=new PerformanceObserver(list=>list.getEntries().forEach(fn));o.observe({type,buffered:true});observers.push(o);}catch{}}
 observe('largest-contentful-paint',e=>results.lcpMs=Math.round(e.startTime));
 observe('layout-shift',e=>{if(!e.hadRecentInput)results.cls+=e.value;});
 observe('longtask',e=>results.longTasks.push(Math.round(e.duration)));
 let output=document.createElement('pre');output.id='jury-audit-results';output.hidden=true;document.body.append(output);
 const styles=document.createElement('style');styles.textContent='#jury-audit-results{display:none!important}';document.head.append(styles);
 function write(){results.device={width:innerWidth,height:innerHeight};results.cls=Number(results.cls.toFixed(4));output.textContent=JSON.stringify(results);}
 let busy=false;
 async function run(){
  if(busy || !window.axe)return;busy=true;
  try{
   const a=await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']},resultTypes:['violations']});
   results.axe={version:axe.version,violations:a.violations.map(v=>({id:v.id,impact:v.impact,description:v.description,nodes:v.nodes.map(n=>({target:n.target,html:n.html.slice(0,400),summary:n.failureSummary})).slice(0,30)}))};
  }catch(e){results.axe={error:e.message};}finally{busy=false;results.layout={viewport:innerWidth,documentWidth:document.documentElement.scrollWidth,overflow:document.documentElement.scrollWidth>innerWidth+1};results.completedAt=new Date().toISOString();write();output.dataset.auditComplete='true';}
 }
 const script=document.createElement('script');script.src=new URL('vendor/axe.min.js',base).href;script.onload=()=>setTimeout(run,500);script.onerror=()=>{results.axe={error:'Audit engine could not load'};write();};document.head.append(script);
 let timer;
 document.addEventListener('click',()=>{clearTimeout(timer);timer=setTimeout(run,700);},{passive:true});
 window.addEventListener('resize',()=>{clearTimeout(timer);timer=setTimeout(run,700);},{passive:true});
 write();
})();
