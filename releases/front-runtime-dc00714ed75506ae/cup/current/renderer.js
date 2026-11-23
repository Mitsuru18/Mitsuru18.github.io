import{flyPose,flyInterrupted}from'./flyingknee-game.mjs';
import{hammerGamePose}from'./hammerfist-game.mjs';
import{fullbodyHookPose,fullbodyHookRig}from'./hook-body-trace.js';
import {paintSpearAnatomicalBody} from './spear-anatomical-painter.js';
import{frameFrom2D,blendDutchFrames}from'./dutchlow-r19-join.js';import{dutchHeadAngles}from'./dutchlow-r19-painter.js';
import{dutchlowPose,dutchlowInterrupted,dutchlowKO}from'./dutchlow-r19-motion.js';import{paintDutch,dutchHeadSurfaces,dutchOperations}from'./dutchlow-r19-painter.js';
import{sweepHeadReference}from'./sweep-head/view.js';
import{fourTraceAttackPoints}from'./four-trace-motion.js';
import{backfistFist}from'./backfist-surface.js';
import{jumpFootPolygon}from'./jump-approved-motion.js';
import{contactLocal as sweepOldContact}from'./accepted-motion.js';
import{WORLD_STRIKES,worldStrike as sweepWorldStrike}from'./world-strikes.js';
import{fourTraceFootRegistration,paintResolvedFootContactGeometry}from'./four-trace-painter.js';
import{clipHalfPlane as sweepClip}from'./sweep-path-geometry.js';
import{geometryContext as sweepGeometryContext}from'./sweep-path-geometry.js';
import{primitiveContact as sweepPrimitiveContact}from'./sweep-contact-candidate.js';
import{sweepFootPrimitives}from'./sweep-candidate.js';
import{sweepReceiving,sweepKOPose}from'./sweep-reaction.js';
import{SWEEP_TIMING,SWEEP_INTERNAL_ID}from'./sweep-candidate.js';
import {sweepActive,sweepPose,sweepOperations,paintSweep} from './sweep-candidate.js';
import{sweepContactDiagnostic,commonPainterLegPrimitives,painterRegionSurfaces,polygonTouchesSurface}from './sweep-contact-candidate.js';
import{approvedBodyOperations as sweepCommonOperations}from './approved-body.js';
import{jumpKick,jumpPose,jumpStateFor,jumpKOPose,jumpVisibleSurfaces,JUMP_TIMING}from'./jump-approved-motion.js';
import{paintFourTraceHeadContactGeometry,fourTraceFloorRegistration}from'./four-trace-painter.js';
import{axeCommonRig}from'./axe-prototype/common-painter.js';
import{ownsAxe,releaseAxe}from'./axe-prototype/dispatch.js';
import{experimentPose,paintExperiment,directKO}from'./axe-prototype/runtime.js';
import {backfistKOPose} from './backfist-ko-3d.js';
import {backfist,backfistPose,backfistReceiving,backfistGeneratedReceiving} from './backfist-prototype.js';
import {backfistHeadSurfaces,backfistBodySurfaces,backfistLegacyBodySurfaces,backfistSurfaceContact,backfistPunchTouchesSurface} from './backfist-surface.js';
import {threePaintGeometry,inferredThreeDisplay,threeCombat,threePose,threeContact,threeInterrupted,threeReceiving,threeBlend,paintThreeCombat,HORIZONTAL_ELBOW_METADATA} from './approved-three-combat.js';
import {chinUppercut,chinUppercutPose,chinUppercutRow,chinEase,chinBlend,chinReceivingPose}from'./chin-uppercut-motion.js';
import {paintChinUppercutR3,chinUppercutFloorBound}from'./chin-uppercut-painter.js';
import {chinFistOutline,chinReceivingSurfaces,chinHeadRotation}from'./chin-uppercut-contact.js';
import {punchOutline,r3ReceivingPose,r3ReceivingSurfaces,punchTouchesSurface} from './body-uppercut-contact.js';
import {bodyUppercut,bodyUppercutPose,bodyUppercutRow,bodyUppercutEase,bodyUppercutBlend}from'./body-uppercut-motion.js';
import {paintBodyUppercutR3}from'./body-uppercut-painter.js';
import{backstepPose}from'./backstep-trial.js';
import{makeFourKOSnapshot,fourKOEntry,traceDisplayRoot,supportsFourKOSurface,fourKOSurface}from'./four-trace-ko.js';
import{fourTraceStanding,fourTraceRigTransition,fourTraceRoleJoints,isFourTrace,fourTracePose,fourTraceInterrupted,fourTraceFallEntry,fourTraceFootOutline,fourTraceJoints}from'./four-trace-motion.js';
import{paintFourTrace}from'./four-trace-painter.js';
import {appearancePalette,hairShape}from'./appearance.js';
import {targetedGuard,targetedGuardPose} from './targeted-guard.js';
import {recoilEase} from './contact-motion.js';
import {FINISH_PRESENTATION,fallenPose,loserIndex,fallHeadTilt} from './finish-motion.js';
import {sceneImage} from './scene-art.js';
import {legacyHighMotion,highElapsed} from './high-legacy-motion.js';
import {acceptedContact,strikeTarget,postureState,staminaStatus,STAMINA_RULES,motionRate} from './engine.js';
import {fatigueEligible,createFatigueSampler,fatigueLegacyPose,fatigueApprovedPose} from './fatigue-motion.js';
const sampleFatigue=createFatigueSampler();
export function breathingEligible(f,battle){return fatigueEligible(f,battle,staminaStatus(f).resting)}
import {TECHNIQUES,FRONTKICK_LEGACY}from'./technique-data.js';
import {acceptedMove,acceptedIdleMove,acceptedGamePose,commonStance,interruptedPose}from'./accepted-motion.js';
import {paintApprovedBody,paintApprovedFaceContactGeometry,paintApprovedOperations}from'./approved-body.js';
import {SPIN_TIMING} from './spin-timing.js';
import {newPosturePose,postureContactFor} from './posture-motion.js';
import {spinHumanPose,spinPlacement,SPIN_PLACEMENT} from './spin-motion.js';
import {observedStrikeRig,observedCrossPose,observedKickPose} from './strike-rig.js';
/* Original illustrated fighters. Fixed-length two-bone IK, continuously skinned
   limbs, grounded support feet and phase-driven anticipation/strike/retraction.
   Geometry is in logical 384 x 216 coordinates, rendered at 3x resolution. */
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),mix=(a,b,t)=>a+(b-a)*t;
const smooth=t=>{t=clamp(t);return t*t*(3-2*t)};
const pt=(x,y)=>({x,y}),lerp=(a,b,t)=>pt(mix(a.x,b.x,t),mix(a.y,b.y,t));
const arc=(a,control,b,t)=>lerp(lerp(a,control,t),lerp(control,b,t),t);
const pal=[{skin:'#c8916e',light:'#e8b18a',shade:'#996448',cloth:'#23565c',bright:'#43828a',wrap:'#eee6d3',hair:'#292a2c'},{skin:'#a56c50',light:'#ca8e67',shade:'#724536',cloth:'#883e42',bright:'#b45952',wrap:'#e8d7ba',hair:'#24252a'}];
export const DAMAGE_FLASH={seconds:.32,alpha:.42,chipAlpha:.18,color:'#ff2638'};
/** Stateless event clock: redraws/pauses cannot restart a flash, and both
 * receivers can flash independently. No combat or saved state is changed. */
export function damageFlashesFor(battle,receiver,postResultSeconds=0){
 if(!Number.isFinite(battle?.tick)||!Array.isArray(battle?.events))return [];
 const tail=battle.done&&Number.isFinite(postResultSeconds)?Math.max(0,postResultSeconds):0;
 const latest=new Map();
 for(const e of battle.events){
  if(e.fighter!==receiver||!['hit','block'].includes(e.type)||!Number.isFinite(e.damage)||e.damage<=0||!Number.isFinite(e.tick)||e.tick>battle.tick||!['head','body','leg'].includes(e.target))continue;
  if(!latest.has(e.target)||e.tick>=latest.get(e.target).tick)latest.set(e.target,e);
 }
 return [...latest.values()].flatMap(event=>{
  const age=(battle.tick-event.tick)/60+tail;if(age>=DAMAGE_FLASH.seconds)return [];
  return [{target:event.target,alpha:(event.type==='block'?DAMAGE_FLASH.chipAlpha:DAMAGE_FLASH.alpha)*(1-age/DAMAGE_FLASH.seconds),age,tick:event.tick,chip:event.type==='block'}];
 });
}
function redMix(color,alpha){const rgb=color.slice(1).match(/../g).map(v=>parseInt(v,16)),red=[255,38,56];return '#'+rgb.map((v,i)=>Math.round(mix(v,red[i],alpha)).toString(16).padStart(2,'0')).join('');}
/** Color compositing is performed inside the existing anatomical primitives,
 * before foreground limbs are painted. It is exactly a translucent red mix
 * of their opaque palette colors, preserving contours, detail and occlusion.
 * The leg mask is local to the receiving lead/support knee, not both legs. */
