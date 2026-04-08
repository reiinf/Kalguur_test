// ui-delve.js — шахта (Delve)
// Зависимости: mechanics.js, utils.js

function genCluster(wave){
  const num=2;
  const pool=[...CLUSTER_STATS];
  const picked=[];
  for(let i=0;i<num;i++){const idx=Math.floor(Math.random()*pool.length);picked.push(pool.splice(idx,1)[0]);}
  const mods=picked.map(s=>({stat:s.stat,value:Math.floor(5+wave*1.5+Math.random()*10)}));
  const nm='Кластерный Самоцвет';
  return {id:++G.iid,name:nm,em:'🔮',slot:'cluster',cls:'noble',quality:'cluster',tier:Math.min(16,wave),
    mods,sellPrice:Math.floor(200+wave*50)};
}
// ══════════ DELIRIUM ══════════════════════════════════════════

// Wave descriptors — flavor text for each wave range
const DELIRIUM_WAVES=[
  {min:1,max:3,   em:'👁',  nm:'Первый туман',           mobs:'Лунатики, Разбитые умы',                boss:null},
  {min:4,max:6,   em:'💀',  nm:'Пробуждение ужаса',      mobs:'Косикс — Сотня личин, Омнифобия — Всечудовище', boss:'Косикс, Омнифобия'},
  {min:7,max:10,  em:'🔥',  nm:'Натиск симулякра',       mobs:'Стражи Симулякра, Испорченные тени',    boss:'Ксибакуа, Непостижимый'},
  {min:11,max:15, em:'⚡',  nm:'Расколотая реальность',  mobs:'Осколки Толана, Зеркальные Рейкары',    boss:'Толан, Повелитель видений'},
  {min:16,max:20, em:'🌑',  nm:'Апофеоз Делириума',      mobs:'Эхо Зерхула, Манифестации тьмы',        boss:'Зерхул, Ночной король'},
  {min:21,max:99, em:'☠️', nm:'Бесконечный Делириум',   mobs:'Ущербные, Аватары Делириума',            boss:'Исстенн, Разрушительница Миров'},
];
function getDelWave(n){
  return DELIRIUM_WAVES.find(w=>n>=w.min&&n<=w.max)||DELIRIUM_WAVES[DELIRIUM_WAVES.length-1];
}

// ── DELVE ──────────────────────────────────────────────────────────────────
const DELVE_UPGRADES=[
  {id:'armor',  nm:'Броня вагонетки',    em:'🛡️', desc:'Снижает урон по персонажу в шахте',  effect:'-5% получаемого урона за уровень'},
  {id:'blast',  nm:'Подрыв породы',      em:'💥', desc:'Ослабляет противников в шахте',       effect:'-4% здоровья противников за уровень'},
  {id:'speed',  nm:'Скорость вагонетки', em:'⚡', desc:'Ускоряет спуск',                      effect:'-3% времени забега за уровень'},
  {id:'storage',nm:'Хранилище',          em:'🪣', desc:'Увеличивает запас Сульфита',           effect:'+500 к запасу за уровень'},
  {id:'pump',   nm:'Насос Сульфита',     em:'⛽', desc:'Больше Сульфита с карт',              effect:'+5% Сульфита с карт за уровень'},
  {id:'lantern',nm:'Яркость фонаря',     em:'🔦', desc:'Помогает находить Азурит',             effect:'+5% шанса найти Азурит за уровень'},
];
const DELVE_LOCATIONS=[
  {id:'standard', nm:'Обычный тоннель',    em:'⚫', mods:{}},
  {id:'azurite',  nm:'Азуритовая жила',    em:'💎', mods:{azurite:3, item:0.5, currency:0.5, sulphite:0.5}},
  {id:'fossil',   nm:'Окаменелости',       em:'🦴', mods:{item:2, currency:1.5}},
  {id:'dark',     nm:'Тёмный ход',         em:'🌑', mods:{currency:2, azurite:0.5}},
  {id:'sulphite', nm:'Сульфитовая жила',   em:'⛽', mods:{sulphite:4, item:0.5, currency:0.5, azurite:0.5}},
];
// Стоимость одного спуска на глубину d
function delveCost(d){
  // Стоимость ≈ 2 карты соответствующего тира сложности
  const t=Math.max(1,Math.min(16,Math.ceil(d/10)));
  return 55+t*20;
}
// Время одного забега в шахте (мс), учитывает апгрейд скорости
function delveRunTime(){
  const spd=(G.delve.upgrades.speed||0)*0.03;
  return Math.round(8000*(1-spd));
}
// Сульфит с карты по тиру
function sulphiteFromTier(tier,isWorker){
  const ranges=[[1,3,20,40],[4,6,35,60],[7,9,55,90],[10,12,80,130],[13,15,110,170],[16,16,150,220]];
  const rng=ranges.find(r=>tier>=r[0]&&tier<=r[1])||ranges[0];
  const base=rng[2]+Math.floor(Math.random()*(rng[3]-rng[2]+1));
  const pump=1+(G.delve.upgrades.pump||0)*0.05;
  return Math.round(base*(isWorker?0.3:1)*pump);
}
// Цена апгрейда (уровень 1..20)
function delveUpgradeCost(lvl){
  let cost=50;for(let i=1;i<lvl;i++)cost=Math.round(cost*1.3);return cost;
}
// Chance to pass wave n (decreases with power scaling)
function delWaveCh(wave){
  const power=sDmg()+sSurv();
  // Logarithmic power scaling — endgame power doesn't trivialize content
  const powerBonus=Math.log(Math.max(1,power/100))*0.46;
  const raw=0.60+powerBonus-wave*0.047;
  return Math.max(0.05,Math.min(0.97,raw));
}
// Rewards per wave
function delWaveReward(wave){
  // Splinters main currency; guaranteed orb every wave 5+
  const splinters=wave<=2?1:wave<=5?2:Math.floor(1+wave*0.6);
  const orbs=wave>=5?1:0;
  return {orbs,splinters};
}


