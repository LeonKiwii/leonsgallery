(()=>{
const hero=document.querySelector('#art-hero'),gallery=document.querySelector('#art-gallery'),video=document.querySelector('#art-video'),audio=document.querySelector('#art-audio'),sound=document.querySelector('#art-sound'),exhibit=document.querySelector('#art-exhibit'),viewer=document.querySelector('.art-viewer');let category='posters',busy=false,muted=false,entered=false,touchY=0;
const preview=document.querySelector('#art-preview-video');
audio.volume=.38;
const videoSound=document.querySelector('#art-video-sound');
video.muted=false;video.volume=1;
function videoSoundState(){if(!videoSound)return;videoSound.hidden=false;videoSound.textContent=video.paused?'Play with sound':(video.muted?'Unmute':'Mute');videoSound.setAttribute('aria-pressed',String(video.muted));videoSound.setAttribute('aria-label',video.paused?'Play preview with sound':(video.muted?'Unmute preview':'Mute preview'))}
function playFilm(){return video.play().then(videoSoundState).catch(videoSoundState)}
if(videoSound)videoSound.onclick=()=>{if(video.paused){video.muted=false;playFilm()}else{video.muted=!video.muted;videoSoundState()}};
['play','pause','volumechange'].forEach(event=>video.addEventListener(event,videoSoundState));
playFilm();

function syncPreview(){if(entered&&category==='works'&&!document.hidden)preview.play().catch(()=>{});else preview.pause()}
const tracks={posters:'ephemeral',works:'evanescence',text:'sonder'},reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
function soundState(playing){sound.textContent=playing?'Mute':(muted?'Unmute':'Play sound');sound.setAttribute('aria-pressed',String(muted));sound.setAttribute('aria-label',playing?'Mute music':'Play music')}
function play(){if(!entered||muted)return;audio.play().then(()=>soundState(true)).catch(()=>soundState(false))}
function track(){const name=tracks[category];document.querySelector('#art-track-name').textContent=name[0].toUpperCase()+name.slice(1);audio.pause();soundState(false);audio.src=`assets/art/${tracks[category]}.mp3`;play()}
async function transition(change){
 if(busy)return;busy=true;
 if(reduced){change();busy=false;return}
 const curtain=document.querySelector('#art-fade');
 curtain.style.visibility='visible';
 try{
  await curtain.animate([{opacity:0},{opacity:1}],{duration:550,easing:'cubic-bezier(.4,0,.2,1)',fill:'forwards'}).finished;
  change();
  await curtain.animate([{opacity:1},{opacity:0}],{duration:750,easing:'cubic-bezier(.4,0,.2,1)',fill:'forwards'}).finished;
 }finally{curtain.style.visibility='hidden';curtain.getAnimations().forEach(a=>a.cancel());busy=false}
}
function enter(){if(entered||busy)return;entered=true;track();transition(()=>{hero.hidden=true;gallery.hidden=false;document.body.classList.add('exhibiting');video.pause();play();syncPreview()})}
document.querySelector('#art-enter').onclick=enter;hero.addEventListener('wheel',e=>{if(e.deltaY>10){e.preventDefault();enter()}},{passive:false});hero.addEventListener('touchstart',e=>touchY=e.touches[0].clientY,{passive:true});hero.addEventListener('touchend',e=>{if(touchY-e.changedTouches[0].clientY>40)enter()});document.addEventListener('keydown',e=>{if(!entered&&['ArrowDown','PageDown',' '].includes(e.key)&&document.querySelector('#about-panel').hidden){e.preventDefault();enter()}});
function returnToFilm(){if(!entered||busy||viewer.open)return;transition(()=>{entered=false;audio.pause();preview.pause();gallery.hidden=true;hero.hidden=false;document.body.classList.remove('exhibiting');playFilm()})}
let upward=0,lastWheel=0,galleryTouch=0,touchAtTop=false;
gallery.addEventListener('wheel',e=>{if(viewer.open||busy)return;if(e.deltaY<0&&exhibit.scrollTop<=1){e.preventDefault();const now=performance.now();if(now-lastWheel>250)upward=0;lastWheel=now;upward+=-e.deltaY;if(upward>65){upward=0;returnToFilm()}}else upward=0},{passive:false});
gallery.addEventListener('touchstart',e=>{galleryTouch=e.touches[0].clientY;touchAtTop=exhibit.scrollTop<=1},{passive:true});gallery.addEventListener('touchend',e=>{if(touchAtTop&&e.changedTouches[0].clientY-galleryTouch>65)returnToFilm()});
gallery.addEventListener('keydown',e=>{if(exhibit.scrollTop<=1&&['ArrowUp','PageUp'].includes(e.key)){e.preventDefault();returnToFilm()}});
document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{if(category===b.dataset.tab)return;category=b.dataset.tab;document.querySelectorAll('[data-category]').forEach(p=>p.hidden=p.dataset.category!==category);document.querySelectorAll('[data-tab]').forEach(p=>p.setAttribute('aria-pressed',String(p===b)));exhibit.scrollTop=0;exhibit.animate([{opacity:0},{opacity:1}],{duration:reduced?0:500});document.querySelector('#art-caption').textContent=category==='text'?'Paradisus missus / Text':document.querySelector(`[data-category="${category}"] .art-image`).dataset.title;track();syncPreview()});
sound.onclick=()=>{if(!audio.paused){muted=true;audio.pause();soundState(false)}else{muted=false;play()}};
document.querySelectorAll('.art-image').forEach(b=>b.onclick=()=>{document.querySelector('#art-view-title').textContent=b.dataset.title;const img=document.querySelector('#art-view-image');img.src=b.querySelector('img').src;img.alt=b.dataset.title;viewer.showModal()});document.querySelector('#art-view-close').onclick=()=>viewer.close();
const observer=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting&&e.intersectionRatio>.45)document.querySelector('#art-caption').textContent=e.target.dataset.title},{root:exhibit,threshold:[.45,.7]});document.querySelectorAll('.art-image').forEach(p=>observer.observe(p));

