(()=>{
const button=document.querySelector('.invitation'),envelope=document.querySelector('.envelope'),flap=document.querySelector('.flap'),card=document.querySelector('.postcard'),stain=document.querySelector('.red-stain'),shreds=document.querySelector('.shreds'),status=document.querySelector('.softly-status');
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const animate=async(el,frames,duration,extra={})=>{const a=el.animate(frames,{duration:reduced?Math.min(duration,350):duration,easing:'cubic-bezier(.45,0,.2,1)',fill:'forwards',...extra});await a.finished;};

const tracks=[{"title": "growing pains", "src": "assets/art/softly-track-1.wav"}, {"title": "how to say", "src": "assets/art/softly-track-2.wav"}, {"title": "i flew away and?", "src": "assets/art/softly-track-3.wav"}, {"title": "so i built a grave for it to escape", "src": "assets/art/softly-track-4.wav"}, {"title": "would that bruise still bleed", "src": "assets/art/softly-track-5.wav"}];
const song=document.querySelector('#softly-song'),label=document.querySelector('.song-name'),toggle=document.querySelector('.song-toggle');
const gardenCover=document.createElement('img');gardenCover.className='garden-cover';gardenCover.src='assets/art/die-softly-cover.png';gardenCover.alt='The moment when I die softly album cover';gardenCover.decoding='async';document.querySelector('.garden-label').prepend(gardenCover);
const coverSrc='assets/art/die-softly-cover.png';
const coverFrame=document.createElement('span');coverFrame.className='cover-frame';coverFrame.innerHTML=`<img class="cover-image" src="${coverSrc}" alt="The moment when I die softly album cover"><span class="cover-caption">Stay here for a while, until I become transparent.</span>`;button.append(coverFrame);button.setAttribute('aria-label','Enter the listening garden');
const coverImage=coverFrame.querySelector('.cover-image');
let selected=-1;
const bgm=document.querySelector('#funeral-bgm'),bgmButton=document.querySelector('#funeral-mute');bgm.volume=.35;
function bgmState(){bgmButton.textContent=bgm.paused?'Play sound':bgm.muted?'Unmute':'Mute';bgmButton.setAttribute('aria-pressed',String(bgm.muted));}
function startBgm(){if(selected<0)bgm.play().then(bgmState).catch(bgmState);}
bgmButton.onclick=()=>{if(bgm.paused){song.pause();selected=-1;document.querySelectorAll('.song-flower').forEach(f=>f.setAttribute('aria-pressed','false'));bgm.muted=false;startBgm();}else{bgm.muted=!bgm.muted;bgmState();}};
['play','pause','volumechange'].forEach(e=>bgm.addEventListener(e,bgmState));
window.addEventListener('pagehide',()=>bgm.pause());startBgm();

const flowerPhoto='https://www.publicdomainpictures.net/pictures/640000/velka/flower-chrysanthemum-isolated.png';
function blossom(index,track){
 const tone=index%2?' ivory':' yellow';
 return `<span class="flower-photo-wrap"><img class="flower-photo${tone}" src="${flowerPhoto}" alt="Real chrysanthemum for ${track.title}" loading="eager" decoding="async"><span class="flower-name">${track.title}</span></span>`;
}
const playerDialog=document.createElement('dialog');playerDialog.className='flower-player';playerDialog.innerHTML=`<div class="flower-player-top"><span>LEÓN / LISTENING ROOM</span><button class="flower-player-close" type="button">&lt;Back</button></div><div class="flower-player-body"><img class="flower-player-cover" src="${coverSrc}" alt="The moment when I die softly album cover"><p class="flower-player-kicker">LEÓN · ORIGINAL SOUNDTRACK</p><h2 class="flower-player-title"></h2><p class="flower-player-credit">Music by León</p><div class="flower-transport"><div class="flower-time"><span class="elapsed">0:00</span><span class="duration">0:00</span></div><input class="flower-seek" type="range" min="0" max="100" value="0" step="0.1" aria-label="Playback position"><div class="flower-controls"><button class="flower-player-toggle" type="button">Pause</button><label>Volume <input class="flower-volume" type="range" min="0" max="1" value="1" step="0.01" aria-label="Volume"></label></div><p class="player-status" role="status"></p></div></div>`;document.body.append(playerDialog);
const playerTitle=playerDialog.querySelector('.flower-player-title'),playerToggle=playerDialog.querySelector('.flower-player-toggle'),playerClose=playerDialog.querySelector('.flower-player-close');
const seek=playerDialog.querySelector('.flower-seek'),playerStatus=playerDialog.querySelector('.player-status');
const time=value=>`${Math.floor((value||0)/60)}:${String(Math.floor((value||0)%60)).padStart(2,'0')}`;
function syncTime(){const duration=Number.isFinite(song.duration)?song.duration:0;seek.disabled=!duration;seek.max=duration||100;seek.value=song.currentTime;playerDialog.querySelector('.elapsed').textContent=time(song.currentTime);playerDialog.querySelector('.duration').textContent=time(duration);}
seek.oninput=()=>{if(Number.isFinite(song.duration))song.currentTime=Number(seek.value);};
playerDialog.querySelector('.flower-volume').oninput=e=>song.volume=Number(e.target.value);
['timeupdate','loadedmetadata','durationchange','emptied'].forEach(e=>song.addEventListener(e,syncTime));
song.addEventListener('waiting',()=>playerStatus.textContent='Loading…');
song.addEventListener('playing',()=>playerStatus.textContent='');
song.addEventListener('error',()=>{playerStatus.textContent='This recording could not load. Please try again.';status.textContent=playerStatus.textContent;});
const playSong=()=>song.play().catch(()=>{playerStatus.textContent='Press Play to start the recording.';});
const syncPlayer=()=>{playerToggle.textContent=song.paused?'Play':'Pause';};
const openImmersive=track=>{playerTitle.textContent=track.title;syncPlayer();syncTime();if(typeof playerDialog.showModal==='function')playerDialog.showModal();else playerDialog.setAttribute('open','');};
playerClose.onclick=()=>playerDialog.close();playerToggle.onclick=()=>song.paused?playSong():song.pause();['play','pause','ended'].forEach(event=>song.addEventListener(event,syncPlayer));
const tooltip=document.createElement('div');tooltip.className='flower-tooltip';tooltip.setAttribute('role','tooltip');tooltip.id='flower-tooltip';tooltip.hidden=true;document.body.append(tooltip);
let activeFlower=null;
function positionTooltip(){if(!activeFlower)return;const r=activeFlower.getBoundingClientRect();const t=tooltip.getBoundingClientRect();let x=r.right+12;if(x+t.width>innerWidth-20)x=r.left-t.width-12;tooltip.style.left=`${Math.max(16,Math.min(x,innerWidth-t.width-16))}px`;tooltip.style.top=`${Math.max(76,Math.min(r.top+r.height/2-t.height/2,innerHeight-t.height-54))}px`;}
function showTitle(flower,title){activeFlower=flower;tooltip.textContent=title;tooltip.hidden=false;positionTooltip();}
function hideTitle(){activeFlower=null;tooltip.hidden=true;}
addEventListener('resize',positionTooltip);addEventListener('scroll',positionTooltip);
tracks.forEach((track,i)=>{const flower=document.createElement('button');flower.className='song-flower';flower.type='button';flower.setAttribute('aria-label',`Play ${track.title} by León`);flower.setAttribute('aria-pressed','false');const angle=-90+i*72;flower.style.setProperty('--x',`${50+40*Math.cos(angle*Math.PI/180)}%`);flower.style.setProperty('--y',`${50+40*Math.sin(angle*Math.PI/180)}%`);flower.style.setProperty('--tilt',`${(i-2)*7}deg`);flower.innerHTML=blossom(i,track);document.querySelector('.flower-ring').append(flower);
 flower.addEventListener('pointerenter',()=>{showTitle(flower,track.title);if(!reduced){flower.querySelector('.flower-photo').getAnimations().forEach(a=>a.cancel());flower.querySelector('.flower-photo').animate([{transform:'rotate(0deg)'},{transform:'rotate(-6deg)'},{transform:'rotate(5deg)'},{transform:'rotate(-2deg)'},{transform:'rotate(0deg)'}],{duration:2100,easing:'ease-in-out'});}});
 flower.addEventListener('pointerleave',hideTitle);flower.addEventListener('focus',()=>showTitle(flower,track.title));flower.addEventListener('blur',hideTitle);
 flower.onclick=async()=>{bgm.pause();if(selected===i){hideTitle();openImmersive(track);return;}song.src=track.src;selected=i;label.textContent=track.title;toggle.hidden=false;try{await song.play();}catch{toggle.textContent='Play';}document.querySelectorAll('.song-flower').forEach((f,j)=>f.setAttribute('aria-pressed',String(i===j)));};
});
toggle.onclick=()=>song.paused?playSong():song.pause();
['play','pause','ended'].forEach(event=>song.addEventListener(event,()=>toggle.textContent=song.paused?'Play':'Pause'));
window.addEventListener('pagehide',()=>song.pause());
button.addEventListener('click',async()=>{
 if(button.disabled)return;button.disabled=true;startBgm();
 await coverImage.decode().catch(()=>{});
 status.textContent='The cover fades';
 const stillLife=document.querySelector('.still-life');
 await animate(coverFrame,[{opacity:1,transform:'rotate(-1deg) scale(1)'},{opacity:0,transform:'rotate(-1deg) scale(.985)'}],reduced?350:900);
 await animate(stillLife,[{opacity:1},{opacity:0}],reduced?300:900);
 stillLife.hidden=true;
 bgm.pause();bgm.currentTime=0;document.querySelector('.funeral-sound').hidden=true;
 const garden=document.querySelector('.flower-garden');garden.hidden=false;
 await animate(garden,[{opacity:0},{opacity:1}],reduced?350:1100);
});
})();
