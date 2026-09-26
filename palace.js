(()=>{'use strict';
const canvas=document.querySelector('#palace-scene'),ctx=canvas.getContext('2d'),button=document.querySelector('.palace-action'),hint=document.querySelector('#palace-hint'),body=document.body;
const parts=[],reduce=matchMedia('(prefers-reduced-motion: reduce)');let width=0,height=0,frame=0,started=0,busy=false,last=0;
const clamp=t=>Math.min(1,Math.max(0,t)),ease=t=>{t=clamp(t);return t*t*t*(10+t*(-15+6*t));};
// Every member has its own solid geometry and insertion direction.
function timber(a,b,w,d,layer,order,axis=[0,1,0],label='beam'){
 const u=b.map((v,i)=>v-a[i]),len=Math.hypot(...u);u.forEach((v,i)=>u[i]=v/len);
 let v=Math.abs(u[1])>.9?[1,0,0]:[-u[2],0,u[0]];const vl=Math.hypot(...v);v=v.map(x=>x/vl);
 const n=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];
 const verts=[];for(const end of [a,b])for(const [s,t] of [[-1,-1],[1,-1],[1,1],[-1,1]])verts.push(end.map((x,i)=>x+s*v[i]*w/2+t*n[i]*d/2));
 parts.push({verts,a,b,w,d,layer,order,axis,label,seed:parts.length});
}
const xs=[-300,-180,-60,60,180,300],zs=[-100,100];
// Posts and their reduced-section tenons travel together.
xs.forEach((x,i)=>zs.forEach((z,j)=>{
 timber([x,0,z],[x,186,z],15,15,0,i*.07+j*.025,[0,1,0],'post');
 timber([x,186,z],[x,198,z],6,6,0,i*.07+j*.025,[0,1,0],'tenon');
}));
for(const [j,z] of zs.entries())for(let i=0;i<5;i++){
 const x=xs[i];timber([x-4,185,z],[x+124,185,z],16,18,1,i*.055+j*.03,[j?1:-1,0,0]);
 timber([x-12,185,z],[x-4,185,z],7,7,1,i*.055+j*.03,[j?1:-1,0,0],'tenon');
}
xs.forEach((x,i)=>timber([x,191,-117],[x,191,117],15,17,1,i*.06,[0,0,1]));
// Alternating orthogonal short arms and bearing blocks: individual dougong tiers.
for(let tier=0;tier<3;tier++)xs.forEach((x,i)=>zs.forEach((z,j)=>{
 const y=207+tier*17,span=25+tier*12,L=2+tier;
 timber([x,y-7,z],[x,y+1,z],15,15,L,i*.025+j*.015,[0,1,0],'block');
 if(tier%2===0)timber([x-span,y+6,z],[x+span,y+6,z],9,9,L,.12+i*.025+j*.015,[1,0,0],'bracket');
 else timber([x,y+6,z-span],[x,y+6,z+span],9,9,L,.12+i*.025+j*.015,[0,0,1],'bracket');
}));
// Purlins sit at successive heights on the roof slope.
const roof=[[-160,249],[-105,261],[-52,293],[0,323],[52,293],[105,261],[160,249]];
roof.forEach(([z,y],i)=>timber([-342,y,z],[342,y,z],13,13,5,i*.045,[0,1,0],'purlin'));
// Each sloped rafter is separate; paired roof slopes lift in a rolling sequence.
for(let i=0;i<32;i++){const x=-340+i*680/31;
 for(const side of [-1,1])for(let k=0;k<3;k++){
 const zz=[0,52,105,174],yy=[332,303,271,259];
 timber([x,yy[k],side*zz[k]],[x,yy[k+1],side*zz[k+1]],5,7,6+k,i*.017+(side+1)*.025,[0,1,side*.18],'rafter');
 }}
const facesIndex=[[0,3,2,1],[4,5,6,7],[0,1,5,4],[1,2,6,5],[2,3,7,6],[3,0,4,7]];
function project(p){return [836+p[0]*.97+p[2]*.66,757-p[1]-.29*p[2]+p[0]*.08];}
function amount(part,time){const delay=(8-part.layer)*.64+part.order;return ease((time-delay)/1.5);}
function draw(t=0){ctx.setTransform(canvas.width/1672,0,0,canvas.height/941,0,0);ctx.clearRect(0,0,1672,941);
 const g=ctx.createLinearGradient(0,0,0,941);g.addColorStop(0,'#e6e5df');g.addColorStop(1,'#cfcec5');ctx.fillStyle=g;ctx.fillRect(0,0,1672,941);
 ctx.save();ctx.translate(836,775);ctx.scale(1,.15);const shadow=ctx.createRadialGradient(0,0,20,0,0,450);shadow.addColorStop(0,'#51453424');shadow.addColorStop(1,'#51453400');ctx.fillStyle=shadow;ctx.fillRect(-450,-450,900,900);ctx.restore();
 const faces=[];
 for(const p of parts){const q=amount(p,t),lift=(35+p.layer*19)*q;
 const offset=[p.axis[0]*24*q,p.axis[1]*20*q+lift,p.axis[2]*30*q];
 const verts=p.verts.map(v=>v.map((n,i)=>n+offset[i]));
 for(let f=0;f<6;f++){const vv=facesIndex[f].map(i=>verts[i]),points=vv.map(project);const depth=vv.reduce((s,v)=>s+v[2]-.18*v[0]+.09*v[1],0)/4;
 faces.push({points,depth,p,f});}}
 faces.sort((a,b)=>a.depth-b.depth);
 for(const {points,p,f} of faces){const tone=[29,43,34,38,49,31][f]+p.seed%5;
 ctx.fillStyle=`hsl(31 14% ${tone}%)`;ctx.strokeStyle='rgba(42,31,19,.35)';ctx.lineWidth=.65;ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fill();ctx.stroke();
 if(f===4||f===2){ctx.strokeStyle='rgba(213,183,131,.14)';ctx.lineWidth=.45;for(const k of [.22,.51,.77]){const a=points[0].map((v,i)=>v+(points[3][i]-v)*k),b=points[1].map((v,i)=>v+(points[2][i]-v)*k);ctx.beginPath();ctx.moveTo(...a);ctx.lineTo(...b);ctx.stroke();}}
 }
 ctx.fillStyle='#5e5b50';ctx.font='12px Baskerville,serif';ctx.textAlign='center';ctx.fillText('TIMBER / JOINERY STUDY',836,112);
}
function resize(){const r=canvas.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2);width=r.width;height=r.height;canvas.width=Math.round(width*d);canvas.height=Math.round(height*d);draw(last);}
function reset(){cancelAnimationFrame(frame);busy=false;last=0;body.classList.remove('is-studying');button.removeAttribute('aria-busy');hint.textContent='Click to unfold';}
function tick(now){let t=(now-started)/1000;if(t>=24){reset();return;}
 // Disassembly is top-down; reversing this exact timeline enforces bottom-up assembly.
 const motion=t<3?0:t<11?t-3:t<12.5?8:Math.max(0,8-(t-12.5));last=motion;draw(motion);
 hint.textContent=t<3?'Within the palace':t<11?'Disassembling · member by member':t<12.5?'Mortise & tenon':t<20.5?'Reassembling · layer by layer':t<21.2?'The Palace':'Returning to the landscape';
 if(t>21.2)body.classList.remove('is-studying');frame=requestAnimationFrame(tick);
}
button.addEventListener('click',()=>{if(busy||body.classList.contains('about-open'))return;
 if(reduce.matches){body.classList.toggle('is-studying');draw(0);hint.textContent=body.classList.contains('is-studying')?'Click to return':'Click to unfold';return;}
 busy=true;button.setAttribute('aria-busy','true');draw(0);body.classList.add('is-studying');started=performance.now();frame=requestAnimationFrame(tick);
});
window.addEventListener('resize',resize);window.addEventListener('pagehide',reset);resize();
})();
