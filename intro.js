/* 入場アニメーション: 花びらが舞って、イラストが浮かび上がる(1セッション1回・タップで飛ばせる) */
(function(){
'use strict';
var root=document.documentElement;
var reduce=false;try{reduce=window.matchMedia('(prefers-reduced-motion:reduce)').matches}catch(e){}
try{if(sessionStorage.getItem('hana_intro')==='1')return}catch(e){}
if(reduce)return;
var started=false;
function start(){
  if(started)return;started=true;
  try{sessionStorage.setItem('hana_intro','1')}catch(e){}
  var st=document.createElement('style');
  st.textContent=
  '#intro{position:fixed;inset:0;z-index:9000;overflow:hidden;background:linear-gradient(170deg,#fde4ee,#f9c3da 50%,#fcd5e3);opacity:1;transition:opacity .9s ease;touch-action:manipulation}'+
  '#intro.out{opacity:0;pointer-events:none}'+
  '#intro .in-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:50% 12%;opacity:0;filter:blur(18px) brightness(1.25) saturate(.7);transform:scale(1.08);animation:in-rise 2.2s .35s cubic-bezier(.2,.7,.2,1) forwards}'+
  '#intro .in-glow{position:absolute;left:50%;top:38%;width:130vmax;height:130vmax;margin:-65vmax 0 0 -65vmax;background:radial-gradient(circle,rgba(255,255,255,.85),rgba(255,255,255,0) 45%);opacity:0;animation:in-glow 2.4s .1s ease-out forwards}'+
  '#intro .in-logo{position:absolute;top:calc(env(safe-area-inset-top,0px) + 14px);right:4%;width:40%;height:auto;opacity:0;transform:scale(.6) rotate(-6deg);animation:in-pop .8s 1.7s cubic-bezier(.2,1.5,.4,1) forwards;filter:drop-shadow(0 2px 6px rgba(107,40,70,.45))}'+
  '#intro .in-skip{position:absolute;left:0;right:0;bottom:calc(env(safe-area-inset-bottom,0px) + 22px);text-align:center;font:700 12px "Zen Maru Gothic",sans-serif;color:#fff;text-shadow:0 1px 4px rgba(107,40,70,.6);opacity:0;animation:in-skip .6s 1s forwards}'+
  '#intro .in-p{position:absolute;top:-50px;left:0;width:var(--s);height:var(--s);background-size:contain;background-repeat:no-repeat;background-position:center;opacity:0;filter:saturate(.7) brightness(1.05) drop-shadow(0 0 3px rgba(228,134,174,.6));animation:in-fall var(--d) var(--l) linear forwards}'+
  '@keyframes in-rise{0%{opacity:0;filter:blur(18px) brightness(1.25) saturate(.7);transform:scale(1.08)}60%{opacity:1}100%{opacity:1;filter:blur(0) brightness(1) saturate(1);transform:scale(1)}}'+
  '@keyframes in-glow{0%{opacity:0;transform:scale(.6)}35%{opacity:1}100%{opacity:0;transform:scale(1.15)}}'+
  '@keyframes in-pop{0%{opacity:0;transform:scale(.6) rotate(-6deg)}100%{opacity:1;transform:scale(1) rotate(0)}}'+
  '@keyframes in-skip{to{opacity:.9}}'+
  '@keyframes in-fall{0%{opacity:0;transform:translate3d(var(--x0),0,0) rotate(var(--r0))}10%{opacity:1}90%{opacity:1}100%{opacity:0;transform:translate3d(var(--x1),calc(100vh + 80px),0) rotate(calc(var(--r0) + 300deg))}}';
  document.head.appendChild(st);
  var el=document.createElement('div');el.id='intro';el.setAttribute('aria-hidden','true');
  var h='<div class="in-glow"></div><img class="in-img" src="img/hero-bg.webp" alt=""><img class="in-logo" src="img/logo.png" alt="">';
  var w=Math.max(window.innerWidth,320);
  for(var i=0;i<26;i++){
    var s=14+Math.random()*16,x0=Math.random()*w,dx=(Math.random()-.5)*160,
        d=2.6+Math.random()*1.8,l=(Math.random()*1.6).toFixed(2);
    h+='<i class="in-p" style="--s:'+s.toFixed(0)+'px;--x0:'+x0.toFixed(0)+'px;--x1:'+(x0+dx).toFixed(0)+'px;--r0:'+Math.floor(Math.random()*360)+'deg;--d:'+d.toFixed(2)+'s;--l:'+l+'s;background-image:url(img/petal/p'+Math.floor(Math.random()*8)+'.png)"></i>';
  }
  h+='<div class="in-skip">タップでスキップ</div>';
  el.innerHTML=h;document.body.appendChild(el);
  var done=false;
  function end(){if(done)return;done=true;el.classList.add('out');setTimeout(function(){el.remove();st.remove()},1000)}
  el.addEventListener('click',end);
  setTimeout(end,3400);
}
if(root.classList.contains('locked'))window.addEventListener('hana-unlock',start,{once:true});
else if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);
else start();
})();
