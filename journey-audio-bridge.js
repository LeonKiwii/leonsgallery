(()=>{
const main=['index.html','abyss.html','genesis.html','menu.html'];
const page=location.pathname.split('/').pop()||'index.html';
if(window===window.top){
 if(main.includes(page))location.replace('journey-shell.html?page='+encodeURIComponent(page+location.search+location.hash));
 return;
}
const report=()=>parent.postMessage({type:'leon-page',url:location.href,page},location.origin);
report();addEventListener('pageshow',report);
addEventListener('pointerdown',()=>parent.postMessage({type:'leon-audio-unlock'},location.origin),{capture:true});
addEventListener('keydown',()=>parent.postMessage({type:'leon-audio-unlock'},location.origin),{capture:true});
})();
