// main.js — точка входа
// Зависимости: все модули

function preloadPortraits(){
  window._preloadedPortraits=[];
  Object.values(WCLS).forEach(c=>{
    if(c.port){const i=new Image();i.src=c.port;window._preloadedPortraits.push(i);}
    if(c.portBig){const i=new Image();i.src=c.portBig;window._preloadedPortraits.push(i);}
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