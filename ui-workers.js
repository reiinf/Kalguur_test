// ui-workers.js — работники и улучшения
// Зависимости: mechanics.js, utils.js

function renderWorkers(){
  const el=document.getElementById('workers-list');if(!el)return;
  const hbw=document.getElementById('hire-btn-wrap');
  const titleEl=document.getElementById('workers-panel-title');
  const expBtn=document.getElementById('btn-expedition');
  const cpanel=document.getElementById('contracts-panel');
  if(hasFaction('syndicate')){
    // Pure Syndicate: only contracts, no workers
    if(titleEl)titleEl.innerHTML='🗡️ СИНДИКАТ';
    if(expBtn)expBtn.style.display='none';
    el.style.display='none';
    if(hbw)hbw.style.display='none';
    if(cpanel){cpanel.style.display='';renderContracts();}
    return;
  }
  // Legacy with synd perk: show contracts + expedition + workers
  if(hasSyndFeature()){
    const canH=canHireWorkers();
    if(titleEl)titleEl.innerHTML='<span style="display:flex;align-items:center;gap:6px">👥 РАБОТНИКИ'+(canH?'<button class="btn btn-sm" id="btn-hire" style="font-size:12px">+ Нанять</button>':'')+'</span><button class="btn btn-sm btn-p" id="btn-expedition" style="font-size:11px">🗺 Экс.</button>';
    if(cpanel){cpanel.style.display='';cpanel.style.marginTop='20px';renderContracts();}
    if(hbw)hbw.style.display='none';
  } else {
    if(cpanel){cpanel.style.display='none';cpanel.style.marginTop='0';}
    if(hbw)hbw.style.display='';
  }
  // Workers list — for non-syndicate (includes legacy)
  if(!hasSyndFeature()){
    if(titleEl)titleEl.innerHTML='👥 РАБОТНИКИ <button class="btn btn-sm btn-p" id="btn-expedition">🗺 Экспедиция</button>';
    if(hbw)hbw.style.display='';
    if(hbw){const canH=canHireWorkers();hbw.innerHTML=canH
      ?'<button class="btn" id="btn-hire">+ Нанять работника</button>'
      :'<button class="btn" disabled title="Работников нельзя нанять" style="opacity:.35;cursor:not-allowed">+ Нанять работника</button>';}
  }
  el.style.display='';
  el.style.marginTop=hasSyndFeature()?'10px':'0';
  if(!G.workers.length){el.innerHTML='<div class="dim" style="text-align:center;padding:8px;font-style:italic">Наймите первого работника!</div>';return;}
  const maxS=1+G.ups.slots;
  const running=G.workers.filter(x=>x.status==='running'||x.status==='exp').length;
  el.innerHTML=G.workers.map(w=>{
    const cls=WCLS[w.cls];
    const xpp=w.level>=WLVLS.length-1?1:Math.min(1,Math.max(0,(w.xp-WLVLS[w.level])/(WLVLS[w.level+1]-WLVLS[w.level])));
    const selTier=G.selMap?parseMapKey(G.selMap):null;
    const _isGrdSel=String(G.selMap||'').startsWith('grd_');
    const _chRaw=selTier?calcCh(w.dmg+w.surv,selTier):null;
    const ch=_chRaw!==null?(_isGrdSel?Math.max(.03,Math.min(0.85,_chRaw-0.12)):_chRaw):null;
    const ch2=ch?delModCh(ch):ch;
    const cc=ch2?chcol(ch2):'';
    let sEl='',aEl='';
    if(w.status==='idle'){
      sEl='<span class="wst st-idle">ОЖИДАЕТ</span>';
      const hasM=!!(G.selMap&&G.maps[String(G.selMap)]>0);
      const hasS=running<maxS;
      const maraBlock=factionRestrict('workersExpOnly');
      const disReason=maraBlock?'Только экспедиции':!hasM?'Выберите карту':!hasS?'Нужен апгрейд Машины для доп. слота':'';
      const autoExpBtn=G.factionUnlocks&&G.factionUnlocks.autoExpBought
        ?'<button class="btn btn-sm" data-toggle-autoexp="'+w.id+'" title="Авто-экспедиция" style="padding:0 6px;'+(w.autoExp?'background:#1a4a1a;border-color:#44cc44;color:#44cc44':'')+'">🔁</button>'
        :'';
      aEl='<button class="btn btn-sm" data-send="'+w.id+'"'+((hasM&&hasS&&!maraBlock)?'':' disabled title="'+disReason+'"')+'>▶</button>'+autoExpBtn;
    }else if(w.status==='running'){
      sEl='<span class="wst st-run">'+(w.cursed?'💜':w.uniq?'🟠':'')+'T'+w.curMap+'</span>';
      aEl='<div class="prog-bar" style="width:60px;height:4px"><div class="prog-fill" id="wp-'+w.id+'" style="width:'+(w.prog*100)+'%"></div></div>';
    }else if(w.status==='exp'){
      const et=w.expTiers&&w.expTiers[w.expIdx];
      const autoExpBtn=G.factionUnlocks&&G.factionUnlocks.autoExpBought
        ?'<button class="btn btn-sm" data-toggle-autoexp="'+w.id+'" title="Авто-экспедиция" style="padding:0 6px;'+(w.autoExp?'background:#1a4a1a;border-color:#44cc44;color:#44cc44':'')+'">🔁</button>'
        :'';
      sEl='<span class="wst st-exp">ЭКС'+(et?' T'+et:'')+'</span>';
      aEl='<div class="prog-bar" style="width:60px;height:4px"><div class="prog-fill purple" id="wp-'+w.id+'" style="width:'+(w.prog*100)+'%"></div></div>'+autoExpBtn;
    }else if(w.status==='captured'){
      const cost=Math.floor((30+(w.curMap||1)*12)*(1-G.ups.rescue*.15));
      sEl='<span class="wst st-cap">⛓ ПЛЕН</span>';
      aEl='<button class="btn btn-sm btn-r" data-rescue="'+w.id+'">🔓'+cost+gi(16)+'</button>';
    }else if(w.status==='injured'){
      sEl='<span class="wst st-inj">💔 ЛЕЧИТСЯ</span>';
      aEl='<div class="prog-bar" style="width:60px;height:4px"><div class="prog-fill red" id="hp-'+w.id+'" style="width:0%"></div></div>';
    }
    return '<div class="wslot">'+
      wPortrait(w.cls, w.isNamed?'#e87020':cls.col, cls.em, 'openBigPortrait('+w.id+')')+
      '<div class="winfo">'+
        '<div class="wname" style="'+(w.isNamed?'color:#e87020':'')+'">'+w.name+(w.isNamed?' <span style="font-size:10px;color:#e87020">[ЛЕГЕНДА]</span>':'')+' <span class="lvl-b">Ур.'+w.level+'</span></div>'+
        '<div class="wcls">'+cls.nm.toUpperCase()+'</div>'+
        '<div class="tiny">⚔️'+w.dmg+' 🛡'+w.surv+(ch2?' · <span style="color:'+cc+'">'+Math.round(ch2*100)+'% T'+(selTier||'')+'</span>':'')+'</div>'+
        (w.isNamed&&w.bonus?'<div class="tiny" style="color:#e87020">'+
          (w.bonus.guardianExpChance?'🔷+'+Math.round(w.bonus.guardianExpChance*100)+'% карты стражей ':'')+
          (w.bonus.itemDropBonus?'📦+'+Math.round(w.bonus.itemDropBonus*100)+'% предметы':'')+
        '</div>':'')+
        '<div class="wxp"><div class="wxp-f" style="width:'+(xpp*100)+'%"></div></div>'+
      '</div>'+
      '<div style="display:flex;flex-direction:column;gap:3px;align-items:flex-end">'+
        sEl+
        '<div style="display:flex;gap:3px">'+aEl+'<button class="btn btn-sm" data-weq="'+w.id+'">🎒</button></div>'+
      '</div></div>';
  }).join('');
}

