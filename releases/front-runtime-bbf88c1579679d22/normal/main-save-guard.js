import {preflightMainRuntimeRaw} from './battle-runtime-contract.js';
// The historical main key stays in place. A verified recovery journal protects
// its last committed state from pre-upgrade tabs which cannot honor new locks.
// Caller holds world-fighter-main:<key> for mutations. No clock-based ordering.
export const mainGuardKey=key=>key+':growth-save-guard-r1';
const rawValue=x=>x===null||typeof x==='string';
const failure=(message,invalidSaveGuard=false)=>Object.assign(Error(message),{saveProtectionFailure:true,invalidSaveGuard});
function readRecord(storage,key){const text=storage.getItem(mainGuardKey(key));if(text===null)return null;let r;try{r=JSON.parse(text);}catch{throw failure('Invalid save protection journal',true);}if(!r||![1,2].includes(r.rule)||!Number.isSafeInteger(r.revision)||r.revision<0||!rawValue(r.committed)||!rawValue(r.previous)||!Array.isArray(r.forks)||!r.forks.every(f=>f&&rawValue(f.raw)&&typeof f.reason==='string')||(r.pending!==null&&(!r.pending||!rawValue(r.pending.next))))throw failure('Invalid save protection journal',true);preflightMainRuntimeRaw(r.committed);if(r.pending)preflightMainRuntimeRaw(r.pending.next);return r;}
function writeRecord(storage,key,r){if(!Number.isSafeInteger(r.revision)||r.revision<0)throw failure('Save protection revision overflow');const text=JSON.stringify(r);try{storage.setItem(mainGuardKey(key),text);}catch(e){if(storage.getItem(mainGuardKey(key))!==text)throw Object.assign(e,{saveProtectionFailure:true});}if(storage.getItem(mainGuardKey(key))!==text)throw failure('Save protection journal was not stored');return r;}
function writeMain(storage,key,raw){if(raw===null)storage.removeItem(key);else storage.setItem(key,raw);if(storage.getItem(key)!==raw)throw failure('Main save write was not confirmed');}
function fork(r,raw,reason){if(raw===r.committed||r.forks.some(f=>f.raw===raw))return false;r.forks.push({raw,reason});return true;}
// Read-only: tournament reads never repair/write the main key or journal.
export function readGuardedMain(storage,key){preflightMainRuntimeRaw(storage.getItem(key));const r=readRecord(storage,key);return r?r.committed:storage.getItem(key);}
export function mainGuardStatus(storage,key){const r=readRecord(storage,key);return r?structuredClone(r):null;}
export function preserveIncomingMain(storage,key,raw){if(!rawValue(raw))throw failure('Invalid incoming raw save');preflightMainRuntimeRaw(raw);preflightMainRuntimeRaw(storage.getItem(key));const r=readRecord(storage,key);if(!r||raw===r.committed||raw===r.previous||raw===r.pending?.next)return false;const next=structuredClone(r);if(!fork(next,raw,'older-tab-event'))return false;next.revision++;writeRecord(storage,key,next);return true;}
// Recovery never awards an interrupted proposal. Both it and a different old
// tab's raw branch are retained before replacing the shared key.
export function recoverGuardedMain(storage,key){preflightMainRuntimeRaw(storage.getItem(key));let r=readRecord(storage,key);if(!r)return storage.getItem(key);const current=storage.getItem(key),next=structuredClone(r);let changed=false;if(next.pending){changed=fork(next,next.pending.next,'interrupted-proposal')||changed;next.pending=null;changed=true;}if(current!==next.committed){fork(next,current,'older-tab-write');changed=true;}if(changed){next.revision++;r=writeRecord(storage,key,next);}if(current!==r.committed)writeMain(storage,key,r.committed);return r.committed;}
export function writeGuardedMain(storage,key,expected,nextRaw){if(!rawValue(expected)||!rawValue(nextRaw))throw failure('Invalid raw save');preflightMainRuntimeRaw(expected);preflightMainRuntimeRaw(nextRaw);preflightMainRuntimeRaw(storage.getItem(key));let r=readRecord(storage,key);if(!r){if(storage.getItem(key)!==expected)throw Object.assign(Error('Stale main save'),{staleSave:true});r=writeRecord(storage,key,{rule:2,revision:0,committed:expected,previous:null,pending:null,forks:[]});}if(r.committed!==expected)throw Object.assign(Error('Stale protected main save'),{staleSave:true});if(r.rule===1)r=writeRecord(storage,key,{...r,rule:2,revision:r.revision+1});recoverGuardedMain(storage,key);r=readRecord(storage,key);if(r.committed!==expected)throw Object.assign(Error('Stale protected main save'),{staleSave:true});if(nextRaw===r.committed)return true;
 const prepared={...r,revision:r.revision+1,pending:{next:nextRaw}};writeRecord(storage,key,prepared);
 try{writeMain(storage,key,nextRaw);writeRecord(storage,key,{...prepared,revision:prepared.revision+1,previous:r.committed,committed:nextRaw,pending:null});return true;}catch(e){
  // Do not erase a distinct old-tab branch. An interrupted proposal remains in
  // the durable journal and is quarantined on recovery, never paid on reload.
  try{const latest=readRecord(storage,key);if(latest?.committed===r.committed&&storage.getItem(key)===nextRaw)writeMain(storage,key,r.committed);}catch{}
  throw Object.assign(e,{saveProtectionFailure:true});
 }
}
