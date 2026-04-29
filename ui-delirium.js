// ui-delirium.js — делириум, звук, tick
// Зависимости: mechanics.js, utils.js

function openDelirium(){renderDelirium();}

function renderDelirium(){
  const el=document.getElementById('delirium-portal');if(!el)return;
  if(G.deliriumRunning&&window._delTimer){return;} // don't clobber animation
  const _clearedTiers=Object.keys(G.cleared||{}).map(Number).filter(n=>G.cleared[n]);
  const _currentMax=_clearedTiers.length?Math.max(..._clearedTiers):0;
  const _hasT10=_currentMax>=10;
  const _hasT16=_currentMax>=16;
  if(!_hasT10){
    el.innerHTML='<div style="text-align:center;padding:20px;border:1px solid #332244;border-radius:6px;background:rgba(20,0,30,.4);">'+
      '<div style="font-size:32px;margin-bottom:8px">🌫️</div>'+
      '<div style="font-family:Cinzel,serif;color:#664488;font-size:14px;margin-bottom:8px;letter-spacing:1px">СИМУЛЯКР</div>'+
      '<div style="font-size:13px;color:#553366;line-height:1.6">Что-то шевелится за гранью реальности...</div>'+
      '<div style="font-size:11px;color:#442255;margin-top:10px">Доступ откроется после T10</div>'+
    '</div>';
    return;
  }
  const wave=G.deliriumWave||0;
  const pending=G.deliriumPending||[];
  const ch=delWaveCh(wave+1);
  const wdef=getDelWave(wave+1);
  const rwd=delWaveReward(wave+1);

  let html='<div style="padding:8px">';

  // Header + resources
  html+='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">';
  html+='<div style="font-family:Cinzel,serif;font-size:15px;color:#cc88ff">🌫️ СИМУЛЯКР</div>';
  html+='<div style="font-size:13px;color:var(--txt-d)">'+
    '👁 Осколки: <span style="color:#cc88ff">'+G.deliriumSplinters+'</span> &nbsp; '+
    '🔮 Сферы: <span style="color:#aa66ff">'+G.deliriumOrbs+'</span>'+
  '</div></div>';

  if(wave===0&&!pending.length){
    // Intro screen
    html+='<div style="background:rgba(60,0,80,.3);border:1px solid #553377;border-radius:6px;padding:12px;margin-bottom:10px;font-size:13px;line-height:1.8;color:var(--txt-d)">';
    html+='Симулякр открывается перед вами.<br>';
    html+='Вы входите в волны безумия нарастающей сложности.<br>';
    html+='<span style="color:#cc88ff">После каждой волны — выбор: идти дальше или выйти.</span><br>';
    html+='Если погибнете — <span style="color:#ff4444">потеряете все накопленное в этом заходе.</span><br>';
    html+='Награды: <span style="color:#aa66ff">🔮 Сферы делириума</span> (расходник на карты) + <span style="color:#cc88ff">👁 Осколки делириума</span> (сохраняются навсегда).</div>';
    html+=nextWaveBlock(wave+1,ch,wdef,rwd);
    html+='<button class="btn btn-p" style="background:#553377;border-color:#aa55ff;margin-top:8px" onclick="startDeliriumRun()">👁 Войти в Симулякр</button>';
  } else if(G.deliriumRunning){
    // Wave in progress
    html+='<div style="text-align:center;padding:20px">';
    html+='<div style="font-size:32px;margin-bottom:8px">'+wdef.em+'</div>';
    html+='<div style="font-size:17px;color:#cc88ff;margin-bottom:4px">Волна '+wave+': '+wdef.nm+'</div>';
    html+='<div style="font-size:13px;color:var(--txt-d);margin-bottom:12px">'+wdef.mobs+(wdef.boss?' · Босс: '+wdef.boss:'')+'</div>';
    html+='<div class="prog-bar" style="height:8px;max-width:300px;margin:0 auto 16px"><div class="prog-fill purple" id="del-prog" style="width:0%"></div></div>';
    html+='<div style="font-size:13px;color:var(--txt-d)" id="del-prog-lbl">Сражаетесь...</div>';
    html+='</div>';
  } else if(pending.length){
    // Offer to continue or exit
    const totalOrbs=pending.reduce((a,r)=>a+r.orbs,0);
    const totalSpl=pending.reduce((a,r)=>a+r.splinters,0);
    html+='<div style="background:rgba(60,0,80,.3);border:1px solid #553377;border-radius:6px;padding:10px;margin-bottom:10px">';
    html+='<div style="font-size:14px;color:#44cc44;margin-bottom:6px">✅ Волна '+wave+' пройдена!</div>';
    const totalClusters=pending.filter(r=>r.cluster).length;
    html+='<div style="font-size:13px;color:var(--txt-d);margin-bottom:4px">Накоплено в этом заходе:</div>';
    html+='<div style="font-size:14px;color:#aa66ff;margin-bottom:10px">🔮 '+totalOrbs+' орбов &nbsp; 👁 '+totalSpl+' осколков'+(totalClusters?' &nbsp; <span style="color:#cc88ff">🔮 '+totalClusters+' самоцвет'+(totalClusters>1?'ов':'')+'</span>':'')+'</div>';
    if(wave<99){
      html+=nextWaveBlock(wave+1,ch,wdef,rwd);
      html+='<div style="display:flex;gap:8px;margin-top:10px">';
      html+='<button class="btn btn-p" style="background:#553377;border-color:#aa55ff" onclick="continueDelirium()">'+wdef.em+' Продолжить → Волна '+(wave+1)+'</button>';
      html+='<button class="btn" onclick="exitDelirium(false)">'+gi(16)+' Выйти и забрать награды</button>';
      html+='</div>';
    } else {
      html+='<button class="btn btn-p" onclick="exitDelirium(false)">'+gi(16)+' Забрать награды</button>';
    }
    html+='</div>';
  }
  el.innerHTML=html;
}