function canHireWorkers(){return !factionRestrict('noWorkers');}
function canSelfRun(){return !factionRestrict('workersExpOnly');}
function canWorkerMapRun(){return !factionRestrict('workersExpOnly');}

function _maraToggleBtn(u){
  var bk=u.id==='autoExp'?'autoExpBought':u.id+'Bought';
  var bought=G.factionUnlocks[bk];
  var on=G[u.id]||false;
  var buyId=u.id==='autoExp'?'autoExpBuy':u.id;
  var togId=u.id==='autoExp'?'autoExpToggle':u.id;
  if(!bought)return '<span class="spr">'+gi(16)+u.cost()+'</span><button class="btn btn-sm" data-mara-up="'+buyId+'">Купить</button>';
  return '<button class="btn btn-sm '+(on?'btn-p':'')+'" data-mara-up="'+togId+'">'+(on?'⏸ Выкл':'▶ Вкл')+'</button>';
}
function renderUpgrades(){
  // Maraketh upgrades — available for maraketh faction OR legacy with mara perks
  const _showMaraUps=hasFaction('maraketh')||hasMaraFeature();
  window._maraUps=_showMaraUps?[
    {id:'autoExp',     nm:'🔄 Автоэкспедиция', minLevel:1, cost:()=>200,
     desc:()=>G.factionUnlocks.autoExpBought?'✅ Куплено — управляйте у каждого работника':'Работники автоматически повторяют экспедиции'},
    {id:'exp5',        nm:'🗺 Долгий поход',    minLevel:1, cost:()=>800,
     desc:()=>G.factionUnlocks.exp5?'✅ До 5 карт разблокировано':'Экспедиции расширяются до 5 карт'},
    {id:'autoRescue',  nm:gi(16)+' Авто-выкуп',      minLevel:1, cost:()=>600,
     desc:()=>G.autoRescue?'✅ Захваченные выкупаются автоматически':'Авто-выкупать захваченных работников'},
    {id:'autoHeal',    nm:'🏃 Авто-старт после лечения', minLevel:1, cost:()=>400,
     desc:()=>G.autoHeal?'✅ После выздоровления сразу идут в экспедицию':'После выздоровления работник сразу идёт в экспедицию'},
    {id:'autoBuyMaps',  nm:'🛒 Авто-закупка карт', minLevel:2, cost:()=>1000,
     desc:()=>G.autoBuyMaps?'✅ Авто-покупает карты для экспедиций когда их не хватает':'Авто-покупать карты используемые в экспедиции когда их не хватает'},
    {id:'guardedWorkers', nm:'🛡 Усиленная охрана', minLevel:3, cost:()=>1500,
     desc:()=>G.factionUnlocks.guardedWorkers?'✅ Работников не могут взять в заложники или ранить':'Работников не могут взять в заложники или ранить'},
    {id:'autoSellItems', nm:'💸 Авто-продажа вещей', minLevel:3, cost:()=>1200,
     desc:()=>G.factionUnlocks.autoSellItems?'✅ Куплено — настройте какие вещи продавать':'Автоматически продавать предметы выбранного качества'},
  ]:[];
  const maraUps=window._maraUps;
  const defs=[
    {id:'slots', nm:'⚙ Слот машины',  max:4,desc:()=>'Одновременно: '+(1+G.ups.slots)+' работ.', cost:()=>Math.floor(200*Math.pow(2.2,G.ups.slots))},
    {id:'rescue',nm:'🤝 Переговорщик',max:3,desc:()=>'Скидка выкупа: '+(G.ups.rescue*15)+'%',    cost:()=>Math.floor(250*Math.pow(2,G.ups.rescue))},
    {id:'heal',  nm:'💊 Лазарет',     max:3,desc:()=>'Лечение быстрее: '+(G.ups.heal*20)+'%',    cost:()=>Math.floor(220*Math.pow(2,G.ups.heal))},
  ];
  window._upsDefs=defs;
  let html='';
  if(_showMaraUps&&maraUps.length){
    const _isLegacy=hasFaction('legacy');
    html+='<div style="font-size:12px;color:#44aacc;font-family:Cinzel,serif;margin-bottom:4px">🏹 Маракеты'+((_isLegacy)?' <span style="color:#cc9933;font-size:11px">(Наследие)</span>':'')+'</div>';
    // For legacy: effective mara level based on which perks are selected
    const _maraXp=(G.factionXp&&G.factionXp.maraketh)||0;
    let _maraLvl;
    if(_isLegacy){
      const lp=G.legacyPerks||[];
      _maraLvl=lp.some(p=>p==='mara_3')?3:lp.some(p=>p==='mara_2')?2:lp.some(p=>p==='mara_1')?1:0;
    } else {
      _maraLvl=FACTIONS.maraketh.levels.filter(l=>_maraXp>=l.xp).length-1;
    }
    html+=maraUps.map(u=>{
    if((u.minLevel||1)>_maraLvl){
      return '<div class="srow" style="opacity:.35;pointer-events:none"><span>🔒</span>'+
        '<div class="si"><div class="snm">'+u.nm+'</div>'+
        '<div class="sds">'+((_isLegacy)?'Нужен перк Маракетов ур.'+(u.minLevel):'Уровень Маракет '+(u.minLevel))+'</div></div></div>';
    }
      const _tog=['autoRescue','autoHeal','autoBuyMaps'].includes(u.id);
      const done=_tog?false:(u.id==='autoExp'?!!(G.factionUnlocks.autoExpBought):(G.factionUnlocks[u.id]||false));
      const cost=u.cost();const canAff=G.gold>=cost;
      // Special render for autoSellItems
      if(u.id==='autoSellItems'){
        const bought=G.factionUnlocks.autoSellItems;
        const rules=G.autoSellRules||{normal:false,magic:false,rare:false};
        const buyBtn=bought?'':('<span class="spr">'+gi(16)+cost+'</span><button class="btn btn-sm" data-mara-up="autoSellItems"'+(canAff?'':' disabled')+'>Купить</button>');
        const toggles=bought?[
          {q:'normal',lbl:'⬜ Белые'},
          {q:'magic',lbl:'🟦 Синие'},
          {q:'rare',lbl:'🟨 Жёлтые'},
        ].map(x=>'<div style="display:flex;justify-content:space-between;align-items:center;margin-top:4px">'+
          '<span style="font-size:12px;color:var(--txt-b)">'+x.lbl+'</span>'+
          '<button class="btn btn-sm" data-mara-up="autoSellToggle" data-q="'+x.q+'" style="min-width:52px;'+(rules[x.q]?'border-color:#44cc44;color:#44cc44':'')+'">'+(rules[x.q]?'ВКЛ':'ВЫКЛ')+'</button>'+
        '</div>').join(''):'';
        return '<div class="srow"><div style="flex:1"><div class="snm">'+u.nm+'</div><div class="sds">'+u.desc()+'</div>'+
          (toggles||'<div style="display:flex;justify-content:space-between;align-items:center;margin-top:3px">'+buyBtn+'</div>')+
        '</div></div>';
      }
      return '<div class="srow"><div style="flex:1"><div class="snm">'+u.nm+'</div><div class="sds">'+u.desc()+'</div>'+
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-top:3px">'+
        (done?'<span class="gt" style="font-size:12px">✓ Куплено</span>':
         _tog?_maraToggleBtn(u):
         '<span class="spr">'+gi(16)+cost+'</span><button class="btn btn-sm" data-mara-up="'+u.id+'"'+(canAff?'':' disabled')+'>Купить</button>')+
        '</div></div></div>';
    }).join('');
    html+='<div style="border-top:1px solid #334;margin:6px 0"></div>';
  }
  html+=defs.map(u=>{
    const lvl=G.ups[u.id],maxed=lvl>=u.max,cost=u.cost();
    return '<div class="srow"><div style="flex:1"><div class="snm">'+u.nm+'</div><div class="sds">'+u.desc()+'</div>'+
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-top:3px">'+
      (maxed?'<span class="gt" style="font-size:12px">✓ MAX</span>':
       '<span class="spr">'+gi(16)+cost+'</span><button class="btn btn-sm" data-up="'+u.id+'">Улучшить</button>')+
      '</div></div></div>';
  }).join('');
  // Boss is now shown in the Maps tab as a card
  // Render into left tab if exists, else right panel
  const _upEl=document.getElementById('tab-upg');
  const _upOld=document.getElementById('upgrades');
  if(_upEl)_upEl.innerHTML=html;
  if(_upOld)_upOld.innerHTML='';
  // Prestige panel under log
  const _pp=document.getElementById('prestige-panel');if(_pp)_pp.style.display=canPrestige()?'block':'none';
  // Sync atlas bar prestige button
  renderAtlasBar();
}