// persistence.js — сохранение и загрузка
// Зависимости: state.js, mechanics.js

function openTutorial(){
  openM('⚔️ Добро пожаловать, Изгнанник!',
    '<div style="font-size:14px;line-height:1.7">'+
    '<p style="color:var(--txt-d);margin-bottom:12px">Ты оказался в землях Калгуура. Чтобы выжить — сражайся, торгуй и возвышайся.</p>'+
    '<div style="display:flex;flex-direction:column;gap:8px;margin-bottom:12px">'+
      '<div style="background:var(--bg2);border:1px solid var(--brd);padding:8px 12px;border-radius:4px">'+
        '<div style="color:var(--gold);font-weight:600;margin-bottom:3px">🏕 Шаг 1 — Акты</div>'+
        '<div style="color:var(--txt-d);font-size:13px">Проходи <b style="color:var(--gold)">Акты</b> чтобы прокачать персонажа и заработать стартовое золото.</div>'+
      '</div>'+
      '<div style="background:var(--bg2);border:1px solid var(--brd);padding:8px 12px;border-radius:4px">'+
        '<div style="color:var(--gold);font-weight:600;margin-bottom:3px">🗺 Шаг 2 — Карты</div>'+
        '<div style="color:var(--txt-d);font-size:13px">Проходи <b style="color:var(--gold)">Карты</b> сам или найми работников, которые будут делать это за тебя. Чем выше тир — тем лучше награда.</div>'+
      '</div>'+
      '<div style="background:var(--bg2);border:1px solid var(--brd);padding:8px 12px;border-radius:4px">'+
        '<div style="color:var(--gold);font-weight:600;margin-bottom:3px">✨ Шаг 3 — Возвышение</div>'+
        '<div style="color:var(--txt-d);font-size:13px">Пройди все 16 тиров — и тебе откроется <b style="color:var(--gold)">Возвышение</b>. Выбери фракцию, сбрось прогресс и начни с уникальными бонусами.</div>'+
      '</div>'+
    '</div>'+
    '<div style="background:rgba(60,50,20,.4);border:1px solid #665533;border-radius:4px;padding:8px 12px;margin-bottom:16px;font-size:12px;color:#bbaa77">'+
      '💡 <b style="color:var(--gold)">Механики открываются постепенно</b> по мере прохождения'+
    '</div>'+
    '<button class="btn btn-p" style="width:100%" onclick="closeM()">⚔️ Начать</button>'+
    '</div>'
  );
  // Запрещаем закрытие туториала кликом на оверлей — только кнопка
  document.getElementById('moverlay')._tutorialLock=true;
}
function manualSave(){
  save();
  const btn=document.getElementById('btn-manual-save');
  if(btn){const orig=btn.innerHTML;const origStyle=btn.getAttribute('style');
    btn.innerHTML='✅ СОХРАНЕНО';btn.style.color='#88cc88';btn.style.borderColor='#44aa44';btn.style.background='rgba(50,120,50,.3)';
    setTimeout(()=>{btn.innerHTML=orig;btn.setAttribute('style',origStyle);},1500);
  }
}
function openSaveModal(){
  function _getSaveCode(){
    try{
      const raw=localStorage.getItem('kartahodec_save');
      if(!raw)return null;
      let exportObj;
      try{exportObj=JSON.parse(raw);}catch(e){exportObj={};}
      delete exportObj._icons;
      return _obfuscate(JSON.stringify(exportObj));
    }catch(e){return null;}
  }
  const code=_getSaveCode()||'';
  openM('💾 СОХРАНЕНИЕ',
    '<div style="margin-bottom:12px">'+
    '<div style="font-size:12px;color:var(--txt-d);margin-bottom:6px;letter-spacing:0.5px">КОД ТЕКУЩЕГО СОХРАНЕНИЯ</div>'+
    '<textarea id="save-modal-code" readonly style="width:100%;height:90px;background:var(--bg1);border:1px solid var(--brd-g);color:var(--gold);font-size:10px;font-family:monospace;padding:8px;resize:none;box-sizing:border-box;border-radius:2px;opacity:0.85"></textarea>'+
    '</div>'+
    '<div style="display:flex;flex-direction:column;gap:8px">'+
    '<button onclick="doManualSaveFromModal()" style="width:100%;background:linear-gradient(180deg,rgba(80,160,80,.25),rgba(80,160,80,.05));border:1px solid #4a8a4a;color:#88cc88;font-size:13px;font-family:\'Cinzel\',serif;padding:9px;cursor:pointer;clip-path:polygon(6px 0,100% 0,calc(100% - 6px) 100%,0 100%);letter-spacing:1px">💾 СОХРАНИТЬ В БРАУЗЕР</button>'+
    '<div style="display:flex;gap:8px">'+
    '<button onclick="doDownloadSaveFromModal()" style="flex:1;background:linear-gradient(180deg,rgba(100,120,160,.2),rgba(100,120,160,.05));border:1px solid #445;color:#99aacc;font-size:12px;font-family:\'Cinzel\',serif;padding:7px;cursor:pointer;clip-path:polygon(5px 0,100% 0,calc(100% - 5px) 100%,0 100%)">📥 СКАЧАТЬ ФАЙЛ</button>'+
    '<button onclick="closeM();importSave()" style="flex:1;background:linear-gradient(180deg,rgba(160,100,100,.15),rgba(160,100,100,.05));border:1px solid #644;color:#cc9999;font-size:12px;font-family:\'Cinzel\',serif;padding:7px;cursor:pointer;clip-path:polygon(5px 0,100% 0,calc(100% - 5px) 100%,0 100%)">📤 ЗАГРУЗИТЬ СОХРАНЕНИЕ</button>'+
    '</div>'+
    '</div>'
  );
  const ta=document.getElementById('save-modal-code');
  if(ta)ta.value=code;
}
function doManualSaveFromModal(){
  save();
  try{
    const raw=localStorage.getItem('kartahodec_save');
    if(raw){
      let exportObj;try{exportObj=JSON.parse(raw);}catch(e){exportObj={};}
      delete exportObj._icons;
      const ta=document.getElementById('save-modal-code');
      if(ta)ta.value=_obfuscate(JSON.stringify(exportObj));
    }
  }catch(e){}
  showN('✅ Прогресс сохранён!','grn');
}
function doDownloadSaveFromModal(){
  const ta=document.getElementById('save-modal-code');
  if(!ta||!ta.value){showN('❌ Нет данных для скачивания','red');return;}
  const blob=new Blob([ta.value],{type:'text/plain'});
  const fr=new FileReader();
  fr.onload=function(e){
    const l=document.createElement('a');
    l.href=e.target.result;
    l.download='kalguur_save.txt';
    document.body.appendChild(l);l.click();document.body.removeChild(l);
  };
  fr.readAsDataURL(blob);
}
function save(){
  try{localStorage.setItem('kartahodec_save',JSON.stringify({
    v:14,gold:G.gold,totalRuns:G.totalRuns,maps:G.maps,inv:G.inv,workers:G.workers,gt:G.gt||0,
    ups:G.ups,selfEq:G.selfEq,
    selfCls:G.selfCls,clsLocked:G.clsLocked,selfXp:G.selfXp,selfLevel:G.selfLevel,selfPendingLevel:G.selfPendingLevel,lastExpSlots:G.lastExpSlots,
    stats:G.stats,iid:G.iid,wid:G.wid,
    maxTier:G.maxTier,cleared:G.cleared,lifetimeMaxCleared:G.lifetimeMaxCleared||0,achs:G.achs,achsPending:G.achsPending,prestige:G.prestige,prestigeBonus:G.prestigeBonus,
    guardianPieces:G.guardianPieces,faction:G.faction||'none',factionXp:G.factionXp||{},factionUnlocks:G.factionUnlocks||{},bossAttempts:G.bossAttempts,bossKills:G.bossKills,bossTriesLeft:G.bossTriesLeft||0,activeBossId:G.activeBossId||null,t16RunsSinceBoss:G.t16RunsSinceBoss||0,pendingBoss:G.pendingBoss||null,voidstones:G.voidstones||{shaper:false,exarch:false,eater:false},
    syndRunSpeed:G.syndRunSpeed||1.0,contracts:G.contracts||[],contractRunsDone:G.contractRunsDone||0,passives:G.passives||{},passivePending:G.passivePending||0,firstRun:G.firstRun||false,unlocks:G.unlocks||{},autoExp:G.autoExp||false,autoRescue:G.autoRescue||false,autoHeal:G.autoHeal||false,autoBuyMaps:G.autoBuyMaps||false,autoSellRules:G.autoSellRules||{normal:false,magic:false,rare:false},
    legacyPerks:G.legacyPerks||[],legacyContracts:G.legacyContracts||false,
    deliriumOrbs:G.deliriumOrbs||0,deliriumSplinters:G.deliriumSplinters||0,deliriumMaps:G.deliriumMaps||{},
    delve:G.delve||null,
    uniqMapData:G.uniqMapData||{},
    playTime:G.playTime||0,
    _fishCaught:G._fishCaught||0,
    _deliriumMode:G._deliriumMode||false,
    _deliriumModeUnlocked:G._deliriumModeUnlocked||false,
    _deliriumModeRewarded:G._deliriumModeRewarded||false,
    _clusterSlot2:G._clusterSlot2||false,
    _icons:(()=>{const d={};DBG_ICONS.forEach(ic=>{const v=localStorage.getItem(DBG_LS_PREFIX+ic.key);if(v)d[ic.key]=v;});const spr=localStorage.getItem('kalguur_sprites');if(spr)d['__sprite__']=spr;return Object.keys(d).length?d:undefined;})(),
  }));}catch(e){}
}
function load(){
  try{
    const raw=localStorage.getItem('kartahodec_save');if(!raw)return;
    const s=JSON.parse(raw);
    // Graceful migration — never force-wipe saves
if(s.v&&s.v>=9){/* compatible enough */}
    Object.assign(G,s);
    if(s._icons&&typeof s._icons==='object'){
      Object.entries(s._icons).forEach(([key,val])=>{
        if(!val)return;
        if(key==='__sprite__'){try{localStorage.setItem('kalguur_sprites',val);window.SPRITE_B64=val;if(typeof setSpriteCSS==='function')setSpriteCSS(val);else window._pendingSpriteCSS=val;}catch(e){}}
        else{try{localStorage.setItem(DBG_LS_PREFIX+key,val);_iconOverrides[key]=val;}catch(e){}}
      });
      _iconOverridesLoaded=true;window.DBG_ICONS_MAP=null;
    }
    if(!G.voidstones)G.voidstones={shaper:false,exarch:false,eater:false};
    if(!G.cleared)G.cleared={};if(G.lifetimeMaxCleared===undefined)G.lifetimeMaxCleared=0;if(!G.achs)G.achs={};if(!G.achsPending)G.achsPending={};
    if(!G.prestige)G.prestige=0;if(!G.prestigeBonus)G.prestigeBonus=0;
    if(!G.selfCls)G.selfCls=null;if(G.clsLocked===undefined)G.clsLocked=false;if(!G.lastExpSlots)G.lastExpSlots=null;
    if(!G.guardianPieces)G.guardianPieces={shaper:0,elder:0};if(!G.faction)G.faction='none';if(!G.factionXp)G.factionXp={};if(!G.factionUnlocks)G.factionUnlocks={};if(!G.bossAttempts)G.bossAttempts={};if(!G.bossKills)G.bossKills={};if(G.bossTriesLeft===undefined)G.bossTriesLeft=0;if(G.t16RunsSinceBoss===undefined)G.t16RunsSinceBoss=0;if(G.pendingBoss===undefined)G.pendingBoss=null;
    if(!G.contracts)G.contracts=[];if(G.contractRunsDone===undefined)G.contractRunsDone=0;
    if(!G.deliriumOrbs)G.deliriumOrbs=0;if(!G.passives)G.passives={};if(G.passivePending===undefined)G.passivePending=0;if(G.firstRun===undefined)G.firstRun=false;if(!G.unlocks)G.unlocks={};if(!G.deliriumSplinters)G.deliriumSplinters=0;if(G.autoOrb===undefined)G.autoOrb=false;if(!G.contractRerolls)G.contractRerolls=0;if(!G.deliriumWave)G.deliriumWave=0;if(!G.deliriumPending)G.deliriumPending=[];if(!G.deliriumMaps)G.deliriumMaps={};
    if(G.autoExp===undefined)G.autoExp=false;if(G.autoRescue===undefined)G.autoRescue=false;if(G.autoHeal===undefined)G.autoHeal=false;if(G.autoBuyMaps===undefined)G.autoBuyMaps=false;
    if(!G.legacyPerks)G.legacyPerks=[];if(G.legacyContracts===undefined)G.legacyContracts=false;
    if(!G.factionXp.legacy)G.factionXp.legacy=0;
    if(!G._fishCaught)G._fishCaught=0;
    if(!G.delve)G.delve={depth:0,sulphite:0,sulphiteCap:5000,azurite:0,upgrades:{armor:0,blast:0,speed:0,storage:0,pump:0,lantern:0},running:false,runDepth:0,locationType:null,grid:null};
    if(!G.delve.upgrades)G.delve.upgrades={armor:0,blast:0,speed:0,storage:0,pump:0,lantern:0};
    if(!G.uniqMapData)G.uniqMapData={};
    // Грузим сохранённую сетку; если её нет — откладываем генерацию на после первого рендера
    if(!G.delve.grid){
      setTimeout(()=>{
        if(!G.delve.grid){
          dvInitGrid();
          const _clearedTiers=Object.keys(G.cleared||{}).map(Number).filter(n=>G.cleared[n]);
          const _maxCleared=_clearedTiers.length?Math.max(..._clearedTiers):0;
          if(_maxCleared>0)dvUpdateMinDepth(_maxCleared);
          if(typeof renderDelve==='function')renderDelve();
        }
      },0);
    }
    if(G.delve.grid&&G.delve.grid.selectedKey===undefined)G.delve.grid.selectedKey=null;
    if(G.delve.viewMode===undefined||G.delve.viewMode==='full'||G.delve.viewMode==='compact')G.delve.viewMode='map';
    if(G.delve.running&&(!G.delve._runEnd||G.gt>=G.delve._runEnd)){G.delve.running=false;}
    if(!G.playTime)G.playTime=0;
    if(G._deliriumMode===undefined)G._deliriumMode=false;
    if(G._deliriumModeUnlocked===undefined)G._deliriumModeUnlocked=false;
    if(G._deliriumModeRewarded===undefined)G._deliriumModeRewarded=false;
    if(G._clusterSlot2===undefined)G._clusterSlot2=false;
    // Re-apply syndicate flags
    if(G.faction==='syndicate'){const _sxp=(G.factionXp&&G.factionXp.syndicate)||0;const _sf=FACTIONS.syndicate;G.syndRunSpeed=(_sf.levels||[]).some(l=>l.xp<=_sxp&&l.reward&&l.reward.runSpeed)?1.50:1.0;G.syndExtraWeapon=true;}else{G.syndRunSpeed=1.0;if(G.syndExtraWeapon===undefined)G.syndExtraWeapon=false;}
    // Re-apply legacy perks (e.g. synd_2 sets syndRunSpeed=1.5)
    if(G.faction==='legacy')applyLegacyPerks();
    // Tab restore handled in renderAll
    if(!G.selfXp)G.selfXp=0;if(!G.selfLevel)G.selfLevel=0;if(G.selfLevelUp===undefined)G.selfLevelUp=false;
    if(G.selfPendingLevel===undefined)G.selfPendingLevel=G.selfLevel;
    G.workers.forEach(w=>{
      if(w.status==='running'||w.status==='exp'){w.status='idle';w.prog=0;w.elapsed=0;}
      if(w.status==='injured'&&w.injuredAt>G.gt){w.injuredAt=G.gt;}  // fix broken heal after save without G.gt
      if(!w.xp)w.xp=0;if(!w.level)w.level=0;
      if(!w.expTiers)w.expTiers=[];if(!w.expIdx)w.expIdx=0;
      if(w.uniq===undefined)w.uniq=false;
      recalcW(w);
    });
    G.selfRun=null;G.actRun=null;
    log('💾 Прогресс загружен','info');
  }catch(e){log('⚠ Ошибка загрузки','ev');}
}

// ══════════ EVENTS ════════════════════════════════════════════