function switchCenterTab(tab){
  ['portal','delirium','delve','acts'].forEach(t=>{
    const btn=document.getElementById('ctab-'+t);
    const con=document.getElementById('ctab-content-'+t);
    if(btn)btn.classList.toggle('active',t===tab);
    if(con)con.style.display=t===tab?'block':'none';
  });
  if(tab==='acts')renderActs();
  if(tab==='delve')renderDelve();
}

// ── DELVE GRID CONSTANTS ──────────────────────────────────────────────────

const BIOME_TYPES=[
  {id:'stone',   nm:'Каменные тоннели',  col:'#1a1208', mods:{}},
  {id:'azurite', nm:'Азуритовые жилы',   col:'#081828', mods:{azurite:1.5}},
  {id:'abyssal', nm:'Бездонные глубины', col:'#080818', mods:{item:1.3}},
  {id:'fossil',  nm:'Окаменелости',      col:'#181408', mods:{item:2.0}},
  {id:'crystal', nm:'Кристальная пещера',col:'#101820', mods:{}},
];

const DV_COLS=13;      // колонок (шире экрана — влево/вправо)
const DV_ROWS_AHEAD=12; // рядов вперёд
const DV_CELL=70;      // размер ячейки в пикселях (квадрат)
const DV_FILL=0.30;    // вероятность узла в ячейке

// ── DELVE GRID GENERATION ─────────────────────────────────────────────────
// Сетка col/row. Узлы не в каждой клетке — разреженная расстановка.
// Тоннели строго горизонтальные или вертикальные (L-образные повороты).
// Ключ узла: "col_row".

function dvKey(col,row){return col+'_'+row;}

function dvGenNode(col,row){
  const weights=[
    {id:'standard',w:40},{id:'azurite',w:18},{id:'fossil',w:16},
    {id:'dark',w:14},{id:'sulphite',w:12}
  ];
  const total=weights.reduce((s,x)=>s+x.w,0);
  let r=Math.random()*total,type='standard';
  for(const w of weights){r-=w.w;if(r<=0){type=w.id;break;}}
  const biome=BIOME_TYPES[Math.floor(Math.random()*BIOME_TYPES.length)].id;
  // Случайное смещение внутри ячейки: ±30% от размера ячейки
  const jx=(Math.random()-0.5)*DV_CELL*0.6;
  const jy=(Math.random()-0.5)*DV_CELL*0.5;
  return{col,row,type,biome,visited:false,jx,jy};
}

function dvHasEdge(grid,a,b){
  return grid.edges.some(([x,y])=>(x===a&&y===b)||(x===b&&y===a));
}

function dvAddEdge(grid,a,b){
  if(!dvHasEdge(grid,a,b))grid.edges.push([a,b]);
}

function dvGenChunk(grid,fromRow,toRow){
  // PoE-стиль: каждая ячейка заполняется с вероятностью DV_FILL.
  // Связность: spanning tree — от каждого узла гарантирован путь к стартовому.
  // Тоннели: между соседними узлами (по горизонтали или вертикали), L-образные визуально.

  for(let row=fromRow;row<=toRow;row++){
    // 1. Случайно заполняем ячейки
    const newCols=[];
    for(let col=0;col<DV_COLS;col++){
      if(Math.random()<DV_FILL){
        if(!grid.nodes[dvKey(col,row)]){
          grid.nodes[dvKey(col,row)]=dvGenNode(col,row);
        }
        newCols.push(col);
      }
    }

    // Гарантируем хотя бы 2 узла в ряду
    while(newCols.length<2){
      const col=Math.floor(Math.random()*DV_COLS);
      if(!newCols.includes(col)){
        if(!grid.nodes[dvKey(col,row)]) grid.nodes[dvKey(col,row)]=dvGenNode(col,row);
        newCols.push(col);
      }
    }
    newCols.sort((a,b)=>a-b);

    // 2. Горизонтальные рёбра внутри ряда (соседние, 50% шанс)
    for(let i=0;i<newCols.length-1;i++){
      if(Math.random()<0.5) dvAddEdge(grid,dvKey(newCols[i],row),dvKey(newCols[i+1],row));
    }

    // 3. Вертикальные рёбра к предыдущему ряду — spanning tree
    // Для каждого нового узла ищем ближайший узел в предыдущем ряду
    const prevCols=[];
    for(let c=0;c<DV_COLS;c++){
      if(grid.nodes[dvKey(c,row-1)])prevCols.push(c);
    }

    if(prevCols.length>0){
      // Spanning tree: соединяем каждый новый узел с ближайшим предыдущим
      const linkedPrev=new Set();
      for(const col of newCols){
        const near=prevCols.reduce((b,c)=>Math.abs(c-col)<Math.abs(b-col)?c:b,prevCols[0]);
        dvAddEdge(grid,dvKey(near,row-1),dvKey(col,row));
        linkedPrev.add(near);
      }
      // Узлы предыдущего ряда без связи вниз — подключить
      for(const pc of prevCols){
        if(linkedPrev.has(pc))continue;
        const near=newCols.reduce((b,c)=>Math.abs(c-pc)<Math.abs(b-pc)?c:b,newCols[0]);
        dvAddEdge(grid,dvKey(pc,row-1),dvKey(near,row));
      }
    }
  }
  grid.generatedRows=toRow+1;
}


