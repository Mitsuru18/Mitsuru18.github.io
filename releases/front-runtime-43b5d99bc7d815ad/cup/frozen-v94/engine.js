import{sweepReceiving,captureSweepReceiving}from'./sweep-reaction.js';
import{SWEEP_INTERNAL_ID,SWEEP_META,SWEEP_TIMING,sweepActive,sweepPose,sweepResolutionKnots}from './sweep-candidate.js';
import{sweepActualContact as rawSweepActualContact,sweepIncomingStrike as rawSweepIncomingStrike}from './renderer.js';
import {backfistPhase,backfistResolutionKnots,backfist,backfistReceiving,backfistGeneratedReceiving,captureBackfistReceiving,backfistRest,backfistPose,backfistInterrupted} from './backfist-prototype.js';
import{axeLaunchPlan}from'./axe-prototype/launch-plan.js';
import{prepareFootSupportedEntry as prepareWalkSupportedEntry}from'./jump-entry-r51.js';
import{planJumpHybrid}from'./jump-hybrid-r17.js';
import{jumpKick,jumpPose,jumpContact,jumpPosture,jumpStateFor,JUMP_TIMING}from'./jump-approved-motion.js';
import{contourAxePredicate}from'./axe-prototype/contour-contact.js';
import{drawnAxeHeelContact}from'./axe-prototype/common-painter.js';
import{ownsAxe,releaseAxe}from'./axe-prototype/dispatch.js';
import{capture,captureRegisteredReceive,corePose,heelContact,physicalCommon}from'./axe-prototype/runtime.js';
import{axePrototypePose}from'./renderer.js';
import{beginEntryObservation,enterEntryObservationTurn,refreshEntryObservation,finishEntryObservation}from'./entry-observation.js';
export{entryObservationLog}from'./entry-observation.js';
import{evaluateEntry,hasEntrySpaceCheck,rememberEntryFailure,stepCreatesSpace,selectEntryBackstep,entryMetrics}from'./entry-trajectory.js';
import{BACKSTEP_TRIAL_RULES}from'./backstep-trial.js';
export{entryMetrics};
import{backstepPose,startBackstep,advanceBackstep,interruptBackstep}from'./backstep-trial.js';
import{frontkickSpaceForecast}from'./frontkick-space.js';
import{captureLethalTrace,traceDisplayRoot}from'./four-trace-ko.js';
import{updateSpaceObservation,spaceForecast,sidekickSpaceForecast,beginSpaceReturn,refreshSpaceReturn,convertSpaceToDamage}from'./space-interruption.js';
import{advanceTraceRoot,resolveTraceBodies,hasTraceBodies,traceRootContext}from'./four-trace-root.js';
import{fourTraceRootView,fourTraceGameTime,isFourTrace,fourTraceReadView,fourTracePose,fourTraceContact,fourTraceStanding,fourTraceRigTransition,fourTraceJoints,fourTraceRoleJoints}from'./four-trace-motion.js';
import {threeReceiverSurface} from './approved-three-receiver.js';
import {threeCombat,threePose,threeContact,threeInterrupted,threeReceiving,threeBlend,paintThreeCombat,HORIZONTAL_ELBOW_METADATA,threeResolutionSamples} from './approved-three-combat.js';
import{DUTCH_STEP,rawSolePush,soleSegment}from'./leg-strike-motion.js';
import {targetedGuard,targetedGuardPose} from'./targeted-guard.js';
import{worldStrike,legacyWorldJoints}from'./world-strikes.js';
import {RECOIL,recoilEase,surfaceLimit,capsuleNearX} from'./contact-motion.js';
import{ABILITY_RULES}from'./attributes.js';
export{ABILITY_RULES}from'./attributes.js';
import {FIRST_DOJO,starterLoadout} from'./first-dojo.js';
import {SPIN_TIMING} from'./spin-timing.js';
import {postureContactFor} from'./posture-motion.js';
export const STAMINA_RULES=Object.freeze({attackRecovery:0,defenseRecovery:.5,restRecovery:5,attackReserve:4,defenseReserve:5});
/** Fixed-tick, seeded and DOM-free combat. World coordinates: 800 x 360. */
export const DAMAGE_RULES=Object.freeze({minimum:1,defenseMinimum:.4,blockMultiplier:.28,randomBase:.91,randomSpan:.18,guardMinimumStamina:4,guardImpactCost:0});
export{TECHNIQUES}from'./technique-data.js';
import{TECHNIQUES,FRONTKICK_LEGACY}from'./technique-data.js';
import{acceptedMove,acceptedIdleMove,acceptedGamePose,contactLocal,WORLD_TO_DRAW,interruptedPose}from'./accepted-motion.js';
import{legacyBackfistReceiverPaintPose,backfistActualContact,frontkickEntryRig,poseFor as visibleLegacyPose,acceptedNeutral,frontkickGeometry,bodyUppercutIncomingPunch,chinUppercutActualContact,jumpNativeNeutral,jumpReceivingHead,jumpIncomingStrike}from'./renderer.js';
export const RETIRED_SKILLS=Object.freeze(['hook']);
export const UNAVAILABLE_2D=Object.freeze({roundkick:'回旋軌道の横視点作画を保留',spinkick:'回転中の向きと接触表現を保留',highkick:'現行の回し蹴り系作画を保留'});
export const availableIn2D=id=>!RETIRED_SKILLS.includes(id)&&!Object.hasOwn(UNAVAILABLE_2D,id);
export const approved2DStudy=id=>['sidekick','knee'].includes(id);
export const STRATEGIES = {
 balanced:{name:'バランス',description:'攻守にバランスいい',distance:100,aggression:.82,defense:.88,counter:1},
 pressure:{name:'オフェンシブ',description:'どんどん自ら攻撃をする',distance:62,aggression:.98,defense:.62,counter:1},
 counter:{name:'カウンター',description:'短く下がって守り、成功後20%増の反撃。膠着3秒で接近',distance:104,aggression:.38,defense:.98,counter:1},
 outside:{name:'ヒットアンドアウェイ',description:'一撃加えつつ、距離を取りながら戦う',distance:124,aggression:.68,defense:.90,counter:1}
};
const INDEX=Object.assign(Object.create(null),Object.fromEntries(TECHNIQUES.map(t=>[t.id,t])),{frontkickLegacy:FRONTKICK_LEGACY});INDEX.jumpkick101={...INDEX.forwardjumpkick,id:'jumpkick101',publicSkillId:'forwardjumpkick',...JUMP_TIMING,postureKind:undefined};
INDEX[SWEEP_INTERNAL_ID]={...INDEX.crouchlowkick,...SWEEP_META,id:SWEEP_INTERNAL_ID,publicSkillId:'crouchlowkick',skillId:'crouchlowkick',postureKind:'crouch'};
export const TARGET_REGIONS={head:'頭部',body:'胴体',leg:'脚部'};
export const strikeTarget=id=>typeof id==='string'?INDEX[id]?.target??null:null;
export const isReactive=t=>t?.type==='defense'||t?.type==='evasion';
export const isStrike=t=>!!t&&!RETIRED_SKILLS.includes(t.id)&&['punch','kick'].includes(t.type);
export const canSway=t=>!!t?.swayable&&['head','body'].includes(t.target);
/** Shared by live resolution and the game's non-mutating skill demonstrations. */
export function defenseOutcome(tech,defenseId,stamina=100){
 if(defenseId==='sway'&&canSway(tech))return 'dodge';
 const posture=INDEX[defenseId]?.postureKind;
 if((posture==='crouch'&&tech?.target==='head')||(posture==='jump'&&tech?.target==='leg'))return 'dodge';
 if(defenseId==='lowguard'&&tech?.target==='leg')return 'dodge';
 if(((defenseId==='guard'&&tech?.target==='head')||(defenseId==='midguard'&&tech?.target==='body'))&&stamina>=DAMAGE_RULES.guardMinimumStamina)return 'block';
 return 'hit';
}
export const SKILL_LIMITS={strike:4,defense:2,other:2};
export const SKILL_CATEGORIES={strike:'打撃',defense:'守備',other:'その他'};
export function skillCategory(id){if(RETIRED_SKILLS.includes(id))return null;const t=typeof id==='string'?INDEX[id]:null;return t?.type==='defense'?'defense':t?.type==='evasion'?'other':t?'strike':null;}
/** Keep only known, unique skills within the same limits for either fighter. */
export function limitLoadout(ids=[],known=ids){if(!Array.isArray(ids)||!Array.isArray(known))return [];const counts={strike:0,defense:0,other:0};return [...new Set(ids)].filter(id=>{if(id==='frontkickLegacy'||typeof id!=='string'||RETIRED_SKILLS.includes(id)||!TECHNIQUES.some(t=>t.id===id)||!known.includes(id))return false;const cat=skillCategory(id);return counts[cat]++<SKILL_LIMITS[cat];});}
export const LOCOMOTION_RULES=Object.freeze({forward:90,backward:90});
// AI distance decisions only, in world units. This absorbs sub-ulp platform math
// drift without changing collision geometry, world state, timing or RNG calls.
// 1e-9 is 100x below the existing 1e-7 real-movement threshold and 7.5e8x
// below the observed 0.75-world walk step. Outside predicates use its negation.
export const AI_DISTANCE_EPSILON=1e-9;
export function aiDistanceWithin(distance,limit){return distance<=limit+AI_DISTANCE_EPSILON;}
export const COUNTER_RULES=Object.freeze({stalemateSeconds:3,replySeconds:3,replyPower:1.2,readiness:1,defenseCooldownScale:.85,retreatSeconds:.35,retreatDistance:24,retreatCooldown:1});
const STEP=1/60;
export const ACTIVE_SWEEP_FRACTIONS=Object.freeze([.25,.5,.75,.999999]);
// Shared CPU subdivision rule for execution and observed-trajectory prediction.
export function motionMicrostepParts(...rates){return Math.max(1,Math.min(128,Math.ceil(Math.max(...rates)/1.1)));}
function pendingReply(b,f){return f.strategy==='counter'&&f.counterReplyUntil>=b.time;}
function defenseSucceeded(b,f){f.counterPending=true;if(f.strategy==='counter'){f.counterReplyUntil=b.time+COUNTER_RULES.replySeconds;f.stats.replyEarned=(f.stats.replyEarned||0)+1;}}
function updateCounterStalemate(b,delta){
 if(!b.fighters.some(f=>f.strategy==='counter'))return;
 const now=b.fighters.map(f=>({x:f.x,attacks:f.stats.attacks})),old=b.counterIdleSnapshot;
 const quiet=(!old||now.every((f,i)=>Math.abs(f.x-old[i].x)<1e-9&&f.attacks===old[i].attacks))&&!b.fighters.some(f=>isStrike(INDEX[f.action?.technique]));
 b.counterIdleSeconds=quiet?(b.counterIdleSeconds||0)+delta:0;b.counterIdleSnapshot=now;
 if(old&&now.some((f,i)=>f.attacks!==old[i].attacks))for(const f of b.fighters)f.counterApproach=false;
 if(b.counterIdleSeconds>=COUNTER_RULES.stalemateSeconds)for(const f of b.fighters)if(f.strategy==='counter'&&!f.counterApproach){f.counterApproach=true;f.stats.stalemateBreaks=(f.stats.stalemateBreaks||0)+1;}
}
// One rate for visible actions, defense windows, locomotion and their labels.
export function motionRate(f){const speed=Number(f.speed),base=Number.isFinite(speed)&&speed>0?Math.max(.5,speed):1;return ABILITY_RULES.tempo*(base+ABILITY_RULES.globalSpeedPoints*ABILITY_RULES.speedPerPoint);}
// Locomotion alone gets a clearer allocation contrast; strike/defense clocks stay unchanged.
export function movementRate(f){const rate=motionRate(f);return rate+Math.max(0,rate-ABILITY_RULES.tempo)*(ABILITY_RULES.moveSpeedPerPoint/ABILITY_RULES.speedPerPoint-1);}
// Existing techniques, costs and damage are unchanged; curricula bias choices and
// target spacing only. Four fight styles still control aggression and defense.
function curriculumWeight(f,t){if(t?.id==='frontkickLegacy')t={...t,id:'frontkick'};if(!f.curriculum)return f.combatTheme==='long-kicks'&&['pushkick','sidekick'].includes(t.id)||f.combatTheme==='close-elbows'&&['elbow','knee'].includes(t.id)||f.combatTheme==='angular-arms'&&t.id==='bolopunch'||f.combatTheme==='spear-shield'&&t.id==='spear'?1.8:1;const preferred={
 'measured-strikes':['cross','sidekick'], 'close-defense':['knee','lowkick'],
 'level-change':['crouchpunch','crouchlowkick'], 'long-kicks':['sidekick','jumpkick','forwardjumpkick','axekick'],
 'fencing-kicks':['sidekick','frontkick'], 'boxing-levels':['jab','cross','crouchpunch'],
 'push-exit':['pushkick'], 'punch-low':['jab','cross','dutchlow'],
 'close-elbows':['elbow','knee'], 'angular-arms':['bolopunch'], 'spear-shield':['spear'], 'silat-hands':['backfist','hammerfist']
 };return preferred[f.combatTheme]?.includes(t.id)?1.8:1;}
function curriculumDistance(f,desired){if(!f.curriculum)return desired;const close={'close-defense':88,'close-elbows':78,'boxing-levels':80,'level-change':92};return Math.min(desired,close[f.combatTheme]??Infinity);}
function random(b){ let t=b.rng+=0x6D2B79F5;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296; }
function makeFighter(p,i,strategy){
 const maxStamina=Math.max(1,Number(p.maxStamina??50));
 const maxHp=Math.max(1,Number(p.maxHp??p.hp??100));
 return {...(p.curriculum?{curriculum:true}:{}),appearance:p.appearance??null,...((p.combatTheme||p.techniques?.includes('dutchlow'))?{combatTheme:p.combatTheme??'punch-low',comboNext:null}:{}),decisionProbability:Number.isFinite(p.decisionProbability)?Math.max(0,Math.min(1,p.decisionProbability)):null,approachMargin:p.approachMargin??9,...(p.openingLesson===true?{openingSpacing:FIRST_DOJO.opponentSpacing}:{}),attackMargin:p.attackMargin??-5,name:p.name??(i?'旅の武闘家':'あなた'),maxHp,hp:maxHp,power:Number(p.power??1),defense:Number(p.defense??1),speed:Number(p.speed??1),motionTime:0,walkTime:0,techniques:limitLoadout(p.techniques??['jab','frontkick']),x:i?495:305,y:0,facing:i?-1:1,maxStamina,stamina:Math.max(0,Math.min(maxStamina,Number(p.initialStamina??maxStamina))),pose:'idle',action:null,lastAction:null,poseTimer:0,cooldown:.2,defenseCooldown:0,reactedAttackTick:null,plan:null,strategy:STRATEGIES[strategy]?strategy:'balanced',stats:{counterAttacks:0,disengagements:0,retreatDistance:0,hits:0,blocked:0,dodged:0,missed:0,damage:0,attacks:0,defenses:0,guardUses:0,swayUses:0,crouchUses:0,jumpUses:0}};
}
function createTrialBattleCore({player={},opponent={},strategy=player.fightStyle??'balanced',seed=1}={}){
 const initialSkills=limitLoadout(player.techniques??['jab','frontkick']);const lesson=opponent.openingLesson===true&&starterLoadout(initialSkills);const configuredPlayer=lesson?{...player,...FIRST_DOJO.playerAI}:player;
 return {fighters:[makeFighter(configuredPlayer,0,strategy),makeFighter(opponent,1,opponent.strategy??'balanced')],seed:seed>>>0,rng:seed>>>0,time:0,tick:0,accumulator:0,done:false,winner:null,reason:'',log:['試合開始！ 動きを観察しよう。'],observed:[],events:[],report:{fighters:[{moves:{}},{moves:{}}]},duration:60};
}
export function currentTechnique(f,tick){
 const a=f.lastAction;if(!a||(!f.action&&tick>a.expiresTick))return null;return {technique:a.technique,name:a.name,type:a.type,target:strikeTarget(a.technique),phase:a.phase,startedTick:a.startedTick,phaseStartedTick:a.phaseStartedTick};
}
/** One authoritative posture window for combat, UI and character rendering.
 * Windup and recovery are deliberately vulnerable, including composite moves. */
