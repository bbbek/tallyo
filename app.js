(function(){
'use strict';
var TG=(window.Telegram&&window.Telegram.WebApp&&window.Telegram.WebApp.initData)?window.Telegram.WebApp:null;
if(TG){try{TG.ready();TG.expand();if(TG.disableVerticalSwipes)TG.disableVerticalSwipes();}catch(e){}}
var TG_LINK='https://t.me/thetallyobot';
var KEY='moi-dengi-v2';
var CATS={exp:['food','transport','home','comm','health','clothes','study','fun','transfers','other'],inc:['job','family','tin','oin']};
var METHODS=['apple_pay','qr','transfer','cash','card','other'];
var CURS=['KGS','USD','EUR','RUB','KZT'];
var CM={
food:['#ff9500','<path d="M7 3v8M5 3v5a2 2 0 0 0 4 0V3M7 11v10M16 21V3c-2 1.5-3 4-3 7h3"/>'],
transport:['#007aff','<path d="M5 16V9.5L7 5h10l2 4.5V16M5 16h14M5 16v3M19 16v3M5 11h14"/><circle cx="8.5" cy="13.5" r=".6"/><circle cx="15.5" cy="13.5" r=".6"/>'],
home:['#5856d6','<path d="M4 11l8-7 8 7M6 9.5V20h12V9.5M10 20v-6h4v6"/>'],
comm:['#32ade6','<rect x="7" y="3" width="10" height="18" rx="2.5"/><path d="M11 18h2"/>'],
health:['#ff2d55','<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>'],
clothes:['#af52de','<path d="M9 3l3 2 3-2 5 3-2 4-2-1v12H8V9L6 10 4 6z"/>'],
study:['#a2845e','<path d="M4 5.5C6.5 4 9.5 4 12 6c2.5-2 5.5-2 8-.5V19c-2.5-1.5-5.5-1.5-8 .5-2.5-2-5.5-2-8-.5zM12 6v13.5"/>'],
fun:['#ff3b30','<path d="M4 9h16v3a2 2 0 0 0 0 4v3H4v-3a2 2 0 0 0 0-4zM14 9v10" stroke-dasharray="2 2"/>'],
transfers:['#8e8e93','<path d="M5 8h13l-3-3M19 16H6l3 3"/>'],
other:['#636366','<circle cx="6" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="18" cy="12" r="1.3"/>'],
job:['#34c759','<rect x="3.5" y="7" width="17" height="12" rx="2"/><path d="M9 7V5h6v2M3.5 12h17"/>'],
family:['#ff6482','<circle cx="9" cy="8" r="3"/><circle cx="17" cy="9.5" r="2.2"/><path d="M3.5 19c.5-3.5 2.6-5.5 5.5-5.5s5 2 5.5 5.5M15 14c2.5 0 4.6 1.6 5 5"/>'],
tin:['#00c7be','<path d="M12 4v12M7 11l5 5 5-5M5 20h14"/>'],
oin:['#30b0c7','<circle cx="12" cy="12" r="8"/><path d="M12 8v8M9.5 10.5h4a1.5 1.5 0 0 1 0 3h-3a1.5 1.5 0 0 0 0 3h4" transform="scale(.8) translate(3 3)"/>']
};
function ico(c,sm){var m=CM[c]||CM.other;return '<span class="ico'+(sm?' sm':'')+'" style="--c:'+m[0]+'" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">'+m[1]+'</svg></span>';}
function svgI(p){return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+p+'</svg>';}
var DEF_RULES='glovo = food\nglobus = food\nnarodny = food\nfrunze = food\nbishkek park = fun\nyandex = transport\ntaxi = transport\nbeeline = comm\nmegacom = comm\no! = comm\naptek = health\ngym = health\nfitness = health\nкурс = study\nанглийск = study\ncourse = study';

function $(s){return document.querySelector(s);}
function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,6);}
function pad(n){return (n<10?'0':'')+n;}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function nowTs(){var d=new Date();return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())+' '+pad(d.getHours())+':'+pad(d.getMinutes());}
function pnum(s){var v=parseFloat(String(s==null?'':s).replace(/\s/g,'').replace(',','.'));return isNaN(v)?NaN:v;}
function fmt(n){return (Math.round(n*100)/100).toLocaleString('ru-RU',{maximumFractionDigits:2});}
function detectLang(){var l=String(navigator.language||'ru').slice(0,2).toLowerCase();return (l==='ky'||l==='kg')?'ky':(l==='en'?'en':'ru');}
function defaults(){return {v:2,lang:detectLang(),theme:'auto',base:'KGS',rates:{USD:0,EUR:0,RUB:0,KZT:0},
  accounts:[{id:'a1',name:'MBank',cur:'KGS',open:0},{id:'a2',name:'',cur:'KGS',open:0,cash:true}],
  tx:[],budgets:{},limit:0,rec:[],goals:[],rules:DEF_RULES,used:{}};}
function load(){var d=defaults();
  try{var s=JSON.parse(localStorage.getItem(KEY)||'null');if(s&&typeof s==='object'){Object.keys(d).forEach(function(k){if(s[k]!==undefined)d[k]=s[k];});}}catch(e){}
  if(!Array.isArray(d.tx))d.tx=[];if(!Array.isArray(d.accounts)||!d.accounts.length)d.accounts=defaults().accounts;
  if(!Array.isArray(d.rec))d.rec=[];if(!Array.isArray(d.goals))d.goals=[];
  if(!d.rates||typeof d.rates!=='object')d.rates=defaults().rates;if(!d.budgets||typeof d.budgets!=='object')d.budgets={};if(!d.used||typeof d.used!=='object')d.used={};
  return d;}
var S=load();
function save(){try{localStorage.setItem(KEY,JSON.stringify(S));}catch(e){}}
function t(k){var L=I18N[S.lang]||I18N.ru;return L[k]!==undefined?L[k]:(I18N.ru[k]!==undefined?I18N.ru[k]:k);}

