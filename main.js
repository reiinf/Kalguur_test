// main.js — точка входа
// Зависимости: все модули

function preloadPortraits(){
  window._preloadedPortraits=[];
  Object.values(WCLS).forEach(c=>{
    if(c.port){const i=new Image();i.src=c.port;window._preloadedPortraits.push(i);}
    if(c.portBig){const i=new Image();i.src=c.portBig;window._preloadedPortraits.push(i);}
  });
}

function init(){
  preloadPortraits();
  load();renderAll();initJournal();
  // Apply sprite CSS var if already loaded (e.g. from localStorage)
  if(window.SPRITE_B64) setSpriteCSS(window.SPRITE_B64);
  // Update static gold icon in header
  const _gi=document.getElementById('ri-gold-ico');if(_gi)_gi.innerHTML=gi(18);
  // Трекер онлайн-времени — только реальное время в браузере
  window._sessionStart=performance.now();
  window._playTimeInterval=setInterval(()=>{
    const _now=performance.now();
    const _delta=_now-(window._lastPlayTimeMark||window._sessionStart);
    window._lastPlayTimeMark=_now;
    // Если вкладка была заморожена (delta > 10с) — не считаем
    if(_delta<10000)G.playTime=(G.playTime||0)+_delta;
  },1000);
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
  window._saveId=setInterval(save,8000);
  log('🌟 Добро пожаловать! Картоходец v'+VERSION,'info');
  if(G.firstRun&&(G.prestige||0)===0&&(G.totalRuns||0)===0){G.firstRun=false;save();setTimeout(openTutorial,300);}
  else{G.firstRun=false;}
  switchCenterTab('acts');
}
// ══════════════════════════════════════════════════════
// МИНИКАРТА
// ══════════════════════════════════════════════════════

init();
