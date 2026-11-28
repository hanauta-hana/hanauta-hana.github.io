/* 入場アニメーション: 桜吹雪 → 風で「手」→ 風で「顔」→ 桜吹雪で「全身」(1セッション1回・タップで飛ばせる) */
(function(){
'use strict';
var root=document.documentElement;
var reduce=false;try{reduce=window.matchMedia('(prefers-reduced-motion:reduce)').matches}catch(e){}
try{if(sessionStorage.getItem('hana_intro')==='1')return}catch(e){}
if(reduce)return;
var started=false;
function R(a,b){return a+Math.random()*(b-a)}
function P(){return 'img/petal/p'+Math.floor(Math.random()*8)+'.png'}
function start(){
  if(started)return;started=true;
  try{sessionStorage.setItem('hana_intro','1')}catch(e){}
  var st=document.createElement('style');
  var M='radial-gradient(ellipse closest-side,#000 55%,rgba(0,0,0,0) 100%)';
  st.textContent=
  '#intro{position:fixed;inset:0;z-index:9000;overflow:hidden;background:linear-gradient(170deg,#fde4ee,#f9c3da 50%,#fcd5e3);opacity:1;transition:opacity .9s ease;touch-action:manipulation}'+
  '#intro.out{opacity:0;pointer-events:none}'+
  '#intro .in-vp{position:absolute;inset:0;z-index:2;-webkit-mask-image:'+M+';mask-image:'+M+';-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;-webkit-mask-position:50% 50%;mask-position:50% 50%;-webkit-mask-size:96vw 50vw;mask-size:96vw 50vw;animation:in-mask 6s .9s both}'+
  '#intro .in-cam{position:absolute;left:0;top:5%;width:100%;height:88%;transform-origin:40% 18%;animation:in-cam 6s .9s both}'+
  '#intro .in-img{display:block;width:100%;height:100%;object-fit:contain;opacity:0;filter:drop-shadow(0 6px 14px rgba(160,50,100,.35));animation:in-rise .5s 1.1s ease-out forwards}'+
  '#intro .in-logo{position:absolute;z-index:3;top:calc(env(safe-area-inset-top,0px) + 14px);right:4%;width:40%;height:auto;opacity:0;transform:scale(.6) rotate(-6deg);animation:in-pop .8s 5.9s cubic-bezier(.2,1.5,.4,1) forwards;filter:drop-shadow(0 2px 6px rgba(107,40,70,.45))}'+
  '#intro .in-msg{position:absolute;z-index:3;left:50%;bottom:calc(env(safe-area-inset-bottom,0px) + 56px);transform:translateX(-50%) scale(.5);white-space:nowrap;color:#fff;font:400 20px "Hachi Maru Pop","Zen Maru Gothic",sans-serif;text-shadow:0 0 3px #e0709f,0 0 3px #e0709f,0 0 6px #e0709f,0 2px 8px rgba(160,50,100,.6);letter-spacing:.04em;opacity:0;animation:in-msg .7s 6.2s cubic-bezier(.2,1.6,.4,1) forwards}'+
  '#intro .in-skip{position:absolute;z-index:5;left:0;right:0;bottom:calc(env(safe-area-inset-bottom,0px) + 22px);text-align:center;font:700 12px "Zen Maru Gothic",sans-serif;color:#fff;text-shadow:0 1px 4px rgba(107,40,70,.6);opacity:0;animation:in-skip .6s .8s forwards}'+
  /* ふわっと落ちる花びら(背景側) */
  '#intro .in-p{position:absolute;top:-50px;left:0;z-index:1;width:var(--s);height:var(--s);opacity:0;filter:saturate(.8) drop-shadow(0 0 3px rgba(228,134,174,.6));animation:in-fall var(--d) var(--l) linear forwards}'+
  '#intro b{display:block;width:100%;height:100%;background-size:contain;background-repeat:no-repeat;background-position:center;animation:in-flip var(--f) ease-in-out infinite alternate}'+
  /* 風で流れる花びら(手前) */
  '#intro .in-w{position:absolute;top:0;left:0;z-index:4;width:var(--s);height:var(--s);opacity:0;filter:saturate(1.5) drop-shadow(0 0 3px rgba(228,134,174,.7));animation:in-sweep var(--d) var(--l) cubic-bezier(.3,.1,.5,1) forwards}'+
  /* ぱあっと広がる花びら */
  '#intro .in-b{position:absolute;left:50%;top:46%;z-index:4;width:var(--s);height:var(--s);margin:calc(var(--s)/-2) 0 0 calc(var(--s)/-2);opacity:0;filter:saturate(1.5) drop-shadow(0 0 4px rgba(255,255,255,.9));animation:in-burst var(--d) var(--l) cubic-bezier(.1,.7,.3,1) forwards}'+
  '#intro .in-sp{position:absolute;z-index:3;width:var(--s);height:var(--s);background:#fff;clip-path:polygon(50% 0,61% 39%,100% 50%,61% 61%,50% 100%,39% 61%,0 50%,39% 39%);opacity:0;filter:drop-shadow(0 0 4px #ffd1e6);animation:in-tw 1.4s var(--l) ease-in-out infinite}'+
  '@keyframes in-mask{0%,38%{-webkit-mask-size:96vw 50vw;mask-size:96vw 50vw}40%,60%{-webkit-mask-size:92vw 92vw;mask-size:92vw 92vw}76%,100%{-webkit-mask-size:320vmax 320vmax;mask-size:320vmax 320vmax}}'+
  /* カメラ: 手 → (風で切替)顔 → 全身 */
  '@keyframes in-cam{0%{transform:translate(10%,32%) scale(2.2)}38%{transform:translate(10%,32%) scale(2.3)}40%{transform:translate(3.2%,50%) scale(2.4)}41%{transform:translate(3.2%,50%) scale(2.4)}60%{transform:translate(3.2%,50%) scale(2.5);animation-timing-function:cubic-bezier(.4,0,.15,1)}78%,100%{transform:translate(0,0) scale(1)}}'+
  '@keyframes in-rise{0%{opacity:0}100%{opacity:1}}'+
  '@keyframes in-pop{0%{opacity:0;transform:scale(.6) rotate(-6deg)}100%{opacity:1;transform:scale(1) rotate(0)}}'+
  '@keyframes in-msg{to{opacity:1;transform:translateX(-50%) scale(1)}}'+
  '@keyframes in-skip{to{opacity:.9}}'+
  '@keyframes in-tw{0%,100%{opacity:0;transform:scale(.2) rotate(0)}50%{opacity:1;transform:scale(1) rotate(45deg)}}'+
  '@keyframes in-fall{0%{opacity:0;transform:translate3d(var(--x0),0,0) rotate(var(--r0))}10%{opacity:1}90%{opacity:1}100%{opacity:0;transform:translate3d(var(--x1),calc(100vh + 80px),0) rotate(calc(var(--r0) + 300deg))}}'+
  '@keyframes in-flip{0%{transform:translateX(-14px) rotateY(0) rotateZ(-20deg)}100%{transform:translateX(14px) rotateY(200deg) rotateZ(30deg)}}'+
  '@keyframes in-sweep{0%{opacity:0;transform:translate3d(var(--x0),var(--y0),0) rotate(var(--r0))}14%{opacity:.95}80%{opacity:.95}100%{opacity:0;transform:translate3d(var(--x1),var(--y1),0) rotate(calc(var(--r0) + 540deg))}}'+
  '@keyframes in-burst{0%{opacity:0;transform:translate(0,0) scale(.2) rotate(0)}15%{opacity:1}100%{opacity:0;transform:translate(var(--bx),var(--by)) scale(1.1) rotate(var(--br))}}';
  document.head.appendChild(st);
  var el=document.createElement('div');el.id='intro';el.setAttribute('aria-hidden','true');
  var W=Math.max(window.innerWidth,320),H=Math.max(window.innerHeight,600);
  var h='<div class="in-vp"><div class="in-cam"><img class="in-img" src="img/outfit-kimono.webp" alt=""></div></div><img class="in-logo" src="img/logo.png" alt="">';
  /* ゆるく落ちる花びら */
  for(var i=0;i<40;i++){
    var x0=R(0,W);
    h+='<i class="in-p" style="--s:'+R(14,30).toFixed(0)+'px;--x0:'+x0.toFixed(0)+'px;--x1:'+(x0+R(-90,90)).toFixed(0)+'px;--r0:'+Math.floor(R(0,360))+'deg;--d:'+R(2.8,4.4).toFixed(2)+'s;--l:'+R(0,5.2).toFixed(2)+'s;--f:'+R(.9,2.1).toFixed(2)+'s"><b style="background-image:url('+P()+')"></b></i>';
  }
  /* 風で流れる花びら(桜吹雪): [開始秒, 本数, 向き(1=右へ,-1=左へ), 継続秒] */
  [[0.15,70,1,1.5],[2.0,80,-1,1.5],[4.3,110,1,1.9]].forEach(function(g){
    for(var q=0;q<g[1];q++){
      var s=R(16,40),xs=g[2]>0?-70-R(0,80):W+70+R(0,80),xe=g[2]>0?W+70+R(0,120):-70-R(0,120),y0=R(-30,H*.95);
      h+='<i class="in-w" style="--s:'+s.toFixed(0)+'px;--x0:'+xs.toFixed(0)+'px;--x1:'+xe.toFixed(0)+'px;--y0:'+y0.toFixed(0)+'px;--y1:'+(y0+R(-200,260)).toFixed(0)+'px;--r0:'+Math.floor(R(0,360))+'deg;--d:'+R(g[3]*.8,g[3]*1.4).toFixed(2)+'s;--l:'+(g[0]+R(0,g[3]*.6)).toFixed(2)+'s"><b style="--f:'+R(.5,1.2).toFixed(2)+'s;background-image:url('+P()+')"></b></i>';
    }
  });
  /* 全身が現れる時にぱあっと広がる */
  for(var u=0;u<50;u++){
    var a=R(0,Math.PI*2),d=Math.max(W,H)*R(.35,.95);
    h+='<i class="in-b" style="--s:'+R(16,40).toFixed(0)+'px;--bx:'+(Math.cos(a)*d).toFixed(0)+'px;--by:'+(Math.sin(a)*d*.9-40).toFixed(0)+'px;--br:'+Math.floor(R(240,600))+'deg;--d:'+R(1.6,2.6).toFixed(2)+'s;--l:'+R(5.0,5.4).toFixed(2)+'s"><b style="background-image:url('+P()+')"></b></i>';
  }
  for(var j=0;j<16;j++){h+='<i class="in-sp" style="--s:'+R(8,22).toFixed(0)+'px;left:'+R(0,96).toFixed(0)+'%;top:'+R(0,85).toFixed(0)+'%;--l:'+R(4,6.5).toFixed(2)+'s"></i>'}
  h+='<div class="in-msg">いらっしゃいませ、飼い主さん</div><div class="in-skip">タップでスキップ</div>';
  el.innerHTML=h;document.body.appendChild(el);
  var done=false;
  function end(){if(done)return;done=true;el.classList.add('out');setTimeout(function(){el.remove();st.remove()},1000)}
  el.addEventListener('click',end);
  setTimeout(end,7800);
}
if(root.classList.contains('locked'))window.addEventListener('hana-unlock',start,{once:true});
else if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);
else start();
})();
