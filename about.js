(() => {
'use strict';
const trigger=document.querySelector('.about-trigger'),panel=document.querySelector('.about-panel');let timer,open=false;
function setOpen(value){open=value;clearTimeout(timer);trigger.setAttribute('aria-expanded',String(value));document.body.classList.toggle('about-open',value);window.dispatchEvent(new Event('aboutstate'));document.querySelectorAll('.landscape,.light').forEach(el=>el.inert=value);
if(value){panel.hidden=false;requestAnimationFrame(()=>{if(open)panel.classList.add('is-open');});}else{panel.classList.remove('is-open');timer=setTimeout(()=>{if(!open)panel.hidden=true;},400);trigger.focus();}}
trigger.addEventListener('click',()=>setOpen(!open));panel.addEventListener('click',e=>{if(e.target.closest('.about-gallery')){e.preventDefault();return;}if(!e.target.closest('a'))setOpen(false);});
document.querySelector('.menu-label').addEventListener('click',()=>{if(open)setOpen(false);});
document.addEventListener('keydown',e=>{if(!open)return;if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();setOpen(false);}if(e.key==='Tab'){const controls=[trigger,...panel.querySelectorAll('a')];const index=controls.indexOf(document.activeElement);e.preventDefault();controls[(index+(e.shiftKey?-1:1)+controls.length)%controls.length].focus();}});
if(location.hash==='#about')setOpen(true);

})();
