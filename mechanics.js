// mechanics.js — игровая логика
// Зависимости: constants.js, state.js, utils.js, icons.js

// mechanics.js — игровая логика
// Зависимости: constants.js, state.js, utils.js, icons.js

function openPassiveTree(){
  const p=G.passives||{};
  const pending=G.passivePending||0;
  let html='';
  if(pending>0){
    html+='<div style="background:#332200;border:1px solid var(--gold);border-radius:6px;padding:8px 12px;margin-bottom:12px;text-align:center">'+
      '<span style="color:var(--gold);font-weight:600;font-size:14px">✨ Доступно очков: '+pending+'</span>'+
      '<div style="font-size:12px;color:var(--txt-d);margin-top:2px">Выберите узлы для активации</div></div>';
  }
  html+='<div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center">';
  for(const br of PASSIVE_TREE.branches){
    html+='<div style="flex:1;min-width:140px;background:var(--bg2);border:1px solid '+br.color+'44;border-radius:6px;padding:8px">';
    html+='<div style="text-align:center;margin-bottom:8px"><span style="font-size:17px">'+br.em+'</span> '+
          '<span style="color:'+br.color+';font-weight:600;font-size:13px">'+br.nm+'</span></div>';
    let prevUnlocked=true;
    for(let ni=0;ni<br.nodes.length;ni++){
      const nd=br.nodes[ni];
      const owned=!!p[nd.id];
      const canBuy=pending>0&&prevUnlocked&&!owned;
      const locked=!prevUnlocked;
      const col=owned?br.color:locked?'#555':'#aaa';
      const bg=owned?br.color+'22':locked?'#111':'var(--bg3)';
      const border=owned?br.color:locked?'#333':'#555';
      html+='<div style="background:'+bg+';border:1px solid '+border+';border-radius:4px;padding:6px 8px;margin-bottom:4px;'+(locked?'opacity:.4':'')+'">'+
        '<div style="display:flex;align-items:center;justify-content:space-between;gap:4px">'+
          '<span style="font-size:13px">'+nd.em+' <span style="color:'+col+';font-weight:600">'+nd.nm+'</span></span>'+
          (owned?'<span style="color:'+br.color+';font-size:12px">✓</span>':
           canBuy?'<button class="btn btn-sm" style="padding:0 6px;font-size:11px;background:#553300;border-color:var(--gold);color:var(--gold)" data-passive-id="'+nd.id+'">+1</button>':'')+
        '</div>'+
        '<div style="font-size:11px;color:var(--txt-d);margin-top:2px">'+nd.desc+'</div>'+
      '</div>';
      prevUnlocked=owned;
    }
    html+='</div>';
  }
  html+='</div>';
  html+='<div style="text-align:center;margin-top:10px"><button class="btn btn-sm btn-r" onclick="closeM()">✕ Закрыть</button></div>';
  openM('🌐 Древо пассивок атласа',html);
}

function buyPassive(id){
  if(!(G.passivePending>0))return;
  // Find node
  let found=null;
  for(const br of PASSIVE_TREE.branches){
    for(let ni=0;ni<br.nodes.length;ni++){
      if(br.nodes[ni].id===id){
        // Check previous node owned (or first)
        if(ni===0||(G.passives||{})[br.nodes[ni-1].id]){found=br.nodes[ni];}
      }
    }
  }
  if(!found){showN('Сначала разблокируйте предыдущий узел!','red');return;}
  if((G.passives||{})[found.id]){showN('Уже куплено!','red');return;}
  if(!G.passives)G.passives={};
  G.passives[found.id]=true;
  G.passivePending--;
  log('🌐 Пассивка: '+found.nm+' ('+found.desc+')','info');
  showN('🌐 '+found.nm+' активирована!','pur');
  // Recalc workers if workerStatPct changed
  if(found.stat==='workerStatPct')G.workers.forEach(w=>recalcW(w));
  save();openPassiveTree();
}


// ══════════ PROGRESSIVE UNLOCK ════════════════════════
function show(id,display){const el=document.getElementById(id);if(el)el.style.display=display||'block';}
function hide(id){const el=document.getElementById(id);if(el)el.style.display='none';}

function applyUnlocks(){
  const p=G.prestige||0;
  const totalRuns=G.totalRuns||0;
  const selfLvl=G.selfLevel||0;
  const hasItem=(G.stats&&G.stats.fi>0)||(G.inv&&G.inv.length>0)||false;
  const hasWorkers=G.workers&&G.workers.length>0;
  // Use cleared tiers (actually beaten maps) not maxTier (which starts at 2)
  const clearedTiers=Object.keys(G.cleared||{}).map(Number).filter(n=>G.cleared[n]);
  const maxCleared=clearedTiers.length?Math.max(...clearedTiers):0;

  // Prestige players have seen everything — unlock all UI
  const unlockAll=p>0||G._prestigeUnlockAll||(G.totalRuns||0)>5||false;

  const unlockMaps   = unlockAll || selfLvl>=2;
  const unlockShop   = unlockAll || selfLvl>=3 || maxCleared>=1 || (G.maxTier||0)>2;
  const unlockInv    = unlockAll || hasItem;
  const unlockAtlas  = unlockAll || maxCleared>=2;
  const unlockLog    = true; // always visible
  const unlockWorkers= unlockAll || maxCleared>=3 || hasWorkers;
  const unlockStats  = unlockAll || maxCleared>=5;


  // ── Res-bar ──
  show('ri-gold','flex');
  const hasMaps=Object.values(G.maps||{}).some(v=>v>0);
  show('ri-maps-bar',    hasMaps        ? 'flex':'none');
  show('ri-items-bar',   hasItem        ? 'flex':'none');
  show('ri-workers-bar', hasWorkers     ? 'flex':'none');
  show('ri-runs-bar',    totalRuns>0    ? 'flex':'none');
  show('ri-pres',        p>0            ? 'flex':'none');

  // ── Left tabs ──
  show('tabbtn-maps',  'inline-block'); // always visible
  show('tabbtn-shop',  unlockShop    ? 'inline-block':'none');
  show('tabbtn-inv',   unlockInv     ? 'inline-block':'none');
  show('tabbtn-atlas', unlockAtlas   ? 'inline-block':'none');
  show('tabbtn-ach',   unlockAtlas   ? 'inline-block':'none');
  show('tabbtn-upg',   unlockWorkers ? 'inline-block':'none');

  // ── Atlas bar ──
  show('atlas-bar-wrap', unlockAtlas ? 'block':'none');

  // ── Center: class row, inv button, portal panel ──
  show('cls-row',      (selfLvl>=1||(G.selfPendingLevel||0)>=1) ? 'flex':'none');  // show when level 1 earned
  show('inv-btn-wrap', (p>0||hasItem) ? 'inline-block':'none');
  show('center-panel', 'block');  // always visible — has acts tab
  // Убедиться что активная таба подсвечена
  const _activeCenterTab = document.querySelector('#center-tabs .tab-btn.active');
  if(!_activeCenterTab) switchCenterTab('acts');

  // ── Right column ──
  show('workers-panel',  unlockWorkers ? 'block':'none');
  show('upgrades-panel', unlockWorkers ? 'block':'none');
  show('log-panel',      unlockLog     ? 'block':'none');
  const _lp=document.getElementById('log-panel');if(_lp)_lp.style.marginTop='0';
  const _up=document.getElementById('upgrades-panel');if(_up)_up.style.marginTop=unlockLog?'8px':'0';
  // Show right column wrapper when any panel inside is visible
  const _anyRight=unlockLog||unlockWorkers||unlockStats;
  show('col-right', _anyRight ? 'block':'none');
  show('stats-panel',    unlockStats   ? 'block':'none');


  // Show portal tab button only when maps unlocked
  show('ctab-portal', unlockMaps ? 'flex':'none');

  // If active left tab is hidden, reset to maps (empty)
  const _at=G.activeTab;
  const _lockedTabs={'shop':!unlockShop,'inv':!unlockInv,'atlas':!unlockAtlas,'ach':!unlockAtlas,'upg':!unlockWorkers};
  if(_at&&_lockedTabs[_at]){
    G.activeTab='maps';
    document.querySelectorAll('#left-panel .tab-btn').forEach(b=>b.classList.toggle('active',b.dataset.tab==='maps'));
    document.querySelectorAll('#left-panel .tabpanel').forEach(p=>p.classList.toggle('active',p.id==='tab-maps'));
  }
}

function passiveVal(stat){
  const p=G.passives||{};
  let total=0;
  for(const br of PASSIVE_TREE.branches){
    for(const nd of br.nodes){
      if(nd.stat===stat&&p[nd.id])total+=nd.val;
    }
  }
  return total;
}

// Поднимает стартовую глубину шахты до уровня пройденного тира карт
function dvUpdateMinDepth(tier){
  if(!G.delve)return;
  const minDepth=(Math.max(1,tier)-1)*10;
  if(G.delve.depth>=minDepth)return;
  G.delve.depth=minDepth;
  // Если сетки нет — просто обновляем depth, dvInitGrid подхватит при открытии
  if(!G.delve.grid)return;
  const targetRow=Math.ceil(minDepth/5);
  const g=G.delve.grid;
  if(g.playerRow>=targetRow)return;
  // Ставим игрока на ближайший существующий узел центральной колонки на targetRow
  // Ищем узел на targetRow или ближайшей строке ниже
  let placed=false;
  for(let dr=0;dr<=3&&!placed;dr++){
    for(let dc=0;dc<=4&&!placed;dc++){
      const candidates=[9,9+dc,9-dc];
      for(const col of candidates){
        const k=col+'_'+(targetRow+dr);
        if(g.nodes[k]){
          g.playerCol=g.nodes[k].col;
          g.playerRow=g.nodes[k].row;
          g.nodes[k].visited=true;
          placed=true;break;
        }
      }
    }
  }
  if(!placed){
    // Fallback — просто ставим координаты, dvEnsureGenerated догенерирует
    g.playerRow=targetRow;
    g.playerCol=9;
  }
  g.selectedKey=null;
  // Генерируем сетку до нужной глубины
  dvEnsureGenerated();
  // Камера подтянется при следующем рендере
  g.cameraRow=g.playerRow;
  g.cameraCol=g.playerCol;
}

const calcCh=(power,tier,dgrOverride)=>{
  const t=Math.max(1,Math.min(16,tier||1));
  const d=dgrOverride||MAP_TIERS[t-1].dgr;
  return Math.max(0.03,Math.min(0.97,(power/d-0.2)/0.7));
};
// Parse any map key (normal "5", cursed "c5", uniq "u5", guardian "grd_g_hydra") → tier int
const parseMapKey=k=>{
  const s=String(k);
  if(s.startsWith('grd_')||s.startsWith('boss_'))return 16;
  if(s.startsWith('c')||s.startsWith('u'))return parseInt(s.slice(1))||1;
  return parseInt(s)||1;
};
// Get md object for any map key
const getMd=k=>{
  const s=String(k);
  if(s.startsWith('grd_')){const gm=GUARDIAN_MAPS.find(g=>'grd_'+g.id===s);return gm||MAP_TIERS[15];}
  if(s.startsWith('boss_')){const b=BOSSES.find(b2=>'boss_'+b2.id===s);return b||BOSSES[0];}
  return MAP_TIERS[(parseMapKey(k)-1)]||MAP_TIERS[0];
};
const chcol=ch=>ch>=0.8?'#4acf4a':ch>=0.5?'#cfcf4a':ch>=0.25?'#cf8040':'#cf4040';
const delModCh=ch=>(G&&G._deliriumMode)?Math.max(0.03,ch-0.15):ch;
const iDmg=(it,cls)=>{if(!it||!it.mods)return 0;const r=CDMG[cls]||[];return Math.floor(it.mods.reduce((s,m)=>s+(r.includes(m.stat)?m.value*1:m.value*.08),0));};
const iSurv=(it,cls)=>{if(!it||!it.mods)return 0;const r=CSURV[cls]||[];return Math.floor(it.mods.reduce((s,m)=>s+(r.includes(m.stat)?m.value*1:m.value*.08),0));};
const sDmg=()=>{const sc=G.selfCls||'warrior';let v=3+G.selfLevel*2;const ss=G.syndExtraWeapon?[...SLOTS,'weapon2']:G._clusterSlot2?[...SLOTS,'cluster2']:SLOTS;ss.forEach(s=>{if(G.selfEq[s]&&s!=='cluster')v+=iDmg(G.selfEq[s],sc);});const _cl=G.selfEq&&G.selfEq.cluster;const _dp=_cl?(_cl.mods||[]).reduce((a,m)=>a+(m.stat==='dmgPct'?m.value:0),0):0;return Math.floor(v*(1+_dp/100));};
const sSurv=()=>{const sc=G.selfCls||'warrior';let v=5+G.selfLevel*2;const ss=G.syndExtraWeapon?[...SLOTS,'weapon2']:G._clusterSlot2?[...SLOTS,'cluster2']:SLOTS;ss.forEach(s=>{if(G.selfEq[s]&&s!=='cluster')v+=iSurv(G.selfEq[s],sc);});const _cl=G.selfEq&&G.selfEq.cluster;const _sp=_cl?(_cl.mods||[]).reduce((a,m)=>a+(m.stat==='survPct'?m.value:0),0):0;return Math.floor(v*(1+_sp/100));};
function recalcW(w){const _wsp=passiveVal('workerStatPct');const nb=w.isNamed?6:0;let d=4+w.level*2+nb,s=4+w.level*2+nb;SLOTS.forEach(sl=>{if(w.eq[sl]){d+=iDmg(w.eq[sl],w.cls);s+=iSurv(w.eq[sl],w.cls);}});w.dmg=Math.floor(d*(1+_wsp/100));w.surv=Math.floor(s*(1+_wsp/100));}
function addXPSelf(amt){
  G.selfXp+=amt;const mx=WLVLS.length-1;
  const _prevPend=G.selfPendingLevel;
  while(G.selfXp>=WLVLS[Math.min(mx,G.selfPendingLevel+1)]&&G.selfPendingLevel<mx){G.selfPendingLevel++;G.selfLevelUp=true;log('⭐ Уровень '+(G.selfPendingLevel)+' готов! Нажмите 🆙','info');showN('🆙 Ур.'+G.selfPendingLevel+' готов!','pur');}
  if(G.selfPendingLevel!==_prevPend)applyUnlocks();
  // Always refresh stats display and map chance after xp gain
  updateSelfStats();
  if(G.selMap&&!G.selfRun){const _m=getMd(G.selMap);const _s=String(G.selMap);if(_m)updateRunVis(_m,true,_s.startsWith('grd_'),_s.startsWith('boss_'));}
  if(hasSyndFeature())renderContracts();
}
function addXP(w,amt){
  w.xp+=amt;const mx=WLVLS.length-1;
  while(w.level<mx&&w.xp>=WLVLS[w.level+1]){w.level++;recalcW(w);log('⭐ '+w.name+' — Ур.'+w.level+'!','info');showN(w.name+' — Ур.'+w.level+'!','pur');}
}
const xpAmt=tier=>tier*8+12;
// Gold formula: rand(mapCost, mapCost*(1+variance)) * prestige
// variance = (g1-g0)/g0 — natural spread of the tier
const goldReward=(md,_power,mapCost=0)=>{
  const pm=1+(G.prestigeBonus||0)/100;
  const _clu=G.selfEq&&G.selfEq.cluster;const _gp=_clu?(_clu.mods||[]).reduce((s,m)=>s+(m.stat==='goldPct'?m.value:0),0):0;
  const base=mapCost||md.g[0]||1;
  const variance=(md.g[1]-md.g[0])/Math.max(1,md.g[0]);
  const rnd=base+Math.floor(Math.random()*(base*variance+1));
  return Math.floor(rnd*pm*(1+(_gp+passiveVal('goldPct'))/100));
};
const goldMin=(md,mapCost=0)=>{
  const pm=1+(G.prestigeBonus||0)/100;
  return Math.floor((mapCost||md.g[0]||1)*pm);
};
const goldMax=(md,mapCost=0)=>{
  const pm=1+(G.prestigeBonus||0)/100;
  const base=mapCost||md.g[0]||1;
  const variance=(md.g[1]-md.g[0])/Math.max(1,md.g[0]);
  return Math.floor(base*(1+variance)*pm);
};
const canPrestige=()=>[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16].every(t=>G.cleared[t]);
function maraMapDiscount(){
  if(!hasFaction('maraketh')&&!hasLegacyBonus('mara_2'))return 0;
  const xp=(G.factionXp&&G.factionXp.maraketh)||0;
  return xp>=2?10:0; // 10% at level 2 (second prestige with maraketh, xp>=2)
}
function mapShopCost(baseCost){
  const disc=maraMapDiscount();
  return disc>0?Math.floor(baseCost*(1-disc/100)):baseCost;
}