function dvEnsureGenerated(){
  const g=G.delve.grid;
  const needed=g.playerRow+DV_ROWS_AHEAD;
  if(g.generatedRows<=needed) dvGenChunk(g,g.generatedRows,needed);
}

function dvInitGrid(){
  const dv=G.delve;
  dv.grid={
    nodes:{},edges:[],
    playerCol:6,playerRow:0,
    cameraRow:0,cameraCol:6,
    minRowVisible:0,
    generatedRows:0,selectedKey:null,
    _genVer:'376g'
  };
  dv.grid.nodes[dvKey(6,0)]={col:6,row:0,type:'standard',biome:'stone',visited:true,jx:0,jy:0};
  dvGenChunk(dv.grid,1,DV_ROWS_AHEAD);
}

function dvPruneOldRows(){
  const g=G.delve.grid;
  const minRow=g.minRowVisible;
  for(const key of Object.keys(g.nodes)){
    if(g.nodes[key].row<minRow) delete g.nodes[key];
  }
  g.edges=g.edges.filter(([a,b])=>g.nodes[a]&&g.nodes[b]);
}

function dvGetNeighbors(nodeId){
  const g=G.delve.grid;
  const result=[];
  for(const[a,b] of g.edges){
    if(a===nodeId&&g.nodes[b])result.push(g.nodes[b]);
    else if(b===nodeId&&g.nodes[a])result.push(g.nodes[a]);
  }
  return result;
}

function dvLanternRadius(){
  const lvl=G.delve.upgrades.lantern||0;
  return 1.8+(lvl/20)*2.7; // в клетках сетки
}

function dvNodeDist(nodeId){
  const g=G.delve.grid;
  const n=g.nodes[nodeId];
  if(!n)return 9999;
  const dc=n.col-g.playerCol, dr=n.row-g.playerRow;
  return Math.sqrt(dc*dc+dr*dr);
}

function dvCellSize(){
  return DV_CELL;
}

function dvNodeXY(nodeId){
  const g=G.delve.grid;
  const n=g.nodes[nodeId];
  if(!n)return{x:0,y:0};
  const{W,H}=dvCanvasSize();
  const cell=DV_CELL;
  const camRow=g.cameraRow||0;
  const camCol=g.cameraCol!==undefined?g.cameraCol:6;
  const jx=n.jx||0, jy=n.jy||0;
  return{
    x: W/2+(n.col-camCol)*cell+jx,
    y: H*0.12+(n.row-camRow+0.5)*cell+jy
  };
}

// ── DELVE CANVAS ──────────────────────────────────────────────────────────

let _dv={active:false,animating:false,_raf:null,_resizeTimer:null,camTarget:null,camColTarget:null,camAnimating:false};

function dvGetCanvas(){return document.getElementById('delve-canvas');}

function dvCanvasSize(){
  const wrap=document.getElementById('delve-canvas-wrap');
  if(!wrap)return{W:400,H:300};
  return{W:wrap.clientWidth||400,H:wrap.clientHeight||300};
}

// dvCellSize определена выше в блоке генерации



function _dvAnimFrame(){
  // Плавная камера вертикально
  if(_dv.camTarget!==null){
    const g=G.delve.grid;
    const cur=g.cameraRow||0;
    const diff=_dv.camTarget-cur;
    if(Math.abs(diff)<0.01){g.cameraRow=_dv.camTarget;_dv.camTarget=null;}
    else{g.cameraRow=cur+diff*0.1;}
  }
  // Плавная камера горизонтально
  if(_dv.camColTarget!==null){
    const g=G.delve.grid;
    const cur=g.cameraCol!==undefined?g.cameraCol:6;
    const diff=_dv.camColTarget-cur;
    if(Math.abs(diff)<0.01){g.cameraCol=_dv.camColTarget;_dv.camColTarget=null;}
    else{g.cameraCol=cur+diff*0.1;}
  }
  const camMoving=_dv.camTarget!==null||_dv.camColTarget!==null;
  if(!_dv.animating){
    if(camMoving){dvRender();_dv._raf=requestAnimationFrame(_dvAnimFrame);}
    else{_dv._raf=null;}
    return;
  }
  const pts=_dv.points;
  const target=pts[_dv.ptIdx+1];
  if(!target){
    _dv.animating=false;
    if(_dv.onDone)_dv.onDone();
    // Если камера ещё едет — продолжаем RAF
    if(_dv.camTarget!==null||_dv.camColTarget!==null){_dv._raf=requestAnimationFrame(_dvAnimFrame);}
    else{_dv._raf=null;}
    dvRender();return;
  }
  const dx=target.x-_dv.curX,dy=target.y-_dv.curY;
  const dist=Math.sqrt(dx*dx+dy*dy);
  if(dist<_dv.speed){
    _dv.curX=target.x;_dv.curY=target.y;_dv.ptIdx++;
  }else{
    _dv.curX+=dx/dist*_dv.speed;
    _dv.curY+=dy/dist*_dv.speed;
  }
  dvRender();
  _dv._raf=requestAnimationFrame(_dvAnimFrame);
}

// Строит L-образный путь тоннеля между двумя узлами.
// Поворот всегда у верхнего узла (меньший y = верхний).
// Это гарантирует что анимация совпадает с нарисованным тоннелем.
function _dvTunnelLPath(ctx,x1,y1,x2,y2){
  ctx.beginPath();
  if(Math.abs(x1-x2)<2){
    // Та же колонка — прямо
    ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);
  }else if(y1<=y2){
    // Стартуем сверху: горизонталь из x1 до x2 на высоте y1, потом вниз
    ctx.moveTo(x1,y1);ctx.lineTo(x2,y1);ctx.lineTo(x2,y2);
  }else{
    // Стартуем снизу: сначала вверх до y2, потом горизонталь
    ctx.moveTo(x1,y1);ctx.lineTo(x1,y2);ctx.lineTo(x2,y2);
  }
}

