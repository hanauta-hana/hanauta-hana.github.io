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
  var N=window.innerWidth<600?16:24, W=window.innerWidth;
  for(var k=0;k<N;k++){
    var p=document.createElement('div'); p.className='petal';
    var size=20+Math.random()*20, x0=Math.random()*W, drift=(Math.random()*2-0.6)*90;
    p.style.width=size+'px'; p.style.height=size+'px';
    p.style.setProperty('--x0',x0+'px'); p.style.setProperty('--x1',(x0+drift)+'px');
    p.style.opacity=(0.8+Math.random()*0.2).toFixed(2);
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
  $$('.page').forEach(function(p){p.classList.toggle('active',p.id==='page-'+name)});
  $$('.tab').forEach(function(t){t.classList.toggle('on',t.dataset.page===name)});
  if(push!==false) history.replaceState(null,'','#'+name);
  window.scrollTo({top:0,behavior:'smooth'});
}
$$('.tab').forEach(function(t){t.addEventListener('click',function(){showPage(t.dataset.page)})});
showPage((location.hash||'#top').slice(1),false);
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
      : '<span class="off">お休みです🌙</span>';
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
  var img=$('#outfit-img'), tabs=$('#outfit-tabs');
  if(!list.length){img.removeAttribute('src');tabs.innerHTML='';return}
  img.src=safeSrc(list[0].src);
  tabs.innerHTML=list.map(function(o,i){return '<button class="chip'+(i===0?' on':'')+'" data-i="'+i+'" role="tab">'+esc(o.label)+'</button>'}).join('');
  $$('.chip',tabs).forEach(function(b){
    b.addEventListener('click',function(){
      $$('.chip',tabs).forEach(function(x){x.classList.toggle('on',x===b)});
      img.classList.add('swap');
      setTimeout(function(){img.src=safeSrc(list[+b.dataset.i].src);img.classList.remove('swap')},180);
    });
  });
}
function renderGallery(S){
  var list=(S.gallery||[]).filter(function(g){return safeSrc(g.src)});
  $('#gallery-card').hidden=!list.length;
  $('#gallery').innerHTML=list.map(function(g){return '<img src="'+safeSrc(g.src)+'" alt="'+esc(g.caption||'配信の画面')+'" loading="lazy">'}).join('');
}
function renderLinks(){
  $('#links').innerHTML=(C.links||[]).map(function(l){
    return '<li><a href="'+safeUrl(l.url)+'" target="_blank" rel="noopener"><b>'+esc(l.name)+'</b><small>'+esc(l.sub)+'</small></a></li>';
  }).join('');
}
function renderAll(S){renderSchedule(S);renderNews(S);renderProfile(S);renderOutfits(S);renderGallery(S);renderLinks()}

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
function renderStamps(){
  var st=store.get('hana_stamps',{count:0,days:[]});
  var h='';
  for(var i=0;i<STAMPS;i++) h+='<div class="stamp'+(i<st.count?' on':'')+'">'+(i<st.count?'<img src="img/ico-sakura.png" alt="" style="transform:rotate('+[-12,8,-5,14,-9,6,-15,10,-3,12][i%10]+'deg)">':(i+1))+'</div>';
  $('#stamp-card').innerHTML=h;
  $('#stamp-count').textContent=st.count>=STAMPS?'スタンプ '+STAMPS+'/'+STAMPS+' コンプリート！':'いま '+st.count+' / '+STAMPS+' こ';
  $('#stamp-reward').hidden=st.count<STAMPS;
}
renderStamps();

/* ---------- おみくじ(1日1回) ---------- */
(function(){
  var btn=$('#omikuji-btn'), res=$('#omikuji-result');
  function show(r){
    $('#o-rank').textContent=r.rank; $('#o-msg').textContent=r.msg; $('#o-item').textContent=r.item;
    var text='今日のはなのおみくじは「'+r.rank+'」でした💗 '+location.href.split('#')[0];
    $('#o-share').href='https://twitter.com/intent/tweet?text='+encodeURIComponent(text);
    res.hidden=false;
  }
  function lock(){btn.disabled=true;$('.box-txt',btn).textContent='また明日ね🌸'}
  var today=jstDate(), saved=store.get('hana_omikuji',null);
  if(saved&&saved.date===today){show(saved.result);lock();}
  btn.addEventListener('click',function(){
    if(btn.disabled) return;
    var r=C.omikuji[Math.floor(Math.random()*C.omikuji.length)];
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
