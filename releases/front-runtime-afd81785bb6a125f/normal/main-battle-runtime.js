import * as current from './engine.js';
import * as currentPaint from './renderer.js';
import {BATTLE_REVISIONS,resolveBattleRuntime,stampBattleRuntime,UnsupportedBattleRuntime} from './battle-runtime-contract.js';
export * from './engine.js';
export {BATTLE_REVISIONS} from './battle-runtime-contract.js';
const currentPair={engine:current,paint:currentPaint},pairs=new Map(),loads=new Map();
export function runtimeFor(b){return resolveBattleRuntime(b,'normal').revision;}
const loadPublic=()=>Promise.all([import('./runtime/public-normal/engine.js'),import('./runtime/public-normal/renderer.js')]);
const loadV73=()=>Promise.all([import('./runtime/front-v73-normal/engine.js'),import('./runtime/front-v73-normal/renderer.js')]);
const loadV74=()=>Promise.all([import('./runtime/jump-v74-normal/engine.js'),import('./runtime/jump-v74-normal/renderer.js')]);
const loadV75=()=>Promise.all([import('./runtime/axe-v75-normal/engine.js'),import('./runtime/axe-v75-normal/renderer.js')]);
const loadV76=()=>Promise.all([import('./runtime/backfist-v76-normal/engine.js'),import('./runtime/backfist-v76-normal/renderer.js')]);
const loadV85=()=>Promise.all([import('./runtime/sweep-v85-normal/engine.js'),import('./runtime/sweep-v85-normal/renderer.js')]);
const loadV86=()=>Promise.all([import('./runtime/dutch-v86-normal/engine.js'),import('./runtime/dutch-v86-normal/renderer.js')]);
const loadV87=()=>Promise.all([import('./runtime/dutch-forward-v87-normal/engine.js'),import('./runtime/dutch-forward-v87-normal/renderer.js')]);
const loadV91=()=>Promise.all([import('./runtime/frozen-v91-normal/engine.js'),import('./runtime/frozen-v91-normal/renderer.js')]);
const loadV92=()=>Promise.all([import('./runtime/frozen-v92-normal/engine.js'),import('./runtime/frozen-v92-normal/renderer.js')]);
const loadV93=()=>Promise.all([import('./runtime/frozen-v93-normal/engine.js'),import('./runtime/frozen-v93-normal/renderer.js')]);
const loadV94=()=>Promise.all([import('./runtime/frozen-v94-normal/engine.js'),import('./runtime/frozen-v94-normal/renderer.js')]);
const loadV96=()=>Promise.all([import('./runtime/frozen-v96-normal/engine.js'),import('./runtime/frozen-v96-normal/renderer.js')]);
export async function ensureBattleRuntime(b){if(!b)return;const r=runtimeFor(b);if(r===BATTLE_REVISIONS.CURRENT||pairs.has(r))return;if(!loads.has(r))loads.set(r,(r===BATTLE_REVISIONS.PUBLIC?loadPublic():r===BATTLE_REVISIONS.V73?loadV73():r===BATTLE_REVISIONS.V74?loadV74():r===BATTLE_REVISIONS.V75?loadV75():r===BATTLE_REVISIONS.V76?loadV76():r===BATTLE_REVISIONS.V85?loadV85():r===BATTLE_REVISIONS.V86?loadV86():r===BATTLE_REVISIONS.V87?loadV87():r===BATTLE_REVISIONS.V91?loadV91():r===BATTLE_REVISIONS.V92?loadV92():r===BATTLE_REVISIONS.V93?loadV93():r===BATTLE_REVISIONS.V94?loadV94():loadV96()).then(([engine,paint])=>{pairs.set(r,{engine,paint});}).catch(cause=>{loads.delete(r);const e=new UnsupportedBattleRuntime('旧公開試合の一式を準備できません。');e.runtimeLoadFailure=true;e.cause=cause;throw e;}));await loads.get(r);}
export function isBattleRuntimeReady(b){return !b||runtimeFor(b)===BATTLE_REVISIONS.CURRENT||pairs.has(runtimeFor(b));}
const pair=b=>{const r=runtimeFor(b);if(r===BATTLE_REVISIONS.CURRENT)return currentPair;if(!pairs.has(r)){const e=new UnsupportedBattleRuntime('旧公開試合の実装が未読込です。');e.runtimeNotLoaded=true;throw e;}return pairs.get(r);};
export function createBattle(options){return stampBattleRuntime(current.createBattle(options),'normal');}
export function stepBattle(b,...a){return pair(b).engine.stepBattle(b,...a);}
export function finishBattle(b,...a){return pair(b).engine.finishBattle(b,...a);}
export function acceptedContact(att,def,time,b){return pair(b).engine.acceptedContact(att,def,time,b);}
export function currentTechnique(f,tick,b){return (b?pair(b).engine:current).currentTechnique(f,tick);}
export function postureState(f,b){return (b?pair(b).engine:current).postureState(f);}
export function staminaStatus(f,b){return (b?pair(b).engine:current).staminaStatus(f);}
export function techniqueFor(b,id){return pair(b).engine.TECHNIQUES.find(t=>t.id===id);}
export function drawArena(canvas,b,...a){if(!b)return currentPaint.drawArena(canvas,b,...a);const selected=pair(b);return selected.paint.drawArena(canvas,a[2]?.runtimeBackgroundOnly?{...b,fighters:[],events:[],done:false}:b,...a);}
export function resultPresentationDuration(b,...a){return pair(b).paint.resultPresentationDuration(b,...a);}
export function advanceResultPresentation(b,...a){return pair(b).paint.advanceResultPresentation(b,...a);}
export function presentationFighter(f,b,...a){return pair(b).paint.presentationFighter(f,b,...a);}
export function breathingEligible(f,b,...a){return pair(b).paint.breathingEligible(f,b,...a);}
