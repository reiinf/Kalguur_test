// constants.js — константы и данные
// Зависимости: state.js (G), icons.js (gi)



'use strict';
// ══════════ CONSTANTS ══════════════════════════════════════════
const MAP_TIERS=[
  {t:1, nm:'Академия',              em:'🏛️',time:6, g:[15,35],  drop:.28,md:.08,mx:2, dgr:22},
  {t:2, nm:'Дюны',                  em:'🏜️',time:7, g:[22,48],  drop:.30,md:.09,mx:3, dgr:35},
  {t:3, nm:'Каньон',                em:'🏔️',time:8,g:[32,68],  drop:.32,md:.10,mx:4, dgr:52},
  {t:4, nm:'Кладбище',              em:'⛪',time:9,g:[45,90],  drop:.34,md:.11,mx:5, dgr:73},
  {t:5, nm:'Атолл',                 em:'🏝️',time:10,g:[60,115], drop:.36,md:.12,mx:6, dgr:98},
  {t:6, nm:'Арсенал',               em:'⚔️',time:11,g:[80,150], drop:.38,md:.13,mx:7, dgr:128},
  {t:7, nm:'Городская площадь',     em:'🏙️',time:13,g:[100,185],drop:.40,md:.14,mx:8, dgr:163},
  {t:8, nm:'Базар',                 em:'🛒',time:14,g:[125,230], drop:.42,md:.15,mx:9, dgr:203},
  {t:9, nm:'Тёмный лес',            em:'🌑',time:15,g:[155,285], drop:.44,md:.16,mx:10,dgr:248},
  {t:10,nm:'Ледяные хижины',       em:'🏔️',time:16,g:[195,345], drop:.46,md:.16,mx:11,dgr:298},
  {t:11,nm:'Кислотные пещеры',      em:'🧪',time:19,g:[240,410], drop:.48,md:.17,mx:12,dgr:354},
  {t:12,nm:'Пурпурный храм',       em:'🟣',time:21,g:[290,480], drop:.50,md:.18,mx:13,dgr:416},
  {t:13,nm:'Погребальные камеры',   em:'⚰️',time:22,g:[350,570], drop:.52,md:.19,mx:14,dgr:484},
  {t:14,nm:'Гробница паука',        em:'🕷️',time:25,g:[420,670], drop:.55,md:.20,mx:15,dgr:558},
  {t:15,nm:'Арена',                 em:'🏟️',time:27,g:[500,790], drop:.58,md:.22,mx:16,dgr:638},
  {t:16,nm:'Пляж',                  em:'🌊',time:30,g:[600,900], drop:.62,md:.25,mx:16,dgr:725},
];
const SHOP_COSTS={1:15,2:35,3:65,4:100,5:140,6:185,7:240,8:310,9:400,10:510,11:640,12:800,13:990,14:1220,15:1500,16:1850};
const WCLS={
  warrior:{nm:'Дикарь',   em:'⚔️',col:'#cc4444',desc:'Высокое ХП и броня.',
    port:'https://raw.githubusercontent.com/reiinf/Kalguur/main/images/marauder_port.png',
    portBig:'https://raw.githubusercontent.com/reiinf/Kalguur/main/images/marauder_big.png'},
  mage:   {nm:'Ведьма',   em:'🔮',col:'#8888ff',desc:'Высокий урон заклинаниями.',
    port:'https://raw.githubusercontent.com/reiinf/Kalguur/main/images/witch_port.png',
    portBig:'https://raw.githubusercontent.com/reiinf/Kalguur/main/images/witch_big.png'},
  ranger: {nm:'Охотница', em:'🏹',col:'#44cc88',desc:'Быстрый, уклоняется.',
    port:'https://raw.githubusercontent.com/reiinf/Kalguur/main/images/huntress_port.png',
    portBig:'https://raw.githubusercontent.com/reiinf/Kalguur/main/images/huntress_big.png'},
  noble:  {nm:'Дворянка',  em:'👸',col:'#e8c020',desc:'Получает бонусы от всех типов вещей.',
    port:'https://raw.githubusercontent.com/reiinf/Kalguur/main/images/scion_port.png',
    portBig:'https://raw.githubusercontent.com/reiinf/Kalguur/main/images/scion_big.png'},
};
// Имена по полу. gender:'m'/'f' — для будущего расширения (смена пола класса)
const WNAMES_M=['Харальд','Торвальд','Рагнар','Эйнар','Бьёрн','Гуннар','Свейн','Олаф','Магнус','Лейф','Ивар','Сигурд','Ульф','Кнут','Ормар'];
const WNAMES_F=['Сигрид','Астрид','Хильда','Фрейя','Ингрид','Брунхильд','Хельга','Рагна','Гуннхильд','Сольвейг','Тора','Эйла','Рунн','Асдис'];
// Какой пул имён использовать для каждого класса (можно менять)
const WCLS_GENDER={warrior:'m', mage:'f', ranger:'f', noble:'f'};
function randName(cls){const g=WCLS_GENDER[cls]||'f';return g==='m'?WNAMES_M[Math.floor(Math.random()*WNAMES_M.length)]:WNAMES_F[Math.floor(Math.random()*WNAMES_F.length)];}
const ACTS=[
  {id:'a1',nm:'Акт 1: Зона новичков',em:'🏕',time:5, g:[3,8],   xp:40},
  {id:'a2',nm:'Акт 2: Лагерь бродяг',em:'🌄',time:10,g:[6,14],  xp:55},
  {id:'a3',nm:'Акт 3: Поля сражений',em:'🗡️',time:17,g:[10,22], xp:70},
];
const WLVLS=[0,60,120,300,700,1500,3000,5500,9000,14000,21000];
const SLOTS=['weapon','armor','helmet','ring','cluster'];
const SLOTNM={weapon:'⚔️ Оружие',weapon2:'⚔️ Оружие 2',armor:'🛡️ Броня',helmet:'⛑️ Шлем',ring:'💍 Кольцо',cluster:'🔮 Кластерный самоцвет',cluster2:'🔮 Кластерный самоцвет 2'};
function slotNm(slot,iconSize){const s=SLOTNM[slot]||slot;return s.replace(/^(\S+)\s/,(m,em)=>{const ico=itemIcon(em,iconSize||14);return ico!=='<span'+' style="font-size:'+iconSize+'px">'+em+'</span>'?ico+' ':m;});}
const STATNM={dmgPhys:'Физ. урон',dmgSpell:'Урон заклин.',dmgArea:'Урон по области',minionDmg:'Урон призывов',critChance:'Шанс крита',critMult:'Множитель крита',critSpell:'Крит заклин.',castSpd:'Скорость каста',atkSpd:'Скорость атаки',str:'Сила',int:'Интеллект',dex:'Ловкость',hp:'Очки здоровья',energyShield:'Энергощит',armor:'Броня',evasion:'Уклонение',blockChance:'Шанс блока',allRes:'Все сопр.',fireRes:'Огн. сопр.',coldRes:'Хол. сопр.',moveSpd:'Скор. движения'};
const CDMG={warrior:['dmgPhys','dmgArea','critChance','critMult','atkSpd','str'],mage:['dmgSpell','minionDmg','critSpell','castSpd','int'],ranger:['dmgPhys','critChance','critMult','atkSpd','dex'],noble:['dmgPhys','dmgSpell','dmgArea','minionDmg','critChance','critMult','critSpell','atkSpd','str','int','dex','castSpd']};
const CSURV={warrior:['armor','hp','blockChance','str','allRes','fireRes'],mage:['energyShield','int','allRes'],ranger:['evasion','hp','dex','allRes','coldRes'],noble:['armor','energyShield','evasion','hp','blockChance','allRes','fireRes','coldRes','moveSpd','str','int','dex']};
const IBASES=[
  {nm:'Длинный меч',      em:'🗡️',cls:'warrior',slot:'weapon',mods:['dmgPhys','critChance','atkSpd','str']},
  {nm:'Боевой топор',     em:'🪓',cls:'warrior',slot:'weapon',mods:['dmgPhys','dmgArea','str','atkSpd']},
  {nm:'Двуручный молот',  em:'🔨',cls:'warrior',slot:'weapon',mods:['dmgPhys','dmgArea','str','critMult']},
  {nm:'Стальной нагрудник',em:'🛡',cls:'warrior',slot:'armor', mods:['armor','hp','str','allRes']},
  {nm:'Латные поножи',    em:'🥾',cls:'warrior',slot:'armor', mods:['armor','hp','str','fireRes']},
  {nm:'Шлем паладина',    em:'⛑️',cls:'warrior',slot:'helmet',mods:['armor','hp','str','fireRes']},
  {nm:'Кольцо воина',     em:'🔴',cls:'warrior',slot:'ring',  mods:['hp','str','allRes','armor']},
  {nm:'Жезл силы',        em:'🔱',cls:'mage',   slot:'weapon',mods:['dmgSpell','castSpd','critSpell','int']},
  {nm:'Посох мага',       em:'🦯',cls:'mage',   slot:'weapon',mods:['dmgSpell','castSpd','int','energyShield']},
  {nm:'Свиток призыва',   em:'📜',cls:'mage',   slot:'weapon',mods:['minionDmg','dmgSpell','int','castSpd']},
  {nm:'Мантия архимага',  em:'🧥',cls:'mage',   slot:'armor', mods:['energyShield','int','allRes','castSpd']},
  {nm:'Диадема мага',     em:'👑',cls:'mage',   slot:'helmet',mods:['energyShield','int','critSpell','dmgSpell']},
  {nm:'Кольцо знания',    em:'🔵',cls:'mage',   slot:'ring',  mods:['int','dmgSpell','critSpell','allRes']},
  {nm:'Охотничий лук',    em:'🏹',cls:'ranger', slot:'weapon',mods:['dmgPhys','atkSpd','dex','critChance']},
  {nm:'Кинжал ассасина',  em:'🔪',cls:'ranger', slot:'weapon',mods:['dmgPhys','critChance','critMult','dex']},
  {nm:'Кожаный доспех',   em:'🥋',cls:'ranger', slot:'armor', mods:['evasion','dex','hp','allRes']},
  {nm:'Сапоги ловкача',   em:'👟',cls:'ranger', slot:'armor', mods:['evasion','dex','moveSpd','hp']},
  {nm:'Маска следопыта',  em:'🎭',cls:'ranger', slot:'helmet',mods:['evasion','dex','critChance','hp']},
  {nm:'Кольцо ловкости',  em:'🟢',cls:'ranger', slot:'ring',  mods:['hp','dex','evasion','coldRes']},
];
const NPFX={warrior:['Кровавый','Стальной','Железный','Яростный','Боевой','Каменный'],mage:['Тёмный','Мистический','Вечный','Призрачный','Сумеречный','Звёздный'],ranger:['Точный','Быстрый','Лесной','Теневой','Ветреный','Скрытый'],generic:['Древний','Проклятый','Легендарный','Великий','Могучий','Зловещий']};
const NSFX={warrior:['Берсеркера','Паладина','Защитника','Воителя','Крестоносца'],mage:['Архимага','Чародея','Некроманта','Провидца','Повелителя'],ranger:['Ассасина','Охотника','Разведчика','Стрелка','Тени'],generic:['Рока','Гибели','Судьбы','Вечности','Забвения']};
// Unique maps: {t: min_tier, nm, em, bonus description}
const UNIQ_MAPS=[
  {t:3, nm:'Кошмар Актона',         em:'🌀',desc:'Лабиринт скелетов · +100%IIQ',     bonus:'x2 предметы'},
  {t:4, nm:'Освящённая земля',       em:'⛪',desc:'+100%IIQ · +3 карты от босса',      bonus:'+3 карты'},
  {t:5, nm:'Водоворот Хаоса',        em:'🌊',desc:'Молния+Иммунитет · редкость +300%', bonus:'x2 редкость'},
  {t:6, nm:'Зал Великих Мастеров',   em:'👑',desc:'Бессмертные Грандмастера · PvP',    bonus:'x3 опыт'},
  {t:8, nm:'Лесной Склеп',           em:'🌑',desc:'Тёмный лес · Некроманты',           bonus:'+1 уник.шанс'},
  {t:9, nm:'Изменённая Память',      em:'🧠',desc:'Синтез · +100%IIQ · +25% монстров', bonus:'x2 XP'},
  {t:10,nm:'Дополненная Память',     em:'🔮',desc:'Синтез · 5 доп. модификаторов',      bonus:'x2 XP'},
  {t:11,nm:'Машинариум Дориани',     em:'⚙️',desc:'Боссы усилены выбором игрока',       bonus:'x2 лут'},
  {t:12,nm:'Смерть и Налоги',        em:'☠️',desc:'Босс: +12-20 валюты · мгновенно',    bonus:'x4 золото'},
  {t:13,nm:'Кортекс',                em:'🧬',desc:'Синтез · уровень 83 · 5 модов',       bonus:'x2 лут + XP'},
  {t:14,nm:'Усыпальница Ваала',        em:'🏺',desc:'Заряженный Лабиринт · уник. дроп',   bonus:'+2 уника'},
  {t:15,nm:'Логово Волчьей Стаи',    em:'🐺',desc:'+150%IIQ · +4 карты от босса',       bonus:'+4 карты'},
  {t:16,nm:'Заражённый Плацдарм',    em:'💫',desc:'Харбинджеры · +20 особых врагов',    bonus:'x3 лут'},
];
const UNIQ_MAP_NAMES=UNIQ_MAPS.map(m=>m.nm); // compat