function _dvDrawWall(ctx,x1,y1,x2,y2,na,nb){
  ctx.strokeStyle='#222018';
  ctx.lineWidth=14;
  ctx.lineCap='square';
  ctx.lineJoin='miter';
  ctx.miterLimit=10;
  _dvTunnelLPath(ctx,x1,y1,x2,y2);
  ctx.stroke();
}

function _dvDrawLine(ctx,x1,y1,x2,y2,highlighted,na,nb){
  ctx.strokeStyle=highlighted?'#ffdd44':'#c8a040';
  ctx.lineWidth=highlighted?3.5:2;
  ctx.lineCap='square';
  ctx.lineJoin='miter';
  ctx.miterLimit=10;
  _dvTunnelLPath(ctx,x1,y1,x2,y2);
  ctx.stroke();
}

function dvDrawNodePOE(ctx,x,y,node,state,cell){
  const loc=DELVE_LOCATIONS.find(l=>l.id===node.type)||DELVE_LOCATIONS[0];
  const r=11; // фиксированный радиус узла

  // Непрозрачная "заглушка" под узел — перекрывает конец тоннеля
  ctx.fillStyle='#080604';
  ctx.beginPath();ctx.arc(x,y,r+4,0,Math.PI*2);ctx.fill();

  if(state==='question'){
    // Оранжевый круг с ?
    ctx.shadowColor='#cc6600';
    ctx.shadowBlur=8;
    ctx.fillStyle='#3a1800';
    ctx.strokeStyle='#cc6600';
    ctx.lineWidth=2;
    ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();ctx.stroke();
    ctx.shadowBlur=0;
    ctx.fillStyle='#ff9944';
    ctx.font=`bold ${Math.round(r*0.9)}px serif`;
    ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText('?',x,y+1);
    return;
  }

  // Фон и цвет в зависимости от состояния
  let bgCol,borderCol,borderW,glowCol=null;
  if(state==='player'){
    bgCol='#2a1a00';borderCol='#ffaa00';borderW=2.5;glowCol='#ffaa00';
  }else if(state==='selected'){
    bgCol='#1a3a10';borderCol='#88ff44';borderW=2.5;glowCol='#66ff22';
  }else if(state==='neighbor'){
    bgCol='#2a1a00';borderCol='#ffcc44';borderW=2;glowCol='#ffaa00';
  }else if(state==='visited'){
    bgCol='#111008';borderCol='#554433';borderW=1.5;
  }else{
    // visible
    bgCol='#1a1410';borderCol='#c8a040';borderW=1.5;
  }

  if(glowCol){
    ctx.shadowColor=glowCol;
    ctx.shadowBlur=12;
  }

  ctx.fillStyle=bgCol;
  ctx.strokeStyle=borderCol;
  ctx.lineWidth=borderW;
  ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();ctx.stroke();
  ctx.shadowBlur=0;

  if(state==='player'){
    // Персонаж — оранжевый игрок
    ctx.fillStyle='#ffaa00';
    ctx.font=`bold ${Math.round(r*1.2)}px monospace`;
    ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText('⚙',x,y+1);
  }else if(state!=='visited'){
    // Иконка типа
    ctx.font=`${Math.round(r*0.9)}px serif`;
    ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText(loc.em,x,y+1);
  }else{
    // Посещённый — пустой кружок внутри (как в PoE)
    ctx.strokeStyle='#554433';
    ctx.lineWidth=1.5;
    ctx.beginPath();ctx.arc(x,y,r*0.45,0,Math.PI*2);ctx.stroke();
  }
}

