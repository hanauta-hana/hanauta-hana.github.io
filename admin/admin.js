(function(){
'use strict';
var C = window.HANA, API = window.HanaAPI;
var $ = function(s,r){return (r||document).querySelector(s)};
var DAYS = ['日','月','火','水','木','金','土'];
var pass = '';
var cur = null;        // 現在の設定(初期設定+保存済み)

/* ---------- 小さな部品 ---------- */
function h(tag,attrs){
  var el=document.createElement(tag);
  Object.keys(attrs||{}).forEach(function(k){
    if(k==='class') el.className=attrs[k];
    else if(k==='text') el.textContent=attrs[k];
    else if(k.slice(0,2)==='on') el.addEventListener(k.slice(2),attrs[k]);
    else if(attrs[k]!==false&&attrs[k]!=null) el.setAttribute(k,attrs[k]);
  });
  for(var i=2;i<arguments.length;i++){
    var c=arguments[i]; if(c==null) continue;
    el.appendChild(typeof c==='string'?document.createTextNode(c):c);
  }
  return el;
}
var toastT;
function toast(msg){var t=$('#toast');t.textContent=msg;t.classList.add('on');clearTimeout(toastT);toastT=setTimeout(function(){t.classList.remove('on')},2200)}
function clone(x){return JSON.parse(JSON.stringify(x))}
function imgUrl(src){return /^data:/.test(src)?src:'../'+src}
function today(){var d=new Date(Date.now()+(new Date().getTimezoneOffset()+540)*60000);
  return d.getFullYear()+'.'+('0'+(d.getMonth()+1)).slice(-2)+'.'+('0'+d.getDate()).slice(-2)}

function save(key,value,btn){
  if(JSON.stringify(value).length>1800000){toast('データが大きすぎます。写真を減らしてください');return Promise.resolve(false)}
  if(btn){btn.disabled=true}
  return API.saveSetting(pass,key,value).then(function(){
    cur[key]=value; toast('保存しました🌸'); return true;
  }).catch(function(e){
    toast(e&&e.message==='quota'?'保存できません(容量がいっぱいです)':'保存できませんでした');
    return false;
  }).then(function(ok){ if(btn) btn.disabled=false; return ok; });
}

/* ---------- 画面の切り替え ---------- */
function show(which){
  ['login','menu','panel'].forEach(function(id){$('#'+id).hidden=(id!==which)});
  window.scrollTo(0,0);
}
function openPanel(name){
  var body=$('#panel-body'); body.innerHTML='';
  PANELS[name](body);
  show('panel');
}
$('#back').addEventListener('click',function(){show('menu')});
document.querySelectorAll('.tile').forEach(function(t){
  t.addEventListener('click',function(){openPanel(t.dataset.panel)});
});

/* ---------- ログイン ---------- */
if(!API.live){$('#demo-note').hidden=false;$('#demo-pass').textContent=API.demoPass}
function enter(p){
  pass=p;
  return API.getSettings().then(function(s){cur=s;show('menu')});
}
$('#login-form').addEventListener('submit',function(e){
  e.preventDefault();
  var st=$('#login-status'), p=$('#pass').value;
  st.className='status'; st.textContent='確認中…';
  API.verify(p).then(function(ok){
    if(!ok){st.className='status ng';st.textContent='合言葉がちがうみたい';return}
    try{localStorage.setItem('hana_admin_pass',p)}catch(x){}
    return enter(p);
  }).catch(function(){st.className='status ng';st.textContent='つながりませんでした'});
});
$('#logout').addEventListener('click',function(){
  try{localStorage.removeItem('hana_admin_pass');sessionStorage.removeItem('hana_admin_pass')}catch(x){}
  pass='';$('#pass').value='';show('login');
});
(function(){var p='';try{p=localStorage.getItem('hana_admin_pass')||sessionStorage.getItem('hana_admin_pass')||''}catch(x){}
  if(p) API.verify(p).then(function(ok){if(ok) enter(p)}).catch(function(){});})();

/* ---------- 画像の縮小(アップロード用) ---------- */
function resize(file,maxSide){
  return new Promise(function(res,rej){
    if(!/^image\//.test(file.type)) return rej(new Error('image only'));
    var fr=new FileReader();
    fr.onerror=function(){rej(new Error('read'))};
    fr.onload=function(){
      var im=new Image();
      im.onerror=function(){rej(new Error('decode'))};
      im.onload=function(){
        var r=Math.min(1,maxSide/Math.max(im.width,im.height));
        var cv=document.createElement('canvas'); cv.width=Math.round(im.width*r); cv.height=Math.round(im.height*r);
        cv.getContext('2d').drawImage(im,0,0,cv.width,cv.height);
        var q=.85, out=cv.toDataURL('image/webp',q);
        if(out.indexOf('data:image/webp')!==0) out=cv.toDataURL('image/png');   // webp非対応の端末
        while(out.length>450000&&q>.45&&out.indexOf('data:image/webp')===0){q-=.1;out=cv.toDataURL('image/webp',q)}
        res(out);
      };
      im.src=fr.result;
    };
    fr.readAsDataURL(file);
  });
}

/* ---------- パネル ---------- */
var PANELS={};

/* 配信予定 */
PANELS.schedule=function(body){
  var d=clone(cur.schedule||{default:[],override:{}}); d.override=d.override||{};
  body.appendChild(h('div',{class:'card'},h('h2',{text:'配信予定'}),
    h('p',{class:'note',text:'毎日の基本の時間と、曜日ごとのお休み・変更を決めます。'})));
  var box=h('div',{class:'card'}); body.appendChild(box);

  function slotEditor(list,rerender){
    var wrap=h('div');
    list.forEach(function(s,i){
      var time=h('input',{type:'time',value:s.time||'',onchange:function(){s.time=this.value}});
      var title=h('input',{type:'text',value:s.title||'',placeholder:'例: 定期雑談配信',maxlength:'40',oninput:function(){s.title=this.value}});
      var memo=h('input',{type:'text',value:s.memo||'',placeholder:'ひとこと(なくてもOK)',maxlength:'40',oninput:function(){s.memo=this.value}});
      wrap.appendChild(h('div',{class:'slot'},
        h('div',{class:'r1'},time,title),
        h('div',{class:'r2'},memo,h('button',{class:'btn small del',type:'button',text:'削除',onclick:function(){list.splice(i,1);rerender()}}))));
    });
    wrap.appendChild(h('button',{class:'btn small mint',type:'button',text:'＋ 時間を追加',onclick:function(){
      if(list.length>=5){toast('1日5つまでです');return}
      list.push({time:'20:00',title:'',memo:''});rerender()}}));
    return wrap;
  }
  function draw(){
    box.innerHTML='';
    box.appendChild(h('h3',{text:'毎日の基本'}));
    box.appendChild(slotEditor(d.default,draw));
    box.appendChild(h('h3',{text:'曜日ごとの変更'}));
    [1,2,3,4,5,6,0].forEach(function(w){
      var mode=(d.override[w]===undefined||d.override[w]===null)?'normal':(d.override[w].length===0?'off':'custom');
      var sel=h('select',{onchange:function(){
        if(this.value==='normal') delete d.override[w];
        else if(this.value==='off') d.override[w]=[];
        else d.override[w]=clone(d.default.length?d.default:[{time:'20:00',title:'',memo:''}]);
        draw();
      }},
        h('option',{value:'normal',text:'いつもどおり',selected:mode==='normal'}),
        h('option',{value:'off',text:'お休み',selected:mode==='off'}),
        h('option',{value:'custom',text:'この曜日だけ変更',selected:mode==='custom'}));
      var day=h('div',{class:'day'},h('b',{text:DAYS[w]}),sel);
      if(mode==='custom') day.appendChild(slotEditor(d.override[w],draw));
      box.appendChild(day);
    });
    var btn=h('button',{class:'btn big',type:'button',text:'保存する',onclick:function(){
      var bad=false;
      function clean(l){return l.filter(function(s){if(!s.time||!(s.title||'').trim()){bad=true;return false}return true})}
      var out={default:clean(d.default),override:{}};
      Object.keys(d.override).forEach(function(k){out.override[k]=clean(d.override[k])});
      if(bad) toast('時間とタイトルが空の行は、保存されません');
      d=out; save('schedule',out,btn).then(draw);
    }});
    box.appendChild(btn);
  }
  draw();
};

/* お知らせ */
PANELS.news=function(body){
  var list=clone(cur.news||[]);
  body.appendChild(h('div',{class:'card'},h('h2',{text:'お知らせ'}),
    h('p',{class:'note',text:'ホームに出る文章です。新しいものが上に出ます。'})));
  var add=h('div',{class:'card'});
  var date=h('input',{type:'text',value:today(),maxlength:'12'});
  var text=h('textarea',{rows:'3',maxlength:'120',placeholder:'お知らせの文章(120文字まで)'});
  add.appendChild(h('h3',{text:'新しく追加'}));
  add.appendChild(h('label',{},'日付',date));
  add.appendChild(h('label',{},'文章',text));
  var box=h('div',{class:'card'});
  add.appendChild(h('button',{class:'btn big',type:'button',text:'追加して保存',onclick:function(){
    if(!text.value.trim()){toast('文章を書いてね');return}
    var next=[{date:date.value.trim()||today(),text:text.value.trim()}].concat(list).slice(0,20);
    var btn=this;
    save('news',next,btn).then(function(ok){if(ok){list=next;text.value='';draw()}});
  }}));
  body.appendChild(add); body.appendChild(box);
  function draw(){
    box.innerHTML=''; box.appendChild(h('h3',{text:'いま出ているお知らせ'}));
    if(!list.length) box.appendChild(h('p',{class:'note',text:'まだありません'}));
    list.forEach(function(n,i){
      box.appendChild(h('div',{class:'msg'},h('time',{text:n.date}),n.text,
        h('div',{},h('button',{class:'btn small del',type:'button',text:'削除',onclick:function(){
          var next=list.slice(); next.splice(i,1);
          save('news',next).then(function(ok){if(ok){list=next;draw()}});
        }}))));
    });
  }
  draw();
};

/* プロフィール */
PANELS.home=function(body){
  var p=clone(cur.home||{});
  var card=h('div',{class:'card'},h('h2',{text:'ホームの言葉'}));
  var serifs=(p.serifs&&p.serifs.length)?p.serifs.slice():(p.serif?[p.serif]:['']);
  var box=h('div',{class:'serif-list'});
  function sync(){ p.serifs=serifs.filter(function(t){return String(t).trim()}); p.serif=p.serifs[0]||''; }
  function draw(){
    box.innerHTML='';
    serifs.forEach(function(t,i){
      var ta=h('textarea',{rows:'2',maxlength:'40'}); ta.value=t;
      ta.addEventListener('input',function(){serifs[i]=ta.value;sync()});
      var row=h('div',{class:'serif-row'},ta);
      if(serifs.length>1) row.appendChild(h('button',{class:'btn mint',type:'button',text:'消す',onclick:function(){serifs.splice(i,1);sync();draw()}}));
      box.appendChild(row);
    });
    if(serifs.length<8) box.appendChild(h('button',{class:'btn mint',type:'button',text:'＋ セリフを増やす',onclick:function(){serifs.push('');draw()}}));
  }
  card.appendChild(h('label',{},'立ち絵のふきだし(セリフ)',h('small',{text:'立ち絵の近くに出る言葉です。何個でも(最大8個)入れられて、タップすると順番に入れ替わります。Enterで改行した場所で、ふきだしも改行されます'})));
  card.appendChild(box); draw(); sync();
  var a=h('textarea',{rows:'2',maxlength:'40'}); a.value=p.catch||'';
  a.addEventListener('input',function(){p.catch=a.value});
  var b=h('textarea',{rows:'4',maxlength:'120'}); b.value=p.sub||'';
  b.addEventListener('input',function(){p.sub=b.value});
  card.appendChild(h('label',{},'見出し(大きい文字)',h('small',{text:'ホームの一番目立つ言葉です。Enterで改行できます'}),a));
  card.appendChild(h('label',{},'説明',h('small',{text:'Enterで改行した場所で、そのまま改行されます'}),b));
  card.appendChild(h('button',{class:'btn big',type:'button',text:'保存する',onclick:function(){save('home',p,this)}}));
  body.appendChild(card);
};
PANELS.profile=function(body){
  var p=clone(cur.profile||{});
  var card=h('div',{class:'card'},h('h2',{text:'プロフィール'}));
  function field(label,key,opt){
    opt=opt||{};
    var el=opt.area?h('textarea',{rows:String(opt.rows||3),maxlength:String(opt.max||200)}):h('input',{type:'text',maxlength:String(opt.max||60)});
    el.value=(key==='tags')?(p.tags||[]).join(' '):(p[key]||'');
    el.addEventListener('input',function(){ p[key]=(key==='tags')?el.value.split(/[\s,、]+/).filter(Boolean).slice(0,8):el.value });
    card.appendChild(h('label',{},label,opt.hint?h('small',{text:opt.hint}):null,el));
  }
  field('名前','name'); field('よみ(ふりがな)','reading'); field('誕生日','birthday',{max:20});
  field('好きなもの','likes'); field('配信','content'); field('ファンネーム','fanname');
  field('タグ','tags',{hint:'スペースで区切ります(#から書いてね)',max:120});
  field('ひとこと(プロフィールページ)','hitokoto',{area:true,rows:4,max:200});
  card.appendChild(h('button',{class:'btn big',type:'button',text:'保存する',onclick:function(){save('profile',p,this)}}));
  body.appendChild(card);
};

/* 写真リスト(立ち絵・ひとこま共通) */
function imagePanel(title,note,key,opt){
  return function(body){
    var list=clone(cur[key]||[]);
    body.appendChild(h('div',{class:'card'},h('h2',{text:title}),h('p',{class:'note',text:note})));
    var box=h('div',{class:'card'}); body.appendChild(box);
    var file=h('input',{type:'file',accept:'image/*',hidden:'hidden'});
    file.addEventListener('change',function(){
      var f=file.files[0]; file.value=''; if(!f) return;
      if(list.length>=opt.max){toast('最大'+opt.max+'枚までです');return}
      toast('画像を準備しています…');
      resize(f,opt.side).then(function(url){
        var item={src:url}; if(opt.label) item.label='✨ 新しい衣装';
        list.push(item); draw(); toast('追加しました。「保存する」を押してね');
      }).catch(function(){toast('この画像は使えませんでした')});
    });
    function draw(){
      box.innerHTML=''; box.appendChild(file);
      var wrap=h('div',{class:'imgs'});
      list.forEach(function(it,i){
        var c=h('div',{class:'c'});
        if(opt.label) c.appendChild(h('input',{type:'text',value:it.label||'',maxlength:'14',placeholder:'表示する名前(例: 🌸 桜和装)',oninput:function(){it.label=this.value}}));
        c.appendChild(h('button',{class:'btn small del',type:'button',text:'削除',onclick:function(){list.splice(i,1);draw()}}));
        wrap.appendChild(h('div',{class:'img'},h('img',{src:imgUrl(it.src),alt:''}),c));
      });
      if(!list.length) wrap.appendChild(h('p',{class:'note',text:'まだありません'}));
      box.appendChild(wrap);
      box.appendChild(h('button',{class:'btn mint',type:'button',text:'＋ 写真を追加する',onclick:function(){file.click()}}));
      box.appendChild(h('button',{class:'btn big',type:'button',text:'保存する',onclick:function(){
        var out=list.map(function(it){var o={src:it.src};if(opt.label)o.label=(it.label||'').trim()||'衣装';return o});
        save(key,out,this)}}));
    }
    draw();
  };
}
PANELS.outfits=imagePanel('立ち絵・衣装','プロフィールで着せかえできる立ち絵です(最大6枚)。背景が透明の画像がきれいです。','outfits',{max:6,side:1400,label:true});
PANELS.gallery=imagePanel('ひとこま写真','「配信のひとこま」に出る写真です(最大8枚)。','gallery',{max:8,side:1000,label:false});

/* 届いたメッセージ */
PANELS.inbox=function(body){
  var mode='msg';
  var card=h('div',{class:'card'},h('h2',{text:'届いたメッセージ'}));
  var tabs=h('div',{class:'tabs'});
  var list=h('div');
  card.appendChild(tabs); card.appendChild(list); body.appendChild(card);
  function fmt(t){try{var d=new Date(t);return d.toLocaleString('ja-JP',{timeZone:'Asia/Tokyo'})}catch(e){return ''}}
  function draw(){
    tabs.innerHTML='';
    [['msg','匿名メッセージ'],['contact','お問い合わせ']].forEach(function(x){
      tabs.appendChild(h('button',{type:'button',class:mode===x[0]?'on':'',text:x[1],onclick:function(){mode=x[0];draw()}}));
    });
    list.innerHTML='読み込み中…';
    (mode==='msg'?API.listMessages(pass):API.listContacts(pass)).then(function(rows){
      list.innerHTML='';
      if(!rows||!rows.length){list.appendChild(h('p',{class:'note',text:'まだ届いていません'}));return}
      rows.forEach(function(r){
        if(mode==='msg') list.appendChild(h('div',{class:'msg'},h('time',{text:fmt(r.created_at)}),r.body,
          h('div',{class:'m',text:r.read_ok?'配信で読まれてもOK':'読まないでほしい'})));
        else list.appendChild(h('div',{class:'msg'},h('time',{text:fmt(r.created_at)}),
          h('div',{class:'m',text:r.kind+' ／ '+r.name+' ／ 返信先: '+r.reply_to}),r.body));
      });
    }).catch(function(){list.innerHTML='';list.appendChild(h('p',{class:'note',text:'読み込めませんでした'}))});
  }
  draw();
};
})();