var today=new Date();
var ui={tab:'today',y:today.getFullYear(),m:today.getMonth(),q:'',fk:'all',fa:'all',fc:'all',e:null,modal:null,entry:false,armed:null};
function newEntry(){var a=S.accounts;return {kind:'exp',amt:'',cat:'',acc:a[0].id,acc2:(a[1]||a[0]).id,method:'apple_pay',note:''};}
ui.e=newEntry();

function accById(id){return S.accounts.filter(function(a){return a.id===id;})[0];}
function accName(a){return a?(a.cash&&!a.name?t('cash'):a.name):'?';}
function accNameById(id){return accName(accById(id));}
function accCur(id){var a=accById(id);return a?a.cur:S.base;}
function toBase(v,c){if(c===S.base)return v;var r=Number(S.rates[c]);return r>0?v*r:null;}
function autoCat(note,kind){if(kind==='inc')return 'oin';var n=String(note||'').toLowerCase(),ls=String(S.rules||'').split('\n');
  for(var i=0;i<ls.length;i++){var p=ls[i].split('=');if(p.length<2)continue;var k=p[0].trim().toLowerCase(),c=p.slice(1).join('=').trim();if(k&&n.indexOf(k)>=0&&CATS.exp.indexOf(c)>=0)return c;}return 'other';}
function byTsDesc(a,b){return a.ts<b.ts?1:(a.ts>b.ts?-1:0);}
function keyOf(x){return [x.ts,x.kind,x.amt,x.acc,x.note].join('|');}
function addTx(o){var x={id:uid(),ts:o.ts||nowTs(),kind:o.kind,amt:o.amt,acc:o.acc,acc2:o.acc2||'',cat:o.cat,method:o.method||'other',note:o.note||''};if(o.rec)x.rec=o.rec;
  var k=keyOf(x);if(S.tx.some(function(y){return keyOf(y)===k;}))return null;S.tx.push(x);S.used[x.cat]=(S.used[x.cat]||0)+1;return x;}
function monthData(y,m){var pre=y+'-'+pad(m+1),list=S.tx.filter(function(x){return x.ts.slice(0,7)===pre;}).sort(byTsDesc),inc=0,exp=0,miss=0;
  list.forEach(function(x){if(x.kind==='tr')return;var v=toBase(x.amt,accCur(x.acc));if(v===null){miss++;return;}if(x.kind==='inc')inc+=v;else exp+=v;});
  return {list:list,inc:inc,exp:exp,miss:miss};}
function balance(a){var b=Number(a.open)||0;S.tx.forEach(function(x){if(x.acc===a.id){if(x.kind==='inc')b+=x.amt;else b-=x.amt;}if(x.kind==='tr'&&x.acc2===a.id)b+=x.amt;});return b;}

var ICON={today:'<path d="M4 10.5L12 4l8 6.5V20h-5v-6H9v6H4z"/>',ops:'<path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/>',rep:'<path d="M5 20V11M12 20V5M19 20v-6"/>',more:'<circle cx="12" cy="12" r="3"/><path d="M12 2.5v3M12 18.5v3M4.2 6.5l2.6 1.5M17.2 16l2.6 1.5M4.2 17.5l2.6-1.5M17.2 8l2.6-1.5"/>'};
function tabs(){var h='<div class="in">';['today','ops','+','rep','more'].forEach(function(k){
  if(k==='+'){h+='<button class="plus" data-act="open_entry" aria-label="'+esc(t('new_entry'))+'">'+svgI('<path d="M12 5v14M5 12h14"/>')+'</button>';return;}
  h+='<button data-act="tab" data-v="'+k+'" class="'+(ui.tab===k?'on':'')+'"'+(ui.tab===k?' aria-current="page"':'')+'>'+svgI(ICON[k])+esc(t('tab_'+k))+'</button>';});return h+'</div>';}
function monthNav(){return '<div class="nav"><button class="round" data-act="prevm" aria-label="'+esc(t('prev_m'))+'">'+svgI('<path d="M15 5l-7 7 7 7"/>')+'</button><b>'+esc(t('months')[ui.m])+' '+ui.y+'</b><button class="round" data-act="nextm" aria-label="'+esc(t('this_m'))+'">'+svgI('<path d="M9 5l7 7-7 7"/>')+'</button></div>';}
function monthHead(title){return '<div class="head"><h1>'+esc(title||t('app'))+'</h1>'+monthNav()+'</div>';}
function money(v,cur){return fmt(v)+' <small>'+esc(cur||S.base)+'</small>';}
function row(x){var a=accById(x.acc),sign=x.kind==='inc'?'+':(x.kind==='exp'?'−':''),cls=x.kind==='inc'?'i':(x.kind==='exp'?'e':'t');
  var title=x.note||(x.kind==='tr'?t('tr'):t(x.cat));
  var sub=x.ts.slice(11)+' · '+(x.kind==='tr'?accNameById(x.acc)+' → '+accNameById(x.acc2):t(x.cat)+' · '+t('m_'+x.method));
  return '<div class="tx" data-act="row" data-id="'+x.id+'" role="button" tabindex="0">'+ico(x.kind==='tr'?'transfers':x.cat)+'<div class="txt"><div class="n">'+esc(title)+'</div><div class="m">'+esc(sub)+'</div></div><span class="pill '+cls+'">'+sign+fmt(x.amt)+' '+esc(a?a.cur:S.base)+'</span></div>';}
function chips(list,cur,act,labelFn){return '<div class="chips">'+list.map(function(v){return '<button data-act="'+act+'" data-v="'+esc(v)+'" class="'+(v===cur?'on':'')+'">'+esc(labelFn(v))+'</button>';}).join('')+'</div>';}
function catSpend(md){var by={};md.list.forEach(function(x){if(x.kind!=='exp')return;var v=toBase(x.amt,accCur(x.acc));if(v!==null)by[x.cat]=(by[x.cat]||0)+v;});return by;}

