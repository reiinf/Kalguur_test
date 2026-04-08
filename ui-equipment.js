// ui-equipment.js — снаряжение и модалы
// Зависимости: mechanics.js, utils.js

function openM(title,html){
  const mbd=document.getElementById('mbd');
  if(mbd&&mbd._legacyHandler){mbd.removeEventListener('click',mbd._legacyHandler);mbd._legacyHandler=null;}
  document.getElementById('mtl').innerHTML=title;
  mbd.innerHTML=html;
  document.getElementById('moverlay').classList.add('on');
}
function closeM(){document.getElementById('moverlay').classList.remove('on');}

function openBigPortrait(wid){
  const w=G.workers.find(x=>x.id===wid);
  if(!w)return;
  const c=WCLS[w.cls]||{};
  const bigUrl=c.portBig||'';
  const title=c.em+' '+w.name+(w.isNamed?' <span style="font-size:11px;color:#e87020">[ЛЕГЕНДА]</span>':'');
  const html=bigUrl
    ?'<img src="'+bigUrl+'" alt="" style="width:100%;max-height:65vh;object-fit:contain;background:var(--bg0);display:block">'
    +'<div style="text-align:center;padding:10px;font-size:12px;color:var(--txt-d)">'+c.nm.toUpperCase()+'</div>'
    :'<div style="padding:30px;text-align:center;color:var(--txt-d)">Арт недоступен</div>';
  openM(title, html);
}

function openSelfBigPortrait(){
  const cls=G.selfCls||'warrior';
  const c=WCLS[cls]||{};
  const bigUrl=c.portBig||'';
  const title=c.em+' Изгнанник — '+c.nm;
  const html=bigUrl
    ?'<img src="'+bigUrl+'" alt="" style="width:100%;max-height:65vh;object-fit:contain;background:var(--bg0);display:block">'
    +'<div style="text-align:center;padding:10px;font-size:12px;color:var(--txt-d)">'+c.nm.toUpperCase()+'</div>'
    :'<div style="padding:30px;text-align:center;color:var(--txt-d)">Арт недоступен</div>';
  openM(title, html);
}

function openHire(){
  if(!canHireWorkers()){showN('🗡️ Синдикат: работники недоступны!');return;}
  const cost=80+G.workers.length*60;
  let html='<div class="dim" style="margin-bottom:8px;font-size:14px">Стоимость: <span class="gt">'+cost+gi(16)+'</span></div>';
  Object.entries(WCLS).filter(([cls])=>cls!=='noble').forEach(([cls,c])=>{
    html+='<div class="srow" style="margin-bottom:4px">'+
      wPortrait(cls, c.col, c.em, '')+
      '<div class="si"><div class="snm">'+c.nm+'</div><div class="sds">'+c.desc+'</div></div>'+
      '<button class="btn btn-sm" data-hire="'+cls+'">Нанять</button></div>';
  });
  html+='<button class="btn btn-r btn-sm" id="btn-close-m" style="margin-top:6px">Отмена</button>';
  openM('Нанять работника',html);
}
function wPortrait(cls, col, em, clickHandler){
  const c=WCLS[cls]||{};
  const frameColor=col||c.col||'var(--gold-d)';
  const icon=em||c.em||'?';
  const portUrl=c.port||'';
  const onclick=clickHandler?(' onclick="'+clickHandler+'"'):'';
  return '<div class="portrait-frame"'+onclick+' style="background:linear-gradient(145deg,'+frameColor+'99,'+frameColor+'44,'+frameColor+'99)">'+
    '<div class="portrait-inner">'+
    (portUrl?'<img src="'+portUrl+'" alt="" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'\'">':'')+
    '<span style="font-size:22px;'+(portUrl?'display:none':'')+'">'+icon+'</span>'+
    '</div></div>';
}

function hireWorker(cls){
  const cost=80+G.workers.length*60;
  if(G.gold<cost){showN('Мало золота! Нужно '+cost+gi(16));return;}
  G.gold-=cost;
  const name=randName(cls);
  const w={id:++G.wid,name,cls,status:'idle',curMap:1,cursed:false,uniq:false,elapsed:0,prog:0,runsCompleted:0,
    capturedAt:0,injuredAt:0,xp:0,level:0,expTiers:[],expIdx:0,
    eq:{weapon:null,armor:null,helmet:null,ring:null},dmg:5,surv:5};
  recalcW(w);G.workers.push(w);
  log('👤 Нанят: '+name+' ('+WCLS[cls].nm+')','info');
  checkAchs();closeM();renderWorkers();updateRes();
}

