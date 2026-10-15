// Exercise timing, keyboard dismissal and recovery without a live browser.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const script=fs.readFileSync(new URL('../review/m2v-openers.js',import.meta.url),'utf8');
function scenario({reduce=false,hash='',modalFailure=false,duration=4800}={}){
 let now=0,id=0;const timers=new Map(),events={},mediaEvents={},classes=new Set();
 const control=()=>({hidden:false,textContent:'',events:{},addEventListener(t,f){this.events[t]=f;},setAttribute(k,v){this[k]=v;}});
 const pause=control(),skip=control(),enter=control(),replay=control();
 const previous={isConnected:true,focused:0,focus(){this.focused++;}};
 const film={style:{},offsetHeight:1};
 const dialog={getAttribute(){return String(duration);},open:false,hidden:true,events:{},closed:0,classList:{add(...a){a.forEach(x=>classes.add(x));},remove(...a){a.forEach(x=>classes.delete(x));},toggle(x,on){on?classes.add(x):classes.delete(x);}},
 querySelector(s){return s==='[data-film-pause]'?pause:film;},querySelectorAll(){return[skip,enter];},addEventListener(t,f){this.events[t]=f;},showModal(){if(modalFailure)throw Error('Modal unavailable');this.open=true;},close(){this.open=false;this.closed++;this.events.close?.();}};
 const document={activeElement:previous,hidden:false,querySelector(s){return s==='.m2v-opening'?dialog:replay;},addEventListener(t,f){events[t]=f;},dispatchEvent(){}};
 const media={matches:reduce,addEventListener(t,f){mediaEvents[t]=f;}};
 const parent={};const context={document,parent,location:{hash,origin:'https://example.test',protocol:'https:'},matchMedia:()=>media,performance:{now:()=>now},CustomEvent:class{},addEventListener(t,f){events[t]=f;},setTimeout(fn,ms){timers.set(++id,{at:now+ms,fn});return id;},clearTimeout(key){timers.delete(key);}};
 vm.runInNewContext(script,context);
 function tick(ms){const end=now+ms;for(;;){const pending=[...timers.entries()].filter(([,x])=>x.at<=end).sort((a,b)=>a[1].at-b[1].at)[0];if(!pending)break;now=pending[1].at;timers.delete(pending[0]);pending[1].fn();}now=end;}
 return{dialog,pause,skip,enter,replay,previous,timers,classes,events,media,mediaEvents,parent,tick};
}
let s=scenario();assert.equal(s.dialog.open,true);s.tick(4799);assert.equal(s.dialog.open,true);s.tick(1);assert(s.classes.has('is-leaving'));s.tick(650);assert.equal(s.dialog.open,false);assert.equal(s.dialog.hidden,true);assert.equal(s.timers.size,0);assert.equal(s.previous.focused,1);
s=scenario();s.tick(1200);s.pause.events.click();s.tick(10000);assert.equal(s.dialog.open,true);assert.equal(s.pause['aria-pressed'],'true');s.pause.events.click();s.tick(3599);assert(!s.classes.has('is-leaving'));s.tick(651);assert.equal(s.dialog.open,false);
s=scenario();s.skip.events.click();s.tick(650);assert.equal(s.dialog.open,false);s.tick(10000);assert.equal(s.dialog.closed,1);s.replay.events.click();assert.equal(s.dialog.open,true);s.tick(10000);assert.equal(s.dialog.open,true);s.enter.events.click();s.tick(650);assert.equal(s.dialog.open,false);
s=scenario();let prevented=false;s.dialog.events.cancel({preventDefault(){prevented=true;}});s.tick(650);assert(prevented);assert.equal(s.dialog.open,false);
s=scenario({reduce:true});assert.equal(s.dialog.open,false);s.replay.events.click();assert.equal(s.dialog.open,true);assert.equal(s.pause.hidden,true);s.tick(10000);assert.equal(s.dialog.open,true);s.enter.events.click();s.tick(0);assert.equal(s.dialog.open,false);
s=scenario({hash:'#services'});assert.equal(s.dialog.open,false);
s=scenario({modalFailure:true});assert.equal(s.dialog.hidden,true);assert.equal(s.dialog.open,false);
s=scenario();s.tick(1000);s.media.matches=true;s.mediaEvents.change();assert.equal(s.dialog.open,false);assert.equal(s.timers.size,0);
s=scenario();s.events.message({source:{},origin:'https://example.test',data:{type:'m2v:replay-opening'}});s.tick(5450);assert.equal(s.dialog.closed,1);s.events.message({source:s.parent,origin:'https://example.test',data:{type:'m2v:replay-opening'}});assert.equal(s.dialog.open,true);
s=scenario({duration:6200});s.tick(6199);assert.equal(s.dialog.open,true);assert(!s.classes.has('is-leaving'));s.tick(1);assert(s.classes.has('is-leaving'));s.tick(650);assert.equal(s.dialog.open,false);
console.log('Passed: automatic entry, pause/resume, skip, replay, Escape, reduced motion, deep links, modal failure, preference changes, and replay sender checks.');
