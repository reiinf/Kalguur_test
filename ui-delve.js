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
  {id:'armor',  nm:'Броня вагонетки',    em:'🛡️', desc:'Повышает эффективность выживаемости в шахте',  effect:'+1% к выживаемости в шахте за уровень'},
  {id:'blast',  nm:'Подрыв породы',      em:'💥', desc:'Ослабляет породу, усиливая эффективность урона', effect:'+1% к урону в шахте за уровень'},
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
// dgr для тиров выше T16 — экспоненциальный рост ×1.12 за тир
function dgrForTier(t){
  if(t<=16)return MAP_TIERS[Math.max(0,t-1)].dgr;
  let dgr=725;
  for(let i=17;i<=t;i++)dgr=Math.round(dgr*1.12);
  return dgr;
}
// Стоимость одного спуска на глубину d
function delveCost(d){
  // Стоимость ≈ 2 карты соответствующего тира сложности
  const t=Math.max(1,Math.min(16,Math.ceil(d/10)));
  return 33+t*12;
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

const DV_COLS=19;      // колонок (шире экрана — влево/вправо)
const DV_ROWS_AHEAD=12; // рядов вперёд
const DV_CELL_W=70;    // ширина ячейки в пикселях
const DV_CELL_H=90;    // высота ячейки в пикселях
const DV_CELL=DV_CELL_W; // псевдоним для совместимости (не используется в координатах)
const DV_FILL=0.18;    // вероятность узла в ячейке
const DV_MAX_GAP=4;    // максимальный gap между узлами в ряду (колонок)

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
  return{col,row,type,biome,visited:false,jx:0,jy:0};
}

function dvHasEdge(grid,a,b){
  return grid.edges.some(([x,y])=>(x===a&&y===b)||(x===b&&y===a));
}

function dvAddEdge(grid,a,b){
  if(!dvHasEdge(grid,a,b))grid.edges.push([a,b]);
}