function dvRender(){
  const c=dvGetCanvas();
  if(!c)return;
  const dv=G.delve;
  const g=dv.grid;
  if(!g||!Object.keys(g.nodes).length)return;

  const{W,H}=dvCanvasSize();
  if(c.width!==W||c.height!==H){c.width=W;c.height=H;}
  const ctx=c.getContext('2d');
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='#080604';
  ctx.fillRect(0,0,W,H);

  const lantern=dvLanternRadius();
  const cell=dvCellSize();
  const playerKey=dvKey(g.playerCol,g.playerRow);

  // Состояния узлов
  const nodeStates={};
  // Соседи игрока по рёбрам — подсвечиваем их
  const neighborKeys=new Set(dvGetNeighbors(playerKey).map(n=>dvKey(n.col,n.row)));

  for(const key of Object.keys(g.nodes)){
    if(key===playerKey)continue;
    const n=g.nodes[key];
    const{y}=dvNodeXY(key);
    if(y<-80||y>H+80)continue;
    const dist=dvNodeDist(key);
    const isNeighbor=neighborKeys.has(key);
    if(n.visited){nodeStates[key]='visited';}
    else if(dist<=lantern){
      if(key===g.selectedKey) nodeStates[key]='selected';
      else if(isNeighbor) nodeStates[key]='neighbor';
      else nodeStates[key]='visible';
    }
    else if(dist<=lantern+1.5){nodeStates[key]='question';}
  }

  // Видимые рёбра
  const visEdges=[];
  for(const[ak,bk] of g.edges){
    const na=g.nodes[ak],nb=g.nodes[bk];
    if(!na||!nb)continue;
    const pa=dvNodeXY(ak);
    const pb=dvNodeXY(bk);
    if(pa.y<-60&&pb.y<-60)continue;
    if(pa.y>H+60&&pb.y>H+60)continue;
    const aVis=na.visited||nodeStates[ak];
    const bVis=nb.visited||nodeStates[bk];
    if(!aVis&&!bVis)continue;
    const highlighted=!!(g.selectedKey&&(
      (ak===playerKey&&bk===g.selectedKey)||
      (bk===playerKey&&ak===g.selectedKey)
    ));
    visEdges.push({pa,pb,ak,bk,highlighted,na,nb});
  }

  // Проход 1: серые стены
  for(const{pa,pb,na,nb} of visEdges){
    _dvDrawWall(ctx,pa.x,pa.y,pb.x,pb.y,na,nb);
  }
  // Проход 2: жёлтые линии (не highlighted)
  for(const{pa,pb,highlighted,na,nb} of visEdges){
    if(highlighted)continue;
    _dvDrawLine(ctx,pa.x,pa.y,pb.x,pb.y,false,na,nb);
  }
  // Проход 3: highlighted поверх
  for(const{pa,pb,highlighted,na,nb} of visEdges){
    if(!highlighted)continue;
    _dvDrawLine(ctx,pa.x,pa.y,pb.x,pb.y,true,na,nb);
  }

  // Узлы
  for(const key of Object.keys(nodeStates)){
    const n=g.nodes[key];
    const{x,y}=dvNodeXY(key);
    dvDrawNodePOE(ctx,x,y,n,nodeStates[key],cell);
  }

  // Персонаж
  const ppx=_dv.animating?_dv.curX:dvNodeXY(playerKey).x;
  const ppy=_dv.animating?_dv.curY:dvNodeXY(playerKey).y;
  const pNode=g.nodes[playerKey]||{col:g.playerCol,row:g.playerRow,type:'standard',biome:'stone'};
  dvDrawNodePOE(ctx,ppx,ppy,pNode,'player',cell);

  // Метка глубины
  ctx.fillStyle='rgba(0,0,0,0.5)';
  ctx.fillRect(0,0,W,22);
  ctx.fillStyle='#8870cc';
  ctx.font='bold 11px monospace';
  ctx.textAlign='center';ctx.textBaseline='top';
  ctx.fillText('📍 Глубина: '+dv.depth,W/2,4);
}


// ── DELVE ANIMATION ───────────────────────────────────────────────────────

function dvStartAnim(targetCol,targetRow,onDone){
  const g=G.delve.grid;
  const sk=dvKey(g.playerCol,g.playerRow);
  const tk=dvKey(targetCol,targetRow);
  const startPos=dvNodeXY(sk);
  const endPos=dvNodeXY(tk);
  _dv.animating=true;
  _dv.curX=startPos.x;
  _dv.curY=startPos.y;
  let pts;
  if(Math.abs(startPos.x-endPos.x)<3){
    // Та же колонка — прямо вертикально
    pts=[{x:startPos.x,y:startPos.y},{x:endPos.x,y:endPos.y}];
  }else if(endPos.y>=startPos.y){
    // Вниз или горизонталь: горизонталь сначала (верхний), потом вертикаль
    pts=[{x:startPos.x,y:startPos.y},{x:endPos.x,y:startPos.y},{x:endPos.x,y:endPos.y}];
  }else{
    // Вверх: вертикаль до уровня цели (верхнего), потом горизонталь
    pts=[{x:startPos.x,y:startPos.y},{x:startPos.x,y:endPos.y},{x:endPos.x,y:endPos.y}];
  }
  _dv.points=pts;
  _dv.ptIdx=0;
  _dv.onDone=onDone;
  _dv.speed=1.2;
  if(_dv._raf)cancelAnimationFrame(_dv._raf);
  _dv._raf=requestAnimationFrame(_dvAnimFrame);
}


// ── DELVE INTERACTION ─────────────────────────────────────────────────────

function dvSelectNode(key){
  if(_dv.animating)return;
  const g=G.delve.grid;
  g.selectedKey=key;
  dvUpdateInfoBar();
  dvRender();
}

function dvUpdateInfoBar(){
  const bar=document.getElementById('delve-info-bar');
  if(!bar)return;
  const dv=G.delve;
  const g=dv.grid;
  const sel=g.selectedKey?g.nodes[g.selectedKey]:null;
  const rowDiff=sel?Math.max(0,sel.row-g.playerRow):1;
  const colDiff=sel?Math.abs(sel.col-g.playerCol):0;
  const cost=sel?delveCost(dv.depth+rowDiff*5+colDiff*3):delveCost(dv.depth+5);
  const inDark=sel&&dvNodeDist(g.selectedKey)>dvLanternRadius();
  const effTier=Math.max(1,Math.min(16,Math.ceil((dv.depth+rowDiff*5)/10)))+(inDark?2:0);
  const _power=sDmg()+sSurv();
  const armorB=(dv.upgrades.armor||0)*0.05;
  const blastB=(dv.upgrades.blast||0)*0.04;
  const ch=Math.max(0.03,Math.min(0.97,calcCh(_power,effTier)+armorB+blastB));
  const chCol=chcol(ch);
  const loc=sel?DELVE_LOCATIONS.find(l=>l.id===sel.type):null;
  const sulOk=dv.sulphite>=cost;

  bar.innerHTML=
    '<span style="color:#88dd88">⛽'+dv.sulphite+'</span><span style="color:var(--txt-d)">/'+dv.sulphiteCap+'</span>'+
    ' &nbsp;<span style="color:#88aaff">💎'+dv.azurite+'</span>'+
    (sel?' &nbsp;<span style="color:#ccaaff">'+Math.round(ch*100)+'%</span>':'')+
    (inDark?' <span style="color:#cc6600">⚠ Тьма</span>':'')+
    (sel?' &nbsp;<span style="color:'+(sulOk?'#88dd88':'#ff6666')+'">⛽'+cost+'</span>':'')+
    (loc?' &nbsp;<span style="color:var(--txt-d)">'+loc.em+' '+loc.nm+'</span>':'');

  const btn=document.getElementById('delve-go-btn');
  if(btn){
    const canGo=sel&&sulOk&&!dv.running&&!_dv.animating;
    btn.disabled=!canGo;
    btn.style.opacity=canGo?'1':'0.4';
  }
  const goInfo=document.getElementById('delve-go-info');
  if(goInfo){
    if(sel){
      const chPct=Math.round(ch*100);
      goInfo.innerHTML=
        '<span style="color:'+chCol+'">'+chPct+'% шанс</span>'+
        (inDark?' <span style="color:#cc6600">⚠ тьма</span>':'')+
        ' &nbsp;<span style="color:'+(sulOk?'#888':'#ff6666')+'">⛽'+cost+'</span>'+
        (loc?' &nbsp;<span style="color:#887766">'+loc.em+' '+loc.nm+'</span>':'');
    }else{
      goInfo.innerHTML='<span style="color:var(--txt-d)">Выберите узел</span>';
    }
  }
}

