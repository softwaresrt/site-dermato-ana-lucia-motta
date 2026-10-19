/* Dra. Ana Lúcia Motta — site interativo sem dependências obrigatórias.
   No canvas, um busto anatômico ARTÍSTICO é renderizado em WebGL, sem simular resultados de pacientes. */
(() => {
'use strict';
const WA = '552196657080';
const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => Array.from(root.querySelectorAll(s));
const waUrl = text => `https://wa.me/${WA}?text=${encodeURIComponent(text)}`;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const loader = $('#loader');
const finishLoading = () => loader?.classList.add('done');
if (document.readyState === 'complete') setTimeout(finishLoading, reducedMotion ? 0 : 600);
else window.addEventListener('load', () => setTimeout(finishLoading, reducedMotion ? 0 : 600), {once:true});
setTimeout(finishLoading, 2400);
$('#year').textContent = String(new Date().getFullYear());
$$('[data-wa]').forEach(a => a.href = waUrl(a.dataset.wa));

// Navigation & reveal
const header = $('#header'); const progress = $('#scroll-progress');
const menuToggle = $('#menu-toggle'); const mobileMenu = $('#mobile-menu');
menuToggle.addEventListener('click', () => {
  const open = !mobileMenu.classList.contains('open');
  mobileMenu.classList.toggle('open',open); menuToggle.setAttribute('aria-expanded',String(open));
  menuToggle.setAttribute('aria-label',open?'Fechar menu':'Abrir menu');
  document.body.classList.toggle('no-scroll',open);
  const spans = $$('span', menuToggle);
  spans[0].style.transform = open ? 'translateY(3.5px) rotate(45deg)' : '';
  spans[1].style.transform = open ? 'translateY(-3.5px) rotate(-45deg)' : '';
});
$$('a',mobileMenu).forEach(a => a.addEventListener('click', () => {
  mobileMenu.classList.remove('open');menuToggle.setAttribute('aria-expanded','false');document.body.classList.remove('no-scroll');
  $$('span',menuToggle).forEach(s=>s.style.transform='');
}));
let scrollQueued = false;
const scrollState = () => { const y = window.scrollY; header.classList.toggle('scrolled', y > 30);
  const max = document.documentElement.scrollHeight - innerHeight;
  progress.style.width = `${max > 0 ? y/max*100 : 0}%`;
  updateJourney(); scrollQueued=false;
};
window.addEventListener('scroll', () => {if(!scrollQueued){requestAnimationFrame(scrollState); scrollQueued=true;}}, {passive:true});
scrollState();
if('IntersectionObserver' in window){
  const observer = new IntersectionObserver(entries => entries.forEach(e => {
    if(e.isIntersecting){e.target.classList.add('visible');observer.unobserve(e.target)}
  }), {threshold:.07,rootMargin:'0px 0px -25px 0px'});
  $$('.reveal').forEach(el=>observer.observe(el));
}else $$('.reveal').forEach(el=>el.classList.add('visible'));
if(reducedMotion) $$('.reveal').forEach(el=>el.classList.add('visible'));

// Portrait parallax (subtle; no photograph manipulation beyond framing)
const heroMedia = $('#hero-media');
if(!reducedMotion && matchMedia('(pointer:fine)').matches){
  heroMedia.addEventListener('pointermove', e => {
    const r=heroMedia.getBoundingClientRect();const nx=(e.clientX-r.left)/r.width-.5;const ny=(e.clientY-r.top)/r.height-.5;
    $('.arc-one',heroMedia).style.translate=`${nx*13}px ${ny*10}px`;
    $('.floating-seal',heroMedia).style.translate=`${-nx*11}px ${-ny*9}px`;
  });
}

// Interactive photographic particles, sampled from the authentic portrait.
// WebGL2 enhancement: photo remains available as an accessible fallback.
function initPortraitParticles(){
 const canvas=$('#hero-particles'),toggle=$('#particle-toggle'),media=$('#hero-media'),photo=$('#hero-photo-img');
 if(!canvas||!toggle)return;
 let active=false,phase=0,renderId=0;
 const gl=canvas.getContext('webgl2',{alpha:true,antialias:false,powerPreference:'low-power'});
 if(!gl){toggle.hidden=true;return;}
 const vertex=`#version 300 es
 precision highp float;in vec2 xy;in vec2 target;in vec3 color;uniform float time;uniform float morph;uniform vec2 cursor;uniform float aspect;out vec4 vColor;
 void main(){vec2 p=mix(xy,target,morph);vec2 delta=p-cursor;float radius=length(delta);p+=normalize(delta+vec2(.00001))*.115*exp(-radius*radius*38.0);p+=vec2(sin(time*.8+xy.y*15.0)*.0025,cos(time*.7+xy.x*16.0)*.003);gl_Position=vec4(p.x/aspect,p.y,0.,1.);gl_PointSize=2.2+1.0*sin(time*.8+xy.x*24.);vColor=vec4(color,mix(.70,.95,morph));}`;
 const fragment=`#version 300 es
 precision highp float;in vec4 vColor;out vec4 outColor;void main(){float d=length(gl_PointCoord-.5);float fade=1.0-smoothstep(.05,.52,d);outColor=vec4(vColor.rgb,fade*vColor.a);}`;
 const compile=(type,code)=>{const sh=gl.createShader(type);gl.shaderSource(sh,code);gl.compileShader(sh);if(!gl.getShaderParameter(sh,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(sh));return sh};
 let program;
 try{program=gl.createProgram();gl.attachShader(program,compile(gl.VERTEX_SHADER,vertex));gl.attachShader(program,compile(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));}
 catch(error){console.warn('Partículas indisponíveis',error);toggle.hidden=true;return;}
 const bufferXY=gl.getAttribLocation(program,'xy'),bufferTarget=gl.getAttribLocation(program,'target'),bufferColor=gl.getAttribLocation(program,'color');
 const loc={time:gl.getUniformLocation(program,'time'),morph:gl.getUniformLocation(program,'morph'),cursor:gl.getUniformLocation(program,'cursor'),aspect:gl.getUniformLocation(program,'aspect')};
 const reader=document.createElement('canvas');reader.width=105;reader.height=140;const ctx=reader.getContext('2d',{willReadFrequently:true});
 const prepare=()=>{
  if(!photo.complete||!photo.naturalWidth)return;
  ctx.drawImage(photo,0,0,105,140);const pixels=ctx.getImageData(0,0,105,140).data;
  const points=[],dest=[],colors=[];
  for(let y=0;y<140;y+=1)for(let x=0;x<105;x+=1){const i=(y*105+x)*4,r=pixels[i],g=pixels[i+1],b=pixels[i+2];
   const nx=(x/104-.5)*1.3,ny=(.5-y/139)*1.85;
   const dx=nx/.66,dy=ny/.93; if(dx*dx+dy*dy>1.15)continue;
   const luminance=(r+g+b)/3,seed=(x*92821+y*68917)%15367/15367;
   if(seed<.25)continue;
   points.push(nx,ny);
   const index=points.length/2,ang=index*2.399963;const rad=.10+.74*Math.sqrt(index/11000);
   dest.push(Math.cos(ang)*rad,Math.sin(ang)*rad);
   const contrast=.65+.35*luminance/255;
   colors.push(r/255*contrast+.13,g/255*contrast+.07,b/255*contrast+.04);
  }
  const vao=gl.createVertexArray();gl.bindVertexArray(vao);
  const attrib=(values,location,size)=>{let buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(values),gl.STATIC_DRAW);gl.enableVertexAttribArray(location);gl.vertexAttribPointer(location,size,gl.FLOAT,false,0,0)};
  attrib(points,bufferXY,2);attrib(dest,bufferTarget,2);attrib(colors,bufferColor,3);
  gl.bindVertexArray(null);return{vao,count:points.length/2};
 };
 let shape=null;
 if(photo.complete)shape=prepare();else photo.addEventListener('load',()=>shape=prepare(),{once:true});
 let width=0,height=0,ratio=1,mouse=[8,8],currentMorph=0;
 const resize=()=>{const rect=media.getBoundingClientRect();width=rect.width;height=rect.height;const dpr=Math.min(devicePixelRatio||1,1.5);canvas.width=width*dpr;canvas.height=height*dpr;gl.viewport(0,0,canvas.width,canvas.height);ratio=width/height};
 resize();if('ResizeObserver'in window)new ResizeObserver(resize).observe(media);
 media.addEventListener('pointermove',e=>{if(!active)return;let rect=media.getBoundingClientRect();mouse=[((e.clientX-rect.left)/rect.width-.5)*2*ratio,(.5-(e.clientY-rect.top)/rect.height)*2]});
 media.addEventListener('pointerleave',()=>mouse=[8,8]);
 toggle.addEventListener('click',()=>{active=!active;media.classList.toggle('particles-on',active);toggle.setAttribute('aria-pressed',String(active));toggle.querySelector('span').textContent=active?'VOLTAR À FOTOGRAFIA':'EXPLORAR EM PARTÍCULAS';if(active)requestAnimationFrame(draw)});
 function draw(t){if(!active||!shape)return;currentMorph+=(phase-currentMorph)*.035;
  gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
  gl.useProgram(program);gl.uniform1f(loc.time,t*.001);gl.uniform1f(loc.morph,currentMorph);gl.uniform2f(loc.cursor,...mouse);gl.uniform1f(loc.aspect,ratio);gl.bindVertexArray(shape.vao);gl.drawArrays(gl.POINTS,0,shape.count);
  if(!reducedMotion)renderId=requestAnimationFrame(draw);
 }
 toggle.addEventListener('dblclick',()=>{phase=phase?0:1});
 // As the page scrolls away, particles smoothly morph into an abstract constellation.
 window.addEventListener('scroll',()=>{if(!active)return;const r=media.getBoundingClientRect();phase=clamp((95-r.top)/(innerHeight*.6),0,1)},{passive:true});
}
try{initPortraitParticles()}catch(e){console.warn('Efeito fotográfico indisponível:',e);$('#particle-toggle').hidden=true}

// Facial regions / no self diagnosis
const areas = [
 {id:'testa',label:'Testa & expressão',short:'Testa',x:0,y:.56,z:.91,title:'Expressão & testa',desc:'Linhas de expressão, textura e características da região frontal podem ser avaliadas em consulta. Os cuidados possíveis variam conforme a pele e o exame médico.',topics:['Expressão facial','Textura da pele','Orientação personalizada']},
 {id:'olhos',label:'Região dos olhos',short:'Olhos',x:.31,y:.13,z:.70,title:'O olhar também merece cuidado.',desc:'A pele ao redor dos olhos tem particularidades. A avaliação pode abordar sensibilidade, aparência, hidratação e hábitos de proteção.',topics:['Sensibilidade','Hidratação','Cuidados da região']},
 {id:'macas',label:'Maçãs do rosto',short:'Bochechas',x:-.38,y:-.16,z:.77,title:'Textura, marcas & individualidade.',desc:'Manchas, alterações de textura e sinais da pele podem ter causas distintas. A consulta ajuda a entender o que merece atenção.',topics:['Manchas e textura','Rotina de cuidados','Saúde da pele']},
 {id:'labios',label:'Lábios & entorno',short:'Lábios',x:0,y:-.39,z:1.03,title:'Cuidado que respeita os traços.',desc:'A região dos lábios pode ser avaliada considerando saúde cutânea, hidratação e, quando pertinente, interesse em procedimentos estéticos.',topics:['Ressecamento','Pele perioral','Naturalidade']},
 {id:'mandibula',label:'Contorno facial',short:'Contorno',x:.43,y:-.6,z:.52,title:'Seu rosto, sua identidade.',desc:'Mudanças relacionadas ao tempo, à qualidade da pele e às características individuais podem ser conversadas sem impor padrões de beleza.',topics:['Qualidade da pele','Mudanças naturais','Expectativas reais']},
 {id:'pescoco',label:'Pescoço',short:'Pescoço',x:0,y:-1.23,z:.35,title:'Um cuidado que continua.',desc:'O pescoço também pode apresentar sensibilidade, manchas ou mudanças de textura. Uma avaliação individual identifica as prioridades.',topics:['Proteção solar','Textura','Acompanhamento']},
];
let activeArea=null;
const areaOptions=$('#area-options');
areas.forEach((a,i)=>{
 const button=document.createElement('button');button.type='button';button.className='area-option';button.dataset.id=a.id;
 button.innerHTML=`<span>${String(i+1).padStart(2,'0')}</span>${a.label}`;
 button.addEventListener('click',()=>selectArea(a.id));areaOptions.appendChild(button);
});
function selectArea(id){
 const a=areas.find(x=>x.id===id); if(!a)return;activeArea=id;
 $$('.area-option').forEach(b=>b.classList.toggle('active',b.dataset.id===id));
 $$('.face-hotspot').forEach(b=>b.classList.toggle('active',b.dataset.id===id));
 $('#map-info').innerHTML=`<span class="map-info-count">EXPLORANDO / ${a.short.toUpperCase()}</span><h3>${a.title.replace(/^(.*?) (.{1,35})$/, '$1<br/><em>$2</em>')}</h3><p>${a.desc}</p><a class="map-info-link" href="${waUrl('Olá! Gostaria de agendar uma avaliação dermatológica e conversar sobre '+a.label.toLowerCase()+'.')}" target="_blank" rel="noopener">Conversar sobre essa região <svg><use href="#i-arrow"/></svg></a>`;
}

window.__anaSelectArea = selectArea;

// GPU WebGL2 art bust: sculpted head with shaded features; draggable, with projected hotspots.
function initFace(){
 const canvas=$('#face-canvas'); const viewport=$('#map-viewport');const hotspotRoot=$('#face-hotspots');
 if(!canvas||!viewport)return;
 const gl=canvas.getContext('webgl2',{alpha:true,antialias:true,powerPreference:'low-power'});
 if(!gl){$('#face-fallback').style.display='grid';canvas.style.display='none';return;}
 const vs=`#version 300 es
 precision highp float;
 in vec3 position; in vec3 normal;
 uniform float yaw; uniform float pitch; uniform float aspect; uniform float scaleFactor;
 out vec3 vNormal; out vec3 vPosition;
 vec3 rotateShape(vec3 p){float c=cos(yaw),s=sin(yaw);p=vec3(c*p.x+s*p.z,p.y,-s*p.x+c*p.z);c=cos(pitch);s=sin(pitch);return vec3(p.x,c*p.y-s*p.z,s*p.y+c*p.z);}
 void main(){vec3 p=rotateShape(position);vNormal=normalize(rotateShape(normal));vPosition=p;gl_Position=vec4((p.x*scaleFactor)/aspect,p.y*scaleFactor,-p.z*.09,1.0);}`;
 const fs=`#version 300 es
 precision highp float;
 in vec3 vNormal;in vec3 vPosition;uniform float time;uniform float materialId;out vec4 fragColor;
 void main(){vec3 n=normalize(vNormal);float diffuse=max(dot(n,normalize(vec3(-.58,.65,.79))),0.0);float fill=max(dot(n,normalize(vec3(.95,-.15,.55))),0.0);float fresnel=pow(1.0-max(dot(n,vec3(0.,0.,1.)),0.),2.0);vec3 base=mix(vec3(.37,.22,.18),vec3(.86,.66,.54),diffuse*.87+.12);base+=fill*vec3(.17,.11,.10);base=mix(base,vec3(.96,.83,.71),fresnel*.3);float bands=sin(vPosition.y*44.0+sin(vPosition.x*30.0)*2.0)*.5+.5;base+=bands*.006;float gloss=pow(max(dot(reflect(-normalize(vec3(-.55,.7,.7)),n),vec3(0.,0.,1.)),0.),22.0);base+=gloss*vec3(.31,.26,.19);if(materialId>1.5){base=mix(base,vec3(.53,.34,.27),.19);}fragColor=vec4(base,1.);}`;
 function shader(type,code){let s=gl.createShader(type);gl.shaderSource(s,code);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)) throw Error(gl.getShaderInfoLog(s));return s;}
 let program;
 try{program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,vs));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,fs));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('WebGL shader link error');}catch(e){console.warn('3D indisponível:',e);$('#face-fallback').style.display='grid';return;}
 const attrs={pos:gl.getAttribLocation(program,'position'),normal:gl.getAttribLocation(program,'normal')};
 const uniforms={yaw:gl.getUniformLocation(program,'yaw'),pitch:gl.getUniformLocation(program,'pitch'),aspect:gl.getUniformLocation(program,'aspect'),scale:gl.getUniformLocation(program,'scaleFactor'),time:gl.getUniformLocation(program,'time'),material:gl.getUniformLocation(program,'materialId')};
 const gaussian=(x,m,w)=>Math.exp(-Math.pow((x-m)/w,2));
 function makeShape(kind){let vertices=[],indices=[];const stacks=68,slices=100;
  for(let i=0;i<=stacks;i++){
    const lat=-Math.PI/2+Math.PI*i/stacks;
    for(let j=0;j<=slices;j++){
      const lon=2*Math.PI*j/slices;
      let x,y,z;
      if(kind==='head'){
        x=.78*Math.cos(lat)*Math.sin(lon);y=1.04*Math.sin(lat)+.14;z=.67*Math.cos(lat)*Math.cos(lon);
        const front=Math.max(0,Math.cos(lon));
        const nx=x/.78,ny=(y-.14);
        let features= .28*gaussian(nx,0,.17)*gaussian(ny,-.045,.35) // nose bridge
         +.25*gaussian(nx,0,.18)*gaussian(ny,-.29,.17) // nose tip
         +.085*gaussian(nx,0,.2)*gaussian(ny,-.55,.075) // lips
         +.06*gaussian(nx,0,.31)*gaussian(ny,-.82,.16) // chin
         +.055*(gaussian(nx,-.49,.28)+gaussian(nx,.49,.28))*gaussian(ny,-.24,.29) // cheek
         -.045*(gaussian(nx,-.4,.13)+gaussian(nx,.4,.13))*gaussian(ny,.18,.11); // eye sockets
        z+=features*front*front;
        x*=1+.075*gaussian(ny,-.36,.36);
      }else if(kind==='neck'){
        x=.325*Math.cos(lat)*Math.sin(lon);y=.54*Math.sin(lat)-1.15;z=.30*Math.cos(lat)*Math.cos(lon)-.07;
      }else{
        x=1.18*Math.cos(lat)*Math.sin(lon);y=.44*Math.sin(lat)-1.68;z=.50*Math.cos(lat)*Math.cos(lon)-.05;
      }
      vertices.push(x,y,z);
    }
  }
  for(let i=0;i<stacks;i++)for(let j=0;j<slices;j++){
    let a=i*(slices+1)+j,b=a+slices+1;
    indices.push(a,a+1,b,b,a+1,b+1);
  }
  const normals=new Float32Array(vertices.length);
  for(let i=0;i<indices.length;i+=3){let i0=indices[i],i1=indices[i+1],i2=indices[i+2];let a=i0*3,b=i1*3,c=i2*3;
    const v1=[vertices[b]-vertices[a],vertices[b+1]-vertices[a+1],vertices[b+2]-vertices[a+2]],v2=[vertices[c]-vertices[a],vertices[c+1]-vertices[a+1],vertices[c+2]-vertices[a+2]];
    const n=[v1[1]*v2[2]-v1[2]*v2[1],v1[2]*v2[0]-v1[0]*v2[2],v1[0]*v2[1]-v1[1]*v2[0]];
    for(const k of [a,b,c])for(let d=0;d<3;d++)normals[k+d]+=n[d];
  }
  for(let i=0;i<normals.length;i+=3){let l=Math.hypot(normals[i],normals[i+1],normals[i+2])||1;for(let d=0;d<3;d++)normals[i+d]/=l;}
  const vao=gl.createVertexArray();gl.bindVertexArray(vao);
  const pb=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,pb);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(vertices),gl.STATIC_DRAW);gl.enableVertexAttribArray(attrs.pos);gl.vertexAttribPointer(attrs.pos,3,gl.FLOAT,false,0,0);
  const nb=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,nb);gl.bufferData(gl.ARRAY_BUFFER,normals,gl.STATIC_DRAW);gl.enableVertexAttribArray(attrs.normal);gl.vertexAttribPointer(attrs.normal,3,gl.FLOAT,false,0,0);
  const ib=gl.createBuffer();gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ib);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint32Array(indices),gl.STATIC_DRAW);
  gl.bindVertexArray(null);
  return{vao,count:indices.length};
 }
 const shapes=[makeShape('shoulders'),makeShape('neck'),makeShape('head')];
 let yaw=-.16,pitch=.035,targetYaw=yaw,targetPitch=pitch,drag=false,startX=0,startY=0,lastX=0,lastY=0;
 areas.forEach((a,i)=>{let b=document.createElement('button');b.type='button';b.className='face-hotspot';b.dataset.id=a.id;b.setAttribute('aria-label',`Explorar ${a.label}`);b.title=a.label;b.addEventListener('click',e=>{e.stopPropagation();selectArea(a.id)});hotspotRoot.appendChild(b);});
 const buttons=$$('.face-hotspot',hotspotRoot);
 canvas.addEventListener('pointerdown',e=>{drag=true;startX=e.clientX;startY=e.clientY;lastX=e.clientX;lastY=e.clientY;canvas.setPointerCapture(e.pointerId)});
 canvas.addEventListener('pointermove',e=>{if(!drag)return;targetYaw=clamp(targetYaw+(e.clientX-lastX)*.006,-1.0,1.0);targetPitch=clamp(targetPitch+(e.clientY-lastY)*.003,-.25,.3);lastX=e.clientX;lastY=e.clientY;});
 canvas.addEventListener('pointerup',()=>{drag=false});canvas.addEventListener('pointercancel',()=>{drag=false});
 let width=0,height=0,aspect=1,scale=.59,frame=0,canvasVisible=true;
 if('IntersectionObserver' in window)new IntersectionObserver(entries=>{canvasVisible=entries[0]?.isIntersecting??true;},{rootMargin:'150px'}).observe(viewport);
 const resize=()=>{const rect=viewport.getBoundingClientRect();width=rect.width;height=rect.height;const dpr=Math.min(devicePixelRatio||1,1.5);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);gl.viewport(0,0,canvas.width,canvas.height);aspect=width/height;scale=Math.min(.72,(height<550?.71:.59));};
 resize();if('ResizeObserver'in window)new ResizeObserver(resize).observe(viewport);else window.addEventListener('resize',resize);
 gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.disable(gl.CULL_FACE);
 function project(a){const c=Math.cos(yaw),s=Math.sin(yaw);let x=c*a.x+s*a.z, z=-s*a.x+c*a.z;const cp=Math.cos(pitch),sp=Math.sin(pitch);let y=cp*a.y-sp*z;
  return{x:(x*scale/aspect*.5+.5)*width,y:(.5-y*scale*.5)*height,visible:z>-.12};
 }
 function draw(time){frame++;
  if(!canvasVisible){if(!reducedMotion)requestAnimationFrame(draw);return;}
  if(!drag){targetYaw=clamp(targetYaw+.00013*Math.sin(time*.0003),-.85,.85)}
  yaw+=(targetYaw-yaw)*.08;pitch+=(targetPitch-pitch)*.08;
  gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
  gl.useProgram(program);gl.uniform1f(uniforms.yaw,yaw);gl.uniform1f(uniforms.pitch,pitch);gl.uniform1f(uniforms.aspect,aspect);gl.uniform1f(uniforms.scale,scale);gl.uniform1f(uniforms.time,time*.001);
  shapes.forEach((shape,i)=>{gl.bindVertexArray(shape.vao);gl.uniform1f(uniforms.material,i);gl.drawElements(gl.TRIANGLES,shape.count,gl.UNSIGNED_INT,0)});
  buttons.forEach((b,i)=>{const a=areas[i],p=project(a);b.style.left=p.x+'px';b.style.top=p.y+'px';b.style.opacity=p.visible?'1':'.05';b.style.pointerEvents=p.visible?'auto':'none';});
  if(!reducedMotion || drag || frame<5)requestAnimationFrame(draw);
 }
 requestAnimationFrame(draw);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden&&reducedMotion)requestAnimationFrame(draw)});
}
try{if(!window.__ANA_R3F_ACTIVE)initFace()}catch(e){console.warn('Visualização facial indisponível:',e);$('#face-fallback').style.display='grid'}