function damagePalette(c,P,flashes,target,knee=null){
 const flash=flashes?.find(f=>f.target===target);if(!flash)return P;
 return Object.fromEntries(Object.entries(P).map(([key,color])=>{
  if(typeof color!=='string'||!/^#[a-fA-F0-9]{6}$/.test(color))return[key,color];
  const tinted=redMix(color,flash.alpha);
  if(!knee)return [key,tinted];
  const gradient=c.createRadialGradient(knee.x,knee.y,3,knee.x,knee.y,15);
  gradient.addColorStop(0,tinted);gradient.addColorStop(1,color);return [key,gradient];
 }));
}
const TECH_BY_ID={...Object.fromEntries(TECHNIQUES.map(t=>[t.id,t])),frontkickLegacy:FRONTKICK_LEGACY};
/** Finish low/airborne poses and the approved HIGH after a result. The fixed
 * battle state, old accepted poses, damage and saves remain frozen. */
// Only the presentation clock slows. Combat, HP, RNG and saved results stay frozen.
// The native 1.10 s fall takes 2.75 s; the existing 0.70 s end hold stays real-time.
export const FINISH_PLAYBACK_RATE=.4;
export function resultPresentationWallDuration(battle){
 return resultPresentationDuration(battle)+(battle?.done&&loserIndex(battle)!==null?FINISH_PRESENTATION.fallSeconds*(1/FINISH_PLAYBACK_RATE-1):0);
}
export function advanceResultPresentation(battle,age,delta,hidden=false){
 const end=resultPresentationDuration(battle),current=Math.max(0,Math.min(end,Number(age)||0));
 if(!battle?.done||hidden)return current;
 const dt=Number.isFinite(delta)?Math.max(0,Math.min(.1,delta)):0;
 const slowEnd=loserIndex(battle)===null?0:FINISH_PRESENTATION.fallSeconds;
 const slowWall=Math.min(dt,Math.max(0,slowEnd-current)/FINISH_PLAYBACK_RATE);
 return Math.min(end,current+slowWall*FINISH_PLAYBACK_RATE+(dt-slowWall));
}
function resultJumpTail(f,battle){
 const index=battle?.fighters?.indexOf(f),loser=loserIndex(battle);
 if(!battle?.done||loser===null||index<0||index===loser||f.hp<=0||!jumpKick(f.action?.technique))return null;
 const total=JUMP_TIMING.windup+JUMP_TIMING.active+JUMP_TIMING.recovery,rate=motionRate(f);
 return {total,rate,remaining:Math.max(0,total-f.action.elapsed),duration:Math.max(0,total-f.action.elapsed)/rate};
}
export function resultPresentationDuration(battle){
 return Math.max(FINISH_PRESENTATION.minimumSeconds,DAMAGE_FLASH.seconds,...(battle?.fighters||[]).map(f=>{
  const jump=resultJumpTail(f,battle);if(jump)return jump.duration;if(sweepActive(f))return Math.max(0,SWEEP_TIMING.total-f.action.elapsed)/motionRate(f);
  const t=TECH_BY_ID[f.action?.technique];if(threeCombat(t?.id)||bodyUppercut(t?.id)||chinUppercut(t?.id))return Math.max(0,t.windup+t.active+t.recovery-(f.action.elapsed||0))/motionRate(f);return t?.postureKind||(t?.id==='highkick'||(t?.id==='frontkick'||t?.id==='frontkickLegacy')||acceptedMove(t?.id))?Math.max(0,t.windup+(t.active??.12)+t.recovery-(f.action.elapsed||0)):0;
 }));
}
export function presentationFighter(f,battle,seconds=0){
 const index=battle?.fighters?.indexOf(f);
 if(battle?.done&&index===loserIndex(battle)&&f.sweepKOEntry){const e=f.sweepKOEntry,face=e.facing,bounds={minX:face===1?8-(28+e.rootX*.41):(28+e.rootX*.41)-376,maxX:face===1?376-(28+e.rootX*.41):(28+e.rootX*.41)-8},p=sweepKOPose(e,seconds,{...bounds,appearance:f.appearance});return{...f,x:e.rootX,facing:face,action:null,pose:'down',finishFrozenRootX:e.rootX,finishFallJoints:p.joints,finishSweepKO:p};}
 if(battle?.done&&index!==loserIndex(battle)&&sweepActive(f)){const elapsed=Math.min(SWEEP_TIMING.total,f.action.elapsed+Math.max(0,seconds)*motionRate(f));return{...f,action:{...f.action,elapsed},pose:'idle'};}
 if(battle?.done&&index===loserIndex(battle)&&(jumpKick(f.action?.technique)||jumpKick(f.interruptedStrike?.action?.technique))){const p=jumpStateFor(f,battle.time),state=jumpKOPose(p,Math.max(0,seconds));return{...f,action:null,pose:'down',finishFallJoints:state.joints,jumpFallState:state};}
 if(ownsAxe(f)&&battle?.done&&index===loserIndex(battle))return{...f,action:null,pose:'down',axeFinish:directKO(axePrototypePose(f,battle.time),Math.max(0,seconds))};
 if(battle?.done&&index===loserIndex(battle)&&(threeCombat(f.action?.technique)||threeCombat(f.interruptedStrike?.action?.technique))){
  const s=f.interruptedStrike,id=s?.action?.technique??f.action.technique,elapsed=s?.action?.elapsed??f.action.elapsed,p=threePose(id,elapsed),initial=s?.joints?threeInterrupted(s,Math.max(0,battle.time-s.createdTime)):p.joints,age=Math.max(0,seconds),q=chinEase(age/.26),target=fallenPose(initial,age,{minX:-160,maxX:160});
  return {...f,action:null,pose:'down',finishFallJoints:threeBlend(initial,target,q),reviewedThreeFall:{id,elapsed,displayJoin:{feetA:threePaintGeometry(id,p).feet,a:inferredThreeDisplay(id,p),b:fallenPose(inferredThreeDisplay(id,p),1.1,{minX:-160,maxX:160}),q:chinEase(age/.55),fall:true},weight:p.customWeight*(s?1-chinEase((battle.time-s.createdTime)/(s.duration||.2)):1)*(1-q)}};
 }

 if(battle?.done&&index===loserIndex(battle)&&(chinUppercut(f.action?.technique)||chinUppercut(f.interruptedStrike?.action?.technique))){
  const snapshot=f.interruptedStrike,p=chinUppercutPose(snapshot?.action?.elapsed??f.action.elapsed),initial=snapshot?.joints?interruptedPose(snapshot,Math.max(0,battle.time-snapshot.createdTime)):p.joints,initialWeight=p.customWeight*(snapshot?1-chinEase((battle.time-snapshot.createdTime)/(snapshot.duration||.2)):1),age=Math.max(0,seconds),q=chinEase(age/.26),bounds={minX:(f.facing??(index?-1:1))===1?8-(28+f.x*.41):(28+f.x*.41)-376,maxX:(f.facing??(index?-1:1))===1?376-(28+f.x*.41):(28+f.x*.41)-8},target=fallenPose(initial,age,bounds);
  const joints=chinBlend(initial,target,q),weight=initialWeight*(1-q),headRotation=age===0?null:mix(chinHeadRotation(chinUppercutRow(initial,p.frameIndex,initialWeight)),fallHeadTilt(age),q),floorOffset=age===0?0:chinUppercutFloorBound({...chinUppercutRow(joints,p.frameIndex,weight),finishHeadTilt:headRotation}),grounded=floorOffset?Object.fromEntries(Object.entries(joints).map(([k,v])=>[k,[v[0],v[1]+floorOffset]])):joints;
  return{...f,action:null,pose:'down',finishHeadTilt:fallHeadTilt(age),finishFallJoints:grounded,chinUppercutFall:{frameIndex:p.frameIndex,weight,headRotation,floorOffset}};
 }
 if(battle?.done&&index===loserIndex(battle)&&(bodyUppercut(f.action?.technique)||bodyUppercut(f.interruptedStrike?.action?.technique))){
  const snapshot=f.interruptedStrike,p=bodyUppercutPose(snapshot?.action?.elapsed??f.action.elapsed),initial=snapshot?.joints?interruptedPose(snapshot,Math.max(0,battle.time-snapshot.createdTime)):p.joints,initialWeight=p.customWeight*(snapshot?1-bodyUppercutEase((battle.time-snapshot.createdTime)/(snapshot.duration||.2)):1),age=Math.max(0,seconds),q=bodyUppercutEase(age/.26),bounds={minX:(f.facing??(index?-1:1))===1?8-(28+f.x*.41):(28+f.x*.41)-376,maxX:(f.facing??(index?-1:1))===1?376-(28+f.x*.41):(28+f.x*.41)-8},target=fallenPose(initial,age,bounds);
  return{...f,action:null,pose:'down',finishHeadTilt:fallHeadTilt(age),finishFallJoints:bodyUppercutBlend(initial,target,q),bodyUppercutFall:{frameIndex:p.frameIndex,weight:initialWeight*(1-q)}};
 }
// R9 scope: only an explicitly captured backfist-generated lethal entry.
 if(battle?.done&&index===loserIndex(battle)&&f.backfistKOEntry){const s=f.backfistKOEntry,elapsed=Math.max(0,seconds),face=s.facing,rootX=s.rootX,bounds={minX:face===1?8-(28+rootX*.41):(28+rootX*.41)-376,maxX:face===1?376-(28+rootX*.41):(28+rootX*.41)-8};const pose=backfistKOPose(s,elapsed,{...bounds,appearance:f.appearance});return {...f,x:rootX,facing:face,action:null,pose:'down',finishFrozenRootX:rootX,finishHeadTilt:pose.headTilt,finishFallJoints:pose.joints,finishBackfistKO:pose,backfistKOEntryScope:'fixed 3D full-body direction join; same geometry for paint, diagnostic receiving and floor'};}
if(battle?.done&&index===loserIndex(battle)){const snapshot=makeFourKOSnapshot(battle,f,index),initial=snapshot?.joints||(f.interruptedStrike?.joints?interruptedPose(f.interruptedStrike,battle.time-f.interruptedStrike.createdTime):acceptedMove(f.action?.technique)?acceptedGamePose(f.action.technique,f.action.elapsed,f.action.contactLimit,f.action.contactKneeSign,f.action.kneeTheta).joints:acceptedNeutral({...f,pose:'hit'},0)),elapsed=Math.max(0,seconds),rootX=snapshot?.rootX??f.x,face=snapshot?.facing??f.facing,fall=fallenPose(initial,elapsed,{...(snapshot?.bounds||{minX:face===1?8-(28+rootX*.41):(28+rootX*.41)-376,maxX:face===1?376-(28+rootX*.41):(28+rootX*.41)-8}),pushkickTrace:['pushkick','flyingknee'].includes(f.interruptedStrike?.action?.technique??f.action?.technique)});return{...f,x:rootX,facing:face,action:null,pose:'down',finishFrozenRootX:snapshot?rootX:undefined,finishHeadTilt:fallHeadTilt(elapsed),finishFallJoints:fall,...(snapshot&&(elapsed<.26||supportsFourKOSurface(snapshot))?{finishFourTraceEntry:supportsFourKOSurface(snapshot)?fourKOSurface(snapshot,fall,elapsed,fallHeadTilt(elapsed)):fourKOEntry(snapshot,elapsed)}:{})};}
 const jump=resultJumpTail(f,battle);
 if(jump&&Number.isFinite(seconds)&&seconds>0){
  const sourceAdvance=Math.min(jump.remaining,seconds*jump.rate),elapsed=f.action.elapsed+sourceAdvance,p=jumpPose(elapsed,f.action.contactLimit),face=f.action.facing??f.facing;
  const x=f.action.jumpRootStartX+face*p.rootWorld,motionTime=(f.motionTime??0)+sourceAdvance;
  if(sourceAdvance>=jump.remaining)return {...f,x,motionTime,action:null,pose:'idle',poseTimer:0};
  const phase=elapsed<JUMP_TIMING.windup?'windup':elapsed<JUMP_TIMING.windup+JUMP_TIMING.active?'active':'recovery';
  const phaseProgress=phase==='windup'?elapsed/JUMP_TIMING.windup:phase==='active'?(elapsed-JUMP_TIMING.windup)/JUMP_TIMING.active:(elapsed-JUMP_TIMING.windup-JUMP_TIMING.active)/JUMP_TIMING.recovery;
  return {...f,x,motionTime,action:{...f.action,elapsed,phase,phaseProgress:clamp(phaseProgress),jumpRootApplied:p.rootWorld}};
 }
 const t=TECH_BY_ID[f.action?.technique];if(!battle?.done||!(t?.postureKind||t?.id==='highkick'||(t?.id==='frontkick'||t?.id==='frontkickLegacy')||acceptedMove(t?.id))||!Number.isFinite(seconds)||seconds<=0)return f;
 const total=t.windup+(t.active??.12)+t.recovery,elapsed=Math.min(total,(f.action.elapsed||0)+seconds*((threeCombat(t.id)||bodyUppercut(t.id)||chinUppercut(t.id))?motionRate(f):1));
 if((t.id==='highkick'||(t.id==='frontkick'||t.id==='frontkickLegacy')||acceptedMove(t.id))&&elapsed>=total)return {...f,pose:'idle',action:null};
 const phase=elapsed<t.windup?'windup':elapsed<t.windup+(t.active??.12)?'active':'recovery';
 const phaseProgress=phase==='windup'?elapsed/t.windup:phase==='active'?(elapsed-t.windup)/(t.active??.12):(elapsed-t.windup-(t.active??.12))/t.recovery;
 return {...f,action:{...f.action,elapsed,phase,phaseProgress:clamp(phaseProgress)}};
}
function path(c,points,fill,stroke='#253039',width=.65){c.beginPath();points.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.closePath();c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke();}}
function line(c,a,b,color,w){c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.strokeStyle=color;c.lineWidth=w;c.lineCap='round';c.stroke();}
function oval(c,x,y,rx,ry,color,angle=0){c.beginPath();c.ellipse(x,y,rx,ry,angle,0,Math.PI*2);c.fillStyle=color;c.fill();}
function ik(a,target,l1,l2,bend=1){let dx=target.x-a.x,dy=target.y-a.y,d=Math.hypot(dx,dy)||.001;let reach=clamp(d,Math.abs(l1-l2)+.7,l1+l2-.7);dx/=d;dy/=d;let along=(l1*l1-l2*l2+reach*reach)/(2*reach),h=Math.sqrt(Math.max(0,l1*l1-along*along));return {a,b:pt(a.x+dx*along-dy*h*bend,a.y+dy*along+dx*h*bend),c:pt(a.x+dx*reach,a.y+dy*reach)};}
// A tapered, rounded anatomical volume, not a rotated rectangular sprite.
function segment(c,a,b,r1,r2,color,light,shade){let dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy);if(len<.001){oval(c,a.x,a.y,Math.max(r1,r2),Math.max(r1,r2),color);return;}let nx=-dy/len,ny=dx/len;c.beginPath();c.moveTo(a.x+nx*r1,a.y+ny*r1);c.bezierCurveTo(a.x+dx*.38+nx*r1,a.y+dy*.38+ny*r1,b.x+nx*r2,b.y+ny*r2,b.x+nx*r2,b.y+ny*r2);c.quadraticCurveTo(b.x+dx/len*r2,b.y+dy/len*r2,b.x-nx*r2,b.y-ny*r2);c.bezierCurveTo(a.x+dx*.35-nx*r1,a.y+dy*.35-ny*r1,a.x-nx*r1,a.y-ny*r1,a.x-nx*r1,a.y-ny*r1);c.quadraticCurveTo(a.x-dx/len*r1,a.y-dy/len*r1,a.x+nx*r1,a.y+ny*r1);c.closePath();c.fillStyle=color;c.fill();c.strokeStyle='#2b3035';c.lineWidth=.55;c.stroke();line(c,lerp(a,b,.2),lerp(a,b,.73),light,r2*.46);if(shade)line(c,pt(a.x-nx*r1*.6,a.y-ny*r1*.6),pt(b.x-nx*r2*.7,b.y-ny*r2*.7),shade,.6);}
function recoilLegacy(p,f){if(!f.recoil)return p;const o={...p},r=f.recoil,q=clamp(r.elapsed/r.seconds),dx=(r.targetX-r.startX)*.41*f.facing,now=(f.x-r.startX)*.41*f.facing;for(const[key,start]of[['rearFoot',0],['frontFoot',.45]]){const w=clamp((q-start)/.55);o[key]=pt(o[key].x+dx*recoilEase(w)-now,o[key].y-Math.sin(Math.PI*w)*3);}const lean=Math.sin(Math.PI*q)*3;o.chest=pt(o.chest.x-lean,o.chest.y+lean*.2);o.head=pt(o.head.x-lean,o.head.y+lean*.2);return o;}
export function poseFor(f,t,guardContact=null,bodyAim=0){
 if(f.flyLocomotionJoin&&!f.action&&!f.interruptedStrike&&t-f.flyLocomotionJoin.createdTime<f.flyLocomotionJoin.duration){const j=acceptedNeutral(f,t),p=v=>pt(v[0],-v[1]),base=poseFor({...f,flyLocomotionJoin:null},t,guardContact,bodyAim);return{...base,hip:p(j.center),chest:p(j.chest),head:p(j.head),frontFoot:p(j.strike_ankle),rearFoot:p(j.support_ankle),frontHand:p(j.near_wrist),rearHand:p(j.far_wrist),observedFrontKnee:p(j.strike_knee)};}

 if(f.action?.technique==='flyingknee'||(!f.action&&f.interruptedStrike?.action?.technique==='flyingknee')){const j=f.action?flyPose(f.action.elapsed).joints:interruptedPose(f.interruptedStrike,t-f.interruptedStrike.createdTime),p=v=>pt(v[0],-v[1]),base=poseFor({...f,action:null,interruptedStrike:null,recoil:null},t,guardContact,bodyAim);return{...base,hip:p(j.center),chest:p(j.chest),head:p(j.head),frontFoot:p(j.strike_ankle),rearFoot:p(j.support_ankle),frontHand:p(j.near_wrist),rearHand:p(j.far_wrist),observedFrontKnee:p(j.strike_knee)};}

 if(f.action?.technique==='frontkickLegacy')f={...f,action:{...f.action,technique:'frontkick'}};
 if(targetedGuard(f.action?.technique)&&f.pose!=='hit'){const j=targetedGuardPose(f.action.technique,f.action.elapsed),p=v=>({x:v[0],y:-v[1]});return{...poseFor({pose:'idle',motionTime:0},0),hip:p(j.center),chest:p(j.chest),head:p(j.head),frontFoot:p(j.strike_ankle),rearFoot:p(j.support_ankle),frontHand:p(j.near_wrist),rearHand:p(j.far_wrist),observedFrontKnee:p(j.strike_knee)};}

 if(f.action?.technique==='frontkick'&&Number.isFinite(f.action.elapsed)){const a=f.action,q=TECH_BY_ID.frontkick,active=q.active??.12,e=a.elapsed,phase=e<q.windup?'windup':e<q.windup+active?'active':'recovery',progress=phase==='windup'?e/q.windup:phase==='active'?(e-q.windup)/active:(e-q.windup-active)/q.recovery;f={...f,action:{...a,phase,phaseProgress:clamp(progress)}};bodyAim=a.frontkickAimY??bodyAim;}



  // A hit during authored footwork has a traced return rig, not legacyStart/End.
  // Legacy contact consumers must observe the currently drawn joints as well.
  if(jumpStateFor(f,t)){const j=jumpStateFor(f,t).joints,p=v=>pt(v[0],-v[1]),base=poseFor({...f,action:null,interruptedStrike:null,recoil:null},t,guardContact,bodyAim);return{...base,hip:p(j.center),chest:p(j.chest),head:p(j.head),frontFoot:p(j.strike_ankle),rearFoot:p(j.support_ankle),frontHand:p(j.near_wrist),rearHand:p(j.far_wrist),observedFrontKnee:p(j.strike_knee)};}
  if(f.interruptedStrike?.fourTrace&&!f.action){const s=f.interruptedStrike,j=interruptedPose(s,t-s.createdTime),p=v=>pt(v[0],-v[1]),base=poseFor({...f,interruptedStrike:null,recoil:null},t,guardContact,bodyAim);return{...base,hip:p(j.center),chest:p(j.chest),head:p(j.head),frontFoot:p(j.strike_ankle),rearFoot:p(j.support_ankle),frontHand:p(j.near_wrist),rearHand:p(j.far_wrist),observedFrontKnee:p(j.strike_knee)};}
 if(f.interruptedStrike&&!f.action){const s=f.interruptedStrike,a=s.legacyStart,b=s.legacyEnd,q=smooth((t-s.createdTime)/(s.duration||.2)),o=Object.fromEntries(Object.keys(b).map(k=>[k,a[k]&&b[k]&&typeof a[k].x==='number'&&typeof b[k].x==='number'?lerp(a[k],b[k],q):typeof a[k]==='number'&&typeof b[k]==='number'?mix(a[k],b[k],q):b[k]]));if(s.action?.technique==='cross'&&Number.isFinite(a.crossTraceWeight)){for(const k of['crossRearElbow','crossFrontElbow','crossFrontKnee','crossRearKnee'])o[k]=a[k];o.crossTraceWeight=a.crossTraceWeight*(1-q);o.crossRearFootAngle=(a.crossRearFootAngle||0)*(1-q);const scale=p=>Math.max(.24,Math.abs(1-2*p))*(1-2*p<0?-1:1),angle=a.crossRearFootAngle||0,startToe=a.rearFoot.y+10*scale(a.rearPivot)*Math.sin(angle)+3*Math.cos(angle);o.rearFoot=pt(o.rearFoot.x,startToe*(1-q)-10*scale(o.rearPivot)*Math.sin(o.crossRearFootAngle)-3*Math.cos(o.crossRearFootAngle));}if(s.action?.technique==='hook'&&Number.isFinite(a.hookTraceWeight)){for(const k of['hookNearShoulder','hookFarShoulder','hookNearHip','hookFarHip','hookFrontElbow','hookRearElbow','hookFrontKnee','hookRearKnee'])o[k]=a[k];o.hookTraceWeight=a.hookTraceWeight*(1-q);o.hookTorsoYaw=a.hookTorsoYaw;o.hookHeadBackWeight=(a.hookHeadBackWeight||0)*(1-q);o.hookRearFootAngle=(a.hookRearFootAngle||0)*(1-q);const scale=p=>Math.max(.24,Math.abs(1-2*p))*(1-2*p<0?-1:1),angle=a.hookRearFootAngle||0,startToe=a.rearFoot.y+10*scale(a.rearPivot)*Math.sin(angle)+3*Math.cos(angle);o.rearFoot=pt(o.rearFoot.x,startToe*(1-q)-10*scale(o.rearPivot)*Math.sin(o.hookRearFootAngle)-3*Math.cos(o.hookRearFootAngle));}return recoilLegacy(o,f);} 
 if(f.recoil)return recoilLegacy(poseFor({...f,recoil:null},t,guardContact,bodyAim),f);

 if(TECH_BY_ID[f.action?.technique]?.postureKind){
  const idle=poseFor({pose:'idle'},t),out={...idle,...newPosturePose(f.action.technique,f.action.elapsed,idle)};
  if(f.action.technique==='jumpkick'&&guardContact?.whiff){
   const e=f.action.elapsed,w=e<.4?smooth((e-.25)/.15):e<.52?1:1-smooth((e-.52)/.16),withdraw=clamp(12-guardContact.x,0,24);
   out.frontFoot=pt(mix(out.frontFoot.x,Math.min(out.frontFoot.x,guardContact.x+withdraw),w),out.frontFoot.y);
   // At crowded airborne misses, make room while both feet are off the floor.
   // Registration returns before the left foot lands, never by planted skating.
   for(const k of Object.keys(out))if(out[k]?.x!=null)out[k]=pt(out[k].x-withdraw*w,out[k].y);
  }
  if(f.action.technique==='crouchpunch'&&guardContact?.bodyHand){const a=f.action,w=a.phase==='windup'?smooth((a.phaseProgress-.65)/.35):a.phase==='active'?1:1-smooth(a.phaseProgress/.4);out.frontHand=pt(mix(out.frontHand.x,guardContact.x,w),out.frontHand.y);}
  if(f.action.technique==='crouchpunch'&&bodyAim){const a=f.action,w=a.phase==='windup'?smooth((a.phaseProgress-.65)/.35):a.phase==='active'?1:1-smooth(a.phaseProgress/.4);out.frontHand=pt(out.frontHand.x,out.frontHand.y+bodyAim*w);}
  return out;
 }
 t=f.motionTime??t;
 const a=f.action, id=a?.technique||'',phase=a?.phase,p=clamp(a?.phaseProgress||0),defense=id==='guard'||id==='sway',kicks=['frontkick','roundkick','sidekick','lowkick','highkick','knee'];
 let base={hip:pt(-2, -50),chest:pt(-5,-80),head:pt(-2,-94),rearFoot:pt(-18,-3),frontFoot:pt(17,-3),rearHand:pt(3,-82),frontHand:pt(17,-79),turn:0,bodyTurn:0,rearPivot:0,frontPivot:0,spinYaw:0,spinWeight:0,hookAngle:0,hookWeight:0,footPoint:0,footAngle:0,shoulderFit:0};
 base.hookElbow=ik(pt(base.chest.x+4,base.chest.y+2),base.frontHand,18,17,1).b;
 base.observedFrontKnee=ik(pt(base.hip.x+3,base.hip.y),base.frontFoot,26,25,-1).b;
 const idle=Math.sin(t*3)*.65;if(!a){base.chest.y+=idle;base.head.y+=idle;}
 let wind={...base,hip:pt(-5,-52),chest:pt(-9,-81),head:pt(-6,-95)},strike={...base,hip:pt(2,-50),chest:pt(2,-80),head:pt(6,-94)};
 if(kicks.includes(id)){
  if(!['roundkick','spinkick','highkick'].includes(id))base.rearFoot=pt(-13,-3);wind={...base,hip:pt(-10,-51),chest:pt(-13,-82),head:pt(-10,-96),frontFoot:pt(8,-35),frontHand:pt(13,-82),rearHand:pt(-4,-86)};
  strike={...wind,hip:pt(-9,-53),chest:pt(-19,-82),head:pt(-16,-96),frontFoot:pt(43,-54),footAngle:-1.15};
  if(id==='lowkick')strike={...strike,chest:pt(-8,-84),head:pt(-5,-98),frontFoot:pt(37,-27),footAngle:.2};
  if(id==='highkick'){wind.footPoint=1;strike={...strike,chest:pt(-28,-78),head:pt(-27,-92),frontFoot:pt(23,-92),footPoint:1,footAngle:0};}
  if(id==='sidekick')strike={...strike,chest:pt(-29,-77),head:pt(-27,-91),frontFoot:pt(44,-57),frontHand:pt(-3,-77),turn:1,footAngle:-1.5};
  if(id==='roundkick'){
   wind={...base,hip:pt(-9,-49),chest:pt(-13,-80),head:pt(-10,-94),frontFoot:pt(-17,-42),frontHand:pt(12,-84),rearHand:pt(-4,-87),bodyTurn:-.3,rearPivot:.2,footAngle:1.1};
   strike={...base,hip:pt(-5,-51),chest:pt(-17,-82),head:pt(-13,-96),frontFoot:pt(40,-66),frontHand:pt(4,-84),rearHand:pt(-34,-69),turn:.9,bodyTurn:1,rearPivot:1,footAngle:.15};
  }
  if(id==='knee')strike={...strike,hip:pt(0,-54),chest:pt(1,-84),head:pt(6,-98),frontFoot:pt(12,-36),frontHand:pt(30,-86),rearHand:pt(18,-89),footAngle:.8};
 }else if(id==='guard'){
  // Both fists close around the temples; forearms cover the head and body.
  // Knees soften without moving either planted foot. This is an equipped
  // action, not an idle pose or a random visual chance to block.
  strike={...base,hip:pt(-4,-48),chest:pt(-7,-79),head:pt(-5,-93),frontHand:pt(8,-95),rearHand:pt(-1,-97)};
 }else if(id==='sway'){
  // Shift weight over the rear leg, keeping the two soles on their marks.
  // The head leaves the incoming punch line instead of crouching or sliding.
  strike={...base,hip:pt(-8,-47),chest:pt(-24,-75),head:pt(-32,-88),frontHand:pt(-9,-83),rearHand:pt(-24,-90)};
 }else if(id==='jab'){strike.frontHand=pt(49,-80);strike.chest=pt(3,-81);strike.head=pt(6,-95);wind.frontHand=pt(12,-81);}
 else if(id==='cross'){
  // A rear straight is driven by the hip and shoulder, not a leading elbow.
  // Chamber at cheek height, then send the fist along one horizontal line.
  wind={...base,hip:pt(-5,-49),chest:pt(-8,-80),head:pt(-5,-94),rearHand:pt(-2,-86),frontHand:pt(12,-93),bodyTurn:-.12};
  strike={...base,hip:pt(3,-48),chest:pt(4,-80),head:pt(6,-94),rearHand:pt(43,-86),frontHand:pt(12,-93),turn:1,bodyTurn:1,rearPivot:.3};
 }
 else if(id==='hook'){
  // Lead hook: open the elbow to the side, then rotate a bent arm across the
  // horizontal plane. Its depth projection is intentionally not a straight IK.
  wind={...base,hip:pt(-4,-49),chest:pt(-7,-80),head:pt(-4,-94),rearHand:pt(2,-92),bodyTurn:.25,hookAngle:1.25,hookWeight:1,rearPivot:.1};
  strike={...base,hip:pt(2,-48),chest:pt(2,-80),head:pt(5,-94),rearHand:pt(5,-93),turn:.7,bodyTurn:-.8,hookAngle:-.2,hookWeight:1,rearPivot:.65};
 }
 // Short-range punches finish on the real guard forearm rather than drawing
 // through it. IK still uses the same arm lengths and remains fully connected.
 if(guardContact&&['jab','cross','hook'].includes(id)){strike[id==='cross'?'rearHand':'frontHand']=guardContact;}
 if(id==='cross'){
  // At crowded/blocked range, make room with the torso instead of folding
  // the elbow in front of the fist. Feet and gameplay positions stay fixed.
  const ordinaryRoom=Math.min(0,strike.rearHand.x-34.2-(strike.chest.x+5.5)),room=guardContact?.whiff?mix(ordinaryRoom,-12,guardContact.whiffWeight):ordinaryRoom;
  for(const key of ['chest','head','frontHand']){strike[key]=pt(strike[key].x+room,strike[key].y);wind[key]=pt(wind[key].x+room*.45,wind[key].y);}
  strike.hip=pt(strike.hip.x+room*.25,strike.hip.y+Math.min(3,-room*.1));
  wind.rearHand=pt(wind.rearHand.x+room*.45,strike.rearHand.y);
 }

 if(guardContact?.whiff&&id==='highkick')strike.frontFoot=pt(Math.min(strike.frontFoot.x,guardContact.x),mix(strike.frontFoot.y,-100,guardContact.whiffWeight));
 if(guardContact?.lowBody&&id==='sidekick')strike.frontFoot=pt(Math.min(strike.frontFoot.x,guardContact.x),strike.frontFoot.y);
 if(id==='roundkick'&&guardContact){
  const footX=Math.min(strike.frontFoot.x,guardContact.x),room=-Math.min(14,(strike.frontFoot.x-footX)*.6);
  strike.frontFoot=pt(footX,strike.frontFoot.y);
  for(const key of ['hip','chest','head','frontHand','rearHand']){strike[key]=pt(strike[key].x+room,strike[key].y);wind[key]=pt(wind[key].x+room*.35,wind[key].y);}
  strike.hip.y+=Math.min(2,-room*.1);
 }
 if(id==='hook'&&guardContact){
  const hand=hookArmRig(strike).c,room=Math.min(0,guardContact.x-hand.x);
  for(const key of ['chest','head','rearHand'])strike[key]=pt(strike[key].x+room,strike[key].y);
  strike.hip=pt(strike.hip.x+room*.2,strike.hip.y+Math.min(2,-room*.08));
 }
 const blend=(a,b,q)=>Object.fromEntries(Object.keys(a).map(k=>[k,typeof a[k]==='number'?mix(a[k],b[k],q):lerp(a[k],b[k],q)]));
 let out=base;
 // Last 28% of anticipation extends continuously; recovery rechambers before planting.
 const chamber=id==='cross'?.36:id==='roundkick'?.4:id==='hook'?.34:.72;
 if(phase==='windup')out=defense?blend(base,strike,smooth(p)):p<chamber?blend(base,wind,smooth(p/chamber)):blend(wind,strike,smooth((p-chamber)/(1-chamber)));
 if(phase==='active')out=blend(wind,strike,1);
 // Defense returns along the same planted stance, without a punch-like lunge.
 if(phase==='recovery')out=defense?blend(strike,base,smooth(p)):p<.48?blend(strike,wind,smooth(p/.48)):blend(wind,base,smooth((p-.48)/.52));
 // Roundhouse: pivot on the planted support ankle, open the hip, sweep
 // the shin through a curved path, follow through, then re-chamber in front.
 // This is not the front kick's straight extension or the spinning back kick.
 if(id==='roundkick'){
  const follow={...strike,hip:pt(strike.hip.x+2,strike.hip.y+2),chest:pt(strike.chest.x+6,-81),head:pt(strike.head.x+5,-95),frontFoot:pt(strike.frontFoot.x-5,-55),bodyTurn:1.12,footAngle:.35};
  const chambered={...base,hip:pt(-8,-49),chest:pt(-12,-81),head:pt(-9,-95),frontFoot:pt(9,-32),frontHand:pt(12,-83),rearHand:pt(-3,-86),bodyTurn:.3,rearPivot:.4,footAngle:.75};
  if(phase==='windup'&&p>=chamber){const q=smooth((p-chamber)/(1-chamber));out=blend(wind,strike,q);out.frontFoot=arc(wind.frontFoot,pt(Math.min(19,strike.frontFoot.x-5),-103),strike.frontFoot,q);}
  if(phase==='active')out=blend(strike,follow,smooth(p));
  if(phase==='recovery'){const q=smooth(p/.58);out=p<.58?blend(follow,chambered,q):blend(chambered,base,smooth((p-.58)/.42));if(p<.58)out.frontFoot=arc(follow.frontFoot,pt(5,-60),chambered.frontFoot,q);}
 }
 if(id==='hook'){
  const follow={...strike,chest:pt(strike.chest.x+1,-80),head:pt(strike.head.x+1,-94),bodyTurn:-1,hookAngle:-.55,rearPivot:.8};
  const chambered={...base,rearHand:pt(3,-91),frontHand:pt(14,-91),bodyTurn:-.15,rearPivot:.2};
  if(phase==='active')out=blend(strike,follow,smooth(p));
  if(phase==='recovery')out=p<.64?blend(follow,chambered,smooth(p/.64)):blend(chambered,base,smooth((p-.64)/.36));
  const rig=hookArmRig(out);out.hookElbow=rig.b;out.frontHand=rig.c;
 }
 if(guardContact?.lowBody){const w=phase==='windup'?smooth((p-chamber)/(1-chamber)):phase==='active'?1:1-smooth(p/.48);out.footAngle=mix(out.footAngle,id==='roundkick'?.45:-.25,w);}
 if(bodyAim&&['frontkick','roundkick','sidekick'].includes(id)){const w=phase==='windup'?smooth((p-chamber)/(1-chamber)):phase==='active'?1:1-smooth(p/.48);out.frontFoot=pt(out.frontFoot.x,out.frontFoot.y+bodyAim*w);}
 if(id==='hook')out=fullbodyHookPose(a,base).pose;
 if(id==='cross')out=observedCrossPose(a,base,wind,strike).pose;
 if(['highkick','roundkick'].includes(id))out=observedKickPose(a,base,wind,{...strike,frontFoot:pt(strike.frontFoot.x,strike.frontFoot.y+bodyAim)}).pose;
 if(id==='roundkick'&&guardContact?.lowBody){const w=phase==='windup'?smooth((p-chamber)/(1-chamber)):phase==='active'?1:1-smooth(p/.48);out.footAngle=mix(out.footAngle,.45,w);}
 if(!a&&f.pose==='walk'){const gait=f.walkTime??t;let s=Math.sin(gait*8);out.frontFoot.x+=s*7;out.rearFoot.x-=s*7;out.frontFoot.y-=Math.max(0,s)*3;out.rearFoot.y-=Math.max(0,-s)*3;out.hip.y+=Math.cos(gait*16)*.5;}
 if(!a&&f.pose==='guard'){out={...out,hip:pt(-4,-48),chest:pt(-7,-79),head:pt(-5,-93),frontHand:pt(8,-95),rearHand:pt(-1,-97)};}
 if(!a&&(f.pose==='sway'||f.pose==='dodge')){out={...out,hip:pt(-8,-47),chest:pt(-24,-75),head:pt(-32,-88),frontHand:pt(-9,-83),rearHand:pt(-24,-90)};}
 if(f.pose==='hit'){out={...base};out.chest=pt(-15,-77);out.head=pt(-17,-91);out.frontHand=pt(9,-70);}
 if(f.pose==='win'){out.frontHand=pt(10,-117);out.rearHand=pt(-16,-116);}
 if(id==='frontkick'&&f.pose!=='hit'&&Number.isFinite(a?.contactLimit)){out={...out,frontFoot:{...out.frontFoot}};for(let n=0;n<6;n++){const excess=frontkickGeometryFromPose(out).leading.x-a.contactLimit;if(excess<=1e-7)break;out.frontFoot.x-=excess;}}
 return out;
}
function sweepUntagged_foot(c,p,angle,P,far,pivot=0,pointed=0,projection=1){c.save();c.translate(p.x,p.y);c.rotate(angle);const foreshorten=mix(1,-1,pivot);c.scale((foreshorten<0?-1:1)*Math.max(.24,Math.abs(foreshorten))*projection,1);if(pointed>.01){
 // A plantar-flexed bare foot, not the standing foot rotated into a spear.
 // Rounded heel, instep and toe pads remain attached to the actual IK ankle.
 c.beginPath();c.moveTo(-2,-2);c.bezierCurveTo(1,-2.1,3,-.9,5.2,-1.2);c.quadraticCurveTo(8.4,-1.6,9,.3);c.quadraticCurveTo(9.8,2.1,7.7,2.7);c.quadraticCurveTo(5.8,3.1,3.8,2.1);c.quadraticCurveTo(1.2,1.4,-.7,3.1);c.quadraticCurveTo(-3.5,3.8,-3.2,.9);c.quadraticCurveTo(-3.1,-.8,-2,-2);c.closePath();c.fillStyle=far?P.shade:P.skin;c.fill();c.strokeStyle='#253039';c.lineWidth=.55;c.stroke();line(c,pt(1,-.8),pt(6.5,-.1),P.light,.7);line(c,pt(7.4,.3),pt(7.7,1.5),P.shade,.45);
 }else{path(c,[pt(-3,-2),pt(2,-2),pt(4,0),pt(9,1),pt(10,3),pt(-4,3)],far?P.shade:P.skin);line(c,pt(3,1),pt(8,2),P.light,.7);}c.restore();}