function dvGo(){
  if(_dv.animating)return;
  const dv=G.delve;
  const g=dv.grid;
  if(!g.selectedKey){showN('Выберите узел на карте!');return;}
  const target=g.nodes[g.selectedKey];
  if(!target){showN('Узел не найден!','red');return;}

  // Только по рёбрам
  const neighbors=dvGetNeighbors(dvKey(g.playerCol,g.playerRow));
  const isNeighbor=neighbors.some(n=>dvKey(n.col,n.row)===g.selectedKey);
  if(!isNeighbor){showN('Можно ехать только в соседние узлы!');return;}

  const rowDiff=Math.max(0,target.row-g.playerRow);
  const colDiff=Math.abs(target.col-g.playerCol);
  const cost=delveCost(dv.depth+rowDiff*5+colDiff*3);
  if(dv.sulphite<cost){showN('Недостаточно Сульфита! Нужно '+cost,'red');return;}

  dv.sulphite-=cost;
  dv.running=true;
  const inDarkFinal=dvNodeDist(g.selectedKey)>dvLanternRadius();

  log('⛏️ Спуск ['+(inDarkFinal?'⚠ тьма':'')+(DELVE_LOCATIONS.find(l=>l.id===target.type)||{nm:''}).nm+'] гл.'+(target.row*5),'info');

  const wasVisited=target.visited;

  dvStartAnim(target.col,target.row,()=>{
    g.playerCol=target.col;
    g.playerRow=target.row;
    target.visited=true;
    g.selectedKey=null;
    dv.depth=target.row*5;
    dv.running=false;

    // Плавная камера — вертикальная и горизонтальная
    const{H}=dvCanvasSize();
    const cell=dvCellSize();
    const playerScreenY=H*0.30+(g.playerRow-(g.cameraRow||0))*cell;
    if(playerScreenY>H*0.55){
      _dv.camTarget=Math.max(_dv.camTarget||0, g.playerRow-1);
    }
    _dv.camColTarget=g.playerCol; // центрируем горизонтально на игроке
    if(!_dv._raf)_dv._raf=requestAnimationFrame(_dvAnimFrame);

    const topVisibleRow=Math.floor((g.cameraRow||0)-(H*0.30)/cell)-1;
    g.minRowVisible=Math.max(0,topVisibleRow-2);
    dvPruneOldRows();
    dvEnsureGenerated();

    if(!wasVisited)resolveDelveRunGrid(target,inDarkFinal);
    dvUpdateInfoBar();
    dvRender();
    save();
  });

  dvUpdateInfoBar();
}

function dvFlashResult(lines){
  const el=document.getElementById('delve-result-flash');
  if(!el)return;
  el.innerHTML=lines.join('<br>');
  el.style.opacity='1';
  clearTimeout(el._fadeTimer);
  el._fadeTimer=setTimeout(()=>{el.style.opacity='0';},3000);
}