export function postureState(f){if(jumpKick(f?.action?.technique)){const p=jumpPosture(f.action);return f.action.publicSkillId==='forwardjumpkick'?{...p,label:'前方への跳び蹴り'}:p;}
 const a=f?.action,kind=INDEX[a?.technique]?.postureKind;if(!kind)return null;
 const active=a.phase==='active',phase=a.phase;
 const label=kind==='jump'?(active?'空中：脚部回避':phase==='windup'?'跳ぶ準備':'着地・無防備'):(active?'しゃがみ：頭部回避':phase==='windup'?'低くなる':'立ち戻り・無防備');
 return {kind,phase,active,evades:active?(kind==='jump'?'leg':'head'):null,label};
}
function displayPhase(f,phase,tick){if(!f.lastAction)return;if(f.lastAction.phase!==phase){f.lastAction.phase=phase;f.lastAction.phaseStartedTick=tick;}}
function log(b,s){b.log.push(s);if(b.log.length>30)b.log.shift();}
function end(b){
 b.done=true;
 const [a,c]=b.fighters,score=a.hp/a.maxHp-c.hp/c.maxHp;
 b.winner=Math.abs(score)<.00001?'draw':score>0?'player':'opponent';
 const ko=a.hp<=0||c.hp<=0;
 b.reason=ko?'KO': '時間切れ・残り体力で判定';
 if(b.winner==='opponent'){
  b.reason+='。'+(a.stats.missed>a.stats.hits?'相手との間合いが合いませんでした。別の道場の技も役立ちます。':a.stamina<25?'スタミナが不足しました。経験を持ち帰り、もう一度挑戦しよう。':'相手の攻撃を受けすぎました。経験を持ち帰り、もう一度挑戦しよう。');
 }
 log(b,b.winner==='draw'?'引き分け。次の挑戦に活かそう。':`${b.winner==='player'?a.name:c.name} の勝利！`);
}
function emitCombat(b,event){if(event.technique===SWEEP_INTERNAL_ID)event={...event,technique:'crouchlowkick',motionVariant:'sweep-r50'};if(event.interruptedTechnique===SWEEP_INTERNAL_ID)event={...event,interruptedTechnique:'crouchlowkick',interruptedMotionVariant:'sweep-r50'};if(event.technique==='frontkickLegacy'){event={...event,technique:'frontkick',motionVariant:'legacy-close'};}else if(event.technique==='frontkick')event={...event,motionVariant:'approved-57'};if(event.interruptedTechnique==='frontkickLegacy')event={...event,interruptedTechnique:'frontkick',interruptedMotionVariant:'legacy-close'};if(event.interruptedTechnique==='jumpkick101')event={...event,interruptedTechnique:'forwardjumpkick',interruptedMotionVariant:'approved101-experimental'};if(event.technique==='jumpkick101')event={...event,technique:'forwardjumpkick',motionVariant:'approved101-experimental'};b.events.push(event);if(!b.report||!['hit','block','miss','dodge'].includes(event.type))return;const receiver=event.receiver??event.fighter;if(!Number.isInteger(receiver)||!b.report.fighters[receiver])return;const records=b.report.fighters[receiver].moves,row=records[event.technique]??={technique:event.technique,target:event.target,hits:0,guards:0,misses:0,evades:0,damage:0,guardDamage:0};if(event.type==='hit'){row.hits++;row.damage+=event.appliedDamage??event.damage??0}if(event.type==='block'){row.guards++;row.damage+=event.appliedDamage??event.damage??0;row.guardDamage+=event.appliedDamage??event.damage??0}if(event.type==='miss')row.misses++;if(event.type==='dodge')row.evades++;}
// Solid contact extends only the original kick; it does not make it a traced/retargeted move.
export const solidContactMove=id=>(id==='frontkick'||id==='frontkickLegacy')||acceptedMove(id);
function contactBodyJoints(def,time){const sp=sweepReceiving(def,time);if(sp)return sp.joints;const bf=backfistReceiving(def,time);if(bf)return bf.joints;if(ownsAxe(def))return axePrototypePose(def,time).joints;const jp=jumpStateFor(def,time);if(jp)return jp.joints;if(def._entryFrozenJoints)return def._entryFrozenJoints;const receiver=threeReceiving(def,time);if(receiver)return threeReceiverSurface(receiver).joints;if(def.backstep)return backstepPose(def).joints;if(!def.action&&def.pose==='idle'&&def.traceRestRig)return fourTraceJoints(def.traceRestRig);
 if(targetedGuard(def.action?.technique))return targetedGuardPose(def.action.technique,def.action.elapsed);
 if(def.interruptedStrike?.joints)return interruptedPose(def.interruptedStrike,time-def.interruptedStrike.createdTime);
 if(isFourTrace(def.action?.technique))return fourTraceReadView(def.action.technique,def.action.elapsed,def.action.contactLimit).joints;
 if(acceptedMove(def.action?.technique))return acceptedGamePose(def.action.technique,def.action.elapsed,def.action.contactLimit,def.action.contactKneeSign,def.action.kneeTheta).joints;
 if(!def.action&&def.techniques?.some(acceptedIdleMove))return acceptedNeutral(def,time);
 const o=visibleLegacyPose(def,time);return legacyWorldJoints(o);
}
export function frontkickContact(att,def,time=0){
 const g=frontkickGeometry(att,time),j=contactBodyJoints(def,time),face=att.action?.facing??att.facing,df=def.action?.facing??def.facing,gap=(def.x-att.x)*WORLD_TO_DRAW,a=[gap+j.center[0]*df,j.center[1]],b=[gap+j.chest[0]*df,j.chest[1]];
 let distance=Infinity,point=null;for(const v of g.points){const p=[v.x*face,-v.y],dx=b[0]-a[0],dy=b[1]-a[1],q=Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/(dx*dx+dy*dy||1))),d=Math.hypot(p[0]-a[0]-dx*q,p[1]-a[1]-dy*q);if(d<distance){distance=d;point=p;}}
 return{reaches:distance<=10.3+1e-6,distance,radius:2.3,point,receiver:[a,b]};
}
function updateFrontkickLimit(f,enemy,time){
 const a=f.action,pc=postureContactFor(INDEX.frontkick,enemy.action);a.frontkickAimY=pc?.reaches?pc.aimY:0;
 const g=frontkickGeometry({...f,action:{...a,contactLimit:null}},time),j=contactBodyJoints(enemy,time),face=a.facing??f.facing,df=enemy.action?.facing??enemy.facing,gap=(enemy.x-f.x)*WORLD_TO_DRAW*face,center=[gap+j.center[0]*df*face,j.center[1]],chest=[gap+j.chest[0]*df*face,j.chest[1]];
 let limit=Infinity;if(gap>=0)for(const v of g.points){const bound=capsuleNearX(-v.y,center,chest);if(Number.isFinite(bound))limit=Math.min(limit,bound+g.leading.x-v.x);}
 a.contactLimit=Number.isFinite(limit)?limit:null;
}
function recordFrontkickMiss(b,att,def,tech){const visible=frontkickContact(att,def,b.time);att.stats.missed++;emitCombat(b,{type:'miss',reason:'geometry',fighter:b.fighters.indexOf(att),attacker:b.fighters.indexOf(att),receiver:b.fighters.indexOf(def),attackerX:att.x,receiverX:def.x,facing:att.facing,distance:Math.abs(att.x-def.x),tick:b.tick,technique:tech.id,target:tech.target,visibleContact:visible,actionElapsed:att.action.elapsed});}
function markThreeReceiver(contact,surface){return surface?{...contact,receiverSurfacePolicy:surface.policy,receiverSurfaceProvenance:surface.provenance,receiverSourceIndex:surface.sourceIndex}:contact;}
export function acceptedContact(att,def,time=0,battle=null){const sweep=sweepIncomingStrike(att,def,time,battle);if(sweep)return sweep;if(backfist(att.action?.technique))return backfistActualContact(att,def,time,battle);if(att.axePrototype&&att.action?.technique==='axekick'){const c=contourAxePredicate(att,def,time,{battle});return c.supported?c:{...c,reaches:false,target:'head',geometryBlocked:true,geometry:'UNSUPPORTED_RECEIVER_NO_PROXY_FALLBACK'};}
if(jumpKick(att.action?.technique))return jumpContact(jumpPose(att.action.elapsed,att.action.contactLimit),jumpReceivingHead(def,time),(def.x-att.x)*WORLD_TO_DRAW,att.action.facing??att.facing,def.action?.facing??def.facing);
 if(att.action?.technique==='uppercut')return chinUppercutActualContact(att,def,time,battle);
 const p=isFourTrace(att.action?.technique)?fourTraceReadView(att.action.technique,att.action.elapsed,att.action.contactLimit):acceptedGamePose(att.action?.technique,att.action?.elapsed,att.action?.contactLimit,att.action?.contactKneeSign,att.action?.kneeTheta);if(!p)return null;const threeReceiver=def._entryFrozenJoints?null:threeReceiving(def,time),receiverSurface=threeReceiver?threeReceiverSurface(threeReceiver):null;if(isFourTrace(att.action?.technique)){const j=contactBodyJoints(def,time),c=fourTraceContact(att.action.technique,p.joints,j,(def.x-att.x)*WORLD_TO_DRAW,att.action.facing??att.facing,def.action?.facing??def.facing);if(att.action.technique==='jab'){const receiver=bodyUppercutIncomingPunch(att,def,time,battle);if(receiver)return{...c,reaches:receiver.reaches,clearance:receiver.reaches?0:null,distance:null,clearanceMetric:'actual polygon intersection only; no signed penetration distance',proxyGeometry:{reaches:c.reaches,clearance:c.clearance},bodyReceiverContact:receiver};}return markThreeReceiver(c,receiverSurface);}
 let j=ownsAxe(def)?axePrototypePose(def,time).joints:def._entryFrozenJoints;if(!j){if(targetedGuard(def.action?.technique))j=targetedGuardPose(def.action.technique,def.action.elapsed);else if(def.interruptedStrike?.joints)j=interruptedPose(def.interruptedStrike,time-def.interruptedStrike.createdTime);else if(acceptedMove(def.action?.technique))j=acceptedGamePose(def.action.technique,def.action.elapsed,def.action.contactLimit,def.action.contactKneeSign,def.action.kneeTheta).joints;
 else if(!def.action&&def.techniques?.some(acceptedIdleMove))j=acceptedNeutral(def,time);
 else{const o=visibleLegacyPose(def,time);j=(threeCombat(att.action?.technique)||worldStrike(att.action?.technique)||isFourTrace(att.action?.technique)||att.action?.technique==='bodyuppercut')?legacyWorldJoints(o):{center:[o.hip.x,-o.hip.y],chest:[o.chest.x,-o.chest.y]};}
 }
 if(receiverSurface)j=receiverSurface.joints;const contact=contactLocal(att.action.technique,p.joints,j,(def.x-att.x)*WORLD_TO_DRAW,att.action.facing??att.facing,acceptedMove(def.action?.technique)?(def.action.facing??def.facing):def.facing);return markThreeReceiver(contact,receiverSurface);
}
function fourTraceEvasion(b,att,def,tech){if(!isFourTrace(tech.id)||def.action?.phase!=='active'||!def.techniques?.includes(def.action.technique)||defenseOutcome(tech,def.action.technique,def.stamina)!=='dodge')return false;const standing={...def,action:null,pose:'idle',poseTimer:0,interruptedStrike:null},j=contactBodyJoints(standing,b.time),p=fourTraceReadView(tech.id,att.action.elapsed,att.action.contactLimit);return fourTraceContact(tech.id,p.joints,j,(def.x-att.x)*WORLD_TO_DRAW,att.action.facing??att.facing,def.facing).reaches;}
function recordAcceptedMiss(b,att,def,tech){const c=acceptedContact(att,def,b.time,b);att.stats.missed++;emitCombat(b,{type:'miss',reason:'geometry',fighter:b.fighters.indexOf(att),attacker:b.fighters.indexOf(att),receiver:b.fighters.indexOf(def),attackerX:att.x,receiverX:def.x,facing:att.action?.facing??att.facing,distance:Math.abs(att.x-def.x),tick:b.tick,technique:tech.id,target:tech.target,visibleContact:c,sourceElapsed:acceptedGamePose(tech.id,att.action.elapsed).sourceElapsed});}

// R2: one geometry predicate controls both launch and approach. Existing radii only.
// Predict only the currently known defender action; no future AI action is invented.
const elbowPlanCache=new WeakMap();
export function elbowApproachPlan(f,enemy,time=0){const key=[time,f.x,enemy.x,f.facing,enemy.action?.technique,enemy.action?.elapsed,enemy.pose,enemy.poseTimer].join('|'),cached=elbowPlanCache.get(f);if(cached?.key===key)return cached.value;const t=INDEX.horizontalelbow;if(!t)return null;const face=f.facing||1,dist=Math.abs(enemy.x-f.x),intervals=[];let minimumVertical=Infinity;
 for(let i=0;i<=24;i++){const elapsed=t.windup+(t.active??.12)*i/24,dt=elapsed/motionRate(f),d={...enemy,x:0};if(enemy.action){d.action={...enemy.action,elapsed:enemy.action.elapsed+dt*motionRate(enemy)};const et=INDEX[d.action.technique];if(et&&d.action.elapsed>=et.windup+(et.active??.12)+et.recovery){d.action=null;d.pose='idle';d.poseTimer=0;}else if(et){d.action.phase=d.action.elapsed<et.windup?'windup':d.action.elapsed<et.windup+(et.active??.12)?'active':'recovery';}}const a={...f,x:0,action:{technique:'horizontalelbow',elapsed,facing:face}},c=acceptedContact(a,d,time+dt);if(!c?.point||!c.receiver?.length)continue;const q=c.receiver[0],dy=c.point[1]-q[1],radius=10.04;minimumVertical=Math.min(minimumVertical,Math.abs(dy));if(Math.abs(dy)>radius)continue;const span=Math.sqrt(radius*radius-dy*dy),center=(c.point[0]-q[0])*face,lo=Math.max(35,(center-span)/WORLD_TO_DRAW),hi=Math.min(t.range+12,(center+span)/WORLD_TO_DRAW);if(hi>=lo)intervals.push([lo,hi]);}
 const reaches=intervals.some(([a,b])=>dist>=a&&dist<=b),best=intervals.sort((a,b)=>Math.abs(dist-(a[0]+a[1])/2)-Math.abs(dist-(b[0]+b[1])/2))[0];const value={reaches,desired:best?Math.max(best[0],best[1]-3):35,intervals,minimumVertical,verticalImpossible:minimumVertical>10.04};elbowPlanCache.set(f,{key,value});return value;}
function reviewedLaunchReady(f,enemy,t,time,b=null){if(t.id==='forwardjumpkick'&&b)return jumpHybridPlan(b,b.fighters.indexOf(f)).allowed;if(t.id==='axekick'&&f.axePrototype&&b){const threat=INDEX[enemy.action?.technique];return !(isStrike(threat)&&['windup','active'].includes(enemy.action?.phase))&&axeLaunchPlan(b,f).ready;}if(t.id==='sidekick'&&b){const proof=evaluateEntry(b,b.fighters.indexOf(f),t,ENTRY_CONTEXT,{force:f.cooldown<=0&&f.poseTimer===0&&f.stamina>=t.cost+STAMINA_RULES.attackReserve});return !proof.pending&&proof.spaceSafe&&proof.reachable;}return t.id!=='horizontalelbow'||elbowApproachPlan(f,enemy,time).reaches;}

