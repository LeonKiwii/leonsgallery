(()=>{
const main=['index.html','abyss.html','genesis.html'];
const page=location.pathname.split('/').pop()||'index.html';
let inMusicShell=location.protocol==='file:' && window!==window.parent;
try{inMusicShell=inMusicShell || window!==window.parent && parent.document.querySelector('#site')?.contentWindow===window && !!parent.document.querySelector('#journey-music');}catch{}
if(!inMusicShell){
 if(main.includes(page))location.replace('journey-shell.html?page='+encodeURIComponent(page+location.search+location.hash));
 return;
}
const report=()=>parent.postMessage({type:'leon-page',url:location.href,page},location.protocol==='file:'?'*':location.origin);
const hideShellAudio=()=>{if(main.includes(page))return;try{const bar=parent.document.querySelector('#journey-controls');const audio=parent.document.querySelector('#journey-music');if(bar){bar.hidden=true;bar.style.display='none'}if(audio){audio.pause();audio.currentTime=0}}catch{}};
report();hideShellAudio();addEventListener('pageshow',()=>{report();hideShellAudio()});
addEventListener('pointerdown',()=>parent.postMessage({type:'leon-audio-unlock'},location.protocol==='file:'?'*':location.origin),{capture:true});
addEventListener('keydown',()=>parent.postMessage({type:'leon-audio-unlock'},location.protocol==='file:'?'*':location.origin),{capture:true});
})();