function vToday(){var md=monthData(ui.y,ui.m),bal=md.inc-md.exp,h=monthHead();
  h+='<section class="card hero"><small>'+esc(t('balance'))+' · '+esc(t('months')[ui.m])+'</small><div class="big">'+(bal<0?'−':'')+money(Math.abs(bal))+'</div>'
    +'<div class="pills"><span class="pill i">+'+fmt(md.inc)+' '+esc(t('income').toLowerCase())+'</span><span class="pill e">−'+fmt(md.exp)+' '+esc(t('expense').toLowerCase())+'</span></div>';
  if(S.limit>0){var over=md.exp>S.limit;h+='<div class="limit"><div class="bar'+(over?' over':'')+'"><i style="width:'+Math.min(100,md.exp/S.limit*100)+'%"></i></div><div class="muted"><span>'+esc(t('limit_m'))+'</span><span>'+esc(over?t('over')+' '+fmt(md.exp-S.limit):t('left')+' '+fmt(S.limit-md.exp))+' '+esc(S.base)+'</span></div></div>';}
  if(md.miss)h+='<div class="note">'+esc(t('missing_rate'))+'</div>';
  h+='</section>';
  var by=catSpend(md),cats=CATS.exp.slice().sort(function(a,b){return (by[b]||0)-(by[a]||0)||(S.used[b]||0)-(S.used[a]||0);});
  h+='<div class="sec"><h2>'+esc(t('cats_title'))+'</h2></div><div class="tiles">'+cats.map(function(c){var v=by[c]||0,b=Number(S.budgets[c])||0,p=b?Math.round(v/b*100):0;
    return '<button class="tile'+(v?'':' zero')+'" data-act="catgo" data-v="'+c+'">'+ico(c)+(b?'<span class="pill pct '+(p>100?'solid-e':(p>=80?'solid-b':'solid-i'))+'">'+p+'%</span>':'')+'<b>'+esc(t(c))+'</b><span class="v">'+fmt(v)+' '+esc(S.base)+'</span></button>';}).join('')+'</div>';
  var rec=S.tx.slice().sort(byTsDesc).slice(0,6);
  h+='<div class="sec"><h2>'+esc(t('recent'))+'</h2>'+(rec.length?'<button class="link" data-act="tab" data-v="ops">'+esc(t('all'))+'</button>':'')+'</div><section class="card list">'+(rec.length?rec.map(row).join(''):'<p class="empty">'+esc(t('no_ops'))+'</p>')+'</section>';return h;}
function entryCard(){var e=ui.e,cur=accCur(e.acc),h='<div class="sheethead"><button class="link" data-act="close_entry">'+esc(t('cancel'))+'</button><h2>'+esc(t('new_entry'))+'</h2><button class="link" data-act="add">'+esc(t('add'))+'</button></div>';
  h+='<div class="seg">'+['exp','inc','tr'].map(function(k){return '<button data-act="kind" data-v="'+k+'" class="'+(k==='tr'?'':'k-'+k)+(e.kind===k?' on':'')+'">'+esc(t(k))+'</button>';}).join('')+'</div>';
  h+='<div class="amt '+(e.kind==='exp'?'e':(e.kind==='inc'?'i':''))+'"><span id="amtDisp">'+esc(e.amt||'0')+'</span> <small>'+esc(cur)+'</small></div>';
  if(e.kind!=='tr'){var list=CATS[e.kind==='inc'?'inc':'exp'].slice().sort(function(a,b){return (S.used[b]||0)-(S.used[a]||0);});
    h+='<div class="pickcats">'+list.map(function(c){return '<button data-act="cat" data-v="'+c+'" class="'+(c===e.cat?'on':'')+'"'+(c===e.cat?' aria-pressed="true"':' aria-pressed="false"')+'>'+ico(c,1)+esc(t(c))+'</button>';}).join('')+'</div>';}
  h+='<div class="pad">'+['1','2','3','4','5','6','7','8','9',',','0','⌫'].map(function(k){return '<button data-act="key" data-v="'+k+'" aria-label="'+(k==='⌫'?esc(t('del')):k)+'">'+k+'</button>';}).join('')+'</div>';
  h+='<input data-in="note" value="'+esc(e.note)+'" placeholder="'+esc(t('note_ph'))+'" aria-label="'+esc(t('note'))+'" autocomplete="off">';
  var ids=S.accounts.map(function(a){return a.id;});
  h+='<div class="lab">'+esc(e.kind==='tr'?t('account'):t('account'))+'</div>'+chips(ids,e.acc,'acc',accNameById);
  if(e.kind==='tr')h+='<div class="lab">'+esc(t('account_to'))+'</div>'+chips(ids,e.acc2,'acc2',accNameById);
  else h+='<div class="lab">'+esc(t('method'))+'</div>'+chips(METHODS,e.method,'meth',function(m){return t('m_'+m);});
  h+='<button class="pri" data-act="add">'+esc(t('add'))+'</button>';return h;}

function opsList(){var q=ui.q.trim().toLowerCase(),list=S.tx.slice().sort(byTsDesc).filter(function(x){
  if(ui.fk!=='all'&&x.kind!==ui.fk)return false;if(ui.fa!=='all'&&x.acc!==ui.fa&&x.acc2!==ui.fa)return false;if(ui.fc!=='all'&&x.cat!==ui.fc)return false;
  if(q&&(x.note+' '+t(x.cat)).toLowerCase().indexOf(q)<0)return false;return true;}).slice(0,300);
  if(!list.length)return '<p class="empty">'+esc(t('no_ops'))+'</p>';var h='',last='';
  list.forEach(function(x){var d=x.ts.slice(0,10);if(d!==last){last=d;h+='<div class="day">'+d.slice(8,10)+'.'+d.slice(5,7)+'.'+d.slice(0,4)+'</div>';}h+=row(x);});return '<div class="list">'+h+'</div>';}