function continuousSupportFoot(c,p,angle,P,far,pivot){
 const scale=1-2*pivot;c.save();c.translate(p.x,p.y);c.rotate(angle);
 if(Math.abs(scale)<.28){const alpha=1-smooth(Math.abs(scale)/.28);c.save();c.globalAlpha*=alpha;oval(c,0,1,2.3,1.8,far?P.shade:P.skin);c.restore();}
 if(Math.abs(scale)>1e-7){c.scale(scale,1);foot(c,pt(0,0),0,P,far);}c.restore();
}
// Same fixed26/25 leg and six-vertex foot used by the original kick drawing.
export function frontkickGeometryFromPose(o){
 const leg=ik(upperBodyRig(o).nearHip,o.frontFoot,26,25,-1),angle=o.footAngle||0,co=Math.cos(angle),si=Math.sin(angle),projection=(1-2*(o.frontPivot||0)),scale=(projection<0?-1:1)*Math.max(.24,Math.abs(projection));
 const corners=[[-3,-2],[2,-2],[4,0],[9,1],[10,3],[-4,3]].map(([x,y])=>pt(leg.c.x+co*x*scale-si*y,leg.c.y+si*x*scale+co*y)),points=[];
 for(let i=0;i<corners.length;i++)for(let n=0;n<4;n++)points.push(lerp(corners[i],corners[(i+1)%corners.length],n/4));
 return {leg,corners,points,leading:points.reduce((a,b)=>a.x>b.x?a:b)};
}
export function frontkickGeometry(f,time=0){const pose=poseFor(f,time);return {...frontkickGeometryFromPose(pose),pose};}
function sweepUntagged_leg(c,hip,target,P,far,angle=0,pivot=0,pointed=0,chain=null,continuous=false){const s=chain||ik(hip,target,26,25,-1);const skin=P.outfit==='gi'?(far?P.cloth:P.bright):(far?P.shade:P.skin),light=P.outfit==='gi'?P.bright:(far?P.skin:P.light);
 const thigh=()=>segment(c,s.a,s.b,5.5,3.6,skin,light,P.shade),shin=()=>segment(c,s.b,s.c,3.5,2.1,skin,light,P.shade),shorts=()=>segment(c,s.a,lerp(s.a,s.b,.53),6,5.1,far?P.cloth:P.bright,P.cloth),end=()=>{const wrap=lerp(s.b,s.c,.88);segment(c,wrap,s.c,2.3,2.1,P.wrap,'#fff5de');const footAngle=mix(angle,Math.atan2(s.c.y-s.b.y,s.c.x-s.b.x)+.08,pointed);if(continuous)continuousSupportFoot(c,s.c,footAngle,P,far,pivot);else foot(c,s.c,footAngle,P,far,pivot,pointed,s.footProjection??1);};
 // A source-hidden lower leg is still connected, but lies behind its nearer
 // thigh and the torso. Never expose a collapsing invented foot at the knee.
 thigh();shin();shorts();end();
 // Only the overlapping upper-thigh volume is brought forward gradually;
 // the connected lower limb never fades out or changes order in one tick.
 if(s.occludedShinWeight>0){c.save();c.globalAlpha*=s.occludedShinWeight;thigh();shorts();c.restore();}return s;}

function sweepUntagged_hand(c,p,elbow,P,far){let a=Math.atan2(p.y-elbow.y,p.x-elbow.x);c.save();c.translate(p.x,p.y);c.rotate(a);path(c,[pt(-2,-2.7),pt(1.5,-3),pt(4,-1.8),pt(4,1.7),pt(1,3),pt(-2,2.2)],far?P.shade:P.skin);line(c,pt(1,-2),pt(1,1),P.shade,.5);c.restore();}
function sweepUntagged_arm(c,shoulder,target,P,far,bend=1,chain=null){let s=chain||ik(shoulder,target,18,17,bend),skin=far?P.shade:P.skin;segment(c,s.a,s.b,3.8,2.7,skin,far?P.skin:P.light,P.shade);if(['tee','gi'].includes(P.outfit))segment(c,s.a,lerp(s.a,s.b,P.outfit==='gi'?1:.48),3.9,3,far?P.cloth:P.bright,P.cloth);segment(c,s.b,s.c,2.9,1.8,P.outfit==='gi'?(far?P.cloth:P.bright):skin,far?P.skin:P.light,P.shade);segment(c,lerp(s.b,s.c,.72),s.c,2.2,2.2,P.wrap,'#fff4dd');hand(c,s.c,s.b,P,far);}
export function upperBodyRig(o){
 if(Number.isFinite(o.hookTraceWeight)){const base=upperBodyRig({...o,hookTraceWeight:undefined}),w=o.hookTraceWeight;return Object.fromEntries(Object.entries(base).map(([k,v])=>[k,lerp(v,o["hook"+k[0].toUpperCase()+k.slice(1)],w)]));}
 const turn=o.bodyTurn||0,spin=o.spinWeight||0,yaw=o.spinYaw||0,cos=Math.cos(yaw),sin=Math.sin(yaw);
 const fit=p=>{if(!o.shoulderFit)return p;const root=pt(o.chest.x,o.chest.y+1),dx=p.x-root.x,dy=p.y-root.y,d=Math.hypot(dx,dy);return d<=6?p:lerp(p,pt(root.x+dx*6/d,root.y+dy*6/d),o.shoulderFit);};
 return {nearShoulder:fit(pt(o.chest.x+mix(4-8*turn,4*cos,spin),o.chest.y+2+2*sin*spin)),farShoulder:fit(pt(o.chest.x+mix(-4+9.5*turn,-4*cos,spin),o.chest.y+2-6*turn-2*sin*spin)),
  nearHip:pt(o.hip.x+mix(3-6*turn,3*cos,spin),o.hip.y),farHip:pt(o.hip.x+mix(-3+6*turn,-3*cos,spin),o.hip.y+1)};
}
export function hookArmRig(o){
 if(Number.isFinite(o.hookTraceWeight)){const a=upperBodyRig(o).nearShoulder,s=ik(a,o.frontHand,18,17,1);return fullbodyHookRig({technique:"hook"},{frontArm:s,hookPose:o}).frontArm;}
 const a=upperBodyRig(o).nearShoulder,angle=o.hookAngle||0,weight=o.hookWeight||0;
 const standard=ik(a,o.frontHand,18,17,1),b=pt(a.x+18*Math.cos(angle),a.y-18*Math.sin(angle)*.58);
 const c=pt(b.x+17*Math.cos(angle+Math.PI/2),b.y-17*Math.sin(angle+Math.PI/2)*.58);
 return {a,b:lerp(standard.b,b,weight),c:lerp(standard.c,c,weight)};
}
export function crossProjectedArmRig(o){const a=upperBodyRig(o).farShoulder,chain=ik(a,o.rearHand,18,17,1);return observedStrikeRig({technique:'cross'},{rearArm:chain,crossPose:o})?.rearArm||chain;}
export function crossContactPoint(distance){return pt(clamp(Math.abs(distance)*.41-5,18,43)-8*smooth((Math.abs(distance)-TECH_BY_ID.cross.range)/24),-86);}
export function combatDrawX(f,battle,index,postResultSeconds=0){const e=(battle?.events||[]).filter(e=>e.fighter===index&&e.type==='hit'&&(TECH_BY_ID[e.technique]?.postureKind||e.receiverPosture)).at(-1),age=e?(battle.tick-e.tick)/60+(battle.done?Math.max(0,postResultSeconds):0):Infinity;return e&&age>=0&&age<.12?mix(e.receiverX??f.x,f.x,smooth(age/.12)):f.x;}
// Hook-only shared current-context pose. No render cache or future target.
export function hookPaintPose(f,time=0,battle=null){
 const o=poseFor(f,time);if(f.action?.technique!=='hook'||!battle)return o;
 const i=battle.fighters.indexOf(f),d=battle.fighters[1-i];if(!d||d.action?.technique!=='guard'||d.action.phase!=='active'||['hit','down'].includes(d.pose))return o;
 const target=poseFor(d,time),u=upperBodyRig(target),g=ik(u.nearShoulder,target.frontHand,18,17,1),face=f.facing??1,df=d.facing??-face,gap=(d.x-f.x)*.41,tf=p=>pt((gap+df*p.x)/face,p.y),a=tf(g.b),b=tf(g.c),chain=hookArmRig(o),tip=punchOutline(chain),ys=tip.map(v=>v[1]),lo=Math.min(...ys)-3,hi=Math.max(...ys)+3;
 // Do not lift a low source punch onto a high guard. Only truncate an actual
 // overlap in the forearm's vertical interval; near face is a capsule proxy.
 if(Math.max(a.y,b.y)<lo||Math.min(a.y,b.y)>hi)return o;
 const yy=clamp(o.frontHand.y,Math.min(a.y,b.y),Math.max(a.y,b.y)),q=clamp((yy-a.y)/(b.y-a.y||1)),limit=mix(a.x,b.x,q)-3,leading=Math.max(...tip.map(v=>v[0])),dx=leading-chain.a.x;
 if(!(dx>0&&leading>limit))return o;
 const scale=clamp((limit-chain.a.x)/dx,.12,1),w=o.hookTraceWeight,shortened={...o};shortened.frontHand=lerp(chain.a,o.frontHand,scale);shortened.hookFrontElbow=lerp(chain.a,o.hookFrontElbow,scale);shortened.hookGuardScale=scale;shortened.hookTraceWeight=w;return shortened;
}
// Source arm and the receiver are rendered through the same native painters.
// Tagged head fills include existing cosmetic head fills; not anatomical skin-only.
export function hammerActualContact(att,def,time=0,battle=null){
 if(att.action?.technique!=='hammerfist')return null;
 const view=battle&&battle.fighters.includes(att)&&battle.fighters.includes(def)?battle:{fighters:[att,def],events:[],time,tick:Math.round(time*60),done:false},ai=view.fighters.indexOf(att),di=view.fighters.indexOf(def),face=att.facing??1,root=28+clamp(traceDisplayRoot(view,att,ai,0)/800)*328,p=hammerGamePose(att.action.elapsed),j=p.joints;
 const ops=sweepCommonOperations(j,1,ai%2!==0,att.appearance),hand=ops.find(op=>op.contactPart==='nearArm'&&op[0]==='oval'&&Math.hypot(op[1][0]-j.near_hand[0]*2,op[1][1]+j.near_hand[1]*2)<1e-7&&Math.abs(op[2]-6.8)<1e-7);
 if(!hand)return{reaches:false,supported:false,target:'head',reason:'same-painter-fist-not-found'};
 const angle=hand[5]||0,co=Math.cos(angle),si=Math.sin(angle),polygon=Array.from({length:96},(_,i)=>{const q=i*Math.PI*2/96,x=hand[2]*Math.cos(q),y=hand[3]*Math.sin(q);return[root+face*(hand[1][0]+co*x-si*y)/2,189+(hand[1][1]+si*x+co*y)/2];});
 const guard=def.action?.phase==='active'&&['guard','highguard'].includes(def.action.technique)&&!['hit','down'].includes(def.pose);
 const collect=d=>{const v={...view,fighters:view.fighters.map((f,k)=>k===di?d:f)},g=sweepGeometryContext(.04,part=>/head/i.test(part||'')&&part!=='hookHeadDecoration'||guard&&/nearArm|nearHand|farArm|farHand/i.test(part||''));fighter(g.context,d,di,time,[],v,null,0,true,null,true,true);return g.records.filter(r=>r.kind==='fill').flatMap(r=>r.polygons).map(points=>({kind:'polygon',points}));};
 const surfaces=collect(def),overlap=surfaces.some(s=>punchTouchesSurface(polygon,s)),did=def.action?.phase==='active'&&def.techniques?.includes(def.action.technique)?def.action.technique:null,evades=['sway','crouch','crouchpunch','crouchlowkick'].includes(did),standing=evades?collect({...def,action:null,interruptedStrike:null,pose:'idle'}):[],evasionEligible=standing.some(s=>punchTouchesSurface(polygon,s));
 return{reaches:overlap||evasionEligible,geometryOverlaps:overlap,evasionEligible,supported:surfaces.length>0,target:'head',punch:polygon,surfaces,point:[face*j.near_hand[0],j.near_hand[1]],receiver:[],sourceIndex:p.sourceIndex,sourceElapsed:p.sourceElapsed,attackerElapsed:att.action.elapsed,geometry:'same current approved-body fist ellipse96 vs actual tagged receiver fill; cosmetic head included',limits:['source fist386-389 provisional active design; no anatomical ulnar claim','receiver sampled at current microstep, not continuous swept target']};
}

export function flyActualContact(att,def,time=0,battle=null){
 if(att.action?.technique!=='flyingknee')return null;
 const view=battle&&battle.fighters.includes(att)&&battle.fighters.includes(def)?battle:{fighters:[att,def],events:[],time,tick:Math.round(time*60),done:false},ai=view.fighters.indexOf(att),di=view.fighters.indexOf(def),face=att.facing??1,root=28+clamp(traceDisplayRoot(view,att,ai,0)/800)*328,p=flyPose(att.action.elapsed),j=p.joints;
 const polygon=Array.from({length:96},(_,i)=>{const q=i*Math.PI*2/96;return[root+face*(j.strike_knee[0]+3.6*Math.cos(q)),189-j.strike_knee[1]+3.6*Math.sin(q)]});
 const guard=def.action?.phase==='active'&&['midguard'].includes(def.action.technique)&&!['hit','down'].includes(def.pose);
 const collect=d=>{const v={...view,fighters:view.fighters.map((f,k)=>k===di?d:f)},g=sweepGeometryContext(.04,part=>/body|torso|chest/i.test(part||'')||guard&&/nearArm|nearHand|farArm|farHand/i.test(part||''));fighter(g.context,d,di,time,[],v,null,0,true,null,true,true);return g.records.filter(r=>r.kind==='fill').flatMap(r=>r.polygons).map(points=>({kind:'polygon',points}));};
 const surfaces=collect(def),overlap=surfaces.some(s=>punchTouchesSurface(polygon,s)),did=def.action?.phase==='active'&&def.techniques?.includes(def.action.technique)?def.action.technique:null,evades=[].includes(did),standing=evades?collect({...def,action:null,interruptedStrike:null,pose:'idle'}):[],evasionEligible=standing.some(s=>punchTouchesSurface(polygon,s));
 return{reaches:overlap||evasionEligible,geometryOverlaps:overlap,evasionEligible,supported:surfaces.length>0,target:'body',punch:polygon,surfaces,point:[face*j.strike_knee[0],j.strike_knee[1]],receiver:[],sourceIndex:p.sourceIndex,sourceElapsed:p.sourceElapsed,attackerElapsed:att.action.elapsed,geometry:'same approved-body knee circle radius3.6 polygon96 vs actual tagged body and active midguard fills',limits:['flying knee displayed keys17-27 provisional active design; original video absent','receiver sampled at current microstep, not continuous swept target']};
}

export function hookActualContact(att,def,time=0,battle=null){
 if(att.action?.technique!=='hook')return null;
 const view=battle&&battle.fighters.includes(att)&&battle.fighters.includes(def)?battle:{fighters:[att,def],events:[],time,tick:Math.round(time*60),done:false},i=view.fighters.indexOf(att),j=view.fighters.indexOf(def),face=att.facing??1,root=28+clamp(att.x/800)*328,o=hookPaintPose(att,time,view),polygon=punchOutline(hookArmRig(o)).map(v=>[root+face*v[0],189+v[1]]),guard=def.action?.technique==='guard'&&def.action.phase==='active'&&!['hit','down'].includes(def.pose);
 const collect=d=>{const v={...view,fighters:view.fighters.map((f,k)=>k===j?d:f)},g=sweepGeometryContext(.04,part=>(/head/i.test(part||'')&&part!=='hookHeadDecoration')||(guard&&/nearArm|nearHand/i.test(part||'')));fighter(g.context,d,j,time,[],v,null,0,true,null,true,true);return g.records.filter(r=>r.kind==='fill').flatMap(r=>r.polygons).map(points=>({kind:'polygon',points}));};
 const surfaces=collect(def),overlap=surfaces.some(s=>punchTouchesSurface(polygon,s)),defenseId=def.action?.phase==='active'&&def.techniques?.includes(def.action.technique)?def.action.technique:null,evades=['sway','crouch','crouchpunch','crouchlowkick'].includes(defenseId),standing=evades?collect({...def,action:null,interruptedStrike:null,pose:'idle'}):[],evasionEligible=evades&&standing.some(s=>punchTouchesSurface(polygon,s));
 return{reaches:overlap||evasionEligible,geometryOverlaps:overlap,evasionEligible,supported:surfaces.length>0,target:'head',punch:polygon,surfaces,guardScale:o.hookGuardScale??1,attackerElapsed:att.action.elapsed,receiverElapsed:def.action?.elapsed??null,coordinateSystem:'native draw pixels; same displayed hook pose and tagged receiver fills',limits:['cosmetic head fills included','guard stop uses existing forearm capsule approximation','no 3D contact reconstruction']};
}

