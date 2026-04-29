// main.js — точка входа
// Зависимости: все модули

// ══════════════════════════════════════════════════════
// ПРЕДЗАГРУЗКА РЕСУРСОВ
// Группа 1 (сразу): текстура и свиток журнала, маленькие портреты
// Группа 2 (после группы 1, макс 4с): подложки карт MAP_IMAGES
// Группа 3 (после группы 2, макс 5с): большие портреты portBig
// ══════════════════════════════════════════════════════
function _preloadGroup(urls,onDone){
  window._preloadCache=window._preloadCache||[];
  if(!urls.length){if(onDone)onDone();return;}
  let done=0;const total=urls.length;const timeout=Math.max(4000,total*800);
  let finished=false;
  function finish(){if(finished)return;finished=true;if(onDone)onDone();}
  const timer=setTimeout(finish,timeout);
  urls.forEach(src=>{
    const i=new Image();
    i.onload=i.onerror=()=>{done++;window._preloadCache.push(i);if(done>=total){clearTimeout(timer);finish();}};
    i.src=src;
  });
}

function preloadPortraits(){
  // Группа 1: журнал + маленькие портреты
  const g1=[
    'https://raw.githubusercontent.com/reiinf/Kalguur/main/images/leather.png',
    'https://raw.githubusercontent.com/reiinf/Kalguur/main/images/scroll.png',
    ...Object.values(WCLS).filter(c=>c.port).map(c=>c.port),
  ];
  // Группа 2: подложки карт
  const g2=Object.values(MAP_IMAGES||{});
  // Группа 3: большие портреты
  const g3=Object.values(WCLS).filter(c=>c.portBig).map(c=>c.portBig);

  _preloadGroup(g1,()=>{
    _preloadGroup(g2,()=>{
      _preloadGroup(g3,null);
    });
  });
}

// ══════════════════════════════════════════════════════
// WASM GUARD
// ══════════════════════════════════════════════════════
window._wasmReady=false;
window._wasmValid=false;
window._wasmLoaded=false;

function _wasmWriteString(wasm,str){
  const ptr=wasm.__new(str.length*2,2);
  const view=new Uint16Array(wasm.memory.buffer);
  for(let i=0;i<str.length;i++) view[(ptr>>1)+i]=str.charCodeAt(i);
  return ptr;
}

function _wasmTickInterval(){
  if(!window._wasmReady||!window._wasmInst) return 999999;
  try{
    const ptr=_wasmWriteString(window._wasmInst,window.location.hostname);
    return window._wasmInst.getTickInterval(ptr);
  }catch(e){return 999999;}
}

WebAssembly.instantiateStreaming(fetch('release.wasm'),{
  env:{abort:()=>{}}
}).then(result=>{
  const ex=result.instance.exports;
  window._wasmInst=ex;
  window._wasmReady=true;
  try{
    const host=window.location.hostname;
    const ptr=_wasmWriteString(ex,host);
    window._wasmValid=ex.checkDomain(ptr)===1;
  }catch(e){
    window._wasmValid=false;
  }
  if(!window._wasmValid) G.prestige=-1;
  window._wasmLoaded=true;
}).catch(()=>{
  window._wasmValid=false;
  window._wasmLoaded=true;
  G.prestige=-1;
});

function init(){
  preloadPortraits();
  load();renderAll();initJournal();
  if(window.SPRITE_B64) setSpriteCSS(window.SPRITE_B64);
  const _gi=document.getElementById('ri-gold-ico');if(_gi)_gi.innerHTML=gi(18);
  // Трекер онлайн-времени — только реальное время в браузере
  window._sessionStart=performance.now();
  window._playTimeInterval=setInterval(()=>{
    const _now=performance.now();
    const _delta=_now-(window._lastPlayTimeMark||window._sessionStart);
    window._lastPlayTimeMark=_now;
    if(_delta<10000)G.playTime=(G.playTime||0)+_delta;
  },1000);
  // Ждём загрузки WASM перед запуском тика
  window._lastTick=performance.now();
  window._tickAccum=0;
  function scheduleTick(){
    if(!window._wasmLoaded){
      window._rafId=requestAnimationFrame(scheduleTick);
      return;
    }
    const now=performance.now();
    const elapsed=now-window._lastTick;
    window._lastTick=now;
    window._tickAccum+=elapsed;
    const _ti=_wasmTickInterval();
    if(window._tickAccum>_ti*10)window._tickAccum=_ti*10; // макс 10 тиков за раз (~2с)
    while(window._tickAccum>=_ti){window._tickAccum-=_ti;tick();}
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