function dvGenChunk(grid,fromRow,toRow){
  // Полная переработка: генерируем весь чанк за один проход без привязки к движению игрока.
  // 4 магистрали, Z/L шаги, перемычки запланированы заранее, узлы только с 2+ соседями.

  const MAINS=[
    {center:1,  min:0,  max:3},
    {center:5,  min:3,  max:7},
    {center:9,  min:7,  max:11},
    {center:13, min:11, max:15},
    {center:17, min:15, max:18},
  ];
  const nRows=toRow-fromRow+1;

  // Восстанавливаем позиции магистралей из предыдущего чанка
  if(!grid._mainCols) grid._mainCols=MAINS.map(m=>m.center);
  const mainCols=[...grid._mainCols];

  // ── Шаг 1: строим траектории всех магистралей сразу ────────────────────
  // mainPaths[i][row] = col — позиция магистрали i на каждой строке
  const mainPaths=MAINS.map(()=>({}));

  for(let i=0;i<MAINS.length;i++){
    const m=MAINS[i];
    let col=mainCols[i]; // стартуем точно с позиции конца предыдущего чанка
    // Направление: меняем каждые 1-3 строки
    let dir=Math.random()<0.5?1:-1;
    let stepsLeft=1+Math.floor(Math.random()*2);
    for(let row=fromRow;row<=toRow;row++){
      mainPaths[i][row]=col; // сначала фиксируем текущую позицию
      stepsLeft--;
      if(stepsLeft<=0){
        const distToCenter=col-m.center;
        if(Math.abs(distToCenter)>=2) dir=-Math.sign(distToCenter);
        else dir=Math.random()<0.5?1:-1;
        stepsLeft=1+Math.floor(Math.random()*2);
      }
      // Шагаем для СЛЕДУЮЩЕЙ строки
      let next=col+dir;
      next=Math.max(m.min,Math.min(m.max,next));
      col=next;
    }
  }

  // Применяем минимальное расстояние 2 между соседними магистралями на каждой строке
  for(let row=fromRow;row<=toRow;row++){
    const cols=MAINS.map((_,i)=>mainPaths[i][row]);
    for(let i=1;i<MAINS.length;i++){if(cols[i]<=cols[i-1]+1)cols[i]=cols[i-1]+2;}
    for(let i=MAINS.length-2;i>=0;i--){if(cols[i]>=cols[i+1]-1)cols[i]=cols[i+1]-2;}
    for(let i=0;i<MAINS.length;i++){
      mainPaths[i][row]=Math.max(MAINS[i].min,Math.min(MAINS[i].max,cols[i]));
    }
  }

  // ── Шаг 2: планируем перемычки заранее ─────────────────────────────────
  // Каждая пара соседних магистралей: гарантированная перемычка каждые 3 строки.
  // Стартовые фазы разные — пары не синхронизированы.
  const BRIDGE_EVERY=4;
  const bridges=[];
  const pairPhase=[0, 2, 1, 0]; // фазы для 4 пар
  for(let i=0;i<4;i++){
    let row=fromRow+pairPhase[i];
    while(row<=toRow-1){ // toRow-1 гарантирует что rowB=row+1 <= toRow
      bridges.push({pair:i, rowA:row, rowMid:row, rowB:row+1});
      row+=BRIDGE_EVERY;
    }
  }

  // ── Шаг 3: создаём узлы магистралей и рёбра ────────────────────────────
  for(let i=0;i<MAINS.length;i++){
    for(let row=fromRow;row<=toRow;row++){
      const col=mainPaths[i][row];
      const k=dvKey(col,row);
      if(!grid.nodes[k]){
        const nd=dvGenNode(col,row);
        grid.nodes[k]={col,row,type:nd.type,biome:nd.biome,visited:false,jx:nd.jx,jy:nd.jy,_main:i};
      }
      // Ребро к предыдущей строке этой магистрали
      if(row>fromRow){
        const prevCol=mainPaths[i][row-1];
        const prevK=dvKey(prevCol,row-1);
        if(grid.nodes[prevK])dvAddEdge(grid,prevK,k);
      } else if(row===fromRow&&fromRow>1){
        // Связь с предыдущим чанком — ищем узел магистрали i в строке fromRow-1
        // _mainCols[i] == mainPaths[i][fromRow] (стартуем с той же позиции)
        const prevK=dvKey(mainCols[i],fromRow-1);
        if(grid.nodes[prevK])dvAddEdge(grid,prevK,k);
        else{
          // fallback: ищем любой узел этой магистрали в предыдущей строке
          for(let dc=-2;dc<=2;dc++){
            const fk=dvKey(mainCols[i]+dc,fromRow-1);
            if(grid.nodes[fk]){dvAddEdge(grid,fk,k);break;}
          }
        }
      }
    }
  }

  // Подключаем первый чанк к стартовому узлу — только центральная и две соседние магистрали
  if(fromRow===1&&grid.nodes[dvKey(9,0)]){
    for(let i=1;i<=3;i++){
      dvAddEdge(grid,dvKey(9,0),dvKey(mainPaths[i][1],1));
    }
    // Крайние магистрали (0 и 4) соединяем с соседними на строке 1
    const k0r1=dvKey(mainPaths[0][1],1);
    const k1r1=dvKey(mainPaths[1][1],1);
    const k3r1=dvKey(mainPaths[3][1],1);
    const k4r1=dvKey(mainPaths[4][1],1);
    if(grid.nodes[k0r1]&&grid.nodes[k1r1])dvAddEdge(grid,k0r1,k1r1);
    if(grid.nodes[k3r1]&&grid.nodes[k4r1])dvAddEdge(grid,k3r1,k4r1);
  }

  // ── Шаг 4: создаём Z-перемычки ─────────────────────────────────────────
  // ── Шаг 4: создаём Z-перемычки ─────────────────────────────────────────
  for(const br of bridges){
    const i=br.pair;
    const colA=mainPaths[i][br.rowA];
    const colB=mainPaths[i+1][br.rowB];
    const midCol=Math.round((colA+colB)/2);
    const midRow=br.rowMid;
    const kA=dvKey(colA,br.rowA);
    const kMid=dvKey(midCol,midRow);
    const kB=dvKey(colB,br.rowB);
    if(!grid.nodes[kMid]){
      const nd=dvGenNode(midCol,midRow);
      grid.nodes[kMid]={col:midCol,row:midRow,type:nd.type,biome:nd.biome,visited:false,jx:nd.jx,jy:nd.jy,_bridge:true};
    } else {
      grid.nodes[kMid]._bridge=true;
    }
    if(grid.nodes[kA])dvAddEdge(grid,kA,kMid);
    if(grid.nodes[kB])dvAddEdge(grid,kMid,kB);
  }

  // ── Шаг 5: случайные узлы в пустотах ──────────────────────────────────
  // Запрещённые клетки — пути тоннелей (магистральные L и горизонтали перемычек)
  const _tunnelCells=new Set();
  // Магистральные L-пути
  for(let i=0;i<MAINS.length;i++){
    for(let row=fromRow;row<=toRow;row++){
      if(row===fromRow)continue;
      const col=mainPaths[i][row];
      const prevCol=mainPaths[i][row-1];
      if(col===prevCol)continue;
      const minC=Math.min(col,prevCol), maxC=Math.max(col,prevCol);
      for(let c=minC+1;c<maxC;c++) _tunnelCells.add(dvKey(c,row-1));
    }
  }
  // Горизонтальные пути перемычек — чтобы rand не генерился на линии тоннеля
  for(const br of bridges){
    const i=br.pair;
    const colA=mainPaths[i][br.rowA];
    const colB=mainPaths[i+1][br.rowB];
    const midCol=Math.round((colA+colB)/2);
    // kA→kMid горизонталь на rowA
    const minC1=Math.min(colA,midCol), maxC1=Math.max(colA,midCol);
    for(let c=minC1+1;c<maxC1;c++) _tunnelCells.add(dvKey(c,br.rowA));
    // kMid→kB горизонталь на rowB (L-рендер Mid→B рисует горизонталь на rowMid)
    const minC2=Math.min(midCol,colB), maxC2=Math.max(midCol,colB);
    for(let c=minC2+1;c<maxC2;c++) _tunnelCells.add(dvKey(c,br.rowMid));
  }
  for(let row=fromRow;row<=toRow;row++){
    for(let col=0;col<DV_COLS;col++){
      const k=dvKey(col,row);
      if(grid.nodes[k])continue;
      if(_tunnelCells.has(k))continue;
      if(Math.random()>0.08)continue;
      const above=[],below=[],left=[],right=[];
      for(let dr=-1;dr<=1;dr++){
        for(let dc=-3;dc<=3;dc++){
          if(dr===0&&dc===0)continue;
          const ck=dvKey(col+dc,row+dr);
          if(!grid.nodes[ck])continue;
          if(dr<0)above.push(ck);
          else if(dr>0)below.push(ck);
          else if(dc<0)left.push(ck);
          else right.push(ck);
        }
      }
      const sidesWithNeighbors=[above,below,left,right].filter(s=>s.length>0);
      if(sidesWithNeighbors.length<2)continue;
      const nd=dvGenNode(col,row);
      grid.nodes[k]={col,row,type:nd.type,biome:nd.biome,visited:false,jx:nd.jx,jy:nd.jy,_rand:true};
      const byDist=(arr)=>arr.sort((a,b)=>{
        const na=grid.nodes[a],nb=grid.nodes[b];
        return (Math.abs(na.col-col)+Math.abs(na.row-row))-(Math.abs(nb.col-col)+Math.abs(nb.row-row));
      });
      // Горизонтальные соседи (та же строка) — всегда подключаем
      // Если rand визуально между двумя узлами — ребро обязано быть
      const picked=new Set();
      if(left.length>0) picked.add(byDist(left)[0]);
      if(right.length>0) picked.add(byDist(right)[0]);
      // Вертикальный — если горизонтальных меньше двух
      if(picked.size<2){
        const vert=[...above,...below];
        if(vert.length>0) picked.add(byDist(vert)[0]);
      }
      for(const sk of picked)dvAddEdge(grid,k,sk);
    }
  }

  // ── Шаг 6: BFS-страховка ───────────────────────────────────────────────
  // Находим главный компонент (от посещённого или первого узла).
  // Маленькие изолированные острова (≤3 узла) удаляем — они создают дыры.
  // Большие острова (>3) подключаем к ближайшему узлу главного компонента.
  const allKeys=Object.keys(grid.nodes);
  const root=allKeys.find(k=>grid.nodes[k].visited)||allKeys[0];
  const vis=new Set([root]);const bfsQ=[root];
  while(bfsQ.length){const cur=bfsQ.shift();for(const[a,b] of grid.edges){if(a===cur&&!vis.has(b)){vis.add(b);bfsQ.push(b);}else if(b===cur&&!vis.has(a)){vis.add(a);bfsQ.push(a);}}}
  // Находим все изолированные компоненты
  const isolated=allKeys.filter(k=>!vis.has(k));
  const compVisited=new Set();
  for(const startKey of isolated){
    if(compVisited.has(startKey))continue;
    // BFS внутри изолированного компонента
    const comp=[startKey];compVisited.add(startKey);const q=[startKey];
    while(q.length){const cur=q.shift();for(const[a,b] of grid.edges){if(a===cur&&!compVisited.has(b)&&!vis.has(b)){compVisited.add(b);comp.push(b);q.push(b);}else if(b===cur&&!compVisited.has(a)&&!vis.has(a)){compVisited.add(a);comp.push(a);q.push(a);}}}
    if(comp.length<=3){
      // Маленький остров — удаляем узлы и рёбра
      for(const k of comp)delete grid.nodes[k];
      grid.edges=grid.edges.filter(([a,b])=>grid.nodes[a]&&grid.nodes[b]);
    }else{
      // Большой остров — подключаем к главному компоненту
      let bestKey=null,bestVk=null,bestDist=9999;
      for(const k of comp){const n=grid.nodes[k];for(const vk of vis){const vn=grid.nodes[vk];const d=Math.abs(vn.col-n.col)+Math.abs(vn.row-n.row);if(d<bestDist){bestDist=d;bestKey=k;bestVk=vk;}}}
      if(bestKey&&bestVk){dvAddEdge(grid,bestKey,bestVk);for(const k of comp)vis.add(k);}
    }
  }

  // Сохраняем финальные позиции магистралей для следующего чанка
  grid._mainCols=MAINS.map((_,i)=>mainPaths[i][toRow]);
  grid.generatedRows=toRow+1;
}