export function targetDistance(att,def,tech){
 if(isFourTrace(tech.id))return Math.abs(att.x-def.x);

 let j;if(acceptedMove(def.action?.technique))j=acceptedGamePose(def.action.technique,def.action.elapsed,def.action.contactLimit,def.action.contactKneeSign,def.action.kneeTheta).joints;
 if(threeCombat(def.action?.technique))j=threeReceiverSurface({id:def.action.technique,...threePose(def.action.technique,def.action.elapsed)}).joints;if(!j)return Math.abs(att.x-def.x);const p=tech.target==='head'?j.head:tech.target==='leg'?j.support_knee:[(j.center[0]+j.chest[0])/2,(j.center[1]+j.chest[1])/2];return Math.abs(att.x-(def.x+def.facing*p[0]/WORLD_TO_DRAW));
}
// A successful visible evasion still earns its existing defense/counter reply.
// Resolve only the dodge outcome, never a damaging contact through empty space.
function chinEvasionReady(b,att,def,tech){if(tech.id!=='uppercut')return false;const id=def.action?.phase==='active'&&def.techniques.includes(def.action.technique)?def.action.technique:null;if(defenseOutcome(tech,id,def.stamina)!=='dodge')return false;const neutral={...def,action:null,interruptedStrike:null,pose:'idle'};return chinUppercutActualContact(att,neutral,b.time,b).reaches;}
function r3PunchReady(b,att,def,tech){const c=bodyUppercutIncomingPunch(att,def,b.time,b);if(!c)return true;att.action.r3ReceiverPending=c;return c.reaches||targetDistance(att,def,tech)>tech.range+12;}
function recordR3PunchMiss(b,att,def,tech){const c=att.action.r3ReceiverPending;att.stats.missed++;emitCombat(b,{type:'miss',reason:'body-receiver-shape',fighter:b.fighters.indexOf(att),attacker:b.fighters.indexOf(att),receiver:b.fighters.indexOf(def),technique:tech.id,target:tech.target,tick:b.tick,attackerX:att.x,receiverX:def.x,facing:att.facing,distance:Math.abs(att.x-def.x),bodyReceiverContact:c});}
// Resolution undo log: values retain original object identities and aliases.
// Only armed for a sweep resolution, never for ordinary frames or AI turns.
function resolutionUndo(root){
 const seen=new Set(),rows=[];
 function visit(o){if(!o||typeof o!=='object'||seen.has(o))return;seen.add(o);const entries=Object.entries(o);rows.push([o,entries,Array.isArray(o)?o.length:null]);for(const[,v]of entries)visit(v);}
 visit(root);
 return()=>{for(const[o,entries,length]of rows){const keys=new Set(entries.map(([k])=>k));for(const k of Object.keys(o))if(!keys.has(k))delete o[k];for(const[k,v]of entries)if(o[k]!==v)o[k]=v;if(length!==null)o.length=length;}};
}
function fallbackSweep(b,f,error,scope){
 const a=f.action;
 if(a?.technique===SWEEP_INTERNAL_ID){
  const from=INDEX[SWEEP_INTERNAL_ID],to=INDEX.crouchlowkick,e=a.elapsed;
  a.elapsed=e<from.windup?e/from.windup*to.windup:e<from.windup+from.active?to.windup+(e-from.windup)/from.active*to.active:to.windup+to.active+(e-from.windup-from.active)/from.recovery*to.recovery;
  a.technique='crouchlowkick';delete a.motionVariant;delete a.publicSkillId;delete a.skillId;
  if(f.lastAction){f.lastAction.technique='crouchlowkick';f.lastAction.name=to.name;delete f.lastAction.motionVariant;}
 }
 delete f.sweepReaction;delete f.sweepKOEntry;
 if(f.interruptedStrike?.sweepEntry)delete f.interruptedStrike.sweepEntry;
 if(b){b.sweepFallbackCount=(b.sweepFallbackCount||0)+1;const rows=b.sweepFailures??=[];if(rows.length<32)rows.push({seed:b.seed,tick:b.tick,time:b.time,fighter:b.fighters.indexOf(f),scope,error:String(error?.message??error),stack:String(error?.stack??'').slice(0,2000)});}
}
// Geometry queries are read-only. A failed receiver query can be retried by
// the caller's ordinary path after converting that receiver's current action.
function sweepIncomingStrike(att,def,time,b=null){try{return rawSweepIncomingStrike(att,def,time,b);}catch(error){if(!sweepActive(def)&&!def.sweepReaction&&!def.sweepKOEntry&&!def.interruptedStrike?.sweepEntry)throw error;fallbackSweep(b,def,error,'incoming-query');return null;}}
function sweepActualContact(att,def,time,b=null){return rawSweepActualContact(att,def,time,b);}
function resolveAttack(b,att,def,tech,temporal=null){
 const scoped=tech.id===SWEEP_INTERNAL_ID||sweepActive(def)||def.sweepReaction||def.sweepKOEntry||def.interruptedStrike?.sweepEntry;
 if(!scoped)return resolveAttackCore(b,att,def,tech,temporal);
 const undo=resolutionUndo(b);
 try{return resolveAttackCore(b,att,def,tech,temporal);}catch(error){
  undo();
  if(tech.id===SWEEP_INTERNAL_ID)fallbackSweep(b,att,error,'outgoing-resolution');
  if(sweepActive(def)||def.sweepReaction||def.sweepKOEntry||def.interruptedStrike?.sweepEntry)fallbackSweep(b,def,error,'receiver-resolution');
  // A retry error propagates. Never repeatedly apply damage or hide an
  // unrelated failure. The original hit flag, SP charge and RNG are restored.
  return resolveAttackCore(b,att,def,INDEX[att.action?.technique]??tech,temporal);
 }
}
function resolveSweepWindow(b,f,enemy,act,previous){
 const t=INDEX[SWEEP_INTERNAL_ID],active=t.active,saved=act.elapsed;
 // No geometry work before the active source interval.
 if(saved<t.windup)return;
 const undo=resolutionUndo(b);
 try{
  const times=[...sweepResolutionKnots(previous,saved),saved].filter(x=>x>=t.windup&&x<t.windup+active);
  for(const x of times){act.elapsed=x;act.phase='active';if(sweepActualContact(f,enemy,b.time,b)?.reaches){act.hit=true;resolveAttack(b,f,enemy,t);break;}}
  if(act.technique===SWEEP_INTERNAL_ID)act.elapsed=saved;
  if(!act.hit&&saved>=t.windup+active){act.hit=true;recordSweepMiss(b,f,enemy,t,sweepActualContact(f,enemy,b.time,b));}
 }catch(error){
  undo();fallbackSweep(b,f,error,'outgoing-window');
  const elapsed=act.elapsed;act.elapsed=INDEX.crouchlowkick.windup+INDEX.crouchlowkick.active*.5;act.phase='active';act.hit=true;
  try{resolveAttack(b,f,enemy,INDEX.crouchlowkick);}finally{act.elapsed=elapsed;}
 }
}
function resolveAttackCore(b,att,def,tech,temporal=null){
 const sw=tech.id===SWEEP_INTERNAL_ID?sweepActualContact(att,def,b.time,b):null;const swReceive=rawSweepIncomingStrike(att,def,b.time,b);
 if(sw&&!sw.reaches){recordSweepMiss(b,att,def,tech,sw);return;}
 if(swReceive&&!swReceive.reaches&&!(def.action?.phase==='active'&&tech.target==='head')){recordSweepMiss(b,att,def,tech,swReceive);return;}
 const accepted=temporal?.accepted??(acceptedMove(tech.id)?acceptedContact(att,def,b.time,b):null);
 const footContact=tech.id==='frontkickLegacy'?frontkickContact(att,def,b.time):null;
 const r3ReceiverContact=bodyUppercutIncomingPunch(att,def,b.time,b),jumpReceiverContact=jumpIncomingStrike(att,def,b.time,b);
 const contact={...(sw?{sweepContact:sw,actionElapsed:att.action.elapsed}:{}),...(swReceive?{sweepReceiverContact:swReceive}:{}),...(jumpReceiverContact?{jumpReceiverContact}:{}),...(temporal?{contactTemporal:temporal.witness}:{}),...(r3ReceiverContact?{bodyReceiverContact:r3ReceiverContact}:{}),...(footContact?{visibleContact:footContact,actionElapsed:att.action.elapsed}:{}),...(accepted?{visibleContact:accepted,sourceElapsed:acceptedGamePose(tech.id,att.action.elapsed).sourceElapsed,actionElapsed:att.action.elapsed}:{}),attacker:b.fighters.indexOf(att),receiver:b.fighters.indexOf(def),attackerX:att.x,receiverX:def.x,facing:att.facing,distance:Math.abs(att.x-def.x)};
 if((!accepted||tech.id==='dutchlow')&&targetDistance(att,def,tech)>tech.range+12){att.stats.missed++;emitCombat(b,{type:'miss',reason:'range',fighter:b.fighters.indexOf(att),tick:b.tick,technique:tech.id,target:tech.target,defenseTechnique:def.action?.technique==='guard'&&def.action.phase==='active'?'guard':null,...contact,...(postureContactFor(tech,def.action)||{})});return;}
 const receiving=temporal?.backfistReceiverAtContact??def;
 const defenseId=receiving.action?.phase==='active'&&(sweepActive(receiving)||receiving.techniques.includes(receiving.action.technique))?(sweepActive(receiving)?'crouchlowkick':receiving.action.technique):null;
 const outcome=defenseOutcome(tech,defenseId,receiving.stamina);
 if(outcome==='dodge'){defenseSucceeded(b,def);def.stats.dodged++;def.pose=defenseId==='lowguard'?'lowguard':INDEX[defenseId]?.postureKind||'sway';emitCombat(b,{type:'dodge',fighter:contact.receiver,technique:tech.id,target:tech.target,defenseTechnique:defenseId,tick:b.tick,...contact});log(b,`${def.name}：${INDEX[defenseId].name}で ${tech.name} をかわした！`);return;}
 const poseContact=accepted||sw||swReceive?null:postureContactFor(tech,def.action);
 if(poseContact&&!poseContact.reaches){att.stats.missed++;emitCombat(b,{type:'miss',reason:'height',fighter:contact.attacker,technique:tech.id,target:tech.target,tick:b.tick,...contact,...poseContact});return;}
 if(r3ReceiverContact&&!r3ReceiverContact.reaches){recordR3PunchMiss(b,att,def,tech);return;}
 if(jumpReceiverContact&&!jumpReceiverContact.reaches){att.stats.missed++;emitCombat(b,{type:'miss',reason:'jump-receiver-shape',fighter:b.fighters.indexOf(att),technique:tech.id,target:tech.target,tick:b.tick,...contact});return;}
 const block=outcome==='block';
 const recovering=receiving.action?.phase==='recovery';
 const counter=recovering?STRATEGIES[att.strategy].counter*(isReactive(INDEX[receiving.action.technique])?1.12:1):1;
 const powerScale=att.power*(att.action?.counterReplyPower??1);
 const defenseScale=def.defense>5?1+def.defense/100:def.defense;
 const damage=Math.max(DAMAGE_RULES.minimum,Math.round(tech.power*powerScale/Math.max(DAMAGE_RULES.defenseMinimum,defenseScale)*counter*(DAMAGE_RULES.randomBase+random(b)*DAMAGE_RULES.randomSpan)*(block?DAMAGE_RULES.blockMultiplier:1)));
 if(damage>0&&def.hp>0)captureSweepReceiving(def,b.time,b.tick,damage>=def.hp);
 if(damage>0&&def.hp>0)captureBackfistReceiving(def,b.time,b.tick,damage>=def.hp,damage>=def.hp&&backfist(def.action?.technique)?{rootX:traceDisplayRoot(b,def,b.fighters.indexOf(def)),facing:def.facing}:null);
 if(damage>=def.hp&&def.hp>0)captureLethalTrace(b,def);
 const axeBeforeReceive=ownsAxe(def)?axePrototypePose(def,b.time):null;
 const appliedDamage=Math.min(def.hp,damage);def.hp=Math.max(0,def.hp-damage);att.stats.hits++;att.stats.damage+=damage;
 if(appliedDamage>0){interruptBackstep(b,def,acceptedNeutral({...def,action:null,pose:'hit'},b.time));convertSpaceToDamage(def,b);}
 const r16Rebase=appliedDamage>0&&def.interruptedStrike?.r16Plan?{joints:jumpStateFor(def,b.time).joints,action:structuredClone(def.interruptedStrike.action),count:(def.interruptedStrike.rebaseCount||0)+1}:null;
 const canceled=appliedDamage>0&&def.action&&isStrike(INDEX[def.action.technique])?{...def.action}:null;
 if(canceled){const snapshot={...(canceled.technique===SWEEP_INTERNAL_ID?{sweepEntry:sweepPose(canceled.elapsed),sweepRecoveryPolicy:'fixed3D-snapshot-return-r50'}:{}),action:canceled,createdTime:b.time,createdTick:b.tick,duration:.2,facing:def.facing,legacyStart:(tech.id==='backfist'?legacyBackfistReceiverPaintPose(def,b.time,b,b.fighters.indexOf(def)):null)??visibleLegacyPose(def,b.time),legacyEnd:visibleLegacyPose({...def,action:null,pose:'hit'},b.time)};if(acceptedMove(canceled.technique)){snapshot.joints=acceptedGamePose(canceled.technique,canceled.elapsed,canceled.contactLimit,canceled.contactKneeSign,canceled.kneeTheta).joints;snapshot.neutral=acceptedNeutral({...def,action:null,pose:'hit'},b.time);if(isFourTrace(canceled.technique)){snapshot.fourTrace=fourTracePose(canceled.technique,canceled.elapsed,canceled.contactLimit);snapshot.neutral=fourTraceStanding(canceled.technique).joints;delete def.traceRestRig;delete def.traceRestId;}}if(backfist(canceled.technique)){snapshot.backfistFrame=backfistPose(canceled.elapsed);snapshot.duration=.2;def.backfistPrototypeRest=backfistInterrupted(snapshot,.2);}def.interruptedStrike=snapshot;def.action=null;def.plan=null;def.cooldown=Math.max(def.cooldown,.2);def.defenseCooldown=Math.max(def.defenseCooldown,.2);def.lastAction={technique:INDEX[canceled.technique].publicSkillId??canceled.technique,...(jumpKick(canceled.technique)?{motionVariant:'approved101-experimental'}:{}),name:INDEX[canceled.technique].name,type:INDEX[canceled.technique].type,phase:'interrupted',startedTick:canceled.startedTick,phaseStartedTick:b.tick,expiresTick:b.tick+12};}

 if(appliedDamage>0&&axeBeforeReceive){if(tech.id==='uppercut'&&def.hp>0&&!b.done&&!def.axeFinish&&!def.finishFallJoints&&def.pose!=='down')captureRegisteredReceive(def,axeBeforeReceive,b.time);else capture(def,axeBeforeReceive,'receive');}
 def.pose=block?'guard':'hit';def.poseTimer=.2;
 if(att.strategy==='outside'&&appliedDamage>0)att.disengage={goal:Math.min(220,Math.abs(att.x-def.x)+32),elapsed:0};
 if(block){defenseSucceeded(b,def);def.stats.blocked++;def.stamina=Math.max(0,def.stamina-DAMAGE_RULES.guardImpactCost);}else if(appliedDamage>0&&def.hp>0){if(tech.id==='pushkick'){att.action.pushDrive={receiver:b.fighters.indexOf(def),facing:att.action.facing??att.facing};def.pushReaction={attacker:b.fighters.indexOf(att)};delete def.recoil;def.plan=null;def.cooldown=Math.max(def.cooldown,.18);}else{const direction=att.x<def.x?1:-1;def.recoil={startX:def.x,targetX:Math.max(60,Math.min(740,def.x+direction*(approved2DStudy(tech.id)?Math.max(RECOIL.kick,170-Math.abs(def.x-att.x)):tech.type==='kick'?RECOIL.kick:RECOIL.punch))),elapsed:0,seconds:RECOIL.seconds};def.plan=null;def.cooldown=Math.max(def.cooldown,.18);}}
 if(!block&&tech.id!=='pushkick'&&def.hp>0&&def.recoil&&(jumpKick(canceled?.technique)||r16Rebase))installJumpReaction(def,b,r16Rebase);
 if(!block&&tech.id==='pushkick'&&def.hp>0&&def.pushReaction&&(jumpKick(canceled?.technique)||r16Rebase))installJumpPush(def,b,r16Rebase);
 refreshTraceInterruption(def,b);
 emitCombat(b,{type:block?'block':'hit',fighter:b.fighters.indexOf(def),damage,appliedDamage,technique:tech.id,target:tech.target,defenseTechnique:block?defenseId:null,tick:b.tick,...contact,...(canceled?{interruptedTechnique:canceled.technique,interruptedStartedTick:canceled.startedTick}:{}),...(poseContact||{})});
 log(b,`${att.name}：${tech.name}${block?'（'+INDEX[defenseId].name+'）':''} ${damage}${canceled?'（'+INDEX[canceled.technique].name+'を中断）':''}`);
}
// R3 legacy fists wait on their actual receiver polygon. A false ready result
// must not fall through into the accepted-rig API (legacy cross has no rig).
function strikeResolutionReady(b,f,enemy,t){const incoming=sweepIncomingStrike(f,enemy,b.time,b);if(incoming)return incoming.reaches||(enemy.action?.phase==='active'&&t.target==='head')||targetDistance(f,enemy,t)>t.range+12;if(t.id===SWEEP_INTERNAL_ID){try{const c=sweepActualContact(f,enemy,b.time,b);return c?.reaches===true;}catch(error){fallbackSweep(b,f,error,'outgoing-ready');return false;}} const jumpReceiver=jumpIncomingStrike(f,enemy,b.time,b);if(jumpReceiver)return jumpReceiver.reaches||targetDistance(f,enemy,t)>t.range+12;
 if(!solidContactMove(t.id))return r3PunchReady(b,f,enemy,t);
 if(t.id==='frontkickLegacy')return frontkickContact(f,enemy,b.time).reaches||targetDistance(f,enemy,t)>t.range+12||postureContactFor(t,enemy.action)?.reaches===false;
 return acceptedContact(f,enemy,b.time,b).reaches||fourTraceEvasion(b,f,enemy,t)||chinEvasionReady(b,f,enemy,t);
}
export const FORWARD_JUMP_APPROACH=190; // Middle of the unchanged native static-contact window170..220; AI spacing only, not range.
function splitJumpEntry(f,time){return f.traceRestRig||f.techniques.some(acceptedIdleMove)||ownsAxe(f)?contactBodyJoints({...f,action:null},time):jumpNativeNeutral(f,time);}
export function jumpHybridPlan(b,index,entryCapture=null){const f=b.fighters[index],capture=entryCapture&&entryCapture.x===f.x&&entryCapture.time===b.time&&entryCapture.walkTime===f.walkTime&&entryCapture.facing===f.facing?entryCapture:null;return planJumpHybrid(b,index,{entry:capture?()=>capture.rig:splitJumpEntry,prepareEntry:prepareWalkSupportedEntry,adaptRoot:true,intentForecast:true,observedPlanTarget:d=>{const t=INDEX[d.plan],s=STRATEGIES[d.strategy];if(!t||!['balanced','outside'].includes(d.strategy)||solidContactMove(t.id)||worldStrike(t.id)||!isStrike(t)||t.cost>d.stamina-STAMINA_RULES.attackReserve)return null;return{target:curriculumDistance(d,Math.max(40,Math.min(s.distance,t.range-d.approachMargin))),attackSpacing:t.range-d.attackMargin,plan:t.id};},moveRate:movementRate,worldStrike,oldRange:INDEX.jumpkick.range-f.attackMargin,commonIdle:()=>false,rate:motionRate,parts:motionMicrostepParts,sweep:motionResolutionSweepSamples,receiverSeconds:observedReceiverSeconds,walk:predictObservedWalk,head:jumpReceivingHead,technique:id=>INDEX[id]});}
function startAction(b,f,tech,entryCapture=null){
 if(f.sweepEnabled&&tech?.id==='crouchlowkick')tech=INDEX[SWEEP_INTERNAL_ID];
 if(tech?.id==='frontkick'||tech?.id==='frontkickLegacy')tech=contextualTechnique(b,f,'frontkick');
 const jumpChoice=tech?.id==='forwardjumpkick'?jumpHybridPlan(b,b.fighters.indexOf(f),entryCapture):null;
 if(tech?.id==='forwardjumpkick'){if(!jumpChoice?.allowed||f.pose!=='idle'||f.poseTimer!==0)return false;tech=INDEX.jumpkick101;}
 if(!tech||f.stamina+1e-9<tech.cost)return false;
 delete f.backfistReceiverSnapshot;delete f.backfistKOEntry;delete f.sweepReaction;delete f.sweepKOEntry;
 if(!backfist(tech.id))delete f.backfistPrototypeRest;
 const jumpEntry=jumpKick(tech.id)?structuredClone(jumpChoice?.entryContext?.entrySnapshot??splitJumpEntry(f,b.time)):null;
 if(f.axePrototype&&tech.id==='axekick'){const p=ownsAxe(f)?axePrototypePose(f,b.time):{joints:physicalCommon(contactBodyJoints({...f,axePrototype:false},b.time)),frameIndex:0,stage:'NATIVE_ENTRY_SNAPSHOT'};capture(f,p,'entry');}else if(f.axePrototype){if(ownsAxe(f)&&isFourTrace(tech.id)){const j=physicalCommon(axePrototypePose(f,b.time).joints);f.traceRestRig=fourTraceRigTransition(tech.id,fourTraceStanding(tech.id).rig,j,1);f.traceRestId=tech.id;f.axeNativeEntry={kind:'GENERATED_NATIVE_ENTRY',at:b.time,joints:structuredClone(j)};}releaseAxe(f,'next-native-action:'+tech.id,b.time);}
 if(!isFourTrace(tech.id)){delete f.traceRestRig;delete f.traceRestId;}
 if(threeCombat(tech.id)){f.reviewedThreeLastStart=b.time;f.reviewedThreeApproach=false;}
 const duration=tech.windup+(tech.active??.12)+tech.recovery;
 f.action={...(tech.id===SWEEP_INTERNAL_ID?{publicSkillId:'crouchlowkick',skillId:'crouchlowkick',motionVariant:'sweep-r50'}:{}),...(tech.id==='frontkick'||tech.id==='frontkickLegacy'?{skillId:'frontkick',motionVariant:tech.id==='frontkick'?'approved-57':'legacy-close',variantProof:structuredClone(f.frontkickVariantProof)}:{}),technique:tech.id,...(jumpKick(tech.id)?{publicSkillId:'forwardjumpkick',motionVariant:'approved101-experimental'}:{}),phase:'windup',elapsed:0,hit:false,startedTick:b.tick,phaseProgress:0,facing:f.facing};
 if(jumpKick(tech.id)){const endF={...f,action:null,interruptedStrike:null,recoil:null,pose:'idle',poseTimer:0,motionTime:f.motionTime+duration};f.action.contactLimit={jumpContext:{style:'legacy',entrySnapshot:jumpEntry,...(jumpChoice?.entryContext??{}),exitSnapshot:splitJumpEntry(endF,b.time+duration/motionRate(f))}};f.action.jumpRootStartX=f.x;f.action.jumpRootApplied=0;f.action.jumpHybridChoice=jumpChoice;}
 if(tech.id==='frontkick')f.action.traceEntryRig=frontkickEntryRig({...f,action:null},b.time);else if(isFourTrace(tech.id)&&f.traceRestRig)f.action.traceEntryRig=structuredClone(f.traceRestRig);
 if(f.axePrototype&&tech.id==='axekick')f.axeDisplay.targetHint=axePrototypePose({...f,axeDisplay:null},b.time).joints;
 if(f.axePrototype&&isFourTrace(tech.id)&&f.traceRestRig&&tech.id!=='frontkick')f.action.contactLimit=traceRootContext(f);
 if(tech.id==='dutchlow'){const enemy=b.fighters[1-b.fighters.indexOf(f)],entryJoints=contactBodyJoints(enemy,b.time);f.action.stepTarget=Math.max(0,Math.min(DUTCH_STEP.distance,Math.abs(enemy.x-f.x)-DUTCH_STEP.minimumGap));f.action.stepApplied=0;f.action.dutchlowEntry={wallRangeStart:(f.action.facing??f.facing)===1?[8-(28+f.x*WORLD_TO_DRAW),376-(28+f.x*WORLD_TO_DRAW)]:[(28+f.x*WORLD_TO_DRAW)-376,(28+f.x*WORLD_TO_DRAW)-8],plannedStep:f.action.stepTarget,joints:Object.fromEntries(["center","chest","head","support_hip","support_knee","support_ankle","strike_hip","strike_knee","strike_ankle"].map(k=>[k,structuredClone(entryJoints[k])])),gap:Math.max(0,Math.abs(enemy.x-f.x)-f.action.stepTarget)*WORLD_TO_DRAW,face:f.action.facing??f.facing,defFace:enemy.action?.facing??enemy.facing};}
 f.lastAction={technique:tech.publicSkillId??tech.id,...(jumpKick(tech.id)?{motionVariant:'approved101-experimental'}:{}),name:tech.name,type:tech.type,phase:'windup',startedTick:b.tick,phaseStartedTick:b.tick,expiresTick:b.tick+Math.ceil(Math.max(.65,duration)*60/(motionRate(f)))};
 f.stamina=Math.max(0,f.stamina-tech.cost);
 if(isReactive(tech)){f.stats.defenses++;f.stats[tech.id+'Uses']=(f.stats[tech.id+'Uses']||0)+1;f.defenseCooldown=(duration+tech.defenseCooldown)*(f.strategy==='counter'?COUNTER_RULES.defenseCooldownScale:1);}
 else {if(f.strategy==='counter'&&f.counterPending)f.stats.counterAttacks++;if(pendingReply(b,f)){f.action.counterReplyPower=COUNTER_RULES.replyPower;f.stats.replyStarts=(f.stats.replyStarts||0)+1;}delete f.counterReplyUntil;f.counterPending=false;if(f.strategy==='counter')f.counterApproach=false;if(f.comboNext===tech.id){f.stats.comboFollows=(f.stats.comboFollows||0)+1;f.comboNext=null;}f.plan=null;f.stats.attacks++;}
 if(b.fighters.indexOf(f)===1&&!b.observed.includes(tech.publicSkillId??tech.skillId??tech.id)){b.observed.push(tech.publicSkillId??tech.skillId??tech.id);log(b,`相手の技：${tech.name}`);}
 return true;
}
/** Respond to an actual telegraphed threat, never to an impact-time dodge roll. */
function sidekickGuardReady(f,enemy,tech,guard){
 if(!((tech.id==='sidekick'||tech.id==='bodyuppercut')&&guard.id==='midguard'||tech.id==='uppercut'&&guard.id==='guard'))return true;
 // The traced foot reaches the torso after the active interval starts. An
 // immediate guard used to finish before that visible contact. Estimate the
 // contact from the existing pose path and current spacing, then center the
 // unchanged guard window on it. No future AI choices or damage rolls are read.
 const threat=enemy.action,center=(guard.windup+guard.active/2)/motionRate(f);
 if((tech.windup-threat.elapsed)/motionRate(enemy)>center)return false;
 if(tech.id==='uppercut'){
  const defender={...f,pose:'guard',interruptedStrike:null,action:{technique:'guard',elapsed:guard.windup+guard.active/2,phase:'active',phaseProgress:.5}};
  for(let n=0;n<=24;n++){const elapsed=tech.windup+tech.active*n/24,attacker={...enemy,action:{...threat,elapsed}};if(chinUppercutActualContact(attacker,defender).reaches)return(elapsed-threat.elapsed)/motionRate(enemy)<=center;}
  return false;
 }
 const joints=targetedGuardPose(guard.id,guard.windup+guard.active/2),gap=(f.x-enemy.x)*WORLD_TO_DRAW;
 let impact=null;
 for(let n=0;n<=24;n++){const elapsed=tech.windup+tech.active*n/24;let p=acceptedGamePose(tech.id,elapsed),drawGap=gap;if(isFourTrace(tech.id)){const now=fourTracePose(tech.id,threat.elapsed,{bodyRoot:true});p=fourTracePose(tech.id,elapsed,{bodyRoot:true});drawGap-=(p.rootDeltaNative-now.rootDeltaNative)*(threat.facing??enemy.facing);}if(contactLocal(tech.id,p.joints,joints,drawGap,threat.facing??enemy.facing,f.facing).reaches){impact=elapsed;break;}}
 return impact!==null&&(impact-threat.elapsed)/motionRate(enemy)<=center;
}
function counterDefenseReady(f,enemy,tech,guard){
 if(f.strategy!=='counter'||tech.id==='sidekick'||(tech.id==='bodyuppercut'||tech.id==='uppercut'))return true;
 // Center the legal defense active window on the observed telegraph's impact.
 const until=(tech.windup-enemy.action.elapsed)/motionRate(enemy),center=(guard.windup+(guard.active??.12)/2)/motionRate(f);
 return until<=center;
}
function tryDefense(b,f,enemy){
 const threat=enemy.action,tech=INDEX[threat?.technique];
 const lateSidekick=(tech?.id==='sidekick'||(tech?.id==='bodyuppercut'||tech?.id==='uppercut'))&&threat?.phase==='active'&&!threat.hit;
 if(!threat||(threat.phase!=='windup'&&!lateSidekick)||!tech||!isStrike(tech)||f.defenseCooldown>0)return false;
 // A traced spin must finish its approved landing before a new defense starts.
 if(f.action&&(f.action.phase!=='recovery'||f.action.phaseProgress<.65||f.action.technique==='spinkick'||solidContactMove(f.action.technique)||INDEX[f.action.technique]?.postureKind))return false;
 if(f.reactedAttackTick===threat.startedTick||Math.abs(f.x-enemy.x)>tech.range+18)return false;
 const candidates=f.techniques.map(id=>INDEX[id]).filter(t=>isReactive(t)&&t.cost+(t.cost===0?0:STAMINA_RULES.defenseReserve)<=f.stamina&&defenseOutcome(tech,t.id,f.stamina)!=='hit'&&sidekickGuardReady(f,enemy,tech,t)&&counterDefenseReady(f,enemy,tech,t));
 if(!candidates.length)return false;
 // A single decision per telegraph. Pressure leaves more openings; both sides
 // use exactly the same detection and bounded stamina/cooldown rules.
 f.reactedAttackTick=threat.startedTick;
 const readiness=f.strategy==='counter'?COUNTER_RULES.readiness:STRATEGIES[f.strategy].defense;
 if(random(b)>readiness)return false;
 const defense=candidates[Math.floor(random(b)*candidates.length)];
 startAction(b,f,defense);return true;
}
function updateStrikeLimit(b,f,enemy,t,act){if(backfist(t.id)){act.contactLimit=null;return;}if(f.axePrototype&&t.id==='axekick'){act.contactLimit=null;return;}
if(jumpKick(t.id)){const p=jumpPose(act.elapsed,act.contactLimit);act.jumpRootStartX??=f.x;f.x=act.jumpRootStartX+(act.facing??f.facing)*p.rootWorld;act.jumpRootApplied=p.rootWorld;return;}
 if(isFourTrace(t.id)){act.contactLimit=traceRootContext(f);return;}
 if((t.id==='bodyuppercut'||t.id==='uppercut')){act.contactLimit=null;return;} // Preserve the approved R3 body and foot path.

 if(threeCombat(t.id)){act.contactLimit=null;return;}
 if(worldStrike(t.id)){act.contactLimit={joints:contactBodyJoints(enemy,b.time),gap:Math.abs(enemy.x-f.x)*WORLD_TO_DRAW,face:act.facing??f.facing,defFace:enemy.action?.facing??enemy.facing,...(t.id==='dutchlow'?{stepApplied:act.stepApplied??0,entry:act.dutchlowEntry}:{})};return;}

if(t.id==='frontkickLegacy')updateFrontkickLimit(f,enemy,b.time);
  if(acceptedMove(t.id)){let dj;const bf=backfistGeneratedReceiving(enemy,b.time);if(bf)dj=bf.joints;else if(acceptedMove(enemy.action?.technique))dj=acceptedGamePose(enemy.action.technique,enemy.action.elapsed,enemy.action.contactLimit).joints;else if(!enemy.action&&enemy.techniques.some(acceptedIdleMove))dj=acceptedNeutral(enemy,b.time);else{const o=visibleLegacyPose(enemy,b.time);dj={center:[o.hip.x,-o.hip.y],chest:[o.chest.x,-o.chest.y]};}const raw=acceptedGamePose(t.id,act.elapsed);act.contactLimit=surfaceLimit({kind:t.id,joints:raw.joints},dj,Math.abs(enemy.x-f.x)*WORLD_TO_DRAW,act.facing??f.facing,enemy.action?.facing??enemy.facing);}
}
function advanceSolePush(b,f,enemy,act,delta){
 if(!act.pushDrive)return;const t=INDEX.pushkick;if(act.elapsed>=t.windup+t.active||f.hp<=0||enemy.hp<=0){delete act.pushDrive;return;}
 const face=act.pushDrive.facing,j=rawSolePush(Math.min(1,act.elapsed/(t.windup+t.active+t.recovery))),sole=soleSegment(j),d=contactBodyJoints(enemy,b.time),a=[d.center[0]*enemy.facing*face,d.center[1]],c=[d.chest[0]*enemy.facing*face,d.chest[1]],near=Math.min(...sole.map(p=>capsuleNearX(p[1],a,c)));if(!Number.isFinite(near))return;
 const desired=Math.max(0,(Math.max(...sole.map(p=>p[0]))-near)/WORLD_TO_DRAW),gap=(enemy.x-f.x)*face,amount=Math.max(0,Math.min(desired-gap,600*motionRate(f)*delta));enemy.x=Math.max(60,Math.min(740,enemy.x+face*amount));
}
// Cosmetic hand-off only: return the canceled trace to the receiving fighter's
// current recoil pose, not a stale upright pose or a previous attack's idle rig.
function refreshJumpReaction(f,b){const s=f.interruptedStrike;if(!s?.r16Plan||s.r17Push)return;s.actualRootX=f.x;s.r16Elapsed=f.recoil?.elapsed??s.r16Plan.duration;if(s.r16Elapsed>=s.r16Plan.duration-1e-10){f.r16LastHandoff={time:b.time,tick:b.tick,pose:f.pose,root:f.x,joints:jumpStateFor(f,b.time).joints,plan:structuredClone(s.r16Plan),rebases:s.rebaseCount||0};delete f.interruptedStrike;}}
function installJumpReaction(f,b,rebase){const old=f.interruptedStrike,action=rebase?.action??old.action,joints=structuredClone(rebase?.joints??old.joints),style=f.techniques.some(acceptedIdleMove)?'common':'legacy',duration=f.recoil.seconds,terminalF={...f,action:null,interruptedStrike:null,recoil:null,pose:'hit',poseTimer:.05,motionTime:f.motionTime+duration*motionRate(f)},terminal=style==='common'?acceptedNeutral(terminalF,b.time+duration):jumpNativeNeutral(terminalF,b.time+duration);f.interruptedStrike={...old,action,joints,createdTime:b.time,createdTick:b.tick,duration,r16Elapsed:0,actualRootX:f.x,rebaseCount:rebase?.count||0,r16Plan:{joints,terminal,initialRootX:f.x,terminalRootX:f.recoil.targetX,facing:f.facing,duration,style}};delete f.interruptedStrike.r17Push;}
function installJumpPush(f,b,rebase){const old=f.interruptedStrike,action=rebase?.action??old.action,joints=structuredClone(rebase?.joints??old.joints),style=f.techniques.some(acceptedIdleMove)?'common':'legacy',duration=.2,terminalF={...f,action:null,interruptedStrike:null,recoil:null,pose:'hit',poseTimer:.05,motionTime:f.motionTime+duration*motionRate(f)},terminal=style==='common'?acceptedNeutral(terminalF,b.time+duration):jumpNativeNeutral(terminalF,b.time+duration);f.interruptedStrike={...old,action,joints,createdTime:b.time,createdTick:b.tick,duration,r17Push:true,r16Elapsed:0,actualRootX:f.x,rebaseCount:rebase?.count||0,r16Plan:{joints,terminal,initialRootX:f.x,terminalRootX:f.x,facing:f.facing,duration,style}};}
function refreshJumpPush(f,b){const s=f.interruptedStrike;if(!s?.r17Push)return;s.actualRootX=f.x;s.r16Elapsed=Math.min(s.duration,(b.tick-s.createdTick)/60);if(b.tick-s.createdTick>=12){f.r17PushHandoff={time:b.time,tick:b.tick,root:f.x,joints:jumpStateFor(f,b.time).joints,plan:structuredClone(s.r16Plan)};delete f.interruptedStrike;}}
function refreshTraceInterruption(f,b){const s=f.interruptedStrike;if(s?.action?.technique==='dutchlow'){s.neutral=acceptedNeutral({...f,action:null,interruptedStrike:null},b.time);return;}if(!s?.fourTrace)return;if(refreshSpaceReturn(f,b))return;s.neutral=fourTraceRoleJoints(s.fourTrace.traceId,acceptedNeutral({...f,action:null,interruptedStrike:null,pose:'hit'},b.time));if(b.tick-s.createdTick>=12)delete f.interruptedStrike;}
// Native additions are resolved after BOTH actual turns, without extra AI ticks.
// Receiver roots/clocks interpolate only between completed microstep endpoints.
// A new action/phase/pose/context or existing reaction makes that interval ineligible.
export function reviewedReceiverAt(start,end,u,tech){
 if(!start||!end||start.hp!==end.hp||start.facing!==end.facing||start.pose!==end.pose||start.poseTimer!==0||end.poseTimer!==0)return null;
 if([start,end].some(f=>f.recoil||f.interruptedStrike||f.backstep||f._entryFrozenJoints))return null;
 if(JSON.stringify(start.techniques)!==JSON.stringify(end.techniques)||JSON.stringify(start.traceRestRig??null)!==JSON.stringify(end.traceRestRig??null))return null;
 const a=start.action,z=end.action;
 if(!!a!==!!z)return null;
 if(a&&(a.technique!==z.technique||a.startedTick!==z.startedTick||a.phase!==z.phase||JSON.stringify(a.contactLimit??null)!==JSON.stringify(z.contactLimit??null)))return null;
 if(!a&&!['idle','walk'].includes(end.pose))return null;
 const value=(a,b)=>a+(b-a)*u,p={...start,x:value(start.x,end.x),motionTime:value(start.motionTime||0,end.motionTime||0),walkTime:value(start.walkTime||0,end.walkTime||0),stamina:value(start.stamina,end.stamina)};
 if(a)p.action={...a,elapsed:value(a.elapsed,z.elapsed),phaseProgress:value(a.phaseProgress||0,z.phaseProgress||0)};
 const outcome=f=>defenseOutcome(tech,f.action?.phase==='active'&&f.techniques.includes(f.action.technique)?f.action.technique:null,f.stamina);
 if(outcome(start)!==outcome(end)||outcome(p)!==outcome(end))return null;
 return p;
}
// Conservative additions only: existing endpoint hits retain their established
// priority. Each added hit is rechecked on the actual source interpolation and
// a receiver reconstructed at that SAME completed-microstep time.
function resolveReviewedNativeQueue(b,queue,start,startTime,journal){
 const candidates=[],endpoint=f=>({x:f.x,pose:f.pose,phase:f.action?.phase??null,elapsed:f.action?.elapsed??null,startedTick:f.action?.startedTick??null,motionTime:f.motionTime,walkTime:f.walkTime,stamina:f.stamina});let resolved=0;
 for(const item of queue){const{index,act,previous,saved,times}=item,f=b.fighters[index],d=b.fighters[1-index],tech=INDEX[act.technique];
  if(f.action!==act||act.hit||f.hp!==start[index].hp||f.x!==start[index].x||journal.roots[index].length)continue;
  const rootInterval=nativeRootInterval(journal,1-index,start[1-index],d);if(!rootInterval)continue;
  const probe=sample=>{const u=(sample-previous)/(saved-previous),time=startTime+(b.time-startTime)*u,receiver=reviewedReceiverAt(start[1-index],d,u,tech);if(!receiver)return null;const attacker={...f,action:{...act,elapsed:sample,phase:'active',phaseProgress:(sample-tech.windup)/(tech.active??.12)}},contact=acceptedContact(attacker,receiver,time,b);return contact?.point&&contact.receiver?.[0]?{sample,u,time,receiver,contact}:null;};
  for(let n=1;n<times.length;n++){
   const lo=times[n-1],hi=times[n],a=probe(lo),z=probe(hi);if(!a||!z||!a.contact.contactKnown||!z.contact.contactKnown)continue;
   const p=a.contact.point.map((v,i)=>v-a.contact.receiver[0][i]),q=z.contact.point.map((v,i)=>v-z.contact.receiver[0][i]),v=q.map((x,i)=>x-p[i]),A=v[0]*v[0]+v[1]*v[1],B=2*(p[0]*v[0]+p[1]*v[1]),radius=7+a.contact.radius+.04,C=p[0]*p[0]+p[1]*p[1]-radius*radius,tests=[0,.5];
   if(C<=0)tests.push(0);else if(A>0){const disc=B*B-4*A*C;if(disc>=0){const enter=Math.max(0,(-B-Math.sqrt(disc))/(2*A)),leave=Math.min(1,(-B+Math.sqrt(disc))/(2*A));if(enter<=leave)tests.push(enter+(leave-enter)*1e-6);}}
   if(A>0)tests.push(Math.max(0,Math.min(1,-B/(2*A))));tests.push(1);
   for(const q of [...new Set(tests)].sort((a,z)=>a-z)){const sample=lo+(hi-lo)*q;if(sample<tech.windup||sample>=tech.windup+(tech.active??.12))continue;const hit=probe(sample);if(hit?.contact.reaches)candidates.push({...hit,item,rootInterval,segment:[lo,hi],receiverStart:endpoint(start[1-index]),receiverEnd:endpoint(d)});}
  }
 }
 candidates.sort((a,z)=>a.u-z.u);
 for(const hit of candidates){const{item,rootInterval,sample,u,time,receiver,contact}=hit,{index,act}=item,f=b.fighters[index],d=b.fighters[1-index],tech=INDEX[act.technique];
  if(f.action!==act||act.hit||f.hp<=0||d.hp<=0||f.hp!==start[index].hp||d.hp!==start[1-index].hp)continue;
  const snapshot={elapsed:act.elapsed,phase:act.phase,phaseProgress:act.phaseProgress};act.elapsed=sample;act.phase='active';act.phaseProgress=(sample-tech.windup)/(tech.active??.12);act.hit=true;
  resolveAttack(b,f,d,tech,{accepted:contact,witness:{kind:'completed-microstep reviewed-segment sweep; conservative supplement',rootInterval,attackerRootMutations:journal.roots[index].slice(),sourceSegment:hit.segment,contactWorldTime:time,resolutionWorldTime:b.time,microstepStartTime:startTime,microstepEndTime:b.time,fraction:u,attackerRoot:f.x,receiverRoot:receiver.x,responseReceiverRoot:d.x,receiverStart:hit.receiverStart,receiverEnd:hit.receiverEnd,receiverPose:receiver.pose,receiverAction:receiver.action?{technique:receiver.action.technique,phase:receiver.action.phase,elapsed:receiver.action.elapsed,startedTick:receiver.action.startedTick}:null,rootModel:rootInterval.kind+'; original source/locomotion clocks at the same fraction',phaseRule:'same action/startTick/phase/pose/outcome at both ends; transitions excluded',ordering:'existing endpoint resolutions first; added contacts share world fraction, tie keeps initiative'}});
  Object.assign(act,snapshot);resolved++;
 }
 for(const{index,act}of queue){const f=b.fighters[index],tech=INDEX[act.technique];if(f.action===act&&!act.hit&&act.elapsed>=tech.windup+(tech.active??.12)){act.hit=true;recordAcceptedMiss(b,f,b.fighters[1-index],tech);}}
 return resolved;
}
function tick(b,delta=STEP,frame=b.tick+1,at=frame*STEP){
 if(!b.fighters.some(f=>threeCombat(f.action?.technique)))return tickCore(b,delta,frame,at,null);
 const journal={roots:[[],[]],walk:[null,null]},original=[];
 for(const[i,f]of b.fighters.entries()){const descriptor=Object.getOwnPropertyDescriptor(f,'x');let value=f.x;original.push({f,descriptor,read:()=>value});Object.defineProperty(f,'x',{configurable:true,enumerable:descriptor.enumerable,get:()=>value,set(v){const before=value;if(descriptor.set){descriptor.set.call(f,v);value=descriptor.get?descriptor.get.call(f):v;}else value=v;if(value!==before)journal.roots[i].push({before,after:value});}});}
 try{return tickCore(b,delta,frame,at,journal);}finally{for(const{f,descriptor,read}of original)Object.defineProperty(f,'x',descriptor.get||descriptor.set?descriptor:{...descriptor,value:read()});}
}
function nativeRootInterval(journal,index,start,end){const writes=journal?.roots[index]||[];return !writes.length&&start.x===end.x?{kind:'constant; no root mutation',writes}:null;}
// R13b experimental scope: backfist only, constant roots, neutral or existing
// guard/sway/crouch clocks. No fitted-joint interpolation, extra active time or SP.
// Predict only a known receiver clock when its ordinary turn is still pending.
// No AI choice or root movement is invented. Neutral interpolation is fixture-only.
function backfistReceiverTurnEnd(start,current,pending,delta){
 if(!pending)return current;
 if(start.x!==current.x||start.hp!==current.hp||current.recoil||current.backstep||current.interruptedStrike||current.poseTimer>0)return null;
 const a=current.action;
 if(!a&&!current.prototypeHold)return null;
 if(a&&!['guard','midguard','sway','crouch','lowguard'].includes(a.technique))return null;
 if(JSON.stringify(start.action)!==JSON.stringify(a))return null;
 const rate=motionRate(current),p={...current,motionTime:(current.motionTime||0)+delta*rate,walkTime:(current.walkTime||0)+delta*movementRate(current),cooldown:current.cooldown-delta*rate,defenseCooldown:Math.max(0,current.defenseCooldown-delta*rate),stamina:Math.min(current.maxStamina,current.stamina+delta*(a?STAMINA_RULES.defenseRecovery:STAMINA_RULES.restRecovery))};
 if(a)p.action={...a,elapsed:a.elapsed+delta*rate};
 return p;
}
function backfistReceiverAt(start,end,u){
 if(start.x!==end.x||start.facing!==end.facing||start.hp!==end.hp||start.recoil||end.recoil||start.interruptedStrike||end.interruptedStrike||start.backstep||end.backstep||start.poseTimer>0||end.poseTimer>0)return null;
 if(JSON.stringify(start.techniques)!==JSON.stringify(end.techniques))return null;
 const a=start.action,z=end.action,allowed=id=>['guard','midguard','sway','crouch','lowguard'].includes(id);
 if(!!a!==!!z||a&&(a.technique!==z.technique||a.startedTick!==z.startedTick||!allowed(a.technique)))return null;
 if(!a&&(!['idle','ready'].includes(start.pose)||!['idle','ready'].includes(end.pose)))return null;
 const mix=(x,y)=>x+(y-x)*u,p={...start,x:start.x,motionTime:mix(start.motionTime||0,end.motionTime||0),walkTime:mix(start.walkTime||0,end.walkTime||0),stamina:mix(start.stamina,end.stamina),cooldown:mix(start.cooldown,end.cooldown),defenseCooldown:mix(start.defenseCooldown,end.defenseCooldown)};
 if(a){const t=INDEX[a.technique],raw=mix(a.elapsed,z.elapsed),bounds=[t.windup,t.windup+(t.active??.12),t.windup+(t.active??.12)+t.recovery],elapsed=bounds.find(v=>Math.abs(v-raw)<1e-10)??raw,phase=elapsed<bounds[0]?'windup':elapsed<bounds[1]?'active':elapsed<bounds[2]?'recovery':'done';if(phase==='done')return null;p.action={...a,elapsed,phase,phaseProgress:phase==='windup'?elapsed/t.windup:phase==='active'?(elapsed-t.windup)/(t.active??.12):(elapsed-bounds[1])/t.recovery};p.pose=phase==='windup'?'ready':phase==='active'?a.technique:'idle';}else{p.action=null;p.pose='idle';}
 return p;
}
// R15: reconstruct only a completed interval between two actual attacker-turn
// receiver observations. This is the existing alternating-turn clock contract,
// not a future completed-frame receiver and not an unobserved AI decision.
// R21 observation is saveable battle data, not an invisible WeakMap. At most
// one previous observation per attacking role. Exact prior state only; no AI
// prediction, no actor rewind. Old saves without it keep endpoint fallback.
function readBackfistObserved(b,index,act){const h=b.backfistObservedHistory;if(h?.version!==1||!Array.isArray(h.entries)||h.entries.length!==2)return null;const x=h.entries[index],d=x?.receiver,c=x?.clock;if(!x||x.actionStartedTick!==act.startedTick||x.technique!==act.technique||!d||!Array.isArray(d.techniques)||!c||!Array.isArray(c.fighters)||c.fighters.length!==2||!c.fighters.every(f=>Number.isFinite(f.speed))||![x.time,x.elapsed,x.attackerX,x.attackerFacing,x.attackerHP,c.time,c.tick,d.x,d.facing,d.hp,d.stamina,d.speed].every(Number.isFinite))return null;return x;}
function writeBackfistObserved(b,index,act,now){if(b.backfistObservedHistory?.version!==1||!Array.isArray(b.backfistObservedHistory.entries)||b.backfistObservedHistory.entries.length!==2)b.backfistObservedHistory={version:1,entries:[null,null]};b.backfistObservedHistory.entries[index]={...now,actionStartedTick:act.startedTick,technique:act.technique};}