function resolveDelveRunGrid(node,inDark){
  const dv=G.delve;
  const depth=dv.depth;
  const loc=DELVE_LOCATIONS.find(l=>l.id===node.type)||DELVE_LOCATIONS[0];
  const m=loc.mods||{};

  const effTier=Math.max(1,Math.min(16,Math.ceil(depth/10)))+(inDark?2:0);
  const _power=sDmg()+sSurv();
  const armorB=(dv.upgrades.armor||0)*0.05;
  const blastB=(dv.upgrades.blast||0)*0.04;
  const ch=Math.max(0.03,Math.min(0.97,calcCh(_power,effTier)+armorB+blastB));

  if(Math.random()>ch){
    log('💀 Погибли в шахте на глубине '+depth+'!','ev');
    showN('💀 Погибли в шахте!','red');
    floatT('💀 шахта','#ff4444');
    return;
  }

  const msgs=[];let gotSomething=false;

  if(Math.random()<0.35*(m.item||1)){
    const itmTier=Math.max(1,Math.min(16,Math.ceil(depth/10)));
    const it=genItem(itmTier,G.selfCls||'warrior');
    G.inv.push(it);G.stats.fi++;
    checkContractFind(it.quality);
    msgs.push(it.em+' <span style="color:'+qcolLog(it.quality)+'">'+it.name+'</span>');
    gotSomething=true;
  }
  if(Math.random()<0.40*(m.currency||1)){
    const gld=Math.round((30+depth*3)*(0.8+Math.random()*0.4));
    G.gold+=gld;G.stats.ge+=gld;
    msgs.push('+'+gld+'💰');gotSomething=true;
  }
  if(Math.random()<(0.30+(dv.upgrades.lantern||0)*0.05)*(m.azurite||1)){
    const az=Math.round((10+depth*2)*(0.7+Math.random()*0.6));
    dv.azurite+=az;
    msgs.push('+'+az+'💎');gotSomething=true;
  }
  if(Math.random()<0.12*(m.sulphite||1)){
    const sul=sulphiteFromTier(Math.max(1,Math.min(16,Math.ceil(depth/10))),false);
    const added=Math.min(sul,dv.sulphiteCap-dv.sulphite);
    dv.sulphite=Math.min(dv.sulphiteCap,dv.sulphite+added);
    msgs.push('+'+added+'⛽');gotSomething=true;
  }
  if(!gotSomething){const gld=Math.round(20+depth*2);G.gold+=gld;G.stats.ge+=gld;msgs.push('+'+gld+'💰');}

  log('⛏️ Гл.'+depth+' ['+loc.nm+']: '+msgs.join(', '),'ge');
  floatT('⛏️ находка','#88ccff');
  addXPSelf(xpAmt(Math.max(1,Math.min(16,Math.ceil(depth/10)))));
  updateRes();checkAchs();
  // Флэш наград поверх canvas
  const flashLines=['<span style="color:#c8a040">⛏ Гл.'+depth+'</span> <span style="color:#888">'+loc.nm+'</span>'].concat(msgs);
  dvFlashResult(flashLines);
}

// ── DELVE RENDER ──────────────────────────────────────────────────────────

function renderDelve(){
  const el=document.getElementById('delve-area');if(!el)return;
  const dv=G.delve;

  if(!dv.grid||Object.keys(dv.grid.nodes).length===0)dvInitGrid();
  dvEnsureGenerated();

  // Режим: 'info'=сведения, 'map'=шахта стандарт, 'big'=большой без шапки
  if(!dv.viewMode)dv.viewMode='map';
  const vm=dv.viewMode;

  const introHtml='<div style="background:rgba(0,20,40,.4);border:1px solid #224466;border-radius:6px;padding:10px 12px;margin-bottom:10px;font-size:12px;line-height:1.8;color:var(--txt-d)">'+
    'Под картами Атласа скрываются бесконечные подземные тоннели.<br>'+
    'Вы берёте вагонетку и спускаетесь в темноту — глубже, чем ходят обычные работники.<br>'+
    '<span style="color:#88ccff">Сульфит</span> — топливо, копится с карт. Чем глубже — тем дороже.&nbsp;'+
    '<span style="color:#88aaff">Азурит</span> — самоцветы для улучшений.<br>'+
    'Чем глубже — тем опаснее, но лучше <span style="color:var(--gold)">снаряжение</span> и больше <span style="color:var(--gold)">золота</span>.'+
  '</div>';
  const isBig=(vm==='big');
  const modeBar=
    '<div style="display:flex;gap:4px;margin-bottom:6px;align-items:center">'+
      '<button class="btn btn-sm" onclick="dvOpenInfo()" style="font-size:11px;padding:5px 10px">📋 Сведения</button>'+
      '<button class="tab-btn'+((vm==='map'||vm==='big')?' active':'')+'" onclick="dvSetViewMode(\'map\')" style="font-size:11px;padding:5px 10px">⛏️ Шахта</button>'+
      '<button class="btn btn-sm btn-p" onclick="openDelveUpgrades()" style="font-size:11px;padding:5px 10px">🔧 Улучшения</button>'+
      '<button class="tab-btn" onclick="dvToggleFullscreen()" style="font-size:11px;padding:5px 10px;margin-left:auto">'+(isBig?'⊟ Меньше экран':'⊞ Больше экран')+'</button>'+
    '</div>';

  const infoBarHtml='<div id="delve-info-bar" style="display:flex;flex-wrap:wrap;gap:8px;align-items:center;background:rgba(0,0,0,.3);border:1px solid var(--brd);border-radius:4px;padding:5px 10px;font-size:15px;margin-bottom:6px;min-height:30px"></div>';
  let body='';
  {
    // map или big — карта. В 'big' канвас высокий (600px min-height на контейнере)
    const canvasMinH=vm==='big'?'560px':'260px';
    const canvasHtmlLocal=
      '<div id="delve-canvas-wrap" style="flex:1;position:relative;background:#070504;border:1px solid #334;border-radius:4px;min-height:'+canvasMinH+';overflow:hidden">'+
        '<canvas id="delve-canvas" style="display:block;width:100%;height:100%"></canvas>'+
        '<div style="position:absolute;bottom:0;left:0;right:0;padding:6px;display:flex;justify-content:center;align-items:center;gap:10px;background:linear-gradient(transparent,rgba(0,0,0,0.7))">'+
          '<div id="delve-go-info" style="font-size:15px"></div>'+
          '<button id="delve-go-btn" class="btn btn-p" onclick="dvGo()" disabled style="opacity:.4;font-size:15px;padding:4px 20px">⛏️ ВПЕРЁД</button>'+
        '</div>'+
      '</div>';
    body='<div style="display:flex;flex-direction:column">'+infoBarHtml+canvasHtmlLocal+'</div>';
  }
  el.innerHTML=modeBar+body;

  if(vm!=='compact'){
    _dvAttachCanvas(dv);
  }
}