// ── ENDGAME BOSSES ──────────────────────────────────────────────
const GUARDIAN_MAPS=[
  {id:'g_hydra',    nm:'Логово Гидры',       em:'🐍',boss:'Гидра',    type:'shaper',t:16,dgr:820,time:50,g:[900,1400],md:0,mx:16},
  {id:'g_minotaur', nm:'Лабиринт Минотавра', em:'🐂',boss:'Минотавр', type:'shaper',t:16,dgr:820,time:50,g:[900,1400],md:0,mx:16},
  {id:'g_phoenix',  nm:'Горнило Феникса',    em:'🔥',boss:'Феникс',   type:'shaper',t:16,dgr:820,time:50,g:[900,1400],md:0,mx:16},
  {id:'g_chimera',  nm:'Яма Химеры',         em:'🦁',boss:'Химера',   type:'shaper',t:16,dgr:820,time:50,g:[900,1400],md:0,mx:16},
];
const BOSSES=[
  {id:'shaper', nm:'Создатель',       em:'💠',desc:'Страж картографии. Требует 4 фрагмента стражей.',
   req:{shaper:4},dgr:1800,time:70,g:[3000,6000],t:16,md:0,mx:16,
   uniqPool:['Кольцо Создателя','Клинок Создателя','Орб Созидания','Тюрьма Создателя']},
  {id:'exarch', nm:'Пламенный Экзарх',em:'🔥',desc:'Повелитель пылающих звёзд. Пробуждается каждые 28 T16 карт.',
   req:{},dgr:1400,time:55,g:[2000,4000],t:16,md:0,mx:16,
   uniqPool:['Чёрная Звезда','Венец Пламени','Доспех Экзарха','Кольцо Экзарха']},
  {id:'eater',  nm:'Пожиратель Миров',em:'🌑',desc:'Пустотная сущность из-за Грани. Пробуждается каждые 28 T16 карт.',
   req:{},dgr:1400,time:55,g:[2000,4000],t:16,md:0,mx:16,
   uniqPool:['Семя Пустоты','Пожирающий Осколок','Щит Пожирателя','Кольцо Пустоты']},
];