// Treatment overlays
const treatmentData={
  pele:{eyebrow:'DERMATOLOGIA CLÍNICA',title:'Saúde da pele',paragraphs:['A pele merece um olhar clínico atento, desde dúvidas do cotidiano até sinais que precisam de investigação.','A avaliação dermatológica permite investigar sintomas, orientar hábitos e definir uma conduta individualizada.'],topics:['Avaliação de alterações e queixas da pele','Orientação de prevenção e proteção solar','Acompanhamento clínico conforme necessidade']},
  facial:{eyebrow:'DERMATOLOGIA ESTÉTICA',title:'Beleza com naturalidade',paragraphs:['O cuidado estético começa com uma conversa sobre sua pele, seus desejos e as possibilidades adequadas ao seu caso.','Procedimentos, técnicas, indicações, duração e recuperação são explicados pela médica após a avaliação.'],topics:['Avaliação de textura e qualidade da pele','Conversa sobre linhas e mudanças naturais','Expectativas e escolhas conscientes']},
  prevencao:{eyebrow:'PREVENÇÃO',title:'Olhar atento aos sinais',paragraphs:['A detecção precoce de alterações cutâneas é uma parte importante da dermatologia. Algumas manchas ou sinais precisam de avaliação profissional.','Uma consulta ajuda a esclarecer quais mudanças merecem acompanhamento e quais medidas preventivas são indicadas.'],topics:['Avaliação de sinais e pintas','Prevenção do câncer de pele','Orientações sobre sinais de alerta']},
  rotina:{eyebrow:'ROTINA DE CUIDADOS',title:'O cuidado em cada fase',paragraphs:['Produtos e rotinas não precisam ser complexos para serem relevantes. O mais importante é a adequação às características individuais.','Na consulta, são considerados histórico, objetivos, rotina e saúde da pele para orientar um plano de cuidados.'],topics:['Limpeza e hidratação compatíveis com a pele','Fotoproteção','Acompanhamento e ajustes ao longo do tempo']}
};
const backdrop=$('#modal-backdrop'), modalTitle=$('#modal-title'), modalBody=$('#modal-body'), modalEyebrow=$('#modal-eyebrow'), modalCta=$('#modal-cta');let lastFocused=null;
function openModal({eyebrow,title,paragraphs=[],topics=[],privacy=false}){
 lastFocused=document.activeElement;modalEyebrow.textContent=eyebrow;modalTitle.textContent=title;
 modalBody.replaceChildren();
 paragraphs.forEach(p=>{let el=document.createElement('p');el.textContent=p;modalBody.appendChild(el)});
 if(topics.length){let list=document.createElement('ul');topics.forEach(t=>{let li=document.createElement('li');li.textContent=t;list.appendChild(li)});modalBody.appendChild(list)}
 modalCta.style.display=privacy?'none':'inline-flex';modalCta.href=waUrl(`Olá! Gostaria de agendar uma avaliação com a Dra. Ana Lúcia Motta. Tenho interesse em ${title.toLowerCase()}.`);
 backdrop.hidden=false;document.body.classList.add('no-scroll');$('#modal-close').focus();
}
function closeModal(){backdrop.hidden=true;document.body.classList.remove('no-scroll');lastFocused?.focus()}
$$('.treatment-item').forEach(el=>el.addEventListener('click',()=>openModal(treatmentData[el.dataset.treatment])));
$$('.filter').forEach(b=>b.addEventListener('click',()=>{
 $$('.filter').forEach(x=>x.classList.toggle('active',x===b));
 const tag=b.dataset.filter;
 $$('.treatment-item').forEach(el=>el.classList.toggle('filtered-out',tag!=='todos'&&!el.dataset.category.split(' ').includes(tag)));
}));
$('#modal-close').addEventListener('click',closeModal);
backdrop.addEventListener('click',e=>{if(e.target===backdrop)closeModal()});
window.addEventListener('keydown',e=>{if(e.key==='Escape'&&!backdrop.hidden)closeModal();if(e.key==='Tab'&&!backdrop.hidden){let items=$$('button,a,input,select,textarea',[backdrop][0]).filter(x=>x.offsetParent!==null);let first=items[0],last=items.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}});
$('#privacy-open').addEventListener('click',()=>openModal({eyebrow:'TRANSPARÊNCIA',title:'Privacidade e ética',privacy:true,paragraphs:['Este site é uma apresentação informativa dos serviços médicos. Não realiza diagnóstico remoto ou recomendação automática de tratamentos.','As informações inseridas no formulário e no questionário não são enviadas nem armazenadas em servidores do site. Se você escolher continuar pelo WhatsApp, será direcionado ao serviço externo com uma mensagem preparada. Evite compartilhar dados médicos sensíveis antes de receber orientações adequadas.','As imagens fotográficas de apresentação são fornecidas como materiais de referência. Não são exibidas fotos de antes e depois de pacientes nem simulações de resultados.','O uso de provedores externos, como o Instagram, o WhatsApp e as fontes do Google, está sujeito às políticas desses serviços. Este site não possui rastreadores analíticos próprios.','Informações profissionais e de endereço devem ser revisadas e confirmadas pela responsável antes de publicação definitiva.']}));

