/* 入場アニメーション: 桜吹雪 → 風で「手」→ 風で「顔」→ 桜吹雪で「全身」(1セッション1回・タップで飛ばせる) */
(function(){
'use strict';
var root=document.documentElement;
var reduce=false;try{reduce=window.matchMedia('(prefers-reduced-motion:reduce)').matches}catch(e){}
try{if(sessionStorage.getItem('hana_intro')==='1')return}catch(e){}
if(reduce)return;
var started=false;
function R(a,b){return a+Math.random()*(b-a)}
function P(){var i=Math.floor(Math.random()*8),v=Math.floor(Math.random()*5);return v===4?'img/petal/p'+i+'.png':'img/petal/c'+i+'abcd'.charAt(v)+'.png'}
function start(){
  if(started)return;started=true;
  try{sessionStorage.setItem('hana_intro','1')}catch(e){}
  var st=document.createElement('style');
  var M='linear-gradient(to bottom,rgba(0,0,0,0),#000 14%,#000 86%,rgba(0,0,0,0))';
  st.textContent=
  '#intro{position:fixed;inset:0;z-index:9000;overflow:hidden;background:linear-gradient(170deg,#fde4ee,#f9c3da 50%,#fcd5e3);opacity:1;transition:opacity .5s ease;touch-action:manipulation}'+
  '#intro.out{opacity:0;pointer-events:none}'+
  '#intro .in-vp{position:absolute;inset:0;z-index:2;-webkit-mask-image:'+M+';mask-image:'+M+';-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;-webkit-mask-position:0 var(--y1);mask-position:0 var(--y1);-webkit-mask-size:100% var(--h1);mask-size:100% var(--h1);animation:in-mask 6s .9s both}'+
  '#intro .in-cam{position:absolute;left:0;top:0;width:100px;height:100px;transform-origin:0 0;will-change:transform}'+
  '#intro .in-img{display:block;width:100%;height:100%;object-fit:fill;opacity:0;animation:in-rise .6s .3s ease-out forwards}'+
  '#intro .in-logo{position:absolute;z-index:3;top:calc(env(safe-area-inset-top,0px) + 14px);right:4%;width:40%;height:auto;opacity:0;transform:scale(.6) rotate(-6deg);animation:in-pop .8s 5.9s cubic-bezier(.2,1.5,.4,1) forwards;filter:drop-shadow(0 2px 6px rgba(107,40,70,.45))}'+
  '#intro .in-msg{position:absolute;z-index:3;left:0;right:0;top:37%;display:flex;flex-direction:column;align-items:center;gap:10px;pointer-events:none}'+
  '#intro .in-msg .tx{white-space:nowrap;color:#fff;font:500 17px "Zen Maru Gothic","Hiragino Maru Gothic ProN",sans-serif;letter-spacing:.2em;text-shadow:0 0 6px rgba(224,112,159,.95),0 0 12px rgba(224,112,159,.7),0 1px 10px rgba(160,50,100,.6)}'+
  '#intro .in-msg .tx span{display:inline-block;opacity:0;transform:translateY(8px);filter:blur(5px);animation:in-ch .8s ease-out forwards}'+
  '#intro .in-msg .ln{width:0;height:1px;background:linear-gradient(90deg,rgba(255,255,255,0),#fff,rgba(255,255,255,0));box-shadow:0 0 6px rgba(224,112,159,.9);animation:in-ln 1s 5.9s ease-out forwards}'+
  '@keyframes in-ch{to{opacity:1;transform:none;filter:blur(0)}}'+
  '@keyframes in-ln{to{width:min(240px,64vw)}}'+
  '#intro .in-skip{position:absolute;z-index:5;left:0;right:0;bottom:calc(env(safe-area-inset-bottom,0px) + 22px);text-align:center;font:700 12px "Zen Maru Gothic",sans-serif;color:#fff;text-shadow:0 1px 4px rgba(107,40,70,.6);opacity:0;animation:in-skip .6s .8s forwards}'+
  /* ふわっと落ちる花びら(背景側) */
  '#intro .in-p{position:absolute;top:-50px;left:0;z-index:1;width:var(--s);height:var(--s);opacity:0;animation:in-fall var(--d) var(--l) linear forwards}'+
  '#intro b{display:block;width:100%;height:100%;background-size:contain;background-repeat:no-repeat;background-position:center;animation:in-flip var(--f) ease-in-out infinite alternate}'+
  /* 風で流れる花びら(手前) */
  '#intro .in-w{position:absolute;top:0;left:0;z-index:4;width:var(--s);height:var(--s);opacity:0;animation:in-sweep var(--d) var(--l) cubic-bezier(.3,.1,.5,1) forwards}'+
  /* ぱあっと広がる花びら */
  '#intro .in-b{position:absolute;left:50%;top:46%;z-index:4;width:var(--s);height:var(--s);margin:calc(var(--s)/-2) 0 0 calc(var(--s)/-2);opacity:0;animation:in-burst var(--d) var(--l) cubic-bezier(.1,.7,.3,1) forwards}'+
  '#intro .in-sp{position:absolute;z-index:3;width:var(--s);height:var(--s);background:#fff;clip-path:polygon(50% 0,61% 39%,100% 50%,61% 61%,50% 100%,39% 61%,0 50%,39% 39%);opacity:0;filter:drop-shadow(0 0 4px #ffd1e6);animation:in-tw 1.4s var(--l) ease-in-out infinite}'+
'#intro .in-gl{position:absolute;z-index:1;border-radius:50%;background:radial-gradient(closest-side,rgba(255,255,255,.95),rgba(255,235,245,.55) 55%,rgba(255,255,255,0));opacity:0}'+
  '#intro .in-or{position:absolute;z-index:4;width:0;height:0;opacity:0;animation:in-orbit var(--d) var(--l) linear forwards}'+
  '#intro .in-or i{position:absolute;left:var(--r);top:0;width:var(--s);height:var(--s);margin:calc(var(--s)/-2);animation:in-ccw var(--d) var(--l) linear forwards}'+
  '@keyframes in-gl{0%{opacity:0;transform:scale(.7)}25%{opacity:1;transform:scale(1)}80%{opacity:1}100%{opacity:0;transform:scale(1.15)}}'+
  '@keyframes in-orbit{0%{opacity:0;transform:rotate(0) scale(var(--sx),var(--sy))}12%{opacity:1}85%{opacity:1}100%{opacity:0;transform:rotate(540deg) scale(var(--sx),var(--sy))}}'+
  '@keyframes in-ccw{to{transform:rotate(-540deg)}}'+
  '#intro .in-c b{animation:none}'+
  '#intro .in-l{position:absolute;top:0;left:0;z-index:4;width:var(--s);height:var(--s);opacity:0;animation:in-sweep var(--d) var(--l) linear infinite}'+
  '#intro .in-vp{-webkit-mask:none;mask:none;animation:none}'+
  '#intro .in-c{position:absolute;z-index:4;left:0;top:0;width:var(--s);height:var(--s);animation:in-clear 1.2s var(--l) cubic-bezier(.5,0,.8,.4) both}'+
  '@keyframes in-clear{0%{transform:translate(var(--x),var(--y)) rotate(var(--r0));opacity:1}100%{transform:translate(calc(var(--x) + var(--cx)),calc(var(--y) + var(--cy))) rotate(calc(var(--r0) + 560deg));opacity:0}}'+
  '@keyframes in-mask{0%,32%{-webkit-mask-position:0 var(--y1);mask-position:0 var(--y1);-webkit-mask-size:100% var(--h1);mask-size:100% var(--h1)}46%,60%{-webkit-mask-position:0 var(--y1);mask-position:0 var(--y1);-webkit-mask-size:100% var(--h2);mask-size:100% var(--h2)}76%,100%{-webkit-mask-position:0 -12vh;mask-position:0 -12vh;-webkit-mask-size:100% 124vh;mask-size:100% 124vh}}'+
  /* カメラ: 手 → (風で切替)顔 → 全身 */
  '@keyframes in-cam{0%{transform:scale(1.04)}100%{transform:scale(1)}}'+
  '@keyframes in-rise{0%{opacity:0}100%{opacity:1}}'+
  '@keyframes in-pop{0%{opacity:0;transform:scale(.6) rotate(-6deg)}100%{opacity:1;transform:scale(1) rotate(0)}}'+
  '@keyframes in-msg{to{opacity:1;transform:translateX(-50%) scale(1)}}'+
  '@keyframes in-skip{to{opacity:.9}}'+
  '#intro .in-go{font-size:15px;opacity:1;animation:in-blink 1.4s ease-in-out infinite}'+
  '@keyframes in-blink{0%,100%{opacity:.35;transform:scale(.97)}50%{opacity:1;transform:scale(1.03)}}'+
  '@keyframes in-tw{0%,100%{opacity:0;transform:scale(.2) rotate(0)}50%{opacity:1;transform:scale(1) rotate(45deg)}}'+
  '@keyframes in-fall{0%{opacity:0;transform:translate3d(var(--x0),0,0) rotate(var(--r0))}10%{opacity:1}90%{opacity:1}100%{opacity:0;transform:translate3d(var(--x1),calc(100vh + 80px),0) rotate(calc(var(--r0) + 300deg))}}'+
  '@keyframes in-flip{0%{transform:translateX(-14px) rotateY(0) rotateZ(-20deg)}100%{transform:translateX(14px) rotateY(200deg) rotateZ(30deg)}}'+
  '@keyframes in-sweep{0%{opacity:0;transform:translate3d(var(--x0),var(--y0),0) rotate(var(--r0))}14%{opacity:.95}80%{opacity:.95}100%{opacity:0;transform:translate3d(var(--x1),var(--y1),0) rotate(calc(var(--r0) + 540deg))}}'+
  '@keyframes in-burst{0%{opacity:0;transform:translate(0,0) scale(.2) rotate(0)}15%{opacity:1}100%{opacity:0;transform:translate(var(--bx),var(--by)) scale(1.1) rotate(var(--br))}}';
  document.head.appendChild(st);
  var el=document.createElement('div');el.id='intro';el.setAttribute('aria-hidden','true');
  var iw=Math.min(Math.max(window.innerWidth,320),.88*Math.max(window.innerHeight,600)*760/1614),cw=Math.max(window.innerWidth,320),ch=Math.max(window.innerHeight,600);
  var hi0=document.querySelector('.hero-img>img:first-child'),hr0=hi0&&hi0.getBoundingClientRect(),ok0=!!hr0&&hr0.width>50&&hr0.bottom>60&&hr0.top<ch;
  var T0=ok0?hr0.top+16/1600*hr0.height:.05*ch,TH=ok0?1574/1600*hr0.height/3:.88*ch/3;
  el.style.cssText='--y1:'+(T0+TH-45).toFixed(0)+'px;--h1:'+(TH+90).toFixed(0)+'px;--h2:'+(TH*2+90).toFixed(0)+'px';
  var W=Math.max(window.innerWidth,320),H=Math.max(window.innerHeight,600);
  var h='<div class="in-vp"><div class="in-cam"><img class="in-img" src="img/outfit-kimono.webp" alt=""></div></div><img class="in-logo" src="img/logo.png" alt="">';
  var midY=T0+TH*1.5,botY=T0+TH*2.5,topY=T0+TH*.5;
  h+='<div class="in-gl" style="left:'+(cw/2-290)+'px;top:'+(midY-TH*.75)+'px;width:580px;height:'+(TH*1.5)+'px;animation:in-gl 2.5s .9s both"></div>';
  h+='<div class="in-gl" style="left:'+(cw/2-290)+'px;top:'+(botY-TH*.75)+'px;width:580px;height:'+(TH*1.5)+'px;animation:in-gl 2.3s 3.3s both"></div>';
  h+='<div class="in-gl" style="left:'+(cw/2-290)+'px;top:'+(topY-TH*.75)+'px;width:580px;height:'+(TH*1.5)+'px;animation:in-gl 2.3s 4.6s both"></div>';
  /* 一面の桜でおおいかくす → 真ん中・下・上の順に風で散って、イラストが見える */
  for(var cn=0;cn<420;cn++){
    var cs=R(70,130),cx0=R(-30,cw-20),cy0=R(-30,ch-30),cband=(cy0+cs/2<T0+TH*2&&cy0+cs/2>T0+TH)?0:(cy0+cs/2>=T0+TH*2?1:2),
        ctm=cband===0?R(1.6,3.2):(cband===1?R(3.2,4.7):R(4.7,6.2));
    h+='<i class="in-c" style="--s:'+cs.toFixed(0)+'px;--x:'+cx0.toFixed(0)+'px;--y:'+cy0.toFixed(0)+'px;--r0:'+Math.floor(R(0,360))+'deg;--cx:'+(cw*R(.7,1.3)+120).toFixed(0)+'px;--cy:'+R(-260,160).toFixed(0)+'px;--l:'+ctm.toFixed(2)+'s;--f:'+R(1.4,3).toFixed(2)+'s;opacity:'+R(.82,1).toFixed(2)+'"><b style="background-image:url('+P()+')"></b></i>';
  }
  /* ゆるく落ちる花びら */
  for(var i=0;i<40;i++){
    var x0=R(0,W);
    h+='<i class="in-p" style="--s:'+R(10,20).toFixed(0)+'px;--x0:'+x0.toFixed(0)+'px;--x1:'+(x0+R(-90,90)).toFixed(0)+'px;--r0:'+Math.floor(R(0,360))+'deg;--d:'+R(2.8,4.4).toFixed(2)+'s;--l:'+R(0,5.2).toFixed(2)+'s;--f:'+R(.9,2.1).toFixed(2)+'s"><b style="background-image:url('+P()+')"></b></i>';
  }
  /* 風で流れる花びら(桜吹雪): [開始秒, 本数, 向き(1=右へ,-1=左へ), 継続秒] */
  [[1.2,70,1,1.5],[2.9,80,-1,1.5],[4.5,110,1,1.9]].forEach(function(g){
    for(var q=0;q<g[1];q++){
      var s=R(10,22),xs=g[2]>0?-70-R(0,80):W+70+R(0,80),xe=g[2]>0?W+70+R(0,120):-70-R(0,120),y0=R(-30,H*.95);
      h+='<i class="in-w" style="--s:'+s.toFixed(0)+'px;--x0:'+xs.toFixed(0)+'px;--x1:'+xe.toFixed(0)+'px;--y0:'+y0.toFixed(0)+'px;--y1:'+(y0+R(-200,260)).toFixed(0)+'px;--r0:'+Math.floor(R(0,360))+'deg;--d:'+R(g[3]*.8,g[3]*1.4).toFixed(2)+'s;--l:'+(g[0]+R(0,g[3]*.6)).toFixed(2)+'s"><b style="--f:'+R(.5,1.2).toFixed(2)+'s;background-image:url('+P()+')"></b></i>';
    }
  });
  /* 全身が現れる時にぱあっと広がる */
  for(var u=0;u<36;u++){
    var a=R(0,Math.PI*2),d=Math.max(W,H)*R(.35,.95);
    h+='<i class="in-b" style="--s:'+R(10,22).toFixed(0)+'px;--bx:'+(Math.cos(a)*d).toFixed(0)+'px;--by:'+(Math.sin(a)*d*.9-40).toFixed(0)+'px;--br:'+Math.floor(R(240,600))+'deg;--d:'+R(1.6,2.6).toFixed(2)+'s;--l:'+R(5.0,5.4).toFixed(2)+'s"><b style="background-image:url('+P()+')"></b></i>';
  }
  /* 立ち絵が全身そろったあとも、タップするまで桜吹雪を続ける */
  for(var lp=0;lp<150;lp++){
    var ls=R(10,26),ly=R(-40,ch*.95),ld=R(2.0,3.4),lr=Math.random()<.5;
    h+='<i class="in-l" style="--s:'+ls.toFixed(0)+'px;--x0:'+(lr?-70-R(0,60):cw+70+R(0,60)).toFixed(0)+'px;--x1:'+(lr?cw+90+R(0,120):-90-R(0,120)).toFixed(0)+'px;--y0:'+ly.toFixed(0)+'px;--y1:'+(ly+R(-120,240)).toFixed(0)+'px;--r0:'+Math.floor(R(0,360))+'deg;--d:'+ld.toFixed(2)+'s;--l:'+(5.6+R(0,ld)).toFixed(2)+'s"><b style="--f:'+R(.6,1.4).toFixed(2)+'s;background-image:url('+P()+')"></b></i>';
  }
  for(var j=0;j<16;j++){h+='<i class="in-sp" style="--s:'+R(8,22).toFixed(0)+'px;left:'+R(0,96).toFixed(0)+'%;top:'+R(0,85).toFixed(0)+'%;--l:'+R(4,6.5).toFixed(2)+'s"></i>'}
  var T="いらっしゃいませ、飼い主さん",tx="";for(var c=0;c<T.length;c++)tx+='<span style="animation-delay:'+(6.0+c*.09).toFixed(2)+'s">'+T.charAt(c)+'</span>';
  h+='<div class="in-msg"><i class="ln"></i><div class="tx">'+tx+'</div><i class="ln"></i></div><div class="in-skip">タップでスキップ</div>';
  el.innerHTML=h;document.body.appendChild(el);
  /* 立ち絵は最初からホームの立ち絵と同じ位置・同じ大きさに置き、毎フレーム追従(重なりは構造上ずれない) */
  var cam=el.querySelector('.in-cam'),hiE=document.querySelector('.hero-img>img:first-child');
  function sync(){
    if(!cam.isConnected)return;
    var q=hiE&&hiE.getBoundingClientRect(),x,y,w,hh;
    if(q&&q.width>50){x=q.left+89/900*q.width;y=q.top+16/1600*q.height;w=741/900*q.width;hh=1574/1600*q.height}
    else{var bw=cw,bh=.88*ch,k=Math.min(bw/760,bh/1614);w=760*k;hh=1614*k;x=(bw-w)/2;y=.05*ch+(bh-hh)/2}
    cam.style.width=w+'px';cam.style.height=hh+'px';cam.style.transform='translate('+x+'px,'+y+'px)';
    requestAnimationFrame(sync)
  }
  sync();
  var done=false;
  function plain(){el.classList.add('out');setTimeout(function(){el.remove();st.remove()},600)}
  function end(){
    if(done)return;done=true;
    [].forEach.call(el.querySelectorAll('.in-logo,.in-msg,.in-skip,.in-gl,.in-sp,.in-c,.in-b,.in-p,.in-l'),function(n){n.style.transition='opacity .3s';n.style.animation='none';n.style.opacity='0'});
    var g='';
    for(var q=0;q<120;q++){
      var s2=R(10,24),y0=R(-30,ch*.95);
      g+='<i class="in-w" style="--s:'+s2.toFixed(0)+'px;--x0:'+(cw+70+R(0,80)).toFixed(0)+'px;--x1:'+(-80-R(0,120)).toFixed(0)+'px;--y0:'+y0.toFixed(0)+'px;--y1:'+(y0+R(-160,220)).toFixed(0)+'px;--r0:'+Math.floor(R(0,360))+'deg;--d:'+R(1.2,2.0).toFixed(2)+'s;--l:'+R(0,.7).toFixed(2)+'s"><b style="--f:'+R(.5,1.1).toFixed(2)+'s;background-image:url('+P()+')"></b></i>';
    }
    el.insertAdjacentHTML('beforeend',g);
    var vp=el.querySelector('.in-img');if(vp){vp.style.animation='none';vp.style.opacity='1'}
    setTimeout(function(){el.style.transition='opacity .7s ease';el.style.opacity='0'},450);
    setTimeout(function(){el.remove();st.remove()},1300);
  }
  el.addEventListener('click',end);
  var sk=el.querySelector('.in-skip');
  setTimeout(function(){if(done||!sk)return;sk.textContent='タップしてはじめる';sk.className='in-skip in-go'},6900);
}
if(root.classList.contains('locked'))window.addEventListener('hana-unlock',start,{once:true});
else if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);
else start();
})();
