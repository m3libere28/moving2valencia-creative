// Lightweight atmosphere layered over the Blender-rendered tossing scene.
(() => {
 const scene=document.querySelector('.paella-cooking');if(!scene)return;
 const canvas=scene.querySelector('.cooking-effects');const ctx=canvas.getContext('2d');if(!ctx)return;
 const button=scene.querySelector('.cooking-toggle');const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const video=scene.querySelector('video');
 const localFile=location.protocol==='file:'||scene.dataset.playback==='image';
 const poster=scene.querySelector('.paella-poster');
 const staticSource=scene.dataset.posterSource||'assets/paella-render-poster.webp';
 const animatedSource=scene.dataset.animatedSource||'assets/paella-local-animated.webp';
 // Decode a separate opacity plane from an ordinary MP4. This avoids native
 // video-alpha support differences and never places a matte rectangle on the page.
 const renderCanvas=scene.querySelector('.paella-render-canvas');
 const renderPaella=localFile?()=>{}:createAlphaRenderer(renderCanvas);
 if(localFile){scene.classList.add('local-image-animation');}
 else{video.src=innerWidth<=700?'assets/paella-alpha-mobile.mp4':'assets/paella-alpha.mp4';video.load();}
 function createAlphaRenderer(output){
  let gl;try{gl=output.getContext('webgl',{alpha:true,premultipliedAlpha:true,antialias:false});}catch{}
  let drawVideo;
  if(gl){
   try{
    const compile=(type,source)=>{const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;};
    const program=gl.createProgram();gl.attachShader(program,compile(gl.VERTEX_SHADER,'attribute vec2 p;varying vec2 uv;void main(){uv=p*.5+.5;gl_Position=vec4(p,0.,1.);}'));gl.attachShader(program,compile(gl.FRAGMENT_SHADER,'precision mediump float;varying vec2 uv;uniform sampler2D movie;void main(){vec3 rgb=texture2D(movie,vec2(uv.x,.5+uv.y*.5)).rgb;float a=texture2D(movie,vec2(uv.x,uv.y*.5)).r;a=smoothstep(.015,.985,a);gl_FragColor=vec4(rgb*a,a);}'));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));gl.useProgram(program);
    const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);const p=gl.getAttribLocation(program,'p');gl.enableVertexAttribArray(p);gl.vertexAttribPointer(p,2,gl.FLOAT,false,0,0);
    const texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);
    drawVideo=()=>{if(gl.isContextLost())return false;if(output.width!==video.videoWidth){output.width=video.videoWidth;output.height=video.videoHeight/2;gl.viewport(0,0,output.width,output.height);}gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,video);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);return true;};
   }catch{drawVideo=null;}
  }
  if(!drawVideo){
   // A modest resolution CPU fallback supports devices without WebGL.
   const replacement=document.createElement('canvas');replacement.className=output.className;replacement.setAttribute('aria-hidden','true');output.replaceWith(replacement);output=replacement;
   const size=innerWidth<=700?320:480;
   const color=output.getContext('2d',{willReadFrequently:true});const mask=document.createElement('canvas');mask.width=mask.height=size;output.width=output.height=size;const alpha=mask.getContext('2d',{willReadFrequently:true});
   drawVideo=()=>{color.clearRect(0,0,size,size);color.drawImage(video,0,0,video.videoWidth,video.videoHeight/2,0,0,size,size);alpha.drawImage(video,0,video.videoHeight/2,video.videoWidth,video.videoHeight/2,0,0,size,size);const rgb=color.getImageData(0,0,size,size),a=alpha.getImageData(0,0,size,size);for(let i=3;i<rgb.data.length;i+=4)rgb.data[i]=a.data[i-3];color.putImageData(rgb,0,0);return true;};
  }
  let previous=-1,native=false;
  return ()=>{if(native||video.readyState<2||video.currentTime===previous)return;try{if(drawVideo()){previous=video.currentTime;scene.classList.add('has-alpha-render');}}catch(error){scene.classList.remove('has-alpha-render');if(location.protocol==='file:'&&error.name==='SecurityError'){native=true;scene.classList.add('native-alpha');video.poster='assets/paella-render-poster.webp';video.src=innerWidth<=700?'assets/paella-render-mobile.webm':'assets/paella-render.webm';video.load();video.play().catch(()=>{});}}};
 }
 let paused=reduced.matches,visible=true,frame=0,last=0,time=0,w=0,h=0;
 const wisps=Array.from({length:36},(_,i)=>({angle:i*2.39996,radius:.08+(i%6)*.022,phase:i*.417,speed:.6+(i%5)*.13,size:.015+(i%4)*.005}));
 const smoke=Array.from({length:12},(_,i)=>({x:.33+(i%6)*.055,phase:i*.213}));
 const bubbles=[];
 function resize(){const r=canvas.getBoundingClientRect();w=r.width;h=r.height;const dpr=Math.min(devicePixelRatio||1,1.5);canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);}
 function draw(now){
  if(paused||!visible||document.hidden){frame=0;return;}
  frame=requestAnimationFrame(draw);if(now-last<40)return;const dt=Math.min((now-last)/1000,.08);last=now;time+=dt;renderPaella();ctx.clearRect(0,0,w,h);
  const clock=video?.currentTime||time;const turn=clock/20*Math.PI*2;const phase=clock%5;
  const lift=phase>1.4&&phase<3.5?Math.sin((phase-1.4)/2.1*Math.PI)*.07:0;
  for(const p of wisps){const age=(time*p.speed*.16+p.phase)%1;const angle=p.angle+turn;
   const x=(.5+Math.cos(angle)*p.radius+Math.sin(age*6+p.phase)*.026+age*.018)*w;
   const y=(.49+Math.sin(angle)*p.radius*.32-lift-age*.27)*h;
   const r=(p.size+age*.039)*w;const alpha=Math.sin(age*Math.PI)*.23;
   const grad=ctx.createRadialGradient(x,y,0,x,y,r);grad.addColorStop(0,`rgba(242,239,231,${alpha})`);grad.addColorStop(.4,`rgba(233,230,220,${alpha*.5})`);grad.addColorStop(1,'rgba(233,230,220,0)');ctx.fillStyle=grad;ctx.beginPath();ctx.ellipse(x,y,r*.65,r*1.8,Math.sin(age*6+p.phase)*.4,0,Math.PI*2);ctx.fill();}
  for(const p of smoke){const age=(time*.15+p.phase)%1;const x=(p.x+Math.sin(age*7+p.phase)*.04)*w;const y=(.73-age*.29)*h;const r=(.014+age*.05)*w;const alpha=Math.sin(age*Math.PI)*.085;const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,`rgba(100,87,72,${alpha})`);g.addColorStop(1,'rgba(100,87,72,0)');ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(x,y,r,r*1.6,.2*Math.sin(age*6),0,Math.PI*2);ctx.fill();}
  bubbles.forEach(([x,y],i)=>{const age=(time*.22+i*.137)%1;if(age>.72)return;ctx.strokeStyle=`rgba(255,231,155,${Math.sin(age/.72*Math.PI)*.16})`;ctx.lineWidth=.8;ctx.beginPath();ctx.ellipse(x*w,y*h,(1+age*2.3)*w/500,(.5+age)*w/500,0,0,Math.PI*2);ctx.stroke();});
  ctx.save();ctx.globalCompositeOperation='screen';
  ctx.restore();
 }
 function sync(){cancelAnimationFrame(frame);frame=0;last=performance.now();scene.classList.toggle('is-paused',paused);button.setAttribute('aria-pressed',String(paused));button.setAttribute('aria-label',paused?'Play cooking animation':'Pause cooking animation');button.innerHTML=paused?'<span aria-hidden="true">▷</span> Play motion':'<span aria-hidden="true">Ⅱ</span> Pause motion';if(localFile){const source=paused||!visible||document.hidden?staticSource:animatedSource;if(poster.getAttribute('src')!==source)poster.src=source;}if(paused||!visible||document.hidden){video?.pause();if(paused)ctx.clearRect(0,0,w,h);}else{if(!localFile)video?.play().catch(()=>{});frame=requestAnimationFrame(draw);}}
 button.addEventListener('click',()=>{paused=!paused;sync();});reduced.addEventListener('change',()=>{paused=reduced.matches;sync();});document.addEventListener('visibilitychange',sync);
 new ResizeObserver(resize).observe(canvas);new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;scene.classList.toggle('is-offscreen',!visible);sync();},{threshold:.05}).observe(scene);resize();sync();
})();