function genItem(tier,workerCls){
  let pool=IBASES;
  if(workerCls)pool=Math.random()<.38?IBASES.filter(b=>b.cls===workerCls):IBASES;
  if(!pool.length)pool=IBASES;
  const base=pool[Math.floor(Math.random()*pool.length)];
  const r=Math.random();
  const quality=tier>=16&&r<.18?'unique':tier>=14&&r<.12?'unique':tier>=10&&r<.07?'unique':tier>=5&&r<.28?'rare':r<.60?'magic':'normal';
  const cnt={normal:1,magic:ri(1,2),rare:ri(3,5),unique:4}[quality];
  // Unique items are 1.4x stronger than rare
  const qm={normal:1,magic:1.25,rare:1.6,unique:2.24}[quality];
  const mods=[...base.mods].sort(()=>Math.random()-.5).slice(0,cnt).map(stat=>({stat,value:Math.floor((tier*2+ri(3,12))*qm)}));
  const sp=Math.floor({normal:3,magic:8,rare:22,unique:75}[quality]*(1+tier*.35));
  const pfx=NPFX[base.cls]||NPFX.generic,sfx=NSFX[base.cls]||NSFX.generic;
  const nm=quality==='normal'?base.nm:quality==='magic'?pfx[ri(0,pfx.length-1)]+' '+base.nm:pfx[ri(0,pfx.length-1)]+' '+base.nm+' '+sfx[ri(0,sfx.length-1)];
  return {id:++G.iid,name:nm,em:base.em,cls:base.cls,slot:base.slot,quality,mods,tier,sellPrice:sp};
}
function tryItem(md,cls,mult=1){
  const _cluDp=(G.selfEq&&G.selfEq.cluster?(G.selfEq.cluster.mods||[]).reduce((s,m)=>s+(m.stat==='dropPct'?m.value:0),0):0)+passiveVal('dropPct');
  if(Math.random()>md.drop*mult*(1+_cluDp/100))return;
  const it=genItem(md.t,cls);G.inv.push(it);G.stats.fi++;
  // Пульсация кнопки Снаряжение при первой находке
  if(G.stats.fi===1){setTimeout(()=>{const _w=document.getElementById('inv-btn-wrap');if(_w)_w.classList.add('inv-pulse');},50);}
  // Auto-sell (Maraketh T4)
  if((hasFaction('maraketh')||hasLegacyBonus('mara_3'))&&G.factionUnlocks.autoSellItems&&G.autoSellRules&&G.autoSellRules[it.quality]&&it.quality!=='unique'){
    const gold=parseInt(it.sellPrice)||0;G.gold+=gold;G.stats.sg+=gold;G.stats.sold++;G.inv=G.inv.filter(x=>x.id!==it.id);
    checkContractSell(it.quality,gold);
    log('💸 Авто-продажа: '+it.em+' '+it.name+' +'+gold+gi(16),'ge');updateRes();
    return;
  }
  checkContractFind(it.quality);
  log(it.em+' <span style="color:'+qcolLog(it.quality)+'">'+it.name+'</span> ['+qlbl(it.quality)+']','i-'+it.quality[0]);
  checkAchs();applyUnlocks();
}
function tryMap(md){
  if(!md||!md.t)return; // guardian/boss maps have no .md drop field
  const _cluMp=(G.selfEq&&G.selfEq.cluster?(G.selfEq.cluster.mods||[]).reduce((s,m)=>s+(m.stat==='mapDropPct'?m.value:0),0):0)+passiveVal('mapDropPct');
  if(Math.random()>(md.md||0)*(1+_cluMp/100))return;
  const _tierBonus=passiveVal('mapTierBonus');
  // Voidstones: each gives +25% chance to upgrade dropped map tier by 1
  const _vs=G.voidstones||{};
  const _vsCount=(_vs.shaper?1:0)+(_vs.exarch?1:0)+(_vs.eater?1:0);
  const _vsTierUp=(_vsCount>0&&Math.random()<_vsCount*0.25)?1:0;
  const dt=Math.max(1,Math.min(16,(md.t||16)+_tierBonus+_vsTierUp+ri(0,Math.min(3,(md.mx||16)-(md.t||16)))));
  // Guardian maps drop from T16
  const _cluGp=(G.selfEq&&G.selfEq.cluster?(G.selfEq.cluster.mods||[]).reduce((s,m)=>s+(m.stat==='grdDropPct'?m.value:0),0):0)+passiveVal('grdDropPct');
  if(md.t>=14&&Math.random()<Math.min(0.6,.25*(1+_cluGp/100))){
    const gm=GUARDIAN_MAPS[Math.floor(Math.random()*GUARDIAN_MAPS.length)];
    G.maps['grd_'+gm.id]=(G.maps['grd_'+gm.id]||0)+1;
    log('🔷 Карта стража «'+gm.nm+'» упала!','ev');
    renderMaps();return;
  }
  if(md.t>=12&&Math.random()<.20){
    const uPool=UNIQ_MAPS.filter(m=>m.t<=dt);const uMap=uPool.length?uPool[Math.floor(Math.random()*uPool.length)]:UNIQ_MAPS[UNIQ_MAPS.length-1];
    G.maps['u'+dt]=(G.maps['u'+dt]||0)+1;
    G.uniqMapData=G.uniqMapData||{};G.uniqMapData['u'+dt]=uMap;
    log('🗺🟠 Уникальная карта «'+uMap.nm+'» T'+dt+' упала!','ev');
    renderMaps();return;
  }
  const _cursedPct=passiveVal('cursedMapPct');if(Math.random()<Math.min(0.35,.12*(1+_cursedPct/100))){G.maps['c'+dt]=(G.maps['c'+dt]||0)+1;log('🗺💜 Заражённая T'+dt+'!','ev');}
  else{G.maps[dt]=(G.maps[dt]||0)+1;log('🗺 Карта T'+dt+' упала','info');}
  renderMaps();
}

// ══════════ RUNS ══════════════════════════════════════════════
function selfRun(){
  if(!G.selMap){showN('Выберите карту!');return;}
  if(G.selfRun){showN('Уже в походе!');return;}
  if(G.actRun){showN('Уже в акте!');return;}
  if(G.delve&&G.delve.running){showN('Уже в шахте!');return;}
  const key=String(G.selMap);
  const cursed=key.startsWith('c');
  const uniq=key.startsWith('u');
  const isGrd=key.startsWith('grd_');
  const isBoss=key.startsWith('boss_');
  const tier=cursed||uniq?parseInt(key.slice(1)):(isGrd||isBoss)?16:parseInt(key);
  const bossId=isBoss?key.slice(5):null;
  const grdMapData=isGrd?GUARDIAN_MAPS.find(g=>'grd_'+g.id===key):null;
  const bossData=isBoss?BOSSES.find(b=>b.id===bossId):null;
  if(isBoss){
    const isAltBoss=bossId==='exarch'||bossId==='eater';
    if(isAltBoss){
      if(G.pendingBoss!==bossId&&G.bossTriesLeft<=0){showN('Этот босс недоступен!');return;}
      if(G.bossTriesLeft<=0){G.pendingBoss=null;G.bossTriesLeft=6;G.activeBossId=bossId;log('💥 '+bossData.nm+' вызван! 6 попыток.','ev');}
    } else {
      const pcs=G.guardianPieces.shaper||0;
      if(pcs<4&&G.bossTriesLeft<=0){showN('Нужно 4 фрагмента Создателя!');return;}
      if(pcs>=4&&G.bossTriesLeft<=0){
        Object.entries(bossData.req).forEach(([k2,v2])=>{G.guardianPieces[k2]=Math.max(0,(G.guardianPieces[k2]||0)-v2);});
        G.bossTriesLeft=6;G.activeBossId=bossId;log('💠 Создатель призван! 6 попыток.','ev');
      }
    }
  } else {
    if(!(G.maps[key]>0)){showN('Нет карт!');return;}
  }
  // Must have class before running
  if(G._deliriumMode&&(G.deliriumSplinters||0)<5){
    showN('💀 Нужно минимум 5 осколков для карты в делириуме!','red');
    return;
  }
  if(!G.selfCls){
    showN('Сначала выбери класс!','red');
    // Ensure class row is visible
    applyUnlocks();
    const cr=document.getElementById('cls-row');
    if(cr)cr.style.display='flex';
    return;
  }
  if(!isBoss){G.maps[key]--;}
  // Lock class on first run
  G.clsLocked=true;
  const md=isGrd?(grdMapData||MAP_TIERS[15]):isBoss?(bossData||BOSSES[0]):MAP_TIERS[tier-1];
  const cost=(isGrd||isBoss)?0:SHOP_COSTS[tier]||0;
  const _mcCost=(isGrd||isBoss)?0:SHOP_COSTS[tier]||0;
  G.selfRun={md,tier,cursed,uniq,isGrd,isBoss,grdId:isGrd?key.slice(4):null,bossId,elapsed:0,cost,
    goldRange:[goldMin(md,_mcCost),goldMax(md,_mcCost)],mapKey:key};
  if(!isGrd&&!isBoss&&G.selMapVariant!=null){if(!G._lastVariants)G._lastVariants={};G._lastVariants[String(key)]=G.selMapVariant;}
  document.getElementById('rpw').style.visibility='visible';
  document.getElementById('btn-cancel-run').style.display='inline-block';
  document.getElementById('btn-self-run').disabled=true;
  document.getElementById('rpl').textContent=(isGrd?'🔷 ':(cursed?'💜 ':uniq?'🟠 ':'')+'')+md.em+' '+(isGrd&&md.boss?md.boss:uniq&&G.uniqMapData&&G.uniqMapData[key]?G.uniqMapData[key].nm:md.nm)+' ['+(isGrd?'Страж':isBoss?'БОСС':'T'+tier)+']';
  updateRunVis(md,false,isGrd,isBoss);renderMaps();
  // Не переинициализируем миникарту — используем тот же лейаут что показывался при выборе
  // Сбрасываем позицию на старт и выставляем скорость
  if(isGrd||isBoss){
    // У гвардов/боссов нет миникарты
  } else if(_mc.active){
    if(_mc._raf){cancelAnimationFrame(_mc._raf);_mc._raf=null;}
    const _spd=G.syndRunSpeed||1.0;_mc.pos=[..._mc.start];_mc.wi=0;_mc.si=0;_mc.killed=[];_mc._traveled=0;_mc._targetDist=0;_mc._lastTs=null;_mc._mapDurMs=md.time*1000/_spd*(G._deliriumMode?1.5:1);_mc.running=true;
    if(!_mc._raf)_mc._raf=requestAnimationFrame(_mc_rafLoop);
  } else {
    _mc_init(tier,G.selMapVariant);
    if(_mc.active){const _spd2=G.syndRunSpeed||1.0;_mc.running=true;_mc._lastTs=null;_mc._mapDurMs=md.time*1000/_spd2*(G._deliriumMode?1.5:1);_mc._raf=requestAnimationFrame(_mc_rafLoop);}
  }
  log('⚡ Портал: '+(cursed?'💜 ЗАРАЖЁННАЯ ':uniq?'🟠 УНИКАЛЬНАЯ ':'')+'T'+tier+' '+(uniq&&G.uniqMapData&&G.uniqMapData[key]?G.uniqMapData[key].nm:md.nm),'info');
}
function cancelRun(){if(!G.selfRun)return;G.selfRun=null;resetRunUI();_mc_stop();G.selMapVariant=null;log('⚠ Отступили.','ev');}
function resetRunUI(){
  document.getElementById('rpw').style.visibility='hidden';
  document.getElementById('btn-cancel-run').style.display='none';
  document.getElementById('btn-self-run').disabled=false;
  const f=document.getElementById('rpf');if(f)f.style.width='0%';
  const p=document.getElementById('rpp');if(p)p.textContent='0%';
}

