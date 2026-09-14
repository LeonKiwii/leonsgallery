(()=>{
 const row=document.querySelector('.music-title-row,.library-heading,.photo-title-row');if(!row)return;
 const title=row.querySelector('h2'),label=row.querySelector('.selection-collage'),letters=[...row.querySelectorAll('.cut-letter')];if(!label||!letters.length)return;
 const ctx=document.createElement('canvas').getContext('2d'),reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let bodies=[],frame=0,last=0,time=0;const pointer={x:0,y:0,active:false};
 function layout(){
  cancelAnimationFrame(frame);
  letters.forEach(el=>el.style.removeProperty('transform'));
  ctx.font=getComputedStyle(title).font;const top=ctx.measureText(title.textContent.trim().slice(-1)).actualBoundingBoxAscent;
  ctx.font=getComputedStyle(label).font;label.style.transform=`translateY(${ctx.measureText('S').actualBoundingBoxAscent-top}px)`;
  const base=label.getBoundingClientRect();
  bodies=letters.map((el,i)=>{const r=el.getBoundingClientRect(),s=getComputedStyle(el);return {el,ax:r.left-base.left+r.width/2,ay:r.top-base.top+r.height/2,x:0,y:0,vx:0,vy:0,angle:0,spin:0,r:Math.max(5,Math.min(r.width,r.height)*.4),phase:i*2.399,baseAngle:parseFloat(s.getPropertyValue('--angle'))||0,lift:s.getPropertyValue('--lift').trim()||'0px'};});
  last=0;if(!reduced.matches)frame=requestAnimationFrame(tick);
 }
 function tick(now){
  const dt=Math.min((now-(last||now))/1000,1/30);last=now;time+=dt;
  // Gentle changing air currents, elastic tethers and drag keep the word readable.
  const breeze=.15+.85*Math.pow(Math.max(0,Math.sin(time*.19)),2);
  for(const b of bodies){
   b.vx+=(Math.sin(time*.65+b.phase)*13*breeze-b.x*1.2-b.vx*1.45)*dt;
   b.vy+=(Math.cos(time*.48+b.phase*1.3)*17*breeze-(b.y+5)*.8-b.vy*1.25)*dt;
   if(pointer.active){const dx=b.ax+b.x-pointer.x,dy=b.ay+b.y-pointer.y,d=Math.hypot(dx,dy);if(d<65&&d>0){const force=(65-d)*1.7;b.vx+=dx/d*force*dt;b.vy+=dy/d*force*dt;}}
   b.x+=b.vx*dt;b.y+=b.vy*dt;
  }
  // Soft circular contacts allow the cut-out edges to overlap before separating.
  for(let i=0;i<bodies.length;i++)for(let j=i+1;j<bodies.length;j++){
   const a=bodies[i],b=bodies[j],dx=b.ax+b.x-a.ax-a.x,dy=b.ay+b.y-a.ay-a.y,d=Math.hypot(dx,dy)||.001,min=a.r+b.r;
   if(d>=min)continue;
   const nx=dx/d,ny=dy/d,overlap=min-d,relative=(b.vx-a.vx)*nx+(b.vy-a.vy)*ny;
   const impulse=overlap*12*dt+Math.max(0,-relative)*.38;
   a.vx-=nx*impulse;b.vx+=nx*impulse;a.vy-=ny*impulse;b.vy+=ny*impulse;
   a.x-=nx*overlap*.035;b.x+=nx*overlap*.035;a.y-=ny*overlap*.035;b.y+=ny*overlap*.035;
   a.spin-=ny*impulse*.5;b.spin+=ny*impulse*.5;
  }
  for(const b of bodies){b.spin+=(b.vx*.8-b.angle*2.2-b.spin*2)*dt;b.angle+=b.spin*dt;b.el.style.transform=`translate(${b.x.toFixed(2)}px,calc(${b.lift} + ${b.y.toFixed(2)}px)) rotate(${(b.baseAngle+b.angle).toFixed(2)}deg)`;}
  frame=requestAnimationFrame(tick);
 }
 label.addEventListener('pointermove',e=>{const r=label.getBoundingClientRect();pointer.x=e.clientX-r.left;pointer.y=e.clientY-r.top;pointer.active=true;});
 label.addEventListener('pointerleave',()=>pointer.active=false);
 document.addEventListener('visibilitychange',()=>{cancelAnimationFrame(frame);last=0;if(!document.hidden&&!reduced.matches)frame=requestAnimationFrame(tick);});
 reduced.addEventListener('change',layout);window.addEventListener('resize',layout);document.fonts.ready.then(layout);
})();
