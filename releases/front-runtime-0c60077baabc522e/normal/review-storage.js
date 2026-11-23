import {preflightMainRuntimeRaw} from './battle-runtime-contract.js';
import{readGuardedMain,writeGuardedMain,mainGuardKey}from'./main-save-guard.js';
/** Production retains its historical key; explicit QA is separately namespaced. */
import{ACTIVE_SAVE_KEY}from'./save-profile.js';
import{seedQaProfile}from'./qa-fixtures.js';
export const REVIEW_SAVE_KEY=ACTIVE_SAVE_KEY;
export const BACKUP_KEY=REVIEW_SAVE_KEY+':recoverable-backup';
export const MIGRATION_BACKUP_KEY=REVIEW_SAVE_KEY+':before-migration';
export const EXTENDED_GROWTH_BACKUP_KEY=REVIEW_SAVE_KEY+':before-country-growth-r1';
export const GROWTH_BACKUP_KEY=REVIEW_SAVE_KEY+':before-growth-v21';
export const LEVEL_BACKUP_KEY=REVIEW_SAVE_KEY+':before-levels-v30';
export const ABILITY_BACKUP_KEY=REVIEW_SAVE_KEY+':before-abilities-v24';
export const ROSTER_BACKUP_KEY=REVIEW_SAVE_KEY+':before-roster-v41';
export const VARIABLE_COURSE_BACKUP_KEY=REVIEW_SAVE_KEY+':before-variable-course-v42';
export const COURSE_BACKUP_KEY=REVIEW_SAVE_KEY+':before-street-course-v23';
export function backupRaw(storage,raw,key=BACKUP_KEY){preflightMainRuntimeRaw(raw);if(raw!==null&&raw!==undefined)try{storage.setItem(key,raw);}catch(e){e.saveProtectionFailure=true;throw e;}}
export function backupBeforeMigration(storage,raw){
 let previous;try{previous=JSON.parse(raw)}catch{}
 if(previous&&!previous.experience)try{if(storage.getItem(EXTENDED_GROWTH_BACKUP_KEY)===null){backupRaw(storage,raw,EXTENDED_GROWTH_BACKUP_KEY);if(storage.getItem(EXTENDED_GROWTH_BACKUP_KEY)!==raw)throw Error('成長仕様変更前のバックアップを確認できません。');}}catch(e){e.saveProtectionFailure=true;throw e;}
 if(previous&&previous.rosterRevision!==3)try{if(storage.getItem(VARIABLE_COURSE_BACKUP_KEY)===null)backupRaw(storage,raw,VARIABLE_COURSE_BACKUP_KEY);}catch(e){e.saveProtectionFailure=true;throw e;}
 if(previous&&previous.rosterRevision!==2)try{if(storage.getItem(ROSTER_BACKUP_KEY)===null)backupRaw(storage,raw,ROSTER_BACKUP_KEY);}catch(e){e.saveProtectionFailure=true;throw e;}
 if(previous&&previous.abilities?.rule!==2)try{if(storage.getItem(LEVEL_BACKUP_KEY)===null)backupRaw(storage,raw,LEVEL_BACKUP_KEY);}catch(e){e.saveProtectionFailure=true;throw e;}
 if(previous&&!previous.abilities)try{if(storage.getItem(ABILITY_BACKUP_KEY)===null)backupRaw(storage,raw,ABILITY_BACKUP_KEY);}catch(e){e.saveProtectionFailure=true;throw e;}
 if(previous&&previous.growth?.rule!==2)try{if(storage.getItem(GROWTH_BACKUP_KEY)===null)backupRaw(storage,raw,GROWTH_BACKUP_KEY);}catch(e){e.saveProtectionFailure=true;throw e;}
 if(previous&&previous.courseRevision!==2)try{if(storage.getItem(COURSE_BACKUP_KEY)===null)backupRaw(storage,raw,COURSE_BACKUP_KEY);}catch(e){e.saveProtectionFailure=true;throw e;}
 backupRaw(storage,raw,MIGRATION_BACKUP_KEY);
}
export function resetReviewStorage(storage){
 const raw=readGuardedMain(storage,REVIEW_SAVE_KEY);backupRaw(storage,raw);if(raw!==null&&storage.getItem(BACKUP_KEY)!==raw)throw Error('Reset backup was not confirmed');
 writeGuardedMain(storage,REVIEW_SAVE_KEY,raw,null);
 if(storage.getItem(REVIEW_SAVE_KEY)!==null)throw Error('保存した記録を初期化できませんでした。');
 return true;
}
export function prepareStoredReview(storage){preflightMainRuntimeRaw(readGuardedMain(storage,REVIEW_SAVE_KEY));seedQaProfile(storage);let raw=readGuardedMain(storage,REVIEW_SAVE_KEY);if(raw!==null&&!storage.getItem(BACKUP_KEY))backupRaw(storage,raw);return raw;}