// ══════════ FACTIONS ══════════════════════════════════════════
const FACTIONS={
  none:{
    id:'none',nm:'Без фракции',em:'⚪',col:'#888',
    desc:'Играете без особенностей. Работники и ГГ доступны без ограничений.',
    levels:[
      {xp:0,reward:null},
    ]
  },
  syndicate:{
    id:'syndicate',nm:'Бессмертный Синдикат',em:'🗡️',col:'#cc4444',
    desc:'Вы работаете в одиночку под крылом Бессмертного Синдиката. Работников нельзя нанять — только личная сила имеет значение. Взамен Синдикат даёт вам снаряжение и обучение с первого дня.',
    restrict:{noWorkers:true},
    bonus:{extraWeaponSlot:true,startLevel:3},
    levels:[
      {xp:0, reward:null, desc:'Особенности: работники недоступны · +1 слот оружия · старт с Ур.3 · доска контрактов'},
      {xp:1, reward:{type:'startUniq',runSpeed:true}, desc:'Стартовый Клинок Синдиката + скорость карт +50%'},
      {xp:2, reward:null, desc:'???'},
    ]
  },
  maraketh:{
    id:'maraketh',nm:'Маракеты',em:'🏹',col:'#44aacc',
    desc:'Вы примкнули к Маракетам — мореплавателям и исследователям неизведанных земель. Работники занимаются только экспедициями, но возможности экспедиций значительно расширяются.',
    restrict:{workersExpOnly:true},
    levels:[
      {xp:0, reward:null, desc:'Особенности: работники только в экспедиции · автоэкспедиция · долгий поход'},
      {xp:1, reward:{type:'namedWorker',id:'gwendyn'}, desc:'Именная охотница Гвенен присоединяется к отряду + авто-закупка карт + скидка 10% на карты в магазине'},
      {xp:2, reward:null, desc:'Усиленная охрана: работников не могут взять в заложники или ранить · авто-продажа вещей'},
      {xp:3, reward:null, desc:''},
    ]
  },
  legacy:{
    id:'legacy',nm:'Наследие',em:'📜',col:'#cc9933',
    desc:'Вы — вольный картоходец, впитавший знания всех фракций. Без ограничений — выбирайте особенности из опыта Синдиката и Маракетов.',
    restrict:{},
    minPrestige:5,
    perkSlots:[0,2,4,6],
    levels:[
      {xp:0, reward:null, desc:'Требуется возвышение 5+'},
      {xp:1, reward:null, desc:'2 особенности из опыта других фракций'},
      {xp:2, reward:null, desc:'4 особенности из опыта других фракций'},
      {xp:3, reward:null, desc:'6 особенностей из опыта других фракций'},
    ]
  }
};

