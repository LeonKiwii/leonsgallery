(()=>{
const reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;let leaving=false;
window.fadeNavigate=async url=>{if(leaving)return;leaving=true;if(!reduced)await document.body.animate([{opacity:1},{opacity:0}],{duration:400,easing:'ease-in-out',fill:'forwards'}).finished;location.assign(url)};
document.addEventListener('click',e=>{const a=e.target.closest('a[href]');if(!a||e.defaultPrevented||e.button||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||a.target==='_blank'||a.hasAttribute('download'))return;const url=new URL(a.href,location.href);if(url.origin!==location.origin||!url.pathname.endsWith('.html')||url.pathname===location.pathname&&url.hash)return;if(a.matches('.menu-label'))try{sessionStorage.setItem('leon-menu-origin',location.href)}catch{}e.preventDefault();e.stopImmediatePropagation();window.fadeNavigate(url.href)},true);
const show=HTMLDialogElement.prototype.showModal,close=HTMLDialogElement.prototype.close;
HTMLDialogElement.prototype.showModal=function(){this._fadeClosing=false;show.call(this);if(!reduced)this.animate([{opacity:0},{opacity:1}],{duration:450,easing:'ease-in-out'})};
HTMLDialogElement.prototype.close=function(value){if(this._fadeClosing||!this.open)return;this._fadeClosing=true;const done=()=>{close.call(this,value);this._fadeClosing=false};if(reduced){done();return}this.animate([{opacity:1},{opacity:0}],{duration:350,easing:'ease-in-out'}).finished.then(done)};
document.addEventListener('cancel',e=>{if(e.target instanceof HTMLDialogElement&&!e.defaultPrevented){e.preventDefault();e.target.close()}},false);
addEventListener('pageshow',e=>{leaving=false;if(e.persisted)document.body.getAnimations().forEach(a=>a.cancel())});
})();
