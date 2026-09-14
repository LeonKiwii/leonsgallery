(() => {
'use strict';
const link=document.querySelector('.menu-label'),header=document.querySelector('.masthead');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let running=false,frame=0;
const nodes=[...document.querySelectorAll('.masthead .theme-toggle,.masthead .menu-label,.masthead .contact-label,.explore-label')];
function restore(){cancelAnimationFrame(frame);running=false;document.body.classList.remove('menu-departing');document.querySelector('.menu-wipe')?.remove();nodes.forEach((node,i)=>{node.style.removeProperty('min-width');node.style.removeProperty('opacity');});}
link.addEventListener('click',event=>{
if(event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
event.preventDefault();if(running)return;running=true;
if(reduced.matches){window.openMenuContext();restore();return;}
const wipe=document.createElement('div');wipe.className='menu-wipe';wipe.setAttribute('aria-hidden','true');wipe.style.setProperty('--bar-height',`${header.getBoundingClientRect().height}px`);document.body.append(wipe);
nodes.forEach(node=>{node.style.minWidth=`${node.getBoundingClientRect().width}px`;});
document.body.classList.add('menu-departing');
const start=performance.now();
function animate(now){const elapsed=now-start;
nodes.forEach(node=>{const p=Math.min(1,elapsed/460);node.style.opacity=String(1-p*p*(3-2*p));});
if(elapsed>=950){try{sessionStorage.setItem('menu-arrival','1');}catch{}window.openMenuContext();return;}frame=requestAnimationFrame(animate);}
frame=requestAnimationFrame(animate);
});
window.addEventListener('pageshow',restore);
})();