// R16: the authored jab root curve is usable only while its native root path
// is demonstrably unconstrained at the observed endpoints. No linear-root guess.
function observedBackfistJab(old,now,b,index,previous,saved){
 const a=old.receiver,d=now.receiver,x=a.action,z=d.action;
 if(x?.technique!=='jab'||z?.technique!=='jab'||x.startedTick!==z.startedTick||x.hit!==z.hit||a.hp!==d.hp||old.attackerHP!==b.fighters[index].hp||a.facing!==d.facing||x.facing!==z.facing||a.speed!==d.speed||a.stamina!==d.stamina||JSON.stringify(a.techniques)!==JSON.stringify(d.techniques))return null;
 const clean=f=>!f.recoil&&!f.backstep&&!f.interruptedStrike&&!f.finishFallJoints&&f.poseTimer===0&&!f.action.traceEntryRig&&f.action.contactLimit?.bodyRoot&&!f.action.contactLimit?.supportLock&&f.action.traceRoot&&!f.action.traceRoot.supportLockWorld&&Math.abs(f.action.traceRoot.blockedForwardDebt||0)<1e-8&&Math.abs(f.action.traceRoot.blockedWorld||0)<1e-8;
 if(!clean(a)||!clean(d)||(a.traceBodyCorrection||0)!==(d.traceBodyCorrection||0)||x.traceRoot.originWorld!==z.traceRoot.originWorld)return null;
 const seconds=now.time-old.time,rate=motionRate(a),horizon=observedReceiverSeconds(old.clock,index,seconds),e0=x.elapsed,e1=z.elapsed,raw0=fourTraceRootView('jab',e0),raw1=fourTraceRootView('jab',e1),face=x.facing??a.facing;
 if(!(seconds>0&&seconds<=STEP+1e-9)||Math.abs(e0+rate*horizon-e1)>1e-9||Math.abs((a.motionTime||0)+rate*horizon-(d.motionTime||0))>1e-9||Math.abs((a.walkTime||0)+movementRate(a)*horizon-(d.walkTime||0))>1e-9)return null;
 if(Math.abs(x.traceRoot.lastSourceNative-raw0.rootDeltaNative)>1e-8||Math.abs(z.traceRoot.lastSourceNative-raw1.rootDeltaNative)>1e-8||Math.abs(a.x+face*(raw1.rootDeltaNative-raw0.rootDeltaNative)/WORLD_TO_DRAW-d.x)>1e-7)return null;
 if(Math.min(a.x,d.x)<=60+1e-7||Math.max(a.x,d.x)>=740-1e-7)return null;
 const t=INDEX.jab,total=t.windup+(t.active??.12)+t.recovery;if(e0<0||e1>=total)return null;
 const at=u=>{if(u<=1e-12)return structuredClone(a);if(u>=1-1e-12)return structuredClone(d);const h=observedReceiverSeconds(old.clock,index,seconds*u),elapsed=e0+rate*h,raw=fourTraceRootView('jab',elapsed),root=a.x+face*(raw.rootDeltaNative-raw0.rootDeltaNative)/WORLD_TO_DRAW,active=t.active??.12,phase=elapsed<t.windup?'windup':elapsed<t.windup+active?'active':'recovery';return{...a,x:root,motionTime:(a.motionTime||0)+rate*h,walkTime:(a.walkTime||0)+movementRate(a)*h,pose:phase==='windup'?'ready':phase==='active'?'punch':'idle',action:{...x,elapsed,phase,phaseProgress:phase==='windup'?elapsed/t.windup:phase==='active'?(elapsed-t.windup)/active:(elapsed-t.windup-active)/t.recovery,contactLimit:{fourTrace:true,bodyRoot:true}}};};
 const knots=[];if(e1>e0){const boundaries=[t.windup,t.windup+(t.active??.12),total];for(let i=Math.max(0,raw0.frameIndex-1);i<=raw1.frameIndex+2;i++)boundaries.push(fourTraceGameTime('jab',i));for(const e of boundaries){const u=(e-e0)/(e1-e0);if(u>0&&u<1)knots.push(previous+(saved-previous)*u);}}
 return{kind:'jab',at,knots,witness:{kind:'R16 known unconstrained jab curve between completed native observations',previousObservedWorldTime:old.time,availableByWorldTime:now.time,previousReceiverRoot:a.x,currentReceiverRoot:d.x,previousReceiverElapsed:e0,currentReceiverElapsed:e1,previousReceiverMotionTime:a.motionTime,currentReceiverMotionTime:d.motionTime,totalObservedReceiverSeconds:horizon,rootCurve:'fourTraceRootView jab rootDeltaNative, signed and divided by WORLD_TO_DRAW; no linear root interpolation',phaseAndSourceKnots:knots,assumption:'Same ongoing jab; no support lock, blocked debt, body correction, action-hit switch, interruption, HP/SP/speed/facing change or transition. Known authored curve between past observations, not recovered anatomy.',noFutureReceiverState:true}};
}