function checkT16BossUnlock(){
  if(G.pendingBoss)return; // already have a boss pending
  G.t16RunsSinceBoss=(G.t16RunsSinceBoss||0)+1;
  if(G.t16RunsSinceBoss>=28){
    G.pendingBoss=Math.random()<.5?'exarch':'eater';
    G.t16RunsSinceBoss=0;
    const pb=BOSSES.find(b=>b.id===G.pendingBoss);
    log('💥 '+pb.nm+' пробудился! Портал доступен.','ev');
    showN('💥 '+pb.nm+' вызван!','pur');
    renderMaps();
  }
}
function completeSelfRun(){
  // Save everything from selfRun BEFORE nulling it
  const {md,tier,cursed,uniq,isGrd,isBoss,grdId,bossId,cost,mapKey:_runMapKey}=G.selfRun;
  const grdMapData=grdId?GUARDIAN_MAPS.find(g=>g.id===grdId):null;
  const bossMapData=bossId?BOSSES.find(b=>b.id===bossId):null;
  const power=sDmg()+sSurv();
  // Cursed/uniq = 1 tier harder, grd/boss use their own dgr
  const effTier=tier+(cursed?1:0)+(uniq?1:0);
  const chMod=(isGrd?-.12:0)+(isBoss?-.05:0);
  if(isBoss&&bossMapData){
    // Boss: uncapped chance, requires significantly more power
    const bossDgr=bossMapData.dgr;
    const rawCh=(power/bossDgr-0.2)/0.7;
    const bossCap=bossId==='shaper'?0.70:0.80;
    const bossCh=delModCh(Math.max(.03,Math.min(bossCap,rawCh)+chMod));
    var ch=bossCh;
  } else {
    const bossDgr=null;
    var ch=delModCh(Math.max(.03,calcCh(power,Math.min(16,effTier))+chMod));
  }
  const ok=Math.random()<ch;
  G.stats.mr++;G.totalRuns++;
  if(!G.stats.tierRuns)G.stats.tierRuns={};
  G.stats.tierRuns[tier]=(G.stats.tierRuns[tier]||0)+1;
  if(!ok&&G._deliriumMode){G.deliriumSplinters=Math.max(0,(G.deliriumSplinters||0)-5);if(G.deliriumSplinters<=0){log('💀 Осколки иссякли — карты заблокированы. Иди в Симулякр!','ev');showN('💀 Осколки кончились — нужно 5 для продолжения','red');}save();}
  G.selfRun=null;resetRunUI();_mc_stop();G.selMapVariant=null;checkContractRun(tier,ok?'ok':'fail',isGrd);
  if(ok){
    const lm=cursed?3:uniq?2:1;
    if(!isGrd&&!isBoss){G.cleared[tier]=true;if(tier>G.maxTier)G.maxTier=tier;dvUpdateMinDepth(tier);}
    if(isBoss&&bossMapData){
      G.bossKills[bossId]=(G.bossKills[bossId]||0)+1;
      G.bossTriesLeft=0;G.activeBossId=null;if(bossId==='exarch'||bossId==='eater')G.pendingBoss=null;
      // Grant voidstone on first kill
      if(!G.voidstones)G.voidstones={shaper:false,exarch:false,eater:false};
      if((bossId==='shaper'||bossId==='exarch'||bossId==='eater')&&!G.voidstones[bossId]){
        G.voidstones[bossId]=true;
        const _vnm={shaper:'💠 Камень пустоты Создателя',exarch:'🔥 Камень пустоты Экзарха',eater:'🌑 Камень пустоты Пожирателя'}[bossId];
        showN('🏆 '+_vnm+' получен! Карты дропают на тир выше (+25%)', 'ev');
        log('🏆 '+_vnm+' — теперь карты на 1 тир выше с шансом 25%!','ev');
        renderAtlasBar();
      }
      // Drop boss unique item
      // Real PoE Shaper unique items (translated)
      // Boss drop pools by id
      const _bossPools={
        shaper:[
          {nm:'Звёздная Кузня',         em:'⚔️',slot:'weapon',mods:[{stat:'dmgPhys',value:350},{stat:'critChance',value:70},{stat:'str',value:100},{stat:'atkSpd',value:50}]},
          {nm:'Эфемерное Лезвие',       em:'💫',slot:'weapon',mods:[{stat:'dmgSpell',value:320},{stat:'energyShield',value:180},{stat:'critSpell',value:65},{stat:'int',value:90}]},
          {nm:'Прикосновение Создателя',em:'🧤',slot:'armor', mods:[{stat:'armor',value:300},{stat:'energyShield',value:250},{stat:'hp',value:300},{stat:'allRes',value:90}]},
          {nm:'Семя Создателя',         em:'💠',slot:'armor', mods:[{stat:'energyShield',value:400},{stat:'int',value:120},{stat:'allRes',value:80},{stat:'dmgSpell',value:150}]},
          {nm:'Корона Ааруля',          em:'👑',slot:'helmet',mods:[{stat:'hp',value:350},{stat:'allRes',value:80},{stat:'dmgSpell',value:180},{stat:'critSpell',value:50}]},
          {nm:'Кольцо Созидания',       em:'💍',slot:'ring',  mods:[{stat:'allRes',value:90},{stat:'hp',value:250},{stat:'dmgPhys',value:150},{stat:'str',value:70}]},
        ],
        exarch:[
          {nm:'Чёрная Звезда',      em:'🌟',slot:'weapon',mods:[{stat:'dmgPhys',value:300},{stat:'dmgSpell',value:220},{stat:'critChance',value:55},{stat:'str',value:90}]},
          {nm:'Венец Пламени',      em:'🔥',slot:'helmet',mods:[{stat:'hp',value:320},{stat:'allRes',value:75},{stat:'dmgSpell',value:200},{stat:'critSpell',value:45}]},
          {nm:'Доспех Экзарха',     em:'🛡️',slot:'armor', mods:[{stat:'armor',value:320},{stat:'hp',value:280},{stat:'allRes',value:85},{stat:'energyShield',value:180}]},
          {nm:'Кольцо Экзарха',     em:'💍',slot:'ring',  mods:[{stat:'allRes',value:80},{stat:'hp',value:220},{stat:'dmgSpell',value:140},{stat:'str',value:65}]},
        ],
        eater:[
          {nm:'Семя Пустоты',       em:'🌑',slot:'weapon',mods:[{stat:'minionDmg',value:320},{stat:'dmgSpell',value:240},{stat:'int',value:110},{stat:'energyShield',value:160}]},
          {nm:'Пожирающий Осколок', em:'💀',slot:'weapon',mods:[{stat:'dmgPhys',value:260},{stat:'critChance',value:50},{stat:'allRes',value:55},{stat:'str',value:85}]},
          {nm:'Щит Пожирателя',     em:'🛡️',slot:'armor', mods:[{stat:'energyShield',value:380},{stat:'hp',value:260},{stat:'allRes',value:80},{stat:'int',value:100}]},
          {nm:'Кольцо Пустоты',     em:'💍',slot:'ring',  mods:[{stat:'allRes',value:85},{stat:'int',value:90},{stat:'dmgSpell',value:150},{stat:'critSpell',value:48}]},
        ],
      };
      const bossUniqPool2=_bossPools[bossId]||_bossPools.shaper;
      const bUI2=bossUniqPool2[Math.floor(Math.random()*bossUniqPool2.length)];
      const bItem={id:++G.iid,name:bUI2.nm,em:bUI2.em,cls:'warrior',slot:bUI2.slot,
        quality:'unique',mods:bUI2.mods,tier:16,sellPrice:5000};
      G.inv.push(bItem);G.stats.fi++;checkContractFind('unique');
      const bossGold=goldReward(bossMapData,power,0);G.gold+=bossGold;G.stats.ge+=bossGold;
      log('💠 '+bossMapData.nm+' повержен! +'+bossGold+gi(16)+' + 💠 '+bUI2.nm,'ev');
      floatT('+'+bossGold+gi(16),'#44aaff');showN('💠 '+bossMapData.nm+' убит!','pur');
      renderMaps();
    }
    if(isGrd){
      const gtype=(grdMapData&&grdMapData.type)||'shaper';
      G.guardianPieces[gtype]=(G.guardianPieces[gtype]||0)+1;
      const pieces=G.guardianPieces[gtype];
      log('🔷 Страж повержен! Фрагмент Создателя: '+pieces+'/4','ev');
      showN('🔷 Фрагмент Создателя '+pieces+'/4','pur');
      checkBossUnlocks();
    }
    const suffix=cursed?' (x3 лут)':uniq?' (x2 лут)':isGrd?' [Страж]':isBoss?'':'';
    if(!isBoss){const _autoOrbBonus=(G.autoOrb&&(G.deliriumOrbs||0)>0)?1.2:1.0;if(G.autoOrb&&_autoOrbBonus>1){G.deliriumOrbs--;if(G.deliriumOrbs<=0){G.deliriumOrbs=0;G.autoOrb=false;showN('🔮 Сферы закончились — авто-сфера выключена','red');}}const _db=_autoOrbBonus;const g=Math.round(goldReward(md,power,cost)*_db);G.gold+=g;G.stats.ge+=g;log('✅ Пройдено! +'+g+gi(16)+(_db>1?' 🔮':'')+(suffix),'ge');sfxGold();floatT('+'+g+gi(16),'#f0d080');
      // Сульфит для шахты
      if(G.delve){const _sul=sulphiteFromTier(tier,false);const _cap=G.delve.sulphiteCap;const _add=Math.min(_sul,_cap-G.delve.sulphite);if(_add>0){G.delve.sulphite+=_add;}}
      if(tier===16&&!cursed&&!uniq&&!isGrd)checkT16BossUnlock();
    }
    if(!isBoss){for(let i=0;i<lm;i++)tryItem(md,G.selfCls,1);tryMap(md);}
    // Гарантированная шмотка за 4ю пройденную карту (только один раз)
    if(!isBoss&&!isGrd){
      G.stats.selfClears=(G.stats.selfClears||0)+1;
      if(G.stats.selfClears===4){
        const _gift=genItem(2,G.selfCls||'warrior');
        G.inv.push(_gift);G.stats.fi++;
        log(_gift.em+' <span style="color:'+qcolLog(_gift.quality)+'">'+_gift.name+'</span> ['+qlbl(_gift.quality)+']','i-'+_gift.quality[0]);
      }
    }
    addXPSelf(xpAmt(tier));
    checkAchs();renderAtlasBar();applyUnlocks();
    setTimeout(()=>{renderShop();updateDeliriumTab();renderDelirium();renderDelve();},0);
  }else{
    if(isBoss){
      G.bossTriesLeft=Math.max(0,(G.bossTriesLeft||0)-1);
      if(G.bossTriesLeft<=0){G.activeBossId=null;if(bossId==='exarch'||bossId==='eater')G.pendingBoss=null;}
      const bname=bossMapData?bossMapData.nm:'Босс';
      log('💀 '+bname+' устоял! Осталось '+G.bossTriesLeft+' попыток.','ev');
      showN(bname+' победил! '+G.bossTriesLeft+' осталось','red');
      renderMaps();
    } else {
      sfxDeath();log('💀 Вы пали в T'+tier+(cursed?' [ЗАРАЖЁННАЯ]':uniq?' [УНИКАЛЬНАЯ]':isGrd?' [СТРАЖ]':'')+'!','ev');
      showN('Вы погибли!','red');
    }
  }
  const isBossCard=G.selMap&&String(G.selMap).startsWith('boss_');
  if(G.selMap&&!isBossCard){const selMd=getMd(G.selMap);const _sg=String(G.selMap);updateRunVis(selMd,true,_sg.startsWith('grd_'),_sg.startsWith('boss_'));}else updateRunVis(null);
  renderMaps();updateRes();
  setTimeout(()=>{renderInv();renderUpgrades();renderWorkers();updateDeliriumTab();renderDelve();},0);
}
function updateRunVis(md,idle,isGrd,isBoss){
  const el=document.getElementById('run-con');if(!el)return;
  if(!md){
    _mc_stop();
    const showActHint=G.selfLevel<2;
    el.innerHTML=showActHint
      ?'<div style="text-align:center;padding:8px"><div style="font-size:21px;margin-bottom:6px">🏕</div>'+
        '<div style="font-size:14px;color:var(--gold);font-weight:600;margin-bottom:4px">Сначала пройдите Акты!</div>'+
        '<div style="font-size:13px;color:var(--txt-d)">Вкладка 🏕 АКТЫ → получите уровни перед картами.<br>Без прокачки на картах будет ~30% шанс.</div></div>'
      :'<div class="dim" style="font-style:italic">Выберите карту слева</div>';
    return;
  }
  const col=isGrd?'#44aaff':tcol(md.t);
  let ch='';{const _sk=String(G.selMap||'');const _eff=md.t+(_sk.startsWith('c')?1:0)+(_sk.startsWith('u')?1:0);const _grdMod=_sk.startsWith('grd_')?-.12:0;const _rawCv=calcCh(sDmg()+sSurv(),Math.min(16,_eff))+_grdMod;const _isBossKey=_sk.startsWith('boss_');const _bossId=_isBossKey?_sk.replace('boss_',''):null;const _bossCap=_bossId==='shaper'?0.70:_isBossKey?0.80:null;const cv=delModCh(Math.max(.03,_sk.startsWith('grd_')?Math.min(0.85,_rawCv):_isBossKey?Math.min(_bossCap,_rawCv+(_sk.startsWith('grd_')?-0.12:0)):_rawCv));const _capForDisplay=_sk.startsWith('grd_')?0.85:_bossCap;
    const _capPctDisplay=_capForDisplay!==null?Math.round(delModCh(_capForDisplay)*100):null;
    const _isCappedDisplay=_capForDisplay!==null&&_rawCv>=_capForDisplay-0.001;
    ch='<div style="margin-top:4px;font-size:13px;color:'+chcol(cv)+';visibility:'+(idle?'visible':'hidden')+'">Ваш шанс: '+Math.round(cv*100)+'%'+
      (_capPctDisplay!==null?'<span style="font-size:10px;color:'+(_isCappedDisplay?'#ff9944':'var(--txt-d)')+';margin-left:5px">(кап '+_capPctDisplay+'%)</span>':'')+
      '</div>';}
  const cost=SHOP_COSTS[md.t]||0;
  // Orb button
  const _orbWrap=document.getElementById('orb-btn-wrap');
  if(_orbWrap){
    if(G.cleared&&G.cleared[16]&&!isGrd&&!isBoss){
      const _aOn=G.autoOrb;
      const _hasOrbs=(G.deliriumOrbs||0)>0;
      if(_aOn)
        _orbWrap.innerHTML='<button class="btn btn-sm" style="background:#330055;border-color:#aa66ff;color:#cc99ff;margin-bottom:4px" title="Сфера Делириума: +20% к золоту и предметам за ран. Расходует 1 сферу. Получают в Симулякре или в магазине." data-orb-toggle="1">🔮 Авто-сфера: ВКЛ ('+G.deliriumOrbs+' шт) ✓</button>';
      else if(_hasOrbs)
        _orbWrap.innerHTML='<button class="btn btn-sm" style="background:var(--bg3);border-color:#553377;color:#9966cc;margin-bottom:4px" title="Сфера Делириума: +20% к золоту и предметам за ран. Расходует 1 сферу. Получают в Симулякре или в магазине." data-orb-toggle="1">🔮 Авто-сфера: ВЫКЛ ('+G.deliriumOrbs+' шт)</button>';
      else
        _orbWrap.innerHTML='<button class="btn btn-sm" style="opacity:.35;cursor:not-allowed;margin-bottom:4px" disabled>🔮 Нет сфер делириума</button>';
    }else{_orbWrap.innerHTML='';}
  }
  // Фоновая картинка: ключ для обычных карт — строка тира, для остальных — null пока
  const _imgKey=(!isGrd&&!isBoss)?String(md.t):null;
  const _imgUrl=_imgKey&&MAP_IMAGES[_imgKey]?MAP_IMAGES[_imgKey]:null;
  const _runVis=el.parentElement;
  if(_runVis){
    if(_imgUrl){
      _runVis.style.backgroundImage='url('+_imgUrl+')';
      _runVis.style.backgroundSize='cover';
      _runVis.style.backgroundPosition='center';
      _runVis.classList.add('has-bg');
    } else {
      _runVis.style.backgroundImage='';
      _runVis.classList.remove('has-bg');
    }
  }
  el.innerHTML='<div class="run-info-overlay">'+
    '<div class="run-nm" style="color:'+col+'">'+md.em+' '+(isGrd&&md.boss?md.boss:(()=>{const _sk=String(G.selMap||'');return _sk.startsWith('u')&&G.uniqMapData&&G.uniqMapData[_sk]?G.uniqMapData[_sk].nm:md.nm;})())+'</div>'+
    '<div class="dim" style="font-size:11px;letter-spacing:2px;margin-bottom:4px">'+(isGrd?'КАРТА СТРАЖА':isBoss?'ПОРТАЛ СОЗДАТЕЛЯ':'КАРТА ТИРА '+md.t)+'</div>'+
    '<div style="font-size:13px;color:var(--txt-d)">⏱ ~'+(()=>{const spd=G.syndRunSpeed||1.0;const dlw=G._deliriumMode?1.5:1;const t=Math.round(md.time/spd*dlw);return t;})()+(()=>{const spd2=G.syndRunSpeed||1.0;const dlw2=G._deliriumMode?1.5:1;return 'с'+(spd2>1.0?' <span style="color:#ffaa44">(×'+spd2.toFixed(1)+'⚡)</span>':'')+(dlw2>1?' <span style="color:#7799bb">(×'+dlw2.toFixed(1)+'🐢)</span>':'')+' &nbsp; ';})()+gi(16)+(goldMin(md,cost))+(goldMax(md,cost)>goldMin(md,cost)?'-'+goldMax(md,cost):'')+' + предметы</div>'+ch+
    '</div>';
  // Показываем миникарту при выборе карты (idle) — только если нет активного забега
  if(idle&&!isGrd&&!isBoss&&!G.selfRun){
    const _mk=String(G.selMap||'');
    if(_mk!==G._lastSelMap||G.selMapVariant==null){
      const _lay=MAP_LAYOUTS['t'+md.t];
      if(_lay&&_lay.variants.length>1){const _last=G._lastVariants&&G._lastVariants[_mk]!=null?G._lastVariants[_mk]:-1;let _vi;do{_vi=Math.floor(Math.random()*_lay.variants.length);}while(_vi===_last);G.selMapVariant=_vi;}else{G.selMapVariant=0;}
      G._lastSelMap=_mk;
    }
    const _hasLayout=!!MAP_LAYOUTS['t'+md.t];
    const _stub=document.getElementById('mc-stub');
    const _cv=document.getElementById('map-canvas');
    if(_hasLayout){
      if(_stub)_stub.style.display='none';
      if(_cv)_cv.style.display='';
      _mc_init(md.t,G.selMapVariant);
    } else {
      _mc_stop();
      if(_cv){_cv.style.display='none';_cv.style.opacity='0';}
      if(_stub)_stub.style.display='flex';
    }
  } else {
    const _stub=document.getElementById('mc-stub');
    const _cv=document.getElementById('map-canvas');
    if(isGrd||isBoss){
      _mc_stop();
      const _wr=document.getElementById('mc-wrap');if(_wr)_wr.style.display='none';
      if(_cv){_cv.style.display='none';_cv.style.opacity='0';}
      if(_stub)_stub.style.display='none';
    } else {
      const _hasLay=!!MAP_LAYOUTS['t'+md.t];
      if(_hasLay){if(_stub)_stub.style.display='none';if(_cv)_cv.style.display='';}
      else{if(_cv){_cv.style.display='none';_cv.style.opacity='0';}if(_stub)_stub.style.display='flex';}
    }
  }
}
function startAct(id){
  if(G.actRun){showN('Уже в акте!');return;}if(G.selfRun){showN('Уже в походе!');return;}if(G.delve&&G.delve.running){showN('Уже в шахте!');return;}
  const act=ACTS.find(a=>a.id===id);if(!act)return;
  G.actRun={act,elapsed:0};const btn=document.getElementById('abtn-'+id);if(btn)btn.disabled=true;
  log('🏕 Отправились: '+act.nm,'info');
}
function completeAct(){
  const act=G.actRun.act;const g=ri(act.g[0],act.g[1]);G.gold+=g;G.stats.ge+=g;G.stats.ar++;G.actRun=null;
  // Acts give small self XP
  const xpGain=act.xp||Math.floor(xpAmt(1)*1.5);addXPSelf(xpGain);
  log('🏕 '+act.nm+' завершён — +'+g+gi(16)+' +'+xpGain+'XP','ge');sfxGold();floatT('+'+g+gi(16),'#c8a96e');
  const btn=document.getElementById('abtn-'+act.id);if(btn)btn.disabled=false;
  const fill=document.getElementById('apf-'+act.id);if(fill)fill.style.width='0%';
  updateRes();
  const _totalMaps=Object.values(G.maps||{}).reduce((a,b)=>a+b,0);
  if(_totalMaps<2){applyUnlocks();renderShop();}
}
function sendWorker(id){
  if(!canWorkerMapRun()){showN('Маракеты: работники только в экспедиции!');return;}
  if(!G.selMap){showN('Выберите карту!');return;}
  if(G._deliriumMode&&(G.deliriumSplinters||0)<5){showN('💀 Нужно минимум 5 осколков для карты в делириуме!','red');return;}
  const w=G.workers.find(x=>x.id===id);if(!w||w.status!=='idle')return;
  const running=G.workers.filter(x=>x.status==='running'||x.status==='exp').length;
  const maxS=1+G.ups.slots;
  if(running>=maxS){showN('Нужен апгрейд Машины для ещё одного слота!');return;}
  const key=String(G.selMap);
  const cursed=key.startsWith('c');
  const uniq=key.startsWith('u');
  const isGrd=key.startsWith('grd_');
  const isBossW=key.startsWith('boss_');
  if(isBossW){showN('Работники не могут идти к боссу!');return;}
  const tier=cursed||uniq?parseInt(key.slice(1)):isGrd?16:parseInt(key);
  const grdMapData=isGrd?GUARDIAN_MAPS.find(g=>'grd_'+g.id===key):null;
  if(!(G.maps[key]>0)){showN('Нет карт!');return;}
  G.maps[key]--;
  w.status='running';w.curMap=tier;w.curMapKey=key;w.cursed=cursed;w.uniq=uniq;w.isGrd=isGrd;w.elapsed=0;w.prog=0;
  log('🚀 '+w.name+' → '+(cursed?'💜 ':uniq?'🟠 ':'')+'T'+tier,'info');
  renderWorkers();renderMaps();
}
function resolveWorker(w,md){
  const power=w.dmg+w.surv;
  const wEffTier=md.t+(w.cursed?1:0)+(w.uniq?1:0);
  const isGrdMap=w.isGrd||false;
  const rawChW=calcCh(power,Math.min(16,wEffTier));
  const ch=delModCh(Math.max(.03,isGrdMap?Math.min(0.85,rawChW-0.12):rawChW));
  const ok=Math.random()<ch;
  G.stats.mr++;G.totalRuns++;w.runsCompleted=(w.runsCompleted||0)+1;
  if(!G.stats.tierRuns)G.stats.tierRuns={};
  G.stats.tierRuns[md.t]=(G.stats.tierRuns[md.t]||0)+1;
  if(!ok){
    if(G._deliriumMode){G.deliriumSplinters=Math.max(0,(G.deliriumSplinters||0)-5);if(G.deliriumSplinters<=0){log('💀 Осколки иссякли — карты заблокированы!','ev');showN('💀 Осколки кончились — нужно 5 для продолжения','red');}else{showN('💀 '+w.name+' провалил карту! -5 осколков','red');}}
    if((hasFaction('maraketh')||hasLegacyBonus('mara_3'))&&G.factionUnlocks.guardedWorkers){w.status='idle';log('🛡 '+w.name+' защищён — охрана отбила угрозу!','info');}
    else if(Math.random()<.3){w.status='captured';w.capturedAt=G.gt;G.stats.cap++;log('⛓️ '+w.name+' захвачен на T'+w.curMap+'!','ev');showN(w.name+' захвачен!','red');return;}
    else{w.status='injured';w.injuredAt=G.gt;G.stats.inj++;log('💔 '+w.name+' ранен на T'+w.curMap+'!','ev');}
  }else{w.status='idle';}
  const cost=SHOP_COSTS[md.t]||0;
  const lm=w.cursed?3:w.uniq?2:1;
  const g=goldReward(md,power,cost);G.gold+=g;G.stats.ge+=g;
  if(!w.isGrd){G.cleared[md.t]=true;if(md.t>G.maxTier)G.maxTier=md.t;dvUpdateMinDepth(md.t);if(md.t===16&&!w.cursed&&!w.uniq)checkT16BossUnlock();}
  // Сульфит для шахты
  if(G.delve&&ok){const _wsul=sulphiteFromTier(md.t,true);const _wcap=G.delve.sulphiteCap;G.delve.sulphite=Math.min(_wcap,G.delve.sulphite+_wsul);}
  if(w.isGrd){
    const gtype=(md.type)||'shaper';
    G.guardianPieces[gtype]=(G.guardianPieces[gtype]||0)+1;
    log('🔷 '+w.name+' поверг стража! Фрагмент Создателя: '+G.guardianPieces[gtype]+'/4','ev');
    showN('🔷 Фрагмент '+G.guardianPieces[gtype]+'/4','pur');
    checkBossUnlocks();renderMaps();
  }
  log(gi(16)+' '+w.name+' T'+md.t+(w.isGrd?' [Страж]':w.cursed?' 💜':w.uniq?' 🟠':'')+' +'+g+gi(16)+(lm>1?' ×'+lm:''),'ge');
  floatT('+'+g+gi(16),'#f0d080');
  const itemMult=w.isNamed&&w.bonus&&w.bonus.itemDropBonus?(1+w.bonus.itemDropBonus):1;
  for(let i=0;i<lm;i++){tryItem(md,w.cls,itemMult);}tryMap(md);addXP(w,xpAmt(md.t));
  // Small self XP from workers
  addXPSelf(Math.floor(xpAmt(md.t)*.25));
  w.prog=0;w.elapsed=0;checkAchs();renderAtlasBar();renderShop();renderUpgrades();renderWorkers();renderInv();renderDelve();updateRes();applyUnlocks();
}