function nextWaveBlock(n,ch,wdef,rwd){
  const chColor=ch>=0.7?'#44cc44':ch>=0.4?'#cccc44':'#cc4444';
  return '<div style="background:rgba(40,0,60,.4);border:1px solid #442255;border-radius:5px;padding:10px;font-size:13px">'+
    '<div style="color:#cc88ff;font-family:Cinzel,serif;margin-bottom:6px">Следующая: Волна '+n+' — '+wdef.em+' '+wdef.nm+'</div>'+
    '<div style="color:var(--txt-d);margin-bottom:4px">👾 '+wdef.mobs+(wdef.boss?' · 💀 Босс: <span style="color:#ff7744">'+wdef.boss+'</span>':'')+'</div>'+
    '<div style="margin-bottom:4px">Шанс пройти: <span style="color:'+chColor+';font-size:14px;font-weight:600">'+Math.round(ch*100)+'%</span></div>'+
    '<div style="color:#aa66ff">Награда: 🔮 +'+rwd.orbs+' орбов'+(rwd.splinters?' · 👁 +'+rwd.splinters+' осколков':'')+'</div>'+
  '</div>';
}

function startDeliriumRun(){
  if(G.selfRun){showN('Сначала завершите текущий поход!');return;}
  G.deliriumWave=0;G.deliriumPending=[];G.deliriumRunning=true;
  advanceDeliriumWave();
}

function continueDelirium(){
  if(G.selfRun){showN('Сначала завершите текущий поход!');return;}
  G.deliriumRunning=true;
  advanceDeliriumWave();
}

function advanceDeliriumWave(){
  G.deliriumWave=(G.deliriumWave||0)+1;
  G.deliriumRunning=true;
  if(window._delTimer)clearInterval(window._delTimer);
  renderDelirium();
  let progress=0;
  const waveTime=Math.floor((2000+G.deliriumWave*300)*1.2);
  const steps=waveTime/50;
  window._delTimer=setInterval(()=>{
    progress+=1/steps;
    const bar=document.getElementById('del-prog');
    const lbl=document.getElementById('del-prog-lbl');
    if(bar)bar.style.width=Math.min(100,Math.round(progress*100))+'%';
    if(lbl)lbl.textContent=progress<0.5?'Сражаетесь...':progress<0.9?'Финальный натиск...':'Исход решается...';
    if(progress>=1){clearInterval(window._delTimer);window._delTimer=null;resolveDeliriumWave();}
  },50);
}

