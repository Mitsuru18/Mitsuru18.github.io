import * as current from './engine.js';
import * as currentPaint from './renderer.js';
import {BATTLE_REVISIONS,resolveBattleRuntime,stampBattleRuntime,UnsupportedBattleRuntime} from './battle-runtime-contract.js';
export * from './engine.js';
export {BATTLE_REVISIONS} from './battle-runtime-contract.js';
const currentPair={engine:current,paint:currentPaint},pairs=new Map(),loads=new Map();
export function runtimeFor(b){return resolveBattleRuntime(b,'tournament').revision;}
const loadPublic=()=>Promise.all([import('./../public-v71/engine.js'),import('./../public-v71/renderer.js')]);
const loadV73=()=>Promise.all([import('./../front-v73/engine.js'),import('./../front-v73/renderer.js')]);
const loadV74=()=>Promise.all([import('./../jump-v74/engine.js'),import('./../jump-v74/renderer.js')]);
const loadV75=()=>Promise.all([import('./../axe-v75/engine.js'),import('./../axe-v75/renderer.js')]);
const loadV76=()=>Promise.all([import('./../backfist-v76/engine.js'),import('./../backfist-v76/renderer.js')]);
const loadV85=()=>Promise.all([import('./../sweep-v85/engine.js'),import('./../sweep-v85/renderer.js')]);
const loadV86=()=>Promise.all([import('./../dutch-v86/engine.js'),import('./../dutch-v86/renderer.js')]);
const loadV87=()=>Promise.all([import('./../dutch-forward-v87/engine.js'),import('./../dutch-forward-v87/renderer.js')]);
const loadV91=()=>Promise.all([import('./../frozen-v91/engine.js'),import('./../frozen-v91/renderer.js')]);
const loadV92=()=>Promise.all([import('./../frozen-v92/engine.js'),import('./../frozen-v92/renderer.js')]);
const loadV93=()=>Promise.all([import('./../frozen-v93/engine.js'),import('./../frozen-v93/renderer.js')]);
const loadV94=()=>Promise.all([import('./../frozen-v94/engine.js'),import('./../frozen-v94/renderer.js')]);
const loadV96=()=>Promise.all([import('./../frozen-v96/engine.js'),import('./../frozen-v96/renderer.js')]);
const loadV97=()=>Promise.all([import('./../frozen-v97/engine.js'),import('./../frozen-v97/renderer.js')]);
export async function ensureBattleRuntime(b){if(!b)return;const r=runtimeFor(b);if(r===BATTLE_REVISIONS.CURRENT||pairs.has(r))return;if(!loads.has(r))loads.set(r,(r===BATTLE_REVISIONS.PUBLIC?loadPublic():r===BATTLE_REVISIONS.V73?loadV73():r===BATTLE_REVISIONS.V74?loadV74():r===BATTLE_REVISIONS.V75?loadV75():r===BATTLE_REVISIONS.V76?loadV76():r===BATTLE_REVISIONS.V85?loadV85():r===BATTLE_REVISIONS.V86?loadV86():r===BATTLE_REVISIONS.V87?loadV87():r===BATTLE_REVISIONS.V91?loadV91():r===BATTLE_REVISIONS.V92?loadV92():r===BATTLE_REVISIONS.V93?loadV93():r===BATTLE_REVISIONS.V94?loadV94():r===BATTLE_REVISIONS.V96?loadV96():loadV97()).then(([engine,paint])=>{pairs.set(r,{engine,paint});}).catch(cause=>{loads.delete(r);const e=new UnsupportedBattleRuntime('旧公開試合の一式を準備できません。');e.runtimeLoadFailure=true;e.cause=cause;throw e;}));await loads.get(r);}
export function isBattleRuntimeReady(b){return !b||runtimeFor(b)===BATTLE_REVISIONS.CURRENT||pairs.has(runtimeFor(b));}
const pair=b=>{const r=runtimeFor(b);if(r===BATTLE_REVISIONS.CURRENT)return currentPair;if(!pairs.has(r)){const e=new UnsupportedBattleRuntime('旧公開試合の実装が未読込です。');e.runtimeNotLoaded=true;throw e;}return pairs.get(r);};
export function createBattle(options){return stampBattleRuntime(current.createBattle(options),'tournament');}
export function stepBattle(b,...a){return pair(b).engine.stepBattle(b,...a);}
export function finishBattle(b,...a){return pair(b).engine.finishBattle(b,...a);}
export function acceptedContact(att,def,time,b){return pair(b).engine.acceptedContact(att,def,time,b);}
export function currentTechnique(f,tick,b){return (b?pair(b).engine:current).currentTechnique(f,tick);}
export function postureState(f,b){return (b?pair(b).engine:current).postureState(f);}
export function staminaStatus(f,b){return (b?pair(b).engine:current).staminaStatus(f);}
export function techniqueFor(b,id){return pair(b).engine.TECHNIQUES.find(t=>t.id===id);}
export function drawArena(canvas,b,...a){return pair(b).paint.drawArena(canvas,b,...a);}
export function resultPresentationDuration(b,...a){return pair(b).paint.resultPresentationDuration(b,...a);}
export function advanceResultPresentation(b,...a){return pair(b).paint.advanceResultPresentation(b,...a);}
export function presentationFighter(f,b,...a){return pair(b).paint.presentationFighter(f,b,...a);}
export function breathingEligible(f,b,...a){return pair(b).paint.breathingEligible(f,b,...a);}