function tryAutoExp(w){
  if(!w.autoExp||!hasMaraFeature())return;
  if(w.status!=='idle')return;
  const _runningNow=G.workers.filter(x=>x.status==='running'||x.status==='exp').length;
  if(_runningNow>=1+G.ups.slots)return;
  const maxSlots=(G.factionUnlocks&&G.factionUnlocks.exp5)?5:3;
  // Build available tier counts
  const tierCounts={};
  Object.keys(G.maps).filter(k=>!isNaN(k)&&G.maps[k]>0).forEach(k=>{
    const t=parseInt(k);tierCounts[t]=(tierCounts[t]||0)+G.maps[k];
  });
  if(Object.keys(tierCounts).length<1)return;
  // Strict mode: only use lastExpSlots, skip if not enough cards
  if(!G.lastExpSlots||!G.lastExpSlots.length)return;
  const tc2={...tierCounts};
  const slots=[];
  for(const t of G.lastExpSlots.slice(0,maxSlots)){
    if(t&&tc2[t]>0){slots.push(t);tc2[t]--;}
    else if(t){return;} // missing a required tier — don't go
  }
  if(slots.length<3)return; // need at least 3
  // Consume maps
  const filledSlots=slots.filter(Boolean);
  const needed={};filledSlots.forEach(t=>{needed[t]=(needed[t]||0)+1;});
  for(const t in needed){
    if((G.maps[parseInt(t)]||0)<needed[t])return; // not enough maps
  }
  for(const t in needed){G.maps[parseInt(t)]=Math.max(0,(G.maps[parseInt(t)]||0)-needed[t]);}
  G.lastExpSlots=[...slots];
  // Start expedition directly (bypass startExpedition which reads window._exp)
  w.status='exp';w.expTiers=[...slots];w.expIdx=0;w.elapsed=0;w.prog=0;w.curMap=slots[0];
  log('🔄 '+w.name+' — авто-экспедиция: T'+slots.join(', T'),'info');
  renderWorkers();renderMaps();updateRes();
}
function resolveExpStep(w){
  const tier=w.expTiers[w.expIdx];const md=MAP_TIERS[tier-1];const power=w.dmg+w.surv;
  // Chance based on hardest tier's fail chance * 1.5
  const hardest=Math.max(...w.expTiers);
  const ch=delModCh(calcCh(power,hardest));
  const ok=Math.random()<ch;
  G.stats.mr++;G.totalRuns++;
  if(!ok){
    if((hasFaction('maraketh')||hasLegacyBonus('mara_3'))&&G.factionUnlocks.guardedWorkers){
      w.status='idle';w.expTiers=[];w.expIdx=0;
      log('🛡 '+w.name+' — охрана отбила угрозу! Экспедиция провалена, отряд цел.','info');
      renderWorkers();renderInv();updateRes();
      if(w.autoExp)setTimeout(()=>tryAutoExp(w),300);
      return;
    }
    else if(Math.random()<.2){w.status='captured';w.capturedAt=G.gt;G.stats.cap++;log('⛓️ '+w.name+' захвачен в экспедиции T'+tier+'!','ev');showN(w.name+' захвачен!','red');if(G.autoRescue){const _rc=Math.floor((30+tier*12)*(1-G.ups.rescue*.15)*(1-passiveVal('rescueCostPct')/100));if(G.gold>=_rc){G.gold-=_rc;w.status='idle';log('🔓 Авто-выкуп '+w.name+' за '+_rc+gi(16),'info');if(w.autoExp)setTimeout(()=>tryAutoExp(w),300);}}}
    else{w.status='injured';w.injuredAt=G.gt;G.stats.inj++;log('💔 '+w.name+' ранен в экспедиции!','ev');}
    w.expTiers=[];w.expIdx=0;renderWorkers();renderInv();updateRes();return;
  }
  const ecost=SHOP_COSTS[tier]||0;
  const _expGb=1.2*(1+passiveVal('expGoldPct')/100);const g=Math.floor(goldReward(md,power,ecost)*_expGb);G.gold+=g;G.stats.ge+=g;
  G.cleared[tier]=true;if(tier>G.maxTier)G.maxTier=tier;dvUpdateMinDepth(tier);
  if(tier===16)checkT16BossUnlock();
  // Сульфит с экспедиции — как с обычного работника
  if(G.delve){const _esul=sulphiteFromTier(tier,true);G.delve.sulphite=Math.min(G.delve.sulphiteCap,G.delve.sulphite+_esul);}
  log(gi(16)+' '+w.name+' экспед. T'+tier+' +'+g+gi(16),'ge');
  tryItem(md,w.cls,1.5);tryMap(md);addXP(w,xpAmt(tier));
  addXPSelf(Math.floor(xpAmt(tier)*.15));
  checkAchs();renderAtlasBar();renderShop();
  w.expIdx++;w.elapsed=0;w.prog=0;
  if(w.expIdx>=w.expTiers.length){
    w.status='idle';w.expTiers=[];w.expIdx=0;
    log('🎉 '+w.name+' завершил экспедицию!','info');showN(w.name+' завершил экспедицию!','pur');
    // Auto-restart expedition if enabled
    if(w.autoExp&&hasMaraFeature())setTimeout(()=>tryAutoExp(w),200);
  }
  renderWorkers();renderInv();renderDelve();updateRes();
}
function rescueW(id){
  const w=G.workers.find(x=>x.id===id);if(!w||w.status!=='captured')return;
  const cost=Math.floor((30+(w.curMap||1)*12)*(1-G.ups.rescue*.15));
  if(G.gold<cost){showN('Нужно '+cost+gi(16)+'!');return;}
  G.gold-=cost;w.status='idle';
  log('🔓 '+w.name+' выкуплен за '+cost+gi(16),'info');showN(w.name+' освобождён!','grn');
  renderWorkers();updateRes();
}
function sellItem(id){
  const it=G.inv.find(x=>x.id===id);if(!it)return;
  const sp=parseInt(it.sellPrice)||0;G.gold+=sp;G.stats.sg+=sp;G.stats.sold++;
  checkContractSell(it.quality,sp);
  G.inv=G.inv.filter(x=>x.id!==id);
  log(gi(16)+' '+it.em+' '+it.name+' +'+it.sellPrice+gi(16),'ge');floatT('+'+it.sellPrice+gi(16),'#c8a96e');
  checkAchs();closeM();renderInv();updateRes();
}
function sellAllNormal(){
  const ns=G.inv.filter(x=>x.quality==='normal');if(!ns.length){showN('Нет обычных!');return;}
  const tot=ns.reduce((s,x)=>s+(parseInt(x.sellPrice)||0),0);G.inv=G.inv.filter(x=>x.quality!=='normal');
  G.gold+=tot;G.stats.sg+=tot;G.stats.sold+=ns.length;
  ns.forEach(it=>checkContractSell(it.quality,parseInt(it.sellPrice)||0));
  log(gi(16)+' Продано '+ns.length+'x обычных +'+tot+gi(16),'ge');floatT('+'+tot+gi(16),'#c8a96e');
  checkAchs();renderInv();updateRes();
}

