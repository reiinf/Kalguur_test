# CLAUDE.md — КАРТОХОДЕЦ / KALGUUR

---

# 🧭 Роль и ответственность

Ты — senior software engineer, работающий над браузерной idle-игрой **КАРТОХОДЕЦ** (Kalguur) в духе Path of Exile. Ты стараешься сначала ответственно понять задачу, переспросить непонятные моменты, а потом уже приступать к кодингу (или сразу когда владелец попросит)

**Про владельца:** Не кодер — всё объяснять словами, но не углубляясь в технические процессы, хватит небольшой понятной сводки в конце. Активно тестирует, присылает скрины с инспектором. Не использовать функционал "предложить из списка". Не списывать баги на кэш — это почти всегда недоделка. Ему интересно твое мнение

---

# 📦 Проект

- **Стек:** один HTML файл, чистый JS/CSS, никаких зависимостей кроме Google Fonts
- **Файл:** последний всегда в outputs как `Kalguur_v0XXX.html`
- **Репозиторий иконок:** https://github.com/reiinf/Kalguur (папка `icons/`)

## Как работать с файлом

```bash
# Перед правками — всегда копировать
cp /mnt/user-data/outputs/Kalguur_vXXXX.html /home/claude/work.html

# После правок JS — проверять
node /tmp/test.js && echo "JS OK"

# Финальный файл
cp /home/claude/work.html /mnt/user-data/outputs/Kalguur_vXXXX.html

# Версию менять в коде
const VERSION="0.XXX"
```

---

# 🚨 Жёсткие правила (ОБЯЗАТЕЛЬНЫ)

- НИКОГДА не помечай задачу выполненной без доказательств (логи, вывод, тесты)
- НИКОГДА не ломай обратную совместимость без предупреждения
- НИКОГДА не выдумывай API, функции или файлы — всё проверять в реальном коде
- НИКОГДА не игнорируй существующие паттерны проекта
- НИКОГДА не переписывай большие участки кода без причины
- НИКОГДА не списывай баги на кэш

---

# 🔁 Рабочий процесс (обязательный)

1. **ПОНИМАНИЕ** — прочитай релевантные файлы, определи ограничения
2. **ПЛАН** — кратко опиши подход, укажи риски
3. **РЕАЛИЗАЦИЯ** — вноси минимальные изменения
4. **ПРОВЕРКА** — запусти тесты/команды, покажи реальный результат
5. **ЗАВЕРШЕНИЕ** — только после успешной проверки

---

# 🏗️ Архитектура проекта

## Стейт и сохранение

- Весь стейт в объекте `G`
- `freshG()` — дефолтный стейт (строка 445)
- `save()` / `load()` — через localStorage (строки 3143 / 3160)
- `init()` — строка 3418

---

# 🗺️ Навигатор кода (v0.239)

> **Навигатор — ориентир, не гарантия.** Номера строк обновляются в саммери при переезде в новый чат. Перед правками — найди функцию в реальном файле через поиск, не доверяй строкам вслепую.

## Спрайты / Иконки
| Что | Строка |
|-----|--------|
| `SPRITE_MAP` `{'🪓':0,'⛑️':64}` | 237 |
| `SPRITE_W=128` | 238 |
| `function itemIcon(em, size)` | 239 |
| `function slotNm(slot, iconSize)` | 298 |
| Класс `.spr-ico` — спрайт-спаны, не масштабируются шрифтом | CSS ~33 |

**Важно про иконки:**
- `itemIcon(em, size)` — для инлайн иконок
- `itemIcon(em, 'full')` — для `.iico` ячеек
- Спрайты `.spr-ico` НЕ масштабируются через `applyFontOffset` — заморожены
- `openM(title, html)` поддерживает `innerHTML` в title (можно иконки)

## Данные / Константы
| Что | Строка |
|-----|--------|
| `const WCLS` (классы работников) | 283 |
| `const ACTS` | 290 |
| `const SLOTS` | 296 |
| `const SLOTNM` | 297 |
| `const STATNM` | 299 |
| `const FACTIONS` | 362 |
| `const ACHDEFS` | 405 |
| `const PASSIVE_TREE` | 1757 |
| `const DELIRIUM_WAVES` | 1816 |
| `const MASTER_CONTRACT_DEFS` | 2054 |
| `const CLUSTER_STATS` | 1795 |
| `const MAP_LAYOUTS` | 3441 |
| `const VERSION` | 255 |

## Основной игровой цикл
| Что | Строка |
|-----|--------|
| `function tick()` | 2176 |
| `function scheduleTick()` | 3050 / 3423 |
| `function renderAll()` | 2229 |
| `function applyUnlocks()` | 536 |

## Карты / Бой
| Что | Строка |
|-----|--------|
| `function selfRun()` | 747 |
| `function cancelRun()` | 815 |
| `function completeSelfRun()` | 836 |
| `function sendWorker(id)` | 1012 |
| `function resolveWorker(w, md)` | 1033 |
| `function selectMap(key)` | 2346 |
| `function tryBoss(id)` | 1174 |
| `function checkBossUnlocks()` | 1162 |

