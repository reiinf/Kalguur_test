// ui-debug.js — дебаг и сброс
// Зависимости: utils.js

function dbgIconSlots(){
  return DBG_ICONS.map(ic=>{
    const stored=localStorage.getItem(DBG_LS_PREFIX+ic.key);
    const preview=stored
      ? '<img src="'+stored+'" style="width:32px;height:32px;image-rendering:pixelated;border:1px solid var(--brd);display:block;margin-bottom:3px">'
      : '<div style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-size:22px;border:1px solid var(--brd);margin-bottom:3px">'+ic.em+'</div>';
    const delBtn=stored?'<button class="btn btn-sm btn-r" style="padding:1px 5px;font-size:10px" onclick="dbgDelIcon(\''+ic.key+'\')">✕</button>':'';
    return '<div style="display:flex;flex-direction:column;align-items:center;gap:2px;width:48px">'+
      preview+
      '<div style="font-size:9px;color:var(--txt-d);text-align:center;line-height:1.2">'+ic.label+'</div>'+
      '<label class="btn btn-sm" style="padding:1px 4px;font-size:9px;cursor:pointer;width:100%;text-align:center">'+
        '📂<input type="file" accept="image/*" style="display:none" onchange="dbgLoadIcon(\''+ic.key+'\',this)">'+
      '</label>'+
      delBtn+
    '</div>';
  }).join('');
}

function dbgLoadIcon(key, input){
  const file=input.files[0];if(!file)return;
  const r=new FileReader();
  r.onload=ev=>{
    localStorage.setItem(DBG_LS_PREFIX+key,ev.target.result);
    _iconOverrides[key]=ev.target.result;
    window.DBG_ICONS_MAP=null; // reset map cache
    const el=document.getElementById('dbg-icon-slots');
    if(el)el.innerHTML=dbgIconSlots();
    renderAll();
    showN('🎨 Иконка загружена: '+key,'grn');
  };
  r.readAsDataURL(file);
  input.value='';
}

function dbgDelIcon(key){
  localStorage.removeItem(DBG_LS_PREFIX+key);
  delete _iconOverrides[key];
  window.DBG_ICONS_MAP=null;
  const el=document.getElementById('dbg-icon-slots');
  if(el)el.innerHTML=dbgIconSlots();
  renderAll();
  showN('🗑 Иконка удалена: '+key);
}