// ══════════ BOSS SYSTEM ═══════════════════════════════════════
function checkBossUnlocks(){
  BOSSES.forEach(b=>{
    // shaper uses fragments; exarch/eater use pendingBoss
    const isAlt=b.id==='exarch'||b.id==='eater';
    const ready=isAlt?(G.pendingBoss===b.id):(Object.entries(b.req).every(([k,v])=>(G.guardianPieces[k]||0)>=v));
    if(ready&&!G.bossAttempts[b.id]){
      log('💠 ВНИМАНИЕ: Открыт доступ к '+b.nm+'!','ev');
      showN('💠 '+b.nm+' ждёт!','pur');
      renderUpgrades();
    }
  });
}
function tryBoss(id){
  const b=BOSSES.find(x=>x.id===id);if(!b)return;
  const ready=Object.entries(b.req).every(([k,v])=>(G.guardianPieces[k]||0)>=v);
  if(!ready){showN('Нужны все фрагменты!');return;}
  // Deduct fragments
  Object.entries(b.req).forEach(([k,v])=>{G.guardianPieces[k]=Math.max(0,(G.guardianPieces[k]||0)-v);});
  const power=sDmg()+sSurv();
  const ch=delModCh(Math.max(.03,calcCh(power,16)*.6)); // Bosses are much harder
  const ok=Math.random()<ch;
  G.bossAttempts[id]=(G.bossAttempts[id]||0)+1;
  if(ok){
    G.bossKills[id]=(G.bossKills[id]||0)+1;
    const g=Math.floor(Math.random()*(b.g[1]-b.g[0])+b.g[0]);G.gold+=g;G.stats.ge+=g;
    // Guaranteed unique item
    // Boss unique item — proper slot based on item name, high power mods
    const _bp2={
      shaper:[
        {nm:'Звёздная Кузня',         em:'⚔️',slot:'weapon',mods:[{stat:'dmgPhys',value:350},{stat:'critChance',value:70},{stat:'str',value:100},{stat:'atkSpd',value:50}]},
        {nm:'Эфемерное Лезвие',       em:'💫',slot:'weapon',mods:[{stat:'dmgSpell',value:320},{stat:'energyShield',value:180},{stat:'critSpell',value:65},{stat:'int',value:90}]},
        {nm:'Прикосновение Создателя',em:'🧤',slot:'armor', mods:[{stat:'armor',value:300},{stat:'energyShield',value:250},{stat:'hp',value:300},{stat:'allRes',value:90}]},
        {nm:'Семя Создателя',         em:'💠',slot:'armor', mods:[{stat:'energyShield',value:400},{stat:'int',value:120},{stat:'allRes',value:80},{stat:'dmgSpell',value:150}]},
        {nm:'Корона Ааруля',          em:'👑',slot:'helmet',mods:[{stat:'hp',value:350},{stat:'allRes',value:80},{stat:'dmgSpell',value:180},{stat:'critSpell',value:50}]},
        {nm:'Кольцо Созидания',       em:'💍',slot:'ring',  mods:[{stat:'allRes',value:90},{stat:'hp',value:250},{stat:'dmgPhys',value:150},{stat:'str',value:70}]},
      ],
      exarch:[
        {nm:'Чёрная Звезда',   em:'🌟',slot:'weapon',mods:[{stat:'dmgPhys',value:300},{stat:'dmgSpell',value:220},{stat:'critChance',value:55},{stat:'str',value:90}]},
        {nm:'Венец Пламени',   em:'🔥',slot:'helmet',mods:[{stat:'hp',value:320},{stat:'allRes',value:75},{stat:'dmgSpell',value:200},{stat:'critSpell',value:45}]},
        {nm:'Доспех Экзарха',  em:'🛡️',slot:'armor', mods:[{stat:'armor',value:320},{stat:'hp',value:280},{stat:'allRes',value:85},{stat:'energyShield',value:180}]},
        {nm:'Кольцо Экзарха',  em:'💍',slot:'ring',  mods:[{stat:'allRes',value:80},{stat:'hp',value:220},{stat:'dmgSpell',value:140},{stat:'str',value:65}]},
      ],
      eater:[
        {nm:'Семя Пустоты',       em:'🌑',slot:'weapon',mods:[{stat:'minionDmg',value:320},{stat:'dmgSpell',value:240},{stat:'int',value:110},{stat:'energyShield',value:160}]},
        {nm:'Пожирающий Осколок', em:'💀',slot:'weapon',mods:[{stat:'dmgPhys',value:260},{stat:'critChance',value:50},{stat:'allRes',value:55},{stat:'str',value:85}]},
        {nm:'Щит Пожирателя',     em:'🛡️',slot:'armor', mods:[{stat:'energyShield',value:380},{stat:'hp',value:260},{stat:'allRes',value:80},{stat:'int',value:100}]},
        {nm:'Кольцо Пустоты',     em:'💍',slot:'ring',  mods:[{stat:'allRes',value:85},{stat:'int',value:90},{stat:'dmgSpell',value:150},{stat:'critSpell',value:48}]},
      ],
    };
    const bossUniqPool=_bp2[bossId]||_bp2.shaper;
    const bUI=bossUniqPool[Math.floor(Math.random()*bossUniqPool.length)];
    const uniqIt={id:++G.iid,name:bUI.nm,em:bUI.em,cls:'warrior',slot:bUI.slot,
      quality:'unique',mods:bUI.mods,tier:16,sellPrice:5000};
    G.inv.push(uniqIt);G.stats.fi++;
    log('💠 '+b.nm+' повержен! +'+g+gi(16)+' + 💠 '+uniqNm,'ev');showN('💠 '+b.nm+' убит!','pur');
    renderInv();checkAchs();
  }else{
    log('💠 Вы пали перед '+b.nm+'!','ev');showN('💀 Поражение от '+b.nm,'red');
  }
  G.selfRun=null;resetRunUI();renderUpgrades();updateRes();save();
  closeM();
}

// ══════════ ACHIEVEMENTS ══════════════════════════════════════
function grantAch(id){
  if(G.achs[id])return;
  if(!G.achsPending)G.achsPending={};
  if(G.achsPending[id])return;
  G.achsPending[id]=true;
  const a=ACHDEFS.find(x=>x.id===id);
  if(a){log('🏆 АРХИВ: '+a.nm+' — заберите награду!','info');showN('🏆 '+a.nm+' — перейдите в Архив!','pur');}
  updateAchBadge();renderAchs();
}
function checkAchs(){
  function grant(id){
    if(G.achs[id])return;
    if(!G.achsPending)G.achsPending={};
    if(G.achsPending[id])return;
    G.achsPending[id]=true;
    const a=ACHDEFS.find(x=>x.id===id);
    if(a){log('🏆 АРХИВ: '+a.nm+' — заберите награду!','info');showN('🏆 '+a.nm+' — перейдите в Архив!','pur');}
    updateAchBadge();renderAchs();
  }
  if(G.stats.mr>=1)grant('first_run');
  if(G.cleared[5])grant('t5_clear');
  if(G.cleared[10])grant('t10_clear');
  if(G.cleared[16])grant('t16_clear');
  if(G.workers.length>=3)grant('hire3');
  if(G.totalRuns>=50)grant('runs50');
  if(G.totalRuns>=200)grant('runs200');
  if(G.stats.fi>=20)grant('items20');
  const allEq=[...G.inv,...Object.values(G.selfEq),...G.workers.flatMap(w=>Object.values(w.eq))].filter(Boolean);
  if(allEq.some(x=>x.quality==='rare'))grant('rare_item');
  if(allEq.some(x=>x.quality==='unique'))grant('uniq_item');
  if(G.stats.sg>=500)grant('sell500');
  if(canPrestige())grant('all16');
  // Режим делириума — награда при завершении атласа
  if(G._deliriumMode&&canPrestige()&&!G._deliriumModeRewarded){
    G._deliriumMode=false;
    G._deliriumModeRewarded=true;
    G._clusterSlot2=true;
    grant('del_mode_clear');
    log('👁 Атлас пройден в делириуме! 2й слот кластерника открыт навсегда.','ev');
    showN('👁 Награда делириума: 2й слот кластерника!','pur');
    save();
  }
  if((G.stats.contractsDone||0)>=1)grant('con_first');
  if((G.stats.contractsDone||0)>=10)grant('con_10');
  if((G.stats.contractsDone||0)>=25)grant('con_25');
  if((G.stats.mastersDone||0)>=1)grant('master_1');
  if((G.stats.delWaves||0)>=1)grant('del_first');
  if((G.stats.delMaxWave||0)>=5)grant('del_wave5');
  if((G.stats.delMaxWave||0)>=10)grant('del_wave10');
  if((G.stats.delMaxWave||0)>=20)grant('del_wave20');

  if(G.prestige>=1)grant('pres_1');
  if(G.prestige>=3)grant('pres_3');
  if(G.prestige>=5)grant('pres_5');
  // Боссы
  if((G.bossKills&&G.bossKills.shaper||0)>=1)grant('kill_shaper');
  if((G.bossKills&&G.bossKills.exarch||0)>=1)grant('kill_exarch');
  if((G.bossKills&&G.bossKills.eater||0)>=1)grant('kill_eater');
  // Все ачивки (кроме самой all_achs) — проверяем и claimed и pending
  // Не отбирается при появлении новых ачивок (grantAch не перезаписывает уже выданные)
  const _allIds=ACHDEFS.filter(a=>a.id!=='all_achs').map(a=>a.id);
  if(!( G.achs&&G.achs['all_achs'])&&!(G.achsPending&&G.achsPending['all_achs'])){
    if(_allIds.every(id=>(G.achs&&G.achs[id])||(G.achsPending&&G.achsPending[id])))grant('all_achs');
  }
}

