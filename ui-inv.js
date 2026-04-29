// ui-inv.js — инвентарь и акты
// Зависимости: utils.js

function renderInv(){
  const el=document.getElementById('tab-inv');if(!el)return;
  if(!G.inv.length){el.innerHTML='<div class="dim" style="text-align:center;padding:14px;font-style:italic">Склад пуст</div>';return;}
  const ns=G.inv.filter(x=>x.quality==='normal');
  const ms=G.inv.filter(x=>x.quality==='magic');
  const rs=G.inv.filter(x=>x.quality==='rare');
  const us=G.inv.filter(x=>x.quality==='unique');
  const hasSell=ns.length||ms.length||rs.length||us.length;
  let html=hasSell?'<div style="display:flex;gap:4px;margin-bottom:6px;flex-wrap:wrap">':'';
  if(ns.length)html+='<button class="btn btn-sm" style="flex:1;min-width:80px;border-color:var(--brd);color:var(--txt)" id="btn-sell-all">Обычные: '+ns.length+' шт – '+ns.reduce((s,x)=>s+(parseInt(x.sellPrice)||0),0)+gi(16)+'</button>';
  if(ms.length)html+='<button class="btn btn-sm btn-p" style="flex:1;min-width:80px" id="btn-sell-magic">Волшебные: '+ms.length+' шт – '+ms.reduce((s,x)=>s+(parseInt(x.sellPrice)||0),0)+gi(16)+'</button>';
  if(rs.length)html+='<button class="btn btn-sm" style="flex:1;min-width:80px;border-color:var(--gold);color:var(--gold)" id="btn-sell-rare">Редкие: '+rs.length+' шт – '+rs.reduce((s,x)=>s+(parseInt(x.sellPrice)||0),0)+gi(16)+'</button>';
  if(us.length)html+='<button class="btn btn-sm" style="flex:1;min-width:80px;border-color:#e87020;color:#e87020;position:relative;overflow:hidden;user-select:none" id="btn-sell-unique">💠 Уники: '+us.length+' шт – '+us.reduce((s,x)=>s+(parseInt(x.sellPrice)||0),0)+gi(16)+'<span id="btn-sell-unique-bar" style="position:absolute;left:0;top:0;height:100%;width:0%;background:#e8702044;transition:none;pointer-events:none"></span></button>';
  if(hasSell)html+='</div>';
  html+='<div class="igrid">'+
    G.inv.map(it=>'<div class="iico '+it.quality[0]+'" style="border-color:'+qcol(it.quality)+'77" data-iid="'+it.id+'" data-tip="'+it.id+'">'+itemIcon(it.em,'full')+
      '<span class="isp" style="font-size:13px;color:'+qcol(it.quality)+'">'+it.sellPrice+gi(16)+'</span></div>').join('')+
    '</div>';
  el.innerHTML=html;updateRes();
  // Кнопка продажи редких: зажать 1с для подтверждения
  const _rBtn=document.getElementById('btn-sell-rare');
  if(_rBtn){
    let _rTimer=null,_rStart=0;
    const _rBar=document.createElement('span');
    _rBar.style.cssText='position:absolute;left:0;top:0;height:100%;width:0%;background:#f0d06044;transition:none;pointer-events:none';
    _rBtn.style.position='relative';_rBtn.style.overflow='hidden';_rBtn.style.userSelect='none';
    _rBtn.appendChild(_rBar);
    const _rDur=1000;
    const _rCancel=()=>{
      if(_rTimer){cancelAnimationFrame(_rTimer);_rTimer=null;}
      _rBar.style.width='0%';
    };
    const _rTick=()=>{
      const pct=Math.min(100,(Date.now()-_rStart)/_rDur*100);
      _rBar.style.width=pct+'%';
      if(pct>=100){
        _rTimer=null;
        const rs2=G.inv.filter(x=>x.quality==='rare');
        if(!rs2.length){showN('Нет редких!');return;}
        const tot=rs2.reduce((s,x)=>s+(parseInt(x.sellPrice)||0),0);
        G.inv=G.inv.filter(x=>x.quality!=='rare');
        G.gold+=tot;G.stats.sg+=tot;G.stats.sold+=rs2.length;
        rs2.forEach(it=>checkContractSell(it.quality,parseInt(it.sellPrice)||0));
        log(gi(16)+' Продано '+rs2.length+'x редких +'+tot+gi(16),'ge');floatT('+'+tot+gi(16),'#f0d060');
        checkAchs();renderInv();updateRes();
        return;
      }
      _rTimer=requestAnimationFrame(_rTick);
    };
    _rBtn.addEventListener('mousedown',()=>{_rStart=Date.now();_rBar.style.width='0%';_rTimer=requestAnimationFrame(_rTick);});
    _rBtn.addEventListener('mouseup',_rCancel);
    _rBtn.addEventListener('mouseleave',_rCancel);
    _rBtn.addEventListener('touchstart',(e)=>{e.preventDefault();_rStart=Date.now();_rBar.style.width='0%';_rTimer=requestAnimationFrame(_rTick);},{passive:false});
    _rBtn.addEventListener('touchend',_rCancel);
  }
  // Кнопка продажи уников: зажать 1.5с для подтверждения
  const _uBtn=document.getElementById('btn-sell-unique');
  if(_uBtn){
    let _uTimer=null,_uStart=0;
    const _uBar=document.getElementById('btn-sell-unique-bar');
    const _uDur=1500;
    const _uCancel=()=>{
      if(_uTimer){cancelAnimationFrame(_uTimer);_uTimer=null;}
      if(_uBar){_uBar.style.transition='none';_uBar.style.width='0%';}
    };
    const _uTick=()=>{
      const pct=Math.min(100,(Date.now()-_uStart)/_uDur*100);
      if(_uBar)_uBar.style.width=pct+'%';
      if(pct>=100){
        _uTimer=null;
        const us2=G.inv.filter(x=>x.quality==='unique');
        if(!us2.length){showN('Нет уников!');return;}
        const tot=us2.reduce((s,x)=>s+(parseInt(x.sellPrice)||0),0);
        G.inv=G.inv.filter(x=>x.quality!=='unique');
        G.gold+=tot;G.stats.sg+=tot;G.stats.sold+=us2.length;
        us2.forEach(it=>checkContractSell(it.quality,parseInt(it.sellPrice)||0));
        log(gi(16)+' Продано '+us2.length+'x уников +'+tot+gi(16),'ge');floatT('+'+tot+gi(16),'#e87020');
        checkAchs();renderInv();updateRes();
        return;
      }
      _uTimer=requestAnimationFrame(_uTick);
    };
    _uBtn.addEventListener('mousedown',()=>{_uStart=Date.now();if(_uBar){_uBar.style.transition='none';_uBar.style.width='0%';}_uTimer=requestAnimationFrame(_uTick);});
    _uBtn.addEventListener('mouseup',_uCancel);
    _uBtn.addEventListener('mouseleave',_uCancel);
    _uBtn.addEventListener('touchstart',(e)=>{e.preventDefault();_uStart=Date.now();if(_uBar){_uBar.style.width='0%';}_uTimer=requestAnimationFrame(_uTick);},{passive:false});
    _uBtn.addEventListener('touchend',_uCancel);
  }
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