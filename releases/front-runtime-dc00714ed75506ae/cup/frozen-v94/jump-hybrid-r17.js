import{prepareOpeningWalkForecast}from'./jump-walk-forecast-r44.js';
import{rootCorrection,ROOT_ADAPTATION_REVISION,ROOT_ADAPTATION_CAP}from'./jump-root-air-r54.js';
// R17 isolated native-entry hybrid. Public skill/cost/power stay jumpkick/21/24.
// Exact current gap at real engine action-clock samples, never nearest lattice +/-1.
import {jumpPose,jumpContact,JUMP_TIMING} from './jump-approved-motion.js';
import{prepareFrontSupportedEntry,ENTRY_SECONDS}from'./jump-entry-support-r31.js';
const total=JUMP_TIMING.windup+JUMP_TIMING.active+JUMP_TIMING.recovery;
const roots=Array.from({length:102},(_,i)=>jumpPose(i*total/101).rootWorld);
const oldRootBounds=[Math.min(0,...roots),Math.max(0,...roots)];
const tailBoundsCache=new Map();function clockTailBounds(rate,parts){const key=rate+":"+parts;if(tailBoundsCache.has(key))return tailBoundsCache.get(key);const step=rate/60/parts,a=[jumpPose(ENTRY_SECONDS).rootWorld,jumpPose(total).rootWorld];for(let n=Math.ceil(ENTRY_SECONDS/step);n*step<=total;n++)a.push(jumpPose(n*step).rootWorld);const bounds=[Math.min(...a),Math.max(...a)];tailBoundsCache.set(key,bounds);return bounds;}
const caches=new WeakMap();
export function planJumpHybrid(b,index,ctx){
 const f=b.fighters[index],d=b.fighters[1-index],gap=Math.abs(d.x-f.x),face=f.x<d.x?1:-1;
 const no=reason=>({allowed:false,reason,gap,variant:'legacy',scope:'geometry eligibility, not promised future contact'});
 if(gap<=ctx.oldRange)return no('old-close-range');
 if(f.techniques.some(ctx.commonIdle))return no('common-entry-style-not-yet-compatible');
 if(f.action||f.interruptedStrike||f.recoil||f.backstep||f.poseTimer>0||!['idle','walk'].includes(f.pose))return no('entry-not-ready');
 const rate=ctx.rate(f),parts=ctx.parts(...b.fighters.map(ctx.rate));let entryContext=null,rootBounds=oldRootBounds;
 if(ctx.entry){const entry=(ctx.prepareEntry??prepareFrontSupportedEntry)(ctx.entry(f,b.time),jumpPose(ENTRY_SECONDS));if(!entry.allowed)return no(entry.reason);entryContext=entry.context;const tail=clockTailBounds(rate,parts),offset=entryContext.entryRootOffset;rootBounds=[Math.min(entryContext.entryPrefixBounds[0],tail[0]+offset),Math.max(entryContext.entryPrefixBounds[1],tail[1]+offset)];}
 if(d.recoil||d.interruptedStrike||d.backstep||d.pushReaction)return no('receiver-reaction-not-forecast');
 const step=rate/60/parts,velocity=Number(b.spaceVelocity?.[1-index]||0),plannedIntent=ctx.observedPlanTarget?.(d)??null;
 const key=JSON.stringify([plannedIntent,d.plan,d.strategy,d.openingSpacing,b.time,b.tick,index,f.x,d.x,f.pose,d.pose,d.poseTimer,d.motionTime,d.walkTime,d.action,rate,parts,velocity,entryContext]);
 let cache=caches.get(b);if(cache?.key===key)return cache.value;
 const samples=[];for(let n=Math.ceil(JUMP_TIMING.windup/step);n*step<JUMP_TIMING.windup+JUMP_TIMING.active;n++)samples.push(n*step);samples.push(...ctx.sweep(0,step,JUMP_TIMING.windup,JUMP_TIMING.active));
 const attempts=[],poseMemo=new Map(),zeroContext=entryContext?{jumpContext:{...entryContext,rootAdaptation:{revision:ROOT_ADAPTATION_REVISION,amount:0}}}:null;
 function poseAt(t,amount){if(!poseMemo.has(t))poseMemo.set(t,jumpPose(t,zeroContext));const p=poseMemo.get(t),c=rootCorrection(t,{revision:ROOT_ADAPTATION_REVISION,amount});return c?{...p,rootWorld:p.rootWorld-c,rootDraw:(p.rootWorld-c)*.41}:p;}

 function candidate(amount){const context=entryContext?{...entryContext,rootAdaptation:{revision:ROOT_ADAPTATION_REVISION,amount}}:null,bounds=[rootBounds[0]-amount,rootBounds[1]],wallSafe=bounds.every(x=>f.x+face*x>=60&&f.x+face*x<=740);if(!wallSafe)return{allowed:false,reason:'registered-root-path-exits-wall',wallSafe:false,rootBounds:bounds};
  const forecast=ctx.intentForecast?prepareOpeningWalkForecast(d,{rootAt:s=>f.x+face*poseAt(s*rate,amount).rootWorld,rate:ctx.rate(d),moveRate:ctx.moveRate(d),parts,seconds:Math.max(...samples.map(t=>ctx.receiverSeconds(b,index,t/rate,parts))),worldStrike:ctx.worldStrike(d.plan),plannedIntent}):null;let witness=null;
  for(const elapsed of samples){const seconds=ctx.receiverSeconds(b,index,elapsed/rate,parts),enemy=structuredClone(d);enemy.x=Math.max(60,Math.min(740,d.x+velocity*seconds));enemy.motionTime=(d.motionTime||0)+ctx.rate(d)*seconds;ctx.walk(d,enemy,seconds);if(forecast){const q=forecast.sample(seconds);Object.assign(enemy,{x:q.x,motionTime:q.motionTime,walkTime:q.walkTime,pose:q.pose,facing:q.facing});}
   if(enemy.action){const t=ctx.technique(enemy.action.technique);if(!t)continue;enemy.action.elapsed+=ctx.rate(d)*seconds;const active=t.active??.12;if(enemy.action.elapsed>=t.windup+active+t.recovery){enemy.action=null;enemy.pose='idle';enemy.poseTimer=0;}else enemy.action.phase=enemy.action.elapsed<t.windup?'windup':enemy.action.elapsed<t.windup+active?'active':'recovery';}
   const p=poseAt(elapsed,amount),root=f.x+face*p.rootWorld,relative=(enemy.x-root)*face;if(relative<=0)continue;const surface=ctx.head(enemy,b.time+seconds),contact=jumpContact(p,surface,(enemy.x-root)*.41,face,enemy.action?.facing??enemy.facing);if(contact.reaches){witness={elapsed,worldSeconds:seconds,root,receiverRoot:enemy.x,relative,source:p.sourcePosition,contact,...(forecast?{forecastModel:forecast.audit.model,forecastPose:enemy.pose,forecastFacing:enemy.facing,unknownFutureAI:true}:{})};break;}}
  return{allowed:!!witness,reason:witness?'exact-engine-clock-contact':'no-exact-engine-clock-contact',wallSafe:true,rootBounds:bounds,witness,...(forecast?{forecast:{...forecast.audit,rows:undefined}}:{}),...(witness&&context?{entryContext:context}:{})};
 }
 function test(amount){const q=candidate(amount);attempts.push({amount,allowed:q.allowed,reason:q.reason});return q;}
 let selected=test(ctx.adaptRoot&&entryContext?ROOT_ADAPTATION_CAP:0);
 // R55 single conservative candidate: maximum non-reversing shortening of the
 // generated airborne translation. If this fixed candidate cannot contact, old
 // fallback remains. No unsafe lower-amplitude rescue within this prototype.

 const value={...selected,gap,variant:selected.allowed?'approved101':'legacy',rate,parts,velocity,adaptationSearch:{family:ROOT_ADAPTATION_REVISION,cap:ROOT_ADAPTATION_CAP,attempts,lockedAtStart:true,scope:'single maximum shortening candidate; conditional future actor, not hit guarantee'},scope:'Original local pose/PTS unchanged. Non-reversing generated root correction during925..933 only; amount fixed at paid start. Existing actual damage/contact remains authoritative.'};caches.set(b,{key,value});return value;
}
