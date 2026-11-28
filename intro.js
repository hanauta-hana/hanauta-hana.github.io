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
  '#intro .in-cam{position:absolute;left:0;top:5%;width:100%;height:88%;z-index:2;transform-origin:40% 18%;animation:in-cam 4s 1s both}'+
  '#intro .in-img{display:block;width:100%;height:100%;object-fit:contain;opacity:0;filter:blur(8px) drop-shadow(0 6px 14px rgba(160,50,100,.35));animation:in-rise .9s 1s ease-out forwards}'+
  '#intro .in-glow{position:absolute;left:50%;top:38%;width:130vmax;height:130vmax;margin:-65vmax 0 0 -65vmax;background:radial-gradient(circle,rgba(255,255,255,.85),rgba(255,255,255,0) 45%);opacity:0;animation:in-glow 2.4s 1.0s ease-out forwards}'+
  '#intro .in-logo{z-index:3;position:absolute;top:calc(env(safe-area-inset-top,0px) + 14px);right:4%;width:40%;height:auto;opacity:0;transform:scale(.6) rotate(-6deg);animation:in-pop .8s 4.4s cubic-bezier(.2,1.5,.4,1) forwards;filter:drop-shadow(0 2px 6px rgba(107,40,70,.45))}'+
  '#intro .in-skip{position:absolute;left:0;right:0;bottom:calc(env(safe-area-inset-bottom,0px) + 22px);text-align:center;font:700 12px "Zen Maru Gothic",sans-serif;color:#fff;text-shadow:0 1px 4px rgba(107,40,70,.6);opacity:0;animation:in-skip .6s 1s forwards}'+
  '#intro .in-p{position:absolute;top:-50px;left:0;width:var(--s);height:var(--s);background-size:contain;background-repeat:no-repeat;background-position:center;opacity:0;filter:saturate(.7) brightness(1.05) drop-shadow(0 0 3px rgba(228,134,174,.6));animation:in-fall var(--d) var(--l) linear forwards}'+
  '#intro .in-sp{position:absolute;width:var(--s);height:var(--s);background:#fff;clip-path:polygon(50% 0,61% 39%,100% 50%,61% 61%,50% 100%,39% 61%,0 50%,39% 39%);opacity:0;filter:drop-shadow(0 0 4px #ffd1e6);animation:in-tw 1.4s var(--l) ease-in-out infinite}'+
  '#intro .in-ht{position:absolute;bottom:-30px;left:var(--x);font-size:var(--s);color:#ff8fb8;opacity:0;text-shadow:0 0 6px rgba(255,255,255,.9);animation:in-up var(--d) var(--l) ease-out forwards}'+
  '#intro .in-msg{z-index:3;position:absolute;left:50%;bottom:calc(env(safe-area-inset-bottom,0px) + 56px);transform:translateX(-50%) scale(.5);white-space:nowrap;color:#fff;font:400 20px \\"Hachi Maru Pop\\",\\"Zen Maru Gothic\\",sans-serif;text-shadow:0 0 3px #e0709f,0 0 3px #e0709f,0 0 6px #e0709f,0 2px 8px rgba(160,50,100,.6);letter-spacing:.04em;opacity:0;animation:in-msg .7s 4.7s cubic-bezier(.2,1.6,.4,1) forwards}'+
  '@keyframes in-tw{0%,100%{opacity:0;transform:scale(.2) rotate(0)}50%{opacity:1;transform:scale(1) rotate(45deg)}}'+
  '@keyframes in-up{0%{opacity:0;transform:translateY(0) scale(.6)}15%{opacity:1}100%{opacity:0;transform:translateY(-75vh) scale(1.1)}}'+
  '@keyframes in-msg{to{opacity:1;transform:translateX(-50%) scale(1)}}'+
  '#intro .in-w{position:absolute;top:0;left:0;z-index:4;width:var(--s);height:var(--s);background-size:contain;background-repeat:no-repeat;background-position:center;opacity:0;filter:saturate(1.5) drop-shadow(0 0 3px rgba(228,134,174,.7));animation:in-sweep var(--d) var(--l) ease-in-out forwards}'+
  '@keyframes in-rise{0%{opacity:0;filter:blur(8px) drop-shadow(0 6px 14px rgba(160,50,100,.35))}100%{opacity:1;filter:blur(0) drop-shadow(0 6px 14px rgba(160,50,100,.35))}}'+
  '@keyframes in-cam{0%,24%{transform:translate(10%,32%) scale(1.9);animation-timing-function:cubic-bezier(.5,0,.2,1)}46%,64%{transform:translate(4.6%,46.2%) scale(1.9);animation-timing-function:cubic-bezier(.4,0,.15,1)}100%{transform:translate(0,0) scale(1)}}'+
  '@keyframes in-sweep{0%{opacity:0;transform:translate3d(var(--x0),var(--y0),0) rotate(var(--r0))}12%{opacity:.95}85%{opacity:.95}100%{opacity:0;transform:translate3d(var(--x1),var(--y1),0) rotate(calc(var(--r0) + 420deg))}}'+
  '@keyframes in-glow{0%{opacity:0;transform:scale(.6)}35%{opacity:1}100%{opacity:0;transform:scale(1.15)}}'+
  '@keyframes in-pop{0%{opacity:0;transform:scale(.6) rotate(-6deg)}100%{opacity:1;transform:scale(1) rotate(0)}}'+
  '@keyframes in-skip{to{opacity:.9}}'+
  '@keyframes in-fall{0%{opacity:0;transform:translate3d(var(--x0),0,0) rotate(var(--r0))}10%{opacity:1}90%{opacity:1}100%{opacity:0;transform:translate3d(var(--x1),calc(100vh + 80px),0) rotate(calc(var(--r0) + 300deg))}}';
  document.head.appendChild(st);
  var el=document.createElement('div');el.id='intro';el.setAttribute('aria-hidden','true');
  var h='<div class="in-cam"><img class="in-img" src="img/outfit-kimono.webp" alt=""></div><img class="in-logo" src="img/logo.png" alt="">';
  var w=Math.max(window.innerWidth,320);
  for(var i=0;i<52;i++){
    var s=16+Math.random()*20,x0=Math.random()*w,dx=(Math.random()-.5)*160,
        d=2.6+Math.random()*1.8,l=(Math.random()*0.9).toFixed(2);
    h+='<i class="in-p" style="--s:'+s.toFixed(0)+'px;--x0:'+x0.toFixed(0)+'px;--x1:'+(x0+dx).toFixed(0)+'px;--r0:'+Math.floor(Math.random()*360)+'deg;--d:'+d.toFixed(2)+'s;--l:'+l+'s;background-image:url(img/petal/p'+Math.floor(Math.random()*8)+'.png)"></i>';
  }
  for(var q=0;q<46;q++){
    var ws=18+Math.random()*24,ww=Math.max(window.innerWidth,320),wh=Math.max(window.innerHeight,600),
        y0=Math.random()*wh*.9,xs=-60-Math.random()*60,xe=ww+60+Math.random()*80,
        wd=1.8+Math.random()*1.4,wl=(3.2+Math.random()*1.3).toFixed(2);
    h+='<i class="in-w" style="--s:'+ws.toFixed(0)+'px;--x0:'+xs.toFixed(0)+'px;--x1:'+xe.toFixed(0)+'px;--y0:'+y0.toFixed(0)+'px;--y1:'+(y0+(Math.random()-.3)*260).toFixed(0)+'px;--r0:'+Math.floor(Math.random()*360)+'deg;--d:'+wd.toFixed(2)+'s;--l:'+wl+'s;background-image:url(img/petal/p'+Math.floor(Math.random()*8)+'.png)"></i>';
  }
  for(var j=0;j<16;j++){h+='<i class="in-sp" style="--s:'+(8+Math.random()*14).toFixed(0)+'px;left:'+(Math.random()*96).toFixed(0)+'%;top:'+(Math.random()*85).toFixed(0)+'%;--l:'+(Math.random()*1.8).toFixed(2)+'s"></i>'}
  for(var k=0;k<9;k++){h+='<i class="in-ht" style="--s:'+(14+Math.random()*14).toFixed(0)+'px;--x:'+(5+Math.random()*88).toFixed(0)+'%;--d:'+(1.8+Math.random()*1.2).toFixed(2)+'s;--l:'+(0.9+Math.random()*1.4).toFixed(2)+'s">♥</i>'}
  h+='<div class="in-msg">いらっしゃいませ、飼い主さん</div>';
  h+='<div class="in-skip">タップでスキップ</div>';
  el.innerHTML=h;document.body.appendChild(el);
  var done=false;
  function end(){if(done)return;done=true;el.classList.add('out');setTimeout(function(){el.remove();st.remove()},1000)}
  el.addEventListener('click',end);
  setTimeout(end,6200);
}
if(root.classList.contains('locked'))window.addEventListener('hana-unlock',start,{once:true});
else if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);
else start();
})();
