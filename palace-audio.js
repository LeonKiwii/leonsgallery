(()=>{
const audio=document.querySelector('#palace-music'),mute=document.querySelector('#palace-mute'),room=document.querySelector('#palace-listening'),play=document.querySelector('#palace-play'),seek=document.querySelector('#palace-seek');audio.volume=.38;let paused=false;
const time=n=>Math.floor(n/60)+':'+String(Math.floor(n%60)).padStart(2,'0');
function sync(){mute.textContent=audio.paused?'Play sound':audio.muted?'Unmute':'Mute';mute.setAttribute('aria-pressed',String(audio.muted));play.textContent=audio.paused?'Play':'Pause';}
function start(){if(!paused)audio.play().then(sync).catch(sync);}
mute.onclick=()=>{if(audio.paused){paused=false;audio.muted=false;start();}else audio.muted=!audio.muted;sync();};
document.querySelector('#palace-track').onclick=()=>{room.showModal();paused=false;start();};document.querySelector('#palace-listening-close').onclick=()=>room.close();
play.onclick=()=>{if(audio.paused){paused=false;start();}else{paused=true;audio.pause();}};
seek.oninput=()=>{if(Number.isFinite(audio.duration))audio.currentTime=+seek.value;};document.querySelector('#palace-volume').oninput=e=>{audio.volume=+e.target.value;};
['play','pause','volumechange'].forEach(e=>audio.addEventListener(e,sync));audio.addEventListener('timeupdate',()=>{seek.max=audio.duration||112;seek.value=audio.currentTime;document.querySelector('#palace-time').textContent=time(audio.currentTime)+' / '+time(audio.duration||112);});
document.querySelector('.palace-action').addEventListener('click',start);window.addEventListener('pagehide',()=>audio.pause());start();
})();