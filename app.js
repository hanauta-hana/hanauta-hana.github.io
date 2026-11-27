(function(){
'use strict';
var C = window.HANA, API = window.HanaAPI;
var $ = function(s,r){return (r||document).querySelector(s)};
var $$ = function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
// 画像のURLは「相対パス」か「アップロード画像(data:image)」だけ許可
function safeSrc(s){s=String(s||'');return (/^(img\/|data:image\/(png|jpeg|webp);base64,)/.test(s))?s:''}
function safeUrl(u){u=String(u||'');return /^https:\/\//.test(u)?u:'#'}

var store = {
  get:function(k,d){try{var v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}},
  set:function(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
};

/* ---------- 桜の花びら(1枚ずつ別々に舞う) ---------- */
(function(){
  var box=$('#petals'); if(!box) return;
  if(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var N=window.innerWidth<600?26:38, W=window.innerWidth;
  for(var k=0;k<N;k++){
    var p=document.createElement('div'); p.className='petal';
    var size=13+Math.random()*10, x0=Math.random()*W, drift=(Math.random()*2-0.6)*90;
    p.style.width=size+'px'; p.style.height=size+'px';
    p.style.setProperty('--x0',x0+'px'); p.style.setProperty('--x1',(x0+drift)+'px');
    p.style.opacity=(0.9+Math.random()*0.1).toFixed(2);
    p.style.animationDuration=(13+Math.random()*13)+'s';
    p.style.animationDelay=(-Math.random()*26)+'s';
    var i=document.createElement('i');
    i.style.backgroundImage='url(img/petal/p'+Math.floor(Math.random()*8)+'.png)';
    i.style.setProperty('--sw',(14+Math.random()*26)+'px');
    i.style.setProperty('--r0',(Math.random()*360)+'deg');
    i.style.animationDuration=(2.6+Math.random()*3)+'s';
    i.style.animationDelay=(-Math.random()*5)+'s';
    p.appendChild(i); box.appendChild(p);
  }
})();

/* ---------- タブ切り替え(URLのハッシュ対応) ---------- */
function showPage(name,push){
  if(!$('#page-'+name)) name='top';
  $$('.page').forEach(function(p){p.classList.toggle('active',p.id==='page-'+name)});document.body.classList.toggle('on-top',name==='top'||name==='profile');
  $$('.tab').forEach(function(t){t.classList.toggle('on',t.dataset.page===name)});
  if(push!==false) history.replaceState(null,'','#'+name);
  window.scrollTo({top:0,behavior:'smooth'});
}
$$('.tab').forEach(function(t){t.addEventListener('click',function(){showPage(t.dataset.page)})});
showPage((location.hash||'#top').slice(1),false);
// パスワードで入った直後は、トップの一番上から見せる
window.addEventListener('hana-unlock',function(){
  showPage('top');
  function up(){window.scrollTo(0,0);document.documentElement.scrollTop=0;document.body.scrollTop=0}
  up();setTimeout(up,60);setTimeout(up,300);
});
window.scrollTo(0,0);

/* ---------- 日本時間の「今」 ---------- */
function jstNow(){return new Date(Date.now()+(new Date().getTimezoneOffset()+540)*60000)}
function jstDate(){
  var d=jstNow();
  return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2);
}

/* ---------- 画面の描画(設定から) ---------- */
function renderSchedule(S){
  var DAY=['日','月','火','水','木','金','土'];
  var now=jstNow(), html='';
  var sc=S.schedule||{default:[],override:{}};
  for(var i=0;i<7;i++){
    var d=new Date(now.getTime()+i*86400000), w=d.getDay();
    var ov=sc.override||{};
    var slots=(ov[w]!==undefined&&ov[w]!==null)?ov[w]:sc.default;
    var inner=(slots&&slots.length)
      ? slots.map(function(s){return '<div class="slot"><span class="t">'+esc(s.time)+'</span><span class="n">'+esc(s.title)+(s.memo?' <small>'+esc(s.memo)+'</small>':'')+'</span></div>'}).join('')
      : '<span class="off">お休みです <img class="moon" src="img/ico-moon.png" alt=""></span>';
    html+='<li class="'+(i===0?'today':'')+'"><div class="d"><b>'+(d.getMonth()+1)+'/'+d.getDate()+'</b><small>'+DAY[w]+'</small></div><div class="slots">'+inner+'</div></li>';
  }
  $('#week').innerHTML=html;
  var end=new Date(now.getTime()+6*86400000);
  $('#week-range').textContent=(now.getMonth()+1)+'/'+now.getDate()+' 〜 '+(end.getMonth()+1)+'/'+end.getDate()+' のよてい';
}
function renderNews(S){
  $('#news').innerHTML=(S.news||[]).map(function(n){return '<li><time>'+esc(n.date)+'</time>'+esc(n.text)+'</li>'}).join('')||'<li>いまはお知らせはありません</li>';
}
function renderProfile(S){
  var p=S.profile||{};
  var tags=(p.tags||[]).map(function(t){return '<span>'+esc(t)+'</span>'}).join('');
  var rows=[
    ['名前', esc(p.name)+(p.reading?' <small>('+esc(p.reading)+')</small>':'')],
    ['誕生日', esc(p.birthday)],
    ['好きなもの', esc(p.likes)],
    ['配信', esc(p.content)],
    ['ファンネーム', esc(p.fanname)],
    ['タグ', tags?'<span class="tags">'+tags+'</span>':'']
  ].filter(function(r){return r[1]});
  $('#prof').innerHTML=rows.map(function(r){return '<div><dt>'+r[0]+'</dt><dd>'+r[1]+'</dd></div>'}).join('');
  $('#hitokoto').innerHTML=esc(p.hitokoto).replace(/\n/g,'<br>');
}
function renderOutfits(S){
  var list=(S.outfits||[]).filter(function(o){return safeSrc(o.src)});
  var img=$('#outfit-img'), tabs=$('#outfit-tabs'), stage=$('.outfit-stage');
  var oc=$('#outfit-ctl'); if(oc)oc.remove();
  if(!list.length){img.removeAttribute('src');tabs.innerHTML='';return}
  var cur=0, busy=null;
  tabs.innerHTML=list.map(function(o,i){return '<button class="chip" data-i="'+i+'" role="tab">'+esc(o.label)+'</button>'}).join('');
  var chips=$$('.chip',tabs), dots=null;
  if(list.length>1){
    var ctl=document.createElement('div');ctl.id='outfit-ctl';ctl.className='ob-ctl';
    ctl.innerHTML='<button type="button" class="ob-arrow prev" aria-label="前の衣装">‹</button><div class="ob-dots">'+list.map(function(){return '<i></i>'}).join('')+'</div><button type="button" class="ob-arrow next" aria-label="次の衣装">›</button>';
    stage.parentNode.insertBefore(ctl,stage.nextSibling);
    $('.prev',ctl).addEventListener('click',function(){go(cur-1)});
    $('.next',ctl).addEventListener('click',function(){go(cur+1)});
    dots=ctl.querySelector('.ob-dots');
  }
  function mark(){
    stage.setAttribute('data-o',cur%3);
    chips.forEach(function(x,i){x.classList.toggle('on',i===cur)});
    if(dots)$$('i',dots).forEach(function(x,i){x.classList.toggle('on',i===cur)});
  }
  function go(i){
    i=(i+list.length)%list.length; if(i===cur&&img.getAttribute('src'))return;
    cur=i; mark(); img.classList.add('swap'); clearTimeout(busy);
    var want=safeSrc(list[cur].src), t0=Date.now(), pre=new Image();
    function apply(){ if(cur!==i)return; if(img.getAttribute('src')!==want)img.src=want; if(img.complete)img.classList.remove('swap'); }
    img.onload=function(){ if(safeSrc(list[cur].src)===want)img.classList.remove('swap') };
    pre.onload=pre.onerror=function(){ busy=setTimeout(apply,Math.max(0,180-(Date.now()-t0))) };
    pre.src=want;
  }
  chips.forEach(function(b){b.addEventListener('click',function(){go(+b.dataset.i)})});
  var x0=null,y0=null;
  stage.ontouchstart=function(ev){x0=ev.touches[0].clientX;y0=ev.touches[0].clientY};
  stage.ontouchend=function(ev){
    if(x0===null)return; var dx=ev.changedTouches[0].clientX-x0, dy=ev.changedTouches[0].clientY-y0; x0=null;
    if(Math.abs(dx)>40&&Math.abs(dx)>Math.abs(dy)*1.5)go(cur+(dx<0?1:-1));
  };
  list.forEach(function(o){var p=new Image();p.src=safeSrc(o.src)});   // 先に全部読み込んでおく
  var first=safeSrc(list[0].src);
  img.onload=function(){img.classList.remove('swap')};
  if(img.getAttribute('src')!==first){img.classList.add('swap');img.src=first}
  else if(img.complete)img.classList.remove('swap');
  mark();
}
function renderGallery(S){
  var list=(S.gallery||[]).filter(function(g){return safeSrc(g.src)});
  $('#gallery-card').hidden=!list.length;
  var box=$('#gallery'); box.className='gal';
  box.innerHTML='<div class="gal-track">'+list.map(function(g){return '<div class="gal-slide"><img src="'+safeSrc(g.src)+'" alt="'+esc(g.caption||'配信の画面')+'" loading="lazy" decoding="async"></div>'}).join('')+'</div>'+
    (list.length>1?'<div class="ob-ctl"><button type="button" class="ob-arrow prev" aria-label="前の写真">‹</button><div class="ob-dots">'+list.map(function(){return '<i></i>'}).join('')+'</div><button type="button" class="ob-arrow next" aria-label="次の写真">›</button></div>':'');
  if(list.length<2)return;
  var track=$('.gal-track',box), dots=$$('.ob-dots i',box);
  function idx(){return Math.round(track.scrollLeft/track.clientWidth)}
  function mark(){var c=idx();dots.forEach(function(d,i){d.classList.toggle('on',i===c)})}
  function go(i){i=(i+list.length)%list.length;track.scrollTo({left:i*track.clientWidth,behavior:'smooth'})}
  track.addEventListener('scroll',function(){requestAnimationFrame(mark)},{passive:true});
  $('.prev',box).addEventListener('click',function(){go(idx()-1)});
  $('.next',box).addEventListener('click',function(){go(idx()+1)});
  mark();
}
function renderLinks(){
  $('#links').innerHTML=(C.links||[]).map(function(l){
    return '<li><a href="'+safeUrl(l.url)+'" target="_blank" rel="noopener"><b>'+esc(l.name)+'</b><small>'+esc(l.sub)+'</small></a></li>';
  }).join('');
}
function renderHome(S){
  var hm=S.home||{}, c=document.getElementById('home-catch'), s=document.getElementById('home-sub');
  if(c&&hm.catch){ c.textContent=''; String(hm.catch).split('\n').forEach(function(t,i){ if(i) c.appendChild(document.createElement('br')); c.appendChild(document.createTextNode(t)); }); }
  var sf=document.getElementById('home-serif');
  var list=(hm.serifs&&hm.serifs.length)?hm.serifs.filter(function(t){return String(t).trim()}):(hm.serif?[hm.serif]:[]);
  if(sf&&list.length){
    var k=0;
    var put=function(t){ sf.textContent=''; String(t).split('\n').forEach(function(x,n){ if(n) sf.appendChild(document.createElement('br')); sf.appendChild(document.createTextNode(x)); }); };
    put(list[0]);
    if(list.length>1&&!sf.dataset.on){
      sf.dataset.on='1'; sf.setAttribute('role','button'); sf.setAttribute('tabindex','0'); sf.title='タップでことばがかわるよ';
      var next=function(e){ if(e) e.stopPropagation(); k=(k+1)%list.length; sf.classList.remove('pop'); void sf.offsetWidth; put(list[k]); sf.classList.add('pop'); };
      sf.addEventListener('click',next);
      sf.addEventListener('keydown',function(e){ if(e.key==='Enter'||e.key===' '){e.preventDefault();next()} });
    }
  }
  var rw=document.getElementById('reward-text');
  if(rw&&hm.reward){ rw.textContent=''; String(hm.reward).split('\n').forEach(function(t,i){ if(i) rw.appendChild(document.createElement('br')); rw.appendChild(document.createTextNode(t)); }); }
  if(s&&hm.sub){ s.textContent=''; String(hm.sub).split('\n').forEach(function(t,i){ if(i) s.appendChild(document.createElement('br')); s.appendChild(document.createTextNode(t)); }); }
}
var OMI=null;
function renderAll(S){OMI=(S.omikuji&&S.omikuji.length)?S.omikuji:null;renderHome(S);renderSchedule(S);renderNews(S);renderProfile(S);renderOutfits(S);renderGallery(S);renderLinks()}

renderAll(API.defaults());                              // まず初期設定で表示
API.getSettings().then(renderAll).catch(function(){});  // 保存済みの内容があれば差し替え

/* ---------- あそぶ: サブタブ ---------- */
$$('.seg-btn').forEach(function(b){
  b.addEventListener('click',function(){
    $$('.seg-btn').forEach(function(x){x.classList.toggle('on',x===b)});
    $$('.seg-body').forEach(function(x){x.classList.toggle('on',x.id==='seg-'+b.dataset.seg)});
  });
});

/* ---------- スタンプカード ---------- */
var STAMPS=10;
var STAMP_IMG=['stamp-f-pink.png','stamp-tree.png','stamp-f-yellow.png','ico-sakura.png','stamp-f-sky.png','ribbon.png','stamp-f-purple.png','stamp-f-white.png','stamp-f-blue.png','chibi.png'];
function renderStamps(){
  var st=store.get('hana_stamps',{count:0,days:[]});
  var h='';
  for(var i=0;i<STAMPS;i++){
    var on=i<st.count, goal=(i===STAMPS-1);
    h+='<div class="stamp'+(on?' on':'')+(goal?' goal':'')+'">'+(on?'<img src="img/'+STAMP_IMG[i]+'" alt="" style="transform:rotate('+(goal?0:[-12,8,-5,14,-9,6,-15,10,-3][i%9])+'deg)">':(goal?'<span class="gq">♡</span>':(i+1)))+'</div>';
  }
  $('#stamp-card').innerHTML=h;
  $('#stamp-count').textContent=st.count>=STAMPS?'スタンプ '+STAMPS+'/'+STAMPS+' コンプリート！':'いま '+st.count+' / '+STAMPS+' こ';
  $('#stamp-reward').hidden=st.count<STAMPS;
  var ss=document.getElementById('stamp-share');
  if(ss) ss.href='https://twitter.com/intent/tweet?text='+encodeURIComponent('はなのスタンプカードを'+STAMPS+'個コンプリートしました🌸\n'+(location.origin+location.pathname));
}
renderStamps();

/* ---------- おみくじ(1日1回) ---------- */
(function(){
  var btn=$('#omikuji-btn'), res=$('#omikuji-result');
  function show(r){
    $('#o-rank').textContent=r.rank; $('#o-msg').textContent=r.msg; $('#o-item').textContent=r.item;
    var text='今日のはなのおみくじは「'+r.rank+'」でした💗\n'+r.msg+'\n'+r.item+'\n'+(location.origin+location.pathname);
    $('#o-share').href='https://twitter.com/intent/tweet?text='+encodeURIComponent(text);
    res.hidden=false;
  }
  function lock(){btn.disabled=true;$('.box-txt',btn).textContent='また明日ね🌸'}
  var today=jstDate(), saved=store.get('hana_omikuji',null);
  if(saved&&saved.date===today){show(saved.result);lock();}
  btn.addEventListener('click',function(){
    if(btn.disabled) return;
    var L=OMI||C.omikuji, r=L[Math.floor(Math.random()*L.length)];
    btn.classList.add('shake');
    setTimeout(function(){
      btn.classList.remove('shake');
      show(r); lock();
      store.set('hana_omikuji',{date:today,result:r});
      var st=store.get('hana_stamps',{count:0,days:[]});
      if(st.days.indexOf(today)<0 && st.count<STAMPS){st.days.push(today);st.count++;store.set('hana_stamps',st);renderStamps();}
    },600);
  });
})();

/* ---------- フォーム送信 ---------- */
function bindForm(formSel,statusSel,lenSel,table,max,build){
  var f=$(formSel), st=$(statusSel), ta=$('textarea',f), len=$(lenSel);
  ta.addEventListener('input',function(){len.textContent=ta.value.length+'/'+max});
  var lastSent=0;
  f.addEventListener('submit',function(e){
    e.preventDefault();
    if(f.website.value) return;                    // ボット対策(ハニーポット)
    if(Date.now()-lastSent<15000){st.className='form-status ng';st.textContent='少し時間をあけてからもう一度送ってね🌸';return}
    var row=build(f);
    if(!row.body.trim()) return;
    st.className='form-status';st.textContent='送信中…';
    API.insert(table,row).then(function(mode){
      lastSent=Date.now(); f.reset(); len.textContent='0/'+max;
      st.className='form-status ok';
      st.textContent= mode==='demo' ? '(試作モード)送信のテストができました🌸' : '送信しました！ありがとう🌸';
    }).catch(function(){
      st.className='form-status ng';st.textContent='うまく送れませんでした。時間をおいてもう一度お願いします🙏';
    });
  });
}
var T=C.supabase.tables;
bindForm('#form-msg','#msg-status','#msg-len',T.messages,300,function(f){
  return {body:f.body.value.slice(0,300),read_ok:f.read_ok.checked};
});
bindForm('#form-contact','#ct-status','#ct-len',T.contacts,1000,function(f){
  return {name:f.name.value.slice(0,50),reply_to:f.reply_to.value.slice(0,100),kind:f.kind.value,body:f.body.value.slice(0,1000)};
});
})();

/* ---------- 演出用の枠(はみ出しても画面が横にずれないよう切り取る) ---------- */
window.hanaFx=(function(){var l=null;return function(){if(!l){l=document.createElement('div');l.id='fx';document.body.appendChild(l)}return l}})();

/* ---------- タップすると桜がぱっと広がる ---------- */
(function(){
  if(window.matchMedia&&matchMedia('(prefers-reduced-motion:reduce)').matches)return;
  var last=0;
  document.addEventListener('pointerdown',function(e){
    var now=Date.now(); if(now-last<120)return; last=now;
    var n=9;
    for(var i=0;i<n;i++){
      var d=document.createElement('div'); d.className='tap-petal';
      var a=(Math.PI*2*i/n)+Math.random()*.6, r=34+Math.random()*46, s=12+Math.random()*10;
      d.style.cssText='left:'+e.clientX+'px;top:'+e.clientY+'px;width:'+s+'px;height:'+s+'px;'+
        '--dx:'+(Math.cos(a)*r).toFixed(1)+'px;--dy:'+(Math.sin(a)*r-14).toFixed(1)+'px;--rot:'+Math.round(Math.random()*540-270)+'deg;'+
        'background-image:url(img/petal/p'+Math.floor(Math.random()*8)+'.png)';
      window.hanaFx().appendChild(d);
      (function(el){setTimeout(function(){el.remove()},900)})(d);
    }
  },{passive:true});
})();

/* ---------- 画像タップで拡大 ---------- */
(function(){
  var lb=document.createElement('div'); lb.className='lightbox'; lb.hidden=true;
  lb.innerHTML='<button type="button" class="lb-x" aria-label="閉じる">×</button><img alt="">';
  document.body.appendChild(lb);
  var im=lb.querySelector('img');
  function close(){lb.classList.remove('on');setTimeout(function(){lb.hidden=true;im.removeAttribute('src');document.body.classList.remove('lb-open')},180)}
  function open(src,alt){im.src=src;im.alt=alt||'';lb.hidden=false;document.body.classList.add('lb-open');requestAnimationFrame(function(){lb.classList.add('on')})}
  lb.addEventListener('click',close);
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!lb.hidden)close()});
  document.addEventListener('click',function(e){
    var t=e.target; if(t.tagName!=='IMG')return;
    if(t.id==='outfit-img'){ if(t.classList.contains('swap')||!t.getAttribute('src'))return; open(t.getAttribute('src'),t.alt) }
  });
})();