export function bodyUppercutIncomingPunch(att,def,time=0,battle=null){
 if(att.action?.technique==='hook')return hookActualContact(att,def,time,battle);
 const sweep=sweepIncomingStrike(att,def,time,battle);if(sweep)return sweep;
 if(!['jab','cross','crouchpunch'].includes(att.action?.technique))return null;
 const bf=backfistReceiving(def,time),chin=chinReceivingPose(def,time),receiver=bf||chin||r3ReceivingPose(def,time);if(!receiver)return null;
 const id=att.action.technique,target=TECH_BY_ID[id].target;if(bf&&target!=='head')return null;let chain;if(isFourTrace(id)){const p=fourTracePose(id,att.action.elapsed,att.action.contactLimit).rig.points,c=p.leftHand,w=p.leftWrist;chain={c,b:Math.hypot(w.x-c.x,w.y-c.y)>.1?w:p.leftElbow};}else{const contact=id==='cross'?crossContactPoint(def.x-att.x):null,o=poseFor(att,time,contact),rig=upperBodyRig(o);chain=id==='cross'?crossProjectedArmRig(o):id==='hook'?hookArmRig(o):ik(rig.nearShoulder,o.frontHand,18,17,1);}
 const attackerDrawX=combatDrawX(att,battle,battle?.fighters.indexOf(att)),receiverDrawX=combatDrawX(def,battle,battle?.fighters.indexOf(def)),face=att.facing??1,defFace=def.facing??-face,offset=(attackerDrawX-receiverDrawX)*.41,world=p=>[offset+face*p[0],p[1]],point=punchOutline(chain).map(world),surfaces=(bf?(target==='head'?backfistHeadSurfaces(bf.joints,bf.headTilt??0):[]):chin?chinReceivingSurfaces(chinUppercutRow(receiver.joints,receiver.frameIndex,receiver.customWeight,{groundFeet:true}),target):r3ReceivingSurfaces(receiver,target)).map(s=>s.kind==='polygon'?{...s,points:s.points.map(p=>[p[0]*defFace,p[1]])}:{...s,center:[s.center[0]*defFace,s.center[1]],...(s.angle===undefined?{}:{angle:s.angle*defFace})});
 return {reaches:surfaces.some(s=>bf?backfistPunchTouchesSurface(point,s):punchTouchesSurface(point,s)),target,attackerDrawX,receiverDrawX,punch:point,surfaces,receiverStage:receiver.stage,receiverFrame:receiver.sourceIndex,receiverWeight:receiver.customWeight,attackerElapsed:att.action.elapsed,receiverElapsed:def.action?.elapsed??null,coordinateSystem:'draw pixels relative to receiver root, +y down'};
}
function dutchReceivingPose(f,time){if(f.finishFallJoints)return null;if(f.action?.technique==='dutchlow')return dutchlowPose(f.action.elapsed,f.action.contactLimit);if(f.interruptedStrike?.action?.technique==='dutchlow')return dutchlowInterrupted(f.interruptedStrike,time-f.interruptedStrike.createdTime);return null;}
// Visible anatomical head fills for the existing legacy/retargeted receivers.
// The strike's approved fist never changes to chase these receiver poses.
function chinLegacyHeadSurface(o,spin=false,registration={x:0,y:0}){
 const h=o.head,s=o.chest,translate=poly=>poly.map(v=>[h.x+registration.x+v[0],h.y+registration.y+v[1]]);
 if(spin&&o.headView==='front')return{kind:'polygon',points:translate([[-5,-5],[0,-7],[5,-5],[6,1],[4,6],[0,8],[-4,6],[-6,1]])};
 const yaw=spin?(o.headView.includes('back')?Math.PI:o.headView.includes('left')?Math.PI/2:0):(o.spinYaw||0),weight=spin?o.weight:(o.spinWeight||0);
 if(weight>.5&&Math.cos(yaw)<-.25)return{kind:'polygon',points:translate([[-5,-5],[0,-8],[5,-5],[6,2],[3,7],[-3,7],[-6,2]])};
 const flip=(weight>.5?Math.sin(yaw)>.3:(o.turn||0)>1.4)?-1:1,a=Math.atan2(s.x-h.x,Math.abs(s.y-h.y))*.25;
 return{kind:'polygon',points:translate([[-5,-6],[1,-7],[5,-4],[5,0],[7,2],[5,3],[5,6],[1,8],[-3,6],[-5,2]].map(v=>[flip*(v[0]*Math.cos(a)-v[1]*Math.sin(a)),v[0]*Math.sin(a)+v[1]*Math.cos(a)]))};
}
function chinSpinTarget(f,other,battle){
 const event=(battle?.events||[]).filter(e=>e.attacker===battle.fighters.indexOf(f)&&e.technique===(f.action.skillId||f.action.technique)&&e.tick>=(f.action.startedTick??-Infinity)).at(-1),gap=Math.abs((event?.receiverX??other.x)-(event?.attackerX??f.x))*.41,guarding=other.action?.technique==='guard'?other.action:null,guardWeight=guarding?(guarding.phase==='windup'?smooth(guarding.phaseProgress):guarding.phase==='active'?1:1-smooth(guarding.phaseProgress)):0,blockWeight=strikeTarget(f.action.technique)==='head'?(event?(event.type==='block'?1:0):guardWeight):0,rangeWeight=1-smooth((gap-(152+12)*.41)/(24*.41));
 if(rangeWeight<=0)return null;const natural=spinPlacement({...f.action,elapsed:SPIN_TIMING.windup}),boundary=natural.x+SPIN_PLACEMENT.contactX*natural.scale;return mix(boundary,gap-4-6*blockWeight,rangeWeight);
}
export function chinUppercutActualContact(att,def,time=0,battle=null){
 if(!chinUppercut(att.action?.technique))return null;
 const p=chinUppercutPose(att.action.elapsed),row=chinUppercutRow(p.joints,p.frameIndex,p.customWeight,{groundFeet:true}),cp=chinReceivingPose(def,time),bp=r3ReceivingPose(def,time),axeCenter=scopedAxeUppercutCenter(def,time,battle);let surfaces;
 const bf=backfistGeneratedReceiving(def,time),dutch=dutchReceivingPose(def,time);if(dutch)surfaces=dutchHeadSurfaces(dutch,{appearance:def.appearance});else if(bf)surfaces=backfistHeadSurfaces(bf.joints,bf.headTilt??0);else if(cp)surfaces=chinReceivingSurfaces(chinUppercutRow(cp.joints,cp.frameIndex,cp.customWeight,{groundFeet:true}),'head');
 else if(bp)surfaces=r3ReceivingSurfaces(bp,'head');
 else if(axeCenter){const h=axeCenter;surfaces=[{kind:'ellipse',center:h,rx:5.5,ry:7.6},{kind:'polygon',points:[[5,-.5],[7,1.5],[5,2]].map(v=>[h[0]+v[0],h[1]+v[1]])}];}
 else if(targetedGuard(def.action?.technique)||def.interruptedStrike?.joints||acceptedMove(def.action?.technique)||(!def.action&&def.techniques?.some(acceptedMove))){const j=targetedGuard(def.action?.technique)?targetedGuardPose(def.action.technique,def.action.elapsed):def.interruptedStrike?.joints?interruptedPose(def.interruptedStrike,time-def.interruptedStrike.createdTime):def.action?acceptedGamePose(def.action.technique,def.action.elapsed,def.action.contactLimit,def.action.contactKneeSign,def.action.kneeTheta).joints:acceptedNeutral(def,time),h=[j.head[0],-j.head[1]];surfaces=[{kind:'ellipse',center:h,rx:5.5,ry:7.6},{kind:'polygon',points:[[5,-.5],[7,1.5],[5,2]].map(v=>[h[0]+v[0],h[1]+v[1]])}];}
 else if(def.action?.technique==='highkick'&&def.pose!=='hit'&&highElapsed(def.action)>0&&highElapsed(def.action)<1.02){const o=legacyHighPoseFor(def,time);surfaces=[chinLegacyHeadSurface({...o,weight:1},true,o.registration)];}
 else if(def.action?.technique==='spinkick'&&def.pose!=='down'){surfaces=[chinLegacyHeadSurface(humanSpinPoseFor(def,time,chinSpinTarget(def,att,battle)),true)];}
 else surfaces=[chinLegacyHeadSurface(poseFor(def,time))];
 const af=att.action.facing??att.facing??1,df=def.action?.facing??def.facing??-af,ax=combatDrawX(att,battle,battle?.fighters.indexOf(att)),dx=combatDrawX(def,battle,battle?.fighters.indexOf(def)),offset=(ax-dx)*.41,punch=chinFistOutline(row).map(v=>[offset+af*v[0],v[1]]);surfaces=surfaces.map(s=>s.kind==='polygon'?{...s,points:s.points.map(v=>[df*v[0],v[1]])}:{...s,center:[df*s.center[0],s.center[1]],...(s.angle===undefined?{}:{angle:s.angle*df})});
 return{reaches:surfaces.some(s=>bf?backfistPunchTouchesSurface(punch,s):punchTouchesSurface(punch,s)),target:'head',surface:'approved-right-fist',punch,surfaces,sourceIndex:p.sourceIndex,sourceElapsed:p.sourceElapsed,coordinateSystem:'draw pixels relative to receiver root, +y down'};
}
function sweepUntagged_torso(c,o,P,outfit=P){const h=o.hip,s=o.chest,dx=s.x-h.x,dy=s.y-h.y,l=Math.hypot(dx,dy),nx=-dy/l,ny=dx/l;const turn=o.bodyTurn||0,spin=o.spinWeight||0,yaw=o.spinYaw||0,back=spin>.5&&Math.cos(yaw)<-.2,width=(1-Math.abs(turn)*.25)*mix(1,.55+.45*Math.abs(Math.cos(yaw)),spin);const at=(p,w)=>pt(p.x+nx*w*width,p.y+ny*w*width);const roots=o.hookTorsoNear&&o.hookTorsoFar?[o.hookTorsoNear,o.hookTorsoFar].sort((a,b)=>a.x-b.x):null,edge=(side,legacy)=>roots?lerp(legacy,pt(roots[side].x+(side?3.8:-3.8),roots[side].y),o.hookTraceWeight):legacy;path(c,[edge(0,at(s,-7)),pt(s.x-3,s.y-3),edge(1,at(s,9)),at(lerp(s,h,.32),9),at(h,6),pt(h.x,h.y+5),at(h,-6),at(lerp(s,h,.3),-8)],P.outfit&&P.outfit!=='shorts'?P.bright:P.skin);const side=mix(mix(-1,1,clamp(turn)),-Math.cos(yaw),spin);path(c,[at(s,7*side),at(lerp(s,h,.5),6*side),at(h,6*side),at(h,side),at(lerp(s,h,.55),2*side),at(s,2*side)],P.outfit&&P.outfit!=='shorts'?P.cloth:P.shade,null);if(roots){const rear=smooth((-Math.cos(yaw)+.2)/.8)*spin,col=P.outfit&&P.outfit!=='shorts'?P.cloth:P.shade;c.save();c.globalAlpha*=1-rear;if(P.outfit&&P.outfit!=='shorts'){line(c,pt(s.x-4,s.y),pt(s.x+1,s.y+7),P.cloth,1.5);line(c,pt(s.x+5,s.y),pt(s.x+1,s.y+7),P.cloth,1.5);}else{line(c,pt(s.x+2,s.y+7),pt(s.x+6,s.y+8),P.shade,.7);line(c,pt(s.x+2,s.y+8),pt(h.x+2,h.y-9),'#b37a58',.6);}c.restore();c.save();c.globalAlpha*=rear;line(c,pt(s.x,s.y+4),pt(h.x,h.y-8),col,.7);line(c,pt(s.x-5,s.y+5),pt(s.x-2,s.y+12),col,.65);line(c,pt(s.x+5,s.y+5),pt(s.x+2,s.y+12),col,.65);c.restore();}else if(P.outfit&&P.outfit!=='shorts'){line(c,pt(s.x-4,s.y),pt(s.x+1,s.y+7),P.cloth,1.5);line(c,pt(s.x+5,s.y),pt(s.x+1,s.y+7),P.cloth,1.5);}else if(back){line(c,pt(s.x,s.y+4),pt(h.x,h.y-8),P.shade,.7);line(c,pt(s.x-5,s.y+5),pt(s.x-2,s.y+12),P.shade,.65);line(c,pt(s.x+5,s.y+5),pt(s.x+2,s.y+12),P.shade,.65);}else{line(c,pt(s.x+2,s.y+7),pt(s.x+6,s.y+8),P.shade,.7);line(c,pt(s.x+2,s.y+8),pt(h.x+2,h.y-9),'#b37a58',.6);line(c,lerp(pt(h.x+2,h.y-8),at(lerp(s,h,.78),.5),o.shoulderFit||0),lerp(pt(h.x+5,h.y-7),at(lerp(s,h,.81),2.5),o.shoulderFit||0),P.shade,.5);}/* Rounded pelvis cloth replaces the detached rectangular overlay; pose and leg attachments stay intact. */path(c,[[-7,-3],[7,-3],[7.7,-1.5],[8,.4],[7.4,2.9],[5.5,5.1],[2,6],[-1,6],[-4.8,5.5],[-7.3,3.7],[-8,1.1],[-7.8,-1.2]].map(([x,y])=>pt(h.x+(roots&&back?-x:x),h.y+y)),outfit.bright,null);path(c,[[-7,-3],[-5.6,-2.3],[-5.2,1.1],[-3.4,5.9],[-4.8,5.5],[-7.3,3.7],[-8,1.1],[-7.8,-1.2]].map(([x,y])=>pt(h.x+(roots&&back?-x:x),h.y+y)),outfit.cloth,null);line(c,pt(h.x-7,h.y-2),pt(h.x+7,h.y-2),outfit.accent||outfit.wrap,2);if(!back)line(c,pt(h.x+2-5*turn,h.y-1),pt(h.x+3-5*turn,h.y+5),outfit.wrap,1);}
// Hook display-only interpolation between the two EXISTING head outlines.
// This is a 2D view transition, not measured facial yaw or reconstructed anatomy.
const hookSideHead=[[-5,-6],[1,-7],[5,-4],[5,0],[7,2],[5,3],[5,6],[1,8],[-3,6],[-5,2]],hookBackHead=[[-5,-5],[0,-8],[5,-5],[6,2],[3,7],[-3,7],[-6,2]],hookSideHair=[[-5,2],[-6,-2],[-5,-6],[-1,-8],[3,-7],[5,-4],[1,-4],[-1,-2],[-3,-2],[-3,2]],hookBackHair=[[-6,2],[-6,-3],[-3,-7],[2,-8],[6,-4],[6,3],[3,5],[0,3],[-3,5]];
function hookPerimeter(points,count=64){const lengths=points.map((p,i)=>Math.hypot(points[(i+1)%points.length][0]-p[0],points[(i+1)%points.length][1]-p[1])),total=lengths.reduce((a,b)=>a+b,0);return Array.from({length:count},(_,i)=>{let distance=i*total/count,j=0;while(j<points.length-1&&distance>lengths[j])distance-=lengths[j++];const q=distance/(lengths[j]||1),a=points[j],b=points[(j+1)%points.length];return pt(mix(a[0],b[0],q),mix(a[1],b[1],q));});}
function hookMatchedPaths(a,b){const stations=p=>{const d=p.map((v,i)=>Math.hypot(p[(i+1)%p.length][0]-v[0],p[(i+1)%p.length][1]-v[1])),total=d.reduce((x,y)=>x+y,0);let sum=0;return d.map(x=>{const q=sum/total;sum+=x;return q;});},sa=stations(a),sb=stations(b),q=[...new Set([...sa,...sb,...Array.from({length:64},(_,i)=>i/64)])].sort((x,y)=>x-y),at=(p,st,t)=>{let i=0;while(i<st.length-1&&t>=st[i+1])i++;const u=(t-st[i])/((st[i+1]??1)-st[i]),v=p[i],w=p[(i+1)%p.length];return pt(mix(v[0],w[0],u),mix(v[1],w[1],u));};return[q.map(t=>at(a,sa,t)),q.map(t=>at(b,sb,t))];}
const[hookHeadSideSamples,hookHeadBackSamples]=hookMatchedPaths(hookSideHead,hookBackHead),[hookHairSideSamples,hookHairBackSamples]=hookMatchedPaths(hookSideHair,hookBackHair);
function paintHookContinuousHead(c,h,s,P,weight){const w=clamp(weight),oldPart=c.contactPart; c.rotate(Math.atan2(s.x-h.x,Math.abs(s.y-h.y))*.25*(1-w));
 // One opaque silhouette; no cross-faded duplicate heads.
 path(c,hookHeadSideSamples.map((p,i)=>lerp(p,hookHeadBackSamples[i],w)),P.skin);
 c.contactPart='hookHeadDecoration';const custom=hairShape(P.hairStyle);path(c,custom?custom.map(p=>pt(...p)):hookHairSideSamples.map((p,i)=>lerp(p,hookHairBackSamples[i],w)),P.hair);
 // Original hairstyle outline (including tied tail) is kept exactly. Facial
 // markings retreat and fade, rather than appearing on the rear silhouette.
 c.save();c.globalAlpha*=1-w;c.translate(-3*w,0);c.scale(Math.max(.02,1-w),1);oval(c,-2,1,1.5,2,P.light);line(c,pt(2,-1),pt(4,-.6),'#343036',.8);line(c,pt(3,4),pt(5,4),P.shade,.6);line(c,pt(0,6),pt(3,6),P.shade,.7);c.restore();
 c.save();c.globalAlpha*=w;line(c,pt(-3,6),pt(3,6),P.shade,.7);c.restore();c.contactPart=oldPart;
}
function sweepUntagged_head(c,h,s,P,turn,spinYaw=0,spinWeight=0){const oldHeadPart=c.contactPart;if(P.hookPreserveHair)c.contactPart='hookNeck';segment(c,pt(s.x,s.y+1),pt(h.x-1,h.y+5),3.1,2.8,P.skin,P.light);c.contactPart=oldHeadPart;c.save();c.translate(h.x,h.y);if(P.hookPreserveHair){paintHookContinuousHead(c,h,s,P,spinWeight);c.restore();return;}if(spinWeight>.5&&Math.cos(spinYaw)<-.25){path(c,[pt(-5,-5),pt(0,-8),pt(5,-5),pt(6,2),pt(3,7),pt(-3,7),pt(-6,2)],P.skin);path(c,P.hookPreserveHair&&hairShape(P.hairStyle)?hairShape(P.hairStyle).map(p=>pt(...p)):[pt(-6,2),pt(-6,-3),pt(-3,-7),pt(2,-8),pt(6,-4),pt(6,3),pt(3,5),pt(0,3),pt(-3,5)],P.hair);line(c,pt(-3,6),pt(3,6),P.shade,.7);c.restore();return;}if(spinWeight>.5?Math.sin(spinYaw)>.3:turn>1.4)c.scale(-1,1);c.rotate(Math.atan2(s.x-h.x,Math.abs(s.y-h.y))*.25);path(c,[pt(-5,-6),pt(1,-7),pt(5,-4),pt(5,0),pt(7,2),pt(5,3),pt(5,6),pt(1,8),pt(-3,6),pt(-5,2)],P.skin);path(c,(hairShape(P.hairStyle)||[[-5,2],[-6,-2],[-5,-6],[-1,-8],[3,-7],[5,-4],[1,-4],[-1,-2],[-3,-2],[-3,2]]).map(p=>pt(...p)),P.hair);oval(c,-2,1,1.5,2,P.light);line(c,pt(2,-1),pt(4,-.6),'#343036',.8);line(c,pt(3,4),pt(5,4),P.shade,.6);line(c,pt(0,6),pt(3,6),P.shade,.7);c.restore();}
/** The original character, retargeted to measured projected segments. */
function idleSpinRig(t){
 const o=poseFor({pose:'idle'},t),r=upperBodyRig(o),la=ik(r.nearShoulder,o.frontHand,18,17,1),ra=ik(r.farShoulder,o.rearHand,18,17,1),ll=ik(r.nearHip,o.frontFoot,26,25,-1),rl=ik(r.farHip,o.rearFoot,26,25,-1);
 const points={head:o.head,neck:pt(o.head.x-1,o.head.y+5),chest:o.chest,pelvis:o.hip};
 for(const [side,a,l]of [['left',la,ll],['right',ra,rl]])Object.assign(points,{[side+'Shoulder']:a.a,[side+'Elbow']:a.b,[side+'Wrist']:a.c,[side+'Hand']:a.c,[side+'Hip']:l.a,[side+'Knee']:l.b,[side+'Ankle']:l.c,[side+'Heel']:pt(l.c.x-4,l.c.y+3),[side+'Toe']:pt(l.c.x+10,l.c.y+3)});
 return {...o,points,partOrder:['rightThigh','rightShin','rightFoot','rightUpperArm','rightForearm','rightHand','leftThigh','leftShin','leftFoot','torso','head','leftUpperArm','leftForearm','leftHand']};
}
export function humanSpinPoseFor(f,t=0,targetX=null){return spinHumanPose(f.action,idleSpinRig(t),targetX);}
function sweepUntagged_spinHead(c,o,P){
 if(o.headView!=='front'){
  const yaw=o.headView.includes('back')?Math.PI:o.headView.includes('left')?Math.PI/2:0;
  return head(c,o.head,o.chest,P,0,yaw,o.weight);
 }
 const h=o.head,s=o.chest;segment(c,pt(s.x,s.y+1),pt(h.x,h.y+5),3.1,2.8,P.skin,P.light);c.save();c.translate(h.x,h.y);
 path(c,[pt(-5,-5),pt(0,-7),pt(5,-5),pt(6,1),pt(4,6),pt(0,8),pt(-4,6),pt(-6,1)],P.skin);
 path(c,[pt(-6,2),pt(-6,-3),pt(-3,-7),pt(1,-8),pt(5,-5),pt(6,1),pt(3,-3),pt(0,-2),pt(-3,-3),pt(-3,2)],P.hair);
 line(c,pt(-3,-.5),pt(-1,-.4),'#343036',.8);line(c,pt(1,-.4),pt(3,-.5),'#343036',.8);line(c,pt(0,0),pt(1,3),P.shade,.6);line(c,pt(-1,5),pt(2,5),P.shade,.6);c.restore();
}
/** Continuous display projection, including edge-on support-foot pivots.
 * The raw heel/toe/ankle tracks are unchanged. A signed instep vector replaces
 * binary sole reflection; a foreshortened foot retains a rounded volume. */