function resolveDeliriumWave(){
  const wave=G.deliriumWave;
  const ch=delWaveCh(wave);
  const _delOrbActive=G.deliriumMaps&&G.deliriumMaps[String(G.selfRun&&(G.selfRun.mapKey||G.selMap)||'')];
  const ok=Math.random()<ch;
  G.deliriumRunning=false;window._delTimer=null;
  if(!ok){
    // Death — lose all pending
    const lostOrbs=G.deliriumPending.reduce((a,r)=>a+r.orbs,0);
    const lostSpl=G.deliriumPending.reduce((a,r)=>a+r.splinters,0);
    G.deliriumWave=0;G.deliriumPending=[];
    sfxDeath();
    log('💀 Погибли в Делирии на волне '+wave+'! Потеряно: 🔮'+lostOrbs+' 👁'+lostSpl,'ev');
    showN('💀 Делирий: гибель на волне '+wave+'!','red');
    const el=document.getElementById('delirium-portal');
    if(el){
      const wdef=getDelWave(wave);
      el.innerHTML='<div style="padding:20px;text-align:center">'+
        '<div style="font-size:36px;margin-bottom:8px">💀</div>'+
        '<div style="font-size:17px;color:#ff4444;margin-bottom:6px">Вы пали на волне '+wave+'</div>'+
        '<div style="font-size:14px;color:var(--txt-d);margin-bottom:4px">'+wdef.em+' '+wdef.nm+' оказался сильнее</div>'+
        '<div style="font-size:13px;color:#ff6666;margin-bottom:16px">Потеряно: 🔮'+lostOrbs+' орбов · 👁'+lostSpl+' осколков</div>'+
        '<div style="display:flex;gap:8px;justify-content:center;margin-top:4px">'+
        '<button class="btn" onclick="renderDelirium()">↩ Ко входу</button>'+
        '<button class="btn btn-p" style="background:#330033;border-color:#aa44aa" onclick="startDeliriumRun()">▶ Снова с волны 1</button>'+
        '</div>'+
      '</div>';
    }
    save();return;
  }
  // Success — collect reward
  const rwd=delWaveReward(wave);
  // Cluster jewel drop: wave 8+, ~20% chance — store in rwd for pending
  if(wave>=8&&Math.random()<0.20){rwd.cluster=genCluster(wave);}
  G.deliriumPending.push(rwd);
  G.stats.delWaves=(G.stats.delWaves||0)+1;
  G.stats.delMaxWave=Math.max(G.stats.delMaxWave||0,wave);
  G.stats.delWaves=(G.stats.delWaves||0)+1;
  G.stats.delMaxWave=Math.max(G.stats.delMaxWave||0,wave);
  sfxDeliriumWave();log('✅ Делирий волна '+wave+' пройдена! +👁'+rwd.splinters+(rwd.orbs?' +🔮'+rwd.orbs:''),'info');
  save();
  renderDelirium();
}

function exitDelirium(died){
  if(died)return; // called from resolveDeliriumWave on death
  // Collect all pending rewards
  const totalOrbs=G.deliriumPending.reduce((a,r)=>a+r.orbs,0);
  const totalSpl=G.deliriumPending.reduce((a,r)=>a+r.splinters,0);
  G.deliriumOrbs=(G.deliriumOrbs||0)+totalOrbs;
  G.deliriumSplinters=(G.deliriumSplinters||0)+totalSpl;
  G.deliriumPending.forEach(r=>{if(r.cluster){G.inv.push(r.cluster);log('🔮 Получен Кластерный Самоцвет: '+r.cluster.name,'i-r');}});
  // Check delirium wave contracts — highest wave REACHED (pending.length = waves cleared)
  const _wavesCleared=G.deliriumPending.length; // e.g. cleared waves 1,2,3 = length 3
  (G.contracts||[]).forEach(con=>{
    if(con.type==='delirium_wave'&&!con.done&&!con.failed){
      con.progress=Math.max(con.progress||0,_wavesCleared);
      if(_wavesCleared>=con.need){completeContract(con);}
      else{renderContracts();}
    }
  });
  G.deliriumPending=[];G.deliriumWave=0;G.deliriumRunning=false;
  log('🌫️ Вышли из Делириума. Получено: 🔮'+totalOrbs+' орбов · 👁'+totalSpl+' осколков','info');
  showN('🌫️ +🔮'+totalOrbs+' орбов · +👁'+totalSpl+' осколков','pur');
  updateRes();save();renderDelirium();
}

