// ui-fishing.js — рыбалка
// Зависимости: state.js

function openFishing(){
  const hasCaught=G._fishCaught||0;
  window._fishDiff=window._fishDiff||'medium';
  openM('🎣 Рыбалка',
    '<div style="text-align:center;padding:4px 0 8px;font-size:13px;color:var(--txt-d)">'+
    '<span id="fish-count">'+(hasCaught?'Поймано рыб: <b style="color:var(--gold)">'+hasCaught+'</b>':'Здесь ловят рыбу.')+'</span>'+
    '</div>'+
    '<div id="fish-diff-btns" style="display:flex;gap:6px;justify-content:center;margin-bottom:10px"></div>'+
    '<canvas id="fish-canvas" width="200" height="320" style="display:block;margin:0 auto;border:1px solid var(--brd);border-radius:3px;background:#050d15;cursor:pointer"></canvas>'+
    '<button class="btn" style="display:block;margin:10px auto 0;width:120px" onclick="closeM()">Закрыть</button>'
  );
  setTimeout(_fishInit, 50);
}

function _fishRenderDiffBtns(){
  const el=document.getElementById('fish-diff-btns');
  if(!el)return;
  const d=window._fishDiff||'medium';
  el.innerHTML=['easy','medium','hard'].map(v=>{
    const nm={easy:'🟢 Лёгкая',medium:'🟡 Средняя',hard:'🔴 Сложная'}[v];
    const active=d===v;
    return '<button class="btn btn-sm" data-fishd="'+v+'" style="'+(active?'border-color:var(--gold);color:var(--gold)':'')+'" onclick="_fishSetDiff(this.dataset.fishd)">'+nm+'</button>';
  }).join('');
}
function _fishSetDiff(d){
  window._fishDiff=d;
  _fishRenderDiffBtns();
  if(window._fishStop)window._fishStop();
  setTimeout(_fishInit,20);
}