function vOps(){return '<div class="head"><h1>'+esc(t('tab_ops'))+'</h1></div><input type="search" data-in="q" value="'+esc(ui.q)+'" placeholder="'+esc(t('search'))+'" aria-label="'+esc(t('search'))+'">'
  +'<div class="seg s4">'+['all','exp','inc','tr'].map(function(k){return '<button data-act="fk" data-v="'+k+'" class="'+(ui.fk===k?'on':'')+'">'+esc(k==='all'?t('all'):t(k))+'</button>';}).join('')+'</div>'
  +(ui.fc!=='all'?'<div class="chips"><button class="on" data-act="fc_clear" aria-label="'+esc(t('all'))+'">'+esc(t(ui.fc))+' ×</button></div>':'')+'<section class="card">'
  +'<select data-ch="fa" aria-label="'+esc(t('account'))+'"><option value="all">'+esc(t('all'))+'</option>'+S.accounts.map(function(a){return '<option value="'+a.id+'"'+(ui.fa===a.id?' selected':'')+'>'+esc(accName(a))+'</option>';}).join('')+'</select>'
  +'<div id="opsList">'+opsList()+'</div></section>';}

function bars(rows,max){return rows.map(function(r){var m=r[4]?CM[r[4]]:null;return '<div class="cat">'+(r[4]?ico(r[4],1):'<span></span>')+'<span class="nm">'+esc(r[0])+'</span><b>'+esc(r[2])+'</b><div class="bar'+(r[3]?' over':'')+'"><i style="width:'+(max>0?r[1]/max*100:0)+'%'+(m?';--c:'+m[0]:'')+'"></i></div></div>';}).join('');}
function vRep(){var md=monthData(ui.y,ui.m),py=ui.m===0?ui.y-1:ui.y,pm=ui.m===0?11:ui.m-1,pd=monthData(py,pm),h=monthHead(t('tab_rep'));
  var by={};md.list.forEach(function(x){if(x.kind!=='exp')return;var v=toBase(x.amt,accCur(x.acc));if(v!==null)by[x.cat]=(by[x.cat]||0)+v;});
  var ks=Object.keys(by).sort(function(a,b){return by[b]-by[a];}),mx=ks.length?by[ks[0]]:0;
  h+='<section class="card"><h2>'+esc(t('by_cat'))+'</h2>'+(ks.length?bars(ks.map(function(k){var b=Number(S.budgets[k])||0;return [t(k),by[k],fmt(by[k])+(b?' / '+fmt(b):''),b&&by[k]>b,k];}),Math.max(mx,1)):'<p class="empty">'+esc(t('no_exp'))+'</p>')+'</section>';
  var dn=new Date(ui.y,ui.m+1,0).getDate(),dd=[],i;for(i=0;i<dn;i++)dd.push(0);
  md.list.forEach(function(x){if(x.kind!=='exp')return;var v=toBase(x.amt,accCur(x.acc));if(v!==null)dd[parseInt(x.ts.slice(8,10),10)-1]+=v;});
  var dm=Math.max.apply(null,dd.concat([1])),W=520,bw=W/dn,svg='<svg viewBox="0 0 '+W+' 110" style="width:100%;height:auto" role="img" aria-label="'+esc(t('by_day'))+'">';
  dd.forEach(function(v,j){var hh=v/dm*80;svg+='<rect x="'+(j*bw+1)+'" y="'+(90-hh)+'" width="'+Math.max(bw-2,1)+'" height="'+hh+'" rx="2" fill="var(--accent)"/>';if((j+1)%5===0||j===0)svg+='<text x="'+(j*bw+bw/2)+'" y="106" text-anchor="middle" font-size="9" fill="var(--muted)">'+(j+1)+'</text>';});
  h+='<section class="card"><h2>'+esc(t('by_day'))+'</h2>'+svg+'</svg></section>';
  function pct(a,b){return b>0?Math.round((a-b)/b*100):0;}
  h+='<section class="card"><h2>'+esc(t('compare'))+'</h2><div class="acc"><span>'+esc(t('this_m'))+'</span><b>'+fmt(md.exp)+' '+esc(S.base)+'</b></div><div class="acc"><span>'+esc(t('prev_m'))+'</span><b>'+fmt(pd.exp)+' '+esc(S.base)+'</b></div>'+(pd.exp>0?'<div class="acc"><span>%</span><span class="pill '+(md.exp>pd.exp?'e':'i')+'">'+(pct(md.exp,pd.exp)>0?'+':'')+pct(md.exp,pd.exp)+'%</span></div>':'')+'</section>';
  var nm={};md.list.forEach(function(x){if(x.kind!=='exp'||!x.note)return;var k=x.note.toLowerCase().trim(),v=toBase(x.amt,accCur(x.acc));if(v!==null)nm[k]=(nm[k]||0)+v;});
  var nk=Object.keys(nm).sort(function(a,b){return nm[b]-nm[a];}).slice(0,5);
  if(nk.length)h+='<section class="card"><h2>'+esc(t('top_notes'))+'</h2>'+bars(nk.map(function(k){return [k,nm[k],fmt(nm[k])];}),nm[nk[0]])+'</section>';
  h+='<section class="card"><h2>'+esc(t('accounts'))+'</h2>'+S.accounts.map(function(a){var b=balance(a);return '<div class="acc"><span>'+esc(accName(a))+'</span><span class="pill '+(b<0?'e':'b')+'">'+fmt(b)+' '+esc(a.cur)+'</span></div>';}).join('')+'</section>';return h;}

