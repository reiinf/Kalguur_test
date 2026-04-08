// ui-shop.js — лавка
// Зависимости: mechanics.js, utils.js

function renderShop(){
  // Map cards — T1 first, then unlocked tiers grow upward
  const mapItems=[
    {id:'s1', nm:'Карта T1 ×3',cost:15,  mt:0, isMap:true,fn:()=>{G.maps[1]=(G.maps[1]||0)+3;}},
    {id:'s2', nm:'Карта T2 ×2',cost:35,  mt:0, isMap:true,fn:()=>{G.maps[2]=(G.maps[2]||0)+2;}},
    {id:'s3', nm:'Карта T3 ×2',cost:65,  mt:1, isMap:true,fn:()=>{G.maps[3]=(G.maps[3]||0)+2;}},
    {id:'s4', nm:'Карта T4',   cost:100, mt:2, isMap:true,fn:()=>{G.maps[4]=(G.maps[4]||0)+1;}},
    {id:'s5', nm:'Карта T5',   cost:140, mt:3, isMap:true,fn:()=>{G.maps[5]=(G.maps[5]||0)+1;}},
    {id:'s6', nm:'Карта T6',   cost:185, mt:4, isMap:true,fn:()=>{G.maps[6]=(G.maps[6]||0)+1;}},
    {id:'s7', nm:'Карта T7',   cost:240, mt:5, isMap:true,fn:()=>{G.maps[7]=(G.maps[7]||0)+1;}},
    {id:'s8', nm:'Карта T8',   cost:310, mt:6, isMap:true,fn:()=>{G.maps[8]=(G.maps[8]||0)+1;}},
    {id:'s9', nm:'Карта T9',   cost:400, mt:7, isMap:true,fn:()=>{G.maps[9]=(G.maps[9]||0)+1;}},
    {id:'s10',nm:'Карта T10',  cost:510, mt:8, isMap:true,fn:()=>{G.maps[10]=(G.maps[10]||0)+1;}},
    {id:'s11',nm:'Карта T11',  cost:640, mt:9, isMap:true,fn:()=>{G.maps[11]=(G.maps[11]||0)+1;}},
    {id:'s12',nm:'Карта T12',  cost:800, mt:10,isMap:true,fn:()=>{G.maps[12]=(G.maps[12]||0)+1;}},
    {id:'s13',nm:'Карта T13',  cost:990, mt:11,isMap:true,fn:()=>{G.maps[13]=(G.maps[13]||0)+1;}},
    {id:'s14',nm:'Карта T14',  cost:1220,mt:12,isMap:true,fn:()=>{G.maps[14]=(G.maps[14]||0)+1;}},
    {id:'s15',nm:'Карта T15',  cost:1500,mt:13,isMap:true,fn:()=>{G.maps[15]=(G.maps[15]||0)+1;}},
    {id:'s16',nm:'Карта T16',  cost:1850,mt:14,isMap:true,fn:()=>{G.maps[16]=(G.maps[16]||0)+1;}},
  ];
  // Use cleared tiers for unlock (not maxTier which starts at 2)
  const _clearedKeys=Object.keys(G.cleared||{}).map(Number).filter(n=>G.cleared[n]);
  const _maxCl=_clearedKeys.length?Math.max(..._clearedKeys):0;
  const unlockedMaps=mapItems.filter(it=>_maxCl>=it.mt);
  const lockedMaps=mapItems.filter(it=>_maxCl<it.mt);
  // Render maps: T1 at top, highest unlocked last (no scroll needed for current tier)
  const renderItem=(it)=>{
    const n=parseInt(it.id.slice(1));const md=n>=1&&n<=16?MAP_TIERS[n-1]:null;
    const cost2=SHOP_COSTS[n]||0;
    const desc=md?gi(16)+(goldMin(md,cost2))+(goldMax(md,cost2)>goldMin(md,cost2)?'–'+goldMax(md,cost2):'')+' + предметы':'';
    const disc=maraMapDiscount();
    const discCost=mapShopCost(it.cost);
    const priceHtml=disc>0
      ?'<div><span style="text-decoration:line-through;color:#666;font-size:11px">'+gi(16)+it.cost+'</span> <span style="color:#44aacc">'+gi(16)+discCost+'</span></div>'
      :'<div class="spr">'+gi(16)+it.cost+'</div>';
    return '<div class="srow"><span style="font-size:17px">🗺</span>'+
      '<div class="si"><div class="snm">'+it.nm+'</div><div class="sds">'+desc+'</div></div>'+
      '<div style="text-align:right">'+priceHtml+
      '<button class="btn btn-sm" style="margin-top:2px" data-shop="'+it.id+'">Купить</button></div></div>';
  };
  let html='';
  // Splinter exchange at top (if T16 cleared)
  if(G.cleared&&G.cleared[16]){
    html+='<div class="srow"><span style="font-size:17px">🔮</span>'+
      '<div class="si"><div class="snm">🔮 Сфера Делириума ×1</div><div class="sds">Обменять осколки Делириума</div></div>'+
      '<div style="text-align:right"><div class="spr" style="color:#cc88ff">👁5</div>'+
      '<button class="btn btn-sm" style="margin-top:2px;border-color:#553377" data-shop="buyOrb">Обменять</button></div></div>';
  }
  // Map cards T1→highest unlocked
  // Next locked tier hint at TOP
  if(lockedMaps.length){
    const nx=lockedMaps[0];
    html+='<div class="srow" style="opacity:.4;pointer-events:none"><span>🔒</span>'+
      '<div class="si"><div class="snm">'+nx.nm+'</div><div class="sds">После T'+(nx.mt+1)+'</div></div>'+
      '<div class="spr">'+gi(16)+nx.cost+'</div></div>';
  }
  // Map cards highest→T1
  html+=[...unlockedMaps].reverse().map(renderItem).join('');
  // Class respec at bottom — показываем всегда когда класс выбран
  if(G.selfCls){
    const respecCost=200;
    html+='<div class="srow" style="margin-top:8px;border-top:1px solid var(--brd);padding-top:8px">'+
      '<span style="font-size:17px">🔄</span>'+
      '<div class="si"><div class="snm">🔄 Смена класса</div><div class="sds">Выберите другой класс</div></div>'+
      '<div style="text-align:right">'+
      (G.clsLocked?'<div class="spr">'+gi(16)+respecCost+'</div>':'')+
      '<button class="btn btn-sm" style="margin-top:2px" data-shop="respec">Сменить</button></div></div>';
  }
  // Register shop items for click handler
  window._shopItems=[...mapItems];
  window._shopItems.push({id:'respec',nm:'🔄 Смена класса',cost:G.clsLocked?200:0,mt:-1,fn:()=>{
    if(G.clsLocked){G.clsLocked=false;log('🔄 Смена класса — выберите новый!','info');showN('Выберите новый класс!','pur');}
    updateSelfStats();
  }});
  if(G.cleared&&G.cleared[16])window._shopItems.push({id:'buyOrb',nm:'🔮 Сфера Делириума ×1',cost:0,mt:-1,splCost:5,fn:()=>{
    if((G.deliriumSplinters||0)<5){showN('Нет осколков! Нужно 5 👁');return false;}
    G.deliriumSplinters-=5;G.deliriumOrbs=(G.deliriumOrbs||0)+1;
    log('🔮 Куплен Орб Делириума за 5 осколков','info');updateRes();return true;}});
  document.getElementById('tab-shop').innerHTML=html;
}
function buyShop(id){
  const it=window._shopItems.find(x=>x.id===id);if(!it)return;
  if(it.splCost!==undefined){
    // splinter currency item — fn handles validation and logging
    it.fn();save();renderShop();updateRes();return;
  }
  const finalCost=it.isMap?mapShopCost(it.cost):it.cost;
  if(G.gold<finalCost){showN('Мало золота!');return;}
  G.gold-=finalCost;const _r=it.fn();
  if(_r!==false)log('🛒 Куплено: '+it.nm,'info');
  updateRes();renderMaps();renderShop();
}