function workerBestInSlot(id){
  const w=G.workers.find(x=>x.id===id);if(!w)return;
  let changed=0;
  SLOTS.forEach(sl=>{
    if(sl==='cluster')return; // кластер только для ГГ
    const candidates=G.inv.filter(x=>x.slot===sl&&x.quality!=='unique');
    if(!candidates.length)return;
    const cur=w.eq[sl];
    const curVal=cur?(iDmg(cur,w.cls)+iSurv(cur,w.cls)):0;
    const best=candidates.reduce((a,b)=>(iDmg(b,w.cls)+iSurv(b,w.cls))>(iDmg(a,w.cls)+iSurv(a,w.cls))?b:a);
    const bestVal=iDmg(best,w.cls)+iSurv(best,w.cls);
    if(bestVal>curVal){
      if(cur)G.inv.push(cur);
      w.eq[sl]=best;
      G.inv=G.inv.filter(x=>x.id!==best.id);
      changed++;
    }
  });
  recalcW(w);
  if(changed)log('⚡ '+w.name+' — одето '+changed+' предм. (лучшее по классу)','info');
  else showN('Лучшего снаряжения нет в инвентаре');
  save();renderInv();renderWorkers();renderMaps();openWorkerEq(id);
}
function openWorkerEq(id){
  const w=G.workers.find(x=>x.id===id);if(!w)return;
  const xpnm=w.level<WLVLS.length-1?((WLVLS[w.level+1]-w.xp)+' XP до Ур.'+(w.level+1)):'Макс.';
  const selTier=G.selMap?(String(G.selMap).startsWith('c')||String(G.selMap).startsWith('u')?parseInt(String(G.selMap).slice(1)):parseInt(String(G.selMap))):null;
  const ch=selTier?calcCh(w.dmg+w.surv,selTier):null;
  const ch2=ch?delModCh(ch):null;
  // Named worker bonus block
  const namedBlock=w.isNamed&&w.bonus?(
    '<div style="background:rgba(80,40,0,.3);border:1px solid #e87020;border-radius:5px;padding:7px 10px;margin-bottom:8px">'+
    '<div style="font-size:12px;color:#e87020;font-family:Cinzel,serif;margin-bottom:4px">[ЛЕГЕНДА] Бонусы</div>'+
    (w.bonus.guardianExpChance?'<div style="font-size:13px;color:#ffcc88">🔷 +'+Math.round(w.bonus.guardianExpChance*100)+'% шанс дропа ключа стража в экспедиции</div>':'')+
    (w.bonus.itemDropBonus?'<div style="font-size:13px;color:#ffcc88">📦 +'+Math.round(w.bonus.itemDropBonus*100)+'% шанс предметов в экспедиции</div>':'')+
    '</div>'
  ):'';
  let html=namedBlock+'<div style="display:flex;gap:10px;margin-bottom:8px;flex-wrap:wrap;font-size:14px">'+
    '<div>⚔️<span class="gt">'+w.dmg+'</span></div><div>🛡<span style="color:var(--grn)">'+w.surv+'</span></div>'+
    '<div>⭐Ур.'+w.level+': <span style="color:var(--mag)">'+xpnm+'</span></div>'+
    (ch2?'<div>Шанс: <span style="color:'+chcol(ch2)+'">'+Math.round(ch2*100)+'%</span></div>':'')+
    '</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;margin-bottom:8px">';
  SLOTS.forEach(sl=>{
    const eq=w.eq[sl];
    html+='<div class="eqsl '+(eq?'filled':'')+'" data-pick-w="'+id+'" data-pick-sl="'+sl+'">'+
      '<span class="eqlbl">'+slotNm(sl,16)+'</span>'+
      (eq?'<span style="color:'+qcol(eq.quality)+';font-size:16px">'+itemIcon(eq.em,17)+' '+eq.name+'</span>'+
          '<span style="font-size:14px;color:var(--txt-d)">⚔️+'+iDmg(eq,w.cls)+' 🛡+'+iSurv(eq,w.cls)+'</span>':
       '<span class="dim" style="font-size:12px">Пусто</span>')+
    '</div>';
  });
  html+='</div><div style="display:flex;gap:6px;margin-bottom:6px"><button class="btn btn-sm" style="flex:1" data-worker-bis="'+id+'">⚡ Одеть в лучшее</button><button class="btn btn-r btn-sm" id="btn-close-m">Закрыть</button></div>';
  openM(WCLS[w.cls].em+' '+w.name,html);
}
function openSelfEq(){
  const cls=G.selfCls||'warrior';const d=sDmg(),s=sSurv();
  let html='<div style="display:flex;gap:10px;margin-bottom:8px;font-size:14px">'+
    '<div>⚔️<span class="gt">'+d+'</span></div>'+
    '<div>🛡<span style="color:var(--grn)">'+s+'</span></div></div>'+
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;margin-bottom:8px">';
  const selfSlots=G.syndExtraWeapon?['weapon','weapon2','armor','helmet','ring','cluster']:[...SLOTS];
  if(G._clusterSlot2&&!selfSlots.includes('cluster2'))selfSlots.push('cluster2');
  selfSlots.forEach(sl=>{
    const eq=G.selfEq[sl];
    html+='<div class="eqsl '+(eq?'filled':'')+'" data-pick-w="0" data-pick-sl="'+sl+'">'+
      '<span class="eqlbl">'+slotNm(sl,16)+'</span>'+
      (eq?'<span style="color:'+qcol(eq.quality)+';font-size:16px">'+itemIcon(eq.em,17)+' '+eq.name+'</span>'+
          (eq.slot==='cluster'?'<span style="font-size:14px;color:#cc88ff">'+(eq.mods||[]).map(m=>{const _cs=CLUSTER_STATS.find(x=>x.stat===m.stat);return '+'+m.value+'% '+(_cs?_cs.nm:'?');}).join(' · ')+'</span>':'<span style="font-size:14px;color:var(--txt-d)">⚔️+'+iDmg(eq,cls)+' 🛡+'+iSurv(eq,cls)+'</span>'):
       '<span class="dim" style="font-size:12px">Пусто</span>')+
    '</div>';
  });
  html+='</div><button class="btn btn-r btn-sm" id="btn-close-m">Закрыть</button>';
  openM('🧙 Ваше снаряжение',html);
}
function openSlotPick(ownerId,slot,isWorker){
  const cls=isWorker?(G.workers.find(x=>x.id===ownerId)||{cls:'warrior'}).cls:(G.selfCls||'warrior');
  const owner=isWorker?G.workers.find(x=>x.id===ownerId):null;
  const cur=isWorker?(owner?owner.eq[slot]:null):G.selfEq[slot];
  const slotFilter=slot==='weapon2'?'weapon':slot==='cluster2'?'cluster':slot;const compat=G.inv.filter(it=>it.slot===slotFilter);
  let html='';
  if(cur){
    html+='<div class="srow" style="border-color:'+qcol(cur.quality)+'44;margin-bottom:6px">'+
      itemIcon(cur.em,22)+
      '<div class="si"><div style="color:'+qcol(cur.quality)+';font-size:16px">'+cur.name+'</div>'+
      '<div style="font-size:14px;color:var(--txt-d)">⚔️'+iDmg(cur,cls)+' 🛡'+iSurv(cur,cls)+' · '+cur.sellPrice+gi(16)+'</div></div>'+
      '<button class="btn btn-sm btn-r" data-uneq-slot="'+slot+'" data-uneq-owner="'+ownerId+'" data-uneq-isw="'+(isWorker?1:0)+'">Снять</button></div>';
  }
  if(!compat.length){html+='<div class="dim" style="padding:8px;font-style:italic">Нет подходящих предметов</div>';}
  else{
    html+=compat.map(it=>{
      const _isClu=it.slot==='cluster';const dv=_isClu?0:iDmg(it,cls),sv=_isClu?0:iSurv(it,cls),cd=(!_isClu&&cur)?iDmg(cur,cls):0,cs=(!_isClu&&cur)?iSurv(cur,cls):0;
      const dd=dv-cd,ds=sv-cs;
      const dds=dd>0?'<span style="color:var(--grn)">+'+dd+'</span>':dd<0?'<span style="color:var(--red)">'+dd+'</span>':'<span class="dim">±0</span>';
      const dss=ds>0?'<span style="color:var(--grn)">+'+ds+'</span>':ds<0?'<span style="color:var(--red)">'+ds+'</span>':'<span class="dim">±0</span>';
      const co=qcol(it.quality);
      return '<div class="srow" style="cursor:pointer;border-color:'+co+'33" '+
        'data-equip-item="'+it.id+'" data-equip-slot="'+slot+'" data-equip-owner="'+ownerId+'" data-equip-isw="'+(isWorker?1:0)+'" data-tip="'+it.id+'">'+
        itemIcon(it.em,22)+
        '<div class="si"><div style="color:'+co+';font-size:16px">'+it.name+'</div>'+
        (_isClu?'<div style="font-size:14px;color:#cc88ff">'+(it.mods||[]).map(m=>{const _cs=CLUSTER_STATS.find(x=>x.stat===m.stat);return '+'+m.value+'% '+(_cs?_cs.nm:'?');}).join(' · ')+'</div>':'<div style="font-size:14px;color:var(--txt-d)">⚔️'+dv+'('+dds+') 🛡'+sv+'('+dss+') · '+it.sellPrice+gi(16)+'</div>')+'</div>'+
        '<button class="btn btn-sm">Надеть</button></div>';
    }).join('');
  }
  html+='<div style="margin-top:7px"><button class="btn btn-sm btn-r" data-back-eq="'+ownerId+'" data-back-isw="'+(isWorker?1:0)+'">← Назад</button></div>';
  openM('Выбрать: '+slotNm(slot,14),html);
}
function doEquip(ownerId,slot,itemId,isWorker){
  const item=G.inv.find(x=>x.id===itemId);if(!item)return;
  if(isWorker){
    const w=G.workers.find(x=>x.id===ownerId);if(!w)return;
    if(w.eq[slot])G.inv.push(w.eq[slot]);w.eq[slot]=item;G.inv=G.inv.filter(x=>x.id!==itemId);
    recalcW(w);log('✅ '+w.name+' надел '+item.em+' '+item.name,'info');openWorkerEq(ownerId);
  }else{
    if(G.selfEq[slot])G.inv.push(G.selfEq[slot]);G.selfEq[slot]=item;G.inv=G.inv.filter(x=>x.id!==itemId);
    log('✅ Вы надели '+item.em+' '+item.name,'info');openSelfEq();updateSelfStats();if(G.selMap){const _m=getMd(G.selMap);const _s=String(G.selMap);if(_m)updateRunVis(_m,true,_s.startsWith('grd_'),_s.startsWith('boss_'));}if(G.deliriumWave===0&&!G.deliriumRunning)renderDelirium();renderContracts();renderContracts();
  }
  renderInv();renderWorkers();renderMaps();updateSelfStats();checkAchs();
}
function doUnequip(ownerId,slot,isWorker){
  if(isWorker){
    const w=G.workers.find(x=>x.id===ownerId);if(!w||!w.eq[slot])return;
    G.inv.push(w.eq[slot]);w.eq[slot]=null;recalcW(w);openWorkerEq(ownerId);
  }else{
    if(!G.selfEq[slot])return;G.inv.push(G.selfEq[slot]);G.selfEq[slot]=null;openSelfEq();updateSelfStats();if(G.selMap){const _m=getMd(G.selMap);const _s=String(G.selMap);if(_m)updateRunVis(_m,true,_s.startsWith('grd_'),_s.startsWith('boss_'));}if(G.deliriumWave===0&&!G.deliriumRunning)renderDelirium();renderContracts();renderContracts();
  }
  renderInv();renderWorkers();renderMaps();updateSelfStats();
}
function openItemM(id){
  const it=G.inv.find(x=>x.id===id);if(!it)return;
  openM(itemIcon(it.em,18)+' '+it.name,
    '<div class="tiny" style="margin-bottom:6px">'+qlbl(it.quality).toUpperCase()+' · Тира '+it.tier+' · '+slotNm(it.slot,12)+'</div>'+
    it.mods.map(m=>'<div style="color:var(--mag);padding:2px 0;font-size:15px">+ '+m.value+' '+STATNM[m.stat]+'</div>').join('')+
    '<hr class="sep"><div style="font-size:14px;margin-bottom:6px">Продажа: <span class="gt">'+it.sellPrice+gi(16)+'</span></div>'+
    '<div style="display:flex;gap:4px">'+
      '<button class="btn btn-sm btn-g" data-sell-id="'+id+'">'+gi(16)+' Продать</button>'+
      '<button class="btn btn-sm btn-r" data-discard-id="'+id+'">🗑 Выбросить</button>'+
      '<button class="btn btn-sm btn-r" id="btn-close-m">✕</button></div>');
}
function discardItem(id){G.inv=G.inv.filter(x=>x.id!==id);closeM();renderInv();updateRes();}

// ── Debug icon slots ──────────────────────────────────────────
