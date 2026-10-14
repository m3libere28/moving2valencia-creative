document.documentElement.classList.add('js');
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const FINE=matchMedia('(pointer:fine)').matches;
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),lerp=(a,b,t)=>a+(b-a)*t,ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
const prog=el=>{const r=el.getBoundingClientRect();return clamp(-r.top/(el.offsetHeight-innerHeight))};
document.querySelectorAll('[data-since]').forEach(b=>{const y=new Date().getFullYear()-(+b.dataset.since);b.dataset.count=y;b.textContent=y});
document.querySelectorAll('img[data-k]').forEach(i=>{const k=i.dataset.k;i.decoding='async';if(!i.closest('#pre'))i.loading='lazy';i.sizes=i.dataset.sizes||'(max-width:700px) 100vw, 60vw';i.srcset=`${IMGS[k]} ${k==='christa'?500:800}w, ${IMG[k]} ${k==='christa'?900:1600}w`;i.src=IMGS[k]});

/* smooth scroll */
let lenis=null;
if(window.Lenis&&!RM){lenis=new Lenis({lerp:.085,smoothWheel:true});(function r(t){lenis.raf(t);requestAnimationFrame(r)})(performance.now())}
const goTo=t=>lenis?lenis.scrollTo(t,{duration:1.6}):t.scrollIntoView({behavior:'smooth'});
document.addEventListener('click',e=>{const a=e.target.closest('a[href^="#"]');if(!a)return;const id=a.getAttribute('href');const t=id.length>1&&document.querySelector(id);if(t){e.preventDefault();closeMenu(false);goTo(t)}});

/* loader: a tilted wall of real Valencia photos behind a fast counter; skippable, once per session, never locks scrolling */
(()=>{const pre=document.getElementById('pre'),root=document.documentElement;
 const ready=()=>document.body.classList.add('ready');
 if(root.classList.contains('seen')||RM){pre.style.display='none';ready();return}
 const fr=document.getElementById('pframe'),num=document.getElementById('pnum'),wall=document.getElementById('pwall'),pl=document.getElementById('pplace'),N=window.RNAMES||{};
 const R=['cathedral','mercado','carmen','beach','skyline','paella','fallas','ruzafa','turia','oldtown','promenade','cacday','benimaclet'];
 const cw=Math.min(230,Math.max(150,innerWidth*.14))+Math.min(16,Math.max(8,innerWidth*.012)),cols=Math.ceil(Math.max(innerWidth,innerHeight)*1.5/cw)+1;let html='';
 for(let c=0;c<cols;c++){const list=[];for(let r=0;r<(innerWidth<700?4:6);r++)list.push(R[(c*3+r*2)%R.length]);html+=`<div class="pcol">${[...list,...list].map(k=>`<img src="img/${k}-240.webp" fetchpriority="low" alt="" decoding="async">`).join('')}</div>`}
 wall.innerHTML=html;requestAnimationFrame(()=>pre.classList.add('wall-on'));
 const seq=['cathedral','mercado','carmen','paella','beach','fallas','benimaclet','cac'];
 fr.innerHTML=seq.map(k=>`<img src="${k==='cac'?IMGS[k]:IMGT[k]}" alt="">`).join('');const ims=[...fr.children];
 let i=0,done=false;ims[0].classList.add('on');pl.textContent=N[seq[0]]||'València';
 const flick=setInterval(()=>{ims[i].classList.remove('on');i=(i+1)%(ims.length-1);ims[i].classList.add('on');pl.textContent=N[seq[i]]||'València'},150);
 const t0=performance.now(),DUR=1100;
 function finish(fast){if(done)return;done=true;clearInterval(flick);num.textContent='100';try{sessionStorage.setItem('m2vSeen','1')}catch(e){}
  ['wheel','touchstart','keydown','pointerdown'].forEach(ev=>removeEventListener(ev,skip));
  if(fast){pre.classList.add('done');ready();setTimeout(()=>pre.style.display='none',520);return}
  ims.forEach(m=>m.classList.remove('on'));ims[ims.length-1].classList.add('on');pl.textContent=N.cac||'València';pre.classList.add('opening');
  setTimeout(()=>fr.classList.add('full'),120);setTimeout(()=>{pre.classList.add('done');ready();setTimeout(()=>pre.style.display='none',520)},850)}
 function skip(e){if(e.type==='keydown'&&e.key==='Tab')return;finish(true)}
 ['wheel','touchstart','keydown','pointerdown'].forEach(ev=>addEventListener(ev,skip,{passive:true}));
 (function tick(n){if(done)return;const q=Math.min(1,(n-t0)/DUR);num.textContent=String(Math.round(100*(1-Math.pow(1-q,2)))).padStart(3,'0');if(q<1)requestAnimationFrame(tick);else finish(false)})(t0);
})();

