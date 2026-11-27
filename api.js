// 保存先との通信(Supabase / 試作モード)。HP本体と更新ページの両方が使います。
(function(){
'use strict';
var C = window.HANA, sb = C.supabase || {};
var live = !!(sb.url && sb.anonKey);
var DEMO_PASS = 'hana';   // 試作モードの合言葉

function ls(k,d){try{var v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}}
function lsSet(k,v){try{localStorage.setItem(k,JSON.stringify(v));return true}catch(e){return false}}
function hdr(){return {'Content-Type':'application/json','apikey':sb.anonKey,'Authorization':'Bearer '+sb.anonKey}}
function chk(r){if(!r.ok) throw new Error('HTTP '+r.status); return r}
function rpc(name,args){
  return fetch(sb.url+'/rest/v1/rpc/'+name,{method:'POST',headers:hdr(),body:JSON.stringify(args)})
    .then(chk).then(function(r){return r.text()}).then(function(t){return t?JSON.parse(t):null});
}

// 設定の取得: 初期設定(config.js)に、保存済みの内容を重ねて返す
function defaults(){
  return {schedule:C.schedule,news:C.news,profile:C.profile,home:C.home,outfits:C.outfits,gallery:C.gallery};
}
function merge(saved){
  var d=defaults(); saved=saved||{};
  Object.keys(saved).forEach(function(k){ if(saved[k]!==null&&saved[k]!==undefined) d[k]=saved[k]; });
  return d;
}
function getSettings(){
  if(!live) return Promise.resolve(merge(ls('hana_demo_settings',{})));
  return fetch(sb.url+'/rest/v1/hana_settings?select=key,value',{headers:hdr()})
    .then(chk).then(function(r){return r.json()}).then(function(rows){
      var o={}; rows.forEach(function(x){o[x.key]=x.value}); return merge(o);
    });
}
function saveSetting(pass,key,value){
  if(!live){
    if(pass!==DEMO_PASS) return Promise.reject(new Error('unauthorized'));
    var s=ls('hana_demo_settings',{}); s[key]=value;
    return lsSet('hana_demo_settings',s)?Promise.resolve():Promise.reject(new Error('quota'));
  }
  return rpc('hana_save_setting',{p:pass,k:key,v:value});
}
function verify(pass){
  if(!live) return Promise.resolve(pass===DEMO_PASS);
  return rpc('hana_verify',{p:pass}).then(function(x){return x===true});
}
function listMessages(pass){
  if(!live) return Promise.resolve(pass===DEMO_PASS?ls('hana_demo_'+sb.tables.messages,[]).slice().reverse():[]);
  return rpc('hana_list_messages',{p:pass});
}
function listContacts(pass){
  if(!live) return Promise.resolve(pass===DEMO_PASS?ls('hana_demo_'+sb.tables.contacts,[]).slice().reverse():[]);
  return rpc('hana_list_contacts',{p:pass});
}
// 来訪者からの送信(メッセージ・お問い合わせ)
function insert(table,row){
  if(!live){
    var k='hana_demo_'+table, a=ls(k,[]); row.created_at=new Date().toISOString(); a.push(row); lsSet(k,a);
    return Promise.resolve('demo');
  }
  return fetch(sb.url+'/rest/v1/'+table,{method:'POST',headers:Object.assign(hdr(),{'Prefer':'return=minimal'}),body:JSON.stringify(row)})
    .then(chk).then(function(){return 'ok'});
}
window.HanaAPI={live:live,demoPass:DEMO_PASS,getSettings:getSettings,saveSetting:saveSetting,verify:verify,
  listMessages:listMessages,listContacts:listContacts,insert:insert,defaults:defaults};
})();
