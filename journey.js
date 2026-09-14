(()=>{
'use strict';
const portal=document.querySelector('.light');let stage='home',target=portal,label='Click me',following=false,timer=0,lastX=-999,lastY=-999;
const note=document.createElement('div');note.className='cursor-note';note.hidden=true;note.textContent=label;document.body.append(note);
function inside(x,y){const r=target.getBoundingClientRect(),margin=stage==='door'?35:0;return x>=r.left-margin&&x<=r.right+margin&&y>=r.top-margin&&y<=r.bottom+margin;}
function stop(){clearTimeout(timer);timer=0;following=false;note.hidden=true;}
window.addEventListener('pointermove',e=>{if(stage==='transition'||document.body.classList.contains('about-open')){stop();return;}if(!inside(e.clientX,e.clientY)){stop();return;}if(Math.hypot(e.clientX-lastX,e.clientY-lastY)<1)return;lastX=e.clientX;lastY=e.clientY;note.style.left=e.clientX+'px';note.style.top=e.clientY+'px';note.hidden=!following;clearTimeout(timer);timer=setTimeout(()=>{following=!following;note.hidden=!following;},1500);},{passive:true});
window.addEventListener('aboutstate',stop);window.addEventListener('blur',stop);document.documentElement.addEventListener('pointerleave',stop);
function paintReveal(scene,done){scene.style.clipPath='none';const reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;if(reduced){done();return}scene.animate([{opacity:0},{opacity:1}],{duration:750,easing:'ease-in-out'}).finished.then(done);}
function enterDoor(){if(stage!=='home')return;stage='transition';window.dispatchEvent(new Event('portalburst'));stop();portal.setAttribute('aria-disabled','true');
 setTimeout(()=>{const scene=document.createElement('section');scene.className='door-scene active paint-revealing';scene.style.clipPath='inset(0 0 100% 0)';scene.innerHTML='<div class="knight-background"></div><button class="door-target" aria-label="Open the door" disabled><img src="assets/door.png" alt="A carved Baroque wooden door"></button>';document.body.prepend(scene);target=scene.querySelector('button');
 paintReveal(scene,()=>{document.body.classList.add('door-mode');scene.classList.remove('paint-revealing');target.disabled=false;label='Open me';note.textContent=label;stage='door';});
 target.addEventListener('click',()=>window.fadeNavigate('abyss.html'));
 },500);
}

portal.addEventListener('click',enterDoor);portal.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();enterDoor();}});
})();
