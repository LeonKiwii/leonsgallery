(()=>{
const main=['index.html','abyss.html','genesis.html','menu.html'];
const page=location.pathname.split('/').pop()||'index.html';
let inMusicShell=false;
try{inMusicShell=window!==window.parent && parent.document.querySelector('#site')?.contentWindow===window && !!parent.document.querySelector('#journey-music');}catch{}
if(!inMusicShell){
 if(main.includes(page))location.replace('journey-shell.html?page='+encodeURIComponent(page+location.search+location.hash));
 return;
}
const report=()=>parent.postMessage({type:'leon-page',url:location.href,page},location.origin);
report();addEventListener('pageshow',report);
addEventListener('pointerdown',()=>parent.postMessage({type:'leon-audio-unlock'},location.origin),{capture:true});
addEventListener('keydown',()=>parent.postMessage({type:'leon-audio-unlock'},location.origin),{capture:true});
})();
