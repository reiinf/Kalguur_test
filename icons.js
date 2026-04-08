// ── Item icons (spritesheet) ──
// Sprite source: localStorage always takes priority; GitHub URL as fallback (blocked by CSP in claude artifacts)
(function(){
  const GITHUB_SPRITE_URL = 'https://raw.githubusercontent.com/reiinf/Kalguur/main/icons/spritesheet.png';
  const LS_KEY = 'kalguur_sprites';
  const stored = localStorage.getItem(LS_KEY);
  if (stored && stored.startsWith('data:')) {
    // localStorage data: always works
    window.SPRITE_B64 = stored; if(typeof setSpriteCSS==='function') setSpriteCSS(stored); else window._pendingSpriteCSS=stored;
  } else {
    // Test if GitHub URL is actually reachable (CSP may block it)
    window.SPRITE_B64 = null; // emoji fallback until proven otherwise
    const img = new Image();
    img.onload = function(){ window.SPRITE_B64 = GITHUB_SPRITE_URL; if(typeof setSpriteCSS==='function') setSpriteCSS(GITHUB_SPRITE_URL); if(typeof renderAll==='function') renderAll(); const _gi=document.getElementById('ri-gold-ico');if(_gi&&typeof gi==='function')_gi.innerHTML=gi(18); };
    img.onerror = function(){ window.SPRITE_B64 = null; };
    img.src = GITHUB_SPRITE_URL;
  }
})();
const SPRITE_MAP={'🪓':0,'⛑️':64,'💰':128,'🗡️':256,'🔵':320,'🔴':384,'🟢':448,'💍':512};
const SPRITE_W=576; // spritesheet total width in px — update when adding icons
// Per-emoji icon overrides from localStorage, loaded lazily on first use
const DBG_ICONS=[
  {em:'💰',key:'coin',    label:'Монета'},
  {em:'⚔️',key:'sword',   label:'Урон/оружие'},
  {em:'🔮',key:'cluster', label:'Кластер'},
  {em:'🛡️',key:'armor',   label:'Броня'},
  {em:'👁', key:'eye',     label:'Делириум'},
  {em:'💠',key:'shard',   label:'Осколки'},
  {em:'💀',key:'skull',   label:'Смерть'},
  {em:'✨',key:'spark',   label:'Возвышение'},
  {em:'✅',key:'check',   label:'Шанс'},
  {em:'🗺', key:'map',    label:'Карты'},
  {em:'🔷',key:'guard',   label:'Гвард.карты'},
  {em:'🗡', key:'weapon2', label:'Оружие 2'},
  {em:'👑',key:'crown',   label:'Боссы'},
  {em:'🔄',key:'refresh', label:'Авто'},
  {em:'🏕', key:'acts',   label:'Акты'},
  {em:'🏆',key:'trophy',  label:'Ачивки'},
  {em:'🌑',key:'moon',    label:'Делириум 2'},
  {em:'💍',key:'ring',    label:'Кольцо'},
  {em:'📋',key:'contract',label:'Контракты'},
  {em:'🏹',key:'bow',     label:'Охотница'},
  {em:'🔥',key:'fire',    label:'Огонь'},
  {em:'🌐',key:'atlas',   label:'Атлас'},
  {em:'⭐',key:'star',    label:'Уровень'},
  {em:'⚡',key:'bolt',    label:'Улучшения'},
  {em:'⚠', key:'warn',    label:'Внимание'},
  {em:'🌫', key:'fog',    label:'Туман'},
  {em:'🌟',key:'uniq',    label:'Уникальные'},
  {em:'🔱',key:'exarch',  label:'Экзарх'},
  {em:'⚙', key:'gear',   label:'Настройки'},
  {em:'📦',key:'chest',   label:'Склад'},
  {em:'🎒',key:'bag',     label:'Инвентарь'},
  {em:'💎',key:'gem',     label:'Редкий'},
  {em:'🧙',key:'mage',    label:'Персонаж'},
  {em:'👟',key:'boots',   label:'Обувь'},
  {em:'🧥',key:'armor2',  label:'Нагрудник'},
  {em:'🔪',key:'dagger',  label:'Кинжал'},
  {em:'🥋',key:'gloves',  label:'Перчатки'},
  {em:'🥾',key:'boots2',  label:'Сапоги'},
  {em:'🦯',key:'staff',   label:'Посох'},
  {em:'🪓',key:'axe',     label:'Топор'},
  {em:'⛑️',key:'helm',    label:'Шлем'},
];
const DBG_LS_PREFIX='kalguur_icon_';
const _iconOverrides={};
let _iconOverridesLoaded=false;
function _ensureOverrides(){
  if(_iconOverridesLoaded)return;
  _iconOverridesLoaded=true;
  const prefix='kalguur_icon_';
  DBG_ICONS.forEach(ic=>{
    const val=localStorage.getItem(prefix+ic.key);
    if(val)_iconOverrides[ic.key]=val;
  });
}
function _getIconOverride(em){
  _ensureOverrides();
  if(!window.DBG_ICONS_MAP){
    window.DBG_ICONS_MAP={};
    DBG_ICONS.forEach(ic=>{
      DBG_ICONS_MAP[ic.em]=ic.key;
      DBG_ICONS_MAP[ic.em.replace(/\uFE0F/g,'')]=ic.key;
    });
  }
  const key=DBG_ICONS_MAP[em]||DBG_ICONS_MAP[em.replace(/\uFE0F/g,'')];
  return key?_iconOverrides[key]:undefined;
}

