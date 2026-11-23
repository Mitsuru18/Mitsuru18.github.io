import {assertCupRuntimeState} from './../battle-runtime-contract.js';
import {ensureBattleRuntime} from './../tournament-battle-runtime.js';
import * as M from './tournament-model.js';
import {readMain,readRewards,readEvent,initializeEventRewards} from './main-link.js';
export class TournamentStore {
 constructor(storage,mainKey,locks){this.storage=storage;this.mainKey=mainKey;this.locks=locks;this.raw=storage.getItem(M.SAVE_KEY);this.legacyRaw=this.raw===null?storage.getItem(M.LEGACY_SAVE_KEY):null;const source=this.raw??this.legacyRaw;this.state=source===null?M.fresh():M.load(source);if(!this.state)throw Error('大会セーブが壊れているため書き込みを止めました。記録はそのまま保持しています。');}
 event(source=this.state){return readEvent(this.storage,this.mainKey,source);}
 async enterEvent(){
  if(!this.locks?.request)throw Error('安全に保存できないため大会に参加できません。');
  // Lock the main clock as well as the tournament receipt so stale tabs cannot
  // enter after the third normal fight or spend the same occurrence twice.
  return this.locks.request('world-fighter-main:'+this.mainKey,()=>this.transact(n=>{const event=this.event(n);if(event.status!=='open')return false;initializeEventRewards(this.storage,this.mainKey,n);return M.enterEvent(n,event);},{syncMain:true}));
 }
 rewards(){return readRewards(this.storage,this.mainKey,this.state);}
 main(){return readMain(this.storage,this.mainKey);}
 refresh(){const raw=this.storage.getItem(M.SAVE_KEY);if(raw===this.raw)return false;const state=raw===null?null:M.load(raw);if(!state)throw Error('別タブで大会記録が変更・削除されました。この画面を再読み込みしてください。');this.raw=raw;this.state=state;return true;}
 async transact(fn,{syncMain=false}={}){
  if(!this.locks?.request)throw Error('安全に保存するため、このブラウザーでは大会を進められません。Web Locks対応ブラウザーで開いてください。');
  return this.locks.request(M.SAVE_KEY+':write',async()=>{
   if(this.storage.getItem(M.SAVE_KEY)!==this.raw){this.refresh();throw Error('別タブの最新記録を読み込みました。内容を確認してもう一度操作してください。');}
   if(this.raw===null&&this.storage.getItem(M.LEGACY_SAVE_KEY)!==this.legacyRaw)throw Error('旧大会が別タブで更新されました。再読み込みして最新の記録を引き継いでください。');
   assertCupRuntimeState(this.state);await ensureBattleRuntime(this.state.battle);if(this.storage.getItem(M.SAVE_KEY)!==this.raw||this.raw===null&&this.storage.getItem(M.LEGACY_SAVE_KEY)!==this.legacyRaw)throw Error('読込中に大会記録が更新されました。再読込してください。');const next=structuredClone(this.state);
   if(syncMain){const profile=this.main();M.linkMain(next,profile);}
   if(fn(next)===false)return false;assertCupRuntimeState(next);
   // Preserve the exact old text once, and verify before replacing anything.
   const sourceRaw=this.raw??this.legacyRaw;
   if(sourceRaw!==null&&JSON.parse(sourceRaw).schema===1){const key=M.SAVE_KEY+':before-main-link-v2',backup=this.storage.getItem(key);if(backup===null)this.storage.setItem(key,sourceRaw);if(this.storage.getItem(key)!==(backup??sourceRaw))throw Error('移行前の大会記録を保管できないため中止しました。');}
   next.schema=M.requiredCupSchema(next);const raw=JSON.stringify(next);if(!M.load(raw))throw Error('保存内容を検証できないため中止しました。');
   this.storage.setItem(M.SAVE_KEY,raw);if(this.storage.getItem(M.SAVE_KEY)!==raw)throw Error('大会記録の保存を確認できないため中止しました。');this.raw=raw;this.legacyRaw=null;this.state=next;return true;
  });
 }
}
