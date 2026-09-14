(() => {
'use strict';
const title=document.querySelector('.project-title'),letters=document.querySelector('.title-letters');
letters.textContent='';
Array.from('Menu of Project').forEach((letter,i)=>{const span=document.createElement('span');span.className='letter'+([0,5,8].includes(i)||letter===' '?'':' vanish');span.style.setProperty('--i',i);span.textContent=letter===' '?'\u00a0':letter;letters.append(span);});
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;

setTimeout(()=>document.body.classList.add('ready'),2000);
let scheduled=false,maxSize=0,compactSize=32;
function update(){
 const y=Math.max(0,scrollY);
 // A fixed header and stable spacer avoid scroll feedback when the title shrinks.
 title.style.fontSize=`${Math.max(compactSize,maxSize-y/1.03)}px`;
 scheduled=false;
}
function layout(){
 maxSize=Math.min(220,Math.max(40,innerWidth*.1215),innerHeight*.23);
 const bar=document.querySelector('.return-bar').getBoundingClientRect().height;
 document.documentElement.style.setProperty('--expanded-header',`${maxSize*1.03+25+bar+58}px`);
 document.documentElement.style.setProperty('--compact-header',`${compactSize*1.03+25+bar+58}px`);
 update();
}
window.addEventListener('scroll',()=>{if(!scheduled){scheduled=true;requestAnimationFrame(update);}},{passive:true});
window.addEventListener('resize',layout);layout();document.fonts.ready.then(layout);
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!document.body.classList.contains('about-open')){e.preventDefault();window.closeMenuContext();}});
})();

(() => {
 const hint=document.createElement('div');
 hint.className='cursor-note coming-soon-note';
 hint.textContent='Coming soon';hint.hidden=true;hint.setAttribute('aria-hidden','true');
 document.body.append(hint);
 const hide=()=>{hint.hidden=true;};
 document.querySelectorAll('.art-project:not(:has(a))').forEach(category=>{
  const move=e=>{
   if(e.pointerType==='touch'||document.body.classList.contains('about-open')){hide();return;}
   hint.style.left=Math.min(e.clientX,innerWidth-145)+'px';
   hint.style.top=e.clientY+'px';const bounds=category.getBoundingClientRect();hint.classList.toggle('below-cursor',e.clientY>=bounds.top+bounds.height/2);hint.hidden=false;
  };
  category.addEventListener('pointerenter',move);
  category.addEventListener('pointermove',move);
  category.addEventListener('pointerleave',hide);
 });
 window.addEventListener('blur',hide);
 window.addEventListener('aboutstate',hide);
 window.addEventListener('scroll',hide,{passive:true});
})();

(()=>{
 let returning=false;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 function returnHome(event){
  if(event&&(event.button||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey))return;
  event?.preventDefault();if(returning)return;returning=true;
  const home=new URL(event?.currentTarget?.getAttribute('href')||'index.html',location.href);
  if(reduced.matches){location.assign(home.href);return;}
  const backdrop=document.createElement('iframe');backdrop.className='return-home-preview';backdrop.title='Home transition';backdrop.tabIndex=-1;backdrop.setAttribute('aria-hidden','true');backdrop.src=home.href;
  const sheet=document.createElement('div');sheet.className='return-menu-sheet';
  const header=document.querySelector('.masthead');const bar=header.getBoundingClientRect().height;
  // Preserve the current scrolled composition while retracting the complete menu surface.
  const snapshot=document.createElement('div');snapshot.className='return-menu-snapshot';snapshot.style.transform=`translateY(${-scrollY}px)`;
  [...document.body.children].forEach(el=>{if(['SCRIPT','IFRAME'].includes(el.tagName)||el.classList.contains('cursor-note'))return;const copy=el.cloneNode(true);if(copy.classList.contains('project-header')){copy.style.position='absolute';copy.style.top=`${scrollY+bar}px`;}if(copy.classList.contains('masthead')){copy.style.position='absolute';copy.style.top=`${scrollY}px`;}snapshot.append(copy);});
  snapshot.style.paddingTop=getComputedStyle(document.body).paddingTop;sheet.append(snapshot);
  sheet.style.setProperty('--return-bar',bar+'px');document.body.append(backdrop,sheet);
  const words=[...snapshot.querySelectorAll('.masthead h1,.masthead .menu-label,.masthead .contact-label,.project-title,.category,.return-bar a')];
  let started=false;
  function start(){if(started)return;started=true;sheet.classList.add('retracting');const start=performance.now();
   function animate(now){const elapsed=now-start;
    words.forEach(el=>{const p=Math.min(1,elapsed/460);el.style.opacity=String(1-p*p*(3-2*p));});
    if(elapsed<950)requestAnimationFrame(animate);else location.assign(home.href);
   }requestAnimationFrame(animate);
  }
  backdrop.addEventListener('load',start,{once:true});setTimeout(start,1200);
 }
 document.querySelectorAll('.brand-home,.return-bar a').forEach(el=>el.addEventListener('click',returnHome));
})();