export function spinFootProjection(ankle,heel,toe){
 const dx=toe.x-heel.x,dy=toe.y-heel.y,len=Math.hypot(dx,dy),mid=lerp(heel,toe,.5),cap=Math.min(1,16/(len||1));
 const ux=dx*cap/14,uy=dy*cap/14,along=((ankle.x-mid.x)*dx+(ankle.y-mid.y)*dy)/Math.max(4,len*len);
 const nx=mid.x-ankle.x+dx*along,ny=mid.y-ankle.y+dy*along,height=Math.hypot(nx,ny),thickness=Math.min(1,4.5/(height||1));
 const vx=nx*thickness/3,vy=ny*thickness/3;
 return {ux,uy,vx,vy,x:mid.x-3*ux-3*vx,y:mid.y-3*uy-3*vy,
  heel:pt(mid.x-7*ux,mid.y-7*uy),toe:pt(mid.x+7*ux,mid.y+7*uy),
  roundness:1-smooth(Math.min(len/7,height/2.3))};
}
function spinFoot(c,p,side,P,far){
 const ankle=p[side+'Ankle'],heel=p[side+'Heel'],toe=p[side+'Toe'];if(!ankle)return;
 if(heel&&toe){
  const f=spinFootProjection(ankle,heel,toe);
  // The ankle-to-instep attachment is anatomical, not a fading projection
  // accent. At idle this lies entirely inside the original foot artwork.
  segment(c,ankle,pt(f.x,f.y),1.8,1.8,far?P.shade:P.skin,P.light,P.shade);
  if(f.roundness>.001){c.save();c.globalAlpha*=f.roundness;segment(c,pt(f.x,f.y),lerp(f.heel,f.toe,.45),2,1.8,far?P.shade:P.skin,P.light,P.shade);segment(c,f.heel,f.toe,2,1.7,far?P.shade:P.skin,P.light,P.shade);c.restore();}
  if(Math.abs(f.ux*f.vy-f.uy*f.vx)>1e-7){c.save();c.transform(f.ux,f.uy,f.vx,f.vy,f.x,f.y);foot(c,pt(0,0),0,P,far);c.restore();}
 }else if(toe){segment(c,ankle,toe,2.3,1.8,far?P.shade:P.skin,P.light,P.shade);}
 else { // Only the ankle/heel envelope is visible; do not invent a toe direction.
  oval(c,ankle.x,ankle.y,2.7,2.1,far?P.shade:P.skin);oval(c,ankle.x-.5,ankle.y-.5,1.3,.8,P.light);
 }
}
function paintHumanSpin(c,o,P,flash=null){
 const p=o.points,order=o.partOrder,legP=damagePalette(c,P,flash,'leg',p.leftKnee);
 const bodyP=damagePalette(c,P,flash,'body'),headP=damagePalette(c,P,flash,'head');
 const far=side=>order.indexOf(side+'Thigh')<order.indexOf((side==='left'?'right':'left')+'Thigh');
 const farArm=side=>order.indexOf(side+'UpperArm')<order.indexOf((side==='left'?'right':'left')+'UpperArm');
 for(const part of order){c.contactPart=part;
  if(o.visibility[part]==='occluded'&&o.weight>.99&&!(part==='rightThigh'||part==='rightShin'||part==='rightFoot'))continue;
  if(part==='torso'){torso(c,o,bodyP,P);continue;}
  if(part==='head'){spinHead(c,o,headP);continue;}
  const side=part.startsWith('left')?'left':'right',partP=side==='left'&&/Thigh|Shin|Foot/.test(part)?legP:P,isFar=part.includes('Arm')||part.includes('Hand')?farArm(side):far(side),skin=isFar?partP.shade:partP.skin,light=isFar?partP.skin:partP.light;
  if(part.endsWith('Thigh')){const a=p[side+'Hip'],b=p[side+'Knee'];if(a&&b){segment(c,a,b,5.5,3.6,skin,light,partP.shade);segment(c,a,lerp(a,b,.53),6,5.1,isFar?P.cloth:P.bright,P.cloth);}}
  else if(part.endsWith('Shin')){const a=p[side+'Knee'],b=p[side+'Ankle'];if(a&&b){segment(c,a,b,3.5,2.1,skin,light,partP.shade);segment(c,lerp(a,b,.88),b,2.3,2.1,partP.wrap,'#fff5de');}}
  else if(part.endsWith('Foot'))spinFoot(c,p,side,partP,isFar);
  else if(part.endsWith('UpperArm')){const a=p[side+'Shoulder'],b=p[side+'Elbow'];if(a&&b)segment(c,a,b,3.8,2.7,skin,light,P.shade);}
  else if(part.endsWith('Forearm')){const guide=o.guides[part],a=guide?.start||p[side+'Elbow'],b=guide?.end||p[side+'Wrist'];if(a&&b){segment(c,a,b,2.9,1.8,skin,light,P.shade);segment(c,lerp(a,b,.72),b,2.2,2.2,P.wrap,'#fff4dd');}}
  else if(part.endsWith('Hand')){const wrist=p[side+'Wrist'],handPoint=p[side+'Hand'];if(wrist&&handPoint){if(Math.hypot(wrist.x-handPoint.x,wrist.y-handPoint.y)>.1)segment(c,wrist,handPoint,1.8,2.2,skin,light,P.shade);hand(c,handPoint,Math.hypot(wrist.x-handPoint.x,wrist.y-handPoint.y)>.1?wrist:p[side+'Elbow']||wrist,P,isFar);}}
 }
}
/** Same pre-v15 character primitives, with the approved HIGH's directions.
 * No R1 head/torso/garment painter or R1 idle is dispatched here. */
export function legacyHighPoseFor(f,t=0){
 const idle=idleSpinRig(t),old=poseFor(f,t),support={angle:observedKickPose(f.action,old,old,old).rearFootAngle,pivot:old.rearPivot};
 return legacyHighMotion(f.action,idle,upperBodyRig,support);
}
function paintLegacyHigh(c,o,P,flash){
 const p=o.points,order=o.partOrder,legP=damagePalette(c,P,flash,'leg',p.leftKnee),bodyP=damagePalette(c,P,flash,'body'),headP=damagePalette(c,P,flash,'head');
 const far=(side,suffix)=>order.indexOf(side+suffix)<order.indexOf((side==='left'?'right':'left')+suffix);
 for(const part of order){c.contactPart=part;
  if(part==='torso'){torso(c,o,bodyP,P);continue;}
  if(part==='head'){spinHead(c,{...o,weight:1},headP);continue;}
  const side=part.startsWith('left')?'left':'right',isArm=/Arm|Hand/.test(part),isFar=far(side,isArm?'UpperArm':'Thigh'),Q=side==='left'&&!isArm?legP:P,skin=isFar?Q.shade:Q.skin,light=isFar?Q.skin:Q.light;
  if(part.endsWith('Thigh')){segment(c,p[side+'Hip'],p[side+'Knee'],5.5,3.6,skin,light,Q.shade);segment(c,p[side+'Hip'],lerp(p[side+'Hip'],p[side+'Knee'],.53),6,5.1,isFar?P.cloth:P.bright,P.cloth);}
  else if(part.endsWith('Shin')){segment(c,p[side+'Knee'],p[side+'Ankle'],3.5,2.1,skin,light,Q.shade);segment(c,lerp(p[side+'Knee'],p[side+'Ankle'],.88),p[side+'Ankle'],2.3,2.1,Q.wrap,'#fff5de');}
  else if(part.endsWith('Foot')){const a=p[side+'Ankle'],f=o.feet[side];if(side==='right')continuousSupportFoot(c,a,f.angle,Q,isFar,f.pivot);else foot(c,a,f.angle,Q,isFar,0,f.pointed?1:0,f.projection);}
  else if(part.endsWith('UpperArm'))segment(c,p[side+'Shoulder'],p[side+'Elbow'],3.8,2.7,skin,light,Q.shade);
  else {c.save();if(side==='left'&&o.armClip?.length){c.beginPath();for(const poly of o.armClip){poly.forEach((q,i)=>i?c.lineTo(q.x,q.y):c.moveTo(q.x,q.y));c.closePath();}c.clip();}
   if(part.endsWith('Forearm')){segment(c,p[side+'Elbow'],p[side+'Wrist'],2.9,1.8,skin,light,Q.shade);if(!(side==='left'&&o.suppressFullLeftFist))segment(c,lerp(p[side+'Elbow'],p[side+'Wrist'],.72),p[side+'Wrist'],2.2,2.2,Q.wrap,'#fff4dd');}
   else if(!(side==='left'&&o.suppressFullLeftFist))hand(c,p[side+'Hand'],p[side+'Elbow'],Q,isFar);c.restore();}
 }
}
export function acceptedNeutral(f,t){const handoff=f.flyLocomotionJoin;if(!handoff||f.action||f.interruptedStrike)return acceptedNeutralBase(f,t);const target=acceptedNeutralBase({...f,flyLocomotionJoin:null},t),age=Math.max(0,t-handoff.createdTime);return age<handoff.duration?flyInterrupted({joints:handoff.joints,neutral:target,duration:handoff.duration},age):target;}
function acceptedNeutralBase(f,t){
 const j=commonStance();if(f.pose!=='walk'&&f.pose!=='hit')return j;
 const o=poseFor(f,t),up=p=>[p.x,-p.y];
 // Only locomotion/recoil outside a strike. Fixed accepted limb lengths,
 // original v16 walk targets; no change to any other strike's renderer.
 const h=up(o.hip),ch=up(o.chest),v=[ch[0]-h[0],ch[1]-h[1]],vl=Math.hypot(...v);j.center=h;j.chest=[h[0]+v[0]*30/vl,h[1]+v[1]*30/vl];const hv=[o.head.x-o.chest.x,-o.head.y+o.chest.y],hl=Math.hypot(...hv);j.head=[j.chest[0]+hv[0]*14/hl,j.chest[1]+hv[1]*14/hl];
 for(const[side,sign,target]of[['support',-1,o.rearFoot],['strike',1,o.frontFoot]]){let hip={x:h[0]+sign*4,y:-h[1]},r=ik(hip,target,26,25,-1);j[side+'_hip']=up(r.a);j[side+'_knee']=up(r.b);j[side+'_ankle']=up(r.c);j[side+'_heel']=[r.c.x-4,-r.c.y-3];j[side+'_toe']=[r.c.x+6.9,-r.c.y-3];}
 for(const[side,sign,target]of[['near',1,o.frontHand],['far',-1,o.rearHand]]){let sh={x:j.chest[0]+sign*4,y:-j.chest[1]},r=ik(sh,{x:target.x,y:target.y-2},18,17,1);j[side+'_shoulder']=up(r.a);j[side+'_elbow']=up(r.b);j[side+'_wrist']=up(r.c);let d=[r.c.x-r.b.x,-r.c.y+r.b.y];j[side+'_hand']=[r.c.x+d[0]*3.5/17,-r.c.y+d[1]*3.5/17];}
 return j;
}
// Core/entry poses do not read the native target. Keep their per-time result
// outside save state; sampled contacts at different times retain exact clocks.
const axeCorePoseCache=new WeakMap(),axeUnblendedPoses=new Map();
export function axePrototypePose(f,t=0){
 if(f.axeFinish)return f.axeFinish;
 if(!f.axePrototype)return null;
 if(f.action?.technique==='axekick'&&(!f.axeDisplay||f.axeDisplay.kind==='entry')){
  const key=[t,f.action,f.action.elapsed,f.motionTime,f.axeDisplay,f.axeDisplay?.startClock,f.axeDisplay?.duration,f.axeDisplay?.from,f.axeDisplay?.targetHint],old=axeCorePoseCache.get(f);
  if(old&&key.every((v,i)=>Object.is(v,old.key[i])))return old.pose;
  let pose;
  if(!f.axeDisplay){
   const elapsed=f.action.elapsed;let core=axeUnblendedPoses.get(elapsed);
   if(!core){core=experimentPose({axePrototype:true,action:{technique:'axekick',elapsed}},null);if(axeUnblendedPoses.size>=128)axeUnblendedPoses.delete(axeUnblendedPoses.keys().next().value);axeUnblendedPoses.set(elapsed,core);}
   pose={...core,clock:f.motionTime||0};
  }else pose=experimentPose(f,null);
  axeCorePoseCache.set(f,{key,pose});return pose;
 }
 return experimentPose(f,acceptedNeutral({...f,pose:f.action?'walk':f.pose},t));
}
// R30: one stateless source for the existing axe painter and the narrow live
// uppercut receiver center. The rig is NOT translated here: paintFourTrace owns
// its floor lift; receiver geometry subtracts the same lift exactly once.
export function axeDisplayRig(f,t=0,P=appearancePalette(f.appearance,pal[0],0)){
 const pose=axePrototypePose(f,t),rig=axeCommonRig(pose.joints),floorLift=fourTraceFloorRegistration(rig,P).lift;
 return{pose,rig,floorLift,clock:{simTime:t,motionTime:f.motionTime,actionElapsed:f.action?.elapsed}};
}
function scopedAxeUppercutCenter(f,time,battle){
 // R32A: share the unchanged displayed receive rig, including its inherited
 // registration. No KO, other action, or released exit state is added.
 if(!ownsAxe(f)||!(f.hp>0)||battle?.done||f.axeFinish||f.finishFallJoints||f.pose==='down')return null;
 const live=f.action?.technique==='axekick'&&!f.interruptedStrike&&f.pose!=='hit',receive=!f.action&&f.axeDisplay?.kind==='receive';
 if(!live&&!receive)return null;
 const i=battle?.fighters?.indexOf(f)??0,P=appearancePalette(f.appearance,pal[(i<0?0:i)%2],i<0?0:i),s=axeDisplayRig(f,time,P),h=s.rig.points.head;
 return[h.x,h.y-s.floorLift];
}

function paintBodyUppercut(c,j,index,weight,P,alt,flash,appearance){
 if(weight<1){c.save();c.globalAlpha*=1-weight;c.scale(.5,.5);paintApprovedBody(c,j,1,alt,flash,appearance);c.restore();}
 if(weight>0){c.save();c.globalAlpha*=weight;paintBodyUppercutR3(c,bodyUppercutRow(j,index),P,flash);c.restore();}
}
// R16: the actual ongoing frontkickLegacy painter and axe receiver share this
// final pose. No fatigue history is read by physics; this narrow live/non-hit
// branch cannot be fatigue-eligible. Other legacy actions/KO stay unchanged.
export function legacyPaintPose(f,t=0,battle=null,i=battle?.fighters?.indexOf(f),{breath=0,postResultSeconds=0}={}){
 if(f.action?.technique!=='frontkickLegacy'||f.pose==='hit'||f.pose==='down'||f.finishFallJoints||f.interruptedStrike||battle?.done||postResultSeconds!==0||breath!==0)return null;
 const face=f.facing??(i?-1:1),shownX=Number.isFinite(f.finishFrozenRootX)?f.finishFrozenRootX:traceDisplayRoot(battle,f,i,postResultSeconds),x=28+clamp((Number(shownX)||0)/800)*328,other=battle?.fighters?.[1-i];let guardContact=null;
 // Preserve this baseline's skillId event matching and posture/contact choices.
 // Do not rewrite alias phases or repair pre-existing artwork timing here.
 const adaptedRange=['cross','highkick','roundkick','jumpkick'].includes(f.action.technique);
 const strikeEvent=(battle?.events||[]).filter(e=>e.attacker===i&&e.technique===(f.action.skillId||f.action.technique)&&e.tick>=(f.action.startedTick??-Infinity)&&(e.reason!=='range'||adaptedRange||f.action.technique==='spinkick')).at(-1);
 const poseContact=other?(strikeEvent?.receiverPosture&&(strikeEvent.reason!=='range'||adaptedRange)?strikeEvent:postureContactFor(TECH_BY_ID[f.action.technique],other.action)):null,bodyAim=poseContact?.reaches?poseContact.aimY:0;
 if(poseContact?.reaches&&['crouch','crouchpunch','crouchlowkick'].includes(poseContact.receiverPosture)){
  const target=poseContact.receiverTarget,otherX=28+clamp((Number(strikeEvent?.receiverX??other.x)||0)/800)*328;
  guardContact={...pt((otherX-x+(other.facing??-face)*target.x)/face-17,poseContact.contactY),lowBody:true};
 }
 return{pose:poseFor(f,t,guardContact,bodyAim),guardContact,bodyAim,poseContact,strikeEvent,shownX,face,x};
}