// 3D conceptual consultation journey (scroll + buttons)
const journeySteps=[
 {title:'Primeiro,<br/><em>escutamos.</em>',description:'Entender suas expectativas e sua história é parte essencial da consulta.'},
 {title:'Depois,<br/><em>avaliamos.</em>',description:'A análise clínica ajuda a identificar necessidades reais, prioridades e possíveis contraindicações.'},
 {title:'Juntos,<br/><em>decidimos.</em>',description:'Informação, indicações individualizadas e escolhas alinhadas às suas necessidades.'},
 {title:'E seguimos,<br/><em>cuidando.</em>',description:'Quando necessário, acompanhamento e ajustes ao longo do tempo.'},
];
let currentJourney=0,journeyTimer=0;
function changeJourney(index){if(index===currentJourney)return;index=clamp(index,0,3);currentJourney=index;
 const stage=$('#journey-stage'),el=$('#journey-copy');stage.dataset.step=index;el.classList.add('changing');
 clearTimeout(journeyTimer);journeyTimer=setTimeout(()=>{
  el.innerHTML=`<span class="journey-number">0${index+1}</span><h3>${journeySteps[index].title}</h3><p>${journeySteps[index].description}</p>`;
  el.classList.remove('changing');
 },reducedMotion?0:190);
 $('#journey-counter').textContent=`0${index+1} / 04`;
 $$('#journey-mini-nav button').forEach((b,i)=>b.classList.toggle('active',i===index));
}
function updateJourney(){const markers=$$('.journey-marker');if(!markers.length)return;
 const position=innerHeight*.7;let index=0;
 markers.forEach((m,i)=>{if(m.getBoundingClientRect().top<position)index=i});
 const sec=$('#journey-stage').getBoundingClientRect();if(sec.top>innerHeight)return;
 changeJourney(index);
}
$$('#journey-mini-nav button').forEach(b=>b.addEventListener('click',()=>{
 const i=Number(b.dataset.journey),m=$$('.journey-marker')[i];
 const absolute=m.getBoundingClientRect().top+scrollY;
 window.scrollTo({top:absolute-innerHeight*.55,behavior:reducedMotion?'auto':'smooth'});changeJourney(i);
}));

