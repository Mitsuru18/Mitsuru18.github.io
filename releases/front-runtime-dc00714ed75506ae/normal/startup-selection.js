import {readGuardedMain,mainGuardKey} from './main-save-guard.js';
import {assertMainRuntimeState,resolveBattleRuntime,BATTLE_REVISIONS} from './battle-runtime-contract.js';
import {saveProfileFor} from './save-profile.js';
const stop=message=>{throw Object.assign(Error(message),{saveProtectionFailure:true,unsupportedBattleRuntime:true});};
// Only the existing strict readers run here. No migration, binding, recovery,
// reset, backup, write, engine import or reward is performed by the planner.
export function captureStartupPlan(storage,where){
 const key=saveProfileFor(where).key,guardKey=mainGuardKey(key),raw=storage.getItem(key),journal=storage.getItem(guardKey);
 const readonly=Object.freeze({getItem:k=>storage.getItem(k)}),committed=readGuardedMain(readonly,key);
 let revision=BATTLE_REVISIONS.CURRENT;
 if(committed!==null){let state;try{state=JSON.parse(committed);}catch{stop('保存記録を確認できないため、変更せず停止しました。');}assertMainRuntimeState(state);
  if(state.pendingResult?.battle)revision=resolveBattleRuntime(state.pendingResult.battle,'normal',{legacyEnvelope:'public-main-v70-v71'}).revision;
 }
 const plan=Object.freeze({key,guardKey,raw,journal,committed,revision});assertStartupPlanUnchanged(storage,plan);return plan;
}
export function assertStartupPlanUnchanged(storage,plan){
 if(storage.getItem(plan.key)!==plan.raw||storage.getItem(plan.guardKey)!==plan.journal)stop('読込中に記録が更新されました。記録を消さず再読込してください。');
 if(readGuardedMain(Object.freeze({getItem:k=>storage.getItem(k)}),plan.key)!==plan.committed)stop('読込中に保護記録が更新されました。記録を消さず再読込してください。');
 return true;
}