// Apply delirium orb to selected map
function applyDeliriumOrb(key){
  if(!G.deliriumOrbs||G.deliriumOrbs<1){showN('Нет сфер делириума!');return;}
  if(!G.maps[key]||G.maps[key]<1){showN('Нет такой карты!');return;}
  if(!G.deliriumMaps)G.deliriumMaps={};
  if(G.deliriumMaps[key]){showN('Уже применён орб!');return;}
  G.deliriumOrbs--;G.deliriumMaps[key]=true;
  showN('🔮 Орб делириума применён! +20% дроп и золото','pur');
  renderMaps();updateRes();save();
}


// ══════════ MASTER CONTRACTS ══════════════════════════════════
// Rare missions that appear on the board with a "fight" button
// Types: brawl (fight enemy, 75-80% success), raid (clear zone T10+), boss_hunt (T16 only, rare)
const MASTER_CONTRACT_DEFS=[
  {id:'brawl', nm:'Заказ: Ликвидация цели', em:'⚔️',
   gen:()=>{
     const power=sDmg()+sSurv();
     const _maxClearedT=Math.max(...Object.keys(G.cleared||{}).map(Number).filter(n=>G.cleared[n]),0);
     const _refTier=Math.max(1,_maxClearedT);
     const _refDgr=MAP_TIERS[Math.min(15,_refTier)].dgr;
     const ch=Math.min(0.85,Math.max(0.35,calcCh(power,Math.min(16,_refTier+1))));
     const rwd=Math.floor(goldMax(MAP_TIERS[Math.min(15,(G.maxTier||1)-1)])*(1+(G.prestigeBonus||0)/100)*2.5);
     return {type:'master_brawl',nm:'Заказ: Ликвидация',em:'⚔️',
       desc:'Синдикат требует устранить цель. Прямое столкновение.',
       ch:Math.round(ch*100),reward:{gold:rwd},
       progress:0,need:1,done:false,failed:false,active:false};
   }},
  {id:'raid', nm:'Заказ: Зачистка района', em:'🔱',
   gen:()=>{
     const power=sDmg()+sSurv();
     const _maxClearedR=Math.max(...Object.keys(G.cleared||{}).map(Number).filter(n=>G.cleared[n]),0);
     const _refTierR=Math.max(1,_maxClearedR);
     const ch=Math.min(0.82,Math.max(0.30,calcCh(power,Math.min(16,_refTierR+2))*0.9));
     const rwd=Math.floor(goldMax(MAP_TIERS[Math.min(15,(G.maxTier||1)-1)])*(1+(G.prestigeBonus||0)/100)*3.5);
     return {type:'master_raid',nm:'Заказ: Зачистка',em:'🔱',
       desc:'Полностью зачистить укреплённый район от врагов Синдиката.',
       ch:Math.round(ch*100),reward:{gold:rwd,item:true},
       progress:0,need:1,done:false,failed:false,active:false};
   }},
  {id:'boss_hunt', nm:'Заказ: Охота на босса', em:'💠',
   gen:()=>{
     const power=sDmg()+sSurv();
     const ch=Math.min(0.75,Math.max(0.10,(power/1200-0.2)/0.7*0.70));
     const rwd=Math.floor(goldMax(MAP_TIERS[14])*(1+(G.prestigeBonus||0)/100)*6);
     return {type:'master_boss',nm:'Заказ: Охота на босса',em:'💠',
       desc:'Цель — элитный противник Синдиката. Крайне опасно.',
       ch:Math.round(ch*100),reward:{gold:rwd,item:true},
       progress:0,need:1,done:false,failed:false,active:false,isMaster:true};
   }},
];

function tryAddMasterContract(forced){
  if(!hasSyndFeature())return;
  if(!G.contracts)G.contracts=[];
  // Check if already have an ACTIVE (not done/failed) master contract
  if(G.contracts.some(x=>x.type&&x.type.startsWith('master_')&&!x.done&&!x.failed))return;
  // Allow master as 5th bonus — only block if already have active master
  if(G.contracts.filter(x=>x.type&&x.type.startsWith('master_')&&!x.done&&!x.failed).length>=1)return;
  let def=null;
  if(forced){
    // Guaranteed — pick brawl or raid (boss_hunt only if T16)
    def=(G.cleared&&G.cleared[16]&&Math.random()<0.15)?MASTER_CONTRACT_DEFS[2]:MASTER_CONTRACT_DEFS[Math.floor(Math.random()*2)];
  }else{
    const roll=Math.random();
    if(roll<0.20){def=MASTER_CONTRACT_DEFS[Math.floor(Math.random()*2)];}
    else if(G.cleared&&G.cleared[16]&&roll<0.25){def=MASTER_CONTRACT_DEFS[2];}
  }
  if(!def)return;
  const mc=def.gen();
  mc.id='master_'+Date.now()+'_'+Math.random().toString(36).slice(2,5);
  G.contracts.push(mc);
  log('📋 Новый заказ Синдиката: '+mc.nm,'ev');
  showN('📋 '+mc.nm+' · '+mc.ch+'% шанс','pur');
  renderContracts();
}