function openDebug(){
  const sp=sDmg()+sSurv();
  const _fmtTime=ms=>{const s=Math.floor(ms/1000);const m=Math.floor(s/60);const h=Math.floor(m/60);return (h?h+'ч ':'')+(m%60?m%60+'м ':'')+(s%60)+'с';};
  const _sessionMs=performance.now()-(window._sessionStart||performance.now());
  const _totalMs=(G.playTime||0);
  // Average rewards per tier at power=100
  const avgRew=MAP_TIERS.map(m=>{
    const base=(goldMin(m,SHOP_COSTS[m.t]||0)+goldMax(m,SHOP_COSTS[m.t]||0))/2;
    const mult=Math.min(1.6,1+(100*.003));
    return 'T'+m.t+':'+(Math.floor(base*mult));
  }).join(' ');
  const rows=[
    ['version','v'+VERSION],
    ['session_time',_fmtTime(_sessionMs)],
    ['total_playtime',_fmtTime(_totalMs)],
    ['gold',G.gold],['totalRuns',G.totalRuns],['prestige',G.prestige],['bonus',G.prestigeBonus+'%'],
    ['selfPower',sp],['chances',[1,3,5,8,10,12,16].map(t=>'T'+t+':'+Math.round(calcCh(sp,t)*100)+'%').join(' ')],
    ['cleared',Object.keys(G.cleared).sort((a,b)=>a-b).join(',')],
    ['maps',Object.keys(G.maps).filter(k=>G.maps[k]>0).map(k=>k+':'+G.maps[k]).join(',')],
    ['workers',G.workers.map(w=>w.name+'('+w.cls+',lvl'+w.level+',⚔'+w.dmg+',🛡'+w.surv+','+w.status+')').join('|')],
    ['inv',G.inv.length],['stats',JSON.stringify(G.stats)],['ups',JSON.stringify(G.ups)],
    ['avgRew_p100',avgRew],
    ['dgr',MAP_TIERS.map(m=>'T'+m.t+':'+m.dgr).join(' ')],
    ['achs',Object.keys(G.achs).join(',')],
    ['tierRuns',G.stats.tierRuns?Object.entries(G.stats.tierRuns).sort((a,b)=>parseInt(a[0])-parseInt(b[0])).map(([t,n])=>'T'+t+':'+n).join(' '):'—'],
  ];
  const dataStr=JSON.stringify(Object.fromEntries(rows),null,2);
  openM('🔧 ДЕБАГ',
    '<div id="dbg-out">'+rows.map(([k,v])=>'<div><span style="color:#ffaa44">'+k+':</span> '+JSON.stringify(v)+'</div>').join('')+'</div>'+
    '<div style="margin-top:7px;display:flex;gap:5px">'+
      '<button class="btn btn-sm" id="btn-copy-debug">📋 Копировать</button> <button class="btn btn-sm btn-p" id="btn-dbg-prestige">✨ Возвышение</button> <button class="btn btn-sm" style="background:#330033;border-color:#990099" id="btn-dbg-imba">👑 Имба</button>'+
      '<button class="btn btn-sm" style="background:#003333;border-color:#009999" id="btn-dbg-splinters">👁 +9999 осколков</button>'+
      '<button class="btn btn-sm" style="background:#1a1000;border-color:#997700" onclick="if(G.delve){G.delve.sulphite=Math.min(G.delve.sulphiteCap,G.delve.sulphite+5000);dvUpdateInfoBar&&dvUpdateInfoBar();updateRes();showN(\'⛽ +5000 сульфита\');}closeM()">⛽ +5000 сульфита</button>'+
      '<button class="btn btn-sm btn-r" id="btn-do-reset" onclick="closeM()">💀 Рестарт</button> <button class="btn btn-sm btn-r" id="btn-close-m">Закрыть</button></div>'+
    '<hr style="border-color:var(--brd);margin:10px 0">'+
    '<div style="font-size:12px;color:var(--gold-d);margin-bottom:6px;letter-spacing:1px">🖼 СПРАЙТШИТ (для claude.ai)</div>'+
    '<div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">'+
      '<label class="btn btn-sm" style="cursor:pointer;background:#001a33;border-color:#0055aa;color:#66aaff" for="dbg-sprite-input">📂 Загрузить spritesheet.png</label>'+
      '<input type="file" id="dbg-sprite-input" accept="image/png,image/*" style="display:none">'+
      '<span id="dbg-sprite-status" style="font-size:12px;color:var(--txt-d)">'+
        (localStorage.getItem('kalguur_sprites') ? '✅ Спрайтшит загружен' : '⚠ Не загружен — иконки отображаются как эмодзи')+
      '</span>'+    '</div>'+    '<hr style="border-color:var(--brd);margin:10px 0">'+    '<div style="font-size:12px;color:var(--gold-d);margin-bottom:6px;letter-spacing:1px">💾 ПЕРЕНОС ИКОНОК (между версиями)</div>'+    '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px">'+      '<button class="btn btn-sm" style="background:#1a2200;border-color:#558800;color:#aaee44" id="btn-export-icons">📤 Экспорт иконок</button>'+      '<button class="btn btn-sm" style="background:#001a22;border-color:#008855;color:#44eeaa" id="btn-import-icons">📥 Импорт иконок</button>'+      '<span id="dbg-icon-transfer-status" style="font-size:12px;color:var(--txt-d)"></span>'+    '</div>'+    '<hr style="border-color:var(--brd);margin:10px 0">'+    '<div style="font-size:12px;color:var(--gold-d);margin-bottom:8px;letter-spacing:1px">🎨 ИКОНКИ — замена по одной</div>'+    '<div id="dbg-icon-slots" style="display:flex;flex-wrap:wrap;gap:8px">'+dbgIconSlots()+'</div>');
  window._debugStr=dataStr;
}

function confirmReset(){
  openM('⚠️ СБРОС',
    '<div style="color:var(--red);margin-bottom:10px;font-size:15px">Весь прогресс будет уничтожен.</div>'+
    '<div style="display:flex;gap:6px">'+
      '<button class="btn btn-r" id="btn-do-reset">💀 Умереть в нищете</button>'+
      '<button class="btn btn-sm" id="btn-close-m">Нет</button></div>');
}
function doReset(){
  if(window._tickId){clearInterval(window._tickId);window._tickId=null;}
  if(window._saveId){clearInterval(window._saveId);window._saveId=null;}
  try{localStorage.removeItem('kartahodec_save');}catch(e){}
  G=freshG();
  // Self-correcting tick loop — survives background tab throttling
window._lastTick=performance.now();
window._tickAccum=0;
function scheduleTick(){
  const now=performance.now();
  const elapsed=now-window._lastTick;
  window._lastTick=now;
  window._tickAccum+=elapsed;
  while(window._tickAccum>=200){window._tickAccum-=200;tick();}
  window._rafId=requestAnimationFrame(scheduleTick);
}
if(window._rafId)cancelAnimationFrame(window._rafId);
scheduleTick();
  // Hide modal overlay
  const ov=document.getElementById('moverlay');if(ov)ov.classList.remove('on');
  // Replace app
  const app=document.getElementById('app');
  if(!app)return;
  app.innerHTML=
    '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:80vh;text-align:center;gap:16px">'+
    '<div style="font-size:60px">💀</div>'+
    '<div style="font-family:Cinzel,serif;font-size:29px;color:var(--red);text-shadow:0 0 25px rgba(200,50,50,.6)">СМЕРТЬ В НИЩЕТЕ</div>'+
    '<div style="color:var(--txt-d);font-style:italic;font-size:19px">Изгнанник пал, не достигнув величия...</div>'+
    '<button class="btn" style="font-size:17px;padding:12px 24px" onclick="location.reload()">⚔ Начать заново</button></div>';
}

// ══════════ TOOLTIP ═══════════════════════════════════════════
