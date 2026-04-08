// ui-atlas.js — атлас и ачивки
// Зависимости: utils.js

function renderAtlasBar(){
  const ct=document.getElementById('pt-tiers');if(!ct)return;
  ct.innerHTML=[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16].map(t=>'<div class="pt-t '+(G.cleared[t]?'done':'')+'" title="T'+t+' '+MAP_TIERS[t-1].nm+'">'+t+'</div>').join('');
  const hint=document.getElementById('pt-hint');if(!hint)return;
  const _pbtn=document.getElementById('btn-passive-tree');
  if(_pbtn){_pbtn.style.display=G.prestige>0?'inline-block':'none';
    if((G.passivePending||0)>0){_pbtn.style.borderColor='var(--gold)';_pbtn.style.color='var(--gold)';_pbtn.textContent='🌐 Дерево атласа ✨';}
    else{_pbtn.style.borderColor='';_pbtn.style.color='';_pbtn.textContent='🌐 Дерево атласа';}
  }
  const cl=Object.keys(G.cleared).length;
  // Кнопка выхода из режима делириума
  const _delPanel=document.getElementById('del-mode-panel');
  if(_delPanel)_delPanel.style.display=G._deliriumMode?'block':'none';
  const _delSplLbl=document.getElementById('del-mode-spl');
  if(_delSplLbl)_delSplLbl.textContent=G.deliriumSplinters||0;
  if(G.prestige>0){
    const f=FACTIONS[G.faction||'none'];
    const fxp=G.factionXp&&G.factionXp[G.faction]||0;
    const fbar=G.faction&&G.faction!=='none'?
      ' · <span style="color:'+f.col+'">'+f.em+' '+f.nm+' Ур.'+Math.min(fxp,f.levels?f.levels.length:1)+'</span>':'';
    hint.innerHTML='Возвышение '+G.prestige+' · +'+G.prestigeBonus+'% золота'+fbar;
  }
  else if(canPrestige())hint.innerHTML='<span style="color:#ffaa00;font-weight:bold">✨ Атлас завершён!</span> <button class="btn btn-sm btn-p" id="btn-prestige-bar" style="margin-left:6px">✨ Возвышение</button>';
  else hint.textContent='Тиров пройдено: '+cl+'/16';
  const rip=document.getElementById('ri-pres');if(rip)rip.style.display=G.prestige>0?'flex':'none';
  const _rdm=document.getElementById('ri-del-mode');if(_rdm)_rdm.style.display=G._deliriumMode?'flex':'none';
  // Туман на run-vis и delirium-portal
  // delirium-portal — туман всегда; run-vis — только в режиме делириума
  const _dp=document.getElementById('delirium-portal');
  if(_dp)_dp.classList.add('delirium-fog');
  const _rv=document.querySelector('.run-vis');
  if(_rv){if(G._deliriumMode)_rv.classList.add('delirium-fog');else _rv.classList.remove('delirium-fog');}

  const rpp=document.getElementById('r-pres');if(rpp)rpp.textContent=G.prestige;
  // Voidstones
  const _vsBar=document.getElementById('voidstones-bar');
  if(_vsBar){
    const _vs=G.voidstones||{};
    const _vsCount=(_vs.shaper?1:0)+(_vs.exarch?1:0)+(_vs.eater?1:0);
    const _vsDefs=[
      {key:'shaper',em:'💠',nm:'Камень пустоты Создателя',boss:'Создатель'},
      {key:'exarch', em:'🔥',nm:'Камень пустоты Экзарха',  boss:'Пламенный Экзарх'},
      {key:'eater',  em:'🌑',nm:'Камень пустоты Пожирателя',boss:'Пожиратель Миров'},
    ];
    const _tip='Камни пустоты: каждый даёт +25% шанс увеличить уровень выпавшей карты на 1.\nСейчас активно: '+_vsCount+' ('+(_vsCount*25)+'% шанс на каждую выпавшую карту).';
    _vsBar.style.display=(G.prestige>0||G.cleared&&G.cleared[16])?'flex':'none';
    _vsBar.innerHTML=
      _vsDefs.map(v=>{
        const has=!!_vs[v.key];
        const tipText=has?(v.nm+' — +25% шанс увеличить уровень выпавшей карты на 1'):(v.nm+' — убей '+v.boss+' чтобы получить');
        return '<span title="'+tipText+'" style="font-size:16px;opacity:'+(has?'1':'0.25')+';cursor:default;line-height:1;filter:'+(has?'drop-shadow(0 0 4px gold)':'grayscale(1)')+'">'+v.em+'</span>';
      }).join('')+
      '';
  }
}
function updateDeliriumTab(){
  const _dBtn=document.getElementById('ctab-delirium');
  const _dvBtn=document.getElementById('ctab-delve');
  const _clearedTiers=Object.keys(G.cleared||{}).map(Number).filter(n=>G.cleared[n]);
  const _currentMax=_clearedTiers.length?Math.max(..._clearedTiers):0;
  const _t5=_currentMax>=5;
  const _t10=_currentMax>=10;
  if(_dvBtn)_dvBtn.style.display=_t5?'flex':'none';
  if(_dBtn)_dBtn.style.display=_t10?'flex':'none';
  // Глубина шахты не может отставать от атласа больше чем на 1 тир
  // Минимальная глубина = (maxCleared - 1) * 10
  if(_t5&&G.delve&&!G.delve.running){
    const _minDepth=Math.max(0,(_currentMax-1)*10);
    if(G.delve.depth<_minDepth)G.delve.depth=_minDepth;
  }
}
function renderAtlasTab(){
  const el=document.getElementById('tab-atlas');if(!el)return;
  updateDeliriumTab();

  let html='<div style="font-size:13px;color:var(--txt-d);margin-bottom:8px">Зелёный = пройден. Пройдите все 16 для Возвышениеа.</div><div id="atlas-grid">';
  for(let t=1;t<=16;t++){
    const md=MAP_TIERS[t-1];const done=!!G.cleared[t];
    const runs=(G.stats.tierRuns&&G.stats.tierRuns[t])||0;
    html+='<div class="at-cell '+(done?'done':'locked')+'">'+
      '<div style="font-size:21px">'+md.em+'</div>'+
      '<div style="font-family:Cinzel,serif;font-size:10px;margin-top:2px">T'+t+'</div>'+
      '<div style="font-size:10px;color:var(--txt-d)">'+md.nm.slice(0,10)+'</div>'+
      (done?'<div style="color:var(--grn);font-size:11px">✓ '+runs+'x</div>':'<div style="font-size:11px">—</div>')+
    '</div>';
  }
  html+='</div>';
  // Guardians section
  html+='<div style="margin-top:12px;font-family:Cinzel,serif;font-size:12px;color:var(--gold-d);margin-bottom:6px;letter-spacing:2px">🔷 СТРАЖИ</div>';
  GUARDIAN_MAPS.forEach(gm=>{
    const key='grd_'+gm.id;const runs=G.stats.tierRuns&&G.stats.tierRuns[key]||0;
    const killed=(G.guardianPieces&&G.guardianPieces.shaper)||0;
    html+='<div style="display:flex;align-items:center;gap:8px;padding:5px 8px;background:var(--bg4);border:1px solid var(--brd);margin-bottom:3px">'+
      '<span style="font-size:19px">'+gm.em+'</span>'+
      '<div style="flex:1"><div style="font-size:14px">'+gm.nm+'</div>'+
      '<div style="font-size:12px;color:var(--txt-d)">'+gm.boss+'</div></div>'+
      '<div style="text-align:right;font-size:12px;color:var(--txt-d)">'+(G.maps[key]>0?'<span style="color:#44aaff">'+G.maps[key]+'x в наличии</span>':'нет')+'</div></div>';
  });
  const bk=G.bossKills&&G.bossKills.shaper||0;
  if(bk>0)html+='<div style="margin-top:8px;padding:8px;background:rgba(0,80,140,.15);border:1px solid #335566;font-size:14px;color:#44aaff">💠 Создатель повержен: <b>'+bk+'x</b></div>';
  html+='</div>';el.innerHTML=html;
}
function renderAchs(){
  const el=document.getElementById('tab-ach');if(!el)return;
  el.innerHTML=ACHDEFS.map(a=>{
    const done=!!G.achs[a.id];
    const pending=!done&&G.achsPending&&G.achsPending[a.id];
    return '<div class="ach-row '+(done?'done':pending?'pending':'')+'">'+
      '<div class="ach-ico">'+(done?a.ico:pending?'🎁':'🔒')+'</div>'+
      '<div style="flex:1"><div class="ach-nm">'+a.nm+'</div>'+
      '<div class="ach-ds">'+a.ds+'</div>'+
      '<div class="ach-rw">'+a.rw+'</div></div>'+
      (done?'<span class="gt" style="font-size:17px">✓</span>':
       pending?'<button class="btn btn-sm btn-g" data-claim-ach="'+a.id+'">Забрать!</button>':'')+'</div>';
  }).join('');
}

function updateAchBadge(){
  const cnt=G.achsPending?Object.keys(G.achsPending).filter(k=>!G.achs[k]).length:0;
  // Highlight tab button
  document.querySelectorAll('#left-panel .tab-btn').forEach(b=>{
    if(b.dataset.tab==='ach'){
      b.innerHTML=cnt>0?'<span class="tab-icon">🏆</span> АРХИВ<span class="tab-badge">'+cnt+'</span>':'<span class="tab-icon">🏆</span> АРХИВ';
    }
  });
}
function claimAch(id){
  if(!G.achsPending||!G.achsPending[id]||G.achs[id])return;
  G.achs[id]=true;delete G.achsPending[id];
  const a=ACHDEFS.find(x=>x.id===id);
  if(!a)return;
  const rwMatch=a.rw.match(/\+?(\d+)/);const rewardGold=rwMatch?parseInt(rwMatch[1]):0;
  if(rewardGold>0){G.gold+=rewardGold;floatT('+'+rewardGold+gi(16),'#f0d080');}
  log('🏆 '+a.nm+' — получено! '+a.rw,'info');showN(''+a.nm+' '+a.rw,'pur');
  sfxAch();
  updateAchBadge();renderAchs();updateRes();
}
