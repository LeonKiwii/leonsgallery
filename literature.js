(()=>{
 const shelf=document.querySelector('.bookshelf');if(!shelf)return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let leaving=false;
 shelf.querySelectorAll('.book-link').forEach(link=>{
  let start=null,dragged=false;
  link.addEventListener('dragstart',e=>e.preventDefault());
  link.addEventListener('pointerdown',e=>{if(e.button!==0||e.pointerType==='touch')return;start={x:e.clientX,y:e.clientY};dragged=false;});
  link.addEventListener('pointermove',e=>{
   if(reduced.matches||e.pointerType==='touch')return;
   const r=link.getBoundingClientRect();let x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
   if(start&&e.buttons===1){dragged=dragged||Math.hypot(e.clientX-start.x,e.clientY-start.y)>7;link.classList.toggle('is-dragging',dragged);x=(e.clientX-start.x)/100;y=(e.clientY-start.y)/100;}
   link.style.setProperty('--rx',Math.max(-25,Math.min(25,-y*14))+'deg');link.style.setProperty('--ry',Math.max(-35,Math.min(35,x*22))+'deg');
  });
  link.addEventListener('pointerup',()=>{start=null;link.classList.remove('is-dragging');});
  link.addEventListener('pointerleave',()=>{start=null;link.classList.remove('is-dragging');link.style.removeProperty('--rx');link.style.removeProperty('--ry');});
  link.addEventListener('click',e=>{if(e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;if(dragged){e.preventDefault();dragged=false;return;}if(reduced.matches)return;e.preventDefault();if(leaving)return;leaving=true;link.classList.add('is-opening');shelf.classList.add('is-leaving');setTimeout(()=>location.assign(link.href),750);});
 });
 window.addEventListener('pageshow',()=>{leaving=false;shelf.classList.remove('is-leaving');shelf.querySelectorAll('.is-opening').forEach(x=>x.classList.remove('is-opening'));});
})();
