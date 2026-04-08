// ui-journal.js — журнал, уведомления, тултипы
// Зависимости: utils.js

function showTip(e,id){
  const all=[...G.inv,...Object.values(G.selfEq),...G.workers.flatMap(w=>Object.values(w.eq))].filter(Boolean);
  const item=all.find(x=>x&&x.id===id);if(!item)return;
  const c=qcol(item.quality);
  document.getElementById('tt').innerHTML=
    '<div class="tt-nm" style="color:'+c+'">'+itemIcon(item.em,20)+' '+item.name+'</div>'+
    '<div class="tt-ty">'+qlbl(item.quality).toUpperCase()+' · Т'+item.tier+' · '+slotNm(item.slot,12)+'</div>'+
    item.mods.map(m=>{const _cn=(item.slot==='cluster')?CLUSTER_STATS.find(x=>x.stat===m.stat):null;return '<div class="tt-st">+ '+m.value+(_cn?' % '+_cn.nm:' '+(STATNM[m.stat]||m.stat))+'</div>';}).join('')+
    (item.slot==='cluster'?'<hr class="tt-dv"><div class="tt-sm" style="color:#cc88ff">Кластерный самоцвет — % бонусы к вашим статам</div>':'<hr class="tt-dv"><div class="tt-sm">Дикарь: ⚔️'+iDmg(item,'warrior')+' 🛡'+iSurv(item,'warrior')+'<br>Ведьма: ⚔️'+iDmg(item,'mage')+' 🛡'+iSurv(item,'mage')+'<br>Охотница: ⚔️'+iDmg(item,'ranger')+' 🛡'+iSurv(item,'ranger')+'</div>')+
    '<div class="tt-sv">'+gi(16)+' Продажа: '+item.sellPrice+gi(16)+'</div>';
  const tt=document.getElementById('tt');tt.style.display='block';
  let x=e.clientX+14,y=e.clientY+14;
  if(x+270>window.innerWidth)x=e.clientX-270;
  if(y+tt.offsetHeight>window.innerHeight)y=e.clientY-tt.offsetHeight-8;
  tt.style.left=x+'px';tt.style.top=y+'px';
}
function hideTip(){const t=document.getElementById('tt');if(t)t.style.display='none';}
function showTextTip(e,html){
  const tt=document.getElementById('tt');if(!tt)return;
  tt.innerHTML=html;tt.style.display='block';
  let x=e.clientX+14,y=e.clientY+14;
  if(x+270>window.innerWidth)x=e.clientX-270;
  if(y+tt.offsetHeight>window.innerHeight)y=e.clientY-tt.offsetHeight-8;
  tt.style.left=x+'px';tt.style.top=y+'px';
}

// ══════════ NOTIFS & LOG ══════════════════════════════════════
function showN(msg,type){
  const na=document.getElementById('notif-area');if(!na)return;
  const el=document.createElement('div');el.className='notif'+(type?' '+type:'');el.innerHTML=msg;
  na.appendChild(el);setTimeout(()=>el.remove(),3200);
}
function log(msg,cls){
  const now=new Date();const t=now.getHours().toString().padStart(2,'0')+':'+now.getMinutes().toString().padStart(2,'0');
  const html='<span class="lt">['+t+']</span>'+msg;
  const cls2='le '+(cls||'');
  // Оригинальный журнал (fallback)
  const el=document.getElementById('loot-log');
  if(el){const d=document.createElement('div');d.className=cls2;d.innerHTML=html;el.prepend(d);while(el.children.length>120)el.removeChild(el.lastChild);}
  // Редизайн
  const elr=document.getElementById('loot-log-redesign');
  if(elr){const d=document.createElement('div');d.className=cls2;d.innerHTML=html;elr.prepend(d);const w=elr.closest('.scroll-static-content');if(w)w.scrollTop=0;while(elr.children.length>120)elr.removeChild(elr.lastChild);}
}
function initJournal(){
  const fl=document.getElementById('journal-fade-layer');
  if(fl)fl.style.backgroundImage="url('https://raw.githubusercontent.com/reiinf/Kalguur/main/images/leather.png')";
  const img=document.getElementById('scroll-static-img');
  const sb=document.getElementById('journal-scroll-block');
  const ol=document.getElementById('loot-log');
  if(!img||!sb)return;
  let done=false;
  function fallback(){if(done)return;done=true;sb.style.display='none';if(ol)ol.style.display='';}
  const timer=setTimeout(fallback,5000);
  img.onerror=()=>{clearTimeout(timer);fallback();};
  img.onload=()=>{clearTimeout(timer);done=true;};
  img.src='https://raw.githubusercontent.com/reiinf/Kalguur/main/images/scroll.png';
}
function floatT(txt,color){
  const el=document.createElement('div');el.className='fl';
  el.style.cssText='color:'+color+';left:'+(Math.random()*160+window.innerWidth/2-80)+'px;top:'+(window.innerHeight*.4)+'px';
  el.innerHTML=txt;document.body.appendChild(el);setTimeout(()=>el.remove(),1300);
}

// ══════════ SAVE / LOAD ═══════════════════════════════════════