function observedBackfistWalk(b,index,act,previous,saved){
 const f=b.fighters[index],d=b.fighters[1-index],old=readBackfistObserved(b,index,act),now={time:b.time,elapsed:saved,attackerX:f.x,attackerFacing:f.facing,attackerHP:f.hp,receiver:structuredClone(d),clock:{tick:b.tick,time:b.time,fighters:b.fighters.map(x=>({speed:x.speed}))},traceBodies:hasTraceBodies(b)};
 writeBackfistObserved(b,index,act,now);
 if(!old||Math.abs(old.elapsed-previous)>1e-10||old.attackerX!==f.x||old.attackerFacing!==f.facing)return null;
 const jab=observedBackfistJab(old,now,b,index,previous,saved);if(jab)return jab;
 if(old.traceBodies||now.traceBodies)return null;
 const a=old.receiver,seconds=b.time-old.time,plain=x=>x.pose==='walk'&&!x.action&&!x.recoil&&!x.backstep&&!x.interruptedStrike&&!x.traceRestRig&&!x.finishFallJoints&&x.poseTimer===0&&!x.techniques.some(acceptedIdleMove);
 if(!(seconds>0&&seconds<=STEP+1e-9)||!plain(a)||!plain(d)||a.facing!==d.facing||a.hp!==d.hp||a.stamina!==d.stamina||a.speed!==d.speed||JSON.stringify(a.techniques)!==JSON.stringify(d.techniques))return null;
 const rate=motionRate(a),moveRate=movementRate(a),horizon=observedReceiverSeconds(old.clock,index,seconds),dx=d.x-a.x,clockDelta=(d.motionTime||0)-(a.motionTime||0),walkDelta=(d.walkTime||0)-(a.walkTime||0);
 if(Math.abs(clockDelta-rate*horizon)>1e-9||Math.abs(walkDelta-moveRate*horizon)>1e-9)return null;
 if(horizon<1e-10?Math.abs(dx)>1e-9:Math.abs(Math.abs(dx)-LOCOMOTION_RULES.forward*moveRate*horizon)>1e-7)return null;
 if(Math.min(a.x,d.x)<=60+1e-7||Math.max(a.x,d.x)>=740-1e-7)return null;
 const at=u=>{const h=observedReceiverSeconds(old.clock,index,seconds*u),q=horizon>1e-10?h/horizon:0;return{...a,x:a.x+dx*q,motionTime:(a.motionTime||0)+rate*h,walkTime:(a.walkTime||0)+moveRate*h,action:null,pose:'walk'};};
 return{at,witness:{kind:'R15 completed observed straight-walk interval',previousObservedWorldTime:old.time,availableByWorldTime:b.time,previousReceiverRoot:a.x,currentReceiverRoot:d.x,previousReceiverMotionTime:a.motionTime,currentReceiverMotionTime:d.motionTime,totalObservedReceiverSeconds:horizon,receiverMotionRate:rate,receiverWalkRate:moveRate,assumption:'Unchanged legacy receiver, no actions/recoil/body constraints; observed net root travel equals full constant walk rate. Linear straight walk between these past native observations is inferred, not recovered source motion.',noFutureReceiverState:true}};
}

