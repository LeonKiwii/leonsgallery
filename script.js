(() => {
'use strict';
const canvas=document.querySelector('#particles'),ctx=canvas.getContext('2d',{alpha:true}),portal=document.querySelector('.light');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const pointer={x:-1e5,y:-1e5};let width,height,rect,points=[],last=0,raf=0,focused=false,burstAt=0,textShards=[];
const image=new Image();image.src='assets/shipwreck-v2.png';image.onload=resize;
function resize(){width=innerWidth;height=innerHeight;const dpr=Math.min(devicePixelRatio||1,2);canvas.width=width*dpr;canvas.height=height*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);const iw=image.naturalWidth||1672,ih=image.naturalHeight||941,horizon=ih*.5;const scale=Math.max(width/iw,height*.5/horizon,height*.5/(ih-horizon));const beach=document.querySelector('.beach');beach.style.backgroundSize=`${iw*scale}px ${ih*scale}px`;beach.style.backgroundPosition=`${(width-iw*scale)*.42}px ${height*.5-horizon*scale}px`;rect=portal.getBoundingClientRect();points=[];const step=1.4;for(let y=0;y<rect.height;y+=step)for(let x=0;x<rect.width;x+=step){const bx=rect.left+x+scrollX,by=rect.top+y+scrollY;points.push({bx,by,x:bx,y:by,vx:0,vy:0,seed:Math.random()*6.283,w:Math.min(step,rect.width-x),h:Math.min(step,rect.height-y)});}}
function track(e){if(document.body.classList.contains('about-open')){leave();return;}focused=false;pointer.x=e.clientX+scrollX;pointer.y=e.clientY+scrollY;}
function leave(){pointer.x=pointer.y=-1e5;}
window.addEventListener('pointermove',track,{passive:true});window.addEventListener('pointerdown',track,{passive:true});window.addEventListener('pointerup',e=>{if(e.pointerType!=='mouse')leave();});document.documentElement.addEventListener('pointerleave',leave);window.addEventListener('blur',leave);portal.addEventListener('focus',()=>{focused=portal.matches(':focus-visible');});portal.addEventListener('blur',()=>focused=false);
window.addEventListener('aboutstate',()=>{leave();focused=false;points.forEach(p=>{p.x=p.bx;p.y=p.by;p.vx=p.vy=0;});});
window.addEventListener("portalburst",()=>{
 burstAt=performance.now();
 document.querySelectorAll('.explore-label,.cursor-note:not([hidden])').forEach(el=>{
  const box=el.getBoundingClientRect(),style=getComputedStyle(el);
  const tile=document.createElement('canvas');tile.width=Math.ceil(box.width+8);tile.height=Math.ceil(box.height+8);
  const paint=tile.getContext('2d');paint.font=style.font;paint.fillStyle='#fff';paint.textBaseline='middle';
  const offset=el.classList.contains('cursor-note')?31:0;
  paint.fillText(el.textContent,offset,box.height/2);
  const pixels=paint.getImageData(0,0,tile.width,tile.height).data;
  for(let y=0;y<tile.height;y+=2)for(let x=0;x<tile.width;x+=2){if(pixels[(y*tile.width+x)*4+3]>35)textShards.push({x:box.left+x+scrollX,y:box.top+y+scrollY,angle:Math.random()*Math.PI*2,speed:70+Math.random()*160});}
 });
 document.body.classList.add('portal-bursting');
});
function frame(now){const dt=Math.min((now-last)/1000||1/60,.032);last=now;const blocked=document.body.classList.contains('about-open');const px=blocked?-1e5:focused?width/2:pointer.x,py=blocked?-1e5:focused?height/2:pointer.y;ctx.clearRect(0,0,width,height);ctx.fillStyle=document.documentElement.dataset.theme==='dark'?'#000':'#fff';ctx.beginPath();const radius=16;
for(const p of points){let tx=p.bx,ty=p.by;const dx=p.bx-px,dy=p.by-py,d=Math.hypot(dx,dy);if(d<radius&&!reduced.matches){const angle=d>.1?Math.atan2(dy,dx):p.seed;
const ux=Math.cos(angle),uy=Math.sin(angle);
// Follow the outward ray all the way beyond the rectangle, not just within it.
const edgeX=Math.abs(ux)<1e-6?Infinity:((ux>0?rect.left+rect.width+scrollX:rect.left+scrollX)-p.bx)/ux;
const edgeY=Math.abs(uy)<1e-6?Infinity:((uy>0?rect.top+rect.height+scrollY:rect.top+scrollY)-p.by)/uy;
const edgeDistance=Math.max(0,Math.min(edgeX,edgeY));
const blend=Math.min(1,(radius-d)/5);const influence=blend*blend*(3-2*blend);
const distance=(edgeDistance+55+100*(.5+.5*Math.sin(p.seed)))*influence;
tx+=ux*distance+Math.cos(p.seed+now*.001)*influence*8;
ty+=uy*distance+Math.sin(p.seed+now*.001)*influence*8;}
if(burstAt){const spread=Math.min(1,(now-burstAt)/650);p.x=p.bx+Math.cos(p.seed)*spread*(180+width*.55);p.y=p.by+Math.sin(p.seed)*spread*(180+height*.55);ctx.rect(p.x,p.y,1.5,1.5);continue;}
// Exact damped spring integration keeps motion consistent at 60 / 120 / 144 Hz.
const decay=Math.exp(-65*dt);const ax=p.x-tx,ay=p.y-ty;const bx=p.vx+65*ax,by=p.vy+65*ay;p.x=tx+(ax+bx*dt)*decay;p.y=ty+(ay+by*dt)*decay;p.vx=(p.vx-65*bx*dt)*decay;p.vy=(p.vy-65*by*dt)*decay;
const dispersed=Math.min(1,Math.hypot(p.x-p.bx,p.y-p.by)/7);const size=1-dispersed*.38;ctx.rect(p.x,p.y,p.w*size+.04*(1-dispersed),p.h*size+.04*(1-dispersed));}
if(burstAt){const progress=Math.min(1,(now-burstAt)/700);for(const p of textShards){ctx.rect(p.x+Math.cos(p.angle)*p.speed*progress,p.y+Math.sin(p.angle)*p.speed*progress,1.6,1.6);}}
ctx.globalAlpha=burstAt?Math.max(0,1-(now-burstAt)/700):1;ctx.fill();ctx.globalAlpha=1;if(!burstAt||now-burstAt<750)raf=requestAnimationFrame(frame);else{ctx.clearRect(0,0,width,height);textShards=[];}}
window.addEventListener('scroll',()=>{rect=portal.getBoundingClientRect();leave();},{passive:true});window.addEventListener('resize',resize);document.addEventListener('visibilitychange',()=>{if(document.hidden)cancelAnimationFrame(raf);else{last=0;raf=requestAnimationFrame(frame);}});resize();raf=requestAnimationFrame(frame);
})();
