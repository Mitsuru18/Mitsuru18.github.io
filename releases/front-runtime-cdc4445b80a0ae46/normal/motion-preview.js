import * as E from './engine.js';
import * as Current from './main-battle-runtime.js';
import * as Cup from './../cup/current/tournament-battle-runtime.js';
import {MOTION_DATA as DATA} from './motion-acquisition-data.js';
import {createSkillDemoFrame,DEMO_DURATION} from './runtime-demo.js';
import {BATTLE_REVISIONS,stampBattleRuntime} from './battle-runtime-contract.js';
import {captureSweepReceiving} from './sweep-reaction.js';
import {captureBackfistReceiving} from './backfist-prototype.js';
const legacy={v71:()=>Promise.all([import('./runtime/public-normal/engine.js'),import('./runtime/public-normal/renderer.js')]),v73:()=>Promise.all([import('./runtime/front-v73-normal/engine.js'),import('./runtime/front-v73-normal/renderer.js')]),v74:()=>Promise.all([import('./runtime/jump-v74-normal/engine.js'),import('./runtime/jump-v74-normal/renderer.js')]),v75:()=>Promise.all([import('./runtime/axe-v75-normal/engine.js'),import('./runtime/axe-v75-normal/renderer.js')]),v76:()=>Promise.all([import('./runtime/backfist-v76-normal/engine.js'),import('./runtime/backfist-v76-normal/renderer.js')])},revisions={v71:'PUBLIC',v73:'V73',v74:'V74',v75:'V75',v76:'V76'},pairs=new Map();
export const CONTEXTS=[['normal','現行・通常'],['cup','現行・大会'],['v71','旧保存 v71/v72'],['v73','旧保存 v73'],['v74','旧保存 v74'],['v75','旧保存 v75'],['v76','旧保存 v76']];
export const MOTIONS=[...DATA.normal.map(t=>({key:t.id,id:t.id,name:t.id==='frontkick'?t.name+'（前蹴り）':t.name,group:t.available?(t.type==='defense'||t.type==='evasion'?'守備・回避':'打撃'):'停止・データのみ',kind:'skill',status:t.available?'現行選択技':'現在は装備対象外',note:t.inactiveReason})),...DATA.cup.filter(t=>!DATA.normal.some(n=>n.id===t.id)).map(t=>({key:t.id,id:t.id,name:t.name,group:'大会データのみ',kind:'skill',status:'大会データのみ',note:'本編に獲得経路なし。通常の大会NPC・初期装備にも含まれない、保持中の大会定義の表示見本です。',contexts:['cup']})),{key:'front-close',id:'frontkick',name:'キック・近距離の旧軌道',group:'自動variant',kind:'skill',gap:60,expected:'frontkickLegacy',status:'現行の自動選択',note:'別の習得・装備IDではありません。固定近距離から実際の開始処理で選択。'},{key:'jump-legacy-hybrid',id:'jumpkick',name:'旧保存・ジャンプキックの条件切替',group:'旧保存のみ',kind:'skill',gap:170,contexts:['v74','v75','v76'],status:'旧方式の表示見本',note:'旧保存の一技内切替を保持。現行は垂直型と飛び込み型を別々に習得・装備します。'},...['idle','walk','retreat','rest','hit'].map((key,i)=>({key:'auto-'+key,id:'jab',name:['構え・待機','前進歩行','通常の後退歩行','息を整える','被弾・押し戻し'][i],group:'移動・反応',kind:key,status:'自動・習得なし'})),...['jab','frontkick','jumpkick','axekick','backfist','crouchlowkick','horizontalelbow','bodyuppercut','uppercut'].map(id=>({key:'ko-'+id,id,name:'KO表示・'+DATA.normal.find(t=>t.id===id).name,group:'KO表示',kind:'ko',status:'自動・習得なし',note:'動作中の姿勢からHP0・決着を明示した描画見本。自然な致死命中や判定の証明ではありません。'})),{key:'disabled-backstep',id:null,name:'特殊な後ろステップ',group:'停止・データのみ',kind:'disabled',status:'未採用・OFF',note:'試作データは保持されていますが、公開版の自動発動は無効です。このページでも有効化しません。'},{key:'disabled-ab',id:null,name:'A+B 連携',group:'停止・データのみ',kind:'disabled',status:'無効・OFF',note:'公開版で無効の機能。現行モーションとして再生しません。'}];
export async function previewPair(context){if(context==='normal')return{engine:E,draw:Current.drawArena,create:Current.createBattle};if(context==='cup')return{engine:Cup,draw:Cup.drawArena,create:Cup.createBattle};if(!legacy[context])throw Error('Unknown preview context');if(!pairs.has(context))pairs.set(context,legacy[context]().then(([engine,paint])=>({engine,draw:paint.drawArena,create:options=>stampBattleRuntime(engine.createBattle(options),'normal',BATTLE_REVISIONS[revisions[context]])})));return pairs.get(context);}
const clone=structuredClone;
export async function createMotionClip(row,{context='normal',facing=1,isCancelled=()=>false}={}){
 if(row.kind==='disabled')return{disabled:true,note:row.note,duration:0,frames:[]};if(row.contexts&&!row.contexts.includes(context))return{disabled:true,note:'この項目は現行の大会データでのみ表示できます。',duration:0,frames:[]};
 const pair=await previewPair(context),engine=pair.engine,t=engine.TECHNIQUES.find(t=>t.id===row.id);if(!t)return{disabled:true,note:'この旧保存方式には技の定義がありません。',duration:0,frames:[]};
 if(!engine.availableIn2D(t.id)){
  if(context!=='normal')return{disabled:true,note:'この方式では停止中の技です。現行・通常の「表示資産のみ」で確認してください。',duration:0,frames:[]};
  const frames=Array.from({length:217},(_,n)=>{const battle=createSkillDemoFrame(t.id,Math.min(DEMO_DURATION-1e-6,n/60));if(facing===-1)for(const f of battle.fighters){f.x=800-f.x;f.facing=-f.facing;if(f.action?.facing)f.action.facing=-f.action.facing;}return{battle,tail:0}});return{frames,duration:(frames.length-1)/60,pair,technique:t,actualTechnique:t.id,method:'停止中の表示資産・既存の純粋デモ（実試合での使用ではありません）'};
 }
 const b=pair.create({seed:17,player:{hp:10000,maxHp:10000,maxStamina:1000,speed:context==='cup'?1.18:1,techniques:[t.id],strategy:'balanced'},opponent:{hp:10000,maxHp:10000,maxStamina:1000,speed:context==='cup'?1.18:1,techniques:['jab'],strategy:'balanced'}}),[a,d]=b.fighters;const gap=row.gap??({frontkick:170,jumpkick:100,forwardjumpkick:190,crouchlowkick:78,sidekick:95,knee:163,horizontalelbow:80,backfist:92,axekick:180}[t.id]??Math.max(60,t.range||100));a.x=facing===1?290:510;d.x=a.x+facing*gap;a.facing=facing;d.facing=-facing;
 for(const f of b.fighters){f.cooldown=f.defenseCooldown=100;f.prototypeHold=true;}const frames=[],prefix=18;let actual=null,started=false,finishedAt=null,captured=null;
 if(row.kind!=='skill'&&row.kind!=='ko'){
  for(let n=0;n<=180;n++){const x=clone(b),f=x.fighters[0];x.time=n/60;x.tick=n;f.motionTime=n/60*.5;f.walkTime=n/60*.5;f.pose=row.kind==='walk'||row.kind==='retreat'?'walk':row.kind==='hit'?'hit':'idle';f.poseTimer=row.kind==='hit'?.2:0;if(row.kind==='walk'||row.kind==='retreat')f.x+=facing*(row.kind==='walk'?1:-1)*n*.25;if(row.kind==='rest')f.stamina=0;frames.push({battle:x,tail:0});}return{frames,duration:3,pair,technique:t,actualTechnique:null,method:'現行描画への固定姿勢・時計入力。AI移動や回避成功の証明ではありません。'};
 }
 const native=typeof engine.startSweepFixture==='function';
 for(let n=0;n<=600;n++){
  if(n%12===0){if(isCancelled())return{cancelled:true,frames:[],duration:0};if(typeof setTimeout==='function')await new Promise(r=>setTimeout(r,0));if(isCancelled())return{cancelled:true,frames:[],duration:0};}
  if(n===prefix){if(native){started=!!engine.startSweepFixture(b,0,t.id);actual=a.action?.technique??null;}else{a.prototypeHold=false;a.cooldown=0;a.decisionProbability=1;}}
  if(n>0)engine.stepBattle(b);
  if(!native&&a.action&&!started){started=true;actual=a.action.technique;a.decisionProbability=0;}
  if(row.kind==='ko'&&a.action?.phase==='active'&&!captured){captured=clone(b);const f=captured.fighters[0];if(context==='normal'||context==='cup'){if(f.action.technique==='crouchlowkickR50')captureSweepReceiving(f,captured.time,captured.tick,true);if(f.action.technique==='backfist')captureBackfistReceiving(f,captured.time,captured.tick,true);}f.hp=0;captured.done=true;captured.winner='opponent';captured.reason='controlled KO presentation';}
  if(captured){for(let k=0;k<=180;k++)frames.push({battle:clone(captured),tail:k/60});break;}
  frames.push({battle:clone(b),tail:0});if(started&&!a.action&&finishedAt===null){finishedAt=n;a.prototypeHold=true;a.cooldown=100;}if(finishedAt!==null&&n-finishedAt>=30)break;if(!native&&!started&&n>=180)break;
 }
 if(!started)return{disabled:true,note:'この固定条件では開始しませんでした。旧方式の開始条件を強制解除していません。',duration:0,frames:[],pair,technique:t};
 return{frames,duration:(frames.length-1)/60,pair,technique:t,actualTechnique:actual,expectedVariant:row.expected??null,variantMatches:!row.expected||row.expected===actual,method:native?'実エンジンの明示開始・固定相手。AI抽選と間合い選択は省略。命中は保証しません。':'旧公開エンジンの固定入力・抽選確率1の制御見本。自然な発動の証明ではありません。'};
}
export function frameAt(clip,seconds){return clip.frames[Math.max(0,Math.min(clip.frames.length-1,Math.round(seconds*60)))];}