function sel(id,opts,cur,dc){return '<select '+(id?'id="'+id+'" ':'')+(dc||'')+'>'+opts.map(function(o){return '<option value="'+esc(o[0])+'"'+(o[0]===cur?' selected':'')+'>'+esc(o[1])+'</option>';}).join('')+'</select>';}
function vMore(){var h='<div class="head"><h1>'+esc(t('tab_more'))+'</h1></div>';
  h+='<section class="card"><label>'+esc(t('language'))+sel('',[['ru','Русский'],['ky','Кыргызча'],['en','English']],S.lang,'data-ch="lang"')+'</label><label>'+esc(t('theme'))+sel('',[['auto',t('th_auto')],['light',t('th_light')],['dark',t('th_dark')]],S.theme,'data-ch="theme"')+'</label></section>';
  h+='<section class="card"><h2>'+esc(t('accounts'))+'</h2>'+S.accounts.map(function(a){return '<div class="row2"><label>'+esc(t('name'))+'<input data-ch="accname" data-id="'+a.id+'" value="'+esc(a.cash&&!a.name?'':a.name)+'" placeholder="'+esc(accName(a))+'"></label><label>'+esc(t('opening'))+' ('+esc(a.cur)+')<input data-ch="accopen" data-id="'+a.id+'" inputmode="decimal" value="'+esc(a.open||'')+'"></label></div>';}).join('')
    +'<div class="row2"><label>'+esc(t('name'))+'<input id="an"></label><label>'+esc(t('currency'))+sel('ac',CURS.map(function(c){return [c,c];}),S.base)+'</label></div><button data-act="acc_add">'+esc(t('add_account'))+'</button></section>';
  h+='<section class="card"><h2>'+esc(t('budgets'))+'</h2><p class="muted">'+esc(t('budget_hint'))+'</p><label>'+esc(t('limit_m'))+' ('+esc(S.base)+')<input data-ch="limit" inputmode="decimal" value="'+esc(S.limit||'')+'"></label>'
    +CATS.exp.map(function(c){return '<label>'+esc(t(c))+'<input data-ch="budget" data-v="'+c+'" inputmode="decimal" value="'+esc(S.budgets[c]||'')+'"></label>';}).join('')+'</section>';
  var allc=CATS.exp.concat(CATS.inc).map(function(c){return [c,t(c)];});
  h+='<section class="card"><h2>'+esc(t('recurring'))+'</h2>'+(S.rec.length?S.rec.map(function(r){return '<div class="top"><span>'+esc(r.name)+' · '+fmt(r.amt)+' · '+r.day+'</span><button class="danger" data-act="rec_del" data-id="'+r.id+'">'+esc(t('del'))+'</button></div>';}).join(''):'<p class="muted">'+esc(t('empty_rec'))+'</p>')
    +'<div class="row2"><label>'+esc(t('name'))+'<input id="rn"></label><label>'+esc(t('amount'))+'<input id="ra" inputmode="decimal"></label></div><div class="row2"><label>'+esc(t('kind'))+sel('rk',[['exp',t('exp')],['inc',t('inc')]],'exp')+'</label><label>'+esc(t('category'))+sel('rc',allc,'other')+'</label></div>'
    +'<div class="row2"><label>'+esc(t('account'))+sel('rac',S.accounts.map(function(a){return [a.id,accName(a)];}),S.accounts[0].id)+'</label><label>'+esc(t('day_m'))+'<input id="rd" inputmode="numeric" value="1"></label></div><button data-act="rec_add">'+esc(t('add_rec'))+'</button></section>';
  h+='<section class="card"><h2>'+esc(t('goals'))+'</h2>'+(S.goals.length?S.goals.map(function(g){var p=g.target>0?Math.min(100,g.saved/g.target*100):0;return '<div><div class="top"><span>'+esc(g.name)+'</span><b>'+fmt(g.saved)+' / '+fmt(g.target)+'</b></div><div class="bar"><i style="width:'+p+'%"></i></div><div class="row2" style="margin-top:6px"><input id="gp'+g.id+'" inputmode="decimal" placeholder="'+esc(t('add_saved'))+'"><div class="row2"><button data-act="goal_plus" data-id="'+g.id+'">+</button><button class="danger" data-act="goal_del" data-id="'+g.id+'">'+esc(t('del'))+'</button></div></div></div>';}).join(''):'<p class="muted">'+esc(t('empty_goal'))+'</p>')
    +'<div class="row2"><label>'+esc(t('name'))+'<input id="gn"></label><label>'+esc(t('target'))+'<input id="gt" inputmode="decimal"></label></div><button data-act="goal_add">'+esc(t('add_goal'))+'</button></section>';
  h+='<section class="card"><h2>'+esc(t('rates'))+'</h2><p class="muted">'+esc(t('rates_hint'))+'</p>'+CURS.filter(function(c){return c!==S.base;}).map(function(c){return '<label>1 '+c+' = ? '+esc(S.base)+'<input data-ch="rate" data-v="'+c+'" inputmode="decimal" value="'+esc(S.rates[c]||'')+'"></label>';}).join('')+'</section>';
  h+='<section class="card"><h2>'+esc(t('rules'))+'</h2><p class="muted">'+esc(t('rules_hint'))+'</p><textarea data-ch="rules" rows="7">'+esc(S.rules)+'</textarea></section>';
  var base=location.href.split('?')[0].split('#')[0];
  h+='<section class="card"><h2>'+esc(t('shortcuts'))+'</h2><p class="muted">'+esc(t('sc_text'))+'</p><pre>'+esc(base+'?amt=350&note=Globus&method=apple_pay')+'</pre>'+(TG_LINK.indexOf('BOT_USERNAME')<0?'<p class="muted">'+esc(t('sc_tg'))+'</p><pre>'+esc(TG_LINK+'?startapp=qr-350')+'</pre>':'')+'<p class="muted">'+esc(t('sc_apple'))+'</p><p class="muted">'+esc(t('sc_sms'))+'</p><p class="muted">'+esc(t('sc_safari'))+'</p></section>';
  h+='<section class="card"><h2>'+esc(t('data'))+'</h2><div class="row2"><button class="pri" data-act="export">'+esc(t('export_json'))+'</button><label class="filebtn" style="flex-direction:row">'+'<input type="file" accept="application/json,.json" data-ch="file" aria-label="'+esc(t('import_json'))+'"></label></div>'
    +'<textarea id="imp" rows="3" placeholder="'+esc(t('paste_ph'))+'"></textarea><div class="row2"><button data-act="imp">'+esc(t('import_btn'))+'</button><button data-act="copycsv">'+esc(t('copy_csv'))+'</button></div><p class="muted" id="dmsg"></p>'+(TG?'<h2>'+esc(t('tg_cloud'))+'</h2><p class="muted">'+esc(t('tg_note'))+'</p><div class="row2"><button data-act="tg_save">'+esc(t('tg_save'))+'</button><button data-act="tg_load">'+esc(t('tg_load'))+'</button></div>':'')+'<button class="danger" data-act="wipe">'+esc(t('wipe'))+'</button></section>';
  h+='<section class="card"><h2>'+esc(t('about'))+'</h2><p class="muted">'+esc(t('privacy'))+'</p><p class="muted">'+esc(t('disclaimer'))+'</p></section>';return h;}

