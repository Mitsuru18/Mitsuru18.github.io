import {r17Return,generatedReturn} from './backfist-return-r17.js';
import {CORE,JOINS} from './backfist-foot4-data.js';
import {JOINT_MAP} from './backfist-r5-frozen.mjs';
// R13 independent timing comparison. Source24Hz timestamps and raw145 remain immutable.
export const PREFIX=.4,CORE_SECONDS=145/72,SUFFIX=.5;
export const GAMEPLAY_MAPPING=Object.freeze({sourceHz:24,positions:145,displayRateAtSpeed1:72,multiplier:3,first:0,last:144,activeFirst:54,activeEndExclusive:78,interpolation:'none; original sample holds',adopted:false});
export const BACKFIST_CLOCK=Object.freeze({positions:145,displayHz:24,actionToDisplay:2,gameplayDisplayHz:72,gameplayMultiplier:3,generatedConnections:true,realTimeSecondsAtSpeed1:PREFIX+CORE_SECONDS+SUFFIX});
export const BACKFIST_TIMING=Object.freeze({windup:PREFIX/2+54/144,active:24/144,recovery:67/144+SUFFIX/2});
export const BACKFIST_META=Object.freeze({id:'backfist',name:'返し裏拳',style:'プンチャック・シラット',target:'body',type:'punch',power:13,range:92,cost:10,swayable:true,manualEquip:true,...BACKFIST_TIMING,prototypeOnly:true});
export const backfist=id=>id==='backfist';
export function projected(q){return Object.fromEntries(Object.entries(JOINT_MAP).map(([k,s])=>[k,[q[s][0]-360/4.3,605/4.3-q[s][1]]]));}
function record(q,key,stage,sourceIndex=null){return{joints:projected(q),rig3D:q,key,stage,sourceIndex,sourceElapsed:sourceIndex===null?null:sourceIndex/24,sourceDisplaySeconds:sourceIndex===null?null:44+sourceIndex/24,total:(PREFIX+CORE_SECONDS+SUFFIX)/2,generated:sourceIndex===null};}
// One canonical source clock drives both pose and combat phase. Snap only within
// numerical roundoff of a source exposure boundary. [54,78) includes ALL of d077.
const snapSource=x=>Math.abs(x-Math.round(x))<1e-9?Math.round(x):x;
export function backfistClock(elapsed=0){const t=Math.max(0,elapsed*2),u=snapSource((t-PREFIX)*72);if(u<0)return{stage:'prefix',index:Math.min(23,Math.floor(t*60+1e-9)),phase:'windup',sourceIndex:null};if(u<145){const i=Math.floor(u);return{stage:'core',index:i,sourceIndex:i,phase:i<54?'windup':i<78?'active':'recovery'};}const end=snapSource((t-PREFIX-CORE_SECONDS-SUFFIX)*60);return{stage:'suffix',index:Math.min(30,Math.max(0,Math.floor((t-PREFIX-CORE_SECONDS)*60+1e-9))),sourceIndex:null,phase:end>=0?'done':'recovery'};}
export function backfistPhase(elapsed){return backfistClock(elapsed).phase;}
export function backfistPose(elapsed=0){const c=backfistClock(elapsed);return c.stage==='prefix'?record(JOINS.prefix[c.index],'p'+c.index,'generated-common-entry'):c.stage==='core'?record(CORE[c.index],'c'+c.index,'foot4-core-display-hold',c.index):record(r17Return((elapsed*2-PREFIX-CORE_SECONDS)/SUFFIX),'s'+c.index,'generated-velocity-return');}
export function backfistResolutionKnots(lo,hi){const out=[];for(let i=54;i<=78;i++){const t=PREFIX/2+i/144;if(t>=lo-1e-10&&t<=hi+1e-10)out.push(t);}return out;}
export function backfistInterrupted(s,elapsed){const p=s.backfistFrame||backfistPose(s.action.elapsed),seq=p.key[0]==='c'?JOINS.interrupt[p.sourceIndex]:JOINS.extraInterrupts[p.key];if(!seq)throw Error('Missing validated interruption key '+p.key);let i=Math.min(12,Math.max(0,Math.floor(elapsed*60+1e-9)));const actual=p.stage==='generated-velocity-return'?generatedReturn(p.rig3D,i/12):seq[i];return record(actual,p.key+'-hit'+i,i===12?'generated-common-rest':'generated-impact-return');}
// R9: a non-blocking receiving snapshot. It retains the ORIGINAL continuation
// deadline; a second hit does not restart or extend the 12-tick generated return.
export function backfistReceiving(f,time=0){
 if(f.finishBackfistKO)return f.finishBackfistKO;
 if(f.hp<=0&&f.backfistKOEntry)return f.backfistKOEntry.pose;
 if(backfist(f.action?.technique))return backfistPose(f.action.elapsed);
 const r=f.backfistReceiverSnapshot;
 if(!f.action&&r&&(f.interruptedStrike||f.backfistPrototypeRest)){
  if(time<=r.createdTime+1e-10)return r.pose;
  return r.continuation?backfistInterrupted(r.continuation,time-r.continuation.createdTime):r.pose;
 }
 if(backfist(f.interruptedStrike?.action?.technique))return backfistInterrupted(f.interruptedStrike,time-f.interruptedStrike.createdTime);
 return !f.action&&f.backfistPrototypeRest?f.backfistPrototypeRest:null;
}
export function backfistGeneratedReceiving(f,time=0){const p=backfistReceiving(f,time);return !f.action&&p?.generated?p:null;}
export function captureBackfistReceiving(f,time,tick,lethal=false,presentation=null){
 // R26 only: a lethal hit while BF is actually active. Capture before the
 // original cancellation; do not create/reset a generated receiving deadline.
 if(lethal&&backfist(f.action?.technique)){
  const pose=backfistPose(f.action.elapsed);
  if(!pose.rig3D)throw Error('Active BF KO needs its exact current3D rig');
  const entry={pose:structuredClone(pose),rootX:presentation?.rootX??f.x,
   facing:presentation?.facing??f.facing,createdTime:time,createdTick:tick,
   source:'R28 active-backfist pre-lethal actual3D pose',koTargetMode:'raw-before-entry-v1',actorXAtCapture:f.x,
   actionAtCapture:structuredClone(f.action)};
  f.backfistKOEntry=entry;return entry;
 }

 const pose=backfistGeneratedReceiving(f,time);if(!pose)return null;
 const previous=f.backfistReceiverSnapshot,original=previous?.continuation??(backfist(f.interruptedStrike?.action?.technique)?f.interruptedStrike:null);
 const snapshot={generation:(previous?.generation??0)+1,createdTime:time,createdTick:tick,rootX:f.x,facing:f.facing,pose:structuredClone(pose),continuation:original?{action:structuredClone(original.action),backfistFrame:structuredClone(original.backfistFrame),createdTime:original.createdTime,createdTick:original.createdTick}:null,policy:'capture actual generated pose; preserve original continuation deadline and native control timers'};
 f.backfistReceiverSnapshot=snapshot;
 if(lethal)f.backfistKOEntry={pose:structuredClone(pose),rootX:f.x,facing:f.facing,createdTime:time,createdTick:tick};
 return snapshot;
}

export function backfistRest(index=0){return record(index===0?JOINS.prefix[0]:JOINS.suffix[30],index===0?'p0':'s30','generated-common-rest');}
