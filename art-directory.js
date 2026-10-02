/* Content is visible without JavaScript; fades only enhance newly viewed work. */
(()=>{
 if(matchMedia('(prefers-reduced-motion: reduce)').matches||!('IntersectionObserver' in window))return;
 const observer=new IntersectionObserver(entries=>{
  for(const entry of entries){if(!entry.isIntersecting)continue;const item=entry.target;
   if(item.getBoundingClientRect().top>80)item.animate([{opacity:.25},{opacity:1}],{duration:700,easing:'ease-out'});
   observer.unobserve(item);
  }
 },{threshold:.12});
 document.querySelectorAll('.type-project').forEach(item=>observer.observe(item));
})();