// ── Legacy perk pool ─────────────────────────────────────────
const LEGACY_PERKS=[
  // Syndicate level 1: base package
  {id:'synd_1', fac:'syndicate', minFacXp:1, em:'🗡️', nm:'Синдикат — Основы',
   desc:'Старт с Уровня 3 · +1 слот оружия · доска контрактов Синдиката',
   apply:()=>{G.selfLevel=Math.max(G.selfLevel||0,3);G.selfPendingLevel=Math.max(G.selfPendingLevel||0,3);G.syndExtraWeapon=true;G.legacyContracts=true;}},
  // Syndicate level 2: advanced package
  {id:'synd_2', fac:'syndicate', minFacXp:2, em:'⚡', nm:'Синдикат — Мастерство',
   desc:'Скорость прохождения карт +50% · стартовый Клинок Синдиката (уник, T8) в инвентаре',
   apply:()=>{G.syndRunSpeed=Math.max(G.syndRunSpeed||1.0,1.5);if(!G.inv.find(x=>x.name==='Клинок Синдиката')&&!(G.selfEq&&Object.values(G.selfEq).find(x=>x&&x.name==='Клинок Синдиката'))){const wu={id:++G.iid,name:'Клинок Синдиката',em:'🗡️',slot:'weapon',cls:'warrior',quality:'unique',tier:8,mods:[{stat:'dmgPhys',value:22},{stat:'critChance',value:12}],sellPrice:25};G.inv.push(wu);}}},
  // Maraketh level 1: expedition package
  {id:'mara_1', fac:'maraketh',  minFacXp:1, em:'🏕️', nm:'Маракеты — Экспедиции',
   desc:'Автоэкспедиция · долгий поход (до 5 карт за раз)',
   apply:()=>{if(!G.factionUnlocks.autoExpBought){G.factionUnlocks.autoExpBought=true;G.autoExp=true;}if(!G.factionUnlocks.exp5)G.factionUnlocks.exp5=true;}},
  // Maraketh level 2: trade + gwendyn package
  {id:'mara_2', fac:'maraketh',  minFacXp:2, em:'🏹', nm:'Маракеты — Союзники',
   desc:'Именная охотница Гвенен вступает в отряд · авто-закупка карт · скидка 10% в магазине',
   apply:()=>{if(!G.workers.find(w=>w.name==='Гвенен')){G.wid=(G.wid||0)+1;const gw={...GWENDYN,id:G.wid,wid:G.wid,eq:{weapon:null,armor:null,helmet:null,ring:null}};recalcW(gw);G.workers.push(gw);log('🏹 Гвенен присоединилась (Наследие)!','ev');}if(!G.factionUnlocks.autoBuyMapsBought){G.factionUnlocks.autoBuyMapsBought=true;G.autoBuyMaps=true;}}},
  // Maraketh level 3: guard package
  {id:'mara_3', fac:'maraketh',  minFacXp:3, em:'🛡️', nm:'Маракеты — Охрана',
   desc:'Работников не берут в заложники и не ранят · авто-продажа предметов',
   apply:()=>{G.factionUnlocks.guardedWorkers=true;if(!G.factionUnlocks.autoSellItems){G.factionUnlocks.autoSellItems=true;G.autoSellRules=G.autoSellRules||{normal:false,magic:false,rare:false};}}},
];