// Update CSS variable with sprite URL — all spr-ico spans use var(--spr-url), no inline base64
function setSpriteCSS(src){
  document.documentElement.style.setProperty('--spr-url', src ? 'url("'+src+'")' : 'none');
}
if(window._pendingSpriteCSS){setSpriteCSS(window._pendingSpriteCSS);window._pendingSpriteCSS=null;}
function itemIcon(em,size){
  // Check for individual icon override in localStorage
  const overrideSrc=_getIconOverride(em);
  if(overrideSrc){
    if(size==='full'){
      return '<span style="display:inline-block;width:32px;height:32px;flex-shrink:0;background:url(\''+overrideSrc+'\') center/contain no-repeat"></span>';
    }
    return '<span style="display:inline-block;width:'+size+'px;height:'+size+'px;flex-shrink:0;vertical-align:middle;margin:0 2px;background:url(\''+overrideSrc+'\') center/contain no-repeat"></span>';
  }
  const x=SPRITE_MAP[em];
  const hasSpr=window.SPRITE_B64 && x!==undefined;
  if(size==='full'){
    if(!hasSpr)return '<span style="font-size:inherit;line-height:1">'+em+'</span>';
    const sz=32;
    const bx=Math.round(x*(sz/64));
    const bw=Math.round(SPRITE_W*(sz/64));
    return '<span class="spr-ico" style="display:inline-block;width:'+sz+'px;height:'+sz+'px;flex-shrink:0;background:var(--spr-url) -'+bx+'px 0;background-size:'+bw+'px '+sz+'px"></span>';
  }
  if(!hasSpr)return '<span style="font-size:'+Math.round(size*0.72)+'px;line-height:1;display:inline-flex;align-items:center;justify-content:center;width:'+size+'px;height:'+size+'px;text-align:center;overflow:hidden;vertical-align:middle;flex-shrink:0">'+em+'</span>';
  const bx=Math.round(x*(size/64));
  const bw=Math.round(SPRITE_W*(size/64));
  return '<span class="spr-ico" style="display:inline-block;width:'+size+'px;height:'+size+'px;flex-shrink:0;vertical-align:middle;margin:0 2px;background:var(--spr-url) -'+bx+'px 0;background-size:'+bw+'px '+size+'px"></span>';
}
function gi(sz){return itemIcon('💰',sz||14);}
