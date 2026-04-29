// ui-stats.js — ресурсы и статы
// Зависимости: utils.js

function updateRes(){
  const tm=Object.keys(G.maps).reduce((s,k)=>s+(G.maps[k]||0),0);
  const set=(id,v)=>{const e=document.getElementById(id);if(e)e.textContent=v;};
  if(isNaN(G.gold))G.gold=0;set('r-gold',fN(G.gold));set('r-maps',tm);set('r-items',G.inv.length);set('r-workers',G.workers.length);set('r-runs',G.totalRuns);
  const _d16=G.cleared&&G.cleared[16];
  const _ro=document.getElementById('ri-del-orbs-ri');if(_ro)_ro.style.display=_d16?'':'none';
  const _rs=document.getElementById('ri-del-spl-ri');if(_rs)_rs.style.display=(_d16||(G.prestige||0)>0)?'flex':'none';
  set('r-del-orbs',G.deliriumOrbs||0);set('r-del-spl',G.deliriumSplinters||0);
  // Сульфит — только после T5
  const _clearedTiers=Object.keys(G.cleared||{}).map(Number).filter(n=>G.cleared[n]);
  const _maxClr=_clearedTiers.length?Math.max(..._clearedTiers):0;
  const _sul=document.getElementById('ri-sulphite-bar');
  if(_sul)_sul.style.display=_maxClr>=5?'flex':'none';
  set('r-sulphite',(G.delve?G.delve.sulphite:0));
}
function updateStats(){
  const el=document.getElementById('stats-p');if(!el)return;
  // Перерисовывать только при реальных изменениях
  const _sk=JSON.stringify([G.stats,G.prestige,G.prestigeBonus,G.bossKills,G.guardianPieces,
    G.workers&&G.workers.map(w=>w.isNamed),G.selfEq&&G.selfEq.cluster,G.passives,G.voidstones,
    Math.floor(G.gt/60000)]);
  if(el._lastStatsKey===_sk)return;
  el._lastStatsKey=_sk;
  const _fmtHM=ms=>{const m=Math.floor(ms/60000);const h=Math.floor(m/60);return h?h+'ч '+(m%60)+'м':m+'м';};
  el.innerHTML=
    '<div>⏱ Время возвышения: <span class="gt">'+_fmtHM(G.gt)+'</span></div>'+
    '<div>📅 Всего в игре: <span class="gt">'+_fmtHM(G.playTime||0)+'</span></div>'+
    '<div>'+gi(16)+' Заработано: <span class="gt">'+fN(G.stats.ge)+'</span></div>'+
    '<div>💎 Продано: <span class="gt">'+G.stats.sold+'шт ('+fN(G.stats.sg)+gi(16)+')</span></div>'+
    '<div>🗺 Карт пройдено: <span class="gt">'+G.stats.mr+'</span></div>'+
    '<div>🏕 Актов: <span class="gt">'+G.stats.ar+'</span></div>'+
    '<div>⚔️ Предметов найдено: <span class="gt">'+G.stats.fi+'</span></div>'+
    '<div>⛓ Захвачено: <span style="color:var(--red)">'+G.stats.cap+'</span></div>'+
    '<div>💔 Ранений: <span style="color:var(--org)">'+G.stats.inj+'</span></div>'+
    (G.prestige?'<div>✨ Возвышение: <span style="color:#ffaa00">'+G.prestige+'x (+'+G.prestigeBonus+'%'+gi(16)+')</span></div>':'')+
    (G.bossKills.shaper?'<div>💠 Создатель убит: <span style="color:#44aaff">'+G.bossKills.shaper+'x</span></div>':'')+
    '<div>🔷 Фрагментов Создателя: <span style="color:#44aaff">'+(G.guardianPieces.shaper||0)+'/4</span></div>'+
    (()=>{
      // Бонусы
      const _lines=[];
      // Золото
      const _gpCluster=(G.selfEq&&G.selfEq.cluster?(G.selfEq.cluster.mods||[]).reduce((s,m)=>s+(m.stat==='goldPct'?m.value:0),0):0);
      const _gpPassive=passiveVal('goldPct');
      const _gpPres=G.prestigeBonus||0;
      const _gpTotal=_gpCluster+_gpPassive+_gpPres;
      if(_gpTotal>0){
        const _gpParts=[];
        if(_gpPres>0)_gpParts.push('Возвышение: +'+_gpPres+'%');
        if(_gpCluster>0)_gpParts.push('Кластер: +'+_gpCluster+'%');
        if(_gpPassive>0)_gpParts.push('Пассивки: +'+_gpPassive+'%');
        _lines.push('<div title="'+_gpParts.join(' · ')+'">'+gi(16)+' Бонус золота: <span style="color:#f0d060">+'+_gpTotal+'%</span></div>');
      }
      // Предметы
      const _dpCluster=(G.selfEq&&G.selfEq.cluster?(G.selfEq.cluster.mods||[]).reduce((s,m)=>s+(m.stat==='dropPct'?m.value:0),0):0);
      const _dpPassive=passiveVal('dropPct');
      const _dpGwen=G.workers&&G.workers.find(w=>w.isNamed&&w.bonus&&w.bonus.itemDropBonus)?10:0;
      const _dpTotal=_dpCluster+_dpPassive+_dpGwen;
      if(_dpTotal>0){
        const _dpParts=[];
        if(_dpGwen>0)_dpParts.push('Гвенен: +'+_dpGwen+'%');
        if(_dpCluster>0)_dpParts.push('Кластер: +'+_dpCluster+'%');
        if(_dpPassive>0)_dpParts.push('Пассивки: +'+_dpPassive+'%');
        _lines.push('<div title="'+_dpParts.join(' · ')+'">📦 Бонус предметов: <span style="color:#88dd88">+'+_dpTotal+'%</span></div>');
      }
      // Фрагменты стражей
      const _gpGrd=(G.selfEq&&G.selfEq.cluster?(G.selfEq.cluster.mods||[]).reduce((s,m)=>s+(m.stat==='grdDropPct'?m.value:0),0):0)+passiveVal('grdDropPct');
      const _gpGwen=G.workers&&G.workers.find(w=>w.isNamed&&w.bonus&&w.bonus.guardianExpChance)?15:0;
      const _gpGrdTotal=Math.round((_gpGrd+_gpGwen));
      if(_gpGrdTotal>0){
        const _grdParts=[];
        if(_gpGwen>0)_grdParts.push('Гвенен: +'+_gpGwen+'% карт стражей');
        if(_gpGrd>0)_grdParts.push('Кластер/пассивки: +'+_gpGrd+'% карт стражей');
        _lines.push('<div title="'+_grdParts.join(' · ')+'">🔷 Бонус карт стражей: <span style="color:#44aaff">+'+_gpGrdTotal+'%</span></div>');
      }
      return _lines.join('');
    })();
}
function updateSelfStats(){
  if(!document.getElementById('s-dmg'))return; // after reset DOM may be replaced
  // Портрет ГГ — обновляем только при смене класса
  const _cls=G.selfCls||'warrior';
  const _c=WCLS[_cls]||{};
  const _portWrap=document.getElementById('self-portrait-wrap');
  if(_portWrap){
    if(G.selfCls){
      if(_portWrap.dataset.lastCls!==_cls){
        _portWrap.dataset.lastCls=_cls;
        const _portImg=document.getElementById('self-portrait-img');
        const _portEm=document.getElementById('self-portrait-em');
        const _portFrame=document.getElementById('self-portrait-frame');
        _portWrap.style.display='';
        if(_portImg&&_c.port){_portImg.src=_c.port;}
        if(_portImg){_portImg.style.display=_c.port?'':'none';}
        if(_portEm){_portEm.textContent=_c.em;_portEm.style.display=_c.port?'none':'';_portImg&&_portImg.addEventListener('error',function(){this.style.display='none';if(_portEm)_portEm.style.display='';},{once:true});}
        if(_portFrame){_portFrame.style.background='linear-gradient(145deg,'+(_c.col||'var(--gold-d)')+'99,'+(_c.col||'var(--gold-d)')+'44,'+(_c.col||'var(--gold-d)')+'99)';}
      }
    } else {
      _portWrap.style.display='none';
    }
  }
  const d=sDmg(),s=sSurv();
  const set=(id,v)=>{const e=document.getElementById(id);if(e)e.textContent=v;};
  set('s-dmg',d);set('s-surv',s);set('s-lvl',G.selfLevel);
  // XP bar
  const xpBar=document.getElementById('s-xp-bar');
  const xpTxt=document.getElementById('s-lvl-xp');
  const mx=WLVLS.length-1;
  const dispLvl=G.selfPendingLevel||G.selfLevel;
  if(dispLvl>=mx){if(xpBar)xpBar.style.width='100%';if(xpTxt)xpTxt.textContent='MAX';}
  else{const xpPct=Math.min(1,(G.selfXp-WLVLS[dispLvl])/(WLVLS[dispLvl+1]-WLVLS[dispLvl]));if(xpBar)xpBar.style.width=(xpPct*100)+'%';if(xpTxt)xpTxt.textContent=(WLVLS[dispLvl+1]-G.selfXp)+' до Ур.'+(dispLvl+1);}
  // Level up button
  const lvlBtn=document.getElementById('btn-self-lvlup');
  if(lvlBtn){lvlBtn.style.display=G.selfLevelUp?'inline-block':'none';if(G.selfLevelUp)lvlBtn.textContent='Повысить';}
  // Class buttons
  // Show noble class if prestige unlocked
  const nb=document.getElementById('cls-noble');
  if(nb)nb.style.display=G.prestige>0?'inline-block':'none';
  ['warrior','mage','ranger','noble'].forEach(cl=>{
    const b=document.getElementById('cls-'+cl);if(!b)return;
    const active=cl===(G.selfCls||'warrior');
    b.style.borderColor=active?'var(--gold)':'var(--gold-d)';
    b.disabled=G.clsLocked&&!active;
    b.title=G.clsLocked&&!active?'Класс заблокирован. Смените в Лавке за 200💰':'';
  });
  const ec=document.getElementById('s-ch');
  if(ec){
    if(G.selMap){
      const k=String(G.selMap);
      const t=parseMapKey(k);
      const isC=k.startsWith('c');const isU=k.startsWith('u');const isG=k.startsWith('grd_');
      const isB=k.startsWith('boss_');
      const effT=t+(isC?1:0)+(isU?1:0);
      const mod=isG?-.12:isB?-.05:0;
      let ch;
      if(isB){const bD=BOSSES.find(b=>'boss_'+b.id===k);const bDgr=bD?bD.dgr:1800;const bCap=bD?(bD.id==='shaper'?0.70:bD.id==='eater'?0.75:0.80):0.80;const raw=((d+s)/bDgr-0.2)/0.7;ch=delModCh(Math.max(.03,Math.min(bCap,raw)+mod));}
      else{const rawCh=calcCh(d+s,Math.min(16,effT))+mod;ch=delModCh(Math.max(.03,isG?Math.min(0.85,rawCh):rawCh));}
      ec.innerHTML='<span style="color:'+chcol(ch)+'">'+(isG?'🔷 ':'')+Math.round(ch*100)+'% '+(isG?'[Страж]':'T'+t)+'</span>';
    }else ec.textContent='— (нет карты)';
  }
  // Highlight class row when no class selected yet
  const clsRow=document.getElementById('cls-row');
  const clsHint=document.getElementById('cls-pick-hint');
  if(clsRow){
    if(!G.selfCls&&clsRow.style.display!=='none'){
      clsRow.style.animation='cls-pulse 1.6s ease-in-out infinite';
      clsRow.style.borderRadius='6px';
      clsRow.style.padding='4px 6px';
      clsRow.style.border='1px solid rgba(200,160,50,.3)';
      if(!clsHint){
        const h=document.createElement('div');
        h.id='cls-pick-hint';
        h.style.cssText='font-size:12px;color:#cc9933;margin-top:3px;animation:pg 1.6s ease-in-out infinite';
        h.textContent='👆 Выберите класс перед походом';
        clsRow.parentNode.insertBefore(h,clsRow.nextSibling);
      }
    } else {
      clsRow.style.animation='';
      clsRow.style.border='';
      clsRow.style.padding='';
      if(clsHint)clsHint.remove();
    }
  }
}

// ══════════ MODALS ════════════════════════════════════════════