function resolveBackfistIntervals(b,queue,start,startTime){
 const hits=[];
 for(const item of queue){const{index,act,previous,saved}=item,f=b.fighters[index],d=b.fighters[1-index],t=INDEX[act.technique];if(f.action!==act||act.hit||saved<=previous||f.hp!==start[index].hp)continue;
  const walk=observedBackfistWalk(b,index,act,previous,saved),receiverEnd=backfistReceiverTurnEnd(start[1-index],d,index===b.tick%2,b.time-startTime),eligible=receiverEnd&&f.x===start[index].x&&f.facing===start[index].facing&&backfistReceiverAt(start[1-index],receiverEnd,0)&&backfistReceiverAt(start[1-index],receiverEnd,1);
  if(!eligible&&!walk){act.backfistIntervalScope='unsupported receiver transition/root: endpoint only';if(backfistPhase(saved)==='active'){const contact=acceptedContact(f,d,b.time,b);if(contact.reaches)hits.push({item,sample:saved,u:1,time:b.time,receiver:d,contact,scope:'endpoint-only fallback; no interval guarantee'});}continue;}
  if(walk)act.backfistIntervalScope=walk.kind==='jab'?'R16 observed known-jab interval':'R15 completed observed straight-walk interval';
  const points=[previous,saved,...backfistResolutionKnots(previous,saved),...(walk?.knots||[])],a=walk?null:start[1-index].action,z=walk?null:receiverEnd.action;
  if(a&&z&&z.elapsed>a.elapsed){const rt=INDEX[a.technique];for(const boundary of[rt.windup,rt.windup+(rt.active??.12),rt.windup+(rt.active??.12)+rt.recovery]){const u=(boundary-a.elapsed)/(z.elapsed-a.elapsed);if(u>0&&u<1)points.push(previous+(saved-previous)*u);}}
  const knots=[...new Set(points)].sort((a,z)=>a-z),samples=[];for(let n=0;n<knots.length;n++){samples.push(knots[n]);if(n+1<knots.length){samples.push((knots[n]+knots[n+1])/2);samples.push(knots[n+1]-Math.min(1e-10,(knots[n+1]-knots[n])/4));}}
  for(const sample of [...new Set(samples)].sort((a,z)=>a-z)){if(sample<previous-1e-10||sample>saved+1e-10||backfistPhase(sample)!=='active')continue;const u=Math.max(0,Math.min(1,(sample-previous)/(saved-previous))),time=startTime+(b.time-startTime)*u,receiver=walk?walk.at(u):backfistReceiverAt(start[1-index],receiverEnd,u);if(!receiver)continue;const attacker={...f,action:{...act,elapsed:sample,phase:'active',phaseProgress:(sample-t.windup)/(t.active??.12)}},view={...b,time,fighters:b.fighters.map((v,i)=>i===index?attacker:i===1-index?receiver:v)},contact=acceptedContact(attacker,receiver,time,view);if(contact.reaches){hits.push({item,sample,u,time,receiver,contact,walkingWitness:walk?.witness,knownJab:walk?.kind==='jab',scope:walk?.kind==='jab'?'source exposure and known-jab curve/phase knots; completed observed receiver interval; finite probes':walk?'source exposure knots; completed observed straight-walk receiver interval; finite midpoint/end probes':'source exposure knots + receiver phase boundaries, with interval midpoint/end probes; constant roots'});break;}}
 }
 hits.sort((a,z)=>a.u-z.u);
 for(const h of hits){const{item,receiver,contact,sample,u,time,scope}=h,{index,act}=item,f=b.fighters[index],d=b.fighters[1-index],t=INDEX[act.technique];if(f.action!==act||act.hit||f.hp<=0||d.hp<=0||f.hp!==start[index].hp||d.hp!==start[1-index].hp)continue;const saved={elapsed:act.elapsed,phase:act.phase,phaseProgress:act.phaseProgress};act.elapsed=sample;act.phase='active';act.phaseProgress=(sample-t.windup)/(t.active??.12);act.hit=true;resolveAttack(b,f,d,t,{accepted:contact,backfistReceiverAtContact:receiver,witness:{kind:'R13c turn-local source-interval contact',scope,...(h.walkingWitness?{...(h.knownJab?{observedJab:h.walkingWitness}:{observedWalking:h.walkingWitness}),receiverMotionTime:receiver.motionTime,receiverWalkTime:receiver.walkTime}:{}),sourceIndex:contact.sourceIndex,sourceElapsed:contact.sourceElapsed,sourceInterval:[54,78],contactWorldTime:time,resolutionWorldTime:b.time,microstepStartTime:startTime,microstepEndTime:b.time,fraction:u,attackerRoot:f.x,receiverRoot:receiver.x,responseReceiverRoot:d.x,receiverAction:receiver.action?{technique:receiver.action.technique,phase:receiver.action.phase,elapsed:receiver.action.elapsed}:null,rule:'same source clock for pose/phase; no damage at d078; no joint interpolation; native response timers and remaining defender turn keep original initiative order'}});Object.assign(act,saved);}
 for(const{index,act}of queue){const f=b.fighters[index];if(f.action===act&&!act.hit&&['recovery','done'].includes(backfistPhase(act.elapsed))){act.hit=true;recordAcceptedMiss(b,f,b.fighters[1-index],INDEX[act.technique]);}}
}