function _dvAttachCanvas(dv){
  setTimeout(()=>{
    const cv=document.getElementById('delve-canvas');
    const wrap=document.getElementById('delve-canvas-wrap');
    if(!cv||!wrap)return;
    const doResize=()=>{
      const W=wrap.clientWidth,H=wrap.clientHeight;
      if(W>0&&H>0){cv.width=W;cv.height=H;}
      dvRender();
      dvUpdateInfoBar();
    };
    doResize();
    if(window._dvResizeObs)window._dvResizeObs.disconnect();
    window._dvResizeObs=new ResizeObserver(()=>{
      if(_dv._resizeTimer)clearTimeout(_dv._resizeTimer);
      _dv._resizeTimer=setTimeout(doResize,50);
    });
    window._dvResizeObs.observe(wrap);
    cv.onclick=(e)=>{
      if(_dv.animating)return;
      const rect=cv.getBoundingClientRect();
      const scaleX=cv.width/rect.width, scaleY=cv.height/rect.height;
      const mx=(e.clientX-rect.left)*scaleX;
      const my=(e.clientY-rect.top)*scaleY;
      const g=dv.grid;
      const lantern=dvLanternRadius();
      const playerKey=dvKey(g.playerCol,g.playerRow);
      let bestKey=null,bestD=48;
      for(const key of Object.keys(g.nodes)){
        if(key===playerKey)continue;
        const n=g.nodes[key];
        const dist=dvNodeDist(key);
        if(!n.visited&&dist>lantern+1.5)continue;
        const{x,y}=dvNodeXY(key);
        const d=Math.sqrt((x-mx)**2+(y-my)**2);
        if(d<bestD){bestD=d;bestKey=key;}
      }
      if(bestKey)dvSelectNode(bestKey);
    };
  },50);
}

function dvOpenInfo(){
  const html='<div style="background:rgba(0,20,40,.4);border:1px solid #224466;border-radius:6px;padding:14px 16px;font-size:13px;line-height:2;color:var(--txt-d)">'+
    'Под картами Атласа скрываются бесконечные подземные тоннели.<br>'+
    'Вы берёте вагонетку и спускаетесь в темноту — глубже, чем ходят обычные работники.<br>'+
    '<span style="color:#88ccff">Сульфит</span> — топливо, копится с карт. Чем глубже — тем дороже.&nbsp;'+
    '<span style="color:#88aaff">Азурит</span> — самоцветы для улучшений.<br>'+
    'Чем глубже — тем опаснее, но лучше <span style="color:var(--gold)">снаряжение</span> и больше <span style="color:var(--gold)">золота</span>.'+
  '</div>';
  openM('📋 Сведения',html);
}
function dvSetViewMode(vm){
  G.delve.viewMode=vm;
  renderDelve();
  save();
}

function dvToggleFullscreen(){
  const dv=G.delve;
  const big=(dv.viewMode==='big');
  dv.viewMode=big?'map':'big';
  // Растягиваем/сжимаем контейнер вкладки шахты
  const con=document.getElementById('ctab-content-delve');
  if(con)con.style.minHeight=big?'':'600px';
  renderDelve();
  save();
}

// ── DELVE UPGRADES ────────────────────────────────────────────────────────

function openDelveUpgrades(){
  const dv=G.delve;
  let html='<div style="display:flex;flex-direction:column;gap:8px">';
  for(const upg of DELVE_UPGRADES){
    const lvl=dv.upgrades[upg.id]||0;
    const maxed=lvl>=20;
    const nextCost=maxed?null:delveUpgradeCost(lvl+1);
    const canBuy=!maxed&&dv.azurite>=nextCost;
    html+='<div style="display:flex;align-items:center;gap:10px;background:rgba(0,0,0,.2);border:1px solid #334;border-radius:5px;padding:8px">'+
      '<span style="font-size:20px">'+upg.em+'</span>'+
      '<div style="flex:1">'+
        '<div style="font-size:13px;color:var(--txt-b);font-weight:600">'+upg.nm+' <span style="color:#88aaff">Ур.'+lvl+'/20</span></div>'+
        '<div style="font-size:11px;color:var(--txt-d)">'+upg.effect+'</div>'+
      '</div>'+
      (maxed
        ? '<span style="color:#88cc88;font-size:12px">МАКС</span>'
        : '<button class="btn btn-sm" '+(canBuy?'':'disabled style="opacity:.5"')+' onclick="buyDelveUpgrade(\''+upg.id+'\')">'+
            nextCost+'💎 Улучшить'+
          '</button>'
      )+
    '</div>';
  }
  html+='</div><div style="margin-top:8px;font-size:12px;color:var(--txt-d)">💎 Азурит: '+dv.azurite+'</div>';
  openM('⛏️ Улучшения шахты',html);
}

function buyDelveUpgrade(id){
  const dv=G.delve;
  const upg=DELVE_UPGRADES.find(u=>u.id===id);if(!upg)return;
  const lvl=dv.upgrades[id]||0;
  if(lvl>=20){showN('Улучшение уже максимальное!','red');return;}
  const cost=delveUpgradeCost(lvl+1);
  if(dv.azurite<cost){showN('Недостаточно Азурита!','red');return;}
  dv.azurite-=cost;
  dv.upgrades[id]=(lvl+1);
  if(id==='storage')dv.sulphiteCap=5000+(dv.upgrades.storage||0)*500;
  log('🔧 '+upg.nm+' улучшена до ур.'+(lvl+1),'info');
  showN(upg.nm+' ур.'+(lvl+1),'ge');
  save();
  openDelveUpgrades();
}