function modalHtml(){var x=S.tx.filter(function(y){return y.id===ui.modal;})[0];if(!x)return '';
  var cats=x.kind==='tr'?'':'<label>'+esc(t('category'))+sel('m_cat',CATS[x.kind==='inc'?'inc':'exp'].map(function(c){return [c,t(c)];}),x.cat)+'</label>';
  return '<div class="sheet" role="dialog" aria-modal="true"><h2>'+esc(t('edit'))+'</h2><label>'+esc(t('amount'))+'<input id="m_amt" inputmode="decimal" value="'+esc(x.amt)+'"></label>'+cats
   +'<label>'+esc(t('account'))+sel('m_acc',S.accounts.map(function(a){return [a.id,accName(a)];}),x.acc)+'</label><label>'+esc(t('note'))+'<input id="m_note" value="'+esc(x.note)+'"></label><label>'+esc(t('date'))+'<input id="m_ts" type="datetime-local" value="'+esc(x.ts.replace(' ','T'))+'"></label>'
   +'<div class="row2"><button class="pri" data-act="m_save">'+esc(t('save'))+'</button><button data-act="m_close">'+esc(t('cancel'))+'</button></div><button class="danger" data-act="m_del">'+esc(t('del'))+'</button></div>';}

function applyTheme(){var r=document.documentElement;var th=S.theme;if(th==='auto'&&TG&&TG.colorScheme)th=TG.colorScheme;if(th==='light'||th==='dark')r.setAttribute('data-theme',th);else r.removeAttribute('data-theme');r.lang=S.lang;document.title=t('app');}
function render(){applyTheme();var v={today:vToday,ops:vOps,rep:vRep,more:vMore}[ui.tab]();$('#view').innerHTML=v;$('#tabs').innerHTML=tabs();var m=$('#modal');if(ui.modal){m.hidden=false;m.innerHTML=modalHtml();}else if(ui.entry){var keep=m.hidden?0:(m.firstChild&&m.firstChild.scrollTop)||0;m.hidden=false;m.innerHTML='<div class="sheet'+(ui.anim?' in':'')+'" role="dialog" aria-modal="true" aria-label="'+esc(t('new_entry'))+'">'+entryCard()+'</div>';if(keep)m.firstChild.scrollTop=keep;}else{m.hidden=true;m.innerHTML='';}
  if(ui.modal&&ui.anim&&m.firstChild)m.firstChild.classList.add('in');ui.anim=false;}
var tt=null;
function toast(msg,undo){var el=$('#toast');el.innerHTML='<span>'+esc(msg)+'</span>'+(undo?'<button data-act="undo">'+esc(t('undo'))+'</button>':'');el.hidden=false;toast.undo=undo||null;clearTimeout(tt);tt=setTimeout(function(){el.hidden=true;},5000);}

function addEntry(){var e=ui.e,a=pnum(e.amt);
  if(!(a>0)){toast(t('need_amt'));return;}
  if(e.kind==='tr'&&e.acc===e.acc2){toast(t('need_acc2'));return;}
  var cat=e.kind==='tr'?'transfers':(e.cat||autoCat(e.note,e.kind));
  var x=addTx({kind:e.kind,amt:a,acc:e.acc,acc2:e.kind==='tr'?e.acc2:'',cat:cat,method:e.kind==='tr'?'transfer':e.method,note:e.note.trim()});
  if(!x){toast(t('dup'));return;}save();var keep={kind:e.kind,acc:e.acc,acc2:e.acc2,method:e.method};ui.e=newEntry();Object.assign(ui.e,keep);ui.y=+x.ts.slice(0,4);ui.m=+x.ts.slice(5,7)-1;ui.entry=false;render();
  toast(t('added')+': '+fmt(a)+' '+accCur(x.acc),function(){S.tx=S.tx.filter(function(y){return y.id!==x.id;});S.used[x.cat]=Math.max(0,(S.used[x.cat]||1)-1);save();render();});}

function runRecurring(){var n=new Date(),cy=n.getFullYear(),cm=n.getMonth(),changed=false;
  S.rec.forEach(function(r){var ly,lm;if(r.last){ly=+r.last.slice(0,4);lm=+r.last.slice(5,7)-1;}else{ly=cm===0?cy-1:cy;lm=cm===0?11:cm-1;}
    for(var guard=0;guard<24;guard++){var ny=lm===11?ly+1:ly,nm=lm===11?0:lm+1;if(ny>cy||(ny===cy&&nm>cm))break;if(ny===cy&&nm===cm&&n.getDate()<r.day)break;
      addTx({ts:ny+'-'+pad(nm+1)+'-'+pad(r.day)+' 08:00',kind:r.kind,amt:r.amt,acc:r.acc,cat:r.cat,method:'other',note:r.name,rec:r.id});ly=ny;lm=nm;r.last=ny+'-'+pad(nm+1);changed=true;}});
  if(changed)save();}

function parseLine(line){var p=line.split(/;|\t/);if(p.length<2)return null;var ts=p[0].trim().replace('T',' ').slice(0,16);if(!/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(ts))return null;
  var inc=/^\s*\+/.test(p[1]),a=pnum(String(p[1]).replace(/[^\d.,]/g,''));if(!(a>0))return null;var note=(p[3]||'').trim(),an=(p[4]||'').trim().toLowerCase();
  var acc=S.accounts.filter(function(x){return accName(x).toLowerCase()===an;})[0]||S.accounts[0];
  return {ts:ts,kind:inc?'inc':'exp',amt:a,acc:acc.id,cat:autoCat(note,inc?'inc':'exp'),method:(p[2]||'other').trim(),note:note};}