const room=document.querySelector('#listening-mode'),trackButton=document.querySelector('#art-track-name'),playButton=document.querySelector('#listening-play'),seek=document.querySelector('#listening-seek'),volume=document.querySelector('#listening-volume');
function stamp(t){if(!Number.isFinite(t))return '0:00';return `${Math.floor(t/60)}:${String(Math.floor(t%60)).padStart(2,'0')}`}
function playerState(){const playing=!audio.paused;playButton.textContent=playing?'Pause':'Play';playButton.setAttribute('aria-label',playing?'Pause music':'Play music');room.classList.toggle('is-playing',playing);soundState(playing);}
function progress(){const duration=Number.isFinite(audio.duration)?audio.duration:0;seek.max=duration||100;seek.value=audio.currentTime;seek.disabled=!duration;document.querySelector('#listening-time').textContent=stamp(audio.currentTime);document.querySelector('#listening-duration').textContent=stamp(duration);seek.setAttribute('aria-valuetext',`${stamp(audio.currentTime)} of ${stamp(duration)}`)}
trackButton.onclick=()=>{document.querySelector('#listening-title').textContent=trackButton.textContent;room.showModal();preview.pause();muted=false;play();volume.value=audio.volume;progress();playerState()};
document.querySelector('#listening-close').onclick=()=>room.close();room.addEventListener('close',()=>{trackButton.focus({preventScroll:true});syncPreview()});
playButton.onclick=()=>{if(audio.paused){muted=false;play()}else{muted=true;audio.pause()}};
seek.oninput=()=>{if(Number.isFinite(audio.duration))audio.currentTime=Number(seek.value);progress()};volume.oninput=()=>{audio.volume=Number(volume.value)};
['play','pause','ended'].forEach(event=>audio.addEventListener(event,playerState));['timeupdate','loadedmetadata','durationchange'].forEach(event=>audio.addEventListener(event,progress));
room.addEventListener('keydown',e=>{if(e.code==='Space'&&e.target.tagName!=='INPUT'&&e.target.tagName!=='BUTTON'){e.preventDefault();playButton.click()}});

document.addEventListener('visibilitychange',()=>{if(document.hidden){audio.pause();video.pause();preview.pause()}else if(entered){play();syncPreview()}else playFilm()});window.addEventListener('pagehide',()=>audio.pause());
})();
