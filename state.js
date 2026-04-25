// ══════════════════════════════════════════════════════════════
// state.js — игровое состояние
// Зависимости: нет (чистый модуль)
// ══════════════════════════════════════════════════════════════

function freshG(){
  return {gold:50,totalRuns:0,maps:{1:5,2:2},inv:[],workers:[],
    ups:{slots:0,rescue:0,heal:0},
    selfEq:{weapon:null,weapon2:null,armor:null,helmet:null,ring:null,cluster:null,cluster2:null},
    selfRun:null,actRun:null,selMap:null,maxTier:2,
    cleared:{},achs:{},prestige:0,firstRun:true,activeTab:'maps',
    unlocks:{gold:false,maps:false,items:false,workers:false,runs:false,pres:false},
    prestigeBonus:0,passives:{},passivePending:0,
    guardianPieces:{shaper:0,elder:0},bossAttempts:{},bossKills:{},
    bossTriesLeft:0,activeBossId:null,t16RunsSinceBoss:0,pendingBoss:null,
    voidstones:{shaper:false,exarch:false,eater:false},
    selfCls:null,selfXp:0,selfLevel:0,selfPendingLevel:0,selfLevelUp:false,clsLocked:false,
    stats:{ge:0,fi:0,mr:0,ar:0,sold:0,sg:0,cap:0,inj:0,tierRuns:{}},achsPending:{},
    gt:0,iid:0,wid:0,faction:'none',
    factionXp:{syndicate:0,maraketh:0,legacy:0},factionUnlocks:{},
    autoExp:false,autoRescue:false,autoHeal:false,autoBuyMaps:false,
    syndRunSpeed:1.0,contracts:[],contractRunsDone:0,
    legacyPerks:[],legacyContracts:false,
    deliriumOrbs:0,deliriumSplinters:0,deliriumActive:false,
    deliriumWave:0,deliriumPending:[],deliriumRunning:false,
    autoOrb:false,contractRerolls:0,
    delve:{depth:0,sulphite:0,sulphiteCap:5000,azurite:0,
      upgrades:{armor:0,blast:0,speed:0,storage:0,pump:0,lantern:0},
      running:false,runDepth:0,locationType:null,grid:null},
    playTime:0,syndBladeGiven:false};
}

let G = freshG();