// R21 narrow shared receiving geometry. The two legacy action IDs use the exact
// painter context (range, retained strike event and posture aiming), not a bare
// poseFor approximation. Only ongoing non-hit legacy frontkick/cross use this
// function. Other renderer branches and fatigue/KO/interruption are unchanged.
export function legacyBackfistReceiverPaintPose(f,t=0,battle=null,i=battle?.fighters.indexOf(f)){
 if(!['cross','jumpkick'].includes(f.action?.technique)||f.pose==='hit'||f.finishFallJoints)return null;
 const face=f.facing??(i?-1:1),shownX=traceDisplayRoot(battle,f,i,0),x=28+clamp((Number(shownX)||0)/800)*328;
 const other=battle?.fighters?.[1-i];let guardContact=null;
 const tracedSpin=f.action?.technique==='spinkick'&&f.pose!=='down';
 // Expanded range telemetry is consumed only by this update's four strikes.
 // Other attacks retain their v12 miss presentation; approved spin keeps its
 // original frozen actor positions without newly freezing posture metadata.
 const adaptedRange=['cross','highkick','roundkick','jumpkick'].includes(f.action?.technique);
 const strikeEvent=f.action?.technique?(battle?.events||[]).filter(e=>e.attacker===i&&e.technique===f.action.technique&&e.tick>=(f.action.startedTick??-Infinity)&&(e.reason!=='range'||adaptedRange||f.action.technique==='spinkick')).at(-1):null;
 if(['jab','cross','hook'].includes(f.action?.technique)&&strikeTarget(f.action.technique)==='head'&&(((!strikeEvent||f.action.technique!=='cross')&&other?.action?.technique==='guard'&&other.action.phase==='active'&&!['hit','down'].includes(other.pose))||strikeEvent?.type==='block'||(f.action.technique==='cross'&&strikeEvent?.reason==='range'&&strikeEvent.defenseTechnique==='guard'))){
  const target=poseFor({...other,pose:'guard',action:{technique:'guard',phase:'active'}},t),forearm=ik(pt(target.chest.x+4,target.chest.y+2),target.frontHand,18,17,1),contact=lerp(forearm.b,forearm.c,.55);
  const otherX=28+clamp((Number(strikeEvent?.receiverX??other.x)||0)/800)*328,otherFace=other.facing??-face;
  guardContact=pt((otherX-x+otherFace*contact.x)/face-2.4,contact.y);
 }
 if(f.action?.technique==='cross'&&!guardContact&&other){
  const gap=Math.abs((strikeEvent?.receiverX??other.x)-(strikeEvent?.attackerX??f.x))*.41;
  guardContact=pt(clamp(gap-5,18,43),-86);
 }
 if(f.action?.technique==='cross'&&guardContact&&other){
  const distance=Math.abs((strikeEvent?.receiverX??other.x)-(strikeEvent?.attackerX??f.x));
  // Use a continuous reach taper before/after the existing range boundary.
  // At range+12 the fist just clears the outer jaw/forearm surface; a farther
  // genuine miss stays visibly short and cannot chase a later guard pose.
  const shortfall=8*smooth((distance-TECH_BY_ID.cross.range)/24);
  guardContact=pt(Math.min(43,guardContact.x)-shortfall,guardContact.y);
 }
 if(f.action?.technique==='roundkick'&&other){
  const gap=Math.abs((strikeEvent?.receiverX??other.x)-(strikeEvent?.attackerX??f.x))*.41;
  const blocked=strikeTarget(f.action.technique)==='head'&&(strikeEvent?.type==='block'||(other.action?.technique==='guard'&&other.action.phase==='active'));
  guardContact=pt(gap+(f.action.technique==='roundkick'?(blocked?-12:0):(blocked?-6:6)),0);
 }
 const poseContact=other?(strikeEvent?.receiverPosture&&(strikeEvent.reason!=='range'||adaptedRange)?strikeEvent:postureContactFor(TECH_BY_ID[f.action?.technique],other.action)):null;
 const bodyAim=poseContact?.reaches?poseContact.aimY:0;
 // A head-height whiff against a new airborne posture must visibly stop before
 // the elevated torso, not pass through it and silently ignore body contact.
 // This is a connected, pulled-short punch in this new context only.
 if(['cross','hook','highkick','jumpkick'].includes(f.action?.technique)&&['jump','jumpkick'].includes(poseContact?.receiverPosture)&&poseContact.whiffWeight>0){
  const target=poseContact.receiverTarget,otherX=28+clamp((Number(strikeEvent?.receiverX??other.x)||0)/800)*328,margin=f.action.technique==='cross'?17:20,weight=poseContact.whiffWeight;
  const normal=guardContact||pt(f.action.technique==='highkick'?23:48,f.action.technique==='highkick'?-92:-94);
  const missed=pt(Math.min(43,(otherX-x+(other.facing??-face)*target.x)/face-margin),Math.max(-104,poseContact.contactY-18));
  guardContact={...lerp(normal,missed,weight),whiff:true,whiffWeight:weight};
 }
 if(poseContact?.reaches&&['crouch','crouchpunch','crouchlowkick'].includes(poseContact.receiverPosture)&&['frontkick','sidekick','roundkick'].includes(f.action?.technique)){
  const target=poseContact.receiverTarget,otherX=28+clamp((Number(strikeEvent?.receiverX??other.x)||0)/800)*328;
  guardContact={...pt((otherX-x+(other.facing??-face)*target.x)/face-17,poseContact.contactY),lowBody:true};
 }
 if(f.action?.technique==='crouchpunch'&&poseContact?.reaches){const target=poseContact.receiverTarget,otherX=28+clamp((Number(strikeEvent?.receiverX??other.x)||0)/800)*328;guardContact={...pt((otherX-x+(other.facing??-face)*target.x)/face-7,poseContact.contactY),bodyHand:true};}
 if(f.action?.technique==='jab'&&poseContact?.reaches){const target=poseContact.receiverTarget,otherX=28+clamp((Number(strikeEvent?.receiverX??other.x)||0)/800)*328;guardContact=pt((otherX-x+(other.facing??-face)*target.x)/face,poseContact.contactY);}

 return poseFor(f,t,guardContact,bodyAim);
}
// R25: pure existing trace paint selection, scoped to BF receiving queries.
// No fatigue sampler, view WeakMap, future state, root mutation or new curve.
// Preserve every earlier painter priority before sharing the rest/jab branches.
export function backfistTraceReceiverPaint(f,time=0,battle=null,index=0,postResultSeconds=0){
 const rest=!f.action&&f.pose==='idle'&&f.traceRestRig;
 const interrupted=f.interruptedStrike?.fourTrace&&f.interruptedStrike.action?.technique==='jab';
 if(!rest&&!interrupted)return null;
 if(f.finishFallJoints||f.backstep||f.reviewedThreeFall||f.finishFourTraceEntry)return null;
 if(backfistReceiving(f,time)||threeReceiving(f,time))return null;
 if(targetedGuard(f.action?.technique)&&f.pose!=='hit')return null;
 if(chinUppercut(f.action?.technique)||chinUppercut(f.interruptedStrike?.action?.technique))return null;
 if(bodyUppercut(f.action?.technique)||bodyUppercut(f.interruptedStrike?.action?.technique))return null;
 const rig=rest?f.traceRestRig:fourTraceInterrupted(f.interruptedStrike,time-f.interruptedStrike.createdTime).rig;
 const shownX=Number.isFinite(f.finishFrozenRootX)?f.finishFrozenRootX:traceDisplayRoot(battle,f,index,postResultSeconds);
 return {rig,branch:rest?'traceRestRig':'fourTraceInterrupted-jab',time,phase:f.action?.phase??null,
  drawX:clamp((Number(shownX)||0)/800)*800,facing:f.facing??(index?-1:1)};
}
function fighter(c,f,i,t,flash,battle,response,postResultSeconds=0,geometryOnly=false,dutchPaintOperations=null,skipShadow=false,readOnlyFatigue=false){
 const status=staminaStatus(f),breath=sampleFatigue(battle?.fighters?.[i]||f,t,breathingEligible(f,battle),Math.max(0,(status.required-status.current)/STAMINA_RULES.restRecovery),readOnlyFatigue);
 const newImpact=(battle?.events||[]).filter(e=>e.fighter===i&&e.type==='hit'&&(TECH_BY_ID[e.technique]?.postureKind||e.receiverPosture)).at(-1),hitAge=newImpact?(battle.tick-newImpact.tick)/60+(battle.done?Math.max(0,postResultSeconds):0):Infinity,hitEase=smooth(hitAge/.12);
 const shownX=Number.isFinite(f.finishFrozenRootX)?f.finishFrozenRootX:traceDisplayRoot(battle,f,i,postResultSeconds);
 const P=appearancePalette(f.appearance,pal[i%2],i),face=f.facing??(i?-1:1),x=28+clamp((Number(shownX)||0)/800)*328,floor=189;if(!skipShadow)oval(c,x,191,24,3,'#26333d26');c.save();c.translate(x,floor);c.scale(face,1);
 const sweepReceive=sweepReceiving(f,t);if(sweepReceive){paintSweep(c,sweepReceive,{alt:i%2!==0,appearance:f.appearance,flashes:flash,visualHead:!geometryOnly,headReference:sweepHeadReference(f,sweepReceive,t)});c.restore();return;}
 const bf=backfistReceiving(f,t);if(bf&&!f.finishFallJoints){c.save();c.scale(.5,.5);paintApprovedBody(c,bf.joints,1,i%2!==0,flash,f.appearance);c.restore();c.restore();return;}
 if(ownsAxe(f)){paintFourTrace(c,axeDisplayRig(f,t,P).rig,P,flash);c.restore();return;}
 if(f.jumpFallState){paintJumpNativeJoints(c,f.jumpFallState.joints,P);c.restore();return;}
 const jump=jumpStateFor(f,t);if(jump&&!f.finishFallJoints){if(jump.style==='common'){c.save();c.scale(.5,.5);paintApprovedBody(c,jump.joints,1,i%2!==0,flash,f.appearance);c.restore();}else{paintJumpNativeJoints(c,jump.joints,P,flash);if(jump.stage==='r16-engine-recoil')for(let n=0;n<5;n++){const a=n*1.25;line(c,pt(10+Math.cos(a)*7,-75+Math.sin(a)*7),pt(10+Math.cos(a)*11,-75+Math.sin(a)*11),'#ffe0a4',1);}}c.restore();return;}
 if(f.backstep&&!f.finishFallJoints){paintFourTrace(c,backstepPose(f).rig,P,flash);c.restore();return;}
 if(f.reviewedThreeFall){const r=f.reviewedThreeFall,p=threePose(r.id,r.elapsed);c.save();c.scale(.5,.5);paintThreeCombat(c,r.id,{...p,joints:f.finishFallJoints,displayJoin:r.displayJoin,customWeight:r.weight},P,i%2!==0,flash,f.appearance);c.restore();c.restore();return;}
 const three=threeReceiving(f,t);if(three&&!f.finishFallJoints){c.save();c.scale(.5,.5);paintThreeCombat(c,three.id,three,P,i%2!==0,flash,f.appearance);c.restore();c.restore();return;}
 if(targetedGuard(f.action?.technique)&&f.pose!=='hit'&&!f.finishFallJoints){const j=targetedGuardPose(f.action.technique,f.action.elapsed);c.save();c.scale(.5,.5);paintApprovedBody(c,j,1,i%2!==0,flash,f.appearance);c.restore();c.restore();return;}
 if(chinUppercut(f.action?.technique)&&!f.finishFallJoints){const p=chinUppercutPose(f.action.elapsed);paintChinUppercutR3(c,chinUppercutRow(p.joints,p.frameIndex,p.customWeight,{groundFeet:true}),P,flash);c.restore();return;}
 if(chinUppercut(f.interruptedStrike?.action?.technique)&&!f.finishFallJoints){const p=chinReceivingPose(f,t);paintChinUppercutR3(c,chinUppercutRow(p.joints,p.frameIndex,p.customWeight,{groundFeet:true}),P,flash);c.restore();return;}
 if(f.finishFallJoints&&f.chinUppercutFall){paintChinUppercutR3(c,{...chinUppercutRow(f.finishFallJoints,f.chinUppercutFall.frameIndex,f.chinUppercutFall.weight),finishHeadTilt:f.chinUppercutFall.headRotation},P,flash);c.restore();return;}
 if(bodyUppercut(f.action?.technique)&&!f.finishFallJoints){const p=bodyUppercutPose(f.action.elapsed);paintBodyUppercut(c,p.joints,p.frameIndex,p.customWeight,P,i%2!==0,flash,f.appearance);c.restore();return;}
 if(bodyUppercut(f.interruptedStrike?.action?.technique)&&!f.finishFallJoints){const s=f.interruptedStrike,j=interruptedPose(s,t-s.createdTime),p=bodyUppercutPose(s.action.elapsed),weight=p.customWeight*(1-bodyUppercutEase((t-s.createdTime)/(s.duration||.2)));paintBodyUppercut(c,j,p.frameIndex,weight,P,i%2!==0,flash,f.appearance);c.restore();return;}
 if(f.finishFourTraceEntry?.singleSurface){paintFourTrace(c,f.finishFourTraceEntry.rig,P,flash);c.restore();return;}
 if(f.finishFourTraceEntry){const blend=smooth((Math.max(0,postResultSeconds)-.18)/.08),alpha=c.globalAlpha;c.save();c.globalAlpha=alpha*(1-blend);paintFourTrace(c,f.finishFourTraceEntry.rig,P,flash);c.restore();if(blend>0){c.save();c.globalAlpha=alpha*blend;c.scale(.5,.5);paintApprovedBody(c,f.finishFourTraceEntry.joints,1,i%2!==0,flash,f.appearance,f.finishHeadTilt);c.restore();}c.restore();return;}
 const sharedTrace=backfistTraceReceiverPaint(f,t,battle,i,postResultSeconds);
 if(sharedTrace){paintFourTrace(c,sharedTrace.rig,P,flash);c.restore();return;}
 if(f.interruptedStrike?.fourTrace&&!f.finishFallJoints){const p=fourTraceInterrupted(f.interruptedStrike,t-f.interruptedStrike.createdTime);paintFourTrace(c,p.rig,P,flash);c.restore();return;}
 if(isFourTrace(f.action?.technique)&&!f.finishFallJoints){const p=fourTracePose(f.action.technique,f.action.elapsed,f.action.contactLimit);paintFourTrace(c,p.rig,P,flash);c.restore();return;}
 if(f.interruptedStrike?.action?.technique==='dutchlow'&&!f.finishFallJoints){c.save();c.scale(.5,.5);paintDutch(c,dutchlowInterrupted(f.interruptedStrike,t-f.interruptedStrike.createdTime),i%2!==0,flash,f.appearance,geometryOnly);c.restore();c.restore();return;}
 if(f.interruptedStrike?.action?.technique==='spear'&&f.interruptedStrike?.joints&&!f.finishFallJoints){const j=interruptedPose(f.interruptedStrike,t-f.interruptedStrike.createdTime);c.save();c.scale(.5,.5);paintSpearAnatomicalBody(c,j,{face,alt:i%2!==0,appearance:f.appearance},flash);c.restore();c.restore();return;}
 if(f.interruptedStrike?.joints&&!f.finishFallJoints){const j=interruptedPose(f.interruptedStrike,t-f.interruptedStrike.createdTime);c.save();c.scale(.5,.5);paintApprovedBody(c,j,1,i%2!==0,flash,f.appearance);c.restore();c.restore();return;}
 if(f.finishFallJoints&&f.bodyUppercutFall?.weight>0){paintBodyUppercut(c,f.finishFallJoints,f.bodyUppercutFall.frameIndex,f.bodyUppercutFall.weight,P,i%2!==0,flash,f.appearance);c.restore();return;}
 if(f.finishFallJoints&&f.interruptedStrike?.action?.technique==='dutchlow'){
  const p=dutchlowKO(f.interruptedStrike,f.finishFallJoints,postResultSeconds,f.finishHeadTilt||0);
  c.save();c.scale(.5,.5);paintDutch(c,p,i%2!==0,flash,f.appearance,geometryOnly);c.restore();c.restore();return;
 }
 if(f.finishFallJoints&&f.interruptedStrike?.action?.technique==='spear'){c.save();c.scale(.5,.5);paintSpearAnatomicalBody(c,f.finishFallJoints,{face,alt:i%2!==0,appearance:f.appearance,headTilt:f.finishHeadTilt},flash);c.restore();c.restore();return;}
 if(f.finishFallJoints){c.save();c.scale(.5,.5);paintApprovedBody(c,f.finishFallJoints,1,i%2!==0,flash,f.appearance,f.finishHeadTilt);c.restore();c.restore();return;}
 if(f.action?.technique==='dutchlow'){c.save();c.scale(.5,.5);if(dutchPaintOperations)paintApprovedOperations(c,dutchPaintOperations,flash);else paintDutch(c,dutchlowPose(f.action.elapsed,f.action.contactLimit),i%2!==0,flash,f.appearance,geometryOnly);c.restore();c.restore();return;}
 if(f.action?.technique==='spear'){const j=acceptedGamePose('spear',f.action.elapsed,f.action.contactLimit).joints;c.save();c.scale(.5,.5);paintSpearAnatomicalBody(c,j,{face,alt:i%2!==0,appearance:f.appearance},flash);c.restore();c.restore();return;}
 if(acceptedMove(f.action?.technique)||(!f.action&&f.techniques?.some(acceptedIdleMove))){const j=f.action?acceptedGamePose(f.action.technique,f.action.elapsed,f.action.contactLimit,f.action.contactKneeSign,f.action.kneeTheta).joints:fatigueApprovedPose(acceptedNeutral(f,t),breath);c.save();c.scale(.5,.5);paintApprovedBody(c,j,1,i%2!==0,flash,f.appearance);c.restore();c.restore();return;}
 const other=battle?.fighters?.[1-i];let guardContact=null;
 const tracedSpin=f.action?.technique==='spinkick'&&f.pose!=='down';
 // Expanded range telemetry is consumed only by this update's four strikes.
 // Other attacks retain their v12 miss presentation; approved spin keeps its
 // original frozen actor positions without newly freezing posture metadata.
 const adaptedRange=['cross','highkick','roundkick','jumpkick'].includes(f.action?.technique);
 const strikeEvent=f.action?.technique?(battle?.events||[]).filter(e=>e.attacker===i&&e.technique===(f.action.skillId||f.action.technique)&&e.tick>=(f.action.startedTick??-Infinity)&&(e.reason!=='range'||adaptedRange||f.action.technique==='spinkick')).at(-1):null;
 if(['jab','cross','hook'].includes(f.action?.technique)&&strikeTarget(f.action.technique)==='head'&&(((!strikeEvent||f.action.technique!=='cross')&&other?.action?.technique==='guard'&&other.action.phase==='active'&&!['hit','down'].includes(other.pose))||strikeEvent?.type==='block'||(f.action.technique==='cross'&&strikeEvent?.reason==='range'&&strikeEvent.defenseTechnique==='guard'))){
  const target=poseFor({...other,pose:'guard',action:{technique:'guard',phase:'active'}},t),forearm=ik(pt(target.chest.x+4,target.chest.y+2),target.frontHand,18,17,1),contact=lerp(forearm.b,forearm.c,.55);
  const otherX=28+clamp((Number(strikeEvent?.receiverX??other.x)||0)/800)*328,otherFace=other.facing??-face;
  guardContact=pt((otherX-x+otherFace*contact.x)/face-2.4,contact.y);
 }
 if(f.action?.technique==='cross'&&!guardContact&&other){
  const gap=Math.abs((strikeEvent?.receiverX??other.x)-(strikeEvent?.attackerX??f.x))*.41;
  guardContact=pt(clamp(gap-5,18,43),-86);
 }
 if(f.action?.technique==='cross'&&guardContact&&other){
  const distance=Math.abs((strikeEvent?.receiverX??other.x)-(strikeEvent?.attackerX??f.x));
  // Use a continuous reach taper before/after the existing range boundary.
  // At range+12 the fist just clears the outer jaw/forearm surface; a farther
  // genuine miss stays visibly short and cannot chase a later guard pose.
  const shortfall=8*smooth((distance-TECH_BY_ID.cross.range)/24);
  guardContact=pt(Math.min(43,guardContact.x)-shortfall,guardContact.y);
 }
 if(f.action?.technique==='roundkick'&&other){
  const gap=Math.abs((strikeEvent?.receiverX??other.x)-(strikeEvent?.attackerX??f.x))*.41;
  const blocked=strikeTarget(f.action.technique)==='head'&&(strikeEvent?.type==='block'||(other.action?.technique==='guard'&&other.action.phase==='active'));
  guardContact=pt(gap+(f.action.technique==='roundkick'?(blocked?-12:0):(blocked?-6:6)),0);
 }
 const poseContact=other?(strikeEvent?.receiverPosture&&(strikeEvent.reason!=='range'||adaptedRange)?strikeEvent:postureContactFor(TECH_BY_ID[f.action?.technique],other.action)):null;
 const bodyAim=poseContact?.reaches?poseContact.aimY:0;
 // A head-height whiff against a new airborne posture must visibly stop before
 // the elevated torso, not pass through it and silently ignore body contact.
 // This is a connected, pulled-short punch in this new context only.
 if(['cross','hook','highkick','jumpkick'].includes(f.action?.technique)&&['jump','jumpkick'].includes(poseContact?.receiverPosture)&&poseContact.whiffWeight>0){
  const target=poseContact.receiverTarget,otherX=28+clamp((Number(strikeEvent?.receiverX??other.x)||0)/800)*328,margin=f.action.technique==='cross'?17:20,weight=poseContact.whiffWeight;
  const normal=guardContact||pt(f.action.technique==='highkick'?23:48,f.action.technique==='highkick'?-92:-94);
  const missed=pt(Math.min(43,(otherX-x+(other.facing??-face)*target.x)/face-margin),Math.max(-104,poseContact.contactY-18));
  guardContact={...lerp(normal,missed,weight),whiff:true,whiffWeight:weight};
 }
 if(poseContact?.reaches&&['crouch','crouchpunch','crouchlowkick'].includes(poseContact.receiverPosture)&&['frontkick','frontkickLegacy','sidekick','roundkick'].includes(f.action?.technique)){
  const target=poseContact.receiverTarget,otherX=28+clamp((Number(strikeEvent?.receiverX??other.x)||0)/800)*328;
  guardContact={...pt((otherX-x+(other.facing??-face)*target.x)/face-17,poseContact.contactY),lowBody:true};
 }
 if(f.action?.technique==='crouchpunch'&&poseContact?.reaches){const target=poseContact.receiverTarget,otherX=28+clamp((Number(strikeEvent?.receiverX??other.x)||0)/800)*328;guardContact={...pt((otherX-x+(other.facing??-face)*target.x)/face-7,poseContact.contactY),bodyHand:true};}
 if(f.action?.technique==='jab'&&poseContact?.reaches){const target=poseContact.receiverTarget,otherX=28+clamp((Number(strikeEvent?.receiverX??other.x)||0)/800)*328;guardContact=pt((otherX-x+(other.facing??-face)*target.x)/face,poseContact.contactY);}
 // Rigid contact registration moves the whole retargeted character, never a limb.
 // Resolved pre-knockback coordinates keep contact from chasing the receiver.
 let spinTarget=null;
 if(tracedSpin&&other){
  const gap=Math.abs((strikeEvent?.receiverX??other.x)-(strikeEvent?.attackerX??f.x))*.41;
  const guarding=other.action?.technique==='guard'?other.action:null;
  const guardWeight=guarding?(guarding.phase==='windup'?smooth(guarding.phaseProgress):guarding.phase==='active'?1:1-smooth(guarding.phaseProgress)):0;
  const blockWeight=strikeTarget(f.action.technique)==='head'?(strikeEvent?(strikeEvent.type==='block'?1:0):guardWeight):0;
  // Ease range registration near a moving target rather than teleporting when
  // a gap crosses the engine's range threshold. Clear misses keep natural reach.
  const rangeWeight=1-smooth((gap-(152+12)*.41)/(24*.41));
  if(rangeWeight>0){const natural=spinPlacement({...f.action,elapsed:SPIN_TIMING.windup});const boundary=natural.x+SPIN_PLACEMENT.contactX*natural.scale;spinTarget=mix(boundary,gap-4-6*blockWeight,rangeWeight);}
 }
 if(f.action?.technique==='highkick'&&f.pose!=='hit'&&highElapsed(f.action)>0&&highElapsed(f.action)<1.02){const o=legacyHighPoseFor(f,t);c.save();c.translate(o.registration.x,o.registration.y);paintLegacyHigh(c,o,P,flash);c.restore();c.restore();return;}
 if(tracedSpin){paintHumanSpin(c,humanSpinPoseFor(f,t,spinTarget),P,flash);c.restore();return;}
 let o=(f.action?.technique==='hook'?hookPaintPose(f,t,battle):null)??legacyPaintPose(f,t,battle,i,{breath,postResultSeconds})?.pose??legacyBackfistReceiverPaintPose(f,t,battle,i)??fatigueLegacyPose(poseFor(f,t,guardContact,bodyAim),breath);
 // New-posture contacts show contact first, then ease into the existing recoil.
 // This never changes HP/position/action or any old-standing matchup artwork.
 if(f.pose==='hit'&&hitAge>=0&&hitAge<.12){const before=poseFor({...f,pose:'idle'},t,guardContact,bodyAim);o=Object.fromEntries(Object.keys(o).map(k=>[k,typeof o[k]==='number'?mix(before[k],o[k],hitEase):lerp(before[k],o[k],hitEase)]));}
 const responseAge=response&&Number.isFinite(battle?.tick)&&Number.isFinite(response.tick)?(battle.tick-response.tick)/60:Infinity;
 if(response?.type==='block'&&responseAge>=0&&responseAge<.16&&f.action?.technique==='guard'&&f.pose!=='hit'){const recoil=Math.sin(responseAge/.16*Math.PI)*2.2;for(const k of ['chest','head','rearHand','frontHand'])o[k]=pt(o[k].x-recoil,o[k].y+recoil*.25);}

 const interruptedCross=!f.action&&f.interruptedStrike?.action?.technique==='cross'&&Number.isFinite(o.crossTraceWeight),interruptedHook=!f.action&&f.interruptedStrike?.action?.technique==='hook'&&Number.isFinite(o.hookTraceWeight),traceAction=f.action??(interruptedCross?{technique:'cross'}:interruptedHook?{technique:'hook'}:null);
 const {nearHip,farHip,nearShoulder,farShoulder}=upperBodyRig(o),measuredRig=f.pose==='hit'&&!TECH_BY_ID[f.action?.technique]?.postureKind&&!interruptedCross&&!interruptedHook?null:observedStrikeRig(traceAction,{frontLeg:ik(nearHip,o.frontFoot,26,25,-1),rearLeg:ik(farHip,o.rearFoot,26,25,-1),frontArm:ik(nearShoulder,o.frontHand,18,17,1),rearArm:ik(farShoulder,o.rearHand,18,17,1),frontKnee:o.observedFrontKnee,crossPose:o,hookPose:o}),legP=damagePalette(c,P,flash,'leg',measuredRig?.frontLeg.b||ik(nearHip,o.frontFoot,26,25,-1).b),bodyP=damagePalette(c,P,flash,'body'),headP=damagePalette(c,P,flash,'head'),crossForward=traceAction?.technique==='cross'&&o.bodyTurn>.15,hookRearLegForward=Number.isFinite(o.hookTraceWeight)&&o.hookTraceWeight>.5&&Math.cos(o.hookTorsoYaw)<-.2,spinBack=o.spinWeight>.4&&Math.cos(o.spinYaw)<0;
 if(spinBack){
  // During the back-facing half turn, the kicking side really passes behind
  // the torso. The support side becomes the foreground, then swaps back.
  const sweepingForward=o.spinYaw>Math.PI*1.3;
  if(!sweepingForward)leg(c,nearHip,o.frontFoot,legP,true,o.footAngle,o.frontPivot,o.footPoint);
  arm(c,nearShoulder,o.frontHand,P,true,1);
  leg(c,farHip,o.rearFoot,P,false,0,o.rearPivot);torso(c,o,bodyP,P);
  if(sweepingForward)leg(c,nearHip,o.frontFoot,legP,false,o.footAngle,o.frontPivot,o.footPoint);
  head(c,o.head,o.chest,headP,o.turn,o.spinYaw,o.spinWeight);arm(c,farShoulder,o.rearHand,P,false,1);
 }else{
  const crossFoot=Number.isFinite(o.hookTraceWeight)?(o.hookRearFootAngle||0):interruptedCross?(o.crossRearFootAngle||0):f.pose!=='hit'?(f.action?.technique==='cross'?observedCrossPose(f.action,o,o,o).rearFootAngle:['highkick','roundkick'].includes(f.action?.technique)?observedKickPose(f.action,o,o,o).rearFootAngle:0):0;
  if(hookRearLegForward)leg(c,nearHip,o.frontFoot,legP,true,o.footAngle,o.frontPivot,o.footPoint,measuredRig?.frontLeg);else leg(c,farHip,o.rearFoot,P,true,crossFoot,o.rearPivot,0,measuredRig?.rearLeg,['highkick','roundkick'].includes(f.action?.technique)&&f.pose!=='hit');
  // Rotation brings the rear straight in front, without hiding the fist.
  if(crossForward)arm(c,nearShoulder,o.frontHand,P,true,1,measuredRig?.frontArm);else if(f.action?.technique!=='hook'||!o.hookWeight)arm(c,farShoulder,o.rearHand,P,true,1,measuredRig?.rearArm);
  if(hookRearLegForward)leg(c,farHip,o.rearFoot,P,false,crossFoot,o.rearPivot,0,measuredRig?.rearLeg);else leg(c,nearHip,o.frontFoot,legP,false,o.footAngle,o.frontPivot,o.footPoint,measuredRig?.frontLeg);torso(c,Number.isFinite(o.hookTraceWeight)?{...o,spinWeight:o.hookTraceWeight,spinYaw:o.hookTorsoYaw,hookTorsoNear:nearShoulder,hookTorsoFar:farShoulder}:o,bodyP,P);head(c,o.head,o.chest,Number.isFinite(o.hookTraceWeight)?{...headP,hookPreserveHair:true}:headP,o.turn,Number.isFinite(o.hookTraceWeight)?Math.PI:o.spinYaw,Number.isFinite(o.hookTraceWeight)?o.hookHeadBackWeight:o.spinWeight);
  if(f.action?.technique==='hook'&&o.hookWeight)arm(c,farShoulder,o.rearHand,P,false,1);
  if(crossForward)arm(c,farShoulder,o.rearHand,P,false,1,measuredRig?.rearArm);else arm(c,nearShoulder,o.frontHand,P,false,1,f.action?.technique==='hook'&&o.hookWeight>0?{a:nearShoulder,b:o.hookElbow,c:o.frontHand}:measuredRig?.frontArm);
 }
 if(f.pose==='hit'){c.strokeStyle='#ffe0a4';c.lineWidth=1.3;for(let n=0;n<5;n++){let a=n*1.25;line(c,pt(10+Math.cos(a)*7,-75+Math.sin(a)*7),pt(10+Math.cos(a)*11,-75+Math.sin(a)*11),'#ffe0a4',1);}}
 // Contact marks are tied to resolved engine events, never invented protection.
 if(responseAge>=0&&responseAge<.22){
  const fade=1-responseAge/.22;c.save();c.globalAlpha=fade;
  if(response.type==='block'){const contact=pt(o.frontHand.x+5,o.frontHand.y+7);for(let n=0;n<4;n++){const angle=-1.1+n*.7;line(c,pt(contact.x+Math.cos(angle)*4,contact.y+Math.sin(angle)*4),pt(contact.x+Math.cos(angle)*(8+responseAge*12),contact.y+Math.sin(angle)*(8+responseAge*12)),'#fff0c1',1.3);} }
  if(response.type==='dodge'){for(let n=0;n<3;n++){const y=-96+n*5;line(c,pt(12+n*2,y),pt(2+n*2-responseAge*14,y-1),'#e9f8e9',1.2);} }
  c.restore();
 }
 c.restore();}
