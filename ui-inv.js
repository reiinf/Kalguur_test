// ui-inv.js — инвентарь и акты
// Зависимости: utils.js

function renderInv(){
  const el=document.getElementById('tab-inv');if(!el)return;
  if(!G.inv.length){el.innerHTML='<div class="dim" style="text-align:center;padding:14px;font-style:italic">Склад пуст</div>';return;}
  const ns=G.inv.filter(x=>x.quality==='normal');
  const ms=G.inv.filter(x=>x.quality==='magic');
  const rs=G.inv.filter(x=>x.quality==='rare');
  const hasSell=ns.length||ms.length||rs.length;
  let html=hasSell?'<div style="display:flex;gap:4px;margin-bottom:6px;flex-wrap:wrap">':'';
  if(ns.length)html+='<button class="btn btn-sm" style="flex:1;min-width:80px;border-color:var(--brd);color:var(--txt)" id="btn-sell-all">Обычные: '+ns.length+' шт – '+ns.reduce((s,x)=>s+(parseInt(x.sellPrice)||0),0)+gi(16)+'</button>';
  if(ms.length)html+='<button class="btn btn-sm btn-p" style="flex:1;min-width:80px" id="btn-sell-magic">Волшебные: '+ms.length+' шт – '+ms.reduce((s,x)=>s+(parseInt(x.sellPrice)||0),0)+gi(16)+'</button>';
  if(rs.length)html+='<button class="btn btn-sm" style="flex:1;min-width:80px;border-color:var(--gold);color:var(--gold)" id="btn-sell-rare">Редкие: '+rs.length+' шт – '+rs.reduce((s,x)=>s+(parseInt(x.sellPrice)||0),0)+gi(16)+'</button>';
  if(hasSell)html+='</div>';
  html+='<div class="igrid">'+
    G.inv.map(it=>'<div class="iico '+it.quality[0]+'" style="border-color:'+qcol(it.quality)+'77" data-iid="'+it.id+'" data-tip="'+it.id+'">'+itemIcon(it.em,'full')+
      '<span class="isp" style="font-size:13px;color:'+qcol(it.quality)+'">'+it.sellPrice+gi(16)+'</span></div>').join('')+
    '</div>';
  el.innerHTML=html;updateRes();
}

function renderActs(){
  const _actsEl=document.getElementById('acts-area')||document.getElementById('tab-acts');if(!_actsEl)return;_actsEl.innerHTML=
    '<div class="dim" style="font-size:13px;margin-bottom:7px">🏕 Пройдите акты чтобы <b style="color:var(--gold)">набрать уровни</b> перед картами!<br>Каждый акт даёт опыт и немного золота.</div>'+
    ACTS.map(a=>{
      const _isRunning=G.actRun&&G.actRun.act.id===a.id;
      const _pct=_isRunning?Math.min(100,Math.floor(G.actRun.elapsed/(G.actRun.act.time*1000)*100)):0;
      return '<div class="act-card"><span style="font-size:18px">'+a.em+'</span>'+
        '<div style="flex:1"><div style="font-size:14px;color:var(--txt-b)">'+a.nm+'</div>'+
        '<div class="tiny">'+gi(16)+a.g[0]+'–'+a.g[1]+' · ⏱'+a.time+'с</div>'+
        '<div class="act-pg"><div class="act-pgf" id="apf-'+a.id+'" style="width:'+_pct+'%"></div></div>'+
        '<div style="font-size:12px" id="apct-'+a.id+'"></div></div>'+
        '<button class="btn btn-sm btn-g" id="abtn-'+a.id+'" data-act="'+a.id+'">▶ Идти</button></div>';
    }).join('');
}