/* bar, menu, chapter indicator */
const nav=document.getElementById('nav'),menu=document.getElementById('menu'),mth=document.getElementById('mthumb');
const mBtn=document.getElementById('menuBtn');
const openMenu=()=>{menu.classList.add('open');mBtn.setAttribute('aria-expanded','true');lenis&&lenis.stop();setTimeout(()=>menu.querySelector('a').focus(),80)};
const closeMenu=(back=true)=>{if(!menu.classList.contains('open'))return;menu.classList.remove('open');mBtn.setAttribute('aria-expanded','false');lenis&&lenis.start();if(back)mBtn.focus()};
mBtn.onclick=openMenu;
document.getElementById('menuClose').onclick=()=>closeMenu();
menu.querySelectorAll('a').forEach(a=>{a.addEventListener('pointerenter',()=>{mth.querySelector('img').src=IMGT[a.dataset.img];mth.classList.add('on')});a.addEventListener('pointerleave',()=>mth.classList.remove('on'))});
(()=>{const ind=document.getElementById('chapind'),secs=[...document.querySelectorAll('[data-ch]')];let cur='I';
 (function f(){let n=secs[0];for(const s of secs){if(s.getBoundingClientRect().top<innerHeight*.5)n=s}const [k,t]=n.dataset.ch.split('|');
  if(k!==cur){cur=k;ind.classList.add('swap');setTimeout(()=>{chN.textContent=k;chT.textContent=t;ind.classList.remove('swap')},320)}setTimeout(()=>requestAnimationFrame(f),120)})()})();

/* split text */
document.querySelectorAll('[data-split]').forEach(el=>{let i=0;(function walk(n){[...n.childNodes].forEach(c=>{if(c.nodeType===3){const f=document.createDocumentFragment();c.textContent.split(/(\s+)/).forEach(tok=>{if(!tok)return;if(/^\s+$/.test(tok)){f.append(' ');return}const w=document.createElement('span');w.className='w';const s=document.createElement('span');s.textContent=tok;s.style.setProperty('--i',i++);w.append(s);f.append(w)});c.replaceWith(f)}else if(c.nodeType===1&&c.tagName!=='BR')walk(c)})})(el)});
(()=>{const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.18});
 document.querySelectorAll('[data-split],.fade').forEach(e=>io.observe(e));
 const io2=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.querySelectorAll('[data-reveal]').forEach(r=>r.classList.add('in'));io2.unobserve(e.target)}}),{threshold:.15});
 document.querySelectorAll('[data-reveal]').forEach(r=>io2.observe(r.parentElement))})();

/* counters */
(()=>{const io=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;const el=e.target;io.unobserve(el);const n=+el.dataset.count,t0=performance.now();(function a(t){const q=Math.min(1,(t-t0)/1700);el.textContent=Math.round(n*(1-Math.pow(1-q,3)))+(q===1?(el.dataset.suffix||''):'');if(q<1)requestAnimationFrame(a)})(t0)}),{threshold:.4});
 document.querySelectorAll('[data-count]').forEach(e=>io.observe(e))})();

/* II · chaos to order */
const DOCS=['NIE','TIE','Empadronamiento','Cita previa','Apostilla de La Haya','Traducción jurada','Certificado UE','Modelo 790','Tasa 012','Seguridad Social','Tarjeta SIP','Cuenta bancaria','Fianza','Contrato de alquiler','Matrícula escolar','Canje de carnet','Certificado digital','Gestoría'];
const chaos=(()=>{const box=document.getElementById('chaos');box.innerHTML=DOCS.map(d=>`<span class="cw"><i class="tk">✓</i><span class="lb">${d}</span></span>`).join('');
 const els=[...box.children],R=els.map(()=>({x:Math.random()*2-1,y:Math.random()*2-1,z:-Math.random()*420+120,r:(Math.random()-.5)*70,ry:(Math.random()-.5)*90,s:.75+Math.random()*1.5,ph:Math.random()*6.3}));
 let bw=0,bh=0,ws=[];function measure(){bw=box.clientWidth;bh=box.clientHeight;ws=els.map(e=>e.offsetWidth)}measure();addEventListener('resize',measure);
 const sec=document.getElementById('doubt');let last=-1;
 return t=>{const r=sec.getBoundingClientRect();if(r.bottom<0||r.top>innerHeight)return;const p=prog(sec);const m=ease(clamp((p-.28)/.42));
  const rows=Math.ceil(els.length/2),rowH=Math.min(bw<600?30:46,bh/rows),gw=Math.min(bw,880),x0=(bw-gw)/2,y0=Math.max(0,(bh-rows*rowH)/2);
  els.forEach((e,i)=>{const q=R[i],col=i<rows?0:1,row=i%rows;
   const cx=(q.x*.5+.5)*Math.max(0,bw-ws[i]*q.s)+Math.sin(t*.6+q.ph)*34,cy=(q.y*.5+.5)*Math.max(0,bh-30)+Math.cos(t*.5+q.ph)*22;
   const ox=x0+col*gw/2,oy=y0+row*rowH;const z=q.z*(1-m);
   e.style.transform=`translate3d(${lerp(cx,ox,m)}px,${lerp(cy,oy,m)}px,${z}px) rotateZ(${q.r*(1-m)}deg) rotateY(${q.ry*(1-m)}deg) scale(${lerp(q.s,1,m)})`;
   e.style.opacity=lerp(clamp(.35+(q.z+300)/420),1,m);
   e.classList.toggle('done',p>.74+i*.0115)});
  const done=els.filter(e=>e.classList.contains('done')).length;if(done!==last){last=done;dCount.textContent=String(DOCS.length-done).padStart(2,'0')}
  const ord=m>.55;dA.classList.toggle('off',ord);dB.classList.toggle('off',!ord);dState.textContent=done===DOCS.length?'Handled. Every one.':ord?'Christa’s order':'Spanish bureaucracy, unsorted'}})();