// Conceptual tactile reveal; intentionally not treatment before-after.
const compareSlider=$('#compare-slider'),compareStage=$('#compare-stage');
function setCompare(value){const v=clamp(Number(value),5,95);$('#compare-right').style.clipPath=`inset(0 0 0 ${v}%)`;$('#compare-divider').style.left=`${v}%`;compareSlider.value=String(v)}
compareSlider.addEventListener('input',e=>setCompare(e.target.value));setCompare(50);
let comparing=false;
const comparePointer=e=>{const r=compareStage.getBoundingClientRect();setCompare((e.clientX-r.left)/r.width*100)};
compareStage.addEventListener('pointerdown',e=>{comparing=true;compareStage.setPointerCapture(e.pointerId);comparePointer(e)});
compareStage.addEventListener('pointermove',e=>{if(comparing)comparePointer(e)});
compareStage.addEventListener('pointerup',()=>comparing=false);
compareStage.addEventListener('pointercancel',()=>comparing=false);

// Five-step educational pre-consultation quiz: no diagnosis / no storage.
const quizSteps=[
 {question:'O que mais gostaria de conversar?',options:['Saúde da minha pele','Cuidados estéticos','Prevenção de sinais','Rotina e produtos'],helper:'Não existe resposta certa. Escolha o tema que faz sentido hoje.'},
 {question:'Qual região merece atenção?',options:['Rosto','Olhos ou lábios','Pescoço e colo','Pele em geral'],helper:'A seleção apenas organiza sua conversa com a médica.'},
 {question:'Como está sua rotina atual?',options:['Tenho uma rotina definida','Quero simplificar meus cuidados','Ainda estou começando','Prefiro contar na consulta'],helper:'Não é necessário informar produtos ou histórico clínico aqui.'},
 {question:'Qual abordagem prefere discutir?',options:['Cuidados cotidianos','Possibilidades estéticas','Prevenção e acompanhamento','Quero ouvir a orientação médica'],helper:'A indicação de qualquer procedimento é feita somente em consulta.'},
 {question:'Quando gostaria de agendar?',options:['O quanto antes','Nas próximas semanas','Sem urgência','Quero tirar dúvidas primeiro'],helper:'A equipe confirmará a disponibilidade real de agenda.'}
];
let quizStep=0, answers=Array(5).fill(null), quizDone=false;
const quizContent=$('#quiz-content'),quizNext=$('#quiz-next'),quizBack=$('#quiz-back');
function renderQuiz(){
 $('#quiz-step-label').textContent=String(quizStep+1).padStart(2,'0');
 $('#quiz-percent').textContent=Math.round((quizStep+1)/5*100)+'%';$('#quiz-bar').style.width=((quizStep+1)/5*100)+'%';
 quizBack.disabled=quizStep===0&&!quizDone;
 $('#quiz-orb').style.borderRadius=["42% 58% 54% 46%","52% 48% 44% 56%","60% 40% 51% 49%","37% 63% 48% 52%","50% 50% 44% 56%"][quizStep];
 if(quizDone){
  quizContent.innerHTML=`<span class="section-index">SEU RESUMO</span><h3 class="quiz-question">Um bom começo para<br/><em>sua consulta.</em></h3><p class="quiz-result">Esses são os temas que você escolheu para conversar:</p><div class="quiz-result"><ul>${answers.map((a,i)=>`<li>${escapeHtml(quizSteps[i].options[a])}</li>`).join('')}</ul><strong>Importante:</strong> Isto não é diagnóstico nem prescrição. A avaliação e as indicações são definidas exclusivamente pela dermatologista.</div>`;
  quizNext.disabled=false;quizNext.innerHTML='Enviar resumo pelo WhatsApp <svg><use href="#i-diag"/></svg>';quizBack.textContent='← Rever escolhas';return;
 }
 const step=quizSteps[quizStep];
 quizContent.innerHTML=`<h3 class="quiz-question">${step.question}</h3><div class="quiz-options">${step.options.map((o,i)=>`<button class="quiz-option ${answers[quizStep]===i?'selected':''}" data-index="${i}" type="button">${escapeHtml(o)}</button>`).join('')}</div><p class="quiz-helper">${step.helper}</p>`;
 $$('.quiz-option',quizContent).forEach(b=>b.addEventListener('click',()=>{answers[quizStep]=Number(b.dataset.index);$$('.quiz-option',quizContent).forEach(x=>x.classList.toggle('selected',x===b));quizNext.disabled=false}));
 quizNext.disabled=answers[quizStep]===null;quizNext.innerHTML=`${quizStep===4?'Ver meu resumo':'Continuar'} <svg><use href="#i-arrow"/></svg>`;quizBack.textContent='← Voltar';
}
function escapeHtml(x){return String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
quizNext.addEventListener('click',()=>{
 if(quizDone){const summary=quizSteps.map((s,i)=>`${i+1}. ${s.question}\n${s.options[answers[i]]}`).join('\n\n');const msg=`Olá! Gostaria de agendar uma avaliação com a Dra. Ana Lúcia Motta. Organizei estes assuntos para conversar em consulta:\n\n${summary}\n\nEntendo que este resumo não representa diagnóstico nem indicação de tratamentos.`;window.open(waUrl(msg),'_blank','noopener,noreferrer');return;}
 if(answers[quizStep]===null)return;
 if(quizStep===4)quizDone=true;else quizStep++;
 renderQuiz();
});
quizBack.addEventListener('click',()=>{if(quizDone)quizDone=false;else quizStep=Math.max(0,quizStep-1);renderQuiz()});
renderQuiz();

// Contact: constructs a WhatsApp message with explicit user intent; never uploads form contents.
$('#contact-form').addEventListener('submit',e=>{
 e.preventDefault();const name=$('#contact-name').value.trim(),interest=$('#contact-interest').value,extra=$('#contact-message').value.trim();
 if(!name||!interest){e.target.reportValidity();return}
 let text=`Olá! Meu nome é ${name}. Gostaria de agendar uma avaliação com a Dra. Ana Lúcia Motta.\n\nAssunto: ${interest}.`;
 if(extra)text+=`\nObservação: ${extra}`;
 text+='\n\nPodem me informar os horários disponíveis?';
 window.open(waUrl(text),'_blank','noopener,noreferrer');
});
})();
