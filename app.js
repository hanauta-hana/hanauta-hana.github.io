(function(){
'use strict';
var C = window.HANA;
var $ = function(s,r){return (r||document).querySelector(s)};
var $$ = function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};

/* ---------- ストレージ(使えない環境でも落ちない) ---------- */
var store = {
  get:function(k,d){try{var v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}},
  set:function(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
};

/* ---------- 桜の花びら ---------- */
(function(){
  var box=$('#petals'); if(!box) return;
  for(var i=0;i<14;i++){
    var p=document.createElement('i'); p.className='petal';
    p.style.left=(Math.random()*100)+'%';
    p.style.width=p.style.height=(9+Math.random()*10)+'px';
    p.style.animationDuration=(9+Math.random()*9)+'s';
    p.style.animationDelay=(-Math.random()*14)+'s';
    p.style.setProperty('--dx',(Math.random()*120-30)+'px');
    box.appendChild(p);
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

/* ---------- 配信予定 ---------- */
(function(){
  var DAY=['日','月','火','水','木','金','土'];
  // 日本時間の「今日」を求める
  var now=new Date(Date.now()+ (new Date().getTimezoneOffset()+540)*60000);
  var todayIdx=now.getDay();
  var ul=$('#week'); var html='';
  for(var i=0;i<7;i++){
    var d=new Date(now.getTime()+i*86400000);
    var w=d.getDay();
    var slots=(C.schedule.override&&C.schedule.override[w]!==undefined)?C.schedule.override[w]:C.schedule.default;
    var inner = slots.length
      ? slots.map(function(s){return '<div class="slot"><span class="t">'+esc(s.time)+'</span><span class="n">'+esc(s.title)+(s.memo?' <small>'+esc(s.memo)+'</small>':'')+'</span></div>'}).join('')
      : '<span class="off">お休みです🌙</span>';
    html+='<li class="'+(i===0?'today':'')+'"><div class="d"><b>'+(d.getMonth()+1)+'/'+d.getDate()+'</b><small>'+DAY[w]+'</small></div><div class="slots">'+inner+'</div></li>';
  }
  ul.innerHTML=html;
  var end=new Date(now.getTime()+6*86400000);
  $('#week-range').textContent=(now.getMonth()+1)+'/'+now.getDate()+' 〜 '+(end.getMonth()+1)+'/'+end.getDate()+' のよてい';
})();

/* ---------- お知らせ ---------- */
$('#news').innerHTML=C.news.map(function(n){return '<li><time>'+esc(n.date)+'</time>'+esc(n.text)+'</li>'}).join('');

/* ---------- 衣装きりかえ ---------- */
$$('.chip[data-outfit]').forEach(function(b){
  b.addEventListener('click',function(){
    var img=$('#outfit-img');
    $$('.chip[data-outfit]').forEach(function(x){x.classList.toggle('on',x===b)});
    img.classList.add('swap');
    setTimeout(function(){img.src=b.dataset.outfit;img.classList.remove('swap')},180);
  });
});

/* ---------- あそぶ: サブタブ ---------- */
$$('.seg-btn').forEach(function(b){
  b.addEventListener('click',function(){
    $$('.seg-btn').forEach(function(x){x.classList.toggle('on',x===b)});
    $$('.seg-body').forEach(function(x){x.classList.toggle('on',x.id==='seg-'+b.dataset.seg)});
  });
});

/* ---------- 日付(日本時間) ---------- */
function jstDate(){
  var d=new Date(Date.now()+(new Date().getTimezoneOffset()+540)*60000);
  return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2);
}

/* ---------- スタンプカード ---------- */
var STAMPS=10;
function renderStamps(){
  var st=store.get('hana_stamps',{count:0,days:[]});
  var box=$('#stamp-card'); var h='';
  for(var i=0;i<STAMPS;i++) h+='<div class="stamp'+(i<st.count?' on':'')+'">'+(i<st.count?'🌸':(i+1))+'</div>';
  box.innerHTML=h;
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

/* ---------- フォーム送信(Supabase or 試作モード) ---------- */
function esc(s){return String(s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}

function send(table,row){
  var sb=C.supabase;
  if(!sb||!sb.url||!sb.anonKey){
    // 試作モード: この端末にだけ保存
    var key='hana_demo_'+table, arr=store.get(key,[]);
    row.created_at=new Date().toISOString(); arr.push(row); store.set(key,arr);
    return Promise.resolve('demo');
  }
  return fetch(sb.url+'/rest/v1/'+table,{
    method:'POST',
    headers:{'Content-Type':'application/json','apikey':sb.anonKey,'Authorization':'Bearer '+sb.anonKey,'Prefer':'return=minimal'},
    body:JSON.stringify(row)
  }).then(function(r){if(!r.ok) throw new Error('HTTP '+r.status); return 'ok'});
}

function bindForm(formSel,statusSel,lenSel,table,max,build){
  var f=$(formSel), st=$(statusSel), ta=$('textarea',f), len=$(lenSel);
  ta.addEventListener('input',function(){len.textContent=ta.value.length+'/'+max});
  var lastSent=0;
  f.addEventListener('submit',function(e){
    e.preventDefault();
    if(f.website.value) return;                    // ボット対策(ハニーポット)
    if(Date.now()-lastSent<15000){st.className='form-status ng';st.textContent='少し時間をあけてからもう一度送ってね🌸';return}
    var row=build(f);
    if(!row.body.trim()){return}
    st.className='form-status';st.textContent='送信中…';
    send(table,row).then(function(mode){
      lastSent=Date.now(); f.reset(); len.textContent='0/'+max;
      st.className='form-status ok';
      st.textContent= mode==='demo' ? '(試作モード)送信のテストができました🌸' : '送信しました！ありがとう🌸';
    }).catch(function(){
      st.className='form-status ng';st.textContent='うまく送れませんでした。時間をおいてもう一度お願いします🙏';
    });
  });
}
bindForm('#form-msg','#msg-status','#msg-len',C.supabase.tables.messages,300,function(f){
  return {body:f.body.value.slice(0,300),read_ok:f.read_ok.checked};
});
bindForm('#form-contact','#ct-status','#ct-len',C.supabase.tables.contacts,1000,function(f){
  return {name:f.name.value.slice(0,50),reply_to:f.reply_to.value.slice(0,100),kind:f.kind.value,body:f.body.value.slice(0,1000)};
});
})();