/* main scroll loop: progress line, hero fade, chaos, table, morning, cursor */
(()=>{const dock=document.getElementById('dock'),pl=document.getElementById('prog'),fly=document.getElementById('top'),ff=document.getElementById('flyFade'),tb=document.getElementById('table'),pt=document.getElementById('plate'),pim=pt.querySelector('img'),t2=document.getElementById('t2'),mo=document.getElementById('morning'),sun=document.getElementById('sun'),sim=sun.querySelector('img'),mc=document.getElementById('mcta'),cur=document.getElementById('cur'),ct=document.getElementById('curTxt');
 let mx=innerWidth/2,my=innerHeight/2,cx=mx,cy=my;addEventListener('pointermove',e=>{mx=e.clientX;my=e.clientY},{passive:true});
 if(FINE){document.addEventListener('pointerover',e=>{const l=e.target.closest('[data-c],a,button,summary,input,select,textarea,.hood');if(!l){cur.className='cur';return}const c=l.dataset.c;if(c&&c!=='link'){cur.className='cur big';ct.textContent=c}else{cur.className='cur link';ct.textContent=''}})}
 let SH=document.documentElement.scrollHeight;new ResizeObserver(()=>{SH=document.documentElement.scrollHeight}).observe(document.body);
 function f(ts){const t=ts/1000,H=SH-innerHeight;const pv=`scaleX(${(H>0?scrollY/H:0).toFixed(4)})`;if(pv!==f.pv){f.pv=pv;pl.style.transform=pv}nav.classList.toggle('solid',scrollY>innerHeight*.5);
  const fo=clamp((prog(fly)-.86)/.12).toFixed(3);if(fo!==f.fo){f.fo=fo;ff.style.opacity=fo}
  chaos(t);
  {const r=tb.getBoundingClientRect();if(r.bottom>0&&r.top<innerHeight){const p=prog(tb),k=ease(clamp(p/.55)),side=innerWidth<700?8:30;pt.style.clipPath=`inset(${lerp(46,0,k)}% ${lerp(side,0,k)}% ${lerp(8,0,k)}% ${lerp(side,0,k)}% round ${lerp(18,0,k)}px)`;pim.style.transform=`scale(${lerp(1.45,1.04,k)+p*.06})`;pt.style.setProperty('--o',clamp((p-.45)/.2));t2.classList.toggle('on',p>.55)}}
  {const r=mo.getBoundingClientRect();if(r.bottom>0&&r.top<innerHeight){const p=prog(mo),k=ease(clamp(p/.6));sun.style.clipPath=`circle(${lerp(5,150,k)}% at 50% ${lerp(64,50,k)}%)`;sim.style.transform=`scale(${lerp(1.35,1.02,k)}) translateY(${lerp(6,0,k)}%)`;mc.classList.toggle('on',p>.55)}}
  {const hb=fly.getBoundingClientRect().bottom,mb=document.getElementById('morning').getBoundingClientRect().top,op=menu.classList.contains('open')||document.getElementById('modal').classList.contains('open');dock.classList.toggle('on',hb<innerHeight*.5&&mb>innerHeight*.35&&!op)}
  if(FINE&&(Math.abs(mx-cx)>.3||Math.abs(my-cy)>.3)){cx+=(mx-cx)*.2;cy+=(my-cy)*.2;cur.style.transform=`translate(${cx}px,${cy}px)`}
  requestAnimationFrame(f)}requestAnimationFrame(f)})();

