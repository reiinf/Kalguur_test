// events.js — обработка кликов и событий
// Зависимости: все модули

document.addEventListener('click',function(e){
  const t=e.target;const cl=s=>t.closest?t.closest(s):null;
  // Для кнопок с иконками внутри — поднимаемся до кнопки
  const tBtn=t.tagName==='BUTTON'?t:(t.closest?t.closest('button'):null);
  const tId=tBtn?tBtn.id:t.id;
  hideTip();
  // Orb auto-toggle
  if(t.dataset.orbToggle){
    if(!G.autoOrb&&(G.deliriumOrbs||0)<1){showN('Нет сфер делириума!');return;}
    G.autoOrb=!G.autoOrb;
    showN(G.autoOrb?'🔮 Авто-сфера включена! +20% на каждый ран':'🔮 Авто-сфера выключена','pur');
    save();
    const _m=getMd(G.selMap);const _s=String(G.selMap||'');
    if(_m)updateRunVis(_m,true,_s.startsWith('grd_'),_s.startsWith('boss_'));
    return;
  }
  // Reroll contracts
  if(t.id==='btn-reroll-contracts'){
    const rc=Math.max(50,Math.floor(goldMax(MAP_TIERS[Math.min(15,(G.maxTier||1)-1)])*(1+(G.prestigeBonus||0)/100)*0.3));
    if(G.gold<rc){showN('Недостаточно золота! Нужно '+rc+gi(16));return;}
    G.gold-=rc;G.contracts=G.contracts.filter(c=>c.needsClaim);refreshContracts();updateRes();save();
    showN('🔄 Контракты обновлены!','pur');return;
  }
  // Master contract fight button
  const _mBtn=t.dataset.masterId?t:t.closest('[data-master-id]');
  if(_mBtn&&_mBtn.dataset.masterId){startMasterContract(_mBtn.dataset.masterId);return;}
  // Tabs
  const tabBtn=cl('.tab-btn');
  if(tabBtn&&tabBtn.dataset.tab){
    const tab=tabBtn.dataset.tab;G.activeTab=tab;
    document.querySelectorAll('#left-panel .tab-btn').forEach(b=>b.classList.remove('active'));
    document.querySelectorAll('#left-panel .tabpanel').forEach(p=>p.classList.remove('active'));
    const ep=document.getElementById('tab-'+tab);if(ep)ep.classList.add('active');
    tabBtn.classList.add('active');
    if(tab==='inv'){renderInv();}else if(tab==='acts')renderActs();
    else if(tab==='atlas')renderAtlasTab();else if(tab==='ach')renderAchs();

    return;
  }
  // Map select
  const mc=cl('.mcard');if(mc&&mc.dataset.mapkey){selectMap(mc.dataset.mapkey);return;}
  // Class select (only if not locked, or show message)
  if(t.dataset.cls){
    if(G.clsLocked&&G.selfCls){showN('Класс заблокирован! Смените в Лавке за 200'+gi(16)+'.','red');return;}
    const _nc=t.dataset.cls;const _cd=WCLS[_nc]||{};
    openM('Выбрать класс?','<div style="text-align:center;padding:8px">'+
      '<div style="font-size:32px;margin-bottom:8px">'+(_cd.em||'🧙')+'</div>'+
      '<div style="font-size:16px;margin-bottom:4px;color:var(--gold)">'+(_cd.nm||_nc)+'</div>'+
      '<div style="font-size:13px;color:var(--txt-d);margin-bottom:16px">Влияет на боевые характеристики. <span style="white-space:nowrap">Сменить можно будет в Лавке за 200'+gi(16)+'</span></div>'+
      '<div style="display:flex;gap:8px">'+
      '<button class="btn" style="flex:1" onclick="closeM()">Отмена</button>'+
      '<button class="btn btn-p" style="flex:1" onclick="closeM();G.selfCls=\''+_nc+'\';log(\'Выбран класс: \'+WCLS[\''+_nc+'\'].nm,\'info\');updateSelfStats&&updateSelfStats();G.clsLocked=true;updateSelfStats();applyUnlocks();save()">Выбрать</button>'+
      '</div></div>');
    return;
  }
  // Self level up
  if(t.id==='btn-self-lvlup'){
    G.selfLevel=G.selfPendingLevel;
    G.selfLevelUp=false;
    const d=sDmg(),s=sSurv();
    sfxLevelUp();
    log('⭐ Ур.'+G.selfLevel+' применён! ⚔️'+d+' 🛡'+s,'info');
    showN('Ур.'+G.selfLevel+'! ⚔️'+d+' 🛡'+s,'pur');
    updateSelfStats();
    renderMaps();
    // Refresh map chance immediately
    if(G.selMap&&!G.selfRun){const _m=getMd(G.selMap);const _s=String(G.selMap);if(_m)updateRunVis(_m,true,_s.startsWith('grd_'),_s.startsWith('boss_'));}
    renderDelirium();
    save();return;
  }
  // Fixed buttons
  if(t.id==='btn-self-run'){selfRun();return;}
  if(t.id==='btn-cancel-run'){cancelRun();return;}
  if(t.id==='btn-self-eq'){const _w=document.getElementById('inv-btn-wrap');if(_w)_w.classList.remove('inv-pulse');openSelfEq();return;}
  if(t.id==='btn-hire'){openHire();return;}
  if(t.id==='btn-expedition'){openExpedition();return;}
  if(t.id==='btn-debug'){openDebug();return;}
  if(t.id==='btn-do-reset'){doReset();return;}
  if(t.id==='btn-close-m'){closeM();return;}
  if(tId==='btn-sell-all'){sellAllNormal();return;}
  if(tId==='btn-sell-magic'){
    const ms=G.inv.filter(x=>x.quality==='magic');if(!ms.length){showN('Нет волшебных!');return;}
    const tot=ms.reduce((s,x)=>s+(parseInt(x.sellPrice)||0),0);G.inv=G.inv.filter(x=>x.quality!=='magic');
    G.gold+=tot;G.stats.sg+=tot;G.stats.sold+=ms.length;
    log(gi(16)+' Продано '+ms.length+'x волшебных +'+tot+gi(16),'ge');floatT('+'+tot+gi(16),'#c8a96e');
    ms.forEach(it=>{checkContractSell("magic",parseInt(it.sellPrice)||0);});
    checkAchs();renderInv();updateRes();return;
  }
  if(tId==='btn-sell-rare'){
    const rs=G.inv.filter(x=>x.quality==='rare');if(!rs.length){showN('Нет редких!');return;}
    const tot=rs.reduce((s,x)=>s+(parseInt(x.sellPrice)||0),0);
    openM('⚠️ Продать редкие?',
      '<div style="font-size:15px;margin-bottom:12px">Продать <b style="color:var(--rare)">'+rs.length+'</b> редких предметов за <span class="gt">'+tot+gi(16)+'</span>?<br>'+
      '<span style="font-size:13px;color:var(--txt-d)">Это действие необратимо!</span></div>'+
      '<div style="display:flex;gap:6px">'+
        '<button class="btn btn-g" id="btn-confirm-sell-rare">'+gi(16)+' Продать</button>'+
        '<button class="btn btn-r btn-sm" id="btn-close-m">Отмена</button></div>');
    window._pendingRareSell=rs;return;
  }
  if(tId==='btn-confirm-sell-rare'){
    const rs=window._pendingRareSell||[];const tot=rs.reduce((s,x)=>s+(parseInt(x.sellPrice)||0),0);
    const ids=new Set(rs.map(x=>x.id));G.inv=G.inv.filter(x=>!ids.has(x.id));
    G.gold+=tot;G.stats.sg+=tot;G.stats.sold+=rs.length;
    rs.forEach(it=>{checkContractSell("rare",parseInt(it.sellPrice)||0);});
    log(gi(16)+' Продано '+rs.length+'x редких +'+tot+gi(16),'ge');floatT('+'+tot+gi(16),'#f0d060');
    window._pendingRareSell=null;closeM();checkAchs();renderInv();updateRes();return;
  }
  if(t.id==='btn-sell-magic'){
    const ms=G.inv.filter(x=>x.quality==='magic');if(!ms.length){showN('Нет волшебных!');return;}
    const tot=ms.reduce((s,x)=>s+(parseInt(x.sellPrice)||0),0);G.inv=G.inv.filter(x=>x.quality!=='magic');
    G.gold+=tot;G.stats.sg+=tot;G.stats.sold+=ms.length;
    log(gi(16)+' Продано '+ms.length+'x волшебных +'+tot+gi(16),'ge');floatT('+'+tot+gi(16),'#c8a96e');
    checkAchs();renderInv();updateRes();return;
  }
  if(t.id==='btn-sell-rare'){
    const rs=G.inv.filter(x=>x.quality==='rare');if(!rs.length){showN('Нет редких!');return;}
    const tot=rs.reduce((s,x)=>s+(parseInt(x.sellPrice)||0),0);
    openM('⚠️ Продать редкие?',
      '<div style="font-size:15px;margin-bottom:12px">Продать <b style="color:var(--rare)">'+rs.length+'</b> редких предметов за <span class="gt">'+tot+gi(16)+'</span>?<br>'+
      '<span style="font-size:13px;color:var(--txt-d)">Это действие необратимо!</span></div>'+
      '<div style="display:flex;gap:6px">'+
        '<button class="btn btn-g" id="btn-confirm-sell-rare">'+gi(16)+' Продать</button>'+
        '<button class="btn btn-r btn-sm" id="btn-close-m">Отмена</button></div>');
    window._pendingRareSell=rs;return;
  }
  if(tId==='btn-confirm-sell-rare'){
    const rs=window._pendingRareSell||[];const tot=rs.reduce((s,x)=>s+(parseInt(x.sellPrice)||0),0);
    const ids=new Set(rs.map(x=>x.id));G.inv=G.inv.filter(x=>!ids.has(x.id));
    G.gold+=tot;G.stats.sg+=tot;G.stats.sold+=rs.length;
    log(gi(16)+' Продано '+rs.length+'x редких +'+tot+gi(16),'ge');floatT('+'+tot+gi(16),'#f0d060');
    window._pendingRareSell=null;closeM();checkAchs();renderInv();updateRes();return;
  }
  if(t.id==='btn-dbg-imba'){
    const imba={id:++G.iid,name:'Абсолютная Реликвия',em:'🔱',slot:'weapon',cls:'noble',quality:'unique',tier:16,
      mods:[{stat:'dmgPhys',value:4999},{stat:'dmgSpell',value:4999},{stat:'hp',value:4999},{stat:'armor',value:4999},{stat:'allRes',value:80},{stat:'critChance',value:80}],sellPrice:9999};
    G.inv.push(imba);renderInv();updateRes();showN('👑 Абсолютная Реликвия выдана!','pur');save();return;
  }
  if(t.id==='btn-del-mode-exit'){
    openM('❌ Покинуть делириум?',
      '<div style="font-size:14px;color:var(--txt-d);margin-bottom:12px">Режим делириума будет сброшен. Прогресс атласа сохранится, но награда (2й слот кластерника) будет недоступна до следующего возвышения.</div>'+
      '<div style="display:flex;gap:8px">'+
      '<button class="btn btn-r" onclick="G._deliriumMode=false;G._deliriumModeUnlocked=false;save();closeM();renderAll();showN(\'❌ Делириум покинут\',\'red\');">❌ Покинуть</button>'+
      '<button class="btn btn-sm" id="btn-close-m">Отмена</button></div>');
    return;
  }
  if(t.id==='btn-dbg-splinters'){G.deliriumSplinters=(G.deliriumSplinters||0)+9999;updateRes();save();showN('👁 +9999 осколков','pur');return;}
  // Sprite file upload handler (delegated from label click)
  if(t.id==='dbg-sprite-input'||t.closest&&t.closest('label[for="dbg-sprite-input"]')){return;}
  
  if(t.id==='btn-dbg-prestige'){[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16].forEach(t=>{G.cleared[t]=true;});G.achs.all16=true;renderAll();closeM();showN('✨ Возвышение разблокировано!','pur');return;}
  if(t.id==='btn-copy-debug'){try{navigator.clipboard.writeText(window._debugStr||'');}catch(ex){}showN('Скопировано!');return;}
  if(t.id==='btn-export-icons'){
    const data={};
    DBG_ICONS.forEach(ic=>{const v=localStorage.getItem(DBG_LS_PREFIX+ic.key);if(v)data[ic.key]=v;});
    const spr=localStorage.getItem('kalguur_sprites');if(spr)data['__sprite__']=spr;
    const json=JSON.stringify(data);
    try{navigator.clipboard.writeText(json);const st=document.getElementById('dbg-icon-transfer-status');if(st)st.textContent='✅ '+Object.keys(data).length+' иконок скопировано в буфер!';}catch(ex){
      const st=document.getElementById('dbg-icon-transfer-status');if(st)st.textContent='❌ Не удалось скопировать — вставьте вручную в консоль';
    }showN('📤 Иконки экспортированы','grn');return;
  }
  if(t.id==='btn-import-icons'){
    const raw=prompt('Вставьте данные иконок (JSON):');if(!raw)return;
    try{
      const data=JSON.parse(raw);let cnt=0;
      Object.entries(data).forEach(([key,val])=>{
        if(key==='__sprite__'){localStorage.setItem('kalguur_sprites',val);window.SPRITE_B64=val;setSpriteCSS(val);}
        else{localStorage.setItem(DBG_LS_PREFIX+key,val);_iconOverrides[key]=val;cnt++;}
      });
      _iconOverridesLoaded=false;_ensureOverrides();window.DBG_ICONS_MAP=null;
      renderAll();const gi2=document.getElementById('ri-gold-ico');if(gi2)gi2.innerHTML=gi(18);
      const st=document.getElementById('dbg-icon-transfer-status');if(st)st.textContent='✅ Импортировано: '+cnt+' иконок';
      showN('📥 Иконки импортированы!','grn');
    }catch(ex){showN('❌ Ошибка импорта: '+ex.message,'red');}return;
  }
  // Prestige
  // Boss is now handled via map card click
  if(t.id==='btn-prestige'||t.id==='btn-prestige-bar'){doPrestige();return;}
  if(t.dataset.facTab){openFactionChoice(t.dataset.facTab);return;}
  const _claimId=t.dataset.claimId;if(_claimId){claimContract(_claimId);return;}
  const _passId=t.dataset.passiveId;if(_passId){buyPassive(_passId);return;}
  const facPick=t.closest('[data-faction-pick]');
  if(facPick){confirmPrestige(facPick.dataset.factionPick);return;}
  // Shop
  if(t.dataset.shop){buyShop(t.dataset.shop,parseInt(t.dataset.qty)||1);return;}
  // Upgrades
  if(t.dataset.maraUp){
    const mid=t.dataset.maraUp;
    if(mid==='autoExpToggle'){G.autoExp=!G.autoExp;renderUpgrades();save();return;}
    if(mid==='autoExpBuy'){if(G.gold<200){showN('Недостаточно золота!');return;}G.gold-=200;G.factionUnlocks.autoExpBought=true;renderUpgrades();updateRes();save();return;}
    if(mid==='autoRescue'){if(!G.factionUnlocks.autoRescueBought){if(G.gold<600){showN('Недостаточно золота!');return;}G.gold-=600;G.factionUnlocks.autoRescueBought=true;}G.autoRescue=!G.autoRescue;renderUpgrades();updateRes();save();return;}
    if(mid==='autoHeal'){if(!G.factionUnlocks.autoHealBought){if(G.gold<400){showN('Недостаточно золота!');return;}G.gold-=400;G.factionUnlocks.autoHealBought=true;}G.autoHeal=!G.autoHeal;renderUpgrades();updateRes();save();return;}
    if(mid==='autoBuyMaps'){if(!G.factionUnlocks.autoBuyMapsBought){if(G.gold<1000){showN('Недостаточно золота!');return;}G.gold-=1000;G.factionUnlocks.autoBuyMapsBought=true;}G.autoBuyMaps=!G.autoBuyMaps;renderUpgrades();updateRes();save();return;}
    if(mid==='guardedWorkers'){if(G.factionUnlocks.guardedWorkers){showN('Уже куплено!');return;}if(G.gold<1500){showN('Недостаточно золота!');return;}G.gold-=1500;G.factionUnlocks.guardedWorkers=true;renderUpgrades();updateRes();save();showN('🛡 Усиленная охрана активна!','pur');return;}
    if(mid==='autoSellItems'){if(!G.factionUnlocks.autoSellItems){if(G.gold<1200){showN('Недостаточно золота!');return;}G.gold-=1200;G.factionUnlocks.autoSellItems=true;if(!G.autoSellRules)G.autoSellRules={normal:false,magic:false,rare:false};}renderUpgrades();updateRes();save();return;}
    if(mid==='autoSellToggle'){const q=t.dataset.q;if(!G.autoSellRules)G.autoSellRules={normal:false,magic:false,rare:false};G.autoSellRules[q]=!G.autoSellRules[q];renderUpgrades();save();return;}
    if(mid==='exp5'){if(G.gold<800){showN('Недостаточно золота!');return;}G.gold-=800;G.factionUnlocks.exp5=true;G.lastExpSlots=null;renderUpgrades();updateRes();save();showN('🗺 Долгий поход! Теперь до 5 карт.','pur');setTimeout(()=>openExpedition(),100);return;}
    return;
  }
  if(t.dataset.up){
    const costs={slots:()=>Math.floor(200*Math.pow(2.2,G.ups.slots)),rescue:()=>Math.floor(250*Math.pow(2,G.ups.rescue)),heal:()=>Math.floor(220*Math.pow(2,G.ups.heal))};
    const maxes={slots:4,rescue:3,heal:3};const id=t.dataset.up;
    if(!costs[id])return;if(G.ups[id]>=maxes[id]){showN('Максимум!');return;}
    const cost=costs[id]();if(G.gold<cost){showN('Мало золота!');return;}
    G.gold-=cost;G.ups[id]++;log('⚙ '+id+' → Ур.'+G.ups[id],'info');updateRes();renderUpgrades();renderWorkers();return;
  }
  // Workers
  const sendEl=t.dataset.send?t:cl('[data-send]');if(sendEl&&sendEl.dataset.send){sendWorker(parseInt(sendEl.dataset.send));return;}
  const rescEl=t.dataset.rescue?t:cl('[data-rescue]');if(rescEl&&rescEl.dataset.rescue){rescueW(parseInt(rescEl.dataset.rescue));return;}
  const weqEl=t.dataset.weq?t:cl('[data-weq]');if(weqEl&&weqEl.dataset.weq){openWorkerEq(parseInt(weqEl.dataset.weq));return;}
  const bisEl=t.dataset.workerBis?t:cl('[data-worker-bis]');if(bisEl&&bisEl.dataset.workerBis){workerBestInSlot(parseInt(bisEl.dataset.workerBis));return;}
  const fireEl=t.dataset.fireWorker?t:cl('[data-fire-worker]');if(fireEl&&fireEl.dataset.fireWorker){fireWorker(parseInt(fireEl.dataset.fireWorker));return;}
  const fireConfEl=t.dataset.fireConfirm?t:cl('[data-fire-confirm]');if(fireConfEl&&fireConfEl.dataset.fireConfirm){fireWorkerConfirm(parseInt(fireConfEl.dataset.fireConfirm));return;}
  const hireEl=cl('[data-hire]');if(hireEl){hireWorker(hireEl.dataset.hire);return;}
  // Acts
  if(t.dataset.act){startAct(t.dataset.act);return;}
  // Expedition modal
  const xslotClearEl=t.dataset.xslotClear!==undefined?t:cl('[data-xslot-clear]');
  if(xslotClearEl&&xslotClearEl.dataset.xslotClear!==undefined){
    if(window._exp){window._exp.slots[parseInt(xslotClearEl.dataset.xslotClear)]=null;delete window._exp.pickSlot;window._exp.render();}return;
  }
  const xslotEl=t.dataset.xslot!==undefined?t:cl('[data-xslot]');
  if(xslotEl&&xslotEl.dataset.xslot!==undefined){
    if(window._exp){window._exp.pickSlot=parseInt(xslotEl.dataset.xslot);window._exp.render();}return;
  }
  if(t.dataset.xpick){
    if(window._exp){
      const _t=parseInt(t.dataset.xpick);
      const _slots=window._exp.slots;
      const _tc=window._exp.tierCounts||{};
      // How many of this tier are already placed
      const _alreadyUsed=_slots.filter(s=>s===_t).length;
      let _avail=(_tc[_t]||0)-_alreadyUsed;
      // Fill empty slots with this tier while cards available
      for(let i=0;i<_slots.length&&_avail>0;i++){
        if(_slots[i]===null){_slots[i]=_t;_avail--;}
      }
      delete window._exp.pickSlot;window._exp.render();
    }return;
  }
  const xwEl=t.dataset.xworker?t:cl('[data-xworker]');
  if(xwEl&&xwEl.dataset.xworker){if(window._exp){window._exp.wid=parseInt(xwEl.dataset.xworker);window._exp.render();}return;}
  if(t.id==='btn-xgo'){if(window._exp&&window._exp.wid)startExpedition(window._exp.wid);return;}
  // Equipment
  const pickEl=cl('[data-pick-w]');if(pickEl){openSlotPick(parseInt(pickEl.dataset.pickW),pickEl.dataset.pickSl,parseInt(pickEl.dataset.pickW)!==0);return;}
  const eqEl=cl('[data-equip-item]');if(eqEl){doEquip(parseInt(eqEl.dataset.equipOwner),eqEl.dataset.equipSlot,parseInt(eqEl.dataset.equipItem),eqEl.dataset.equipIsw==='1');return;}
  const uqEl=t.dataset.uneqSlot?t:cl('[data-uneq-slot]');if(uqEl&&uqEl.dataset.uneqSlot){doUnequip(parseInt(uqEl.dataset.uneqOwner),uqEl.dataset.uneqSlot,uqEl.dataset.uneqIsw==='1');return;}
  if(t.dataset.backEq!==undefined){if(t.dataset.backIsw==='1')openWorkerEq(parseInt(t.dataset.backEq));else openSelfEq();return;}
  // Inventory
  const claimEl=t.dataset.claimAch?t:cl('[data-claim-ach]');if(claimEl&&claimEl.dataset.claimAch){claimAch(claimEl.dataset.claimAch);return;}
  const iico=cl('[data-iid]');if(iico){openItemM(parseInt(iico.dataset.iid));return;}
  if(t.dataset.sellId){sellItem(parseInt(t.dataset.sellId));return;}
  if(t.dataset.discardId){discardItem(parseInt(t.dataset.discardId));return;}
  if(t.id==='moverlay'||t===document.getElementById('moverlay')){if(t._tutorialLock)return;closeM();return;}
});
document.addEventListener('mousemove',function(e){
  const el=e.target.closest?e.target.closest('[data-tip]'):null;
  if(el)showTip(e,parseInt(el.dataset.tip));else hideTip();
});
document.addEventListener('scroll',()=>hideTip(),true);

// ══════════ INIT ══════════════════════════════════════════════