// ══════════ PRESTIGE ══════════════════════════════════════════
function doPrestige(){
  if(!canPrestige()){showN('Нужно пройти все 16 тиров для Возвышения!');return;}
  if(G.selfRun){G.selfRun=null;resetRunUI();}
  // Show faction choice modal
  openFactionChoice();
}
function openFactionChoice(selFac){
  selFac=selFac||(G.faction||'none');
  if(selFac==='none')selFac='syndicate';
  const np=(G.prestige||0)+1;
  const _showLegacy=true; // always show legacy tab, locked if prestige < 5
  const facs=['syndicate','maraketh','legacy'];
  const nb=np*15;
  const kg=Math.floor(G.gold*.15);
  // Prestige benefits block
  let html=
    '<div style="background:rgba(80,50,0,.25);border:1px solid #664400;border-radius:6px;padding:10px;margin-bottom:12px">'+
    '<div style="font-family:Cinzel,serif;color:#ffaa00;font-size:15px;margin-bottom:6px">✨ Возвышение '+np+'</div>'+
    '<div style="font-size:14px;color:var(--txt-b);line-height:1.7">'+
      '• Постоянный бонус к золоту: <span style="color:var(--gold)">+'+nb+'%</span><br>'+
      '• Перенос <span style="color:var(--gold)">'+kg+gi(16)+'</span> (15% текущего)<br>'+
      (np===1?'• Открывается класс <span style="color:#e8c020">👸 Дворянка</span><br>':'')+
    '</div></div>'+
    '<div style="font-family:Cinzel,serif;font-size:14px;color:#aaa;margin-bottom:8px">Выберите фракцию:</div>';
  // Faction tabs
  html+='<div style="display:flex;gap:6px;margin-bottom:10px">';
  facs.forEach(fid=>{
    const f=FACTIONS[fid];
    const active=selFac===fid;
    const _legLocked=fid==='legacy'&&np<5;
    const _col=_legLocked?(active?'#886622':'#554422'):active?f.col:'#445';
    const _txtcol=_legLocked?(active?'#cc9944':'#776644'):active?f.col:'#aaa';
    const _bg=active?(_legLocked?'rgba(60,40,0,.3)':'rgba(60,60,60,.4)'):'none';
    html+='<button class="btn btn-sm" data-fac-tab="'+fid+'" style="flex:1;font-size:13px;border-color:'+_col+';color:'+_txtcol+';background:'+_bg+';opacity:'+(_legLocked?'0.65':'1')+'">'+(_legLocked?'🔒 ':'')+f.em+' '+f.nm+'</button>';
  });
  html+='</div>';
  // Selected faction detail
  const f=FACTIONS[selFac];
  const xp=(G.factionXp&&G.factionXp[selFac])||0;
  const isCur=(G.faction||'none')===selFac;
  html+='<div style="border:1px solid '+f.col+';border-radius:6px;padding:10px;margin-bottom:10px">'+
    '<div style="font-size:14px;color:'+f.col+';font-family:Cinzel,serif;margin-bottom:6px">'+f.em+' '+f.nm+'</div>'+
    '<div style="font-size:13px;color:var(--txt-b);line-height:1.6;margin-bottom:8px">'+f.desc+'</div>';
  if(f.levels&&selFac!=='none'&&selFac!=='legacy'){
    f.levels.forEach((l,i)=>{
      const unlocked=xp>=l.xp;
      const dispLvl=i+1;
      const tag='';
      html+='<div style="font-size:13px;color:'+(unlocked?'#88cc88':'#667788')+';margin-bottom:4px">'+(unlocked?'✅':'🔒')+' Ур.'+dispLvl+': '+l.desc+'</div>';
    });
    html+='<div style="font-size:12px;color:#66aaff;margin-top:4px">Ваш XP с этой фракцией: '+xp+'</div>';
  }
  if(selFac==='legacy'){
    const _legLocked=np<5;
    if(_legLocked){
      html+='<div style="background:rgba(30,20,0,.4);border:1px solid #664400;border-radius:6px;padding:8px 10px;margin-bottom:8px;display:flex;align-items:center;gap:8px">';
      html+='<span style="font-size:18px">🔒</span><div>';
      html+='<div style="font-size:13px;color:#aa8833;font-family:Cinzel,serif">Доступно с 5-го возвышения</div>';
      html+='<div style="font-size:11px;color:#775533">Сейчас: возвышение '+(np-1)+' из 5 нужных</div>';
      html+='</div></div>';
      // Show all perks grouped — dimmed but readable
      html+='<div style="font-size:12px;color:#776644;margin-bottom:6px">Особенности, которые вы сможете выбирать:</div>';
      const _perkGroups={syndicate:LEGACY_PERKS.filter(p=>p.fac==='syndicate'),maraketh:LEGACY_PERKS.filter(p=>p.fac==='maraketh')};
      ['syndicate','maraketh'].forEach(fid=>{
        const fc=FACTIONS[fid];
        html+='<div style="font-size:12px;color:'+fc.col+';opacity:0.6;margin-bottom:3px">'+fc.em+' '+fc.nm+':</div>';
        _perkGroups[fid].forEach(p=>{
          const _req=p.minFacXp>1?'<span style="color:#664422;font-size:11px"> — нужно '+p.minFacXp+' возвышения за '+fc.nm+'</span>':'';
          html+='<div style="font-size:12px;color:#667788;margin-bottom:3px;padding-left:8px">'+p.em+' <b style="color:#8899aa">'+p.nm+'</b> — '+p.desc+_req+'</div>';
        });
      });
      html+='<div style="font-size:12px;color:#666644;margin-top:6px;border-top:1px solid #443322;padding-top:6px">Слоты особенностей: <b style="color:#775533">2</b> (1е возвышение) · <b style="color:#886633">4</b> (2е) · <b style="color:#997733">6</b> (3е+)</div>';
    } else {
      const _futureXp=(xp||0)+1;
      const _s=FACTIONS.legacy.perkSlots;
      const _slots=_futureXp>=3?_s[3]:_futureXp>=2?_s[2]:_futureXp>=1?_s[1]:_s[0];
      const _pool=getLegacyPool();
      const _cur=G.legacyPerks||[];
      html+='<div style="font-size:13px;color:#cc9933;margin-bottom:6px">🎓 Ваш опыт открывает <b>'+_pool.length+'</b> особенностей из пула</div>';
      html+='<div style="font-size:12px;color:var(--txt-d);margin-bottom:4px">Слотов на этом возвышении: <b style="color:#cc9933">'+_slots+'</b></div>';
      if(_cur.length>0){
        html+='<div style="font-size:12px;color:#88cc88;margin-bottom:4px">Сейчас выбрано: '+_cur.map(pid=>{const p=LEGACY_PERKS.find(x=>x.id===pid);return p?p.em+' '+p.nm:pid;}).join(', ')+'</div>';
      }
      if(_pool.length===0){
        html+='<div style="font-size:12px;color:#ff6666">⚠ Нет опыта у других фракций. Поиграйте за Синдикат или Маракетов сначала.</div>';
      }
      html+='<div style="font-size:12px;color:#66aaff;margin-top:4px">XP Наследия: '+xp+' · После этого возвышения: XP → '+_futureXp+'</div>';
    }
  }
  html+='</div>';
  // Блок "Войти в делириум" — раскрывающийся
  const _hasSpl=(G.deliriumSplinters||0)>=100;
  const _alreadyDel=G._deliriumModeUnlocked||false;
  if(!_alreadyDel){
    html+='<details style="border:1px solid #553366;border-radius:6px;padding:8px 10px;margin-bottom:10px;background:rgba(40,0,60,.3)">';
    html+='<summary style="font-family:Cinzel,serif;font-size:13px;color:#aa66ff;cursor:pointer;list-style:none;display:flex;align-items:center;gap:6px">👁 ВОЙТИ В ДЕЛИРИУМ <span style="font-size:11px;color:#775599">(необязательно)</span></summary>';
    html+='<div style="margin-top:8px">';
    html+='<div style="font-size:12px;color:var(--txt-d);line-height:1.6;margin-bottom:8px">';
    html+='Потратить <b style="color:#cc88ff">100 осколков</b> и пройти атлас в условиях делириума.<br>';
    html+='<span style="color:#ff6666">Сложности:</span> -15% к шансу карт и боссов · Время карт ×1.5 · Провал карты стоит 5 осколков. Если осколки закончились — карты заблокированы пока не накопишь ещё.<br>';
    html+='<span style="color:#44ff88">Награда (1 раз):</span> 2й слот кластерного самоцвета + ачивка';
    html+='</div>';
    if(_hasSpl){
      html+='<label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:13px;color:#cc88ff">';
      html+='<input type="checkbox" id="del-mode-check" style="cursor:pointer"> Войти в делириум ('+G.deliriumSplinters+' осколков)';
      html+='</label>';
    } else {
      html+='<div style="font-size:12px;color:#664466">Нужно 100 осколков делириума (сейчас: '+(G.deliriumSplinters||0)+')</div>';
    }
    html+='</div></details>';
  } else {
    html+='<div style="border:1px solid #225533;border-radius:6px;padding:8px;margin-bottom:10px;background:rgba(0,40,20,.3);font-size:12px;color:#44aa66">✅ Режим делириума уже активирован в прошлом возвышении</div>';
  }
  const _isLegacySel=selFac==='legacy';
  const _legLocked2=_isLegacySel&&np<5;
  html+='<div style="display:flex;gap:8px">'+
    (_isLegacySel
      ?(_legLocked2
        ?'<button class="btn btn-p" style="flex:1;font-size:14px;opacity:0.4" disabled>🔒 Наследие — возвышение 5+</button>'
        :'<button class="btn btn-p" style="flex:1;font-size:14px" id="btn-legacy-pick-open">📜 Выбрать особенности →</button>'
      )
      :'<button class="btn btn-p" style="flex:1;font-size:14px" data-faction-pick="'+selFac+'">'+(isCur?'✨ Продолжить с '+f.nm:'✨ Выбрать '+f.nm)+'</button>'
    )+
    '<button class="btn btn-sm btn-r" id="btn-close-m">Отмена</button>'+
  '</div>';
  openM('✨ Возвышение',html);
  if(_isLegacySel){
    const _lb=document.getElementById('btn-legacy-pick-open');
    if(_lb)_lb.onclick=()=>{
      const _dc=document.getElementById('del-mode-check');
      window._pendingDeliriumMode=_dc?_dc.checked:false;
      openLegacyPick();
    };
  }
}
function openLegacyPick(pendingPerks){
  const pool=getLegacyPool();
  // Use future XP (current + 1) since prestige hasn't happened yet
  const _legXpFuture=((G.factionXp&&G.factionXp.legacy)||0)+1;
  const _s=FACTIONS.legacy.perkSlots;
  const slots=_legXpFuture>=3?_s[3]:_legXpFuture>=2?_s[2]:_legXpFuture>=1?_s[1]:_s[0];
  const fxp=G.factionXp||{};
  // pendingPerks — текущий выбор (для реактивного обновления без закрытия)
  if(!pendingPerks)pendingPerks=[...(G.legacyPerks||[])].slice(0,slots);
  // Ensure no more than slots
  while(pendingPerks.length>slots)pendingPerks.pop();

  const legCol='#cc9933';
  let html='';
  // Header info
  html+='<div style="background:rgba(80,60,0,.25);border:1px solid '+legCol+';border-radius:6px;padding:8px 10px;margin-bottom:10px">';
  html+='<div style="font-family:Cinzel,serif;color:'+legCol+';font-size:14px;margin-bottom:4px">📜 Наследие — выбор особенностей</div>';
  html+='<div style="font-size:12px;color:var(--txt-b)">Слотов особенностей: <b style="color:'+legCol+'">'+slots+'</b> · Выбрано: <b style="color:'+(pendingPerks.length===slots?'#88cc88':'#ffaa44')+'">'+pendingPerks.length+'</b></div>';
  if(pool.length===0){
    html+='<div style="font-size:12px;color:#ff6666;margin-top:6px">⚠ Нет доступных особенностей. Нужен XP у Синдиката или Маракетов.</div>';
  }
  html+='</div>';

  // Group by faction
  const facGroups={syndicate:[],maraketh:[]};
  pool.forEach(p=>{if(facGroups[p.fac])facGroups[p.fac].push(p);});

  ['syndicate','maraketh'].forEach(fid=>{
    const perks=facGroups[fid];
    if(!perks.length)return;
    const fc=FACTIONS[fid];
    const facXp=fxp[fid]||0;
    html+='<div style="font-family:Cinzel,serif;font-size:12px;color:'+fc.col+';margin-bottom:6px">'+fc.em+' '+fc.nm+' <span style="color:#aaa;font-size:11px">(репутация: '+facXp+')</span></div>';
    perks.forEach(p=>{
      const sel=pendingPerks.includes(p.id);
      const full=!sel&&pendingPerks.length>=slots;
      html+='<div style="display:flex;align-items:center;gap:8px;padding:7px 8px;margin-bottom:5px;border-radius:5px;border:1px solid '+(sel?fc.col:'#334')+';background:'+(sel?'rgba(80,60,0,.25)':'rgba(20,20,30,.4)')+';cursor:'+(full?'not-allowed':'pointer')+';opacity:'+(full?'.45':'1')+'" '+(full?'':'data-lperk="'+p.id+'"')+'>';
      html+='<span style="font-size:18px">'+p.em+'</span>';
      html+='<div style="flex:1"><div style="font-size:13px;color:'+(sel?fc.col:'var(--txt)')+'">'+p.nm+'</div><div style="font-size:11px;color:var(--txt-d)">'+p.desc+'</div></div>';
      html+='<div style="font-size:18px">'+(sel?'✅':'⬜')+'</div>';
      html+='</div>';
    });
  });

  // Footer buttons
  const canConfirm=pendingPerks.length>0&&pendingPerks.length<=slots;
  html+='<div style="display:flex;gap:8px;margin-top:8px">';
  html+='<button class="btn btn-sm" id="btn-legacy-back">← Назад</button>';
  html+='<button class="btn btn-p" style="flex:1" id="btn-legacy-confirm"'+(canConfirm?'':' disabled')+'>✨ Возвыситься с Наследием</button>';
  html+='</div>';
  if(!canConfirm&&slots>0)html+='<div style="font-size:11px;color:#aa7733;margin-top:5px;text-align:center">Выберите хотя бы 1 особенность</div>';

  openM('📜 Наследие — особенности',html);

  // Wire up click handlers
  document.getElementById('btn-legacy-back').onclick=()=>openFactionChoice('legacy');
  const confirmBtn=document.getElementById('btn-legacy-confirm');
  if(confirmBtn)confirmBtn.onclick=()=>{
    G.legacyPerks=[...pendingPerks];
    confirmPrestige('legacy');
  };
  // Perk toggle via event delegation on mbd
  const mbd=document.getElementById('mbd');
  if(mbd){
    mbd._legacyHandler=function(e){
      const el=e.target.closest('[data-lperk]');
      if(!el)return;
      const pid=el.dataset.lperk;
      const idx=pendingPerks.indexOf(pid);
      if(idx>=0){pendingPerks.splice(idx,1);}
      else if(pendingPerks.length<slots){pendingPerks.push(pid);}
      openLegacyPick(pendingPerks);
    };
    mbd.addEventListener('click',mbd._legacyHandler);
  }
}
function confirmPrestige(factionId){
  const np=(G.prestige||0)+1,nb=np*15,kg=Math.floor(G.gold*.15);
  // Проверяем чекбокс делириума
  const _delCheck=document.getElementById('del-mode-check');
  const _delWanted=_delCheck?_delCheck.checked:(window._pendingDeliriumMode||false);
  window._pendingDeliriumMode=false;
  const _enterDel=_delWanted&&(G.deliriumSplinters||0)>=100&&!G._deliriumModeUnlocked;
  const lstats={...G.stats};const lruns=G.totalRuns;
  const lachs={...G.achs};const lpend={...(G.achsPending||{})};
  const lfxp={...(G.factionXp||{})};const lfunl={...(G.factionUnlocks||{})};const lpass={...(G.passives||{})};
  const llegacyPerks=[...(G.legacyPerks||[])];
  // Preserve lifetime max cleared tier for delirium/feature gating
  const llifetimeMax=Math.max(G.lifetimeMaxCleared||0,...Object.keys(G.cleared||{}).map(Number).filter(n=>G.cleared[n]),0);
  const lspl=G.deliriumSplinters||0;
  const ldmu=G._deliriumModeUnlocked||false;
  const ldmr=G._deliriumModeRewarded||false;
  const lcs2=G._clusterSlot2||false;
  const lfishC=G._fishCaught||0;
  const lvoids={...( G.voidstones||{shaper:false,exarch:false,eater:false})};
  // Give faction XP for completing prestige
  if(factionId&&factionId!=='none'){lfxp[factionId]=(lfxp[factionId]||0)+1;}
  G=freshG();
  G.prestige=np;G.prestigeBonus=nb;G.gold=kg+100;G.maps={1:5,2:3,3:1};
  G.stats=lstats;G.totalRuns=lruns;G.achs=lachs;G.achsPending=lpend;
  G.factionXp=lfxp;G.factionUnlocks=lfunl;G.passives=lpass||{};
  G.legacyPerks=factionId==='legacy'?llegacyPerks:[];
  G._fishCaught=lfishC;
  G.lifetimeMaxCleared=llifetimeMax;
  G.faction=factionId||'none';
  // Режим делириума
  if(_enterDel){G.deliriumSplinters=(lspl||0)-100;G._deliriumMode=true;}
  else{G.deliriumSplinters=lspl||0;}
  G._deliriumModeUnlocked=ldmu||false;
  if(_enterDel)G._deliriumModeUnlocked=true;
  G._deliriumModeRewarded=ldmr||false;
  G._clusterSlot2=lcs2||false;
  G.voidstones=lvoids;
  // After prestige player has seen everything — unlock all UI immediately
  G._prestigeUnlockAll=true;
  // Apply faction start bonuses
  applyFactionStart();
  // Инициализируем шахту с нуля (престиж = полный сброс)
  dvInitGrid();
  G.contracts=[];G.contractRunsDone=0;if(hasSyndFeature())refreshContracts();
  closeM();
  log('✨ ВОЗВЫШЕНИЕ '+np+'! Фракция: '+FACTIONS[G.faction].nm,'info');
  showN('✨ Возвышение '+np+'! '+FACTIONS[G.faction].em+' '+FACTIONS[G.faction].nm,'pur');
  G.passivePending=(G.passivePending||0)+3;renderAll();updateDeliriumTab();
  // Force contracts panel visibility for legacy with synd perk
  if(hasSyndFeature())setTimeout(()=>{renderWorkers();refreshContracts();},50);
  save();if(G.passivePending>0)setTimeout(openPassiveTree,400);;
}
function applyFactionStart(){
  const f=FACTIONS[G.faction||'none'];if(!f)return;
  const xp=G.factionXp[G.faction]||0;
  // Syndicate bonuses
  if(G.faction==='syndicate'){
    G.selfLevel=3;G.selfPendingLevel=3;
    G.syndExtraWeapon=true;
    // Level 2 (xp>=2): +50% run speed + клинок
    const _syndLvls=f.levels||[];
    G.syndRunSpeed=_syndLvls.some(l=>l.xp<=xp&&l.reward&&l.reward.runSpeed)?1.50:1.0;
    // Level 2 reward: start uniq weapon
    if(xp>=2){
      if(!G.syndBladeGiven&&!G.inv.find(x=>x.name==='Клинок Синдиката')&&!(G.selfEq&&Object.values(G.selfEq).find(x=>x&&x.name==='Клинок Синдиката'))){
        const wu={id:++G.iid,name:'Клинок Синдиката',em:'🗡️',slot:'weapon',cls:'warrior',quality:'unique',tier:8,
          mods:[{stat:'dmgPhys',value:22},{stat:'critChance',value:12}],sellPrice:25};
        G.inv.push(wu);
        G.syndBladeGiven=true;
      }
    }
  }
  // Maraketh level 1 reward: add Gwendyn
  if(G.faction==='maraketh'&&xp>=2){
    G.wid=(G.wid||0)+1;const gwId=G.wid;const gw={...GWENDYN,id:gwId,wid:gwId,eq:{weapon:null,armor:null,helmet:null,ring:null}};
    G.wid=gw.wid;
    recalcW(gw);
    G.workers.push(gw);
    log('🏹 Гвенен присоединилась к отряду Маракетов!','ev');
    setTimeout(()=>renderWorkers(),50);
  }
  // Legacy: apply selected perks
  if(G.faction==='legacy'){
    G.syndRunSpeed=1.0;
    applyLegacyPerks();
    setTimeout(()=>renderWorkers(),50);
  }
}

