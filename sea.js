(async()=>{
const data=await fetch('sea-data.json?v=locations-2').then(r=>r.json()),reel=document.querySelector('.sea-reel'),frames=[...reel.querySelectorAll('.sea-frame')],details=document.querySelector('.sea-details'),prev=document.querySelector('#sea-prev'),next=document.querySelector('#sea-next');let active=-1,queued=false;
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
function render(i){if(i===active)return;active=i;const d=data[i];document.querySelector('#sea-count').textContent=`${String(i+1).padStart(2,'0')} / ${data.length}`;document.querySelector('#sea-location').textContent=d.location;document.querySelector('#sea-date-label').textContent=d.label;document.querySelector('#sea-date').textContent=`${d.date} ${d.time}`;document.querySelector('#sea-camera').textContent=d.camera;prev.disabled=i===0;next.disabled=i===data.length-1;if(!reduced){details.getAnimations().forEach(a=>a.cancel());details.animate([{opacity:0,transform:'translateY(7px)'},{opacity:1,transform:'none'}],{duration:350,easing:'ease-out'});}}
function update(){queued=false;const top=reel.getBoundingClientRect().top+Math.min(140,reel.clientHeight*.22);let best=0;frames.forEach((f,i)=>{if(f.getBoundingClientRect().top<=top)best=i});render(best)}
function go(i){pauseUntil=performance.now()+3500;i=Math.max(0,Math.min(data.length-1,i));reel.scrollTo({top:frames[i].offsetTop-frames[0].offsetTop,behavior:reduced?'instant':'smooth'})}
reel.addEventListener('scroll',()=>{if(!queued){queued=true;requestAnimationFrame(update)}},{passive:true});prev.onclick=()=>go(active-1);next.onclick=()=>go(active+1);reel.addEventListener('keydown',e=>{if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();go(active+(e.key==='ArrowDown'?1:-1))}});render(0);
let last=0,pauseUntil=0,position=reel.scrollTop;
function pause(){pauseUntil=performance.now()+3000;}
reel.addEventListener('wheel',pause,{passive:true});
reel.addEventListener('touchstart',pause,{passive:true});
reel.addEventListener('touchmove',pause,{passive:true});
function drift(now){
 const dt=Math.min((now-last)/1000,.05);last=now;
 const about=document.querySelector('#about-panel');
 if(!reduced&&!document.hidden&&now>pauseUntil&&(!about||about.hidden)){
  position=reel.scrollTop+dt*48;
  const end=reel.scrollHeight-reel.clientHeight;
  if(end>0&&position>=end){
   pauseUntil=now+2200;
   reel.animate([{opacity:1},{opacity:0},{opacity:1}],{duration:1000});
   setTimeout(()=>{reel.scrollTop=0;position=0;},500);
  }else reel.scrollTop=position;
 }
 requestAnimationFrame(drift);
}
requestAnimationFrame(drift);
})();