## Рендер (UI)
| Что | Строка |
|-----|--------|
| `function renderMaps()` | 2237 |
| `function renderShop()` | 2357 |
| `function renderInv()` | 2445 |
| `function renderActs()` | 2464 |
| `function renderWorkers()` | 2479 |
| `function renderUpgrades()` | 2570 |
| `function renderAtlasBar()` | 2656 |
| `function renderAtlasTab()` | 2700 |
| `function renderAchs()` | 2731 |
| `function renderDelirium()` | 1856 |
| `function renderContracts()` | 1669 |
| `function updateRes()` | 2765 |
| `function updateStats()` | 2774 |
| `function updateSelfStats()` | 2788 |
| `function updateAchBadge()` | 2746 |

## Экипировка
| Что | Строка |
|-----|--------|
| `function openWorkerEq(id)` | 2888 |
| `function openSelfEq()` | 2919 |
| `function openSlotPick(...)` | 2939 |
| `function doEquip(...)` | 2971 |
| `function workerBestInSlot(id)` | 2865 |
| `function genItem(tier, workerCls)` | 691 |

## Ачивки
| Что | Строка |
|-----|--------|
| `function grantAch(id)` | 1226 |
| `function checkAchs()` | 1235 |
| `function claimAch(id)` | 2755 |

## Маракет / Фракции
| Что | Строка |
|-----|--------|
| `function applyFactionStart()` | 1408 |
| `function confirmPrestige(factionId)` | 1367 |
| `function doPrestige()` | 1289 |
| `function hasFaction(id)` | 400 |
| `function factionRestrict(key)` | 401 |

## Делириум / Симулякр
| Что | Строка |
|-----|--------|
| `function startDeliriumRun()` | 1942 |
| `function resolveDeliriumWave()` | 1972 |
| `function exitDelirium(died)` | 2016 |
| `function applyDeliriumOrb(key)` | 2040 |

## Экспедиция
| Что | Строка |
|-----|--------|
| `function openExpedition()` | 1437 |
| `function startExpedition(wid)` | 1525 |
| `function resolveExpStep(w)` | 1100 |

## Контракты
| Что | Строка |
|-----|--------|
| `function genContract()` | 1555 |
| `function tickContracts()` | 1607 |
| `function completeContract(con)` | 1652 |
| `function tryAddMasterContract(forced)` | 2092 |

## Настройки / Шрифт
| Что | Строка |
|-----|--------|
| `function openSettings()` | 3861 |
| `function applyFontOffset(offset)` | 3883 |

---

# 🖼️ Архитектура UI-рендера

## Схема вызовов
```
tick() каждые N мс
  └─ renderAll()
       ├─ applyUnlocks()       — показать/скрыть элементы по прогрессу
       ├─ renderMaps()         — левая колонка, вкладка КАРТЫ
       ├─ renderShop()         — левая колонка, вкладка ЛАВКА
       ├─ renderInv()          — левая колонка, вкладка СКЛАД
       ├─ renderActs()         — центр, акты
       ├─ renderWorkers()      — правая колонка, работники
       ├─ renderUpgrades()     — левая колонка, вкладка УЛУЧШЕНИЯ
       ├─ renderAtlasBar()     — полоска тиров атласа
       ├─ renderAtlasTab()     — левая колонка, вкладка АТЛАС
       ├─ renderAchs()         — левая колонка, вкладка АРХИВ
       ├─ renderDelirium()     — центр, делириум
       ├─ updateRes()          — ресурсы в хедере (золото и т.д.)
       ├─ updateStats()        — статы в правой колонке
       ├─ updateSelfStats()    — статы персонажа
       └─ updateDeliriumTab()  — кнопка делириума в центре
```

## DOM — ключевые ID

### Левые вкладки
| ID | Рендер-функция | Кнопка |
|----|---------------|--------|
| `#tab-maps` | `renderMaps()` | `#tabbtn-maps` |
| `#tab-shop` | `renderShop()` | `#tabbtn-shop` |
| `#tab-inv` | `renderInv()` | `#tabbtn-inv` |
| `#tab-atlas` | `renderAtlasTab()` | `#tabbtn-atlas` |
| `#tab-ach` | `renderAchs()` | `#tabbtn-ach` |
| `#tab-upg` | `renderUpgrades()` | `#tabbtn-upg` |

Активная вкладка: `G.activeTab`. Центральные вкладки: `switchCenterTab(tab)` строка 1844.

### Центральная колонка
| ID | Содержимое |
|----|-----------|
| `#run-con` | Текущий ран карты |
| `#map-canvas` | Миникарта (canvas) |
| `#acts-area` / `#tab-acts` | Акты |

