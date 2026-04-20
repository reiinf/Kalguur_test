// ui-maps.js — карты
// Зависимости: mechanics.js, utils.js

function renderAll(){applyUnlocks();
  // Авто-выбор карты T1 если ничего не выбрано (старт игры, возвышение)
  {const _sk=String(G.selMap||'');const _noSel=!G.selMap||(!G.maps[_sk]&&!_sk.startsWith('grd_')&&!_sk.startsWith('boss_'));if(_noSel){const _t1=Object.keys(G.maps).filter(k=>!isNaN(k)&&G.maps[k]>0).map(Number).sort((a,b)=>a-b)[0];if(_t1)G.selMap=_t1;}}
  // Restore/set active left tab
  {const _vt=['maps','shop','inv','atlas','ach','upg'].filter(t=>{const b=document.getElementById('tabbtn-'+t);return b&&b.style.display!=='none';});
  const _tr=(G.activeTab&&G.activeTab!=='acts'&&_vt.includes(G.activeTab))?G.activeTab:(_vt[0]||'maps');
  document.querySelectorAll('#left-panel .tab-btn').forEach(b=>b.classList.toggle('active',b.dataset.tab===_tr));
  document.querySelectorAll('#left-panel .tabpanel').forEach(p=>p.classList.toggle('active',p.id==='tab-'+_tr));
  G.activeTab=_tr;}updateAchBadge();renderMaps();renderShop();renderInv();renderActs();renderWorkers();renderUpgrades();renderAtlasBar();renderAtlasTab();renderAchs();renderDelirium();renderDelve();updateRes();updateStats();updateSelfStats();updateDeliriumTab();
  // Обновить портал карты для авто-выбранной карты
  if(G.selMap&&!G.selfRun){const _sk2=String(G.selMap);const _md2=getMd(_sk2);if(_md2)updateRunVis(_md2,true,_sk2.startsWith('grd_'),_sk2.startsWith('boss_'));else updateRunVis(null);}
}