function tickCore(b,delta=STEP,frame=b.tick+1,at=frame*STEP,nativeJournal=null){
 const nativeStartTime=b.time,nativeStart=b.fighters.some(f=>threeCombat(f.action?.technique)||backfist(f.action?.technique))?b.fighters.map(f=>structuredClone(f)):null,nativeQueue=[];
 b.tick=frame;b.time=at;const observationCaps=b.fighters.map(f=>Math.max(LOCOMOTION_RULES.forward*movementRate(f),f.backstep?f.backstep.distance/f.backstep.duration*1.875:0));updateSpaceObservation(b,delta,observationCaps);beginEntryObservation(b,delta,observationCaps);updateCounterStalemate(b,delta);b.events=b.events.filter(e=>b.tick-e.tick<45);
 // Alternate initiative so neither side always resolves a simultaneous hit first.
 for(let turn=0;turn<2;turn++){
 const i=(turn+b.tick)%2;enterEntryObservationTurn(b,i);
 const f=b.fighters[i],enemy=b.fighters[1-i],s=STRATEGIES[f.strategy],rate=motionRate(f),moveRate=movementRate(f),motionStep=delta*rate;f.motionTime=(f.motionTime||0)+motionStep;f.walkTime=(f.walkTime||0)+delta*moveRate;
 f.facing=f.interruptedStrike?.r16Plan?f.interruptedStrike.facing:f.backstep?f.backstep.facing:solidContactMove(f.action?.technique)?(f.action.facing??f.facing):(f.x<enemy.x?1:-1);
 f.poseTimer=Math.max(0,f.poseTimer-motionStep);f.cooldown-=motionStep;f.defenseCooldown=Math.max(0,f.defenseCooldown-motionStep);
 if(f.interruptedStrike&&!f.interruptedStrike.fourTrace&&!f.interruptedStrike.r16Plan&&b.tick-f.interruptedStrike.createdTick>=12)delete f.interruptedStrike;
 f.stamina=Math.min(f.maxStamina,f.stamina+delta*(isReactive(INDEX[f.action?.technique])?STAMINA_RULES.defenseRecovery:(f.action||f.backstep)?STAMINA_RULES.attackRecovery:STAMINA_RULES.restRecovery));
 refreshJumpPush(f,b);
 if(f.recoil){const r=f.recoil;r.elapsed=Math.min(r.seconds,r.elapsed+delta);f.x=r.startX+(r.targetX-r.startX)*recoilEase(r.elapsed/r.seconds);f.pose='hit';f.poseTimer=Math.max(f.poseTimer,.05);refreshTraceInterruption(f,b);refreshJumpReaction(f,b);if(r.elapsed>=r.seconds)delete f.recoil;else{if(enemy.hp<=0||f.hp<=0){end(b);return;}continue;}}
 if(f.pushReaction){const source=b.fighters[f.pushReaction.attacker],a=source?.action;if(a?.technique==='pushkick'&&a.pushDrive&&a.elapsed<INDEX.pushkick.windup+INDEX.pushkick.active&&source.hp>0&&f.hp>0){f.pose='hit';f.poseTimer=Math.max(f.poseTimer,.05);continue;}delete f.pushReaction;}
 if(f.backstep){advanceBackstep(b,f,delta,resolveTraceBodies);if(enemy.hp<=0||f.hp<=0){end(b);return;}continue;}
 refreshTraceInterruption(f,b);
 if(f.interruptedStrike){if(enemy.hp<=0||f.hp<=0){end(b);return;}continue;}
 // Candidate-only recovery for reviewed short-range loadouts: an actively
 // attacking opponent must not prevent this fighter ever closing the gap.
 // No stamina charge, damage bonus, teleport, or source-pose change.
 if(f.strategy==='counter'&&!f.action&&f.techniques.some(threeCombat)&&b.time-(f.reviewedThreeLastStart??0)>=3){f.reviewedThreeApproach=true;f.counterApproach=true;delete f.counterRetreat;}
 if(f.strategy==='counter'&&f.counterReplyUntil<b.time){delete f.counterReplyUntil;f.counterPending=false;f.stats.replyExpired=(f.stats.replyExpired||0)+1;}
 refreshEntryObservation(b,'before-decisions',{actor:i});
 // A pending reply takes the first legal launch; chance and a new guard cannot steal it.
 if(pendingReply(b,f)&&!f.action&&f.cooldown<=0){
  const legal=f.techniques.map(id=>contextualTechnique(b,f,id)).filter(t=>isStrike(t)&&t.cost+STAMINA_RULES.attackReserve<=f.stamina&&aiDistanceWithin(targetDistance(f,enemy,t),frontPlannedRange(b,f,t))&&reviewedLaunchReady(f,enemy,t,b.time,b)&&(!solidContactMove(t.id)||(f.pose==='idle'&&f.poseTimer===0)));
  const reply=legal.find(t=>t.id===f.plan)||legal[0];if(reply&&entryLaunchSafe(b,f,reply))startAction(b,f,reply);
 }
 tryDefense(b,f,enemy);
 if(f.action){
  if(isFourTrace(f.action.technique)&&f.action.technique==='frontkick'){const q=frontkickSpaceForecast(b,i,rate,delta);if(q){const s=beginSpaceReturn(b,i,q,rate,delta);if(!s.action.hit){if(b.entryPolicy?.enabled)rememberEntryFailure(b,f,s.action.technique,'space');refreshSpaceReturn(f,b);}emitCombat(b,{type:'interrupted',reason:'space',spaceKind:'frontkick-proximal-sweep',fighter:i,attacker:i,technique:'frontkick',tick:b.tick,actionElapsed:s.action.elapsed,settled:s.action.hit,duration:s.duration,forecast:q});continue;}}
  if(f.action.technique==='sidekick'){const q=sidekickSpaceForecast(b,i,rate,delta);if(q){const s=beginSpaceReturn(b,i,q,rate,delta);if(!s.action.hit)rememberEntryFailure(b,f,'sidekick','space');emitCombat(b,{type:'interrupted',reason:'space',fighter:i,attacker:i,technique:'sidekick',tick:b.tick,actionElapsed:s.action.elapsed,settled:s.action.hit,duration:s.duration,forecast:q});continue;}}
  if(f.action.technique==='lowkick'){const q=spaceForecast(b,i,rate);if(q){const s=beginSpaceReturn(b,i,q,rate);if(b.entryPolicy?.enabled&&!s.action.hit)rememberEntryFailure(b,f,s.action.technique,'space');emitCombat(b,{type:'interrupted',reason:'space',fighter:i,attacker:i,technique:'lowkick',tick:b.tick,actionElapsed:s.action.elapsed,settled:s.action.hit,duration:s.duration,forecast:q});continue;}}
 const act=f.action,previous=act.elapsed;let t=INDEX[act.technique],active=t.active??.12;act.elapsed+=motionStep;const bfPhase=backfist(t.id)?backfistPhase(act.elapsed):null;const rootDeferred=isFourTrace(t.id)&&!act.hit&&((t.id==='lowkick'&&previous<t.windup+active*.5&&act.elapsed>=t.windup+active*.5)||(previous<t.windup&&act.elapsed>=t.windup+active));if(isFourTrace(t.id)&&!rootDeferred)advanceTraceRoot(b,i,previous);
  if(t.id===SWEEP_INTERNAL_ID&&!act.hit){resolveSweepWindow(b,f,enemy,act,previous);t=INDEX[act.technique];active=t.active??.12;}
  // The approved R8 shin is fully extended at display023, then retracts024.
  // Sample that exact active midpoint before the receiver reaction changes.
  if(t.id==='lowkick'&&!act.hit&&previous<t.windup+active*.5&&act.elapsed>=t.windup+active*.5){const saved=act.elapsed;act.elapsed=t.windup+active*.5;advanceTraceRoot(b,i,previous);act.phase='active';act.phaseProgress=.5;updateStrikeLimit(b,f,enemy,t,act);if(acceptedContact(f,enemy,b.time).reaches||fourTraceEvasion(b,f,enemy,t)){act.hit=true;resolveAttack(b,f,enemy,t);}else{act.hit=true;recordAcceptedMiss(b,f,enemy,t);}act.elapsed=saved;advanceTraceRoot(b,i,t.windup+active*.5);}
  if(t.id==='flyingknee'){if(!Number.isFinite(act.jumpTarget)){act.jumpTarget=Math.max(0,Math.min(20,Math.abs(enemy.x-f.x)-55));act.jumpApplied=0;}const q=Math.max(0,Math.min(1,(act.elapsed-.12)/.28)),desired=act.jumpTarget*q*q*(3-2*q),amount=Math.max(0,Math.min(desired-(act.jumpApplied??0),Math.abs(enemy.x-f.x)-55)),oldX=f.x;f.x=Math.max(60,Math.min(740,f.x+(act.facing??f.facing)*amount));act.jumpApplied=(act.jumpApplied??0)+Math.abs(f.x-oldX);}
  if(t.id==='dutchlow'){const q=Math.min(1,act.elapsed/DUTCH_STEP.until),desired=(act.stepTarget??0)*q*q*(3-2*q),amount=Math.max(0,Math.min(desired-(act.stepApplied??0),Math.abs(enemy.x-f.x)-DUTCH_STEP.minimumGap));f.x=Math.max(60,Math.min(740,f.x+(act.facing??f.facing)*amount));act.stepApplied=(act.stepApplied??0)+amount;}
  if(t.id==='pushkick')advanceSolePush(b,f,enemy,act,delta);
  // Queue only original native times; no receiver is frozen before its turn.
  if(threeCombat(t.id)&&!act.hit&&nativeStart&&act.elapsed<t.windup+active+t.recovery){const lo=Math.max(previous,t.windup),hi=Math.min(act.elapsed,t.windup+active);if(hi>lo){const times=[lo,...threeResolutionSamples(t.id,lo,hi).filter(q=>q>lo&&q<hi),hi];nativeQueue.push({index:i,act,previous,saved:act.elapsed,times});}}
  // Swept evaluation for an active window shorter than the CPU microstep.
  // This bounds work without clamping the ability or its linear rate.
  if(isStrike(t)&&!backfist(t.id)&&!act.hit&&previous<t.windup&&act.elapsed>=t.windup+active){const elapsed=act.elapsed;for(const q of ACTIVE_SWEEP_FRACTIONS){act.elapsed=t.windup+active*q;if(isFourTrace(t.id))advanceTraceRoot(b,i,previous);act.phase='active';act.phaseProgress=q;updateStrikeLimit(b,f,enemy,t,act);if(strikeResolutionReady(b,f,enemy,t)){act.hit=true;resolveAttack(b,f,enemy,t);break;}}if(!act.hit&&!nativeQueue.some(q=>q.act===act)){act.hit=true;if(act.r3ReceiverPending)recordR3PunchMiss(b,f,enemy,t);else if(t.id==='frontkickLegacy')recordFrontkickMiss(b,f,enemy,t);else if(acceptedMove(t.id))recordAcceptedMiss(b,f,enemy,t);}act.elapsed=elapsed;if(isFourTrace(t.id))advanceTraceRoot(b,i,previous);}
  updateStrikeLimit(b,f,enemy,t,act);

  if(act.elapsed<t.windup){act.phase='windup';act.phaseProgress=Math.min(1,act.elapsed/t.windup);displayPhase(f,'windup',b.tick);if(f.poseTimer===0)f.pose='ready';}
  else if(act.elapsed<t.windup+active){act.phase='active';act.phaseProgress=Math.min(1,(act.elapsed-t.windup)/active);displayPhase(f,'active',b.tick);if(f.poseTimer===0)f.pose=isReactive(t)?t.id:t.type;if(isStrike(t)&&!act.hit&&(t.id!=='lowkick'||act.elapsed>=t.windup+active*.5)&&(strikeResolutionReady(b,f,enemy,t))){act.hit=true;resolveAttack(b,f,enemy,t);}}
  else if(act.elapsed<t.windup+active+t.recovery){if(act.r3ReceiverPending&&!act.hit){act.hit=true;recordR3PunchMiss(b,f,enemy,t)}if(t.id==='frontkickLegacy'&&!act.hit){act.hit=true;recordFrontkickMiss(b,f,enemy,t)}if(acceptedMove(t.id)&&!act.hit&&!nativeQueue.some(q=>q.act===act)){act.hit=true;recordAcceptedMiss(b,f,enemy,t)}act.phase='recovery';act.phaseProgress=Math.min(1,(act.elapsed-t.windup-active)/t.recovery);displayPhase(f,'recovery',b.tick);if(f.poseTimer===0)f.pose='idle';}
  else {if(backfist(t.id))f.backfistPrototypeRest=backfistRest(144);if(isFourTrace(t.id)){f.traceRestRig=fourTracePose(t.id,act.elapsed,act.contactLimit).rig;f.traceRestId=t.id;}if(isFourTrace(t.id))f.traceLastRoot={technique:t.id,at:b.time,rootX:f.x,sourceNative:act.traceRoot?.lastSourceNative??0};if(f.combatTheme==='punch-low'){f.comboNext=act.technique==='jab'&&f.techniques.includes('cross')?'cross':['jab','cross'].includes(act.technique)&&f.techniques.includes('dutchlow')?'dutchlow':null;}if(f.axePrototype&&t.id==='axekick')capture(f,axePrototypePose(f,b.time),'exit');f.action=null;f.cooldown=.08+(1-s.aggression)*.3;}
 }else {
  if(f.backfistPrototypeRest&&f.poseTimer===0){delete f.backfistPrototypeRest;delete f.backfistReceiverSnapshot;}
  if((b.backfistPrototype||b.sweepEnabled)&&f.prototypeHold){if(f.poseTimer===0)f.pose='idle';continue;} // Fixture-only, no AI expansion.
  let dist=Math.abs(f.x-enemy.x);const turnStartX=f.x;let requestedForward=0;
  if(f.disengage&&f.backstepTrial?.enabled&&f.traceLastRoot?.technique==='frontkick'&&f.techniques.filter(id=>isStrike(INDEX[id])).length===1&&f.techniques.includes('frontkick')){const entry=f.traceRestRig||fourTraceRigTransition('frontkick',fourTraceStanding('frontkick').rig,fourTraceRoleJoints('frontkick',acceptedNeutral(f,b.time)),1);if(tryEntryBackstep(b,f,entry,{moveRate,requiredStamina:INDEX.frontkick.cost+STAMINA_RULES.attackReserve})){delete f.disengage;continue;}}
  if(f.disengage){const q=f.disengage,old=f.x;q.elapsed+=delta;f.x=Math.max(60,Math.min(740,f.x-f.facing*LOCOMOTION_RULES.backward*moveRate*delta));f.pose=f.x===old?'idle':'walk';f.stats.retreatDistance+=Math.abs(f.x-old);if(q.elapsed===delta)f.stats.disengagements++;if(Math.abs(f.x-enemy.x)>=q.goal||q.elapsed>=1.4||f.x===old)delete f.disengage;if(enemy.hp<=0||f.hp<=0){end(b);return;}continue;}
  const usable=f.techniques.map(id=>contextualTechnique(b,f,id)).filter(isStrike);
  const affordable=usable.filter(t=>t.cost<=f.stamina-STAMINA_RULES.attackReserve&&(t.id==='horizontalelbow'||f.strategy!=='counter'||f.counterApproach||aiDistanceWithin(targetDistance(f,enemy,t),frontPlannedRange(b,f,t))&&reviewedLaunchReady(f,enemy,t,b.time,b))&&entryCandidateAllowed(b,f,enemy,t));
  // Pressure fights from the present range instead of walking backward to a
  // preselected long kick. Reserve, actual target distance and launch rules stay
  // unchanged; the opening opponent still uses its explicit close approach.
  const pressureRange=f.strategy==='pressure'?affordable.filter(t=>aiDistanceWithin(targetDistance(f,enemy,t),frontPlannedRange(b,f,t))&&reviewedLaunchReady(f,enemy,t,b.time,b)):[];
  if(pressureRange.length&&!pressureRange.some(t=>t.id===f.plan))f.plan=null;
  const choices=pressureRange.length?pressureRange:affordable;
  if(f.comboNext&&affordable.some(t=>t.id===f.comboNext))f.plan=f.comboNext;
  // Commit to an approach for a move. Choosing only from the current range
  // made short punches and knees disappear after learning a long kick.
  if(!f.plan||!affordable.some(t=>t.id===f.plan)){
   const weights=choices.map(t=>Math.sqrt(t.power)*curriculumWeight(f,t)*(t.id==='jab'?.8:1)*(aiDistanceWithin(dist,t.range+5)?1.15:1));
   let pick=random(b)*weights.reduce((a,v)=>a+v,0);
   f.plan=choices.find((t,n)=>(pick-=weights[n])<=0)?.id??null;
  }
  if(pendingReply(b,f)){
   const legal=affordable.filter(t=>aiDistanceWithin(targetDistance(f,enemy,t),frontPlannedRange(b,f,t))&&reviewedLaunchReady(f,enemy,t,b.time,b)&&(!solidContactMove(t.id)||(f.pose==='idle'&&f.poseTimer===0)));
   if(legal.length&&!legal.some(t=>t.id===f.plan))f.plan=legal[0].id;
  }
  const planned=INDEX[f.plan],pressureReady=pressureRange.some(t=>t.id===planned?.id);
  if(b.entryPolicy?.enabled&&!planned&&!affordable.length&&f.backstepTrial?.enabled&&f.entrySpaceHistory?.frontkick&&usable.some(t=>t.id==='frontkick')){const entry=entryStance(f,b);if(tryEntryBackstep(b,f,entry,{moveRate,requiredStamina:INDEX.frontkick.cost+STAMINA_RULES.attackReserve}))continue;}
  // Physical entry proof holds a viable current stance; no gap-only paid retreat.
  // R34 local turn capture: no persisted helper state and no delayed idle replacement.
  const jumpWalkChoice=planned?.id==='forwardjumpkick'&&f.pose==='walk'?jumpHybridPlan(b,i):null,jumpEntryCapture=jumpWalkChoice?.allowed?{x:f.x,time:b.time,walkTime:f.walkTime,facing:f.facing,rig:structuredClone(jumpWalkChoice.entryContext.entrySnapshot)}:null;
  const axePlan=planned?.id==='axekick'&&f.axePrototype?axeLaunchPlan(b,f):null;
  // Arrival steering uses the anatomical contact distance, not the future
  // receiver displacement needed for a launch. Preserve that measured target
  // through a temporarily unsupported live receiver pose, including reload.
  if(axePlan?.supported)f.axeApproach={distance:axePlan.approachDesired,facing:f.facing};
  else if(planned?.id!=='axekick'||f.axeApproach?.facing!==f.facing)delete f.axeApproach;
  const axeWalkDesired=f.axeApproach?.distance,holdForClosingCross=axePlan?.observedClosingWalk&&!axePlan.ready&&dist<=axeWalkDesired+7;
  let desired=Number.isFinite(axeWalkDesired)?(holdForClosingCross?dist:axeWalkDesired):planned?.id==='forwardjumpkick'?(jumpHybridPlan(b,i).allowed?dist:FORWARD_JUMP_APPROACH):planned?.id==='horizontalelbow'?elbowApproachPlan(f,enemy,b.time).desired:frontInterceptState(b,f,planned)?.ready?dist:f.openingSpacing?.approach??curriculumDistance(f,pressureReady?dist:solidContactMove(planned?.id)?planned.range-(planned.id==='frontkick'?20:12):planned?Math.max(40,Math.min(s.distance,planned.range-f.approachMargin)):s.distance+25);
  // Behavior correction only: keep a currently legal selected traced strike
  // from being disabled forever by voluntary retreat toward its ideal spacing.
  // Reuse the existing affordable/current-range eligibility. Existing geometry
  // preflight, cooldown, chance, costs and actual contact checks below still apply.
  if(b.entryPolicy?.enabled&&!f.openingSpacing&&isFourTrace(planned?.id)&&f.cooldown<=0&&f.poseTimer===0&&!aiDistanceWithin(desired,dist)&&affordable.some(t=>t.id===planned.id)&&aiDistanceWithin(targetDistance(f,enemy,planned),frontPlannedRange(b,f,planned,jumpEntryCapture))&&reviewedLaunchReady(f,enemy,planned,b.time,b))desired=dist;
  // Counter retreat is one short response to an observed strike, never
  // continuous steering toward the preferred distance of a planned long kick.
  // Guard/reply/action/recoil paths above still take precedence.
  let counterBack=false;
  if(f.strategy==='counter'){
   const threat=enemy.action,tt=INDEX[threat?.technique];
   if(pendingReply(b,f)||f.poseTimer>0)delete f.counterRetreat;
   if(!f.reviewedThreeApproach&&!f.counterRetreat&&!pendingReply(b,f)&&f.poseTimer===0&&f.cooldown<=0&&isStrike(tt)&&['windup','active'].includes(threat.phase)&&!aiDistanceWithin(Math.min(s.distance,tt.range+18),dist)&&f.lastCounterRetreatTick!==threat.startedTick&&b.time>=(f.counterRetreatReadyAt??0)){
    f.lastCounterRetreatTick=threat.startedTick;f.counterRetreat={until:b.time+COUNTER_RULES.retreatSeconds,startX:f.x,goal:Math.min(s.distance,dist+COUNTER_RULES.retreatDistance)};f.counterRetreatReadyAt=b.time+COUNTER_RULES.retreatCooldown;f.stats.counterRetreats=(f.stats.counterRetreats||0)+1;
   }
   const r=f.counterRetreat;
   if(r){if(b.time>=r.until||Math.abs(f.x-r.startX)>=COUNTER_RULES.retreatDistance-1e-7||aiDistanceWithin(r.goal,dist)||pendingReply(b,f))delete f.counterRetreat;else counterBack=true;}
  }
  if(counterBack){const r=f.counterRetreat,old=f.x,amount=Math.max(0,Math.min(LOCOMOTION_RULES.backward*moveRate*delta,r.goal-dist,COUNTER_RULES.retreatDistance-Math.abs(f.x-r.startX)));f.x=Math.max(60,Math.min(740,f.x-f.facing*amount));if(nativeJournal)nativeJournal.walk[i]={before:old,after:f.x,delta,requested:amount,limited:amount!==LOCOMOTION_RULES.backward*moveRate*delta||f.x!==old-f.facing*amount};if(f.poseTimer===0)f.pose=f.x===old?'idle':'walk';f.stats.retreatDistance+=Math.abs(f.x-old);if(f.x===old)delete f.counterRetreat;}
  else if((f.strategy!=='counter'||(f.counterApproach&&planned&&!aiDistanceWithin(dist,desired)))&&!aiDistanceWithin(Math.abs(dist-desired),worldStrike(planned?.id)?2:7)){const previousX=f.x,move=!aiDistanceWithin(dist,desired)?1:-1;const step=Math.min((move>0?LOCOMOTION_RULES.forward:LOCOMOTION_RULES.backward)*moveRate*delta,Math.abs(dist-desired)),advance=move>0&&solidContactMove(enemy.action?.technique)?Math.min(step,Math.max(0,dist-84)):step;requestedForward=move>0?step:0;f.x=Math.max(60,Math.min(740,f.x+f.facing*move*advance));if(nativeJournal)nativeJournal.walk[i]={before:previousX,after:f.x,delta,requested:advance,limited:advance!==step||f.x!==previousX+f.facing*move*advance};if(f.poseTimer===0)f.pose=f.x===previousX?'idle':'walk';if(!b.entryPolicy?.enabled&&f.pose==='walk'){delete f.traceRestRig;delete f.traceRestId;}}
  else if(f.poseTimer===0)f.pose='idle';
  if(hasTraceBodies(b))resolveTraceBodies(b,i);
  if(b.entryPolicy?.enabled&&f.poseTimer===0&&(hasTraceBodies(b)||b.fighters.some(actor=>actor.techniques?.some(isFourTrace)))){const realMove=Math.abs(f.x-turnStartX)>1e-7,finalPose=realMove?'walk':'idle';if(f.pose!==finalPose){f.pose=finalPose;if(hasTraceBodies(b))resolveTraceBodies(b,i);}f.pose=Math.abs(f.x-turnStartX)>1e-7?'walk':'idle';if(f.pose==='walk'){if(f.traceRestId==='sidekick'&&f.traceRestRig){const toe=fourTraceJoints(f.traceRestRig).support_toe[0]-(f.x-turnStartX)*WORLD_TO_DRAW*f.facing,sine=Math.max(-1,Math.min(1,(-11.1-toe)/7));f.walkTime=Math.asin(sine)/8;}delete f.traceRestRig;delete f.traceRestId;}dist=Math.abs(f.x-enemy.x);}
  refreshEntryObservation(b,'pre-entry',{actor:i,turnStartX,requestedForward,actualTurnMove:f.x-turnStartX,finalDistance:dist});
  const constrainedForward=requestedForward>1e-9&&(f.x-turnStartX)*f.facing<requestedForward-1e-7;
  const ordinaryLaunch=!!planned&&f.cooldown<=0&&aiDistanceWithin(targetDistance(f,enemy,planned),frontPlannedRange(b,f,planned,jumpEntryCapture))&&(!solidContactMove(planned.id)||(f.pose==='idle'&&f.poseTimer===0));
  let openingAllowed=aiDistanceWithin(dist,f.openingSpacing?.attack??Infinity),entryAllowed=true;
  if(b.entryPolicy?.enabled&&ordinaryLaunch){if(!openingAllowed&&constrainedForward&&aiDistanceWithin(targetDistance(f,enemy,planned),planned.range-f.attackMargin)){const proof=evaluateEntry(b,i,planned,ENTRY_CONTEXT);openingAllowed=!!proof.feasible&&!proof.pending;}if(hasEntrySpaceCheck(planned)||f.entrySpaceHistory?.[planned.id]){const proof=evaluateEntry(b,i,planned,ENTRY_CONTEXT);entryAllowed=proof.pending||proof.spaceSafe;if(!proof.pending&&!proof.spaceSafe){rememberEntryFailure(b,f,planned.id,'preflight-space');f.plan=null;}}}
  const chance=s.aggression*(f.strategy==='counter'&&(f.counterPending||enemy.action?.phase==='recovery')?2.4:1);
  if(f.cooldown<=0&&planned&&openingAllowed&&entryAllowed&&aiDistanceWithin(targetDistance(f,enemy,planned),frontPlannedRange(b,f,planned,jumpEntryCapture))&&reviewedLaunchReady(f,enemy,planned,b.time,b)&&(!solidContactMove(planned.id)||(f.pose==='idle'&&f.poseTimer===0))&&(pendingReply(b,f)||f.counterApproach||random(b)<(f.decisionProbability??chance*motionStep*5))){
   if(entryChargeSafe(b,f,planned))startAction(b,f,planned,jumpEntryCapture);
  }
 }
 if(enemy.hp<=0||f.hp<=0){end(b);return;}
 }
 if(hasTraceBodies(b))resolveTraceBodies(b,(b.tick+1)%2);
 if(nativeStart&&nativeQueue.length){const extra=resolveReviewedNativeQueue(b,nativeQueue,nativeStart,nativeStartTime,nativeJournal);if(extra&&hasTraceBodies(b))resolveTraceBodies(b,(b.tick+1)%2);if(b.fighters.some(f=>f.hp<=0)){end(b);return;}}
 // Re-evaluate the foot boundary after both fighters' movement/pose updates, regardless of initiative order.
 for(let i=0;i<2;i++){const f=b.fighters[i],a=f.action;if(isFourTrace(a?.technique))updateStrikeLimit(b,f,b.fighters[1-i],INDEX[a.technique],a);else if(a?.technique==='frontkickLegacy')updateFrontkickLimit(f,b.fighters[1-i],b.time);else if(worldStrike(a?.technique))updateStrikeLimit(b,f,b.fighters[1-i],INDEX[a.technique],a);}
 finishEntryObservation(b);
 if(b.time>=b.duration)end(b);
}
export function stepBattle(b,dt=STEP){
 if(b.done)return b;
 b.accumulator+=Math.max(0,Math.min(10,Number(dt)||0));
 while(b.accumulator+1e-9>=STEP&&!b.done){b.accumulator-=STEP;const frame=b.tick+1,rate=Math.max(...b.fighters.map(motionRate)),parts=motionMicrostepParts(rate);for(let n=0;n<parts&&!b.done;n++)tick(b,STEP/parts,frame,(frame-1+(n+1)/parts)*STEP);for(const f of b.fighters)if(f.axePrototype){if(ownsAxe(f))f.axeLast=axePrototypePose(f,b.time);else if(f.axeDisplay)releaseAxe(f,'transition-complete',b.time);}}
 return b;
}
export function finishBattle(b){let guard=0;while(!b.done&&guard++<4000)stepBattle(b,STEP);return b;}