function _fishInit(){
  const cv=document.getElementById('fish-canvas');
  if(!cv)return;
  if(window._fishStop)window._fishStop();
  _fishRenderDiffBtns();
  const ctx=cv.getContext('2d');
  const W=200,H=320;
  // Difficulty params
  const diff=window._fishDiff||'medium';
  const DIFF={
    easy:  {ZONE_H:90, zoneSpd:{up:4,down:1.5}, fishSpd:{acc:0.010,damp:0.82,max:2.0}, progSpd:{in:0.6,out:0.3}, timer:[50,100]},
    medium:{ZONE_H:60, zoneSpd:{up:4,down:2},   fishSpd:{acc:0.015,damp:0.78,max:2.5}, progSpd:{in:0.6,out:0.3}, timer:[30,60]},
    hard:  {ZONE_H:48, zoneSpd:{up:4,down:2.2}, fishSpd:{acc:0.018,damp:0.76,max:3.0}, progSpd:{in:0.6,out:0.3}, timer:[20,50]},
  }[diff];
  const ZONE_H=DIFF.ZONE_H, FISH_H=16;
  const FISH_EMOJIS=['🐟','🐠','🐡','🦈','🐬','🐙','🦑','🦐','🦞','🦀','🐊','🐸'];
  let currentFish=FISH_EMOJIS[Math.floor(Math.random()*FISH_EMOJIS.length)];
  let zoneY=H/2-ZONE_H/2, fishY=H/2, fishVY=0, fishDir=1;
  let progress=20, caught=false, failed=false, started=false, hadProgress=false;
  let pressed=false, raf=null, fishTargetY=H/2, fishTimer=0;
  let _stopped=false;
  window._fishStop=()=>{_stopped=true;if(raf)cancelAnimationFrame(raf);raf=null;window._fishStop=null;};

  function newTarget(){
    fishTargetY=30+Math.random()*(H-80);
    fishTimer=DIFF.timer[0]+Math.random()*(DIFF.timer[1]-DIFF.timer[0]);
  }
  newTarget();

  function draw(){
    ctx.clearRect(0,0,W,H);
    // фон воды
    ctx.fillStyle='#050d15';ctx.fillRect(0,0,W,H);
    // пузырьки
    ctx.fillStyle='#0a2030';
    for(let i=0;i<8;i++){ctx.beginPath();ctx.arc(20+i*22,(Date.now()/1000*20+i*40)%H,2,0,Math.PI*2);ctx.fill();}
    // зона захвата
    const zCol=progress>80?'#44ff44':progress>40?'#aaff44':'#44aa44';
    ctx.fillStyle=zCol+'33';ctx.fillRect(10,zoneY,W-20,ZONE_H);
    ctx.strokeStyle=zCol;ctx.lineWidth=1.5;ctx.strokeRect(10,zoneY,W-20,ZONE_H);
    // рыба
    const inZone=fishY>zoneY&&fishY+FISH_H<zoneY+ZONE_H;
    ctx.save();
    ctx.font='30px serif';ctx.textAlign='center';ctx.textBaseline='middle';
    if(fishDir<0){ctx.scale(-1,1);ctx.fillText(currentFish,-W/2,fishY+FISH_H/2);}
    else{ctx.fillText(currentFish,W/2,fishY+FISH_H/2);}
    ctx.restore();
    // прогресс-бар
    const pCol=progress>80?'#44ff44':progress>40?'#aaff44':'#cc4444';
    ctx.fillStyle='#0a1a0a';ctx.fillRect(10,H-20,W-20,12);
    ctx.fillStyle=pCol;ctx.fillRect(10,H-20,(W-20)*progress/100,12);
    ctx.strokeStyle='#333';ctx.lineWidth=1;ctx.strokeRect(10,H-20,W-20,12);
    ctx.fillStyle='#fff';ctx.font='9px monospace';ctx.textAlign='center';
    ctx.fillText(caught?'ПОЙМАНА!':failed?'УШЛА...':Math.round(progress)+'%',W/2,H-11);
    // леска
    ctx.strokeStyle='#ffffff33';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(W/2,0);ctx.lineTo(W/2,fishY);ctx.stroke();
    if(!started){
      ctx.fillStyle='rgba(0,0,0,0.6)';ctx.fillRect(0,0,W,H);
      ctx.fillStyle='#c8a96e';ctx.font='bold 14px Cinzel,serif';ctx.textAlign='center';
      ctx.fillText('Нажми чтобы начать',W/2,H/2);
    }
    if(caught){
      ctx.fillStyle='rgba(0,20,0,0.7)';ctx.fillRect(0,0,W,H);
      ctx.fillStyle='#44ff88';ctx.font='bold 16px Cinzel,serif';ctx.textAlign='center';
      ctx.fillText('🐟 Поймал!',W/2,H/2-10);
      ctx.fillStyle='#c8a96e';ctx.font='12px serif';
      const _fc=document.getElementById('fish-count');if(_fc)_fc.innerHTML='Поймано рыб: <b style="color:var(--gold)">'+(G._fishCaught||0)+'</b>';
      ctx.fillText('Рыб поймано: '+(G._fishCaught||0),W/2,H/2+15);
    }
    if(failed){
      ctx.fillStyle='rgba(20,0,0,0.7)';ctx.fillRect(0,0,W,H);
      ctx.fillStyle='#ff4444';ctx.font='bold 16px Cinzel,serif';ctx.textAlign='center';
      ctx.fillText('Ушла...',W/2,H/2);
    }
  }

  function tick(){
    if(_stopped)return;
    if(!started||caught||failed){draw();raf=requestAnimationFrame(tick);return;}
    // движение зоны
    if(pressed) zoneY=Math.max(0,Math.min(H-ZONE_H,zoneY-DIFF.zoneSpd.up));
    else zoneY=Math.min(H-ZONE_H,zoneY+DIFF.zoneSpd.down);
    // движение рыбы
    fishTimer--;
    if(fishTimer<=0) newTarget();
    const dy=fishTargetY-fishY;
    fishVY+=dy*DIFF.fishSpd.acc;
    fishVY*=DIFF.fishSpd.damp;
    if(Math.abs(fishVY)>DIFF.fishSpd.max)fishVY=DIFF.fishSpd.max*Math.sign(fishVY);
    fishY+=fishVY;
    fishY=Math.max(10,Math.min(H-ZONE_H,fishY));
    if(fishVY>0.5)fishDir=1;else if(fishVY<-0.5)fishDir=-1;
    // прогресс
    const inZone=fishY>zoneY&&fishY+FISH_H<zoneY+ZONE_H;
    if(inZone){progress=Math.min(100,progress+DIFF.progSpd.in);}
    else{progress=Math.max(0,progress-DIFF.progSpd.out);}
    if(progress>=100){caught=true;G._fishCaught=(G._fishCaught||0)+1;save();_fishCheckAch();}
    if(progress<=0&&started){failed=true;}
    draw();
    if(!caught&&!failed)raf=requestAnimationFrame(tick);
    else{setTimeout(()=>{if(document.getElementById('fish-canvas')){caught=false;failed=false;progress=20;started=false;hadProgress=false;currentFish=FISH_EMOJIS[Math.floor(Math.random()*FISH_EMOJIS.length)];zoneY=H/2-ZONE_H/2;fishY=H/2;fishVY=0;newTarget();raf=requestAnimationFrame(tick);}},1800);}
  }

  cv.addEventListener('mousedown',()=>{if(!started){started=true;}pressed=true;});
  cv.addEventListener('mouseup',()=>{pressed=false;});
  cv.addEventListener('touchstart',e=>{e.preventDefault();if(!started){started=true;}pressed=true;},{passive:false});
  cv.addEventListener('touchend',e=>{e.preventDefault();pressed=false;},{passive:false});
  cv.addEventListener('mouseleave',()=>{pressed=false;});
  raf=requestAnimationFrame(tick);
  const origClose=window._modalOnClose;
  window._modalOnClose=()=>{if(raf)cancelAnimationFrame(raf);if(origClose)origClose();};
}

function _fishCheckAch(){
  const n=G._fishCaught||0;
  if(n>=1)grantAch('fish1');
  if(n>=10)grantAch('fish10');
  if(n>=30)grantAch('fish100');
}



// Save obfuscation — XOR + base64, не шифрование, но от случайного редактирования защищает
