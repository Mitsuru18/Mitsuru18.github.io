import {preflightMainRuntimeRaw} from './../battle-runtime-contract.js';
import {readGuardedMain,writeGuardedMain} from './../../../normal/main-save-guard.js';
// Main journey is authoritative. Reads never mutate it. Explicit event entry may
// initialize the existing future-only XP link under the main Web Lock; no XP is paid.
import {loadSave} from './../../../normal/main-runtime-progression.js';
import {validAbilities} from './../attributes.js';
export const MAIN_KEY='world-fighter-journey-v1';
export function mainKeyFor(location){const q=new URLSearchParams(location?.search??''),requested=q.get('main-scenario'),scenario=['reset','combat','clear','skills','newgame','legacy','expansion'].includes(requested)?requested:'skills';return q.get('wfj-qa')==='tournament'?MAIN_KEY+':isolated-qa-v18:'+scenario:MAIN_KEY;}
export function readMain(storage,key){
 const raw=readGuardedMain(storage,key);preflightMainRuntimeRaw(raw);
 if(raw===null)throw Error('本編のセーブがありません。本編でキャラを育成・保存してから戻ってください。');
 let input;try{input=JSON.parse(raw);}catch{throw Error('本編のセーブを読み込めません。元の記録は変更していません。');}
 const main=loadSave(raw);
 if(!main||!validAbilities(main.abilities)||!Array.isArray(input.known)||!input.known.every(x=>typeof x==='string')||!Array.isArray(input.equipped)||!input.equipped.every(x=>typeof x==='string'&&input.known.includes(x)))throw Error('本編のセーブを読み込めません。元の記録は変更していません。');
 if(!main.abilities.confirmed)throw Error('本編で最初の能力配分を確定してから戻ってください。');
 return {name:typeof input.name==='string'&&input.name.trim()?input.name:main.name,points:structuredClone(main.abilities.spent),earned:main.abilities.earned,baseLevel:main.abilities.level,experienceOffset:main.abilities.progress,equipped:[...main.equipped],known:[...main.known],style:main.fightStyle,appearance:structuredClone(main.appearance)};
}

import{tournamentRewardPreviews,tournamentEventStatus,tournamentGrowthQuote,purchaseTournamentGrowth}from'./../../../normal/tournament-growth.js';
export function readEvent(storage,key,source){const raw=readGuardedMain(storage,key);preflightMainRuntimeRaw(raw);const main=loadSave(raw);if(!main)throw Error('本編の大会開催情報を確認できません。本編へ戻って記録を確認してください。');return tournamentEventStatus(main,source);}
export function readRewards(storage,key,source){const raw=readGuardedMain(storage,key);preflightMainRuntimeRaw(raw);const main=loadSave(raw);return main?tournamentRewardPreviews(main,source):{};}

// Called only before a new event receipt, while holding the main Web Lock.
// Initialize before incrementing cup serial so the first event victory qualifies.
// Existing cups remain behind the baseline; existing links and XP are untouched.
export function initializeEventRewards(storage,key,source){
 const raw=readGuardedMain(storage,key);preflightMainRuntimeRaw(raw);const main=loadSave(raw);
 if(!main)throw Error('本編の記録を確認できないため大会参加を止めました。');
 if(main.tournamentGrowth.baseline!==null)return false;
 const quote=tournamentGrowthQuote(main,source);
 if(!quote.initialize||!quote.ok)throw Error('本編の試合結果と大会経験の記録を確認してから参加してください。');
 const result=purchaseTournamentGrowth(main,source,next=>writeGuardedMain(storage,key,raw,JSON.stringify({...JSON.parse(raw),tournamentGrowth:next.tournamentGrowth})));
 if(!result?.receipt.initialized)throw Error('大会経験の連携を保存できないため参加を止めました。');
 return true;
}