function dvEnsureGenerated(){
  const g=G.delve.grid;
  const needed=g.playerRow+DV_ROWS_AHEAD;
  // Генерируем фиксированными чанками по DV_ROWS_AHEAD строк — чтобы перемычки всегда помещались
  while(g.generatedRows<=needed){
    dvGenChunk(g,g.generatedRows,g.generatedRows+DV_ROWS_AHEAD-1);
  }
}

function dvInitGrid(){
  const dv=G.delve;
  dv.grid={
    nodes:{},edges:[],
    playerCol:9,playerRow:0,
    cameraRow:0,cameraCol:9,
    minRowVisible:0,
    generatedRows:1,selectedKey:null,
    _genVer:'378h'
  };
  dv.grid.nodes[dvKey(9,0)]={col:9,row:0,type:'standard',biome:'stone',visited:true,jx:0,jy:0};
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
  return 1.4 + lvl * 0.18; // 0lvl=1.4, 20lvl=5.0 клеток
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
  const camRow=g.cameraRow||0;
  const camCol=g.cameraCol!==undefined?g.cameraCol:6;
  const jx=n.jx||0, jy=n.jy||0;
  return{
    x: W/2+(n.col-camCol)*DV_CELL_W+jx,
    y: H*0.12+(n.row-camRow+0.5)*DV_CELL_H+jy
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
  ctx.strokeStyle='#2a2318';
  ctx.lineWidth=16;
  ctx.lineCap='round';
  ctx.lineJoin='round';
  _dvTunnelLPath(ctx,x1,y1,x2,y2);
  ctx.stroke();
}

function _dvDrawLine(ctx,x1,y1,x2,y2,highlighted,na,nb){
  if(highlighted){
    // Пунктир к выбранному узлу пока стоим
    ctx.strokeStyle='#b88820';
    ctx.lineWidth=2;
    ctx.lineCap='round';
    ctx.lineJoin='round';
    ctx.setLineDash([6,7]);
    _dvTunnelLPath(ctx,x1,y1,x2,y2);
    ctx.stroke();
    ctx.setLineDash([]);
  } else {
    ctx.strokeStyle='#c8a040';
    ctx.lineWidth=2;
    ctx.lineCap='round';
    ctx.lineJoin='round';
    _dvTunnelLPath(ctx,x1,y1,x2,y2);
    ctx.stroke();
  }
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

  // Фон: почти чёрный + SVG-шум
  ctx.fillStyle='#050403';
  ctx.fillRect(0,0,W,H);
  if(!dvRender._noisePat){
    const offW=300,offH=300;
    const off=document.createElement('canvas');off.width=offW;off.height=offH;
    const octx=off.getContext('2d');
    // Рисуем шум через SVG feTurbulence
    const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${offW}" height="${offH}"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="4" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter><rect width="${offW}" height="${offH}" filter="url(#n)" opacity="0.05"/></svg>`;
    const img=new Image();
    img.src='data:image/svg+xml,'+encodeURIComponent(svg);
    img.onload=()=>{octx.drawImage(img,0,0);dvRender._noisePat=ctx.createPattern(off,'repeat');dvRender();};
  } else {
    ctx.fillStyle=dvRender._noisePat;
    ctx.fillRect(0,0,W,H);
  }

  const lantern=dvLanternRadius();
  const cell=dvCellSize();
  const playerKey=dvKey(g.playerCol,g.playerRow);
  const ppx=_dv.animating?_dv.curX:dvNodeXY(playerKey).x;
  const ppy=_dv.animating?_dv.curY:dvNodeXY(playerKey).y;

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
    const aVisited=na.visited;
    const bVisited=nb.visited;
    const aIsPlayer=(ak===playerKey);
    const bIsPlayer=(bk===playerKey);
    // Во время анимации ребро игрок→цель не красим золотом
    const isAnimEdge=_dv.animating&&g.selectedKey&&(
      (aIsPlayer&&bk===g.selectedKey)||(bIsPlayer&&ak===g.selectedKey)
    );
    const goldLine=!isAnimEdge&&(
      (aVisited&&bVisited)||((aVisited&&bIsPlayer)||(bVisited&&aIsPlayer))
    );
    const highlighted=!!(g.selectedKey&&(
      (ak===playerKey&&bk===g.selectedKey)||
      (bk===playerKey&&ak===g.selectedKey)
    ));
    visEdges.push({pa,pb,ak,bk,goldLine,na,nb});
  }

  // Проход 1: серые стены (все рёбра)
  for(const{pa,pb,na,nb} of visEdges){
    _dvDrawWall(ctx,pa.x,pa.y,pb.x,pb.y,na,nb);
  }
  // Во время анимации — серая стена тянется по L-пути до текущей позиции ГГ
  if(_dv.animating&&_dv.points&&_dv.points.length>1){
    ctx.strokeStyle='#2a2318';
    ctx.lineWidth=16;
    ctx.lineCap='round';
    ctx.lineJoin='round';
    ctx.beginPath();
    ctx.moveTo(_dv.points[0].x,_dv.points[0].y);
    for(let i=1;i<_dv.points.length;i++){
      if(i<=_dv.ptIdx){ctx.lineTo(_dv.points[i].x,_dv.points[i].y);}
      else if(i===_dv.ptIdx+1){ctx.lineTo(ppx,ppy);break;}
      else break;
    }
    ctx.stroke();
  }
  // Проход 2: золотые линии только на пройденном пути
  for(const{pa,pb,goldLine,na,nb} of visEdges){
    if(!goldLine)continue;
    _dvDrawLine(ctx,pa.x,pa.y,pb.x,pb.y,false,na,nb);
  }
  // Проход 3: пунктир и анимационная линия рисуются после объявления ppx/ppy

  // Узлы (все кроме question — они рисуются после тумана)
  for(const key of Object.keys(nodeStates)){
    if(nodeStates[key]==='question')continue;
    const n=g.nodes[key];
    const{x,y}=dvNodeXY(key);
    dvDrawNodePOE(ctx,x,y,n,nodeStates[key],cell);
  }

  // Пунктир отключён (палит bridge/rand костыли)
  // if(!_dv.animating&&g.selectedKey&&g.nodes[g.selectedKey]&&dvIsReachable(g.selectedKey)){
  //   ...
  // }

  // Во время анимации — золотая линия по L-пути до текущей позиции ГГ
  if(_dv.animating&&_dv.points&&_dv.points.length>1){
    ctx.strokeStyle='#c8a040';
    ctx.lineWidth=2;
    ctx.lineCap='round';
    ctx.lineJoin='round';
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(_dv.points[0].x,_dv.points[0].y);
    for(let i=1;i<_dv.points.length;i++){
      if(i<=_dv.ptIdx){ctx.lineTo(_dv.points[i].x,_dv.points[i].y);}
      else if(i===_dv.ptIdx+1){ctx.lineTo(ppx,ppy);break;}
      else break;
    }
    ctx.stroke();
  }

  const pNode=g.nodes[playerKey]||{col:g.playerCol,row:g.playerRow,type:'standard',biome:'stone'};

  // Виньетка
  const vig=ctx.createRadialGradient(W/2,H/2,H*0.3,W/2,H/2,H*0.85);
  vig.addColorStop(0,'rgba(0,0,0,0)');
  vig.addColorStop(1,'rgba(0,0,0,0.72)');
  ctx.fillStyle=vig;
  ctx.fillRect(0,0,W,H);

  // Туман войны
  const lvl=G.delve.upgrades.lantern||0;
  const fogInner=60+lvl*12;
  const fogOuter=110+lvl*18;
  const fog=ctx.createRadialGradient(ppx,ppy,fogInner,ppx,ppy,fogOuter);
  fog.addColorStop(0,'rgba(0,0,0,0)');
  fog.addColorStop(1,'rgba(0,0,0,0.96)');
  ctx.fillStyle=fog;
  ctx.fillRect(0,0,W,H);

  // Question-узлы поверх тумана — приглушённо
  ctx.globalAlpha=0.55;
  for(const key of Object.keys(nodeStates)){
    if(nodeStates[key]!=='question')continue;
    const n=g.nodes[key];
    const{x,y}=dvNodeXY(key);
    dvDrawNodePOE(ctx,x,y,n,'question',cell);
  }
  ctx.globalAlpha=1;

  // Посещённые пути поверх тумана — фонарики на стенках
  for(const{pa,pb,goldLine,na,nb} of visEdges){
    const bothVisited=na.visited&&nb.visited;
    const oneVisitedOnePlayer=(na.visited&&nb===g.nodes[playerKey])||(nb.visited&&na===g.nodes[playerKey]);
    if(!bothVisited&&!oneVisitedOnePlayer)continue;
    // Стена — заметно темнее активных тоннелей
    ctx.globalAlpha=0.45;
    _dvDrawWall(ctx,pa.x,pa.y,pb.x,pb.y,na,nb);
    // Золотая линия — приглушённый тёплый цвет, как старый факел
    if(goldLine){
      ctx.globalAlpha=0.7;
      ctx.strokeStyle='#6a4e14';
      ctx.lineWidth=2;
      ctx.lineCap='round';
      ctx.lineJoin='round';
      ctx.shadowColor='#a06808';
      ctx.shadowBlur=3;
      _dvTunnelLPath(ctx,pa.x,pa.y,pb.x,pb.y);
      ctx.stroke();
      ctx.shadowBlur=0;
    }
  }
  ctx.globalAlpha=0.55;
  for(const key of Object.keys(nodeStates)){
    if(nodeStates[key]!=='visited')continue;
    const n=g.nodes[key];
    const{x,y}=dvNodeXY(key);
    dvDrawNodePOE(ctx,x,y,n,'visited',cell);
  }
  ctx.globalAlpha=1;

  // ГГ — самый верхний слой, поверх visited
  const glowGrad=ctx.createRadialGradient(ppx,ppy,0,ppx,ppy,52);
  glowGrad.addColorStop(0,'rgba(255,140,0,0.18)');
  glowGrad.addColorStop(1,'rgba(255,140,0,0)');
  ctx.fillStyle=glowGrad;
  ctx.beginPath();ctx.arc(ppx,ppy,52,0,Math.PI*2);ctx.fill();
  dvDrawNodePOE(ctx,ppx,ppy,pNode,'player',cell);

  // Метка глубины — поверх всего
  ctx.fillStyle='rgba(0,0,0,0.5)';
  ctx.fillRect(0,0,W,22);
  ctx.fillStyle='#8870cc';
  ctx.font='bold 14px monospace';
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
  const cost=sel?delveCost(dv.depth+rowDiff*3+colDiff*3):delveCost(dv.depth+3);
  const inDark=sel&&dvNodeDist(g.selectedKey)>dvLanternRadius();
  const effTier=Math.max(1,Math.ceil((dv.depth+rowDiff*3)/10))+(inDark?2:0);
  const _effDmg=sDmg()*(1+(dv.upgrades.blast||0)*0.01);
  const _effSurv=sSurv()*(1+(dv.upgrades.armor||0)*0.01);
  const ch=Math.max(0.03,Math.min(0.97,calcCh(_effDmg+_effSurv,16,dgrForTier(effTier))));
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

// Проверка достижимости узла от текущей позиции игрока
function dvIsReachable(targetKey){
  const g=G.delve.grid;
  const playerKey=dvKey(g.playerCol,g.playerRow);
  const playerNode=g.nodes[playerKey];
  const targetNode=g.nodes[targetKey];
  if(!targetNode)return false;
  const neighbors=dvGetNeighbors(playerKey);
  const neighborKeys=new Set(neighbors.map(n=>dvKey(n.col,n.row)));
  const isNeighbor=neighborKeys.has(targetKey);
  if(isNeighbor)return true;
  const targetNeighborKeys=new Set(dvGetNeighbors(targetKey).map(n=>dvKey(n.col,n.row)));
  const hasCommonNeighbor=[...neighborKeys].some(k=>targetNeighborKeys.has(k));
  const targetIsBridge=!!(targetNode._bridge)&&hasCommonNeighbor;
  const playerIsBridge=!!(playerNode&&playerNode._bridge)&&hasCommonNeighbor;
  const targetIsRand=!!(targetNode._rand)&&hasCommonNeighbor;
  const playerIsRand=!!(playerNode&&playerNode._rand)&&hasCommonNeighbor;
  return targetIsBridge||playerIsBridge||targetIsRand||playerIsRand;
}

function dvGo(){
  if(_dv.animating)return;
  if(_dv.camTarget!==null||_dv.camColTarget!==null)return; // камера ещё едет после телепорта
  const dv=G.delve;
  const g=dv.grid;
  if(!g.selectedKey){showN('Выберите узел на карте!');return;}
  const target=g.nodes[g.selectedKey];
  if(!target){showN('Узел не найден!','red');return;}

  // Только по рёбрам — прямые соседи или через узел-перемычку (_bridge)
  const playerKey=dvKey(g.playerCol,g.playerRow);
  const playerNode=g.nodes[playerKey];
  const neighbors=dvGetNeighbors(playerKey);
  const isNeighbor=neighbors.some(n=>dvKey(n.col,n.row)===g.selectedKey);
  const targetNode=g.nodes[g.selectedKey];
  // Общая функция: есть ли узел X соединённый рёбрами и с игроком и с целью
  const neighborKeys=new Set(neighbors.map(n=>dvKey(n.col,n.row)));
  const targetNeighborKeys=new Set(dvGetNeighbors(g.selectedKey).map(n=>dvKey(n.col,n.row)));
  const hasCommonNeighbor=[...neighborKeys].some(k=>targetNeighborKeys.has(k));

  // Случай 1: цель является bridge, есть общий сосед по рёбрам
  const targetIsBridge=!isNeighbor&&!!(targetNode&&targetNode._bridge)&&hasCommonNeighbor;
  // Случай 2: игрок стоит на bridge, есть общий сосед по рёбрам
  const playerIsBridge=!isNeighbor&&!!(playerNode&&playerNode._bridge)&&hasCommonNeighbor;
  // Случай 3: цель является rand, есть общий сосед по рёбрам
  const targetIsRand=!isNeighbor&&!!(targetNode&&targetNode._rand)&&hasCommonNeighbor;
  // Случай 4: игрок стоит на rand, есть общий сосед по рёбрам
  const playerIsRand=!isNeighbor&&!!(playerNode&&playerNode._rand)&&hasCommonNeighbor;
  const isBridgeJump=targetIsBridge||playerIsBridge||targetIsRand||playerIsRand;
  if(!isNeighbor&&!isBridgeJump){showN('Можно ехать только в соседние узлы!');return;}

  const rowDiff=Math.max(0,target.row-g.playerRow);
  const colDiff=Math.abs(target.col-g.playerCol);
  const cost=delveCost(dv.depth+rowDiff*3+colDiff*3);
  if(dv.sulphite<cost){showN('Недостаточно Сульфита! Нужно '+cost,'red');return;}

  dv.sulphite-=cost;
  dv.running=true;
  const inDarkFinal=dvNodeDist(g.selectedKey)>dvLanternRadius();

  log('⛏️ Спуск ['+(inDarkFinal?'⚠ тьма':'')+(DELVE_LOCATIONS.find(l=>l.id===target.type)||{nm:''}).nm+'] гл.'+(target.row*3),'info');

  const wasVisited=target.visited;
  const fromKey=dvKey(g.playerCol,g.playerRow);
  const fromCol=g.playerCol,fromRow=g.playerRow;
  const toKey=g.selectedKey;

  dvStartAnim(target.col,target.row,()=>{
    g.playerCol=target.col;
    g.playerRow=target.row;
    // visited помечается только при успехе внутри resolveDelveRunGrid
    // При bridge/rand прыжке прямого ребра нет — добавляем его чтобы goldLine работала
    if(isBridgeJump) dvAddEdge(g,fromKey,toKey);
    g.selectedKey=null;
    dv.depth=Math.max(dv.depth,target.row*3);
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

    if(!wasVisited)resolveDelveRunGrid(target,inDarkFinal,fromCol,fromRow);
    dvUpdateInfoBar();
    dvRender();
    save();
  });

  dvUpdateInfoBar();
}

function dvDeathEffect(){
  const wrap=document.getElementById('delve-canvas-wrap');
  if(!wrap)return;
  wrap.style.transition='transform 0.05s';
  const steps=['-7px','6px','-5px','4px','-3px','2px','0px'];
  let i=0;
  const shake=()=>{if(i>=steps.length){wrap.style.transform='';return;}
    wrap.style.transform='translateX('+steps[i++]+')';
    setTimeout(shake,55);};
  shake();
}

function dvFlashResult(lines){
  const el=document.getElementById('delve-result-flash');
  if(!el)return;
  el.innerHTML=lines.join('<br>');
  el.style.opacity='1';
  clearTimeout(el._fadeTimer);
  el._fadeTimer=setTimeout(()=>{el.style.opacity='0';},3000);
}

function resolveDelveRunGrid(node,inDark,fromCol,fromRow){
  const dv=G.delve;
  const depth=dv.depth;
  const loc=DELVE_LOCATIONS.find(l=>l.id===node.type)||DELVE_LOCATIONS[0];
  const m=loc.mods||{};

  const effTier=Math.max(1,Math.ceil(depth/10))+(inDark?2:0);
  const _effDmg=sDmg()*(1+(dv.upgrades.blast||0)*0.01);
  const _effSurv=sSurv()*(1+(dv.upgrades.armor||0)*0.01);
  const ch=Math.max(0.03,Math.min(0.97,calcCh(_effDmg+_effSurv,16,dgrForTier(effTier))));

  if(Math.random()>ch){
    log('💀 Погибли в шахте на глубине '+depth+'!','ev');
    floatT('💀 шахта','#ff4444');
    dvFlashResult(['<span style="color:#ff4444">💀 Погибли на глубине '+depth+'</span>']);
    if(fromCol!==undefined){const g=G.delve.grid;g.playerCol=fromCol;g.playerRow=fromRow;dv.depth=Math.max(0,(fromRow-1)*3);_dv.camTarget=fromRow;_dv.camColTarget=fromCol;if(!_dv._raf)_dv._raf=requestAnimationFrame(_dvAnimFrame);}
    dvDeathEffect();
    dvRender();
    return;
  }

  node.visited=true;
  const msgs=[];let gotSomething=false;

  if(Math.random()<0.35*(m.item||1)){
    const itmTier=16+Math.floor(Math.max(0,depth-160)/50);
    const it=genItem(itmTier,G.selfCls||'warrior');
    if((hasFaction('maraketh')||hasLegacyBonus('mara_3'))&&G.factionUnlocks.autoSellItems&&G.autoSellRules&&G.autoSellRules[it.quality]&&it.quality!=='unique'){
      const gold=parseInt(it.sellPrice)||0;G.gold+=gold;G.stats.sg+=gold;G.stats.sold++;
      checkContractSell(it.quality,gold);
      log('💸 Авто-продажа [шахта]: '+it.em+' '+it.name+' +'+gold+gi(16),'ge');updateRes();
    }else{
      G.inv.push(it);G.stats.fi++;
      checkContractFind(it.quality);
      msgs.push(it.em+' <span style="color:'+qcolLog(it.quality)+'">'+it.name+'</span>');
      gotSomething=true;
    }
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
  addXPSelf(xpAmt(Math.max(1,Math.ceil(depth/10))));
  // Ачивки за шахту — только при реальном прохождении узла
  grantAch('delve_enter');
  if(dv.depth>=100)grantAch('delve_d100');
  if(dv.depth>=160)grantAch('delve_d160');
  updateRes();checkAchs();
  // Флэш наград поверх canvas
  const flashLines=['<span style="color:#c8a040">⛏ Гл.'+depth+'</span> <span style="color:#888">'+loc.nm+'</span>'].concat(msgs);
  dvFlashResult(flashLines);
}

// ── DELVE RENDER ──────────────────────────────────────────────────────────

function renderDelve(){
  const el=document.getElementById('delve-area');if(!el)return;
  const dv=G.delve;

  if(!dv.grid||Object.keys(dv.grid.nodes).length===0){
    if(dv.depth>0)dvRegenGrid(true); else dvInitGrid();
  }
  dvEnsureGenerated();

  // Режим: 'info'=сведения, 'map'=шахта стандарт, 'big'=большой без шапки
  if(!dv.viewMode)dv.viewMode='map';
  const vm=dv.viewMode;

  const isBig=(vm==='big');
  const modeBar=
    '<div style="display:flex;gap:4px;margin-bottom:6px;align-items:center">'+
      '<button class="btn btn-sm" onclick="dvOpenInfo()" style="font-size:11px;padding:5px 10px">📋 Сведения</button>'+
      '<button class="tab-btn'+((vm==='map'||vm==='big')?' active':'')+'" onclick="dvSetViewMode(\'map\')" style="font-size:11px;padding:5px 10px">⛏️ Шахта</button>'+
      '<button class="btn btn-sm btn-p" onclick="openDelveUpgrades()" style="font-size:11px;padding:5px 10px">🔧 Улучшения</button>'+
      '<button class="btn btn-sm" onclick="dvEvacuate()" style="font-size:11px;padding:5px 10px;margin-left:auto">Эвакуация (200'+gi(16)+')</button>'+
      '<button class="tab-btn" onclick="dvToggleFullscreen()" style="font-size:11px;padding:5px 10px">'+(isBig?'⊟ Меньше экран':'⊞ Больше экран')+'</button>'+
    '</div>';

  const infoBarHtml='<div id="delve-info-bar" style="display:flex;flex-wrap:wrap;gap:8px;align-items:center;background:rgba(0,0,0,.3);border:1px solid var(--brd);border-radius:4px;padding:5px 10px;font-size:15px;margin-bottom:6px;min-height:30px"></div>';
  let body='';
  {
    // map или big — карта. В 'big' канвас высокий (600px min-height на контейнере)
    const canvasMinH=vm==='big'?'560px':'260px';
    const canvasHtmlLocal=
      '<div id="delve-canvas-wrap" style="flex:1;position:relative;background:#070504;border:1px solid #334;border-radius:4px;min-height:'+canvasMinH+';overflow:hidden">'+
        '<canvas id="delve-canvas" style="display:block;width:100%;height:100%"></canvas>'+
        '<div style="position:absolute;bottom:0;left:0;right:0;background:linear-gradient(transparent,rgba(0,0,0,0.7))">'+
          '<div id="delve-result-flash" style="text-align:center;font-size:14px;padding:4px 10px 2px;min-height:0;width:fit-content;margin:0 auto;opacity:0;transition:opacity 0.3s;background:rgba(8,5,2,0.70);border:1px solid rgba(120,90,40,0.4);border-radius:4px"></div>'+
          '<div style="padding:6px;display:flex;justify-content:center;align-items:center;gap:10px">'+
            '<div id="delve-go-info" style="font-size:15px"></div>'+
            '<button id="delve-go-btn" class="btn btn-p" onclick="dvGo()" disabled style="opacity:.4;font-size:15px;padding:4px 20px">⛏️ ВПЕРЁД</button>'+
          '</div>'+
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

function dvRegenGrid(skipRender=false){
  const dv=G.delve;
  const savedDepth=dv.depth||0;
  // Сбрасываем состояние анимации перед пересозданием
  _dv.animating=false;
  _dv.camTarget=null;
  _dv.camColTarget=null;
  if(_dv._raf){cancelAnimationFrame(_dv._raf);_dv._raf=null;}
  // dvInitGrid генерирует строки 0..DV_ROWS_AHEAD
  // Сразу ставим игрока и камеру на нужную глубину ДО генерации
  if(savedDepth>0){
    const targetRow=Math.ceil(savedDepth/3);
    // Создаём чистую сетку сразу с правильными параметрами
    dv.grid={
      nodes:{},edges:[],
      playerCol:9,playerRow:targetRow,
      cameraRow:targetRow,cameraCol:9,
      minRowVisible:Math.max(0,targetRow-2),
      generatedRows:targetRow,selectedKey:null,
      _genVer:'378h',_mainCols:null
    };
    const g=dv.grid;
    dv.depth=targetRow*3;
    dvGenChunk(g,targetRow,targetRow+DV_ROWS_AHEAD);
    // Ставим игрока на реальный узел
    let placed=false;
    for(let dr=0;dr<=3&&!placed;dr++){
      for(let dc=0;dc<=4&&!placed;dc++){
        for(const col of [9,9+dc,9-dc]){
          const k=col+'_'+(targetRow+dr);
          if(g.nodes[k]){g.playerCol=g.nodes[k].col;g.playerRow=g.nodes[k].row;g.nodes[k].visited=true;placed=true;break;}
        }
      }
    }
    dv.depth=g.playerRow*3;
    g.cameraRow=g.playerRow;g.cameraCol=g.playerCol;
    dvEnsureGenerated();
  } else {
    dvInitGrid();
  }
  if(!skipRender){renderDelve();}
  save();
  log('🔄 Шахта пересоздана','info');
  if(!skipRender){showN('Шахта пересоздана','ge');}
}

function dvEvacuate(){
  const COST=200;
  if(G.gold<COST){showN('Недостаточно золота! Нужно '+COST+gi(16),'red');return;}
  if(_dv.animating){showN('Подождите окончания движения','red');return;}
  G.gold-=COST;
  const g=G.delve.grid;
  const centerCol=Math.round(DV_COLS/2);
  let bestKey=null,bestDist=9999;
  for(const key of Object.keys(g.nodes)){
    const n=g.nodes[key];
    if(Math.abs(n.row-g.playerRow)>2)continue;
    const d=Math.abs(n.col-centerCol)+Math.abs(n.row-g.playerRow)*2;
    if(d<bestDist){bestDist=d;bestKey=key;}
  }
  if(bestKey&&bestKey!==dvKey(g.playerCol,g.playerRow)){
    const n=g.nodes[bestKey];
    g.playerCol=n.col;g.playerRow=n.row;
    g.cameraCol=n.col;g.cameraRow=n.row;
    _dv.camTarget=n.row;_dv.camColTarget=n.col;
  }
  g.selectedKey=null;
  if(!_dv._raf)_dv._raf=requestAnimationFrame(_dvAnimFrame);
  updateRes();dvRender();dvUpdateInfoBar();
  log('Эвакуация! -'+COST+gi(16),'ev');
  showN('Эвакуирован на центр','ge');
}

function dvOpenInfo(){
  const sep='<div style="border-top:1px solid #1a2a3a;margin:8px 0"></div>';
  const html='<div style="background:rgba(0,20,40,.4);border:1px solid #224466;border-radius:6px;padding:14px 16px;font-size:13px;line-height:1.7;color:var(--txt-d)">'+
    '<div>Под картами Атласа скрываются бесконечные подземные тоннели.<br>Вы берёте вагонетку и спускаетесь в темноту — глубже, чем ходят обычные работники.</div>'+
    sep+
    '<div><span style="color:#88ccff">Сульфит</span> — топливо для спуска. Копится с карт, а чем глубже спуск — тем его больше расходуется.</div>'+
    '<div style="margin-top:4px"><span style="color:#88aaff">Азурит</span> — самоцветы для улучшений вагонетки.</div>'+
    sep+
    '<div>Чем глубже — тем опаснее, но лучше <span style="color:var(--gold)">снаряжение</span> и больше <span style="color:var(--gold)">золота</span>.</div>'+
    sep+
    '<div>Иногда в тоннелях встречается рыхлая порода — её можно прокопать и проложить новый путь.</div>'+
    sep+
    '<div style="color:#886688">Боссы шахты пока не реализованы.</div>'+
    sep+
    '<div style="display:flex;align-items:center;gap:10px"><button class="btn btn-sm" onclick="closeM();dvRegenGrid()" style="background:#2a1a00;border-color:#554400">🔄 Пересоздать шахту</button><span style="color:#666;font-size:12px">для совсем безвыходных ситуаций</span></div>'+
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
  dvRender();
  openDelveUpgrades();
}