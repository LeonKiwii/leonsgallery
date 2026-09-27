(()=>{
const button=document.querySelector('.invitation'),envelope=document.querySelector('.envelope'),flap=document.querySelector('.flap'),card=document.querySelector('.postcard'),stain=document.querySelector('.red-stain'),shreds=document.querySelector('.shreds'),status=document.querySelector('.softly-status');
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const animate=async(el,frames,duration,extra={})=>{const a=el.animate(frames,{duration:reduced?Math.min(duration,350):duration,easing:'cubic-bezier(.45,0,.2,1)',fill:'forwards',...extra});await a.finished;};
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const tracks=[{"title": "growing pains", "src": "assets/art/softly-track-1.wav"}, {"title": "how to say", "src": "assets/art/softly-track-2.wav"}, {"title": "i flew away and?", "src": "assets/art/softly-track-3.wav"}, {"title": "so i built a grave for it to escape", "src": "assets/art/softly-track-4.wav"}, {"title": "would that bruise still bleed", "src": "assets/art/softly-track-5.wav"}];
const song=document.querySelector('#softly-song'),label=document.querySelector('.song-name'),toggle=document.querySelector('.song-toggle');
const gardenCover=document.createElement('img');gardenCover.className='garden-cover';gardenCover.src='assets/art/die-softly-cover.png';gardenCover.alt='The moment when I die softly album cover';gardenCover.decoding='async';document.querySelector('.garden-label').prepend(gardenCover);
const coverSrc='assets/art/die-softly-cover.png';
const coverFrame=document.createElement('span');coverFrame.className='cover-frame';coverFrame.innerHTML=`<img class="cover-image" src="${coverSrc}" alt="The moment when I die softly album cover"><span class="cover-caption">Stay here for a while, until I become transparent.</span>`;button.append(coverFrame);
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
const playerDialog=document.createElement('dialog');playerDialog.className='flower-player';playerDialog.innerHTML=`<div class="flower-player-top"><span>LEÓN / LISTENING ROOM</span><button class="flower-player-close" type="button">&lt;Back</button></div><div class="flower-player-body"><img class="flower-player-cover" src="${coverSrc}" alt="The moment when I die softly album cover"><p class="flower-player-kicker">LEÓN · ORIGINAL SOUNDTRACK</p><h2 class="flower-player-title"></h2><p class="flower-player-credit">Music by León</p><button class="flower-player-toggle" type="button">Pause</button></div>`;document.body.append(playerDialog);
const playerTitle=playerDialog.querySelector('.flower-player-title'),playerToggle=playerDialog.querySelector('.flower-player-toggle'),playerClose=playerDialog.querySelector('.flower-player-close');
const syncPlayer=()=>{playerToggle.textContent=song.paused?'Play':'Pause';};
const openImmersive=track=>{playerTitle.textContent=track.title;syncPlayer();if(typeof playerDialog.showModal==='function')playerDialog.showModal();else playerDialog.setAttribute('open','');};
playerClose.onclick=()=>playerDialog.close();playerToggle.onclick=()=>song.paused?song.play().catch(()=>{}):song.pause();['play','pause','ended'].forEach(event=>song.addEventListener(event,syncPlayer));
tracks.forEach((track,i)=>{const flower=document.createElement('button');flower.className='song-flower';flower.type='button';flower.setAttribute('aria-label',`Play ${track.title} by León`);flower.setAttribute('aria-pressed','false');const angle=-90+i*72;flower.style.setProperty('--x',`${50+40*Math.cos(angle*Math.PI/180)}%`);flower.style.setProperty('--y',`${50+40*Math.sin(angle*Math.PI/180)}%`);flower.style.setProperty('--tilt',`${(i-2)*7}deg`);flower.innerHTML=blossom(i,track);document.querySelector('.flower-ring').append(flower);
 flower.addEventListener('pointerenter',()=>{if(!reduced)flower.querySelector('.flower-photo').animate([{transform:'rotate(0deg)'},{transform:'rotate(-6deg)'},{transform:'rotate(5deg)'},{transform:'rotate(-2deg)'},{transform:'rotate(0deg)'}],{duration:2100,easing:'ease-in-out'});});
 flower.onclick=async()=>{bgm.pause();if(selected===i){openImmersive(track);return;}song.src=track.src;selected=i;label.textContent=track.title;toggle.hidden=false;try{await song.play();}catch{toggle.textContent='Play';}document.querySelectorAll('.song-flower').forEach((f,j)=>f.setAttribute('aria-pressed',String(i===j)));};
});
toggle.onclick=()=>song.paused?song.play().catch(()=>{}):song.pause();
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
