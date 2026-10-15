// Exercise timing, keyboard dismissal and recovery without a live browser.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const script=fs.readFileSync(new URL('../review/m2v-openers.js',import.meta.url),'utf8');
function scenario({reduce=false,hash='',modalFailure=false,duration=4800,withVideo=false,immersive=false}={}){
 let now=0,id=0;const timers=new Map(),events={},mediaEvents={},classes=new Set();
 const control=()=>({hidden:false,textContent:'',events:{},addEventListener(t,f){this.events[t]=f;},setAttribute(k,v){this[k]=v;},getAttribute(k){return this[k];}});
 const pause=control(),skip=control(),enter=control(),replay=control();
 const previous={isConnected:true,focused:0,focus(){this.focused++;}};
 const film={style:{},offsetHeight:1};
 const stage=control(),portals=['city','soul','sea'].map(name=>Object.assign(control(),{'data-portal':name}));
 const movie={currentTime:12,playing:false,play(){this.playing=true;return Promise.resolve();},pause(){this.playing=false;}};
 const dialog={getAttribute(k){return k==='data-opener-for'?(immersive?'immersive-valencia':''):String(duration);},open:false,hidden:true,events:{},closed:0,classList:{add(...a){a.forEach(x=>classes.add(x));},remove(...a){a.forEach(x=>classes.delete(x));},toggle(x,on){on?classes.add(x):classes.delete(x);}},
 querySelector(s){return s==='[data-film-pause]'?pause:s==='[data-portal-stage]'?stage:s==='video[data-film-video]'?(withVideo?movie:null):film;},querySelectorAll(s){return s==='[data-portal]'?portals:[skip,enter];},addEventListener(t,f){this.events[t]=f;},showModal(){if(modalFailure)throw Error('Modal unavailable');this.open=true;},close(){this.open=false;this.closed++;this.events.close?.();}};
 const document={activeElement:previous,hidden:false,querySelector(s){return s==='.m2v-opening'?dialog:replay;},addEventListener(t,f){events[t]=f;},dispatchEvent(){}};
 const media={matches:reduce,addEventListener(t,f){mediaEvents[t]=f;}};
 const parent={};const context={document,parent,location:{hash,origin:'https://example.test',protocol:'https:'},matchMedia:()=>media,performance:{now:()=>now},CustomEvent:class{},addEventListener(t,f){events[t]=f;},setTimeout(fn,ms){timers.set(++id,{at:now+ms,fn});return id;},clearTimeout(key){timers.delete(key);}};
 vm.runInNewContext(script,context);
 function tick(ms){const end=now+ms;for(;;){const pending=[...timers.entries()].filter(([,x])=>x.at<=end).sort((a,b)=>a[1].at-b[1].at)[0];if(!pending)break;now=pending[1].at;timers.delete(pending[0]);pending[1].fn();}now=end;}
 return{dialog,pause,skip,enter,replay,previous,timers,classes,events,media,mediaEvents,parent,tick,movie,stage,portals};
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
s=scenario({withVideo:true,duration:9200});assert.equal(s.movie.currentTime,0);assert(s.movie.playing);s.pause.events.click();assert(!s.movie.playing);s.pause.events.click();assert(s.movie.playing);s.enter.events.click();s.tick(650);assert(!s.movie.playing);s.movie.currentTime=6;s.replay.events.click();assert.equal(s.movie.currentTime,0);assert(s.movie.playing);
s=scenario({withVideo:true,reduce:true});s.replay.events.click();assert(!s.movie.playing);
s=scenario({immersive:true,duration:7800,withVideo:true});assert.equal(s.stage['data-portal-stage'],'city');s.tick(1000);s.portals[2].events.click();assert.equal(s.stage['data-portal-stage'],'sea');assert.equal(s.portals[2]['aria-pressed'],'true');assert.equal(s.portals[0]['aria-pressed'],'false');s.tick(12000);assert(s.dialog.open);assert(s.classes.has('is-exploring'));s.enter.events.click();s.tick(650);assert(!s.dialog.open);s.replay.events.click();assert.equal(s.stage['data-portal-stage'],'city');assert(!s.classes.has('is-exploring'));
console.log('Passed: automatic entry, pause/resume, skip, replay, Escape, reduced motion, deep links, modal failure, preference changes, and replay sender checks.');