function renderMaps(){
  const el=document.getElementById('tab-maps');if(!el)return;
  const _fog=G._deliriumMode?' delirium-fog':'';
  const allKeys=Object.keys(G.maps).filter(k=>G.maps[k]>0);
  if(!allKeys.length){el.innerHTML='<div class="dim" style="text-align:center;padding:14px;font-style:italic">Нет карт.<br>Купите в лавке или пройдите акты!</div>';return;}
  const power=sDmg()+sSurv();
  const normal=allKeys.filter(k=>!isNaN(k)).map(Number).sort((a,b)=>b-a);
  const cursed=allKeys.filter(k=>String(k).startsWith('c')).map(k=>parseInt(k.slice(1))).sort((a,b)=>b-a);
  const uniqs=allKeys.filter(k=>String(k).startsWith('u')).map(k=>parseInt(k.slice(1))).sort((a,b)=>b-a);
  const grdKeys=Object.keys(G.maps).filter(k=>k.startsWith('grd_')&&G.maps[k]>0);
  // Boss portal cards
  // Combined Exarch+Eater card (single entry), Shaper separate
  const altKills=(G.bossKills.exarch||0)+(G.bossKills.eater||0);
  const anyT16=(G.stats&&G.stats.tierRuns&&G.stats.tierRuns[16]>0)||(G.t16RunsSinceBoss>0)||altKills>0||G.pendingBoss||G.activeBossId;
  const altCards=anyT16?[{t:17,k:'boss_alt',type:'boss'}]:[];
  const bossCards=[
    ...BOSSES.filter(b=>b.id==='shaper').filter(b=>{
      const pieces=G.guardianPieces.shaper||0;
      return pieces>0||(G.bossAttempts[b.id]||0)>0||(G.bossKills[b.id]||0)>0;
    }).map(b=>({t:17,k:'boss_shaper',type:'boss'})),
    ...altCards,
  ];
  const items=[
    ...bossCards.filter(x=>x.k==='boss_shaper'),   // 1. Создатель
    ...bossCards.filter(x=>x.k!=='boss_shaper'),    // 2. Элдрич боссы
    ...grdKeys.map(k=>({t:16,k,type:'guardian'})),  // 3. Гварды
    ...uniqs.map(t=>({t,k:'u'+t,type:'uniq'})),     // 4. Уникальные
    ...cursed.map(t=>({t,k:'c'+t,type:'cursed'})),  // 5. Зараженные
    ...normal.map(t=>({t,k:String(t),type:'normal'})), // 6. Обычные T16→T1
  ];
  let html='';
  items.forEach(({t,k,type})=>{
    // Boss card rendering
    if(type==='boss'){
      // Combined alt-boss card
      if(k==='boss_alt'){
        const activAlt=G.pendingBoss||G.activeBossId||(altKills>0?'exarch':null);
        const ab=activAlt?BOSSES.find(x=>x.id===activAlt):null;
        const altReady=G.pendingBoss==='exarch'||G.pendingBoss==='eater'||G.activeBossId==='exarch'||G.activeBossId==='eater';
        const altHasTries=G.bossTriesLeft>0&&(G.activeBossId==='exarch'||G.activeBossId==='eater');
        const actualKey=altReady||altHasTries?'boss_'+(G.pendingBoss||G.activeBossId):'boss_alt';
        const isSel=String(G.selMap)===actualKey||String(G.selMap)==='boss_alt';
        const prog=Math.round(((G.t16RunsSinceBoss||0)/28)*100);
        html+='<div class="mcard '+(isSel?'sel':'')+_fog+'" style="border-color:'+(altReady||altHasTries?'#cc6600':'#335566')+';cursor:'+(altReady||altHasTries?'pointer':'default')+'" '+(altReady||altHasTries?'data-mapkey="'+actualKey+'"':'')+'>'+
          '<div class="mtier" style="color:#cc6600;font-size:12px">'+(altReady||altHasTries?'💥':'⏳')+'</div>'+
          '<div style="flex:1;min-width:0">'+
            '<div class="mname" style="color:'+(altReady||altHasTries?'#ffaa44':'#887755')+'">'+
              (altReady||altHasTries?((ab?ab.em+' '+ab.nm:'Элдрич Босс')+' <span style="font-size:11px;color:#ffaa44">[ПРИЗВАН]</span>'):
              '🔥🌑 Элдрич Боссы')+
            '</div>'+
            '<div class="mreward" style="font-size:11px">'+gi(16)+'2000-4000 + уникальный предмет</div>'+
            (altReady||altHasTries
              ?'<div style="font-size:12px;color:#ffaa44;margin-top:2px">⚔️ '+(G.bossTriesLeft>0?G.bossTriesLeft:6)+'/6 попыток осталось</div>'
              :'<div style="margin-top:4px"><div style="font-size:11px;color:var(--txt-d);margin-bottom:2px">'+(G.t16RunsSinceBoss||0)+'/28 T16 карт</div>'+
               '<div style="height:3px;background:var(--bg2);border-radius:2px"><div style="height:100%;width:'+prog+'%;background:#cc6600;border-radius:2px;transition:width .3s"></div></div></div>')+
          '</div>'+
        '</div>';
        return;
      }
      const bid=k.slice(5);const b=BOSSES.find(x=>x.id===bid);if(!b)return;
      const isAlt=bid==='exarch'||bid==='eater';
      const pieces=isAlt?0:(G.guardianPieces.shaper||0);const maxP=isAlt?0:4;
      const hasTries=G.bossTriesLeft>0&&G.activeBossId===bid;
      // Ready if has fragments OR has remaining tries (for any boss type)
      const ready=hasTries||(isAlt?(G.pendingBoss===bid):(pieces>=maxP));
      const isSel=String(G.selMap)===k;
      html+='<div class="mcard '+(isSel?'sel':'')+_fog+'" style="border-color:'+(ready?'#0088cc':'#335566')+';cursor:'+(ready?'pointer':'default')+'" '+(ready?'data-mapkey="'+k+'"':'')+'>'+
        '<div class="mtier" style="color:#44aaff">💠</div>'+
        '<div style="flex:1">'+
          '<div class="mname" style="color:'+(ready?'#44aaff':'#6699bb')+'">'+b.em+' '+b.nm+
            (!ready&&!isAlt?' <span style="font-size:11px;color:var(--txt-d)">['+pieces+'/'+maxP+' фрагментов]</span>':hasTries?' <span style="font-size:11px;color:#ffaa44">['+G.bossTriesLeft+'/6 попыток]</span>':'')+'</div>'+
          '<div class="mreward">'+gi(16)+'3000-6000 + уникальный предмет</div>'+
          (ready?(()=>{const _bRaw=calcCh(sDmg()+sSurv(),16);const _bCap=bid==='shaper'?0.70:0.80;const _bCh=delModCh(Math.max(0.03,Math.min(_bCap,_bRaw)));const _bCapPct=Math.round(delModCh(_bCap)*100);const _bIsCapped=_bRaw>=_bCap-0.001;return '<div style="font-size:12px;color:#44aaff;margin-top:2px">✨ Портал открыт! <span style="color:'+chcol(_bCh)+'">'+Math.round(_bCh*100)+'%'+(_bIsCapped?'<span style="font-size:9px;color:#ff9944;margin-left:3px">(кап '+_bCapPct+'%)</span>':'<span style="font-size:9px;color:var(--txt-d);margin-left:3px">(кап '+_bCapPct+'%)</span>')+'</span></div>';})():
                  (isAlt?(
  G.pendingBoss===bid||hasTries
    ?'<div style="font-size:12px;color:#ffaa44;margin-top:2px">⚔️ Попыток: '+(G.bossTriesLeft)+'/6</div>'
    :'<div style="margin-top:4px"><div style="font-size:11px;color:var(--txt-d);margin-bottom:2px">'+
      (G.t16RunsSinceBoss||0)+'/28 T16 карт</div>'+
      '<div style="height:3px;background:var(--bg2);border-radius:2px"><div style="height:100%;width:'+
      Math.round(((G.t16RunsSinceBoss||0)/28)*100)+'%;background:#44aaff;border-radius:2px"></div></div></div>'
):'<div style="font-size:12px;color:var(--txt-d);margin-top:2px">Убейте 4 стражей на T16</div>'))+
        '</div></div>';
      return;
    }
    if(!(G.maps[k]>0))return;
    if(!(G.maps[k]>0))return;
    const md=MAP_TIERS[t-1];
    const chMod=type==='guardian'?-.12:0;
    const hasOrb=G.deliriumMaps&&G.deliriumMaps[k];
    const chTier=(md.t||t)+(type==='cursed'?1:0)+(type==='uniq'?1:0);
    const rawCh=calcCh(power,Math.min(16,chTier))+chMod;
    const capVal=type==='guardian'?0.85:null;
    const ch=delModCh(Math.max(.03,capVal!==null?Math.min(capVal,rawCh):rawCh));
    const isCapped=capVal!==null&&rawCh>=capVal-0.001;
    const capPct=capVal!==null?Math.round(delModCh(capVal)*100):null;
    const cc=chcol(ch);
    const sel=String(G.selMap)===k?'sel':'';
    const borderCol=type==='cursed'?'#9944cc':type==='uniq'?'#cc5500':type==='guardian'?'#0088cc':'';
    const badge=type==='cursed'?'<span style="color:#bb44ff;font-size:11px">[ЗАРАЖ.]</span>':
                type==='uniq'?'<span style="color:#e87020;font-size:11px">[УНИК.]</span>':'';
    const prefix=type==='cursed'?'💜 ':type==='uniq'?'🟠 ':type==='guardian'?'🔷 ':'';  const grdData=type==='guardian'?GUARDIAN_MAPS.find(g=>'grd_'+g.id===k):null;
    const cost=SHOP_COSTS[t]||0;
    html+='<div class="mcard '+sel+_fog+'" style="'+(borderCol?'border-color:'+borderCol+';':'')+'" data-mapkey="'+k+'">'+
      '<div class="mtier" style="color:'+tcol(t)+'">'+prefix+'T'+t+'</div>'+
      '<div style="flex:1">'+
        '<div class="mname">'+(type==='guardian'?'🔷 <span style="color:#44aaff">'+(grdData?grdData.nm:'Гвардейская')+'</span> <span style="color:#44aaff;font-size:11px">[СТРАЖ]</span>':type==='uniq'?(()=>{const ud=G.uniqMapData&&G.uniqMapData[k];return (ud?ud.em:md.em)+' <span style="color:#e87020">'+(ud?ud.nm:md.nm)+'</span>';})():md.em+' '+md.nm)+' '+badge+'</div>'+
        '<div style="font-size:12px;color:var(--txt-d)">'+gi(16)+(goldMin(md,SHOP_COSTS[md.t]||0))+(goldMax(md,SHOP_COSTS[md.t]||0)>goldMin(md,SHOP_COSTS[md.t]||0)?'-'+goldMax(md,SHOP_COSTS[md.t]||0):'')+' + предметы</div>'+
        '<div class="mch-wrap"><div class="mch-bg"><div class="mch-fill" style="width:'+(Math.min(1,ch)*100)+'%;background:'+cc+';position:relative">'+
        '</div></div>'+
        '<div class="mch-pct" style="color:'+cc+'">'+Math.round(Math.min(1,ch)*100)+'%'+(isCapped?'<span style="font-size:9px;color:#ff9944;display:block;line-height:1">кап</span>':'')+'</div></div>'+
      '</div>'+
      '<div class="mcnt">'+G.maps[k]+'x</div></div>';
  });
  el.innerHTML=html;
}
function selectMap(key){
  let k=String(key);
  // Route alt boss card to actual pending boss
  if(k==='boss_alt'){k='boss_'+(G.pendingBoss||G.activeBossId||'exarch');}
  G.selMap=k;renderMaps();
  const isGrdKey=k.startsWith('grd_');
  const md=getMd(k);
  if(!G.selfRun)updateRunVis(md,true,isGrdKey,k.startsWith('boss_'));
  updateSelfStats();renderWorkers();
}