function startMasterContract(id){
  if(G.selfRun||G.actRun){showN('Сначала завершите текущий поход!');return;}
  const con=G.contracts.find(x=>x.id===id);
  if(!con||con.done||con.failed||con.active)return;
  con.active=true;
  renderContracts();
  // Animate fight
  if(window._masterTimer)clearInterval(window._masterTimer);
  let prog=0;
  const fightTime=3000+Math.random()*2000;
  const steps=fightTime/60;
  window._masterTimer=setInterval(()=>{
    prog+=1/steps;
    const bar=document.getElementById('mcon-prog-'+id);
    const lbl=document.getElementById('mcon-lbl-'+id);
    if(bar)bar.style.width=Math.min(100,Math.round(prog*100))+'%';
    if(lbl)lbl.textContent=prog<0.4?'Вступаете в бой...':prog<0.75?'Сражаетесь!':prog<0.95?'Финальный удар...':'Исход...';
    if(prog>=1){
      clearInterval(window._masterTimer);window._masterTimer=null;
      resolveMasterContract(id);
    }
  },60);
}

function resolveMasterContract(id){
  const con=G.contracts.find(x=>x.id===id);
  if(!con)return;
  con.active=false;
  const ok=Math.random()*100<con.ch;
  if(ok){
    completeContract(con);
  }else{
    con.failed=true;
    log('❌ Заказ провален: '+con.nm,'ev');
    showN('❌ '+con.nm+' — провалено!','red');
    save();
  }
  renderContracts();
}