// ══════════ EXPEDITION ════════════════════════════════════════
function openExpedition(){
  if(!G.workers.length){showN('Нет работников!');return;}
  const idle=G.workers.filter(w=>w.status==='idle');
  // Don't block opening — show 'no free workers' inside modal instead
  // Build tier availability (normal maps only)
  const tierCounts={};
  Object.keys(G.maps).filter(k=>!isNaN(k)&&G.maps[k]>0).forEach(k=>{
    const t=parseInt(k);tierCounts[t]=(tierCounts[t]||0)+G.maps[k];
  });
  if(Object.keys(tierCounts).length<1){showN('Нет карт для экспедиции!');return;}
  // Restore last selection if maps still available
  const maxExpSlots=(G.factionUnlocks&&G.factionUnlocks.exp5)?5:3;
  let initSlots=Array(maxExpSlots).fill(null);
  if(G.lastExpSlots){
    const tc2={...tierCounts};
    const restored=G.lastExpSlots.map(t=>{
      if(t!==null&&tc2[t]>0){tc2[t]--;return t;}return null;
    });
    // Pad to maxExpSlots if needed
    initSlots=Array(maxExpSlots).fill(null);
    restored.forEach((v,i)=>{if(i<maxExpSlots)initSlots[i]=v;});
  }
  window._exp={slots:initSlots,wid:null,tierCounts,maxSlots:maxExpSlots};
  window._exp.render=function(){
    const {slots,wid,tierCounts}=window._exp;
    const selW=wid?G.workers.find(x=>x.id===wid):null;
    // Chance display
    let chHtml='';
    const filled=slots.filter(Boolean);
    if(selW&&filled.length===filled.length&&filled.length>0){
      const hardest=Math.max(...filled);
      const stepCh=delModCh(calcCh(selW.dmg+selW.surv,hardest));
      const steps=filled.length;
      const totalCh=Math.pow(stepCh,steps);
      chHtml='<div style="margin:8px 0;font-size:15px;background:var(--bg2);border:1px solid var(--brd);padding:6px">'+
        '🗺 Шанс успеха: <b style="color:'+chcol(totalCh)+'">'+Math.round(totalCh*100)+'%</b> (все '+steps+' шага)'+
        '<div style="font-size:12px;color:var(--txt-d);margin-top:2px">Каждый шаг (T'+hardest+'): '+Math.round(stepCh*100)+'% · При провале — захват или ранение</div></div>';
    }
    // 3 slots
    const mxSh=window._exp.maxSlots||3;
    let html='<div style="font-size:14px;color:var(--txt-d);margin-bottom:6px">Выберите 3–5 карт и работника.</div><div style="font-size:12px;line-height:1.7;color:#6a6;background:rgba(30,60,30,.3);border:1px solid #3a5a3a;padding:6px 8px;border-radius:4px;margin-bottom:10px">'+gi(16)+' Золото ×1.2 за каждый шаг · 📦 Предметы ×1.5 · ⭐ Опыт<br><span style="color:#888">Больше карт → больше наград, но выше риск</span></div>';
    const mxS=window._exp.maxSlots||3;
    html+='<div style="display:grid;grid-template-columns:repeat('+mxS+',1fr);gap:6px;margin-bottom:10px">';
    slots.forEach((t,i)=>{
      const active=window._exp.pickSlot===i;
      html+='<div style="background:var(--bg4);border:2px solid '+(t?'var(--gold-d)':active?'var(--gold)':'var(--brd)')+';padding:8px;text-align:center;cursor:pointer;min-height:60px;display:flex;flex-direction:column;align-items:center;justify-content:center" data-xslot="'+i+'">';
      if(t){const md=MAP_TIERS[t-1];html+='<div style="font-size:19px">'+md.em+'</div><div style="font-size:14px;color:var(--gold)">T'+t+'</div><div style="font-size:11px;color:var(--txt-d)">'+md.nm.slice(0,9)+'</div><div style="font-size:11px;color:var(--red);cursor:pointer" data-xslot-clear="'+i+'">✕</div>';}
      else html+='<div style="font-size:25px;color:var(--brd)">+</div><div style="font-size:12px;color:var(--txt-d)">Слот '+(i+1)+'</div>';
      html+='</div>';
    });
    html+='</div>';
    // Tier picker — show whenever there are empty slots
    const _hasEmpty=slots.some(s=>s===null);
    if(_hasEmpty){
      const _used=slots.filter(s=>s!==null);
      html+='<div style="font-size:13px;color:var(--txt-d);margin-bottom:6px">Добавить карту:</div>';
      html+='<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:10px">';
      Object.keys(tierCounts).map(Number).sort((a,b)=>a-b).forEach(t=>{
        const avail=tierCounts[t]-_used.filter(x=>x===t).length;
        if(avail<=0)return;
        html+='<button class="btn btn-sm" data-xpick="'+t+'">T'+t+' ('+avail+')</button>';
      });
      html+='</div>';
    }
    html+=chHtml;
    // Worker
    html+='<div style="font-size:13px;color:var(--txt-d);margin-bottom:6px">Работник:</div>';
    const currentIdle=G.workers.filter(w=>w.status==='idle');
    if(!currentIdle.length){
      html+='<div style="padding:10px;background:var(--bg2);border:1px solid var(--brd);color:var(--txt-d);font-size:14px;text-align:center">Нет свободных работников</div>';
    }else{
      html+=currentIdle.map(iw=>{
        const sel=wid===iw.id;
        return '<div class="srow" style="cursor:pointer;border-color:'+(sel?'var(--gold)':'var(--brd)')+'" data-xworker="'+iw.id+'">'+
          wPortrait(iw.cls, WCLS[iw.cls].col, WCLS[iw.cls].em, '')+
          '<div class="si"><div class="snm">'+iw.name+' <span class="lvl-b">Ур.'+iw.level+'</span></div>'+
          '<div style="font-size:13px;color:var(--txt-d)">⚔️'+iw.dmg+' 🛡'+iw.surv+'</div></div>'+
          (sel?'<span class="gt" style="font-size:17px">✓</span>':'')+'</div>';
      }).join('');
    }
    const canGo=slots.filter(Boolean).length>=3&&wid&&currentIdle.find(w=>w.id===wid);
    html+='<div style="display:flex;gap:6px;margin-top:10px">'+
      '<button class="btn btn-p" id="btn-xgo"'+(canGo?'':' disabled')+'>🗺 Отправить</button>'+
      '<button class="btn btn-r btn-sm" id="btn-close-m">Отмена</button></div>';
    openM('🗺 Экспедиция',html);
  };
  window._exp.render();
}
function startExpedition(wid){
  const {slots,tierCounts}=window._exp;
  if(slots.filter(Boolean).length<3){showN('Выберите минимум 3 карты!');return;}
  const w=G.workers.find(x=>x.id===wid);if(!w||w.status!=='idle')return;
  const _running=G.workers.filter(x=>x.status==='running'||x.status==='exp').length;
  const _maxS=1+G.ups.slots;
  if(_running>=_maxS){showN('Нужен апгрейд Машины для ещё одного слота!');return;}
  // Check availability
  const filledSlots=slots.filter(Boolean);
  const needed={};filledSlots.forEach(t=>{needed[t]=(needed[t]||0)+1;});
  for(const t in needed){
    if((G.maps[parseInt(t)]||0)<needed[t]){showN('Не хватает карт T'+t+'!');return;}
  }
  for(const t in needed){G.maps[parseInt(t)]=Math.max(0,(G.maps[parseInt(t)]||0)-needed[t]);}
  G.lastExpSlots=[...filledSlots];
  w.status='exp';w.expTiers=[...filledSlots];w.expIdx=0;w.elapsed=0;w.prog=0;w.curMap=slots[0];
  log('🗺 '+w.name+' — экспедиция: T'+slots.join(', T'),'info');
  renderWorkers();renderMaps();
  // Reopen expedition modal with fresh state (don't close)
  setTimeout(()=>openExpedition(),50);
}