/* ---------- ロゴをタップで桜吹雪 ---------- */
(function(){
  var busy=false;
  function storm(ev){
    if(busy)return; busy=true; setTimeout(function(){busy=false},1800);
    var W=window.innerWidth,H=window.innerHeight,n=W<600?46:70;
    for(var i=0;i<n;i++){
      var d=document.createElement('div'); d.className='storm-petal';
      var s=12+Math.random()*16, x0=W*(0.25+Math.random()*0.9), y0=-30-Math.random()*H*0.35,
          dx=-(W*(0.5+Math.random()*0.9)), dy=H*(0.85+Math.random()*0.5), dur=2.2+Math.random()*2.2, del=Math.random()*0.9;
      d.style.cssText='left:0;top:0;width:'+s+'px;height:'+s+'px;--x0:'+x0.toFixed(0)+'px;--y0:'+y0.toFixed(0)+'px;--dx:'+dx.toFixed(0)+'px;--dy:'+dy.toFixed(0)+'px;--rot:'+Math.round(Math.random()*900-300)+'deg;'+
        'animation-duration:'+dur.toFixed(2)+'s;animation-delay:'+del.toFixed(2)+'s;background-image:url(img/petal/p'+Math.floor(Math.random()*8)+'.png)';
      window.hanaFx().appendChild(d);
      (function(el,t){setTimeout(function(){el.remove()},t)})(d,(dur+del)*1000+100);
    }
  }
  if(window.matchMedia&&matchMedia('(prefers-reduced-motion:reduce)').matches)return;
  document.addEventListener('click',function(e){
    var t=e.target; if(t.classList&&(t.classList.contains('hero-logo')||t.classList.contains('logo')||t.classList.contains('stage-logo')))storm(e);
  });
})();

// 最新版に更新(キャッシュをさけて読み込み直す)
(function(){
  var b=document.getElementById('refresh-btn');if(!b)return;
  b.addEventListener('click',function(){
    b.textContent='更新中…';b.disabled=true;
    var go=function(){var u=new URL(location.href);u.searchParams.set('r',Date.now());var f=function(){location.replace(u.toString())};try{fetch(location.pathname,{cache:'reload'}).then(f,f)}catch(e){f()}};
    try{if(window.caches&&caches.keys){caches.keys().then(function(k){return Promise.all(k.map(function(n){return caches.delete(n)}))}).then(go,go);return}}catch(e){}
    go();
  });
})();
