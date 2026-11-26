(function(){
var G=(window.HANA||{}).gate, root=document.documentElement;
if(!G){root.classList.remove('locked');return}
try{if(sessionStorage.getItem('hana_gate_ok')==='1'){root.classList.remove('locked');return}}catch(e){}
var st=document.createElement('style');
st.textContent='#gate{position:fixed;inset:0;z-index:99999;display:grid;place-items:center;padding:20px;background:linear-gradient(170deg,#fde4ee,#f9c3da 45%,#fcd5e3);font-family:"Zen Maru Gothic",sans-serif;color:#6b4a5a}'+
'#gate form{width:min(340px,100%);background:rgba(255,255,255,.9);border:2px solid #fff;border-radius:24px;padding:22px 18px;text-align:center;box-shadow:0 8px 24px rgba(228,134,174,.3)}'+
'#gate h1{font:400 20px "Mochiy Pop One",sans-serif;color:#e486ae;margin:0 0 6px}#gate p{font-size:13px;margin:0 0 12px;color:#9a7a89}'+
'#gate input{font-size:16px;width:100%;border:2px solid #fcd5e3;border-radius:14px;padding:10px 12px;font:inherit;text-align:center}'+
'#gate button{width:100%;margin-top:10px;border:0;border-radius:999px;padding:12px;font:inherit;font-weight:700;color:#fff;background:linear-gradient(180deg,#f9b9d3,#ee93b8);box-shadow:0 4px 0 #dd78a3}'+
'#gate .ng{min-height:1.4em;margin-top:8px;font-size:13px;font-weight:700;color:#c26a8a}';
document.head.appendChild(st);
var g=document.createElement('div');g.id='gate';
g.innerHTML='<form><h1>花詩 はな</h1><p>試作中のため、パスワードを入れてね</p><input type="password" id="gate-pw" inputmode="numeric" pattern="[0-9]*" maxlength="4" placeholder="4けたの数字" autocomplete="off"><button type="submit">ひらく</button><div class="ng" id="gate-ng"></div></form>';
document.body.appendChild(g);
function sha(t){return crypto.subtle.digest('SHA-256',new TextEncoder().encode(t)).then(function(b){return Array.prototype.map.call(new Uint8Array(b),function(x){return('0'+x.toString(16)).slice(-2)}).join('')})}
g.querySelector('form').addEventListener('submit',function(e){
  e.preventDefault();
  sha(document.getElementById('gate-pw').value.trim()).then(function(h){
    if(h===G){try{sessionStorage.setItem('hana_gate_ok','1')}catch(x){}var ai=document.activeElement;if(ai&&ai.blur)ai.blur();g.remove();root.classList.remove('locked');window.dispatchEvent(new Event('hana-unlock'))}
    else document.getElementById('gate-ng').textContent='パスワードがちがうみたい';
  });
});
})();