/* magnetic buttons */
if(FINE)document.querySelectorAll('.btn').forEach(b=>{b.addEventListener('pointermove',e=>{const r=b.getBoundingClientRect();b.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.22}px,${(e.clientY-r.top-r.height/2)*.3}px)`});b.addEventListener('pointerleave',()=>b.style.transform='')});

/* copy */
document.querySelectorAll('[data-copy]').forEach(b=>b.addEventListener('click',()=>{const v=b.dataset.copy,o=b.textContent;const done=()=>{b.textContent='Copied';setTimeout(()=>b.textContent=o,1600)};navigator.clipboard?navigator.clipboard.writeText(v).then(done,()=>{b.textContent=v}):(b.textContent=v)}));

/* I · living photo: the real sunset photo gets depth (painted depth map), a scroll dolly with parallax,
   rippling reflections, drifting sky, a breathing sun, then drains to grey when the paperwork arrives */
(()=>{
 const host=document.getElementById('top'),cv=document.getElementById('gl'),stick=host.querySelector('.fly-stick');
 const stages=[...host.querySelectorAll('.stage')],labels=['Hemisfèric','Reflection','L’Umbracle','Dusk'];
 const gl=cv.getContext('webgl',{antialias:false,premultipliedAlpha:false});
 const fallback=()=>{cv.style.display='none';stick.style.background=`center/cover url(${IMG.cac})`};
 if(!gl){fallback();return}
 const VS='attribute vec2 a;varying vec2 v;void main(){v=a*.5+.5;gl_Position=vec4(a,0.,1.);}';
 const FS=`precision highp float;varying vec2 v;uniform sampler2D uI,uD;uniform vec2 uR,m;uniform float t,p,asp;
 float h(vec2 q){return fract(sin(dot(q,vec2(127.1,311.7)))*43758.5453);}
 float n(vec2 q){vec2 i=floor(q),f=fract(q);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+1.),f.x),f.y);}
 void main(){
  float ir=1.799;vec2 s=asp>ir?vec2(1.,ir/asp):vec2(asp/ir,1.);vec2 uv=(v-.5)*s+.5;
  float k=smoothstep(0.,.78,p);
  vec2 c=mix(vec2(.41,.52),vec2(.78,.5),smoothstep(.22,.66,p));
  float z=k*.42;
  vec2 q=uv;float d=texture2D(uD,q).r;
  for(int i=0;i<4;i++){q=c+(uv-c)/(1.04+z*(.78+.22*d))+m*(d-.35)*.022;d=texture2D(uD,q).r;}
  vec3 dm=texture2D(uD,q).rgb;float w=dm.g,sk=dm.b;
  q.x+=(sin(q.y*220.-t*1.4+sin(q.x*14.+t*.6)*2.)*.0009+(n(q*vec2(30.,140.)+t*.4)-.5)*.0018)*w;
  q.y+=sin(q.x*46.+t*1.1)*.0005*w;
  q+=(vec2(n(q*3.+vec2(t*.035,0.)),n(q*3.+vec2(0.,t*.03)+7.))-.5)*.014*sk;
  q.x+=sin(t*.06)*.006*sk;
  float fd=mix(.6,.32,smoothstep(.22,.66,p));float br=(.0009+.0075*k)*smoothstep(.06,.32,abs(d-fd));
  vec3 col=texture2D(uI,q).rgb*.2;
  for(int i=0;i<8;i++){float an=float(i)*.785+.39;col+=texture2D(uI,q+vec2(cos(an),sin(an)*asp)*br/vec2(1.,asp)).rgb*.1;}
  float sh=pow(max(0.,n(q*vec2(380.,55.)+vec2(0.,t*2.2))-.62),3.)*w*7.;
  col+=vec3(1.,.82,.55)*sh*.4;
  vec2 sp=vec2(.93,.62);float sd=length((q-sp)*vec2(1.7,1.));
  col+=vec3(1.,.55,.25)*exp(-sd*6.5)*(.22+.4*k+.07*sin(t*1.3));
  col+=vec3(1.,.45,.2)*.10*smoothstep(.5,1.,v.x)*(.5+.5*sin(t*.4))*(1.-k*.5);
  col=mix(col,col*vec3(1.08,.97,.86),.25+.35*k);
  float g=smoothstep(.6,.84,p);float l=dot(col,vec3(.299,.587,.114));
  col=mix(col,vec3(l)*vec3(.80,.85,1.)*.5,g);
  col*=mix(.6,1.,smoothstep(1.05,.32,length(v-.5)));
  col+=(h(v*uR+fract(t))-.5)*.055;
  gl_FragColor=vec4(col,1.);}`;
 const sh=(type,src)=>{const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw gl.getShaderInfoLog(s);return s};
 let pr;try{pr=gl.createProgram();gl.attachShader(pr,sh(gl.VERTEX_SHADER,VS));gl.attachShader(pr,sh(gl.FRAGMENT_SHADER,FS));gl.linkProgram(pr);if(!gl.getProgramParameter(pr,gl.LINK_STATUS))throw gl.getProgramInfoLog(pr)}catch(e){console.warn(e);fallback();return}
 gl.useProgram(pr);
 const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
 const al=gl.getAttribLocation(pr,'a');gl.enableVertexAttribArray(al);gl.vertexAttribPointer(al,2,gl.FLOAT,false,0,0);
 const U=n=>gl.getUniformLocation(pr,n),uT=U('t'),uP=U('p'),uA=U('asp'),uR=U('uR'),uM=U('m');
 let ready=0;
 const tex=(src,unit,name)=>{const t=gl.createTexture(),im=new Image();im.onload=()=>{gl.activeTexture(gl.TEXTURE0+unit);gl.bindTexture(gl.TEXTURE_2D,t);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,im);
   [gl.TEXTURE_WRAP_S,gl.TEXTURE_WRAP_T].forEach(w=>gl.texParameteri(gl.TEXTURE_2D,w,gl.CLAMP_TO_EDGE));gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
   gl.uniform1i(U(name),unit);ready++};im.src=src};
 const startTex=()=>{tex(innerWidth>1100?'img/cac-2400.webp':innerWidth<700?IMGS.cac:IMG.cac,0,'uI');tex('img/depth.png',1,'uD')};
 if(document.body.classList.contains('ready'))startTex();else{const mo=new MutationObserver(()=>{if(document.body.classList.contains('ready')){mo.disconnect();(window.requestIdleCallback||setTimeout)(startTex,{timeout:400})}});mo.observe(document.body,{attributes:true,attributeFilter:['class']})}
 function rs(){const dpr=innerWidth<700?.75:Math.min(devicePixelRatio||1,1.25);cv.width=Math.round(cv.clientWidth*dpr);cv.height=Math.round(cv.clientHeight*dpr);gl.viewport(0,0,cv.width,cv.height)}rs();addEventListener('resize',rs);
 let mx=0,my=0,sx=0,sy=0,sp=0,last=-1,fc=0;addEventListener('pointermove',e=>{mx=e.clientX/innerWidth-.5;my=e.clientY/innerHeight-.5},{passive:true});
 function f(ts){const r=host.getBoundingClientRect();const vis=r.bottom>0&&r.top<innerHeight;
  const p=clamp(-r.top/(host.offsetHeight-innerHeight));sp+=(p-sp)*.08;sx+=(mx-sx)*.05;sy+=(my-sy)*.05;
  const moving=Math.abs(p-sp)>.0005||Math.abs(mx-sx)>.002||Math.abs(my-sy)>.002;fc++;
  if(vis&&ready===2&&document.body.classList.contains('ready')&&(moving||fc%2===0)){gl.uniform1f(uT,RM?0:ts/1000);gl.uniform1f(uP,sp);gl.uniform1f(uA,cv.width/cv.height);gl.uniform2f(uR,cv.width,cv.height);gl.uniform2f(uM,sx,-sy);gl.drawArrays(gl.TRIANGLES,0,3)}
  const st=Math.min(3,Math.floor(p*4.2));if(st!==last){last=st;stages.forEach((s,i)=>s.classList.toggle('on',i===st))}
  const fh=(p*100).toFixed(2)+'%',fl=labels[Math.min(3,Math.floor(p*4))];if(fh!==f.h){f.h=fh;flyFill.style.height=fh}if(fl!==f.l){f.l=fl;flyLbl.textContent=fl}
  requestAnimationFrame(f)}
 requestAnimationFrame(f);
})();

/* III type wall */
(()=>{const sec=document.getElementById('typo'),rows=[...sec.querySelectorAll('.trow')],vw=document.getElementById('vword'),ls=[...vw.querySelectorAll('.vl')],vo=vw.querySelector('.vo'),th=document.getElementById('tthumb');
 const names=['Torres de Serranos','Hemisfèric at dusk','La Malvarrosa','Mercat Central','From the Micalet'];
 /* the photos inside the letters load only as the section approaches */
 new IntersectionObserver((es,o)=>{if(!es.some(e=>e.isIntersecting))return;o.disconnect();const set=innerWidth<900?IMGS:IMG;ls.forEach(l=>l.style.backgroundImage=`url(${set[l.dataset.k]})`)},{rootMargin:'800px 0px'}).observe(sec);
 let tx=0,ty=0,cx=0,cy=0,cur=0,hx=0,hy=0;
 sec.addEventListener('pointermove',e=>{const b=sec.getBoundingClientRect();tx=(e.clientX-b.left)/b.width-.5;ty=(e.clientY-b.top)/b.height-.5;hx=e.clientX;hy=e.clientY;th.style.left=hx+'px';th.style.top=hy+'px'});
 sec.addEventListener('pointerleave',()=>{tx=ty=0;th.classList.remove('on')});
 sec.querySelectorAll('.tw[data-img]').forEach(w=>{w.addEventListener('pointerenter',()=>{th.querySelector('img').src=IMGT[w.dataset.img];th.classList.add('on')});w.addEventListener('pointerleave',()=>th.classList.remove('on'))});
 (function f(ts){const b=sec.getBoundingClientRect();if(b.bottom>0&&b.top<innerHeight){const t=RM?0:ts/1000,p=clamp((innerHeight-b.top)/(innerHeight+b.height));
   rows.forEach((r,i)=>{const tin=r.firstChild,half=tin.scrollWidth/2,d=+r.dataset.dir,off=(p*innerWidth*.9+t*(18+i*6))%half;tin.style.transform=`translate3d(${d<0?-off:off-half}px,0,0)`});
   cx+=(tx-cx)*.08;cy+=(ty-cy)*.08;
   vw.style.transform=`rotateX(${-cy*16}deg) rotateY(${cx*22}deg)`;
   ls.forEach(l=>l.style.backgroundPosition=`${50+cx*14}% ${50+(p-.5)*40}%`);
   vo.style.transform=`translate3d(${cx*-18+6}px,${cy*-12+6}px,0)`;
   const idx=Math.min(ls.length-1,Math.floor(clamp((p-.15)/.7)*ls.length));if(idx!==cur){ls[cur].classList.remove('on');ls[idx].classList.add('on');cur=idx;vIdx.textContent='0'+(idx+1);vName.textContent=names[idx]}}
  requestAnimationFrame(f)})(0)})();

/* postcard photos: fetched as the section approaches, since the track moves sideways past the lazy-load check */
{const pcs=document.getElementById('postcards');new IntersectionObserver((es,o)=>{if(es.some(e=>e.isIntersecting)){o.disconnect();pcs.querySelectorAll('img').forEach(i=>i.loading='eager')}},{rootMargin:'900px 0px'}).observe(pcs)}
/* postcards: scroll drives the track sideways; each card swings on a 3D arc with inner parallax */
(()=>{const sec=document.getElementById('postcards'),tr=document.getElementById('postTrack'),cs=[...tr.children];
 function f(){const r=sec.getBoundingClientRect();if(r.bottom>-50&&r.top<innerHeight+50){const p=Math.max(0,Math.min(1,-r.top/(sec.offsetHeight-innerHeight)));
  const last=cs[cs.length-1],pad=parseFloat(getComputedStyle(tr).paddingRight)||0,max=Math.max(0,last.offsetLeft+last.offsetWidth+pad-innerWidth),x=-p*max;
  tr.style.transform=`translate3d(${x}px,0,0)`;const mob=innerWidth<700;
  cs.forEach(c=>{const d=(c.offsetLeft+c.offsetWidth/2+x-innerWidth/2)/innerWidth;const k=Math.max(-1.2,Math.min(1.2,d));c.style.transform=`rotateY(${k*(mob?-18:-28)}deg) translateZ(${-Math.abs(k)*(mob?90:220)}px)`;c.querySelector('img').style.transform=`scale(1.25) translateX(${k*-10}%)`})}
  requestAnimationFrame(f)}f()})();

/* IV barrio finder: preferences re-rank the barrios (FLIP animated); the top match fills the photo panel */
(()=>{const H={
 cabanyal:{n:'Cabanyal',tag:'Beach families',img:'beach',cap:'La Malvarrosa, the beach at Cabanyal’s door',xy:[178,60],s:{beach:5,family:4,night:3,calm:3,char:4},t:'Tiled fishermen’s houses, the Malvarrosa promenade and Saturday paella on the sand. Fast-changing and full of character.',d:[]},
 ruzafa:{n:'Ruzafa',tag:'Creatives & first-timers',img:'ruzafa',cap:'Mercat de Russafa',xy:[96,112],s:{beach:2,family:2,night:5,calm:1,char:4},t:'Brunch cafés, galleries and a covered market. Lively until late, five minutes from the old town and the Túria park.',d:[]},
 carmen:{n:'El Carmen',tag:'History lovers',img:'carmen',cap:'Torres de Serranos, El Carmen’s medieval gate',xy:[78,82],s:{beach:1,family:2,night:4,calm:2,char:5},t:'Medieval lanes inside the old walls, street art and quiet plazas. Older flats with character, fewer lifts.',d:[]},
 benimaclet:{n:'Benimaclet',tag:'Community-minded',img:'benimaclet',cap:'Murals at the Terra social centre, Benimaclet',xy:[120,40],s:{beach:3,family:4,night:2,calm:4,char:4},t:'A former village absorbed by the city. Cooperatives, a weekly market, young families, and the huerta orchards at its edge.',d:[]},
 campanar:{n:'Campanar',tag:'Space & schools',img:'turia',cap:'The Túria gardens, which start in Campanar',xy:[34,62],s:{beach:1,family:5,night:1,calm:5,char:2},t:'Newer buildings with pools and parking, big parks and several schools nearby. Calm, practical, family-sized flats.',d:[]},
 ciencias:{n:'Ciutat de les Arts',tag:'Modern living',img:'cacday',cap:'Museu de les Ciències',xy:[150,92],s:{beach:4,family:4,night:2,calm:4,char:2},t:'Contemporary towers around the City of Arts and Sciences. Concierge buildings, the end of the Túria park and quick beach access.',d:[]}};
 const keys=Object.keys(H),list=document.getElementById('flist'),chips=[...document.querySelectorAll('#chips button')],dots=document.getElementById('fDots'),line=document.getElementById('fLine'),pin=document.querySelector('.fpin');
 let A=document.getElementById('fA'),B=document.getElementById('fB'),cur=null;
 dots.innerHTML=keys.map(k=>`<circle class="dot" data-h="${k}" cx="${H[k].xy[0]}" cy="${H[k].xy[1]}" r="3.2"/>`).join('')+'<circle class="ring" id="fRing" r="3.2"/>';
 list.innerHTML=keys.map(k=>`<li data-h="${k}"><button class="frow"><span class="fr-n">01</span><span class="fr-name">${H[k].n}</span><span class="fr-pc">Explore</span><span class="fr-tag">${H[k].tag}</span><span class="fr-bar"><i></i></span></button></li>`).join('');
 const items=[...list.children];
 function show(k,pct,rank){if(cur===k){fPct.textContent='Preference view';fRank.textContent=rank;return}cur=k;const h=H[k];
  B.src=IMG[h.img];B.alt=h.n;B.classList.remove('off');A.classList.add('off');[A,B]=[B,A];
  pin.classList.add('swap');setTimeout(()=>{fName.textContent=h.n;fTag.textContent=h.tag;fCap.textContent='Photo · '+h.cap;fText.textContent=h.t;fPct.textContent='Preference view';fRank.textContent=rank;fDist.innerHTML='<div><b>Discuss</b><span>Budget, transport and daily priorities</span></div>';pin.classList.remove('swap')},260);
  dots.querySelectorAll('.dot').forEach(d=>d.classList.toggle('on',d.dataset.h===k));const r=document.getElementById('fRing');r.setAttribute('cx',h.xy[0]);r.setAttribute('cy',h.xy[1]);
  line.setAttribute('d',`M${h.xy[0]} ${h.xy[1]} Q ${(h.xy[0]+92)/2} ${Math.min(h.xy[1],96)-18} 92 96`);
  items.forEach(li=>li.classList.toggle('on',li.dataset.h===k))}
 let scores={};
 function rank(){const sel=chips.filter(c=>c.getAttribute('aria-pressed')==='true').map(c=>c.dataset.k);const use=sel.length?sel:['beach','family','night','calm','char'];
  keys.forEach(k=>{const raw=use.reduce((a,c)=>a+H[k].s[c],0);scores[k]=Math.round(raw/(use.length*5)*100)});
  const first=new Map(items.map(li=>[li,li.getBoundingClientRect().top]));
  const order=[...items].sort((a,b)=>scores[b.dataset.h]-scores[a.dataset.h]);
  order.forEach((li,i)=>{list.append(li);li.querySelector('.fr-n').textContent=String(i+1).padStart(2,'0');li.querySelector('.fr-pc').textContent='Explore';li.querySelector('.fr-bar i').style.width=scores[li.dataset.h]+'%'});
  if(!RM)order.forEach(li=>{const dy=first.get(li)-li.getBoundingClientRect().top;if(!dy)return;li.style.transition='none';li.style.transform=`translateY(${dy}px)`;requestAnimationFrame(()=>requestAnimationFrame(()=>{li.style.transition='transform .7s cubic-bezier(.2,.8,.2,1)';li.style.transform=''}))});
  const top=order[0].dataset.h;cur=null;show(top,scores[top],'Top pick')}
 chips.forEach(c=>c.onclick=()=>{c.setAttribute('aria-pressed',c.getAttribute('aria-pressed')==='true'?'false':'true');rank()});
 items.forEach(li=>li.querySelector('button').onclick=()=>{const i=[...list.children].indexOf(li);show(li.dataset.h,scores[li.dataset.h],i===0?'Top pick':'#'+(i+1)+' for you')});
 dots.querySelectorAll('.dot').forEach(d=>d.style.cursor='pointer');
 rank()})();

/* services */
const S=[
 ['Pre-move planning','A timeline built around your family size, visa route, budget and deadline. Appointments and requirements depend on your circumstances.',['Document checklist: apostilles, sworn translations','Phase-by-phase timeline with milestones','Cost-of-living budget','Pre-arrival video call with Christa']],
 ['Legal & formalities','NIE, TIE or EU certificate, empadronamiento, bank account and health insurance, in the order the system demands.',['NIE / TIE / EU certificate appointments','Empadronamiento at the Ayuntamiento','Bank account opening','Private health insurance setup']],
 ['Home finding','We match barrios to people, run viewings and prepare your rental dossier so you can say yes on the day.',['Neighbourhood matching','In-person or virtual viewings','Lease questions for a qualified professional','Utilities and internet transfer']],
 ['School search','Public, concertado, British, American or IB. We visit with you and handle the Conselleria paperwork.',['School visits and principal meetings','Enrolment and Conselleria liaison','After-school activities','Transition support for children']],
 ['Intercultural coaching','Dinner at ten, two kisses, Valencian beside Spanish. Understanding the rhythm is what turns a move into a life.',['Cultural orientation workshop','Social and sports club introductions','Spanish and Valencian classes','Local events calendar']],
 ['Ongoing support','A Hacienda letter at 9pm, a licence exchange deadline, a lease renewal. The relationship continues after the keys.',['Direct WhatsApp line to Christa','TIE renewal reminders','Gestoría introduction','Discuss ongoing support']]
];
(()=>{const L=document.getElementById('svcList');S.forEach(([t,p,li],i)=>{const r=document.createElement('div');r.className='svc-row';r.innerHTML=`<button aria-expanded="false"><span class="n">0${i+1}</span><span class="t">${t}</span><span class="pl">+</span></button><div class="svc-body"><div><div class="svc-inner"><p>${p}</p><ul>${li.map(l=>`<li>${l}</li>`).join('')}</ul></div></div></div>`;r.querySelector('button').onclick=()=>{const o=!r.classList.contains('open');L.querySelectorAll('.svc-row').forEach(x=>{x.classList.remove('open');x.querySelector('button').setAttribute('aria-expanded','false')});if(o){r.classList.add('open');r.querySelector('button').setAttribute('aria-expanded','true')}};L.append(r)});L.firstChild.querySelector('button').click()})();


/* seasons: fireworks (Fallas) or sea glitter (summer); hold to intensify */
(()=>{const sec=document.getElementById('seasons'),c=document.getElementById('fx'),x=c.getContext('2d');let W,H,mode='fallas',power=0,holding=false,ps=[];
function rs(){const d=Math.min(2,devicePixelRatio||1);W=c.clientWidth;H=c.clientHeight;c.width=W*d;c.height=H*d;x.setTransform(d,0,0,d,0,0)}rs();addEventListener('resize',rs);
const T={fallas:['March is <em>fire</em>.','Las Fallas fills the streets with towering satirical sculptures, daily 2pm mascletàs in Plaza del Ayuntamiento, and the cremà on the night of 19 March. We tell you which streets close and when to book.'],summer:['Summer is <em>salt</em>.','Long evenings on Malvarrosa, horchata with fartons in Alboraia, and the Gran Fira in July. Schools break late June, so we time school and lease starts around it.']};
sec.querySelectorAll('.seg button').forEach(b=>b.onclick=()=>{mode=b.dataset.s;sec.dataset.s=mode;sec.querySelectorAll('.seg button').forEach(z=>z.setAttribute('aria-pressed',z===b));sTitle.innerHTML=T[mode][0];sText.textContent=T[mode][1];ps=[]});
function burst(){const cx=Math.random()*W,cy=H*(.15+Math.random()*.4),hue=[28,12,45,200][Math.floor(Math.random()*4)];for(let i=0;i<60;i++){const a=Math.random()*7,s=Math.random()*3+1;ps.push({x:cx,y:cy,vx:Math.cos(a)*s,vy:Math.sin(a)*s,l:1,h:hue})}}
function f(){{const rb=sec.getBoundingClientRect();if(rb.bottom<0||rb.top>innerHeight){requestAnimationFrame(f);return}}x.fillStyle=mode==='fallas'?'rgba(42,15,18,.22)':'rgba(14,79,102,.25)';x.fillRect(0,0,W,H);power+=holding?.02:-.01;power=Math.max(0,Math.min(1,power));holdRing.style.strokeDashoffset=214-214*power;
 if(mode==='fallas'){if(Math.random()<.03+power*.25)burst();ps.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.vy+=.04;p.l-=.012;x.fillStyle=`hsla(${p.h},95%,60%,${p.l})`;x.fillRect(p.x,p.y,2,2)})}
 else{for(let i=0;i<2+power*20;i++)ps.push({x:Math.random()*W,y:H*.45+Math.random()*H*.55,l:1,vx:0,vy:0});ps.forEach(p=>{p.l-=.02;x.fillStyle=`rgba(255,240,200,${p.l})`;x.fillRect(p.x,p.y,Math.random()*3+1,1)});const g=x.createRadialGradient(W*.8,H*.25,0,W*.8,H*.25,120+power*80);g.addColorStop(0,'rgba(255,200,120,.35)');g.addColorStop(1,'rgba(255,200,120,0)');x.fillStyle=g;x.fillRect(0,0,W,H)}
 ps=ps.filter(p=>p.l>0);holdTxt.textContent=power>.98?(mode==='fallas'?'¡Mascletà!':'Golden hour'):'Hold to light the sky';requestAnimationFrame(f)}
const hb=document.getElementById('holdBtn');['pointerdown','keydown'].forEach(e=>hb.addEventListener(e,()=>holding=true));['pointerup','pointerleave','keyup','blur'].forEach(e=>hb.addEventListener(e,()=>holding=false));
if(!RM)f();else{x.fillStyle='#2A0F12';x.fillRect(0,0,W,H)}})();


/* journey */
(()=>{const st=[['01','Your priorities','Discuss your household, timing and practical questions.','A first conversation'],['02','Documents','Confirm which requirements and professional advice apply.','Formalities'],['03','Home','Explore home-finding support around your budget and daily routes.','Home priorities'],['04','Arrival','Discuss the preparations relevant to your travel.','Before arrival'],['05','Local services','Explore providers and local registration questions.','Practical essentials'],['06','Family','Discuss school priorities when relevant.','Family support'],['07','Settling in','Plan orientation and the ongoing questions you want help with.','Your next chapter']];
const tr=document.getElementById('track');tr.innerHTML=st.map(s=>`<article class="step"><div class="wk">${s[0]}</div><h3>${s[1]}</h3><p>${s[2]}</p><span class="doc">${s[3]}</span></article>`).join('');
let d=false,sx,sl;tr.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse')return;d=true;sx=e.clientX;sl=tr.scrollLeft;tr.classList.add('drag')});addEventListener('pointermove',e=>{if(d)tr.scrollLeft=sl-(e.clientX-sx)});addEventListener('pointerup',()=>{d=false;tr.classList.remove('drag')})})();


/* pricing */
(()=>{const P=[{n:'Practical essentials',p:0,f:['Pre-move priorities','Local services and formalities','Orientation questions']},{n:'Home & family',p:0,f:['Home-finding priorities','School questions when relevant','Settling in']},{n:'Tailored support',p:0,f:['A combination of services','Local professional introductions','Ongoing-support priorities']}];
const fam=['2 people','3–4 people','5+ people'],tm=['1 month (urgent)','3 months','6 months','12+ months'],lv=['Essential','Full','Executive'];let shown=3500;
function u(){[rFam,rTime,rLvl].forEach(r=>r.style.setProperty('--p',((r.value-r.min)/(r.max-r.min)*100)+'%'));oFam.textContent=fam[rFam.value-1];oTime.textContent=tm[rTime.value-1];oLvl.textContent=lv[rLvl.value-1];const k=P[rLvl.value-1];pk.textContent=k.n;feat.innerHTML=k.f.map(x=>`<li>${x}</li>`).join('');amt.textContent='Proposal on request';}
[rFam,rTime,rLvl].forEach(r=>r.oninput=u);u()})();


/* voices */
(()=>{const V=[['Tell Christa who is moving, your priorities and preferred timing.','01 · Your priorities'],['Discuss support for home finding, schools and local services.','02 · A local perspective'],['Agree a scope and a practical next step.','03 · A starting plan']];
let i=0;vstage.innerHTML=V.map((v,k)=>`<blockquote class="v${k?'':' on'}" style="margin:0"><p>${v[0]}</p><cite>${v[1]}</cite></blockquote>`).join('');const els=vstage.querySelectorAll('.v');
function go(n){i=(n+V.length)%V.length;els.forEach((e,k)=>e.classList.toggle('on',k===i));vCount.textContent=`0${i+1} / 0${V.length}`}vPrev.onclick=()=>go(i-1);vNext.onclick=()=>go(i+1);
let auto=null;})();




/* modal */
(()=>{const m=document.getElementById('modal'),form=document.getElementById('form');
 const open=()=>{m.classList.add('open');lenis&&lenis.stop();setTimeout(()=>document.getElementById('fmName')?.focus(),300)},close=()=>{m.classList.remove('open');lenis&&lenis.start()};
 document.addEventListener('click',e=>{if(e.target.closest('[data-open]')){e.preventDefault();open()}else if(e.target.closest('[data-close]')||e.target===m)close()});
 addEventListener('keydown',e=>{if(e.key==='Escape'){close();menu.classList.remove('open')}});
 form.onsubmit=e=>{e.preventDefault();window.juryPrepareDraft(form);}})();

/* sections pause their CSS loops while off screen */
(()=>{const io=new IntersectionObserver(es=>es.forEach(e=>e.target.classList.toggle('offscreen',!e.isIntersecting)),{rootMargin:'100px 0px'});
 document.querySelectorAll('main > section, main > header, .tiles').forEach(s=>io.observe(s))})();
