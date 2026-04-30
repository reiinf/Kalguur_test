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
  const _CATCHUP_MAX=1800000; // 30 минут макс
  const _BASE_TI=200;         // базовый интервал тика мс

  // Накапливаем время при скрытии вкладки
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden){
      window._hiddenAt=Date.now();
    } else {
      if(window._hiddenAt){
        const _away=Date.now()-window._hiddenAt;
        window._hiddenAt=null;
        if(_away>500){
          G.catchupMs=Math.min(_CATCHUP_MAX,(G.catchupMs||0)+_away);
          _updateCatchupUI();
        }
      }
      window._lastTick=performance.now();
      window._tickAccum=0;
    }
  });

  function _updateCatchupUI(){
    const el=document.getElementById('catchup-timer');
    if(!el)return;
    const ms=G.catchupMs||0;
    if(ms<=0){el.style.display='none';return;}
    const sec=Math.ceil(ms/1000);
    const m=Math.floor(sec/60),s=sec%60;
    el.style.display='flex';
    el.querySelector('.catchup-time').textContent=(m>0?m+'м ':'')+s+'с';
    el.querySelector('.catchup-pause-btn').textContent=G.catchupPaused?'▶':'⏸';
  }
  window._updateCatchupUI=_updateCatchupUI;

  function scheduleTick(){
    if(!window._wasmLoaded){
      window._rafId=requestAnimationFrame(scheduleTick);
      return;
    }
    const now=performance.now();
    const elapsed=Math.min(now-window._lastTick,500); // cap: не больше 500мс за кадр
    window._lastTick=now;
    window._tickAccum+=elapsed;
    const _ti=_wasmTickInterval();
    // Если есть накопленное время и не на паузе — тикаем вдвое быстрее
    const _eff=(_ti>0&&(G.catchupMs||0)>0&&!G.catchupPaused)?_ti/2:_ti;
    while(window._tickAccum>=_eff){
      window._tickAccum-=_eff;
      tick();
      if((G.catchupMs||0)>0&&!G.catchupPaused){
        G.catchupMs=Math.max(0,G.catchupMs-_BASE_TI);
        if(G.catchupMs%2000<_BASE_TI)_updateCatchupUI(); // обновлять UI раз в ~2с
      }
    }
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