function importText(txt){var a=0,b=0,c=0;txt.split(/\r?\n/).forEach(function(l){l=l.trim();if(!l)return;var o=parseLine(l);if(!o){c++;return;}if(addTx(o))a++;else b++;});save();render();return t('imported').replace('{a}',a).replace('{b}',b).replace('{c}',c);}
function applyParams(q){var a=pnum(q.get('amt'));
  if(a>0){var kind=q.get('kind')==='inc'?'inc':'exp',note=(q.get('note')||'').trim(),an=(q.get('acc')||'').toLowerCase(),acc=S.accounts.filter(function(x){return accName(x).toLowerCase()===an||x.id===an;})[0]||S.accounts[0],m=q.get('method')||'other',cat=q.get('cat');
    if((kind==='exp'?CATS.exp:CATS.inc).indexOf(cat)<0)cat=autoCat(note,kind);var ts=(q.get('date')||'').replace('T',' ').slice(0,16);if(!/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(ts))ts=nowTs();
    var x=addTx({ts:ts,kind:kind,amt:a,acc:acc.id,cat:cat,method:METHODS.indexOf(m)>=0?m:'other',note:note});save();ui.y=+ts.slice(0,4);ui.m=+ts.slice(5,7)-1;
    setTimeout(function(){toast(x?t('added')+': '+fmt(a)+' '+acc.cur+(note?' · '+note:''):t('dup'),x?function(){S.tx=S.tx.filter(function(y){return y.id!==x.id;});save();render();}:null);},50);}}
function b64d(s){s=s.replace(/-/g,'+').replace(/_/g,'/');while(s.length%4)s+='=';try{return decodeURIComponent(escape(atob(s)));}catch(e){try{return atob(s);}catch(e2){return '';}}}
function parseStart(sp){var m=/^(qr|tr|ti)-(\d+(?:d\d{1,2})?)$/.exec(sp);
  if(m){var q=new URLSearchParams();q.set('amt',m[2].replace('d','.'));q.set('method',m[1]==='qr'?'qr':'transfer');q.set('note',m[1]==='qr'?'QR':'Перевод');if(m[1]==='ti')q.set('kind','inc');return q;}
  if(sp.indexOf('b_')===0){var s=b64d(sp.slice(2));if(s)return new URLSearchParams(s);}return null;}
function handleParams(){var q=new URLSearchParams(location.search);if(q.has('amt')){applyParams(q);try{history.replaceState(null,'',location.pathname);}catch(e){}}
  var sp=(TG&&TG.initDataUnsafe&&TG.initDataUnsafe.start_param)||'';if(sp){var q2=parseStart(sp);if(q2)applyParams(q2);}}
function cloudSet(k,v){return new Promise(function(res,rej){TG.CloudStorage.setItem(k,v,function(e){e?rej(e):res();});});}
function cloudGet(k){return new Promise(function(res,rej){TG.CloudStorage.getItem(k,function(e,v){e?rej(e):res(v);});});}

var A={
tab:function(b){ui.tab=b.dataset.v;ui.modal=null;render();window.scrollTo(0,0);},
prevm:function(){ui.m--;if(ui.m<0){ui.m=11;ui.y--;}render();},nextm:function(){ui.m++;if(ui.m>11){ui.m=0;ui.y++;}render();},
kind:function(b){ui.e.kind=b.dataset.v;ui.e.cat='';render();},
key:function(b){var k=b.dataset.v,s=ui.e.amt;if(k==='⌫')s=s.slice(0,-1);else if(k===','){if(s.indexOf(',')<0)s=(s||'0')+',';}else{var i=s.indexOf(',');if(i>=0&&s.length-i>2)return;if(s.replace(',','').length>=10)return;s=(s==='0'?'':s)+k;}ui.e.amt=s;var d=$('#amtDisp');if(d)d.textContent=s||'0';},
cat:function(b){ui.e.cat=ui.e.cat===b.dataset.v?'':b.dataset.v;render();},
open_entry:function(){ui.entry=true;ui.anim=true;ui.modal=null;render();},close_entry:function(){ui.entry=false;render();},
catgo:function(b){ui.fc=b.dataset.v;ui.fk='exp';ui.tab='ops';render();window.scrollTo(0,0);},fc_clear:function(){ui.fc='all';render();},
acc:function(b){ui.e.acc=b.dataset.v;render();},acc2:function(b){ui.e.acc2=b.dataset.v;render();},meth:function(b){ui.e.method=b.dataset.v;render();},
add:addEntry,
row:function(b){ui.modal=b.dataset.id;ui.anim=true;render();},m_close:function(){ui.modal=null;render();},
m_save:function(){var x=S.tx.filter(function(y){return y.id===ui.modal;})[0];if(!x)return;var a=pnum($('#m_amt').value);if(!(a>0)){toast(t('need_amt'));return;}
  x.amt=a;x.note=$('#m_note').value.trim();x.acc=$('#m_acc').value;var c=$('#m_cat');if(c)x.cat=c.value;var ts=$('#m_ts').value;if(ts)x.ts=ts.replace('T',' ').slice(0,16);save();ui.modal=null;render();},
m_del:function(b){if(ui.armed==='m'){S.tx=S.tx.filter(function(y){return y.id!==ui.modal;});ui.armed=null;ui.modal=null;save();render();}else{ui.armed='m';b.textContent=t('del_sure');setTimeout(function(){ui.armed=null;if(b.isConnected)b.textContent=t('del');},3000);}},
fk:function(b){ui.fk=b.dataset.v;render();},
acc_add:function(){var n=$('#an').value.trim();if(!n)return;S.accounts.push({id:uid(),name:n,cur:$('#ac').value,open:0});save();render();},
rec_add:function(){var n=$('#rn').value.trim(),a=pnum($('#ra').value),d=parseInt($('#rd').value,10);if(!n||!(a>0)||!(d>=1&&d<=28)){toast(t('need_amt'));return;}
  var py=ui.y,pm=ui.m;var nw=new Date(),cm=nw.getMonth(),cy=nw.getFullYear(),ly=cm===0?cy-1:cy,lm=cm===0?11:cm-1;
  S.rec.push({id:uid(),name:n,amt:a,kind:$('#rk').value,cat:$('#rc').value,acc:$('#rac').value,day:d,last:ly+'-'+pad(lm+1)});ui.y=py;ui.m=pm;runRecurring();save();render();},
rec_del:function(b){S.rec=S.rec.filter(function(r){return r.id!==b.dataset.id;});save();render();},
goal_add:function(){var n=$('#gn').value.trim(),tg=pnum($('#gt').value);if(!n||!(tg>0))return;S.goals.push({id:uid(),name:n,target:tg,saved:0});save();render();},
goal_plus:function(b){var v=pnum($('#gp'+b.dataset.id).value);if(!(v>0))return;S.goals.forEach(function(g){if(g.id===b.dataset.id)g.saved+=v;});save();render();},
goal_del:function(b){S.goals=S.goals.filter(function(g){return g.id!==b.dataset.id;});save();render();},
export:function(){var blob=new Blob([JSON.stringify(S,null,1)],{type:'application/json'}),a=document.createElement('a'),d=new Date();a.href=URL.createObjectURL(blob);a.download='tallyo-'+d.getFullYear()+pad(d.getMonth()+1)+pad(d.getDate())+'.json';document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.remove();},500);},
imp:function(){var el=$('#imp');var m=importText(el?el.value:'');var d=$('#dmsg');if(d)d.textContent=m;toast(m);},
copycsv:function(){var txt=S.tx.filter(function(x){return x.kind!=='tr';}).sort(function(a,b){return a.ts<b.ts?-1:1;}).map(function(x){return x.ts+';'+(x.kind==='inc'?'+':'-')+x.amt+';'+x.method+';'+(x.note||t(x.cat))+';'+accNameById(x.acc);}).join('\n');
  function fb(){var el=$('#imp');if(el){el.value=txt;el.select();}}
  if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(txt).then(function(){toast(t('copied'));},fb);else fb();},
