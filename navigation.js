(()=>{
'use strict';
const homeURL=new URL('index.html',location.href).href;
window.openMenuContext=()=>location.assign(new URL('menu.html',location.href).href);
window.closeMenuContext=()=>location.assign(menuReturnURL());
function menuReturnURL(){try{return sessionStorage.getItem('leon-menu-origin')||homeURL;}catch{return homeURL;}}
// Menu is a normal page: both return links work without messaging or JavaScript.
document.querySelectorAll('.brand-home').forEach(link=>{
 link.href=homeURL;link.removeAttribute('target');
});
if(location.pathname.endsWith('/menu.html')){const back=document.querySelector('.return-bar a');if(back)back.href=menuReturnURL();}
document.addEventListener('click',event=>{
 const menu=event.target.closest('.menu-label');
 if(menu&&!location.pathname.endsWith('/menu.html')){try{sessionStorage.setItem('leon-menu-origin',location.href.split('#')[0]);}catch{}}

 const brand=event.target.closest('.masthead .theme-toggle');
 if(!brand)return;
 if(document.body.classList.contains('door-mode')||document.body.classList.contains('portal-bursting')||document.body.classList.contains('about-open')){
  event.preventDefault();event.stopImmediatePropagation();window.fadeNavigate?window.fadeNavigate(homeURL):location.assign(homeURL);
 }
},true);
})();