// ══════════ CONTRACTS ════════════════════════════════════════
const CONTRACT_TYPES=[
  {id:'run_tier',    gen:(t)=>({type:'run_tier',    tier:t, nm:'Пройти карту T'+t+'+',           desc:'Пройти любую карту тира '+t+' или выше',        progress:0, need:1,   reward:{gold:Math.floor(goldMax(MAP_TIERS[Math.min(15,t-1)]||(MAP_TIERS[15]))*(1+(G.prestigeBonus||0)/100))},done:false})},
  {id:'sell_items',  gen:(n)=>({type:'sell_items',  nm:'Продать '+n+' предметов',                desc:'Продать '+n+' предметов любого качества',         progress:0, need:n,   reward:{gold:Math.floor(n*goldMax(MAP_TIERS[Math.min(15,(G.maxTier||1)-1)])*(1+(G.prestigeBonus||0)/100)*0.6)},done:false})},
  {id:'find_rare',   gen:()=>({type:'find_rare',    nm:'Найти редкий предмет',                   desc:'Найти предмет качества Редкий или Уникальный',    progress:0, need:1,   reward:{gold:500,item:true},done:false})},
  {id:'run_streak',  gen:(n)=>({type:'run_streak',  streak:n, nm:'Пройти '+n+' карт подряд',    desc:'Пройти '+n+' карт подряд без травмы',              progress:0, need:n,   reward:{gold:n*120},done:false,curStreak:0})},
  {id:'sell_gold',   gen:(g)=>({type:'sell_gold',   goldNeed:g, nm:'Продать предметов на '+g+gi(16), desc:'Продать предметов суммарно на '+g+' золота',   progress:0, need:g,   reward:{gold:Math.floor(g*0.8)},done:false})},
  {id:'find_uniq',   gen:()=>({type:'find_uniq',    nm:'Найти уникальный предмет',               desc:'Найти предмет качества Уникальный',               progress:0, need:1,   reward:{gold:900,item:true},done:false})},
  {id:'run_grd',     gen:()=>({type:'run_grd',      nm:'Пройти карту Стража',                    desc:'Пройти любую карту стража',                        progress:0, need:1,   reward:{gold:800},done:false})},
];
function genContract(){
  const tier=Math.min(16,Math.max(1,(G.maxTier||1)-2+Math.floor(Math.random()*4)));
  // Delirium wave contract — T16 only, rare
  const _hasT10c=Object.keys(G.cleared||{}).some(k=>parseInt(k)>=10&&G.cleared[k]);
  if(_hasT10c&&Math.random()<0.15&&!(G.contracts||[]).some(x=>x.type==='delirium_wave')){
    const waveTarget=Math.floor(2+Math.random()*4); // 2-5 (reachable early)
    const rwd=Math.floor(goldMax(MAP_TIERS[14])*(1+(G.prestigeBonus||0)/100)*2);
    return {id:++G.iid,type:'delirium_wave',nm:'👁 Делириум: волна '+waveTarget,em:'👁',
      desc:'Войдите в Делириум и доберитесь до волны '+waveTarget+' живым (без провала).',
      need:waveTarget,progress:0,reward:{gold:rwd},done:false,failed:false};
  }
  const opts=CONTRACT_TYPES.filter(ct=>{
    if(ct.id==='run_grd'&&!(G.maxTier>=16))return false;
    if(ct.id==='find_uniq'&&!(G.maxTier>=10))return false;
    return true;
  });
  const ct=opts[Math.floor(Math.random()*opts.length)];
  let c;
  if(ct.id==='run_tier')    c=ct.gen(Math.max(3,tier));
  else if(ct.id==='sell_items') c=ct.gen([3,5,8][Math.floor(Math.random()*3)]);
  else if(ct.id==='run_streak') c=ct.gen([3,5][Math.floor(Math.random()*2)]);
  else if(ct.id==='sell_gold'){const _gv=Math.floor(goldMax(MAP_TIERS[Math.min(15,(G.maxTier||1)-1)])*(1+(G.prestigeBonus||0)/100));const _mult=[0.3,0.5,0.7][Math.floor(Math.random()*3)];const _gt=Math.floor(_gv*_mult);c=ct.gen(Math.min(1000,Math.max(80,_gt)));}
  else c=ct.gen();
  c.id='con_'+Date.now()+'_'+Math.random().toString(36).slice(2,6);
  return c;
}
function refreshContracts(){
  if(!hasSyndFeature())return;
  // Remove done/failed contracts — but keep unclaimed rewards
  G.contracts=G.contracts.filter(x=>(!x.done&&!x.failed)||(x.done&&x.needsClaim));
  const usedTypes=new Set(G.contracts.map(x=>x.type));
  // Count occupied slots: active + unclaimed
  const occupiedNormal=()=>G.contracts.filter(x=>!(x.type&&x.type.startsWith('master_'))&&x.type!=='delirium_wave'&&(!x.done||x.needsClaim)).length;
  // Always fill 4 normal contracts (don't replace unclaimed)
  let attempts=0;
  while(occupiedNormal()<4&&attempts<30){
    attempts++;
    const nc=genContract();
    // genContract may return delirium_wave — only allow 1
    if(nc.type==='delirium_wave'){
      if(!usedTypes.has('delirium_wave')){usedTypes.add('delirium_wave');G.contracts.push(nc);}
    }else{
      if(!usedTypes.has(nc.type)){usedTypes.add(nc.type);G.contracts.push(nc);}
    }
  }
  // Master contract: every 3rd reroll as 5th BONUS slot (doesn't displace normal ones)
  G.contractRerolls=(G.contractRerolls||0)+1;
  if(!G.contracts.some(x=>x.type&&x.type.startsWith('master_')&&!x.done&&!x.failed)){
    if(G.contractRerolls%3===0){tryAddMasterContract(true);}
  }
  renderContracts();
}
function tickContracts(){
  if(!hasSyndFeature())return;
  G.contractRunsDone=(G.contractRunsDone||0);
}
function checkContractRun(tier,result,isGrd){
  // result: 'ok'|'injured'|'captured'
  if(!hasSyndFeature())return;
  G.contractRunsDone=(G.contractRunsDone||0)+1;
  G.contracts.forEach(con=>{
    if(con.done)return;
    if(con.type==='run_tier'&&tier>=con.tier&&result==='ok'){con.progress=Math.min(con.need,con.progress+1);}
    if(con.type==='run_streak'){
      if(result==='ok'){con.curStreak=(con.curStreak||0)+1;con.progress=Math.min(con.need,con.curStreak);}
      else{con.curStreak=0;con.progress=0;}
    }
    if(con.type==='run_grd'&&isGrd&&result==='ok'){con.progress=Math.min(con.need,con.progress+1);}
    if(con.progress>=con.need)completeContract(con);
  });
  // Refresh contracts every 5 runs
  if(G.contractRunsDone%5===0){
    G.contracts=G.contracts.filter(c=>!c.done||c.needsClaim);
    refreshContracts();
  }
  renderContracts();
}
function checkContractSell(itemQuality,goldAmt){
  if(!hasSyndFeature())return;
  G.contracts.forEach(con=>{
    if(con.done)return;
    if(con.type==='sell_items'){con.progress=Math.min(con.need,con.progress+1);}
    if(con.type==='sell_gold'){con.progress=Math.min(con.need,con.progress+goldAmt);}
    if(con.progress>=con.need)completeContract(con);
  });
  renderContracts();
}
function checkContractFind(quality){
  if(!hasSyndFeature())return;
  G.contracts.forEach(con=>{
    if(con.done)return;
    if(con.type==='find_rare'&&(quality==='rare'||quality==='unique')){con.progress=Math.min(con.need,con.progress+1);}
    if(con.type==='find_uniq'&&quality==='unique'){con.progress=Math.min(con.need,con.progress+1);}
    if(con.progress>=con.need)completeContract(con);
  });
  renderContracts();
}
function completeContract(con){
  if(con.done)return;con.done=true;con.needsClaim=true;
  sfxContract();
  showN('📋 Контракт выполнен: '+con.nm+' — Нажмите Получить','con');
  log('📋 Контракт выполнен: '+con.nm,'info');
  renderContracts();save();
}
function claimContract(cid){
  const con=(G.contracts||[]).find(x=>String(x.id)===String(cid)&&x.done&&x.needsClaim);if(!con)return;
  con.needsClaim=false;
  G.stats.contractsDone=(G.stats.contractsDone||0)+1;
  if(con.type&&con.type.startsWith('master_'))G.stats.mastersDone=(G.stats.mastersDone||0)+1;
  const r=con.reward||{};
  if(r.gold){G.gold+=r.gold;G.stats.ge+=r.gold;floatT('+'+r.gold+gi(16),'#f0d080');log(gi(16)+' Получено: '+con.nm+' +'+r.gold+gi(16),'ge');showN('+'+r.gold+gi(16),'pur');}
  if(r.item){const it=genItem(Math.max(1,G.maxTier-2),G.selfCls||'warrior');G.inv.push(it);log('📦 Получен предмет: '+it.em+' '+it.name,'i-'+it.quality[0]);}
  updateRes();save();renderContracts();
}
function renderContracts(){
  const el=document.getElementById('contracts-panel');if(!el)return;
  if(!hasSyndFeature()){el.style.display='none';return;}
  el.style.display='';
  if(!G.contracts||!G.contracts.length)refreshContracts();
  const active=G.contracts;
  let html='';
  active.forEach(con=>{
    if(con.done){
      html+='<div style="background:var(--bg3);border:1px solid #335533;border-radius:5px;padding:7px 9px;margin-bottom:5px;opacity:.6">'+
        '<div style="display:flex;justify-content:space-between;align-items:center">'+
          '<span style="font-size:13px;color:#888;text-decoration:line-through">'+con.nm+'</span>'+
          (con.needsClaim?'<div style="display:flex;align-items:center;gap:5px"><button class="btn btn-sm" style="padding:1px 8px;font-size:12px;background:#553300;border-color:#ffa000;color:#ffcc44" data-claim-id="'+con.id+'">'+gi(16)+' Получить</button><span style="font-size:13px;color:#ffaa44">'+((con.reward&&con.reward.gold)||0)+gi(16)+'</span></div>':'<div style="display:flex;align-items:center;gap:5px"><button class="btn btn-sm" style="padding:1px 8px;font-size:12px;background:#333;border-color:#444;color:#777" disabled>✅ Получено</button><span style="font-size:13px;color:#555">'+((con.reward&&con.reward.gold)||0)+gi(16)+'</span></div>')+
        '</div></div>';
      return;
    }
    if(con.failed){
      html+='<div style="background:var(--bg3);border:1px solid #550000;border-radius:5px;padding:7px 9px;margin-bottom:5px;opacity:.6">'+
        '<div style="display:flex;justify-content:space-between;align-items:center">'+
          '<span style="font-size:13px;color:#888;text-decoration:line-through">'+con.nm+'</span>'+
          '<span style="font-size:13px;color:#cc4444;font-weight:600">❌ ПРОВАЛЕНО</span>'+
        '</div></div>';
      return;
    }
    // Master contract — fight button
    if(con.type&&con.type.startsWith('master_')){
      const _lp=sDmg()+sSurv();
      const _mct=Math.max(...Object.keys(G.cleared||{}).map(Number).filter(n=>G.cleared[n]),0);
      let _v=0;
      const chCol=con.type==='master_brawl'
        ? ((_v=Math.min(0.85,Math.max(0.35,calcCh(_lp,Math.min(16,_mct+1)))))>=0.7?'#44cc44':_v>=0.5?'#cccc44':'#cc4444')
        : ((_v=Math.min(0.82,Math.max(0.30,calcCh(_lp,Math.min(16,_mct+2))*0.9)))>=0.7?'#44cc44':_v>=0.5?'#cccc44':'#cc4444');
      const _liveCh=Math.round(_v*100);con.ch=_liveCh;
      const r=con.reward||{};
      const rwdStr=r.gold?(r.item?r.gold+gi(16)+' + предмет':r.gold+gi(16)):(r.item?'предмет':'');
      if(con.active){
        html+='<div style="background:var(--bg3);border:2px solid #884400;border-radius:5px;padding:7px 9px;margin-bottom:5px">'+
          '<div style="display:flex;justify-content:space-between;margin-bottom:4px">'+
            '<span style="font-size:13px;color:#ffaa44;font-weight:700">'+con.em+' '+con.nm+'</span>'+
            '<span style="font-size:12px;color:var(--gold)">'+rwdStr+'</span>'+
          '</div>'+
          '<div id="mcon-lbl-'+con.id+'" style="font-size:12px;color:var(--txt-d);margin-bottom:4px">Вступаете в бой...</div>'+
          '<div style="height:5px;background:var(--bg2);border-radius:3px"><div id="mcon-prog-'+con.id+'" style="height:100%;width:0%;background:linear-gradient(90deg,#882200,#ff6600);border-radius:3px;transition:width .05s"></div></div>'+
        '</div>';
      }else{
        html+='<div style="background:var(--bg3);border:2px solid #553300;border-radius:5px;padding:7px 9px;margin-bottom:5px">'+
          '<div style="display:flex;justify-content:space-between;margin-bottom:3px">'+
            '<span style="font-size:13px;color:#ffaa44;font-weight:700">'+con.em+' '+con.nm+'</span>'+
            '<span style="font-size:12px;color:var(--gold)">'+rwdStr+'</span>'+
          '</div>'+
          '<div style="font-size:12px;color:var(--txt-d);margin-bottom:5px">'+con.desc+'</div>'+
          '<div style="display:flex;justify-content:space-between;align-items:center">'+
            '<span style="font-size:13px;color:'+chCol+'">Шанс успеха: '+_liveCh+'%</span>'+
            '<button class="btn btn-sm btn-p" style="background:#553300;border-color:#aa6600" data-master-id="'+con.id+'">⚔️ Принять бой</button>'+
          '</div>'+
        '</div>';
      }
      return;
    }
    const pct=Math.min(100,Math.round((con.progress/con.need)*100));
    const r=con.reward||{};
    const rwdStr=r.gold?(r.item?r.gold+gi(16)+' + предмет':r.gold+gi(16)):(r.item?'предмет':'');
    html+='<div style="background:var(--bg3);border:1px solid #553333;border-radius:5px;padding:7px 9px;margin-bottom:5px">'+
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:3px">'+
        '<span style="font-size:13px;color:#ffaa66;font-weight:600">'+con.nm+'</span>'+
        '<span style="font-size:12px;color:var(--gold)">'+rwdStr+'</span>'+
      '</div>'+
      '<div style="font-size:12px;color:var(--txt-d);margin-bottom:4px">'+con.desc+'</div>'+
      '<div style="display:flex;align-items:center;gap:6px">'+
        '<div style="flex:1;height:4px;background:var(--bg2);border-radius:2px">'+
          '<div style="height:100%;width:'+pct+'%;background:#cc4444;border-radius:2px;transition:width .3s"></div>'+
        '</div>'+
        '<span style="font-size:12px;color:var(--txt-d);min-width:35px;text-align:right">'+con.progress+'/'+con.need+'</span>'+
      '</div>'+
    '</div>';
  });
  if(!active.length)html='<div style="font-size:13px;color:var(--txt-d);padding:8px;text-align:center">Все контракты выполнены! Новые через '+Math.max(0,5-(G.contractRunsDone%5))+' карт.</div>';
  const _rerollCost=Math.max(50,Math.floor(goldMax(MAP_TIERS[Math.min(15,(G.maxTier||1)-1)])*(1+(G.prestigeBonus||0)/100)*0.3));
  el.innerHTML='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">'+
    '<div style="font-size:12px;color:#cc4444;font-family:Cinzel,serif">📋 КОНТРАКТЫ</div>'+
    '<button class="btn btn-sm" style="font-size:11px;padding:2px 7px" id="btn-reroll-contracts">🔄 Обновить ('+_rerollCost+gi(16)+')</button>'+
  '</div>'+
  '<div style="font-size:11px;color:var(--txt-d);margin-bottom:6px">Авто-обновление через '+Math.max(0,5-(G.contractRunsDone%5))+' карт</div>'+html;
}




const PASSIVE_TREE = {
  branches: [
    {
      id: 'cartographer',
      nm: 'Картограф',
      em: '🗺️',
      color: '#44aaff',
      nodes: [
        {id:'carto_1', nm:'Картовед',        em:'📍', desc:'+15% к шансу выпадения карт',           stat:'mapDropPct',  val:15},
        {id:'carto_2', nm:'Тировед',          em:'🔺', desc:'+1 к максимальному тиру дропа карт',   stat:'mapTierBonus',val:1},
        {id:'carto_3', nm:'Картограф-мастер', em:'🌍', desc:'Заражённые карты падают в 2x чаще',    stat:'cursedMapPct',val:100},
      ]
    },
    {
      id: 'mercenary',
      nm: 'Наёмник',
      em: '🗡️',
      color: '#ffaa44',
      nodes: [
        {id:'merc_1', nm:'Тренер',        em:'⚔️',    desc:'Работники получают +10% к урону и выживаемости', stat:'workerStatPct', val:10},
        {id:'merc_2', nm:'Мародёр',       em:'💰',      desc:'+15% к золоту за экспедиции',                   stat:'expGoldPct',   val:15},
        {id:'merc_3', nm:'Командир',      em:'👑',      desc:'Стоимость выкупа захваченных -25%',             stat:'rescueCostPct',val:25},
      ]
    },
    {
      id: 'hunter',
      nm: 'Охотник',
      em: '🏹',
      color: '#44cc88',
      nodes: [
        {id:'hunt_1', nm:'Следопыт',      em:'🧲',   desc:'+12% к шансу выпадения предметов',     stat:'dropPct',     val:12},
        {id:'hunt_2', nm:'Стервятник',    em:'🦅',   desc:'+20% к золоту за карты',               stat:'goldPct',     val:20},
        {id:'hunt_3', nm:'Охотник-мастер',em:'🎯', desc:'Стражи падают на 30% чаще',             stat:'grdDropPct',  val:30},
      ]
    }
  ]
};

const CLUSTER_STATS=[
  {stat:'goldPct',     nm:'Золото',    desc:'% к золоту',        type:'gold'},
  {stat:'dropPct',     nm:'Дроп',      desc:'% к дропу предметов',type:'drop'},
  {stat:'dmgPct',      nm:'Урон',      desc:'% к урону',         type:'dmg'},
  {stat:'survPct',     nm:'Выживаем.', desc:'% к выживаемости',  type:'surv'},
  {stat:'mapDropPct',  nm:'Дроп карт', desc:'% к дропу карт',    type:'map'},
  {stat:'grdDropPct',  nm:'Стражи',    desc:'% к дропу стражей', type:'grd'},
];