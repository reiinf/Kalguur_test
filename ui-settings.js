// ui-settings.js — настройки, экспорт/импорт
// Зависимости: state.js

const _SAVE_KEY=[75,97,108,103,117,117,114,95,50,48,50,52,95,115,97,118,101]; // "Kalguur_2024_save"
function _obfuscate(str){
  const bytes=new TextEncoder().encode(str);
  const out=new Uint8Array(bytes.length);
  for(let i=0;i<bytes.length;i++)out[i]=bytes[i]^_SAVE_KEY[i%_SAVE_KEY.length];
  // base64 из Uint8Array через chunks чтобы не было stack overflow
  let bin='';
  for(let i=0;i<out.length;i++)bin+=String.fromCharCode(out[i]);
  return btoa(bin);
}
function _deobfuscate(b64){
  const bin=atob(b64);
  const bytes=new Uint8Array(bin.length);
  for(let i=0;i<bin.length;i++)bytes[i]=bin.charCodeAt(i)^_SAVE_KEY[i%_SAVE_KEY.length];
  return new TextDecoder().decode(bytes);
}

function _applyImport(raw){
  let parsed;
  try{parsed=JSON.parse(raw);}catch(e){showN('❌ Повреждённые данные','red');return;}
  if(!parsed.v||parsed.v<9){showN('❌ Сохранение несовместимо','red');return;}
  localStorage.setItem('kartahodec_save',raw);
  showN('✅ Сохранение загружено! Перезагрузка...','grn');
  closeM();
  setTimeout(()=>location.reload(),1200);
}

function downloadSave(){
  const a=document.getElementById('export-area');
  if(!a||!a.value)return;
  const blob=new Blob([a.value],{type:'text/plain'});
  const fr=new FileReader();
  fr.onload=function(e){
    const l=document.createElement('a');
    l.href=e.target.result;
    l.download='kalguur_save.txt';
    document.body.appendChild(l);l.click();document.body.removeChild(l);
  };
  fr.readAsDataURL(blob);
}

function exportSave(){
  try{
    const raw=localStorage.getItem('kartahodec_save');
    if(!raw){showN('❌ Нет сохранения для экспорта','red');return;}
    let exportObj;
    try{exportObj=JSON.parse(raw);}catch(e){exportObj={};}
    delete exportObj._icons;
    const encoded=_obfuscate(JSON.stringify(exportObj));
    openM('📤 ЭКСПОРТ СОХРАНЕНИЯ',
      '<div style="font-size:12px;color:var(--txt-b);margin-bottom:8px">Скопируй строку и сохрани в надёжном месте</div>'+
      '<textarea id="export-area" readonly style="width:100%;height:120px;background:var(--bg1);border:1px solid var(--brd-g);color:var(--gold);font-size:11px;font-family:monospace;padding:8px;resize:none;box-sizing:border-box;border-radius:2px"></textarea>'+
      '<div style="display:flex;gap:8px;margin-top:10px">'+
      '<button onclick="const a=document.getElementById(\'export-area\');a.select();document.execCommand(\'copy\');showN(\'✅ Скопировано в буфер!\',\'grn\')" style="flex:1;background:linear-gradient(180deg,rgba(200,169,110,.2),rgba(200,169,110,.05));border:1px solid var(--gold-d);color:var(--gold);font-size:12px;font-family:\'Cinzel\',serif;padding:6px;cursor:pointer">📋 КОПИРОВАТЬ</button>'+
      '<button onclick="downloadSave()" style="flex:1;background:linear-gradient(180deg,rgba(100,120,160,.2),rgba(100,120,160,.05));border:1px solid #445;color:#99aacc;font-size:12px;font-family:\'Cinzel\',serif;padding:6px;cursor:pointer">💾 СКАЧАТЬ ФАЙЛ</button>'+
      '</div>'
    );
    const a=document.getElementById('export-area');
    if(a){a.value=encoded;a.select();}
  }catch(e){showN('❌ Ошибка экспорта: '+e.message,'red');}
}

function importSave(){
  openM('📥 ИМПОРТ СОХРАНЕНИЯ',
    '<div style="font-size:12px;color:#cc6655;margin-bottom:8px">⚠ Текущий прогресс будет ЗАМЕНЁН. Сначала сделай экспорт!</div>'+
    '<textarea id="import-area" placeholder="Вставь строку сохранения сюда..." style="width:100%;height:120px;background:var(--bg1);border:1px solid var(--brd-g);color:var(--txt);font-size:11px;font-family:monospace;padding:8px;resize:none;box-sizing:border-box;border-radius:2px"></textarea>'+
    '<div style="display:flex;gap:6px;margin-top:8px">'+
    '<button onclick="doImportSave()" style="flex:1;background:linear-gradient(180deg,rgba(200,169,110,.2),rgba(200,169,110,.05));border:1px solid var(--gold-d);color:var(--gold);font-size:12px;font-family:\'Cinzel\',serif;padding:8px;cursor:pointer">📥 ЗАГРУЗИТЬ</button>'+
    '<button onclick="document.getElementById(\'import-file-input\').click()" style="flex:1;background:linear-gradient(180deg,rgba(100,120,160,.15),rgba(100,120,160,.05));border:1px solid #445;color:#99aacc;font-size:12px;font-family:\'Cinzel\',serif;padding:8px;cursor:pointer">📂 ИЗ ФАЙЛА</button>'+
    '</div>'+
    '<input type="file" id="import-file-input" accept=".txt" style="display:none" onchange="importFromFile(this)">'
  );
}

function importFromFile(input){
  const file=input.files[0];
  if(!file)return;
  const fr=new FileReader();
  fr.onload=function(e){
    const area=document.getElementById('import-area');
    if(area)area.value=e.target.result.trim();
  };
  fr.readAsText(file);
}