// ══════════ AUDIO ══════════════════════════════════════════════
function playTone(freq,dur,type,vol){
  try{
    const ctx=window._aC||(window._aC=new(window.AudioContext||window.webkitAudioContext)());
    const o=ctx.createOscillator(),g=ctx.createGain();
    o.connect(g);g.connect(ctx.destination);
    o.type=type||'sine';o.frequency.value=freq;
    g.gain.setValueAtTime(vol||0.18,ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+dur);
    o.start();o.stop(ctx.currentTime+dur);
  }catch(e){}
}
function sfxLevelUp(){playTone(523,.12,'sine',.2);setTimeout(()=>playTone(659,.12,'sine',.18),120);setTimeout(()=>playTone(784,.22,'sine',.22),240);}
function sfxDeath(){playTone(220,.18,'sawtooth',.15);setTimeout(()=>playTone(180,.35,'sawtooth',.12),200);}
function sfxGold(){playTone(880,.06,'sine',.08);setTimeout(()=>playTone(1047,.1,'sine',.07),80);}
function sfxDeliriumWave(){playTone(300,.15,'sine',.06);setTimeout(()=>playTone(350,.2,'sine',.05),180);} // subtle low pulse
function sfxContract(){playTone(660,.1,'sine',.1);setTimeout(()=>playTone(880,.15,'sine',.1),110);}
function sfxAch(){playTone(523,.1,'sine',.18);setTimeout(()=>playTone(659,.1,'sine',.16),100);setTimeout(()=>playTone(784,.1,'sine',.16),200);setTimeout(()=>playTone(1047,.3,'sine',.2),310);}
// ══════════ TICK ══════════════════════════════════════════════
function tick(){
  G.gt+=200;  // logical time always +200ms per tick
  // Periodically refresh upgrades panel (for gold-based button availability)
  if(G.gt%3000===0)renderUpgrades();
  // Auto-buy maps for Maraketh
  if(G.autoBuyMaps&&(hasFaction('maraketh')||hasLegacyBonus('mara_2'))&&G.lastExpSlots&&G.lastExpSlots.length){
    // Count idle workers that want to auto-expedition
    const _idleAutoExp=G.workers.filter(w=>w.status==='idle'&&G.autoExp&&hasMaraFeature());
    const _needSets=Math.max(1,_idleAutoExp.length);
    // Count how many of each tier needed per expedition set
    const needed={};G.lastExpSlots.filter(Boolean).forEach(t=>{needed[t]=(needed[t]||0)+1;});
    // Buy enough for all waiting workers
    let _bought=false;
    Object.keys(needed).forEach(t=>{
      const ti=parseInt(t),req=needed[t]*_needSets,cost=mapShopCost(SHOP_COSTS[ti]||0);
      while(cost>0&&(G.maps[ti]||0)<req&&G.gold>=cost){G.gold-=cost;G.maps[ti]=(G.maps[ti]||0)+1;_bought=true;}
    });
    // If we bought something — try to restart all waiting idle workers
    if(_bought)_idleAutoExp.forEach(w=>tryAutoExp(w));
  }
  // Self run
  if(G.selfRun){
    G.selfRun.elapsed+=200;const _spd=G.syndRunSpeed||1.0;const _delSlw=G._deliriumMode?1.5:1;const pct=Math.min(1,G.selfRun.elapsed/(G.selfRun.md.time*1000/_spd*_delSlw));
    const f=document.getElementById('rpf');if(f)f.style.width=(pct*100)+'%';
    const p=document.getElementById('rpp');if(p)p.textContent=Math.floor(pct*100)+'%';
    _mc_tick(pct);
    if(pct>=1)completeSelfRun();
  }
  // Act run
  if(G.actRun){
    G.actRun.elapsed+=200;const pct=Math.min(1,G.actRun.elapsed/(G.actRun.act.time*1000));
    const f=document.getElementById('apf-'+G.actRun.act.id);if(f)f.style.width=(pct*100)+'%';
    const l=document.getElementById('apct-'+G.actRun.act.id);if(l)l.textContent=Math.floor(pct*100)+'%';
    if(pct>=1)completeAct();
  }
  // Workers
  let wch=false;
  G.workers.forEach(w=>{
    if(w.status==='running'||w.status==='exp'){
      w.elapsed+=200;
      const tier=w.status==='exp'?w.expTiers[w.expIdx]:w.curMap;
      const md=w.isGrd&&w.curMapKey?getMd(w.curMapKey):(MAP_TIERS[tier-1]||MAP_TIERS[15]);
      const spd=w.cls==='ranger'?1.25:1;
      w.prog=Math.min(1,w.elapsed/(md.time*1000/spd*(G._deliriumMode?1.5:1)));
      if(w.prog>=1){if(w.status==='running')resolveWorker(w,md);else resolveExpStep(w);wch=true;}
    }else if(w.status==='injured'){
      const hd=Math.max(5000,(10+(w.curMap||1)*2)*1000*(1-G.ups.heal*.2));
      if(G.gt-w.injuredAt>=hd){w.status='idle';log('💊 '+w.name+' восстановился!','info');wch=true;if(G.autoHeal&&hasMaraFeature())setTimeout(()=>tryAutoExp(w),300);}
    }
    const wp=document.getElementById('wp-'+w.id);if(wp)wp.style.width=(w.prog*100)+'%';
    if(w.status==='injured'){
      const hp=document.getElementById('hp-'+w.id);
      if(hp){const hd=Math.max(5000,(10+(w.curMap||1)*2)*1000*(1-G.ups.heal*.2));hp.style.width=(Math.min(1,(G.gt-w.injuredAt)/hd)*100)+'%';}
    }
  });
  if(wch)renderWorkers();
  // Delve run completion
  if(G.delve&&G.delve.running){
    if(G.gt>=G.delve._runEnd){resolveDelveRun();}
    else{
      const _dpct=Math.max(0,Math.min(1,(G.gt-G.delve._runStart)/(G.delve._runEnd-G.delve._runStart)));
      const _df=document.getElementById('delve-prog-fill');if(_df)_df.style.width=Math.round(_dpct*100)+'%';
      const _dp=document.getElementById('delve-prog-pct');if(_dp)_dp.textContent=Math.round(_dpct*100)+'%';
    }
  }
  updateRes();updateStats();updateSelfStats();
}

// ══════════ RENDER ═════════════════════════════════════════════