const THEMES={japan:['#d7d3bf','#777e76','#4b5e63'],thailand:['#dbccb2','#7f8772','#55665b'],brazil:['#c3d3cd','#6a8b83','#3f6970'],korea:['#d2d9d6','#7e9193','#4c6977'],france:['#d1ccd0','#7e808e','#536075'],usa:['#c7cdd3','#7d8993','#4c6071']};
function background(c,key){const [wall,wood,view]=THEMES[key]||THEMES.japan;c.fillStyle=wall;c.fillRect(0,0,384,216);c.fillStyle=view;c.fillRect(0,31,384,100);for(let j=0;j<6;j++){c.fillStyle=j%2?'#ffffff0c':'#ffffff15';c.fillRect(j*70,31,46,100);}c.fillStyle=wall;c.fillRect(131,29,122,116);c.fillStyle=wood;for(const x of [8,125,253,370])c.fillRect(x,25,5,124);for(const y of [25,129,146])c.fillRect(0,y,384,5);c.fillStyle='#eae3cf';c.fillRect(171,40,42,76);c.strokeStyle='#827969';c.lineWidth=.8;c.strokeRect(171,40,42,76);c.textAlign='center';c.font='20px serif';c.fillStyle='#59615b';c.fillText('武',192,68);c.fillText('道',192,94);c.fillStyle='#a66553';c.fillRect(199,101,5,5);c.fillStyle='#c6bea4';c.fillRect(0,151,384,65);for(const y of [161,182,209]){line(c,pt(0,y),pt(384,y),'#9b9d8b',.6);}for(const x of [0,96,192,288,384])line(c,pt(x,151),pt(192+(x-192)*1.5,216),'#a2a18c',.6);line(c,pt(32,194),pt(352,194),'#e8dfbd',1);}
// Game-authored inter-character depth: a round low kick's foot passes
// behind the receiving leg. Damage still requires visible lower-shin contact.
// This does not claim recovered3D depth or alter any accepted rig coordinates.
function lowLegOcclusion(c,battle,time,postSeconds){if(!battle||battle.done||!Array.isArray(battle.fighters)||battle.fighters.length<2)return;for(let i=0;i<2;i++){const att=battle.fighters[i],def=battle.fighters[1-i];if(att.action?.technique!=='lowkick')continue;const info=acceptedContact(att,def,time);if(!info||info.footClearance===null||info.footClearance>=.3||!info.legOcclusionReceivers?.length)continue;const p=fourTracePose('lowkick',att.action.elapsed,att.action.contactLimit),x=28+att.x*.41,face=att.action.facing??att.facing,floor=189;function capsule(a,b,r1,r2){const dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy)||1,n=[-dy/l,dx/l],v=[[a[0]+n[0]*r1,a[1]+n[1]*r1],[b[0]+n[0]*r2,b[1]+n[1]*r2],[b[0]-n[0]*r2,b[1]-n[1]*r2],[a[0]-n[0]*r1,a[1]-n[1]*r1]];v.forEach((q,j)=>j?c.lineTo(...q):c.moveTo(...q));c.closePath();for(const[q,r]of[[a,r1],[b,r2]]){c.moveTo(q[0]+r,q[1]);c.ellipse(q[0],q[1],r,r,0,0,Math.PI*2);}}c.save();c.beginPath();for(const[a,b,r1,r2]of info.legOcclusionReceivers)capsule([x+a[0],floor-a[1]],[x+b[0],floor-b[1]],r1,r2);c.clip();c.beginPath();const k=p.rig.points.leftKnee,a=p.rig.points.leftAnkle;capsule([x+face*k.x,floor+k.y],[x+face*a.x,floor+a.y],3.5,2.1);fourTraceFootOutline(p.rig).forEach((q,j)=>{const v=[x+face*q[0],floor-q[1]];j?c.lineTo(...v):c.moveTo(...v)});c.closePath();c.clip();const idx=1-i,f=presentationFighter(def,battle,postSeconds),flash=damageFlashesFor(battle,idx,postSeconds),response=(battle.events||[]).filter(e=>e.fighter===idx&&(e.type==='block'||e.type==='dodge')).at(-1);fighter(c,f,idx,time,flash,battle,response,postSeconds);c.restore();}}
// View-only Dutch near-shin/sock/strike-foot scene layer. Reuses exactly the
// already approved R22 foreground operations; no geometry, clock or save changes.
const dutchLegPart=p=>/Leg|Thigh|Shin|Foot/.test(p||'');
const dutchSceneShadow=style=>style==='#26333d26'||style==='#314c4650';
function dutchForegroundMask(raw,accept){let part=null,fill=raw.fillStyle,stroke=raw.strokeStyle;const stack=[];return new Proxy(raw,{get(o,k){if(k==='contactPart')return part;if(k==='save')return()=>{stack.push([fill,stroke]);o.save();};if(k==='restore')return()=>{o.restore();[fill,stroke]=stack.pop()||[o.fillStyle,o.strokeStyle];};if(['fill','stroke','fillRect','strokeRect'].includes(k))return(...args)=>{if(!accept(part,k,k.startsWith('stroke')?stroke:fill)||o.globalAlpha===0)return;return o[k](...args)};const v=o[k];return typeof v==='function'?v.bind(o):v},set(o,k,v){if(k==='contactPart'){part=v;return true;}if(k==='fillStyle')fill=v;if(k==='strokeStyle')stroke=v;o[k]=v;return true;}});}

function dutchForegroundPair(shown,battle,time){const a=shown[0]?.f;if(a?.action?.technique!=='dutchlow'||a.action.elapsed<=0||a.action.elapsed>=.9)return false;return !(a.finishFallJoints||a.interruptedStrike||a.pose==='down'||sweepReceiving(a,time)||backfistReceiving(a,time)||ownsAxe(a)||a.jumpFallState||jumpStateFor(a,time)||a.backstep||a.reviewedThreeFall||threeReceiving(a,time)||a.finishFourTraceEntry);}

function dutchForegroundOperations(f){const ops=dutchOperations(dutchlowPose(f.action.elapsed,f.action.contactLimit),{alt:false,appearance:f.appearance}),at=ops.findLastIndex(o=>o[0]==='region'&&o[1]==='leg'),end=ops.findIndex((o,i)=>i>at&&o[0]==='region');if(at<0||end<=at)throw Error('Dutch foreground section missing');const foreground=ops.slice(at+1,end);if(foreground.filter(o=>o.contactPart==='strikeLeg').length!==7||!foreground.some(o=>o.contactPart==='supportFoot'))throw Error('Dutch existing foreground contract changed');const front=new Set(foreground);return{base:ops.filter(o=>!front.has(o)),front:[['region','leg'],...foreground]};}

function paintDutchForeground(c,f,battle,flash,postResultSeconds,ops){const x=28+clamp((Number(Number.isFinite(f.finishFrozenRootX)?f.finishFrozenRootX:traceDisplayRoot(battle,f,0,postResultSeconds))||0)/800)*328;c.save();c.translate(x,189);c.scale((f.facing??1)*.5,.5);paintApprovedOperations(c,ops,flash);c.restore();}

export function drawArena(canvas,battle,country='japan',time=0,{postResultSeconds=0,sceneKind='dojo',backgroundImage=null}={}){if(!canvas)return;const c=canvas.getContext('2d');if(!c)return;if(canvas.width!==1152)canvas.width=1152;if(canvas.height!==648)canvas.height=648;c.setTransform(3,0,0,3,0,0);c.imageSmoothingEnabled=true;const raw=typeof country==='string'?country:(country?.id||'japan'),key=({jp:'japan',th:'thailand',br:'brazil',kr:'korea',fr:'france',us:'usa'})[raw]||raw;const street=backgroundImage||sceneImage(sceneKind,raw);if(street){c.imageSmoothingEnabled=false;c.drawImage(street,0,0,384,216);c.imageSmoothingEnabled=true;}else if(sceneKind==='street'){c.fillStyle='#433653';c.fillRect(0,0,384,151);c.fillStyle='#514b5d';c.fillRect(0,151,384,65);}else background(c,key.toLowerCase());const shown=[];(battle?.fighters||[{x:270,facing:1,pose:'idle'},{x:530,facing:-1,pose:'guard'}]).forEach((original,i)=>{const f=presentationFighter(original,battle,postResultSeconds);const flash=damageFlashesFor(battle,i,postResultSeconds);const response=(battle?.events||[]).filter(e=>e.fighter===i&&(e.type==='block'||e.type==='dodge')).at(-1);shown[i]={f,flash,response};});const t=Number.isFinite(time)?time:0,paint=(ctx,i,dutchOps=null,skipShadow=false)=>{const q=shown[i];fighter(ctx,q.f,i,t,q.flash,battle,q.response,postResultSeconds,false,dutchOps,skipShadow);};if(dutchForegroundPair(shown,battle,t)&&shown.length===2){const ops=dutchForegroundOperations(shown[0].f);paint(c,0,ops.base);const d=shown[1].f,sx=28+clamp((Number(Number.isFinite(d.finishFrozenRootX)?d.finishFrozenRootX:traceDisplayRoot(battle,d,1,postResultSeconds))||0)/800)*328;oval(c,sx,191,24,3,'#26333d26');paint(dutchForegroundMask(c,(part,kind,style)=>dutchLegPart(part)||!part&&dutchSceneShadow(style)),1,null,true);paintDutchForeground(c,shown[0].f,battle,shown[0].flash,postResultSeconds,ops.front);paint(dutchForegroundMask(c,(part,kind,style)=>!dutchLegPart(part)&&!(!part&&dutchSceneShadow(style))),1,null,true);}else shown.forEach((q,i)=>paint(c,i));lowLegOcclusion(c,battle,Number.isFinite(time)?time:0,postResultSeconds);if(battle?.done&&postResultSeconds>=FINISH_PRESENTATION.titleStart){c.save();c.globalAlpha=Math.min(1,(postResultSeconds-FINISH_PRESENTATION.titleStart)/.18);c.fillStyle='#101b27e8';c.fillRect(66,25,252,55);c.font='bold 30px sans-serif';c.textAlign='center';c.fillStyle=battle.winner==='player'?'#f2cf77':'#efaa9b';c.fillText(battle.winner==='player'?'勝利':battle.winner==='opponent'?'敗北':'引き分け',192,65);c.restore();}}

// Game-authored join adapter only: capture current legacy geometry for the
// existing .108 action-time prefix. Approved core samples/times stay intact.
export function frontkickEntryRig(f,time){
 if(f.traceRestRig)return structuredClone(f.traceRestRig);
 if(f.techniques?.some(acceptedIdleMove))return fourTraceRigTransition('frontkick',fourTraceStanding('frontkick').rig,fourTraceRoleJoints('frontkick',acceptedNeutral(f,time)),1);
 const o=poseFor(f,time),u=upperBodyRig(o),cv=p=>[p.x,-p.y],j={center:cv(o.hip),chest:cv(o.chest),head:cv(o.head)};
 for(const[side,hip,foot]of[['support',u.farHip,o.rearFoot],['strike',u.nearHip,o.frontFoot]]){const z=ik(hip,foot,26,25,-1);j[side+'_hip']=cv(z.a);j[side+'_knee']=cv(z.b);j[side+'_ankle']=cv(z.c);j[side+'_heel']=[z.c.x-4,-z.c.y-3];j[side+'_toe']=[z.c.x+6.9,-z.c.y-3];}
 for(const[side,shoulder,hand]of[['near',u.nearShoulder,o.frontHand],['far',u.farShoulder,o.rearHand]]){const z=ik(shoulder,hand,18,17,1);j[side+'_shoulder']=cv(z.a);j[side+'_elbow']=cv(z.b);j[side+'_wrist']=cv(z.c);j[side+'_hand']=cv(z.c);}
 const rig=fourTraceRigTransition('frontkick',fourTraceStanding('frontkick').rig,fourTraceRoleJoints('frontkick',j),1);rig.visibility=Object.fromEntries(Object.keys(rig.visibility).map(k=>[k,'visible']));rig.entryVisibleLegacy=true;return rig;
}
// Candidate-only anatomical adapter for the existing illustrated idle renderer.
// No new pose, IK convention, palette or idle branch is selected here.
export function jumpNativeNeutral(f={},t=0){
 const o=poseFor({...f,action:null,pose:f.pose||'idle'},t),r=upperBodyRig(o),up=p=>[p.x,-p.y],j={center:up(o.hip),chest:up(o.chest),head:up(o.head)};
 for(const[s,hip,target]of[['support',r.farHip,o.rearFoot],['strike',r.nearHip,o.frontFoot]]){
  const k=ik(hip,target,26,25,-1);j[s+'_hip']=up(k.a);j[s+'_knee']=up(k.b);j[s+'_ankle']=up(k.c);j[s+'_heel']=[k.c.x-4,-k.c.y-3];j[s+'_toe']=[k.c.x+10,-k.c.y-3];
 }
 for(const[s,sh,target]of[['near',r.nearShoulder,o.frontHand],['far',r.farShoulder,o.rearHand]]){
  const k=ik(sh,target,18,17,1);j[s+'_shoulder']=up(k.a);j[s+'_elbow']=up(k.b);j[s+'_wrist']=up(k.c);j[s+'_hand']=up(k.c);
 }
 return j;
}
export function paintJumpNativeJoints(c,j,P,flash=[]){
 const p=k=>pt(j[k][0],-j[k][1]),chain=s=>({a:p(s+'_hip'),b:p(s+'_knee'),c:p(s+'_ankle')}),angle=s=>Math.atan2(-(j[s+'_toe'][1]-j[s+'_heel'][1]),j[s+'_toe'][0]-j[s+'_heel'][0]);
 const legP=damagePalette(c,P,flash,'leg',p('strike_knee')),bodyP=damagePalette(c,P,flash,'body'),headP=damagePalette(c,P,flash,'head');
 c.part='rightLeg';leg(c,p('support_hip'),p('support_ankle'),P,true,angle('support'),0,0,chain('support'));
 c.part='leftArm';arm(c,p('far_shoulder'),p('far_wrist'),P,true,1,{a:p('far_shoulder'),b:p('far_elbow'),c:p('far_wrist')});
 c.part='leftLeg';leg(c,p('strike_hip'),p('strike_ankle'),legP,false,angle('strike'),0,0,chain('strike'));
 c.part='torso';torso(c,{hip:p('center'),chest:p('chest'),bodyTurn:0,spinWeight:0},bodyP,P);c.part='head';head(c,p('head'),p('chest'),headP,0,0,0);
 c.part='rightArm';arm(c,p('near_shoulder'),p('near_wrist'),P,false,1,{a:p('near_shoulder'),b:p('near_elbow'),c:p('near_wrist')});
}


// R17 new-jump receiver only. Use the same head fill as the receiver painter.
// Existing attack families and all source poses remain unchanged.
export const jumpReceivingHead=(f,time=0)=>{
 const dutch=dutchReceivingPose(f,time);if(dutch)return dutchHeadSurfaces(dutch,{appearance:f.appearance});
 const p=jumpStateFor(f,time);if(p)return jumpVisibleSurfaces(p,'head');
 const cp=chinReceivingPose(f,time),bp=r3ReceivingPose(f,time);
 if(cp)return chinReceivingSurfaces(chinUppercutRow(cp.joints,cp.frameIndex,cp.customWeight,{groundFeet:true}),'head');
 if(bp)return r3ReceivingSurfaces(bp,'head');
 const rig=f.backstep?backstepPose(f).rig:f.interruptedStrike?.fourTrace?fourTraceInterrupted(f.interruptedStrike,time-f.interruptedStrike.createdTime).rig:isFourTrace(f.action?.technique)?fourTracePose(f.action.technique,f.action.elapsed,f.action.contactLimit).rig:!f.action&&f.pose==='idle'?f.traceRestRig:null;
 if(rig){const h=rig.head,front=rig.headView==='front',back=rig.weight>.5&&rig.headView.includes('back'),flip=!front&&rig.weight>.5&&rig.headView.includes('left')?-1:1,angle=front?(rig.koSurface?rig.referenceHeadRoll||0:0):Number.isFinite(rig.referenceHeadRoll)?rig.referenceHeadRoll*flip:Math.atan2(rig.chest.x-h.x,Math.abs(rig.chest.y-h.y))*.25,poly=front?[[-5,-5],[0,-7],[5,-5],[6,1],[4,6],[0,8],[-4,6],[-6,1]]:back?[[-5,-5],[0,-8],[5,-5],[6,2],[3,7],[-3,7],[-6,2]]:[[-5,-6],[1,-7],[5,-4],[5,0],[7,2],[5,3],[5,6],[1,8],[-3,6],[-5,2]];return[{kind:'polygon',points:poly.map(([x,y])=>back?[h.x+x,h.y+y]:[h.x+flip*(x*Math.cos(angle)-y*Math.sin(angle)),h.y+x*Math.sin(angle)+y*Math.cos(angle)])}];}
 if(targetedGuard(f.action?.technique)||f.interruptedStrike?.joints||acceptedMove(f.action?.technique)||(!f.action&&f.techniques?.some(acceptedIdleMove))){const j=targetedGuard(f.action?.technique)?targetedGuardPose(f.action.technique,f.action.elapsed):f.interruptedStrike?.joints?interruptedPose(f.interruptedStrike,time-f.interruptedStrike.createdTime):f.action?acceptedGamePose(f.action.technique,f.action.elapsed,f.action.contactLimit,f.action.contactKneeSign,f.action.kneeTheta).joints:acceptedNeutral(f,time);return jumpVisibleSurfaces({joints:j,style:'common'},'head',{appearance:f.appearance});}
 if(f.action?.technique==='highkick'&&f.pose!=='hit'&&highElapsed(f.action)>0&&highElapsed(f.action)<1.02){const o=legacyHighPoseFor(f,time);return[chinLegacyHeadSurface({...o,weight:1},true,o.registration)];}
 return[chinLegacyHeadSurface(poseFor(f,time))];
};

export function jumpIncomingStrike(att,def,time=0,battle=null){const s=jumpStateFor(def,time),id=att.action?.technique;if(!s||!['cross','crouchpunch'].includes(id))return null;const target=TECH_BY_ID[id].target,o=poseFor(att,time,id==='cross'?crossContactPoint(def.x-att.x):null),rig=upperBodyRig(o),chain=id==='cross'?crossProjectedArmRig(o):id==='hook'?hookArmRig(o):ik(rig.nearShoulder,o.frontHand,18,17,1),offset=(att.x-def.x)*.41,face=att.action?.facing??att.facing,df=def.interruptedStrike?.facing??def.action?.facing??def.facing,polygon=punchOutline(chain).map(p=>[offset+face*p[0],p[1]]),P=appearancePalette(def.appearance,pal[battle?.fighters.indexOf(def)%2||0],battle?.fighters.indexOf(def)||0),surfaces=jumpVisibleSurfaces(s,target,{appearance:def.appearance,alt:battle?.fighters.indexOf(def)===1,nativePainter:(c,j)=>paintJumpNativeJoints(c,j,P)}).map(v=>v.kind==='ellipse'?{...v,center:[df*v.center[0],v.center[1]]}:{...v,points:v.points.map(p=>[df*p[0],p[1]])});return{reaches:surfaces.some(v=>punchTouchesSurface(polygon,v)),target,polygon,surfaces,receiverStyle:s.style||'native',receiverStage:s.stage,receiverRoot:def.x,attackerRoot:att.x,coordinateSystem:'same displayed fill in current engine root'};}

// Unsupported receivers are explicit.
export function axeNativeIdleHeadGeometryPaint(c,f,time){if(f.action||f.pose!=='idle'||f.recoil||f.interruptedStrike||f.traceRestRig||f.backstep||ownsAxe(f)||f.finishFallJoints||f.finishFourTraceEntry||Number.isFinite(f.finishFrozenRootX)||f.techniques.some(acceptedIdleMove)||f.stamina<f.maxStamina)return false;const o=poseFor(f,time),P=appearancePalette(f.appearance,pal[1],1);head(c,o.head,o.chest,P,o.turn,o.spinYaw,o.spinWeight);return true;}