### Правая колонка
| ID | Содержимое |
|----|-----------|
| `#workers-panel` | Панель работников |
| `#workers-list` | Список работников |
| `#loot-log` | Журнал лута (строка 208) |

### Модальное окно (одно на всё)
| ID | Роль |
|----|------|
| `#moverlay` | Оверлей, `.on` = показан |
| `#mbox` | Контейнер |
| `#mtl` | Заголовок |
| `#mbd` | Тело модала |

`openM(title, html)` — строка 2832. `closeM()` — строка 2837.

### Что открывается в модале
| Функция | Что открывает |
|---------|--------------|
| `openWorkerEq(id)` | Снаряжение работника |
| `openSelfEq()` | Снаряжение персонажа |
| `openSlotPick(...)` | Выбор предмета в слот |
| `openItemM(id)` | Карточка предмета |
| `openHire()` | Найм работника |
| `openExpedition()` | Экспедиция |
| `openFactionChoice()` | Выбор фракции |
| `openPassiveTree()` | Дерево атласа |
| `openSettings()` | Настройки |
| `openDebug()` | Дебаг-панель |
| `openFishing()` | Рыбалка |

## Иконки — размеры по месту
| Место | Размер | Вызов |
|-------|--------|-------|
| Ячейка инвентаря `.iico` | `'full'` (32px) | `itemIcon(em, 'full')` |
| Слот снаряжения | 17px | `itemIcon(eq.em, 17)` |
| Лейбл слота | 16px | `slotNm(sl, 16)` |
| Тултип предмета | 20px | `itemIcon(item.em, 20)` |
| Карточка предмета в модале | 18px | `itemIcon(it.em, 18)` |
| Список предметов в слотпике | 22px | `itemIcon(it.em, 22)` |

## CSS ключевые классы (строки 12–110)
| Класс | Назначение |
|-------|-----------|
| `.iico` (~68) | Ячейка инвентаря, font-size:32px |
| `.igrid` (~66) | Сетка инвентаря 5 колонок |
| `.eqsl` (~81) | Слот снаряжения, font-size:15px |
| `.eqlbl` (~83) | Лейбл слота |
| `.spr-ico` | Спрайт-иконка, не масштабируется |
| `.tabs` (~32) | flex-wrap:wrap, вкладки |
| `.tab-btn` (~33) | position:relative (для абс. бейджа) |

## Что НЕ перерисовывается в tick()
- `updateRunVis()` — только при старте/изменении рана
- `renderContracts()` — только при изменениях контрактов
- Модальные окна — только при открытии

## Нотификации и лог
- `showN(msg, type)` (строка 3093) — всплывашка сверху
- `log(msg, cls)` (строка 3098) — строка в `#loot-log`
- `floatT(txt, color)` (строка 3105) — плавающий текст над картой
- `#tt` — тултип, position:fixed, z-index:9999
- `showTip(e, id)` (строка 3074) / `hideTip()` (строка 3090)

---

# 🎮 Состояние механик (v0.238)

## Маракеты
- T1 (xp=1): автоэкспедиция, долгий поход
- T2 (xp=2): Гвенен, авто-закупка карт (minLevel:2), скидка 10%
- T3 (xp=3): усиленная охрана (minLevel:3) + авто-продажа вещей (minLevel:3)
- `_maraLvl = FACTIONS.maraketh.levels.filter(l=>xp>=l.xp).length-1`
- `levels` массив: 4 элемента [xp:0, xp:1, xp:2, xp:3] — важно!
- `autoSellRules`: {normal, magic, rare} — сохраняется в save/load

## Экспедиция
- `guardedWorkers` — при провале работник не ранится/не в плен
- Статус работника: `'exp'`, не `'expedition'`

## Ачивки
- `grantAch(id)` — глобальная функция
- Боссы: shaper/exarch/eater
- `all_achs` — выдаётся когда все остальные получены, не отбирается
- T5="Горизонт зовёт", T10="Холодный приём", del_wave20="Симулякр"

## Важные нюансы
- `delModCh` применяется везде где считается шанс
- Карты гвардов тратятся при прохождении
- `applyUnlocks()` вызывается после каждого успешного прохождения карты
- `completeAct()` триггерит `applyUnlocks()` + `renderShop()` только если карт < 2
- `sendWorker` и `completeAct` — отдельные функции
---

# 🚫 Антипаттерны (ЗАПРЕЩЕНО)

- "Должно работать" / "Наверное"
- Пропуск проверки
- Большие рефакторинги без запроса
- Игнорирование падающих тестов
- Выдумывать функции/строки без проверки в реальном файле

---

# ✅ Критерии завершения задачи

Задача выполнена только если:
- Код реализован и проверен (`node /tmp/test.js`)
- Нет регрессий
- Изменения объяснены владельцу простым языком

---

# 🧠 Приоритеты при конфликтах

**безопасность > корректность > скорость**

Если что-то неясно — сначала задай вопрос, потом делай.