function getLegacyPool(){
  const fxp=G.factionXp||{};
  return LEGACY_PERKS.filter(p=>(fxp[p.fac]||0)>=p.minFacXp);
}
function legacyPerkSlots(){
  const xp=(G.factionXp&&G.factionXp.legacy)||0;
  const s=FACTIONS.legacy.perkSlots;
  return xp>=3?s[3]:xp>=2?s[2]:xp>=1?s[1]:s[0];
}
function hasLegacyBonus(pid){return hasFaction('legacy')&&!!(G.legacyPerks&&G.legacyPerks.includes(pid));}
function applyLegacyPerks(){
  if(!hasFaction('legacy'))return;
  const sel=G.legacyPerks||[];
  sel.forEach(pid=>{const p=LEGACY_PERKS.find(x=>x.id===pid);if(p)p.apply();});
  if(sel.includes('synd_1')||sel.includes('synd_2')){if(!G.contracts||!G.contracts.length)refreshContracts();}
}

const GWENDYN={
  id:'gwendyn',name:'Гвенен',cls:'ranger',level:0,
  dmg:10,surv:10,xp:0,status:'idle',prog:0,elapsed:0,
  eq:{weapon:null,armor:null,helmet:null,ring:null},
  runsCompleted:0,isNamed:true,
  bonus:{guardianExpChance:0.15,itemDropBonus:0.10}
};
function hasFaction(id){return (G.faction||'none')===id;}
function factionRestrict(key){
  const f=FACTIONS[G.faction||'none'];
  if(!f||!f.restrict||!f.restrict[key])return false;
  // Legacy имеет пустой restrict, никогда не блокирует
  return true;
}
// Синдикат-функционал: либо фракция синдиката, либо легаси с нужным перком
function hasSyndFeature(){return hasFaction('syndicate')||(hasFaction('legacy')&&(hasLegacyBonus('synd_1')||hasLegacyBonus('synd_2')));}
// Маракет-функционал: либо фракция маракетов, либо легаси с любым маракет-перком
function hasMaraFeature(){return hasFaction('maraketh')||(hasFaction('legacy')&&(hasLegacyBonus('mara_1')||hasLegacyBonus('mara_2')||hasLegacyBonus('mara_3')));}
const ACHDEFS=[
  {id:'first_run', ico:'🗺',nm:'Первые шаги',    ds:'Пройти первую карту',          rw:'+30'+'💰'},
  {id:'t5_clear',  ico:'🏝️',nm:'Горизонт зовёт',  ds:'Пройти карту T5 (Атолл)',              rw:'+50'+'💰'},
  {id:'t10_clear', ico:'🏔️',nm:'Холодный приём',  ds:'Пройти карту T10 (Ледяные хижины)',             rw:'+150'+'💰'},
  {id:'t16_clear', ico:'💫',nm:'Картоходец',      ds:'Пройти карту T16',             rw:'+500'+'💰'},
  {id:'hire3',     ico:'👥',nm:'Команда',         ds:'Нанять 3 работников',          rw:'+100'+'💰'},
  {id:'runs50',    ico:'🔄',nm:'Ветеран',         ds:'Пройти 50 карт',               rw:'+200'+'💰'},
  {id:'runs200',   ico:'⚔️',nm:'Мастер',         ds:'Пройти 200 карт',              rw:'+1000'+'💰'},
  {id:'items20',   ico:'🎒',nm:'Коллекционер',   ds:'Найти 20 предметов',           rw:'+80'+'💰'},
  {id:'rare_item', ico:'🌟',nm:'Первая редкость', ds:'Найти редкий предмет',         rw:'+60'+'💰'},
  {id:'uniq_item', ico:'💎',nm:'Уникальность',   ds:'Найти уникальный предмет',     rw:'+250'+'💰'},
  {id:'sell500',   ico:'💰',nm:'Торговец',        ds:'Продать предметов на 500💰',   rw:'+100'+'💰'},
  {id:'all16',     ico:'🌐',nm:'Атлас завершён', ds:'Пройти все 16 тиров',          rw:'Открывает Возвышение'},
  {id:'con_first', ico:'📋',nm:'Первый контракт',ds:'Выполнить 1 контракт',          rw:'+100'+'💰'},
  {id:'con_10',    ico:'🗡️',nm:'Синдикат чтит', ds:'Выполнить 10 контрактов',       rw:'+300'+'💰'},
  {id:'con_25',    ico:'💀',nm:'Ветеран улиц',   ds:'Выполнить 25 контрактов',       rw:'+800'+'💰'},
  {id:'master_1',  ico:'⚔️',nm:'Ликвидатор',    ds:'Выполнить мастер-контракт',     rw:'+500'+'💰'},
  {id:'del_first', ico:'🌫️',nm:'Первый делириум',ds:'Пройти 1 волну делириума',     rw:'+150'+'💰'},
  {id:'del_wave5', ico:'👁', nm:'Выживший',      ds:'Дойти до 5-й волны',            rw:'+400'+'💰'},
  {id:'del_wave10',ico:'🔮',nm:'Взгляд в бездну',ds:'Дойти до 10-й волны',          rw:'+1000'+'💰'},
  {id:'del_wave20',ico:'💠',nm:'Симулякр',       ds:'Дойти до 20-й волны',           rw:'+3000'+'💰'},
  // Prestige
  {id:'pres_1',    ico:'✨', nm:'Первое возвышение', ds:'Пройти первое возвышение',     rw:'+500'+'💰'},
  {id:'pres_3',    ico:'🌟', nm:'Ветеран',           ds:'Три возвышения',               rw:'+2000'+'💰'},
  {id:'pres_5',    ico:'👑', nm:'Вознёсшийся',       ds:'Пять возвышений',              rw:'+5000'+'💰'},
  // Режим делириума
  {id:'del_mode_clear', ico:'👁', nm:'Ты видел изнанку этого мира', ds:'Пройти атлас в режиме делириума', rw:'2й слот кластерного самоцвета'},
  // Рыбалка
  {id:'fish1',   ico:'🐟', nm:'Он рыбак!',    ds:'Поймать первую рыбу',    rw:'...'},
  {id:'fish10',  ico:'🐠', nm:'Заядлый рыбак', ds:'Поймать 10 рыб',         rw:'...'},
  {id:'fish100', ico:'🦈', nm:'Морской волк',  ds:'Поймать 30 рыб',         rw:'...'},
  // Боссы
  {id:'kill_shaper', ico:'💠', nm:'Убийца Создателя',      ds:'Победить Создателя',          rw:'+3000'+'💰'},
  {id:'kill_exarch', ico:'🔥', nm:'Убийца Экзарха',         ds:'Победить Пламенного Экзарха', rw:'+3000'+'💰'},
  {id:'kill_eater',  ico:'🌑', nm:'Убийца Пожирателя',      ds:'Победить Пожирателя Миров',   rw:'+3000'+'💰'},
  // Все ачивки
  {id:'all_achs', ico:'🏆', nm:'Я прошел игру! Прошел ли... ?', ds:'Получить все достижения на текущий момент. Следите за обновлениями', rw:'👑'},
];

// ══════════ MAP IMAGES ══════════════════════════════════════════
const MAP_IMAGES = {
  '1': 'https://raw.githubusercontent.com/reiinf/Kalguur/main/images/maps/t1.webp',
  // '2': 'https://raw.githubusercontent.com/reiinf/Kalguur/main/images/maps/t2.webp',
  // '3': 'https://raw.githubusercontent.com/reiinf/Kalguur/main/images/maps/t3.webp',
  // '4': 'https://raw.githubusercontent.com/reiinf/Kalguur/main/images/maps/t4.webp',
  // '5': 'https://raw.githubusercontent.com/reiinf/Kalguur/main/images/maps/t5.webp',
};

// ══════════ STATE ══════════════════════════════════════════════