wipe:function(b){if(ui.armed==='w'){S=defaults();S.lang=S.lang;ui.e=newEntry();ui.armed=null;save();render();}else{ui.armed='w';b.textContent=t('wipe_sure');setTimeout(function(){ui.armed=null;if(b.isConnected)b.textContent=t('wipe');},4000);}},
tg_save:function(){if(!TG||!TG.CloudStorage){toast(t('tg_failed'));return;}var str=JSON.stringify(S),n=Math.ceil(str.length/3500),p=Promise.resolve();if(n>900){toast(t('tg_failed'));return;}
  for(var i=0;i<n;i++)(function(i){p=p.then(function(){return cloudSet('bk_'+i,str.slice(i*3500,(i+1)*3500));});})(i);
  p.then(function(){return cloudSet('bk_n',String(n));}).then(function(){toast(t('tg_saved'));}).catch(function(){toast(t('tg_failed'));});},
tg_load:function(b){if(!TG||!TG.CloudStorage){toast(t('tg_failed'));return;}
  if(ui.armed!=='tl'){ui.armed='tl';b.textContent=t('tg_sure');setTimeout(function(){ui.armed=null;if(b.isConnected)b.textContent=t('tg_load');},4000);return;}ui.armed=null;
  cloudGet('bk_n').then(function(n){n=parseInt(n,10);if(!(n>0))throw 0;var ps=[];for(var i=0;i<n;i++)ps.push(cloudGet('bk_'+i));return Promise.all(ps);}).then(function(parts){var o=JSON.parse(parts.join(''));if(!o||!Array.isArray(o.tx)||!Array.isArray(o.accounts))throw 1;S=Object.assign(defaults(),o);ui.e=newEntry();save();render();toast(t('restored'));}).catch(function(e){toast(e===0?t('tg_none'):t('tg_failed'));});},
undo:function(){if(toast.undo){toast.undo();toast.undo=null;}$('#toast').hidden=true;}
};
var IN={note:function(el){ui.e.note=el.value;},q:function(el){ui.q=el.value;var l=$('#opsList');if(l)l.innerHTML=opsList();}};
var CH={
fa:function(el){ui.fa=el.value;render();},lang:function(el){S.lang=el.value;save();render();},theme:function(el){S.theme=el.value;save();render();},
accname:function(el){S.accounts.forEach(function(a){if(a.id===el.dataset.id){a.name=el.value.trim();if(a.name)a.cash=false;}});save();},
accopen:function(el){S.accounts.forEach(function(a){if(a.id===el.dataset.id)a.open=pnum(el.value)||0;});save();},
limit:function(el){S.limit=pnum(el.value)||0;save();},budget:function(el){var v=pnum(el.value);if(v>0)S.budgets[el.dataset.v]=v;else delete S.budgets[el.dataset.v];save();},
rate:function(el){S.rates[el.dataset.v]=pnum(el.value)||0;save();},rules:function(el){S.rules=el.value;save();},
file:function(el){var f=el.files&&el.files[0];if(!f)return;var r=new FileReader();r.onload=function(){try{var o=JSON.parse(r.result);if(!o||!Array.isArray(o.tx)||!Array.isArray(o.accounts))throw 0;S=Object.assign(defaults(),o);ui.e=newEntry();save();render();toast(t('restored'));}catch(e){toast(t('bad_file'));}};r.onerror=function(){toast(t('bad_file'));};r.readAsText(f);}
};
document.addEventListener('click',function(e){var b=e.target.closest('[data-act]');if(!b)return;var a=b.dataset.act;if(A[a])A[a](b,e);});
document.addEventListener('keydown',function(e){if((e.key==='Enter'||e.key===' ')&&e.target.matches&&e.target.matches('.tx[data-act]')){e.preventDefault();e.target.click();}if(e.key==='Escape'&&(ui.modal||ui.entry)){ui.modal=null;ui.entry=false;render();}});
document.addEventListener('input',function(e){var d=e.target.dataset;if(d&&d.in&&IN[d.in])IN[d.in](e.target,e);});
document.addEventListener('change',function(e){var d=e.target.dataset;if(d&&d.ch&&CH[d.ch])CH[d.ch](e.target,e);});
$('#modal').addEventListener('click',function(e){if(e.target===this){ui.modal=null;ui.entry=false;render();}});

runRecurring();handleParams();render();
if('serviceWorker' in navigator&&/^https?:$/.test(location.protocol)){window.addEventListener('load',function(){navigator.serviceWorker.register('sw.js').catch(function(){});});}
})();