function doImportSave(){
  try{
    const area=document.getElementById('import-area');
    if(!area)return;
    const encoded=area.value.trim();
    if(!encoded){showN('❌ Пустая строка','red');return;}
    let raw;
    try{raw=_deobfuscate(encoded);}catch(e){showN('❌ Неверный формат строки','red');return;}
    _applyImport(raw);
  }catch(e){showN('❌ Ошибка импорта: '+e.message,'red');}
}

function openSettings(){
  const cur=parseInt(localStorage.getItem('kalguur_fontOffset')||'0');
  const vol=parseFloat(localStorage.getItem('kalguur_volume')||'1');
  const volPct=Math.round(vol*100);
  openM('⚙ НАСТРОЙКИ',
    '<div style="margin-bottom:16px">'+
    '<div style="font-size:13px;color:var(--txt-b);margin-bottom:8px">Громкость звука</div>'+
    '<div style="display:flex;align-items:center;gap:10px">'+
    '<span style="font-size:13px;color:var(--txt-d)">🔇</span>'+
    '<input type="range" id="vol-slider" min="0" max="100" step="5" value="'+volPct+'" style="flex:1;accent-color:var(--gold)">'+
    '<span style="font-size:13px;color:var(--txt-d)">🔊</span>'+
    '</div>'+
    '<div style="font-size:12px;color:var(--txt-d);margin-top:6px;text-align:center" id="vol-slider-label">'+(volPct===0?'Выключен':volPct+'%')+'</div>'+
    '</div>'+
    '<div style="border-top:1px solid var(--brd-g);margin:16px 0"></div>'+
    '<div style="margin-bottom:16px">'+
    '<div style="font-size:13px;color:var(--txt-b);margin-bottom:8px">Размер шрифта</div>'+
    '<div style="display:flex;align-items:center;gap:10px">'+
    '<span style="font-size:11px;color:var(--txt-d)">А</span>'+
    '<input type="range" id="font-slider" min="-3" max="4" step="1" value="'+cur+'" style="flex:1;accent-color:var(--gold)">'+
    '<span style="font-size:17px;color:var(--txt-d)">А</span>'+
    '</div>'+
    '<div style="font-size:12px;color:var(--txt-d);margin-top:6px;text-align:center" id="font-slider-label">'+(cur===0?'По умолчанию':(cur>0?'+'+cur:cur)+' пт')+'</div>'+
    '</div>'+
    '<div style="border-top:1px solid var(--brd-g);margin:16px 0 12px"></div>'+
    '<div style="font-size:13px;color:#cc4444;margin-bottom:8px">⚠ ОПАСНО</div>'+
    '<button onclick="closeM();confirmReset()" style="width:100%;background:linear-gradient(180deg,rgba(160,40,40,.25),rgba(160,40,40,.05));border:1px solid #663333;color:#cc6666;font-size:12px;font-family:\'Cinzel\',serif;padding:7px;cursor:pointer;clip-path:polygon(5px 0,100% 0,calc(100% - 5px) 100%,0 100%)">💀 НАЧАТЬ ЗАНОВО</button>');
  const vsl=document.getElementById('vol-slider');
  const vlb=document.getElementById('vol-slider-label');
  if(vsl){vsl.addEventListener('input',()=>{
    const v=parseInt(vsl.value);
    vlb.textContent=v===0?'Выключен':v+'%';
    localStorage.setItem('kalguur_volume',(v/100).toFixed(2));
  });}
  const sl=document.getElementById('font-slider');
  const lb=document.getElementById('font-slider-label');
  if(sl){sl.addEventListener('input',()=>{
    const v=parseInt(sl.value);
    lb.textContent=v===0?'По умолчанию':(v>0?'+'+v:v)+' пт';
    applyFontOffset(v);
    localStorage.setItem('kalguur_fontOffset',v);
  });}
}

function applyFontOffset(offset){
  let st=document.getElementById('font-offset-style');
  if(!st){st=document.createElement('style');st.id='font-offset-style';document.head.appendChild(st);}
  if(offset===0){st.textContent='';return;}
  // Apply relative offset via CSS filter on root font sizes
  const rules=[];
  const base=[10,11,12,13,14,15,16,17,18,19,20,22,24,26];
  base.forEach(sz=>{
    const newSz=Math.max(8,Math.min(28,sz+offset));
    rules.push(`[style*="font-size:${sz}px"]{font-size:${newSz}px!important}`);
  });
  // Sprite icons (.spr-ico) intentionally NOT scaled — they have fixed px sizes
  st.textContent=rules.join('\n');
}

// Apply saved font offset on load
(function(){
  const saved=parseInt(localStorage.getItem('kalguur_fontOffset')||'0');
  if(saved!==0)applyFontOffset(saved);
})();

// ── Sprite upload handler ────────────────────────────────────
document.addEventListener('change', function(e){
  if(e.target && e.target.id === 'dbg-sprite-input'){
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = function(ev){
      const dataUrl = ev.target.result;
      try {
        localStorage.setItem('kalguur_sprites', dataUrl);
        window.SPRITE_B64 = dataUrl; setSpriteCSS(dataUrl);
        const st = document.getElementById('dbg-sprite-status');
        if(st) st.innerHTML = '✅ Загружено: <span style="color:var(--gold)">'+file.name+'</span>';
        showN('🖼 Спрайтшит загружен! Иконки обновлены.', 'grn');
        renderAll();
      } catch(err) {
        const st = document.getElementById('dbg-sprite-status');
        if(st) st.textContent = '❌ Ошибка: файл слишком большой для localStorage';
        showN('❌ Ошибка сохранения спрайтшита', 'red');
      }
    };
    reader.readAsDataURL(file);
  }
});