export function staminaStatus(f){const moves=(f.techniques||[]).map(id=>INDEX[id]).filter(isStrike),required=moves.length?Math.min(...moves.map(t=>t.cost+STAMINA_RULES.attackReserve)):null;return{current:f.stamina,max:f.maxStamina??50,required,resting:!f.action&&required!==null&&f.stamina<required};}


function frontInterceptState(b,f,t){if(t?.id!=='frontkick'||!isFourTrace(t.id)||f.openingSpacing)return null;const enemy=b.fighters[1-b.fighters.indexOf(f)],face=f.x<enemy.x?1:-1,closing=Math.max(0,-face*(b.spaceVelocity?.[1-b.fighters.indexOf(f)]||0)),seconds=(Math.max(0,f.cooldown)+t.windup+.01)/motionRate(f),gap=Math.abs(f.x-enemy.x),futureGap=gap-closing*seconds;const proof=evaluateEntry(b,b.fighters.indexOf(f),t,ENTRY_CONTEXT,{force:true});return{ready:!!proof.feasible&&!proof.pending,closing,seconds,gap,futureGap,observedOnly:true,proofReason:proof.reason};}
function frontPlannedRange(b,f,t,entryCapture=null){const normal=t.range-f.attackMargin;if(t.id==='axekick'&&f.axePrototype){const q=axeLaunchPlan(b,f);return q.supported?q.max:normal;}if(t.id==='forwardjumpkick'){const q=jumpHybridPlan(b,b.fighters.indexOf(f),entryCapture);if(q.allowed)return Math.max(normal,q.gap);}const q=frontInterceptState(b,f,t);return q?.ready?Math.max(normal,q.gap):normal;}

// Prediction only: advance clocks of the already observed ongoing walk.
// No future choice, action, root motion, RNG, cost or damage is simulated.
export function predictObservedWalk(source,target,seconds){
 if(source.pose!=='walk'||source.action||source.backstep||source.interruptedStrike||source.recoil)return false;
 target.motionTime=(source.motionTime||0)+motionRate(source)*seconds;
 target.walkTime=(source.walkTime||0)+movementRate(source)*seconds;
 target.pose='walk';delete target._entryFrozenJoints;delete target.traceRestRig;delete target.traceRestId;return true;
}
// A sampled source-image time is not itself a damage-resolution time.
export function motionResolutionSweepSamples(anchor,step,windup=.24,active=.12){
 if(!(Number.isFinite(step)&&step>0))return[];
 const n=Math.max(1,Math.ceil((windup-anchor)/step-1e-10)),previous=anchor+(n-1)*step,next=anchor+n*step;
 return previous<windup-1e-10&&next>=windup+active-1e-10?ACTIVE_SWEEP_FRACTIONS.map(q=>windup+active*q):[];
}
export function motionResolutionStep(time,anchor,step,windup=.24,active=.12){
 const n=(time-anchor)/step;
 if(Number.isFinite(n)&&n>=1-1e-7&&Math.abs(n-Math.round(n))<1e-7)return Math.round(n);
 return motionResolutionSweepSamples(anchor,step,windup,active).some(t=>Math.abs(t-time)<1e-9)?Math.max(1,Math.ceil((windup-anchor)/step-1e-10)):null;
}
export function isMotionResolutionSample(time,anchor,step,windup=.24,active=.12){return motionResolutionStep(time,anchor,step,windup,active)!==null;}
// Existing whole-window sweep evaluates its four poses at one actual CPU update.
// Only those off-grid sweep contacts use that update's receiver horizon.
export function motionResolutionWorldSeconds(time,anchor,step,rate){
 const raw=(time-anchor)/rate,n=(time-anchor)/step,k=motionResolutionStep(time,anchor,step);
 return k!==null&&Math.abs(n-Math.round(n))>=1e-7?k*step/rate:raw;
}
// Prediction-only receiver horizon at the attacker's actual alternating turn.
// Current measured motion is retained; future decisions/reactions are not invented.
// Fractional source-image times interpolate the adjacent real turn samples.
export function observedReceiverSeconds(b,index,seconds,parts=motionMicrostepParts(...b.fighters.map(motionRate))){
 const dt=STEP/parts,k=Math.max(0,seconds/dt),lo=Math.floor(k+1e-8),q=k-lo;
 const frame=b.tick,part=Math.round((b.time-(frame-1)*STEP)/dt)-1,pending=Number(index===frame%2);
 const at=n=>Math.max(0,(n+pending-Number(index===(frame+Math.floor((part+n)/parts))%2))*dt);
 return at(lo)+(at(lo+1)-at(lo))*q;
}
const ENTRY_CONTEXT={sweepSamples:motionResolutionSweepSamples,resolutionSeconds:motionResolutionWorldSeconds,receiverSeconds:observedReceiverSeconds,resolution:isMotionResolutionSample,observedWalk:predictObservedWalk,parts:motionMicrostepParts,rate:motionRate,moveRate:movementRate,joints:contactBodyJoints,complete:acceptedNeutral,legacy:visibleLegacyPose,accepted:acceptedMove,update:updateStrikeLimit,contact:acceptedContact};
function entryStance(f,b){return f.traceRestRig||fourTraceRigTransition('frontkick',fourTraceStanding('frontkick').rig,fourTraceRoleJoints('frontkick',acceptedNeutral(f,b.time)),1);}
function entryCandidateAllowed(b,f,enemy,t){if(!b.entryPolicy?.enabled||!f.entrySpaceHistory?.[t.id]||!aiDistanceWithin(targetDistance(f,enemy,t),frontPlannedRange(b,f,t)))return true;const proof=evaluateEntry(b,b.fighters.indexOf(f),t,ENTRY_CONTEXT);return proof.pending||proof.spaceSafe;}
function tryEntryBackstep(b,f,entry,options){if(f.cooldown>0&&!f.disengage)return false;if(!b.entryPolicy?.enabled)return startBackstep(b,f,entry,options);const selected=selectEntryBackstep(b,b.fighters.indexOf(f),INDEX.frontkick,entry,ENTRY_CONTEXT,{...BACKSTEP_TRIAL_RULES,...f.backstepTrial});if(!selected)return false;const previous=f.backstepTrial;f.backstepTrial={...previous,distance:selected.distance};try{return startBackstep(b,f,entry,options);}finally{f.backstepTrial=previous;}}
export function inspectEntry(b,index,id,options={}){return evaluateEntry(b,index,INDEX[id],ENTRY_CONTEXT,options);}

// Counter replies use the same pre-charge geometry check, rather than bypassing it.
function entryLaunchSafe(b,f,t){if(t?.id==='frontkick'&&contextualTechnique(b,f,'frontkick').id==='frontkickLegacy')return true;if(!b.entryPolicy?.enabled||(!hasEntrySpaceCheck(t)&&!f.entrySpaceHistory?.[t.id]))return true;const q=evaluateEntry(b,b.fighters.indexOf(f),t,ENTRY_CONTEXT);if(!q.pending&&!q.spaceSafe)rememberEntryFailure(b,f,t.id,'preflight-space');return !q.pending&&q.spaceSafe;}

// Six-motion release candidate: automatic backstep trial is disabled by default.
// Independent isolated trials may explicitly opt in; public legacy movement is unchanged.
export function createBattle(options={}){const b=createTrialBattleCore(options);b.sweepEnabled=options.sweepEnabled!==false;b.sweepRuntimeRevision='sweep-fixed3d-r49-v1';for(const f of b.fighters)f.sweepEnabled=b.sweepEnabled;b.entryPolicy={enabled:true,currentObservation:true};b.fighters[0].backstepTrial={enabled:false};for(const f of b.fighters)if(f.techniques.includes('axekick'))f.axePrototype=true;return b;}

// Independent behavior-fix trial: a throttled/planning result is not a charge
// authorization. Keep the original per-eligible-tick probability, then obtain
// current geometry before spending SP. No bypass of actual contact/collision.
function entryChargeSafe(b,f,t){if(t?.id==='frontkick'&&contextualTechnique(b,f,'frontkick').id==='frontkickLegacy')return true;if(!b.entryPolicy?.enabled||(!hasEntrySpaceCheck(t)&&!f.entrySpaceHistory?.[t.id]))return true;const q=evaluateEntry(b,b.fighters.indexOf(f),t,ENTRY_CONTEXT,{force:true});if(!q.spaceSafe){rememberEntryFailure(b,f,t.id,'precharge-current-space');f.plan=null;}return !q.pending&&q.spaceSafe;}

// Explicit game-authored motion selection, never a mid-action switch. The proof
// observes current body shape, ongoing walk clocks and linear velocity only;
// it does not predict future AI decisions. Unsafe new trajectory uses the public
// legacy geometry and original cost/power. Safe-but-unreachable retains approach.
function contextualTechnique(b,f,id){
 if(f.sweepEnabled&&id==='crouchlowkick')return INDEX[SWEEP_INTERNAL_ID];
 if(id!=='frontkick')return INDEX[id];
 const q=evaluateEntry(b,b.fighters.indexOf(f),INDEX.frontkick,ENTRY_CONTEXT,{force:true,actor:{traceRestRig:frontkickEntryRig({...f,action:null},b.time)}});
 f.frontkickVariantProof={at:b.time,tick:b.tick,spaceSafe:q.spaceSafe,reachable:q.reachable,reason:q.reason,assumption:q.assumption};
 return !q.pending&&!q.spaceSafe?FRONTKICK_LEGACY:INDEX.frontkick;
}

// Shared actual receiver joints, used by the axe contour predicate.
export{contactBodyJoints};
// Explicit fixture-only route through the actual native startAction logic.
export function startPrototypeAction(b,index,id){if(!b.backfistPrototype)throw Error('R6 fixture flag required');const f=b.fighters[index];if(f.action)throw Error('Action already active');if(!f.techniques.includes(id))throw Error('Fixture must explicitly equip the existing technique');return startAction(b,f,INDEX[id]);}

function recordSweepMiss(b,att,def,tech,contact){att.stats.missed++;emitCombat(b,{type:'miss',reason:contact?.supported===false?'unsupported-geometry':'sweep-geometry',fighter:b.fighters.indexOf(att),attacker:b.fighters.indexOf(att),receiver:b.fighters.indexOf(def),technique:tech.id,target:tech.target,tick:b.tick,actionElapsed:att.action?.elapsed,sweepContact:contact,attackerX:att.x,receiverX:def.x,distance:Math.abs(att.x-def.x),facing:att.facing});}
export function startSweepFixture(b,index,id='crouchlowkick'){if(!b.sweepEnabled)throw Error('Explicit isolated sweep opt-in required');const f=b.fighters[index];if(f.action||!f.techniques.includes(id))throw Error('Fixture must equip idle existing skill');return startAction(b,f,INDEX[id]);}
