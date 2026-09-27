(()=>{
const frame=document.querySelector('#site'),audio=document.querySelector('audio'),button=document.querySelector('#enable-sound'),controls=document.querySelector('#journey-controls'),room=document.querySelector('#listening-mode'),toggle=document.querySelector('#listening-play'),seek=document.querySelector('#listening-seek'),volume=document.querySelector('#listening-volume');let eligible=false,current='',pausedByUser=false;
const main=['index.html','abyss.html','genesis.html'];const start=new URL(new URLSearchParams(location.search).get('page')||'index.html',location.href);if(start.origin!==location.origin)return;audio.volume=.38;
function applyPage(page){
 eligible=main.includes(page);
 controls.hidden=!eligible;controls.style.display=eligible?'flex':'none';
 if(eligible)play();else{audio.pause();audio.currentTime=0;if(room.open)room.close();}
}
function state(){button.textContent=audio.paused?'Play':audio.muted?'Unmute':'Mute';button.setAttribute('aria-pressed',String(audio.muted));toggle.textContent=audio.paused?'Play':'Pause';room.classList.toggle('is-playing',!audio.paused);}
function play(){if(!eligible||pausedByUser)return;audio.play().then(state).catch(state)}
button.onclick=()=>{if(audio.paused){pausedByUser=false;audio.muted=false;play()}else{audio.muted=!audio.muted;state()}};
function stamp(t){return Number.isFinite(t)?`${Math.floor(t/60)}:${String(Math.floor(t%60)).padStart(2,'0')}`:'0:00'}
function progress(){seek.max=Number.isFinite(audio.duration)?audio.duration:100;seek.value=audio.currentTime;seek.disabled=!Number.isFinite(audio.duration);document.querySelector('#listening-time').textContent=stamp(audio.currentTime);document.querySelector('#listening-duration').textContent=stamp(audio.duration)}
document.querySelector('#journey-title').onclick=()=>{room.showModal();pausedByUser=false;audio.muted=false;play();progress();volume.value=audio.volume};document.querySelector('#listening-close').onclick=()=>room.close();toggle.onclick=()=>{if(audio.paused){pausedByUser=false;play()}else{pausedByUser=true;audio.pause()}};seek.oninput=()=>{if(Number.isFinite(audio.duration))audio.currentTime=+seek.value};volume.oninput=()=>{audio.volume=+volume.value};['play','pause','volumechange'].forEach(e=>audio.addEventListener(e,state));['timeupdate','loadedmetadata'].forEach(e=>audio.addEventListener(e,progress));
function theme(){try{const child=frame.contentDocument;const css=getComputedStyle(child.documentElement);document.documentElement.style.setProperty('--paper',css.getPropertyValue('--paper')||'#fff');document.documentElement.style.setProperty('--ink',css.getPropertyValue('--ink')||'#000');document.documentElement.style.setProperty('--muted',css.getPropertyValue('--muted')||'#777')}catch{}}
frame.addEventListener('load',()=>{try{applyPage(frame.contentWindow.location.pathname.split('/').pop()||'index.html')}catch{}theme();try{new MutationObserver(theme).observe(frame.contentDocument.documentElement,{attributes:true})}catch{}});
addEventListener('message',e=>{const sameOrigin=e.origin===location.origin||(location.protocol==='file:'&&e.origin==='null');if(!sameOrigin||e.source!==frame.contentWindow)return;
if(e.data?.type==='leon-page'){const url=new URL(e.data.url);if(url.origin!==location.origin)return;applyPage(e.data.page);if(url.href!==current){try{history.replaceState({page:url.href},'',url.href)}catch{}current=url.href}try{document.title=frame.contentDocument.title}catch{}}
if(e.data?.type==='leon-audio-unlock')play();});applyPage(start.pathname.split('/').pop()||'index.html');frame.src=start.href;state();
})();