// Limited receiver selector, deliberately matching fighter() precedence for
// idle/ordinary guard and jab's live/interrupted/rest rig. No other action fallback.
export function axeReceiverHeadDescriptor(f,time,battle=null,index=1){
 const blocked=reason=>({supported:false,reason});
 if(battle?.done||f.hp<=0||f.pose==='down'||f.finishFallJoints||f.finishFourTraceEntry||Number.isFinite(f.finishFrozenRootX))return blocked('NONCOMBAT_OR_KO_TARGET_EXCLUDED');
 if(f.backstep||ownsAxe(f))return blocked('BACKSTEP_OR_AXE_RECEIVER_NOT_SCOPED');
 if(f.reviewedThreeFall||threeReceiving(f,time)||chinUppercut(f.action?.technique)||chinUppercut(f.interruptedStrike?.action?.technique)||bodyUppercut(f.action?.technique)||bodyUppercut(f.interruptedStrike?.action?.technique))return blocked('DISTINCT_THREE_OR_UPPERCUT_PAINTER_NOT_SCOPED');
 const P=appearancePalette(f.appearance,pal[index%2],index),approved=(j,kind)=>({supported:true,kind,floorLift:0,pose:j,faceOnly:true,paint:c=>{c.save();c.scale(.5,.5);paintApprovedFaceContactGeometry(c,j,1,index%2!==0,f.appearance);c.restore();}});
 if(targetedGuard(f.action?.technique)&&f.pose!=='hit')return approved(targetedGuardPose(f.action.technique,f.action.elapsed),f.action.technique+'-approved');
 let rig=null,kind=null;
 if(!f.action&&f.pose==='idle'&&f.traceRestRig){rig=f.traceRestRig;kind=f.traceRestId==='jab'?'jab-rest':'four-trace-rest';}
 else if(f.interruptedStrike?.fourTrace){rig=fourTraceInterrupted(f.interruptedStrike,time-f.interruptedStrike.createdTime).rig;kind=f.interruptedStrike.action?.technique==='jab'?'jab-interrupted':'four-trace-interrupted';}
 else if(f.action?.technique==='jab'||(f.action?.technique==='frontkick'&&isFourTrace('frontkick')&&f.pose!=='hit')){rig=fourTracePose(f.action.technique,f.action.elapsed,f.action.contactLimit).rig;kind=f.action.technique==='jab'?'jab-live':'frontkick57-live-actual-painter';}
 if(rig){const lift=fourTraceFloorRegistration(rig,P).lift;return{supported:true,kind,floorLift:lift,pose:rig,paint:c=>paintFourTraceHeadContactGeometry(c,rig,P)};}
 // R10: only the legally enabled v70 legacy frontkick. Dormant fourTrace data
 // and later authored frontkick variants are not licensed by this selector.
 if(f.action?.technique==='frontkickLegacy'){
  const q=legacyPaintPose(f,time,battle,index);if(!q)return blocked('FRONTKICK_LEGACY_STATE_OUTSIDE_R16_SCOPE');
  const o=q.pose;return{supported:true,kind:'frontkickLegacy-live-actual-painter',floorLift:0,pose:o,paint:c=>head(c,o.head,o.chest,P,o.turn,o.spinYaw,o.spinWeight)};
 }
 const legacyFrontkick=f.action?.technique==='frontkick'&&!isFourTrace('frontkick')&&!acceptedMove('frontkick');
 if(f.action&& !['guard','sway','crouch','jump'].includes(f.action.technique)&&!legacyFrontkick)return blocked('OTHER_LIVE_ACTION_NOT_SCOPED');
 if(f.interruptedStrike?.joints)return approved(interruptedPose(f.interruptedStrike,time-f.interruptedStrike.createdTime),'approved-interrupted');
 if(breathingEligible(f,battle))return blocked('FATIGUE_RENDER_HISTORY_NOT_IN_CONTACT_STATE');
 if(!f.action&&f.techniques?.some(acceptedIdleMove))return approved(acceptedNeutral(f,time),'approved-neutral-'+f.pose);
 if(f.interruptedStrike&&!(f.interruptedStrike.legacyStart&&f.interruptedStrike.legacyEnd))return blocked('UNKNOWN_INTERRUPTION_CONTRACT');
 if(!f.action&&!['idle','walk','hit'].includes(f.pose))return blocked('OTHER_NATIVE_POSE_NOT_SCOPED');
 let o=poseFor(f,time);const impact=(battle?.events||[]).filter(e=>e.fighter===index&&e.type==='hit'&&(TECH_BY_ID[e.technique]?.postureKind||e.receiverPosture)).at(-1),hitAge=impact?(battle.tick-impact.tick)/60:Infinity;
 if(f.pose==='hit'&&hitAge>=0&&hitAge<.12){const before=poseFor({...f,pose:'idle'},time),q=smooth(hitAge/.12);o=Object.fromEntries(Object.keys(o).map(k=>[k,typeof o[k]==='number'?mix(before[k],o[k],q):lerp(before[k],o[k],q)]));}
 const response=(battle?.events||[]).filter(e=>e.fighter===index&&(e.type==='block'||e.type==='dodge')).at(-1),age=response&&Number.isFinite(battle?.tick)&&Number.isFinite(response.tick)?(battle.tick-response.tick)/60:Infinity;
 if(response?.type==='block'&&age>=0&&age<.16&&f.action?.technique==='guard'&&f.pose!=='hit'){const recoil=Math.sin(age/.16*Math.PI)*2.2;for(const k of['chest','head','frontHand'])o[k]={...o[k],x:o[k].x-recoil,y:o[k].y+recoil*.25};}
 return{supported:true,kind:f.action?f.action.technique+'-legacy':f.interruptedStrike?'legacy-interrupted':f.pose+'-legacy',floorLift:0,pose:o,paint:c=>head(c,o.head,o.chest,P,o.turn,o.spinYaw,o.spinWeight)};
}
// QA only: executes the actual fighter path, not an independently re-created head.
export function axeReviewFighterOnly(c,f,index,time,battle){const response=(battle?.events||[]).filter(e=>e.fighter===index&&(e.type==='block'||e.type==='dodge')).at(-1);fighter(c,f,index,time,[],battle,response,0);}
// Stage-one surface adapter. Known common, direct-R5 and ordinary legacy heads.
// Three/four-trace, custom uppercut, spin, finish and guard variants are not adopted here.
// R11 body comparison: same original fist; no height adjustment or art change.
// Only common-neutral, direct backfist and existing targeted common guards are
// supported here. Legacy upper guard/sway/crouch and custom receivers stay explicit gaps.
// R37 BF attack only: current v75 receiving geometry selected by the actual
// painter. No motion, root, floor registration or other attack policy changes.
function backfistV75Receiver(def,time,battle){
 if(def.finishFallJoints||battle?.done)return null;
 const i=battle?.fighters.indexOf(def)??0,P=appearancePalette(def.appearance,pal[i%2],i);
 const fromRig=(rig,policy)=>{const lift=fourTraceFloorRegistration(rig,P).lift;return{surfaces:backfistLegacyBodySurfaces(rig).map(s=>({...s,points:s.points.map(([x,y])=>[x,y-lift])})),receiverPolicy:policy,receiverFloorLift:lift};};
 if(ownsAxe(def))return fromRig(axeDisplayRig(def,time,P).rig,'R37 current v75 axe displayed rig and floor registration');
 const jump=jumpStateFor(def,time);if(jump)return{surfaces:jumpVisibleSurfaces(jump,'body',{appearance:def.appearance,alt:i===1,nativePainter:(c,j)=>paintJumpNativeJoints(c,j,P)}),receiverPolicy:'R37 current v75 jump '+jump.style+' body from same painter'};
 if(def.backstep)return fromRig(backstepPose(def).rig,'R37 current v75 backstep displayed rig');
 if(def.interruptedStrike?.fourTrace)return fromRig(fourTraceInterrupted(def.interruptedStrike,time-def.interruptedStrike.createdTime).rig,'R37 current v75 interrupted four-trace rig');
 if(isFourTrace(def.action?.technique))return fromRig(fourTracePose(def.action.technique,def.action.elapsed,def.action.contactLimit).rig,'R37 current v75 four-trace '+def.action.technique+' exact rig');
 if(!def.action&&def.pose==='idle'&&def.traceRestRig)return fromRig(def.traceRestRig,'R37 current v75 trace rest exact rig');
 const legacy=legacyPaintPose(def,time,battle,i);if(legacy)return{surfaces:backfistLegacyBodySurfaces(legacy.pose),receiverPolicy:'R37 current v75 frontkickLegacy exact legacyPaintPose'};
 return null;
}
export function backfistActualContact(att,def,time=0,battle=null){
 const p=backfistPose(att.action.elapsed),bf=backfistReceiving(def,time),sharedTrace=backfistTraceReceiverPaint(def,time,battle,battle?.fighters.indexOf(def)??0);let joints,receiverPolicy,surfaces;const currentReceiver=bf?null:backfistV75Receiver(def,time,battle);
 if(bf){joints=bf.joints;receiverPolicy='R11 direct common-painter torso and waist';}
 else if(currentReceiver){surfaces=currentReceiver.surfaces;receiverPolicy=currentReceiver.receiverPolicy;}
 else if(sharedTrace){surfaces=backfistLegacyBodySurfaces(sharedTrace.rig);receiverPolicy='R25 same pure painter selection: '+sharedTrace.branch;}
 else if(def.action?.technique==='jab'&&!def.finishFallJoints){const r=fourTracePose('jab',def.action.elapsed,def.action.contactLimit).rig;surfaces=backfistLegacyBodySurfaces(r);receiverPolicy='R14 isolated jab: same fourTracePose rig and torso/waist fills as painter';}
 else if(['cross','jumpkick'].includes(def.action?.technique)&&def.pose!=='hit'&&!def.finishFallJoints){const o=legacyBackfistReceiverPaintPose(def,time,battle,battle?.fighters.indexOf(def));surfaces=backfistLegacyBodySurfaces(o);receiverPolicy='R21 same legacyBackfistReceiverPaintPose as actual painter; observed current state only';}
 else if(['pushkick','knee'].includes(def.action?.technique)&&def.pose!=='hit'&&!def.finishFallJoints){joints=acceptedGamePose(def.action.technique,def.action.elapsed,def.action.contactLimit,def.action.contactKneeSign,def.action.kneeTheta).joints;receiverPolicy='R21 same acceptedGamePose arguments and common body painter as actual pushkick/knee';}
 else if(!def.action&&def.interruptedStrike?.joints&&['pushkick','knee'].includes(def.interruptedStrike.action?.technique)&&!def.finishFallJoints){joints=interruptedPose(def.interruptedStrike,time-def.interruptedStrike.createdTime);receiverPolicy='R21 same interrupted approved joints for pushkick/knee; original interruption clock';}
 else if(targetedGuard(def.action?.technique)&&def.pose!=='hit'){joints=targetedGuardPose(def.action.technique,def.action.elapsed);receiverPolicy='R11 targeted-guard common torso and waist';}
 else if(!def.action&&def.techniques?.some(acceptedIdleMove)&&!def.traceRestRig&&!def.interruptedStrike){joints=acceptedNeutral(def,time);receiverPolicy='R11 common neutral torso and waist; fatigue absent in fixture';}
 else if(!def.action||['guard','sway','crouch'].includes(def.action?.technique)){surfaces=backfistLegacyBodySurfaces(poseFor(def,time));receiverPolicy='R11 separate legacy idle/guard/sway/crouch torso and waist';}
 else return{reaches:false,target:'body',unsupportedReceiver:true,receiverPolicy:'R11 other custom receiver not connected'};
 surfaces??=backfistBodySurfaces(joints);const af=att.action.facing??att.facing??1,df=sharedTrace?.facing??def.action?.facing??def.facing??-af,ax=combatDrawX(att,battle,battle?.fighters.indexOf(att)),dx=sharedTrace?.drawX??combatDrawX(def,battle,battle?.fighters.indexOf(def));
 return {...backfistSurfaceContact(p.joints,surfaces,af,df,(ax-dx)*.41,'body'),sourceIndex:p.sourceIndex,sourceElapsed:p.sourceElapsed,receiverPolicy,receiverJoints:joints,attackerDrawX:ax,receiverDrawX:dx};
}

// R50 opt-in only. Regions below are generated geometry, never measured source points.
// Other custom receiver painters are deliberately unsupported in this first gate.
export function sweepRenderedLegs(def,time=0,battle=null,root=0){const g=sweepGeometryContext(.002,part=>/Leg|Thigh|Shin|Foot/.test(part||''));g.context.translate(-root,-189);fighter(g.context,def,battle?.fighters?.indexOf(def)??1,time,[],battle,null,0,true);const records=g.records.filter(r=>/Leg|Thigh|Shin|Foot/.test(r.part||''));return{records,polygons:records.flatMap(r=>r.polygons),tolerance:g.tolerance};}
export function sweepActualContact(att,def,time=0,battle=null){
 if(!sweepActive(att))return null;
 const p=sweepPose(att.action.elapsed),face=att.action.facing??att.facing,root=28+Math.max(0,Math.min(800,combatDrawX(att,battle,battle?.fighters.indexOf(att))))*.41;
 const receiver=sweepRenderedLegs(def,time,battle,root),attack=sweepFootPrimitives(p,face),pairs=[];
 for(let i=0;i<attack.length;i++)for(let k=0;k<receiver.polygons.length;k++)if(sweepPrimitiveContact(attack[i],{kind:'polygon',points:receiver.polygons[k]})){pairs.push([i,k]);break;}
 const active=p.clock.phase==='active',rangeEligible=Math.abs(def.x-att.x)<=124;
 return{supported:receiver.polygons.length>0,reaches:active&&rangeEligible&&pairs.length>0,geometryOverlaps:pairs.length>0,pairs,active,rangeEligible,target:'leg',receiverStyle:'same-live-painter-tagged-leg-fills-and-strokes',receiverPolygonCount:receiver.polygons.length,curveToleranceNativePx:receiver.tolerance,geometryKnown:true,sourceObserved:false,registeredInEngine:'wfj-sweep-r49-fixed3d-r1',sourceIndex:p.sourceIndex};
}

export function sweepIncomingStrike(att,def,time=0,battle=null){
 const receiver=sweepReceiving(def,time),id=att.action?.technique;if(!receiver||!id)return null;
 const target=id===SWEEP_INTERNAL_ID?'leg':TECH_BY_ID[id==='frontkickLegacy'?'frontkick':id==='jumpkick101'?'jumpkick':id]?.target;if(!target)return null;
 const face=att.action.facing??att.facing,df=def.facing,offset=(combatDrawX(att,battle,battle?.fighters.indexOf(att))-combatDrawX(def,battle,battle?.fighters.indexOf(def)))*.41;
 const world=p=>[offset+face*p[0],p[1]],up=p=>[p[0],-p[1]];
 let attack=[],policy='',known=true,eligible=true;
 const poly=points=>attack.push({kind:'polygon',points:points.map(world)});
 const circle=(p,r)=>attack.push({kind:'circle',center:world(up(p)),radius:r});
 if(id===SWEEP_INTERNAL_ID){attack=sweepFootPrimitives(sweepPose(att.action.elapsed),face,offset);policy='same sweep rigid foot fill and 2px sole stroke';}
 else if(['jab','cross','crouchpunch'].includes(id)){
  let chain;if(isFourTrace(id)){const p=fourTracePose(id,att.action.elapsed,att.action.contactLimit).rig.points,c=p.leftHand,w=p.leftWrist;chain={c,b:Math.hypot(w.x-c.x,w.y-c.y)>.1?w:p.leftElbow};}
  else{const o=poseFor(att,time,id==='cross'?crossContactPoint(def.x-att.x):null),rig=upperBodyRig(o);chain=id==='cross'?crossProjectedArmRig(o):id==='hook'?hookArmRig(o):ik(rig.nearShoulder,o.frontHand,18,17,1);}
  poly(punchOutline(chain));policy='existing native punch polygon and actual attacker painter pose';
 }else if(backfist(id)){poly(backfistFist(backfistPose(att.action.elapsed).joints));policy='existing BF inscribed fist polygon';}
 else if(jumpKick(id)){poly(jumpFootPolygon(jumpPose(att.action.elapsed,att.action.contactLimit)));policy='existing jump six-vertex foot fill';}
 else if(chinUppercut(id)){const p=chinUppercutPose(att.action.elapsed);poly(chinFistOutline(chinUppercutRow(p.joints,p.frameIndex,p.customWeight,{groundFeet:true})));policy='existing chin right fist polygon';}
 else if(isFourTrace(id)){const p=fourTracePose(id,att.action.elapsed,att.action.contactLimit);for(const[v,r]of fourTraceAttackPoints(id,p.rig))circle(v,r+.3);policy='existing four-trace damage points/radii and .3 tolerance; lowkick shin only';}
 else if(att.axePrototype&&id==='axekick'){
  const p=axePrototypePose(att,time),rig=axeCommonRig(p.joints),P=appearancePalette(att.appearance,pal[battle?.fighters.indexOf(att)%2||0],battle?.fighters.indexOf(att)||0),art=fourTraceFootRegistration(rig,'right',P).art,g=sweepGeometryContext(.002),far=rig.partOrder.indexOf('rightThigh')<rig.partOrder.indexOf('leftThigh');
  paintResolvedFootContactGeometry(g.context,rig.points.rightAnkle,art,P,far);
  const det=art.ux*art.vy-art.uy*art.vx;if(Math.abs(det)<1e-8)known=false;else{const cut=p=>((p[0]-art.x)*art.vy-(p[1]-art.y)*art.vx)/det+.5;for(const r of g.records)for(const points of r.polygons){const q=sweepClip(points,cut);if(q.length>=3)poly(q);}}
  policy='existing resolved axe heel quarter fill/stroke; .002 native flatten tolerance';
 }else if(threeCombat(id)){
  const p=threePose(id,att.action.elapsed),c=threeContact(id,p.joints,receiver.joints,0);
  known=c.contactKnown===true;if(known)circle(c.point,c.radius+.04);policy='existing reviewed-display contactKnown point/radius; off-core remains unknown';
 }else if(acceptedMove(id)){
  const p=acceptedGamePose(id,att.action.elapsed,att.action.contactLimit,att.action.contactKneeSign,att.action.kneeTheta),j=p.joints;
  if(id==='sidekick'){for(const k of['strike_toe','strike_ankle'])circle(j[k],2.3);}
  else if(id==='knee')circle(j.strike_knee,3.6);
  else if(id==='pushkick'||id==='dutchlow'){const c=sweepOldContact(id,j,receiver.joints,0);attack.push({kind:'capsule',a:world(up(c.attackerSegment[0])),b:world(up(c.attackerSegment[1])),radius:2.34});eligible=id!=='dutchlow'||j.support_ankle[0]>=j.support_knee[0]+8;}
  else if(id==='bodyuppercut')circle(j.far_hand,3.5);
  else if(sweepWorldStrike(id)){const m=WORLD_STRIKES[id];circle(j[m.point],m.radius+.04);}
  policy='existing approved attack point/segment and radius; receiving side uses sweep actual fill';
 }else if(['frontkickLegacy','jumpkick','crouchlowkick'].includes(id)){
  const g=sweepGeometryContext(.002),root=28+Math.max(0,Math.min(800,combatDrawX(def,battle,battle?.fighters.indexOf(def))))*.41;
  g.context.translate(-root,-189);fighter(g.context,att,battle?.fighters.indexOf(att)??0,time,[],battle,null,0,true);
  for(const r of g.records)if(r.part==='nearFoot')for(const points of r.polygons)attack.push({kind:'polygon',points});
  policy='same native legacy attacking near-foot fill/stroke';
 }else return{reaches:false,supported:false,reason:'incoming-attack-family-unmapped',id,target};
 const ops=sweepOperations(receiver,battle?.fighters.indexOf(def)===1,def.appearance);
 const surfaces=target==='leg'?commonPainterLegPrimitives(ops,df):painterRegionSurfaces(ops,target,df).map(s=>s.kind==='polygon'?s:{kind:'polygon',points:Array.from({length:256},(_,i)=>{const a=i*Math.PI*2/256,x=s.rx*Math.cos(a),y=s.ry*Math.sin(a),c=Math.cos(s.angle||0),n=Math.sin(s.angle||0);return[s.center[0]+c*x-n*y,s.center[1]+n*x+c*y];})});
 const overlap=attack.some(a=>surfaces.some(b=>sweepPrimitiveContact(a,b)));
 return{reaches:known&&eligible&&overlap,supported:attack.length>0||!known,contactKnown:known,eligible,target,attack,surfaces,sourceIndex:receiver.sourceIndex,geometry:'same-sweep-painter-region-fill-and-leg-sole-stroke',attackPolicy:policy,legacyCrouchShapeUsed:false,sourceObserved:false};
}

function leg(...a){const c=a[0],old=c.contactPart;c.contactPart=(a[4]?'far':'near')+'Leg';try{return sweepUntagged_leg(...a);}finally{c.contactPart=old;}}

function foot(...a){const c=a[0],old=c.contactPart;c.contactPart=(a[4]?'far':'near')+'Foot';try{return sweepUntagged_foot(...a);}finally{c.contactPart=old;}}

function hand(...a){const c=a[0],old=c.contactPart;c.contactPart=(a[4]?'far':'near')+'Hand';try{return sweepUntagged_hand(...a);}finally{c.contactPart=old;}}

function arm(...a){const c=a[0],old=c.contactPart;c.contactPart=(a[4]?'far':'near')+'Arm';try{return sweepUntagged_arm(...a);}finally{c.contactPart=old;}}

function torso(...a){const c=a[0],old=c.contactPart;c.contactPart='body';try{return sweepUntagged_torso(...a);}finally{c.contactPart=old;}}

function head(...a){const c=a[0],old=c.contactPart;c.contactPart='head';try{return sweepUntagged_head(...a);}finally{c.contactPart=old;}}

function spinHead(...a){const c=a[0],old=c.contactPart;c.contactPart='head';try{return sweepUntagged_spinHead(...a);}finally{c.contactPart=old;}}
